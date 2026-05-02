/**
 * Sequential Executor
 * Executes orchestrator tasks one after another, passing context between steps
 */

import type {
  OrchestratorTask,
  AgentInput,
  AgentContext,
  AgentExecutionResult,
} from '../../types';
import type { SequentialExecutionConfig } from '../types';
import { agentFactory } from '../../agents/BaseAgent';
import { RalphLoopExecutor } from './RalphLoopExecutor';

// ============================================================================
// Sequential Executor
// ============================================================================

/**
 * Executes tasks sequentially, where each task can use results from previous tasks
 * Supports Ralph loop validation for code quality assurance
 */
export class SequentialExecutor {
  private config: SequentialExecutionConfig;
  private ralphLoopExecutor?: RalphLoopExecutor;

  constructor(config: SequentialExecutionConfig) {
    this.config = config;

    // Initialize Ralph loop executor if configured
    if (this.config.ralphLoopConfig?.enabled) {
      this.ralphLoopExecutor = new RalphLoopExecutor(this.config.ralphLoopConfig);
    }
  }

  /**
   * Execute all tasks sequentially
   */
  async execute(): Promise<{
    results: Map<string, AgentExecutionResult>;
    errors: Array<{ taskId: string; error: string }>;
    success: boolean;
  }> {
    const results = new Map<string, AgentExecutionResult>();
    const errors: Array<{ taskId: string; error: string }> = [];
    let success = true;

    // Execute tasks one by one
    for (const task of this.config.tasks) {
      // Check if task has dependencies
      if (task.dependsOn && task.dependsOn.length > 0) {
        const dependenciesMet = task.dependsOn.every(depId => results.has(depId));
        if (!dependenciesMet) {
          const error = `Task ${task.id} has unmet dependencies: ${task.dependsOn.join(', ')}`;
          errors.push({ taskId: task.id, error });
          if (this.config.stopOnError) {
            success = false;
            break;
          }
          continue;
        }
      }

      // Check condition if present
      if (task.condition && !this.evaluateCondition(task.condition, results)) {
        // Condition not met, skip this task
        continue;
      }

      try {
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
              break;
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
            break;
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        errors.push({ taskId: task.id, error });

        if (this.config.stopOnError) {
          success = false;
          break;
        }
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
