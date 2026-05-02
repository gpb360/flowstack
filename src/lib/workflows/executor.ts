/**
 * Workflow Executor - Main execution engine for FlowStack workflows
 * Handles workflow execution, node processing, and error handling
 */

import type {
  Workflow,
  WorkflowExecution,
  WorkflowNode,
  ActionResult,
  ExecutionLogEntry,
  RetryConfig
} from './types';
import { executeAction } from './actions';
import { evaluateCondition } from './logic';
import { supabase } from '@/lib/supabase';

export class WorkflowExecutor {
  private execution: WorkflowExecution;
  private workflow: Workflow;
  private context: Map<string, any>;

  constructor(workflow: Workflow, triggerData: Record<string, any>) {
    this.workflow = workflow;
    this.context = new Map(Object.entries(triggerData));

    this.execution = {
      id: crypto.randomUUID(),
      workflow_id: workflow.id,
      organization_id: workflow.organization_id,
      status: 'pending',
      started_at: new Date().toISOString(),
      trigger_data: triggerData,
      execution_log: [],
      input: { ...triggerData },
    };
  }

  /**
   * Execute the workflow from start to finish
   */
  async execute(): Promise<WorkflowExecution> {
    try {
      this.execution.status = 'running';
      await this.saveExecution();

      // Find trigger node and start from there
      const triggerNode = this.workflow.nodes.find(n => n.type === 'trigger');
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      await this.executeNode(triggerNode);

      // Follow the flow
      await this.followFlow(triggerNode.id);

      this.execution.status = 'completed';
      this.execution.completed_at = new Date().toISOString();
      this.execution.output = this.getContextAsObject();

      // Store output as a final log entry for visibility
      this.execution.execution_log.push({
        timestamp: new Date().toISOString(),
        node_id: '__workflow_output__',
        node_type: 'system',
        status: 'completed',
        output: this.execution.output,
      });

    } catch (error) {
      this.execution.status = 'failed';
      this.execution.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack_trace: error instanceof Error ? error.stack : undefined,
      };
    } finally {
      await this.saveExecution();
    }

    return this.execution;
  }

  /**
   * Follow the workflow flow from a given node
   */
  private async followFlow(nodeId: string): Promise<void> {
    const outgoingEdges = this.workflow.edges.filter(e => e.source === nodeId);

    for (const edge of outgoingEdges) {
      const targetNode = this.workflow.nodes.find(n => n.id === edge.target);
      if (!targetNode) continue;

      // Check if edge has a condition
      if (edge.condition) {
        const shouldExecute = this.evaluateEdgeCondition(edge.condition);
        if (!shouldExecute) continue;
      }

      // Handle different node types
      if (targetNode.type === 'parallel') {
        await this.executeParallelBranch(targetNode);
      } else if (targetNode.type === 'condition') {
        await this.executeCondition(targetNode);
      } else if (targetNode.type === 'delay') {
        await this.executeDelay(targetNode);
      } else if (targetNode.type === 'loop') {
        await this.executeLoop(targetNode);
      } else if (targetNode.type === 'end') {
        // End node reached
        break;
      } else {
        await this.executeNode(targetNode);
        await this.followFlow(targetNode.id);
      }
    }
  }

  /**
   * Execute a single node
   */
  public async executeNode(node: WorkflowNode, retryConfig?: RetryConfig, attemptNumber = 1): Promise<ActionResult> {
    const startTime = Date.now();
    this.execution.current_node_id = node.id;
    this.addLog(node, 'started');

    try {
      let result: ActionResult;

      switch (node.type) {
        case 'action':
          result = await this.executeActionNode(node);
          break;
        case 'trigger':
          result = { success: true, should_continue: true };
          break;
        default:
          result = { success: true, should_continue: true };
      }

      // Update context with result data
      if (result.data) {
        Object.entries(result.data).forEach(([key, value]) => {
          this.context.set(key, value);
        });
      }

      const duration = Date.now() - startTime;
      this.addLog(node, 'completed', { output: result.data, duration_ms: duration });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle retry logic
      if (retryConfig && attemptNumber < retryConfig.maxAttempts) {
        const delay = this.calculateRetryDelay(retryConfig, attemptNumber);
        await this.sleep(delay);
        return this.executeNode(node, retryConfig, attemptNumber + 1);
      }

      this.addLog(node, 'failed', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Execute an action node
   */
  private async executeActionNode(node: WorkflowNode): Promise<ActionResult> {
    const actionConfig = node.data as any;

    // Resolve variable references in config
    const resolvedConfig = this.resolveVariables(actionConfig.config);

    const result = await executeAction(
      actionConfig.actionType,
      resolvedConfig,
      this.execution,
      this.getContextAsObject()
    );

    return result;
  }

  /**
   * Execute a condition node
   */
  private async executeCondition(node: WorkflowNode): Promise<void> {
    const conditionData = node.data as any;
    const conditionResult = evaluateCondition(conditionData.conditions, this.getContextAsObject());

    this.context.set(`condition_${node.id}`, conditionResult);
    this.addLog(node, 'completed', { output: { result: conditionResult } });

    // Follow appropriate edges based on condition
    const outgoingEdges = this.workflow.edges.filter(e => e.source === node.id);

    for (const edge of outgoingEdges) {
      const shouldExecute = edge.condition === 'true' ? conditionResult : !conditionResult;
      if (shouldExecute) {
        const targetNode = this.workflow.nodes.find(n => n.id === edge.target);
        if (targetNode) {
          await this.executeNode(targetNode);
          await this.followFlow(targetNode.id);
        }
      }
    }
  }

  /**
   * Execute a delay node
   */
  private async executeDelay(node: WorkflowNode): Promise<void> {
    const delayData = node.data as any;
    const duration = this.parseDuration(delayData.duration, delayData.unit || 'milliseconds');

    this.addLog(node, 'started');
    await this.sleep(duration);
    this.addLog(node, 'completed', { duration_ms: duration });
  }

  /**
   * Execute parallel branches
   */
  private async executeParallelBranch(node: WorkflowNode): Promise<void> {
    const outgoingEdges = this.workflow.edges.filter(e => e.source === node.id);

    // Execute all branches in parallel
    const branchPromises = outgoingEdges.map(async (edge) => {
      const targetNode = this.workflow.nodes.find(n => n.id === edge.target);
      if (targetNode) {
        await this.executeNode(targetNode);
        await this.followFlow(targetNode.id);
      }
    });

    await Promise.all(branchPromises);
  }

  /**
   * Execute a loop node
   */
  private async executeLoop(node: WorkflowNode): Promise<void> {
    const loopData = node.data as any;
    const collectionPath = loopData.collection;
    const collection = this.getValueFromPath(collectionPath);

    if (!Array.isArray(collection)) {
      throw new Error(`Loop collection path ${collectionPath} does not resolve to an array`);
    }

    const maxIterations = loopData.maxIterations || collection.length;
    const iterations = collection.slice(0, maxIterations);

    for (let i = 0; i < iterations.length; i++) {
      this.context.set('loop_index', i);
      this.context.set('loop_item', iterations[i]);
      this.context.set('loop_item_first', i === 0);
      this.context.set('loop_item_last', i === iterations.length - 1);

      // Execute next node
      const outgoingEdges = this.workflow.edges.filter(e => e.source === node.id);
      for (const edge of outgoingEdges) {
        const targetNode = this.workflow.nodes.find(n => n.id === edge.target);
        if (targetNode) {
          await this.executeNode(targetNode);
          await this.followFlow(targetNode.id);
        }
      }
    }
  }

  /**
   * Evaluate edge condition
   */
  private evaluateEdgeCondition(condition: string): boolean {
    // Simple boolean evaluation for now
    // Can be extended to support complex expressions
    const value = this.getValueFromPath(condition);
    return Boolean(value);
  }

  /**
   * Resolve variable references in config
   */
  private resolveVariables(config: Record<string, any>): Record<string, any> {
    const resolved: Record<string, any> = {};

    for (const [key, value] of Object.entries(config)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Variable reference
        const path = value.slice(2, -2).trim();
        resolved[key] = this.getValueFromPath(path);
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = this.resolveVariables(value);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }

  /**
   * Get value from dot-notation path in context
   */
  private getValueFromPath(path: string): any {
    const parts = path.split('.');
    let value = this.getContextAsObject();

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Add execution log entry
   */
  private addLog(node: WorkflowNode, status: ExecutionLogEntry['status'], extra?: Partial<ExecutionLogEntry>): void {
    const logEntry: ExecutionLogEntry = {
      timestamp: new Date().toISOString(),
      node_id: node.id,
      node_type: node.type,
      status,
      ...extra,
    };
    this.execution.execution_log.push(logEntry);
  }

  /**
   * Get context as plain object
   */
  private getContextAsObject(): Record<string, any> {
    return Object.fromEntries(this.context);
  }

  /**
   * Parse duration to milliseconds
   */
  private parseDuration(value: number, unit: string): number {
    const multipliers: Record<string, number> = {
      milliseconds: 1,
      seconds: 1000,
      minutes: 60000,
      hours: 3600000,
      days: 86400000,
    };
    return value * (multipliers[unit] || 1);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(config: RetryConfig, attemptNumber: number): number {
    switch (config.backoffType) {
      case 'fixed':
        return config.initialDelay;
      case 'exponential':
        const delay = config.initialDelay * Math.pow(2, attemptNumber - 1);
        return config.maxDelay ? Math.min(delay, config.maxDelay) : delay;
      case 'linear':
        return config.initialDelay * attemptNumber;
      default:
        return config.initialDelay;
    }
  }

  /**
   * Save execution state to Supabase
   */
  private async saveExecution(): Promise<void> {
    try {
      const executionRow = {
        id: this.execution.id,
        workflow_id: this.execution.workflow_id,
        organization_id: this.execution.organization_id,
        status: this.execution.status,
        started_at: this.execution.started_at,
        completed_at: this.execution.completed_at || null,
        trigger_data: {
          ...this.execution.trigger_data,
          input: this.execution.input,
        },
        execution_log: this.execution.execution_log,
        error: this.execution.error || null,
      };

      const { error } = await (supabase
        .from('workflow_executions') as any)
        .upsert(executionRow, { onConflict: 'id' });

      if (error) {
        console.error('[WorkflowExecutor] Failed to save execution:', error.message);
      }
    } catch (err) {
      // Don't let save failures crash the workflow execution
      console.error('[WorkflowExecutor] Save error:', err);
    }
  }
}

/**
 * Execute a workflow by ID
 */
export async function executeWorkflow(
  workflow: Workflow,
  triggerData: Record<string, any>
): Promise<WorkflowExecution> {
  const executor = new WorkflowExecutor(workflow, triggerData);
  return executor.execute();
}

/**
 * Execute a workflow node independently (for testing)
 */
export async function executeWorkflowNode(
  workflow: Workflow,
  nodeId: string,
  context: Record<string, any>
): Promise<ActionResult> {
  const node = workflow.nodes.find(n => n.id === nodeId);
  if (!node) {
    throw new Error(`Node ${nodeId} not found in workflow`);
  }

  const executor = new WorkflowExecutor(workflow, context);
  return executor.executeNode(node);
}
