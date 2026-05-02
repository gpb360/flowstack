/**
 * Ralph Loop Executor
 * Wraps task execution with validation loop to ensure code quality
 */

import type {
  OrchestratorTask,
  AgentExecutionResult,
  AgentContext,
} from '../../types';
import type { RalphLoopConfig, RalphLoopState } from '../types';
import { agentFactory } from '../../agents/BaseAgent';

// ============================================================================
// Ralph Loop Executor
// ============================================================================

/**
 * Executes tasks with Ralph loop validation pattern
 * - Inner loop: Agent self-validates before marking complete
 * - Outer loop: Orchestrator delegates to code-reviewer agent
 * - Max 5 retries with validation feedback
 */
export class RalphLoopExecutor {
  private config: RalphLoopConfig;

  constructor(config: RalphLoopConfig) {
    this.config = config;
  }

  /**
   * Execute task with Ralph loop validation
   */
  async executeWithValidation(
    task: OrchestratorTask,
    executeFn: () => Promise<AgentExecutionResult>,
    context: AgentContext
  ): Promise<{
    result: AgentExecutionResult;
    validationPassed: boolean;
    validationHistory: RalphLoopState['validationResults'];
  }> {
    const state: RalphLoopState = {
      attemptNumber: 0,
      validationResults: [],
      currentStatus: 'pending',
    };

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      state.attemptNumber = attempt;
      state.currentStatus = 'validating';

      // Execute the task
      const result = await executeFn();

      // Run validation via code-reviewer agent
      const validation = await this.validateResult(task, result, context);

      state.validationResults.push({
        attempt,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
        timestamp: Date.now(),
      });

      if (validation.valid) {
        state.currentStatus = 'passed';
        return {
          result,
          validationPassed: true,
          validationHistory: state.validationResults,
        };
      }

      // Validation failed - handle based on configuration
      if (attempt >= this.config.maxRetries) {
        state.currentStatus = 'failed';

        const errorSummary = validation.errors.join(', ');
        const errorMessage = `Ralph loop validation failed after ${attempt} attempts${errorSummary ? `. Errors: ${errorSummary}` : ''}`;

        // Return failed result instead of throwing to allow graceful handling
        return {
          result: {
            ...result,
            status: 'failed',
            error: errorMessage,
            output: {
              ...result.output,
              success: false,
              error: errorMessage,
              metadata: {
                ...result.output?.metadata,
                validationErrors: validation.errors,
                validationWarnings: validation.warnings,
                validationHistory: state.validationResults,
              },
            },
          },
          validationPassed: false,
          validationHistory: state.validationResults,
        };
      }

      state.currentStatus = 'retrying';

      // Check if we should stop on validation failure
      if (this.config.onValidationFailure === 'stop') {
        break;
      }

      // Wait before retrying
      await this.delay(this.config.retryDelay);
    }

    // If we get here, all retries exhausted
    const lastValidation = state.validationResults[state.validationResults.length - 1];
    return {
      result: {
        agentId: task.agentType,
        agentType: task.agentType,
        status: 'failed',
        input: { action: task.action, params: task.params },
        output: {
          success: false,
          error: `Ralph loop exceeded max retries (${this.config.maxRetries}). Last errors: ${lastValidation?.errors.join(', ') || 'Unknown'}`,
          metadata: {
            validationHistory: state.validationResults,
          },
        },
        startTime: Date.now(),
        endTime: Date.now(),
        duration: 0,
      },
      validationPassed: false,
      validationHistory: state.validationResults,
    };
  }

  /**
   * Validate task result using code-reviewer agent
   */
  private async validateResult(
    task: OrchestratorTask,
    result: AgentExecutionResult,
    context: AgentContext
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[]; suggestions: string[] }> {
    try {
      const agent = agentFactory.create(this.config.validationAgent, {
        organizationId: context.organizationId,
        userId: context.userId,
        timeout: 60000, // 1 minute for validation
      });

      if (!agent) {
        // Fall back to script-based validation
        console.warn(`Code reviewer agent '${this.config.validationAgent}' not found. Using script-based validation.`);
        return await this.validateViaScript(task, result, context);
      }

      const input = {
        action: 'review_completion',
        params: {
          taskType: task.agentType,
          taskResult: result,
          context,
        },
        context,
      };

      const validationResult = await agent.execute(input);
      return validationResult.output?.data as { valid: boolean; errors: string[]; warnings: string[]; suggestions: string[] };
    } catch (error) {
      // If validation fails, treat as validation failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Code reviewer agent validation failed:', errorMessage);
      return {
        valid: false,
        errors: [`Validation agent failed: ${errorMessage}`],
        warnings: [],
        suggestions: [],
      };
    }
  }

  /**
   * Fallback to script-based validation when agent unavailable
   * Note: This is a stub for browser compatibility. In Node.js environments,
   * this would run the validation script via child_process.
   */
  private async validateViaScript(
    _task: OrchestratorTask,
    _result: AgentExecutionResult,
    _context: AgentContext
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[]; suggestions: string[] }> {
    // Stub implementation for browser compatibility
    // In a real Node.js environment, this would use child_process.execSync
    // to run the validation script
    return {
      valid: false,
      errors: ['Script validation not available in browser environment'],
      warnings: [],
      suggestions: ['Ensure code reviewer agent is available for validation']
    };
  }

  /**
   * Delay execution for a specified number of milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the current Ralph loop configuration
   */
  getConfig(): RalphLoopConfig {
    return { ...this.config };
  }

  /**
   * Update the Ralph loop configuration
   */
  updateConfig(config: Partial<RalphLoopConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a Ralph loop executor with default configuration
 */
export function createRalphLoopExecutor(
  config?: Partial<RalphLoopConfig>
): RalphLoopExecutor {
  const defaultConfig: RalphLoopConfig = {
    enabled: true,
    maxRetries: 5,
    validationAgent: 'code_reviewer',
    retryDelay: 1000,
    onValidationFailure: 'retry',
  };

  return new RalphLoopExecutor({
    ...defaultConfig,
    ...config,
  });
}
