/**
 * useOrchestrator Hook
 * React hook for orchestrating multi-agent workflows
 */

import { useState, useCallback, useRef } from 'react';
import { useAgents } from '@/context/AgentContext';
import { AgentExecutionService } from '../services/AgentExecutionService';
import type {
  OrchestratorWorkflow,
  OrchestratorTask,
  OrchestratorResult,
  AgentExecutionResult,
} from '../types';

// ============================================================================
// Hook State
// ============================================================================

interface UseOrchestratorState {
  isRunning: boolean;
  result: OrchestratorResult | null;
  error: string | null;
  currentTaskId: string | null;
  completedTasks: string[];
  progress: number; // 0-100
  taskResults: Map<string, AgentExecutionResult>;
}

// ============================================================================
// Hook Options
// ============================================================================

interface UseOrchestratorOptions {
  onTaskComplete?: (taskId: string, result: AgentExecutionResult) => void;
  onTaskError?: (taskId: string, error: string) => void;
  onComplete?: (result: OrchestratorResult) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  updateOrchestratorState?: boolean;
}

// ============================================================================
// Hook Return
// ============================================================================

interface UseOrchestratorReturn extends UseOrchestratorState {
  executeWorkflow: (
    workflow: OrchestratorWorkflow
  ) => Promise<OrchestratorResult | null>;
  executeSequential: (
    tasks: OrchestratorTask[]
  ) => Promise<Map<string, AgentExecutionResult>>;
  executeParallel: (
    tasks: OrchestratorTask[],
    maxConcurrency?: number
  ) => Promise<Map<string, AgentExecutionResult>>;
  cancel: () => void;
  reset: () => void;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useOrchestrator(options: UseOrchestratorOptions = {}): UseOrchestratorReturn {
  const { setOrchestratorState } = useAgents();

  const [state, setState] = useState<UseOrchestratorState>({
    isRunning: false,
    result: null,
    error: null,
    currentTaskId: null,
    completedTasks: [],
    progress: 0,
    taskResults: new Map(),
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const taskResultsRef = useRef<Map<string, AgentExecutionResult>>(new Map());

  // Helper functions defined as callbacks to avoid closure issues
  const getNestedValue = useCallback((obj: Record<string, unknown>, path: string): unknown => {
    const parts = path.split('.');
    let value: unknown = obj;

    for (const part of parts) {
      if (typeof value === 'object' && value !== null) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }

    return value;
  }, []);

  const compareValues = useCallback((actual: unknown, operator: string, expected: unknown): boolean => {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'ne': return actual !== expected;
      case 'gt': return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
      case 'lt': return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      default: return false;
    }
  }, []);

  const evaluateCondition = useCallback((
    condition: OrchestratorTask['condition'],
    previousResults: Map<string, AgentExecutionResult>
  ): boolean => {
    if (!condition) return true;

    let value: unknown;

    if (condition.field.includes('.')) {
      const [taskId, ...fieldParts] = condition.field.split('.');
      const result = previousResults.get(taskId);
      if (result?.output?.data) {
        value = getNestedValue(result.output.data as Record<string, unknown>, fieldParts.join('.'));
      }
    } else {
      value = previousResults.get(condition.field)?.output?.data;
    }

    return compareValues(value, condition.operator, condition.value);
  }, [getNestedValue, compareValues]);

  const executeTask = useCallback(async (
    task: OrchestratorTask,
    previousResults: Map<string, AgentExecutionResult>,
    _signal: AbortSignal
  ): Promise<AgentExecutionResult> => {
    // Check condition if present
    if (task.condition) {
      const conditionMet = evaluateCondition(task.condition, previousResults);
      if (!conditionMet) {
        return {
          agentId: task.agentType,
          agentType: task.agentType,
          status: 'completed',
          input: { action: task.action, params: task.params },
          output: { success: true, data: null, metadata: { skipped: true } },
          startTime: Date.now(),
          endTime: Date.now(),
          duration: 0,
        };
      }
    }

    // Check dependencies
    if (task.dependsOn && task.dependsOn.length > 0) {
      const dependenciesMet = task.dependsOn.every(depId => previousResults.has(depId));
      if (!dependenciesMet) {
        throw new Error(`Unmet dependencies: ${task.dependsOn.join(', ')}`);
      }
    }

    // Execute via service
    const response = await AgentExecutionService.execute(
      task.agentType,
      task.action,
      {
        ...task.params,
        previousResults: Array.from(previousResults.entries()),
      },
      {
        timeout: task.timeout,
      }
    );

    return {
      agentId: task.agentType,
      agentType: task.agentType,
      status: response.success ? 'completed' : 'failed',
      input: { action: task.action, params: task.params },
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
  }, [evaluateCondition]);

  const executeSequentialInternal = useCallback(async (
    tasks: OrchestratorTask[],
    signal: AbortSignal
  ): Promise<{
    results: Map<string, AgentExecutionResult>;
    errors: Array<{ taskId: string; error: string }>;
  }> => {
    const results = new Map<string, AgentExecutionResult>();
    const errors: Array<{ taskId: string; error: string }> = [];

    for (let i = 0; i < tasks.length; i++) {
      if (signal.aborted) {
        throw new Error('Execution aborted');
      }

      const task = tasks[i];
      setState(prev => ({ ...prev, currentTaskId: task.id, progress: (i / tasks.length) * 100 }));

      try {
        const result = await executeTask(task, results, signal);
        results.set(task.id, result);

        setState(prev => ({
          ...prev,
          completedTasks: [...prev.completedTasks, task.id],
        }));

        if (options.onTaskComplete) {
          options.onTaskComplete(task.id, result);
        }

        if (result.status === 'failed') {
          errors.push({ taskId: task.id, error: result.error || 'Unknown error' });
          if (options.onTaskError) {
            options.onTaskError(task.id, result.error || 'Unknown error');
          }
        }

      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        errors.push({ taskId: task.id, error });

        if (options.onTaskError) {
          options.onTaskError(task.id, error);
        }
      }
    }

    return { results, errors };
  }, [executeTask, options]);

  const executeParallelInternal = useCallback(async (
    tasks: OrchestratorTask[],
    maxConcurrency: number,
    signal: AbortSignal
  ): Promise<{
    results: Map<string, AgentExecutionResult>;
    errors: Array<{ taskId: string; error: string }>;
  }> => {
    const results = new Map<string, AgentExecutionResult>();
    const errors: Array<{ taskId: string; error: string }> = [];

    for (let i = 0; i < tasks.length; i += maxConcurrency) {
      if (signal.aborted) {
        throw new Error('Execution aborted');
      }

      const batch = tasks.slice(i, i + maxConcurrency);
      const batchResults = await Promise.allSettled(
        batch.map(task => executeTask(task, results, signal))
      );

      for (let j = 0; j < batch.length; j++) {
        const task = batch[j];
        const batchResult = batchResults[j];

        if (batchResult.status === 'fulfilled') {
          results.set(task.id, batchResult.value);

          if (options.onTaskComplete) {
            options.onTaskComplete(task.id, batchResult.value);
          }

          if (batchResult.value.status === 'failed') {
            errors.push({
              taskId: task.id,
              error: batchResult.value.error || 'Unknown error',
            });
          }
        } else {
          const error = batchResult.reason instanceof Error
            ? batchResult.reason.message
            : String(batchResult.reason);
          errors.push({ taskId: task.id, error });

          if (options.onTaskError) {
            options.onTaskError(task.id, error);
          }
        }
      }

      setState(prev => ({
        ...prev,
        completedTasks: Array.from(results.keys()),
        progress: ((i + batch.length) / tasks.length) * 100,
      }));
    }

    return { results, errors };
  }, [executeTask, options]);

  /**
   * Execute a complete orchestrator workflow
   */
  const executeWorkflow = useCallback(
    async (workflow: OrchestratorWorkflow): Promise<OrchestratorResult | null> => {
      // Reset state
      setState({
        isRunning: true,
        result: null,
        error: null,
        currentTaskId: null,
        completedTasks: [],
        progress: 0,
        taskResults: new Map(),
      });
      taskResultsRef.current = new Map();

      // Update orchestrator state if configured
      if (options.updateOrchestratorState) {
        setOrchestratorState({ isRunning: true });
      }

      const startTime = Date.now();
      abortControllerRef.current = new AbortController();

      try {
        let results: Map<string, AgentExecutionResult>;
        let errors: Array<{ taskId: string; error: string }> = [];

        switch (workflow.strategy) {
          case 'sequential':
            ({ results, errors } = await executeSequentialInternal(
              workflow.tasks,
              abortControllerRef.current.signal
            ));
            break;

          case 'parallel':
            ({ results, errors } = await executeParallelInternal(
              workflow.tasks,
              workflow.maxConcurrency ?? 10,
              abortControllerRef.current.signal
            ));
            break;

          case 'conditional':
            ({ results, errors } = await executeSequentialInternal(
              workflow.tasks,
              abortControllerRef.current.signal
            ));
            break;

          default:
            throw new Error(`Unknown execution strategy: ${workflow.strategy}`);
        }

        const endTime = Date.now();
        const success = errors.length === 0 || workflow.onError === 'continue';

        const result: OrchestratorResult = {
          workflowId: workflow.id,
          status: success ? 'completed' : 'failed',
          results,
          errors,
          startTime,
          endTime,
          duration: endTime - startTime,
        };

        setState({
          isRunning: false,
          result,
          error: success ? null : `${errors.length} task(s) failed`,
          currentTaskId: null,
          completedTasks: Array.from(results.keys()),
          progress: 100,
          taskResults: results,
        });

        if (options.updateOrchestratorState) {
          setOrchestratorState({
            isRunning: false,
            currentResult: result,
          });
        }

        if (success && options.onComplete) {
          options.onComplete(result);
        }
        if (!success && options.onError) {
          options.onError(`${errors.length} task(s) failed`);
        }

        return result;

      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);

        setState({
          isRunning: false,
          result: null,
          error,
          currentTaskId: null,
          completedTasks: [],
          progress: 0,
          taskResults: taskResultsRef.current,
        });

        if (options.updateOrchestratorState) {
          setOrchestratorState({
            isRunning: false,
          });
        }

        if (options.onError) {
          options.onError(error);
        }

        return null;
      }
    },
    [options, setOrchestratorState, executeSequentialInternal, executeParallelInternal]
  );

  /**
   * Execute tasks sequentially
   */
  const executeSequential = useCallback(
    async (tasks: OrchestratorTask[]): Promise<Map<string, AgentExecutionResult>> => {
      setState(prev => ({ ...prev, isRunning: true, progress: 0 }));
      abortControllerRef.current = new AbortController();

      const { results } = await executeSequentialInternal(
        tasks,
        abortControllerRef.current.signal
      );

      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        taskResults: results,
      }));

      return results;
    },
    [executeSequentialInternal]
  );

  /**
   * Execute tasks in parallel
   */
  const executeParallel = useCallback(
    async (
      tasks: OrchestratorTask[],
      maxConcurrency: number = 5
    ): Promise<Map<string, AgentExecutionResult>> => {
      setState(prev => ({ ...prev, isRunning: true, progress: 0 }));
      abortControllerRef.current = new AbortController();

      const { results } = await executeParallelInternal(
        tasks,
        maxConcurrency,
        abortControllerRef.current.signal
      );

      setState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        taskResults: results,
      }));

      return results;
    },
    [executeParallelInternal]
  );

  /**
   * Cancel execution
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      isRunning: false,
      result: null,
      error: 'Cancelled',
      currentTaskId: null,
      completedTasks: [],
      progress: 0,
      taskResults: new Map(),
    });

    if (options.updateOrchestratorState) {
      setOrchestratorState({ isRunning: false });
    }
  }, [options, setOrchestratorState]);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setState({
      isRunning: false,
      result: null,
      error: null,
      currentTaskId: null,
      completedTasks: [],
      progress: 0,
      taskResults: new Map(),
    });
  }, []);

  return {
    ...state,
    executeWorkflow,
    executeSequential,
    executeParallel,
    cancel,
    reset,
  };
}
