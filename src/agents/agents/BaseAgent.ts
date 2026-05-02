/**
 * Base Agent Class
 * Abstract base class for all agents in the system
 */

import type {
  AgentDefinition,
  AgentInput,
  AgentOutput,
  AgentConfig,
  AgentContext,
  AgentExecutionResult,
  AgentStatus,
} from '../types';
import { AgentError, AgentTimeoutError } from '../types';

// ============================================================================
// Base Agent Abstract Class
// ============================================================================

/**
 * Abstract base class that all agents must extend
 * Provides common functionality for execution, retries, and error handling
 */
export abstract class BaseAgent {
  readonly definition: AgentDefinition;
  protected config: AgentConfig;

  constructor(definition: AgentDefinition, config: AgentConfig) {
    this.definition = definition;
    this.config = config;
  }

  // ============================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ============================================================================

  /**
   * Execute a specific action for this agent
   * Subclasses must implement this method
   */
  protected abstract executeAction(
    action: string,
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<unknown>;

  /**
   * Validate input parameters before execution
   * Subclasses should override to add specific validation
   */
  protected validateInput(
    action: string,
    _params: Record<string, unknown>
  ): void {
    // Default validation - override in subclass if needed
    if (!action) {
      throw new AgentError('Action is required', 'INVALID_INPUT');
    }
  }

  // ============================================================================
  // Public Methods
  // ============================================================================

  /**
   * Main execution method - handles retries, timeouts, and error handling
   */
  async execute(input: AgentInput): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    let status: AgentStatus = 'running';
    let output: AgentOutput = { success: false };
    let error: string | undefined;
    let retryCount = 0;
    const maxRetries = this.config.retryMax ?? 0;
    const retryDelay = this.config.retryDelay ?? 1000;

    // Build context
    const _context: AgentContext = {
      organizationId: this.config.organizationId,
      userId: this.config.userId,
      ...input.context,
    };

    try {
      // Validate input
      this.validateInput(input.action, input.params);

      // Execute with retry logic
      while (retryCount <= maxRetries) {
        try {
          // Execute with timeout
          const timeout = this.config.timeout ?? this.definition.timeout ?? 60000;
          const data = await this.withTimeout(
            this.executeAction(input.action, input.params, _context),
            timeout
          );

          output = {
            success: true,
            data,
            metadata: {
              retryCount,
              executionTime: Date.now() - startTime,
            },
          };
          status = 'completed';
          break;
        } catch (err) {
          // If it's a timeout error, don't retry
          if (err instanceof AgentTimeoutError) {
            throw err;
          }

          // If we've exhausted retries, throw
          if (retryCount >= maxRetries) {
            throw err;
          }

          // Wait before retrying
          await this.delay(retryDelay * (retryCount + 1)); // Exponential backoff
          retryCount++;
        }
      }
    } catch (err) {
      status = 'failed';
      error = err instanceof Error ? err.message : String(err);

      output = {
        success: false,
        error,
        metadata: {
          retryCount,
          executionTime: Date.now() - startTime,
        },
      };
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      agentId: this.definition.id,
      agentType: this.definition.type,
      status,
      input,
      output,
      startTime,
      endTime,
      duration,
      error,
      metadata: output.metadata,
    };
  }

  /**
   * Check if this agent can handle a specific action
   */
  canHandleAction(_action: string): boolean {
    // Subclasses can override to provide specific action handling logic
    return true;
  }

  /**
   * Check if this agent has a specific capability
   */
  hasCapability(capability: string): boolean {
    return this.definition.capabilities.includes(capability as 'data_query' | 'analysis' | 'generation');
  }

  /**
   * Get the agent definition
   */
  getDefinition(): AgentDefinition {
    return this.definition;
  }

  /**
   * Update the agent configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // Protected Helper Methods
  // ============================================================================

  /**
   * Wrap a promise with a timeout
   */
  protected async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timeoutHandle: number | undefined;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = window.setTimeout(() => {
        reject(new AgentTimeoutError(this.definition.id, timeoutMs));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    }
  }

  /**
   * Delay execution for a specified number of milliseconds
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log a message for debugging
   */
  protected log(message: string, data?: unknown): void {
    if (import.meta.env.DEV) {
      console.log(`[${this.definition.name}] ${message}`, data ?? '');
    }
  }

  /**
   * Log an error
   */
  protected logError(message: string, error?: unknown): void {
    if (import.meta.env.DEV) {
      console.error(`[${this.definition.name}] ${message}`, error ?? '');
    }
  }
}

// ============================================================================
// Agent Factory
// ============================================================================

/**
 * Factory for creating agent instances
 * Agents register themselves with the factory
 */
class AgentFactory {
  private agents = new Map<string, {
    definition: AgentDefinition;
    factory: (config: AgentConfig) => BaseAgent;
  }>();

  /**
   * Register an agent class
   */
  register(
    agentId: string,
    definition: AgentDefinition,
    factory: (config: AgentConfig) => BaseAgent
  ): void {
    this.agents.set(agentId, { definition, factory });
  }

  /**
   * Create an agent instance
   */
  create(agentId: string, config: AgentConfig): BaseAgent | null {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return null;
    }
    return entry.factory(config);
  }

  /**
   * Get all registered agent IDs
   */
  getRegisteredAgentIds(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Check if an agent is registered
   */
  isRegistered(agentId: string): boolean {
    return this.agents.has(agentId);
  }
}

// Export singleton instance
export const agentFactory = new AgentFactory();
