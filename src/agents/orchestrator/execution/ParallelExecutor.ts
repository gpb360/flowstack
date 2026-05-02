/**
 * Parallel Executor
 * Executes orchestrator tasks in parallel with concurrency control
 */

import type {
  OrchestratorTask,
  AgentInput,
  AgentContext,
  AgentExecutionResult,
} from '../../types';
import type { ParallelExecutionConfig } from '../types';
import { agentFactory } from '../../agents/BaseAgent';
import { RalphLoopExecutor } from './RalphLoopExecutor';

// ============================================================================
// Parallel Executor
// ============================================================================

/**
 * Executes tasks in parallel with controlled concurrency
 * Handles dependencies by scheduling tasks in appropriate order
 * Supports Ralph loop validation for code quality assurance
 */
export class ParallelExecutor {
  private config: ParallelExecutionConfig;
  private ralphLoopExecutor?: RalphLoopExecutor;

  constructor(config: ParallelExecutionConfig) {
    this.config = config;

    // Initialize Ralph loop executor if configured
    if (this.config.ralphLoopConfig?.enabled) {
      this.ralphLoopExecutor = new RalphLoopExecutor(this.config.ralphLoopConfig);
    }
  }

  /**
   * Execute all tasks with parallel execution
   */
  async execute(): Promise<{
    results: Map<string, AgentExecutionResult>;
    errors: Array<{ taskId: string; error: string }>;
    success: boolean;
  }> {
    const results = new Map<string, AgentExecutionResult>();
    const errors: Array<{ taskId: string; error: string }> = [];
    let success = true;

    // Create a map of task dependencies
    const taskMap = new Map<string, OrchestratorTask>();
    const dependents = new Map<string, string[]>(); // taskId -> tasks that depend on it
    const remainingDeps = new Map<string, number>(); // taskId -> remaining dependencies count

    for (const task of this.config.tasks) {
      taskMap.set(task.id, task);
      const depCount = task.dependsOn?.length ?? 0;
      remainingDeps.set(task.id, depCount);

      // Build dependents map
      for (const depId of task.dependsOn ?? []) {
        if (!dependents.has(depId)) {
          dependents.set(depId, []);
        }
        dependents.get(depId)!.push(task.id);
      }
    }

    // Queue of tasks ready to execute (no pending dependencies)
    const readyQueue: OrchestratorTask[] = [];
    for (const task of this.config.tasks) {
      if ((task.dependsOn?.length ?? 0) === 0) {
        readyQueue.push(task);
      }
    }

    // Execute tasks with concurrency control
    const executing = new Set<string>();
    const maxConcurrency = this.config.maxConcurrency;

    const processTask = async (task: OrchestratorTask): Promise<void> => {
      executing.add(task.id);

      try {
        // Check condition if present
        if (task.condition && !this.evaluateCondition(task.condition, results)) {
          // Condition not met, skip this task
          executing.delete(task.id);
          return;
        }

        let result: AgentExecutionResult;

        // Check if Ralph loop is enabled for this task
        const taskWithRalph = task as typeof task & { enableRalphLoop?: boolean; ralphLoopConfig?: Partial<import('../types').RalphLoopConfig> };

        if ((taskWithRalph.enableRalphLoop || this.ralphLoopExecutor) && taskWithRalph.enableRalphLoop !== false) {
          // Use Ralph loop executor
          const ralphExecutor = taskWithRalph.ralphLoopConfig
            ? new RalphLoopExecutor({
                enabled: true,
                maxRetries: taskWithRalph.ralphLoopConfig.maxRetries ?? 5,
                validationAgent: taskWithRalph.ralphLoopConfig.validationAgent ?? 'code_reviewer',
                retryDelay: taskWithRalph.ralphLoopConfig.retryDelay ?? 1000,
                onValidationFailure: taskWithRalph.ralphLoopConfig.onValidationFailure ?? 'retry',
              })
            : this.ralphLoopExecutor!;

          const { result: ralphResult, validationPassed, validationHistory } = await ralphExecutor.executeWithValidation(
            task,
            () => this.executeTask(task, this.config.context, results),
            this.config.context
          );

          result = ralphResult;

          // Check if validation passed
          if (!validationPassed) {
            errors.push({
              taskId: task.id,
              error: `Ralph loop validation failed. Errors: ${validationHistory.map(v => v.errors.join(', ')).filter(Boolean).join('; ')}`,
            });

            if (this.config.stopOnError) {
              success = false;
            }
          }
        } else {
          // Normal execution without Ralph loop
          result = await this.executeTask(task, this.config.context, results);
        }

        results.set(task.id, result);

        // Check if task failed
        if (result.status === 'failed') {
          const error = result.error || 'Unknown error';
          errors.push({ taskId: task.id, error });

          if (this.config.stopOnError) {
            success = false;
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        errors.push({ taskId: task.id, error });

        if (this.config.stopOnError) {
          success = false;
        }
      } finally {
        executing.delete(task.id);

        // Update dependent tasks
        const dependentTaskIds = dependents.get(task.id) ?? [];
        for (const depId of dependentTaskIds) {
          const newDeps = (remainingDeps.get(depId) ?? 1) - 1;
          remainingDeps.set(depId, newDeps);

          if (newDeps === 0) {
            const dependentTask = taskMap.get(depId);
            if (dependentTask) {
              readyQueue.push(dependentTask);
            }
          }
        }
      }
    };

    // Process tasks until queue is empty
    while (readyQueue.length > 0 || executing.size > 0) {
      // Fill up to max concurrency
      while (readyQueue.length > 0 && executing.size < maxConcurrency) {
        const task = readyQueue.shift()!;
        processTask(task);
      }

      // Wait for at least one task to complete if we're at max concurrency
      if (executing.size >= maxConcurrency) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Check if we should stop on error
      if (!success && this.config.stopOnError) {
        break;
      }
    }

    return { results, errors, success };
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    task: OrchestratorTask,
    context: AgentContext,
    previousResults: Map<string, AgentExecutionResult>
  ): Promise<AgentExecutionResult> {
    // Create agent instance
    const agentConfig = {
      organizationId: context.organizationId,
      userId: context.userId,
      timeout: task.timeout,
      retryMax: task.retryMax ?? this.config.maxRetries,
    };

    const agent = agentFactory.create(task.agentType, agentConfig);
    if (!agent) {
      throw new Error(`Agent type ${task.agentType} not found or not registered`);
    }

    // Prepare input with previous results
    const input: AgentInput = {
      action: task.action,
      params: task.params,
      context: {
        ...context,
        previousResults,
        sharedData: {
          ...context.sharedData,
          previousTaskResults: Object.fromEntries(previousResults),
        },
      },
    };

    // Execute the agent
    const result = await agent.execute(input);
    return result;
  }

  /**
   * Evaluate a condition based on previous results
   */
  private evaluateCondition(
    condition: OrchestratorTask['condition'],
    previousResults: Map<string, AgentExecutionResult>
  ): boolean {
    if (!condition) return true;

    // Find the value to check
    let value: unknown;

    // Check if the field is in a previous result
    if (condition.field.includes('.')) {
      const [taskId, ...fieldParts] = condition.field.split('.');
      const result = previousResults.get(taskId);
      if (result?.output?.data) {
        value = this.getNestedValue(result.output.data as Record<string, unknown>, fieldParts.join('.'));
      }
    } else {
      // Check in shared data
      value = previousResults.get(condition.field)?.output?.data;
    }

    // Evaluate the condition
    return this.compareValues(value, condition.operator, condition.value);
  }

  /**
   * Get a nested value from an object
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
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
  }

  /**
   * Compare two values based on an operator
   */
  private compareValues(actual: unknown, operator: string, expected: unknown): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected;
      case 'ne':
        return actual !== expected;
      case 'gt':
        return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
      case 'lt':
        return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
      case 'gte':
        return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
      case 'lte':
        return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'contains':
        return Array.isArray(actual) && actual.includes(expected);
      default:
        return false;
    }
  }
}
