/**
 * useAgentExecution Hook
 * React hook for executing agents with state management
 */

import { useState, useCallback, useRef } from 'react';
import { useAgents } from '@/context/AgentContext';
import { AgentExecutionService } from '../services/AgentExecutionService';
import type { AgentExecutionResult } from '../types';

// ============================================================================
// Hook State
// ============================================================================

interface UseAgentExecutionState {
  isExecuting: boolean;
  result: AgentExecutionResult | null;
  error: string | null;
  progress: number;
  executionId: string | null;
}

// ============================================================================
// Hook Options
// ============================================================================

interface UseAgentExecutionOptions {
  onSuccess?: (result: AgentExecutionResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  updateAgentState?: boolean;
}

// ============================================================================
// Hook Return
// ============================================================================

interface UseAgentExecutionReturn extends UseAgentExecutionState {
  execute: (
    agentType: string,
    action: string,
    params?: Record<string, unknown>,
    options?: {
      workflowExecutionId?: string;
      timeout?: number;
    }
  ) => Promise<AgentExecutionResult | null>;
  cancel: () => void;
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAgentExecution(options: UseAgentExecutionOptions = {}): UseAgentExecutionReturn {
  const { setAgentState } = useAgents();

  const [state, setState] = useState<UseAgentExecutionState>({
    isExecuting: false,
    result: null,
    error: null,
    progress: 0,
    executionId: null,
  });

  const executionIdRef = useRef<string | null>(null);

  /**
   * Execute an agent
   */
  const execute = useCallback(
    async (
      agentType: string,
      action: string,
      params: Record<string, unknown> = {},
      execOptions: {
        workflowExecutionId?: string;
        timeout?: number;
      } = {}
    ): Promise<AgentExecutionResult | null> => {
      // Reset state
      setState({
        isExecuting: true,
        result: null,
        error: null,
        progress: 0,
        executionId: null,
      });

      // Update agent state if configured
      if (options.updateAgentState) {
        setAgentState(agentType, {
          status: 'running',
          isExecuting: true,
        });
      }

      try {
        // Execute via service
        const response = await AgentExecutionService.execute(
          agentType,
          action,
          params,
          {
            workflowExecutionId: execOptions.workflowExecutionId,
            timeout: execOptions.timeout,
          }
        );

        // Build result
        const result: AgentExecutionResult = {
          agentId: agentType,
          agentType: agentType as any,
          status: response.success ? 'completed' : 'failed',
          input: {
            action,
            params,
          },
          output: {
            success: response.success,
            data: response.data,
            error: response.error,
          },
          startTime: Date.now() - (response.duration || 0),
          endTime: Date.now(),
          duration: response.duration || 0,
          error: response.error,
        };

        // Update state
        setState({
          isExecuting: false,
          result,
          error: response.error || null,
          progress: 100,
          executionId: response.executionId || null,
        });

        executionIdRef.current = response.executionId || null;

        // Update agent state if configured
        if (options.updateAgentState) {
          setAgentState(agentType, {
            status: response.success ? 'completed' : 'failed',
            isExecuting: false,
            lastResult: result,
          });
        }

        // Call callbacks
        if (response.success && options.onSuccess) {
          options.onSuccess(result);
        }
        if (!response.success && options.onError) {
          options.onError(response.error || 'Execution failed');
        }

        return result;

      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);

        setState({
          isExecuting: false,
          result: null,
          error,
          progress: 0,
          executionId: null,
        });

        // Update agent state if configured
        if (options.updateAgentState) {
          setAgentState(agentType, {
            status: 'failed',
            isExecuting: false,
          });
        }

        if (options.onError) {
          options.onError(error);
        }

        return null;
      }
    },
    [options, setAgentState]
  );

  /**
   * Cancel current execution
   */
  const cancel = useCallback(() => {
    if (executionIdRef.current) {
      AgentExecutionService.cancel(executionIdRef.current);
      executionIdRef.current = null;
    }

    setState({
      isExecuting: false,
      result: null,
      error: 'Cancelled',
      progress: 0,
      executionId: null,
    });
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isExecuting: false,
      result: null,
      error: null,
      progress: 0,
      executionId: null,
    });
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset,
  };
}

// ============================================================================
// Convenience Hook for Specific Agent
// ============================================================================

export function useSpecificAgentExecution(
  agentType: string,
  options: UseAgentExecutionOptions = {}
) {
  const execution = useAgentExecution(options);

  const execute = useCallback(
    async (
      action: string,
      params?: Record<string, unknown>,
      execOptions?: {
        workflowExecutionId?: string;
        timeout?: number;
      }
    ) => {
      return execution.execute(agentType, action, params, execOptions);
    },
    [agentType, execution]
  );

  return {
    ...execution,
    execute,
  };
}
