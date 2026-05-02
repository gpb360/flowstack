/**
 * Agent Execution Service
 * Manages agent execution via Edge Function with proper error handling
 */

// ============================================================================
// Service Configuration
// ============================================================================

const EXECUTION_TIMEOUT = 300000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// ============================================================================
// Types
// ============================================================================

export interface ExecutionOptions {
  timeout?: number;
  retryMax?: number;
  retryDelay?: number;
  workflowExecutionId?: string;
}

export interface ExecutionResponse {
  success: boolean;
  data?: unknown;
  executionId?: string;
  duration?: number;
  error?: string;
}

// ============================================================================
// Agent Execution Service
// ============================================================================

class AgentExecutionServiceClass {
  private executingAgents = new Map<string, AbortController>();

  /**
   * Execute an agent action via the Edge Function
   */
  async execute(
    agentType: string,
    action: string,
    params: Record<string, unknown>,
    options: ExecutionOptions = {}
  ): Promise<ExecutionResponse> {
    const {
      timeout = EXECUTION_TIMEOUT,
      retryMax = MAX_RETRIES,
      retryDelay = RETRY_DELAY,
      workflowExecutionId,
    } = options;

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= retryMax) {
      try {
        const response = await this.executeWithTimeout(
          agentType,
          action,
          params,
          workflowExecutionId,
          timeout
        );

        if (response.success) {
          return response;
        }

        // If execution failed and we have retries left
        if (attempt < retryMax) {
          attempt++;
          await this.delay(retryDelay * attempt); // Exponential backoff
          continue;
        }

        return response;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retryMax) {
          attempt++;
          await this.delay(retryDelay * attempt);
          continue;
        }

        return {
          success: false,
          error: lastError.message,
        };
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Execution failed',
    };
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(
    agentType: string,
    action: string,
    params: Record<string, unknown>,
    workflowExecutionId: string | undefined,
    timeout: number
  ): Promise<ExecutionResponse> {
    const controller = new AbortController();
    const executionId = `${agentType}-${Date.now()}`;
    this.executingAgents.set(executionId, controller);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL and Anon Key are required');
      }

      // Get auth token
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/agent-execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': supabaseAnonKey,
          },
          body: JSON.stringify({
            agentType,
            action,
            params,
            workflowExecutionId,
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Execution failed');
      }

      const result = await response.json();
      return result;

    } finally {
      clearTimeout(timeoutId);
      this.executingAgents.delete(executionId);
    }
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(
    executions: Array<{
      agentType: string;
      action: string;
      params: Record<string, unknown>;
      options?: ExecutionOptions;
    }>
  ): Promise<Map<string, ExecutionResponse>> {
    const results = new Map<string, ExecutionResponse>();

    await Promise.all(
      executions.map(async (execution, index) => {
        const key = execution.agentType + '-' + index;
        const result = await this.execute(
          execution.agentType,
          execution.action,
          execution.params,
          execution.options
        );
        results.set(key, result);
      })
    );

    return results;
  }

  /**
   * Execute agents sequentially with context passing
   */
  async executeSequential(
    executions: Array<{
      agentType: string;
      action: string;
      params: Record<string, unknown>;
      options?: ExecutionOptions;
    }>
  ): Promise<Map<string, ExecutionResponse>> {
    const results = new Map<string, ExecutionResponse>();
    const context = new Map<string, unknown>();

    for (let i = 0; i < executions.length; i++) {
      const execution = executions[i];
      const key = execution.agentType + '-' + i;

      // Add previous results to params
      const paramsWithContext = {
        ...execution.params,
        previousResults: Array.from(context.entries()),
      };

      const result = await this.execute(
        execution.agentType,
        execution.action,
        paramsWithContext,
        execution.options
      );

      results.set(key, result);

      // Store result for next execution
      if (result.success && result.data) {
        context.set(key, result.data);
      }

      // Stop on error if configured
      if (!result.success && execution.options?.retryMax === 0) {
        break;
      }
    }

    return results;
  }

  /**
   * Cancel a running execution
   */
  cancel(executionId: string): boolean {
    const controller = this.executingAgents.get(executionId);
    if (controller) {
      controller.abort();
      this.executingAgents.delete(executionId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all running executions
   */
  cancelAll(): void {
    for (const [_id, controller] of this.executingAgents) {
      controller.abort();
    }
    this.executingAgents.clear();
  }

  /**
   * Get list of running executions
   */
  getRunningExecutions(): string[] {
    return Array.from(this.executingAgents.keys());
  }

  /**
   * Check if an agent is currently executing
   */
  isExecuting(executionId: string): boolean {
    return this.executingAgents.has(executionId);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const AgentExecutionService = new AgentExecutionServiceClass();
