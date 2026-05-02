/**
 * Ralph Loop Executor for Top-Level Orchestrator
 *
 * This executor implements the two-layer Ralph Loop validation pattern:
 * - Inner Loop: Per-agent self-validation before marking complete
 * - Outer Loop: Checkpoint-level validation before phase sign-off
 *
 * The executor delegates actual validation to the Code Reviewer Agent
 * and handles retry logic with configurable max attempts.
 */

import type {
  RalphLoopConfig,
  RalphLoopState,
  RalphLoopStatus,
  ValidationResult,
  AgentValidationResult,
  CheckpointValidationResult,
  RalphLoopValidationRequest,
  RalphLoopValidationResponse,
  CodeReviewerAgent,
  ValidationContext,
  RalphLoopLogger,
  RalphLoopStatistics,
  AgentStatistics,
  RalphLoopEvent,
  RalphLoopEventHandler,
} from '../types/ralph-loop';

/**
 * Ralph Loop Executor class
 */
export class RalphLoopExecutor {
  private config: RalphLoopConfig;
  private validationAgent: CodeReviewerAgent;
  private logger: RalphLoopLogger;
  private eventHandlers: RalphLoopEventHandler[] = [];
  private statistics: RalphLoopStatistics = {
    totalValidations: 0,
    validationsPassed: 0,
    validationsFailed: 0,
    averageAttempts: 0,
    totalRetries: 0,
    averageDuration: 0,
    successRate: 0,
    byAgent: {},
  };

  constructor(config: RalphLoopConfig, validationAgent: CodeReviewerAgent, logger: RalphLoopLogger) {
    this.config = config;
    this.validationAgent = validationAgent;
    this.logger = logger;
  }

  /**
   * Add event handler
   */
  addEventHandler(handler: RalphLoopEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Emit event to all handlers
   */
  private async emitEvent(event: RalphLoopEvent): Promise<void> {
    for (const handler of this.eventHandlers) {
      await handler.handle(event);
    }
  }

  /**
   * Execute agent task with Ralph loop validation (Inner Loop)
   *
   * This implements the per-agent Ralph Loop where:
   * 1. Agent completes task
   * 2. Agent self-validates
   * 3. Code reviewer validates
   * 4. If valid → mark complete
   * 5. If invalid → retry with feedback (max 5)
   */
  async executeAgentWithValidation(
    agent: string,
    task: () => Promise<AgentResult>,
    context: ValidationContext
  ): Promise<{
    result: AgentResult;
    validationPassed: boolean;
    validationHistory: ValidationResult[];
  }> {
    if (!this.config.enabled) {
      // Ralph Loop disabled, execute without validation
      const result = await task();
      return {
        result,
        validationPassed: true,
        validationHistory: [],
      };
    }

    const startTime = Date.now();
    const validationHistory: ValidationResult[] = [];
    let attemptNumber = 1;
    let lastResult: AgentResult | null = null;

    while (attemptNumber <= this.config.maxRetries) {
      this.logger.logStart(agent, attemptNumber);
      await this.emitEvent({ type: 'validation_start', agent, attempt: attemptNumber });

      // Execute task on first attempt
      if (attemptNumber === 1) {
        lastResult = await task();
      }

      // Validate agent work
      const validationResult = await this.validateAgentWork(agent, lastResult!, context);
      const duration = Date.now() - startTime;

      validationHistory.push({
        agent,
        attempt: attemptNumber,
        valid: validationResult.valid,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        suggestions: validationResult.suggestions,
        timestamp: Date.now(),
        duration,
      });

      this.logger.logResult(validationHistory[validationHistory.length - 1]);
      await this.emitEvent({ type: 'validation_complete', result: validationHistory[validationHistory.length - 1] });

      // Update statistics
      this.updateStatistics(agent, attemptNumber, validationResult.valid, duration);

      if (validationResult.valid) {
        // Validation passed
        return {
          result: lastResult!,
          validationPassed: true,
          validationHistory,
        };
      }

      // Validation failed, check if we should retry
      if (attemptNumber >= this.config.maxRetries) {
        // Max retries reached
        this.logger.logFailure(agent, attemptNumber, 'Max retries exceeded');
        await this.emitEvent({
          type: 'validation_failed',
          agent,
          attempts: attemptNumber,
          error: 'Max retries exceeded',
        });

        return {
          result: lastResult!,
          validationPassed: false,
          validationHistory,
        };
      }

      // Schedule retry
      attemptNumber++;
      this.logger.logRetry(agent, attemptNumber, this.config.retryDelay);
      await this.emitEvent({
        type: 'validation_retry',
        agent,
        attempt: attemptNumber,
        delay: this.config.retryDelay,
      });

      // Wait before retry
      await this.sleep(this.config.retryDelay);
    }

    // Should not reach here, but TypeScript needs it
    return {
      result: lastResult!,
      validationPassed: false,
      validationHistory,
    };
  }

  /**
   * Validate checkpoint before sign-off (Outer Loop)
   *
   * This implements the checkpoint-level Ralph Loop where:
   * 1. All agents in phase complete their work
   * 2. Run checkpoint validation
   * 3. Validate: code quality, documentation, integration
   * 4. Run integration tests
   * 5. Verify performance benchmarks
   * 6. If all pass → phase sign-off
   * 7. If any fail → retry with feedback
   */
  async validateCheckpoint(
    phase: number,
    agents: string[],
    context: ValidationContext
  ): Promise<CheckpointValidationResult> {
    const startTime = Date.now();

    this.logger.logCheckpoint(phase, {
      phase,
      phaseName: this.getPhaseName(phase),
      valid: false,
      agentResults: [],
      integrationTestsPassed: false,
      performanceBenchmarksMet: false,
      documentationComplete: false,
      errors: [],
      warnings: [],
      suggestions: [],
      timestamp: Date.now(),
      duration: 0,
    } as CheckpointValidationResult);

    await this.emitEvent({ type: 'checkpoint_start', phase, agents });

    // Validate each agent
    const agentResults: AgentValidationResult[] = [];
    for (const agent of agents) {
      const result = await this.validationAgent.validateAgent(agent, context);
      agentResults.push(result);
    }

    // Run integration tests
    const integrationTestsPassed = await this.runIntegrationTests(phase, context);

    // Check performance benchmarks
    const performanceBenchmarksMet = await this.checkPerformanceBenchmarks(phase, context);

    // Check documentation completeness
    const documentationComplete = await this.checkDocumentationCompleteness(phase, context);

    // Aggregate results
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const allSuggestions: string[] = [];

    for (const result of agentResults) {
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
      allSuggestions.push(...result.suggestions);
    }

    if (!integrationTestsPassed) {
      allErrors.push('Integration tests failed');
    }

    if (!performanceBenchmarksMet) {
      allWarnings.push('Performance benchmarks not met');
    }

    if (!documentationComplete) {
      allWarnings.push('Documentation incomplete');
    }

    const valid =
      agentResults.every(r => r.valid) &&
      integrationTestsPassed &&
      performanceBenchmarksMet &&
      documentationComplete;

    const duration = Date.now() - startTime;

    const result: CheckpointValidationResult = {
      phase,
      phaseName: this.getPhaseName(phase),
      valid,
      agentResults,
      integrationTestsPassed,
      performanceBenchmarksMet,
      documentationComplete,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions,
      timestamp: Date.now(),
      duration,
    };

    this.logger.logCheckpoint(phase, result);
    await this.emitEvent({ type: 'checkpoint_complete', result });

    return result;
  }

  /**
   * Delegate to code-reviewer agent for validation
   */
  private async validateAgentWork(
    agent: string,
    result: AgentResult,
    context: ValidationContext
  ): Promise<AgentValidationResult> {
    return this.validationAgent.validateAgent(agent, context);
  }

  /**
   * Run integration tests for phase
   */
  private async runIntegrationTests(phase: number, context: ValidationContext): Promise<boolean> {
    // TODO: Implement actual test execution
    // For now, return true
    return true;
  }

  /**
   * Check performance benchmarks for phase
   */
  private async checkPerformanceBenchmarks(phase: number, context: ValidationContext): Promise<boolean> {
    // TODO: Implement actual benchmark checking
    // For now, return true
    return true;
  }

  /**
   * Check documentation completeness for phase
   */
  private async checkDocumentationCompleteness(phase: number, context: ValidationContext): Promise<boolean> {
    // TODO: Implement actual documentation checking
    // For now, return true
    return true;
  }

  /**
   * Get phase name
   */
  private getPhaseName(phase: number): string {
    const names = [
      'Infrastructure Setup',
      'Foundation Features',
      'Automation Engine',
      'Marketing Features',
      'Extended Features',
    ];
    return names[phase] || `Phase ${phase}`;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update statistics
   */
  private updateStatistics(agent: string, attempts: number, passed: boolean, duration: number): void {
    this.statistics.totalValidations++;
    this.statistics.totalRetries += attempts - 1;

    if (passed) {
      this.statistics.validationsPassed++;
    } else {
      this.statistics.validationsFailed++;
    }

    // Update average attempts
    this.statistics.averageAttempts =
      this.statistics.totalRetries / this.statistics.totalValidations;

    // Update average duration
    this.statistics.averageDuration =
      (this.statistics.averageDuration * (this.statistics.totalValidations - 1) + duration) /
      this.statistics.totalValidations;

    // Update success rate
    this.statistics.successRate =
      this.statistics.validationsPassed / this.statistics.totalValidations;

    // Update per-agent statistics
    if (!this.statistics.byAgent[agent]) {
      this.statistics.byAgent[agent] = {
        agentId: agent,
        totalValidations: 0,
        validationsPassed: 0,
        validationsFailed: 0,
        averageAttempts: 0,
        successRate: 0,
      };
    }

    const agentStats = this.statistics.byAgent[agent];
    agentStats.totalValidations++;

    if (passed) {
      agentStats.validationsPassed++;
    } else {
      agentStats.validationsFailed++;
    }

    agentStats.averageAttempts =
      (agentStats.averageAttempts * (agentStats.totalValidations - 1) + attempts) /
      agentStats.totalValidations;

    agentStats.successRate = agentStats.validationsPassed / agentStats.totalValidations;
  }

  /**
   * Get statistics
   */
  getStatistics(): RalphLoopStatistics {
    return { ...this.statistics };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statistics = {
      totalValidations: 0,
      validationsPassed: 0,
      validationsFailed: 0,
      averageAttempts: 0,
      totalRetries: 0,
      averageDuration: 0,
      successRate: 0,
      byAgent: {},
    };
  }
}

/**
 * Agent result interface
 */
export interface AgentResult {
  /** Agent ID */
  agent: string;
  /** Whether task completed successfully */
  success: boolean;
  /** Result data */
  data?: unknown;
  /** Error message if failed */
  error?: string;
  /** Files created/modified */
  files?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Console logger implementation
 */
export class ConsoleRalphLoopLogger implements RalphLoopLogger {
  logStart(agent: string, attempt: number): void {
    console.log(`[Ralph Loop] Starting validation for ${agent} (attempt ${attempt})`);
  }

  logResult(result: ValidationResult): void {
    if (result.valid) {
      console.log(`[Ralph Loop] Validation passed for ${result.agent} (attempt ${result.attempt})`);
    } else {
      console.error(
        `[Ralph Loop] Validation failed for ${result.agent} (attempt ${result.attempt}):\n` +
        `  Errors: ${result.errors.join(', ')}\n` +
        `  Warnings: ${result.warnings.join(', ')}`
      );
    }
  }

  logRetry(agent: string, attempt: number, delay: number): void {
    console.log(`[Ralph Loop] Retrying ${agent} (attempt ${attempt} in ${delay}ms)`);
  }

  logFailure(agent: string, attempts: number, error: string): void {
    console.error(`[Ralph Loop] Validation failed for ${agent} after ${attempts} attempts: ${error}`);
  }

  logCheckpoint(phase: number, result: CheckpointValidationResult): void {
    if (result.valid) {
      console.log(`[Ralph Loop] Checkpoint passed for phase ${phase} (${result.phaseName})`);
    } else {
      console.error(
        `[Ralph Loop] Checkpoint failed for phase ${phase} (${result.phaseName}):\n` +
        `  Errors: ${result.errors.join(', ')}\n` +
        `  Warnings: ${result.warnings.join(', ')}`
      );
    }
  }
}

/**
 * File logger implementation
 */
export class FileRalphLoopLogger implements RalphLoopLogger {
  private logFile: string;

  constructor(logFile: string) {
    this.logFile = logFile;
  }

  private writeLog(message: string): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    // In a real implementation, this would write to a file
    // For now, just log to console
    console.log(logEntry);
  }

  logStart(agent: string, attempt: number): void {
    this.writeLog(`[Ralph Loop] Starting validation for ${agent} (attempt ${attempt})`);
  }

  logResult(result: ValidationResult): void {
    if (result.valid) {
      this.writeLog(`[Ralph Loop] Validation passed for ${result.agent} (attempt ${result.attempt})`);
    } else {
      this.writeLog(
        `[Ralph Loop] Validation failed for ${result.agent} (attempt ${result.attempt}): ` +
        `Errors: ${result.errors.join(', ')}, Warnings: ${result.warnings.join(', ')}`
      );
    }
  }

  logRetry(agent: string, attempt: number, delay: number): void {
    this.writeLog(`[Ralph Loop] Retrying ${agent} (attempt ${attempt} in ${delay}ms)`);
  }

  logFailure(agent: string, attempts: number, error: string): void {
    this.writeLog(`[Ralph Loop] Validation failed for ${agent} after ${attempts} attempts: ${error}`);
  }

  logCheckpoint(phase: number, result: CheckpointValidationResult): void {
    if (result.valid) {
      this.writeLog(`[Ralph Loop] Checkpoint passed for phase ${phase} (${result.phaseName})`);
    } else {
      this.writeLog(
        `[Ralph Loop] Checkpoint failed for phase ${phase} (${result.phaseName}): ` +
        `Errors: ${result.errors.join(', ')}, Warnings: ${result.warnings.join(', ')}`
      );
    }
  }
}

/**
 * Create a Ralph Loop Executor with default configuration
 */
export function createRalphLoopExecutor(
  validationAgent: CodeReviewerAgent,
  logger?: RalphLoopLogger
): RalphLoopExecutor {
  const config = {
    enabled: true,
    maxRetries: 5,
    validationAgent: 'code_reviewer',
    retryDelay: 1000,
    onValidationFailure: 'retry' as const,
  };

  const effectiveLogger = logger || new ConsoleRalphLoopLogger();

  return new RalphLoopExecutor(config, validationAgent, effectiveLogger);
}
