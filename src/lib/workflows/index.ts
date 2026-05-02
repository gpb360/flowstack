/**
 * FlowStack Workflow Automation Library
 * Complete workflow execution system
 *
 * This library provides:
 * - Workflow execution engine
 * - Trigger system (webhooks, scheduled, events)
 * - Action registry and execution
 * - Queue management for async workflows
 * - Retry mechanisms and error handling
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core workflow types
  Workflow,
  WorkflowStatus,
  WorkflowTrigger,
  TriggerType,
  TriggerConfig,
  WebhookTriggerConfig,
  ScheduleTriggerConfig,
  EventTriggerConfig,
  ManualTriggerConfig,

  // Action types
  ActionType,
  WorkflowNode,
  NodeData,
  BaseNodeData,
  TriggerNodeData,
  ActionNodeData,
  ConditionNodeData,
  DelayNodeData,
  ParallelNodeData,
  MergeNodeData,
  LoopNodeData,
  EndNodeData,
  ActionConfig,
  RetryConfig,
  WorkflowEdge,

  // Execution types
  ExecutionStatus,
  WorkflowExecution,
  ExecutionLogEntry,
  ExecutionError,

  // Queue types
  QueueItem,
  QueuePriority,

  // Webhook types
  WebhookEvent,

  // Action result types
  ActionResult,

  // Validation types
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';

// ============================================================================
// EXECUTOR EXPORTS
// ============================================================================

export {
  WorkflowExecutor,
  executeWorkflow,
  executeWorkflowNode,
} from './executor';

// ============================================================================
// TRIGGER EXPORTS
// ============================================================================

export {
  TriggerManager,
  triggerManualExecution,
  initializeOrganizationTriggers,
  generateWebhookUrl,
  validateWebhookRequest,
  storeWebhookEvent,
  processWebhookEvent,
  checkTriggerFilters,
  validateTrigger,
} from './triggers';

// ============================================================================
// ACTION EXPORTS
// ============================================================================

export {
  executeAction,
  registerAction,
  getRegisteredActions,
  hasAction,
} from './actions';

// ============================================================================
// QUEUE EXPORTS
// ============================================================================

export {
  WorkflowQueue,
  getQueue,
  initializeQueue,
  queueWorkflow,
  moveToDeadLetterQueue,
  getDeadLetterItems,
  restoreFromDeadLetterQueue,
} from './queue';

// ============================================================================
// LOGIC/UTILITIES EXPORTS
// ============================================================================

export {
  evaluateCondition,
  getValueAtPath,
  setValueAtPath,
  transformData,
  filterArray,
  mapArray,
  aggregateArray,
  deepMerge,
  interpolateTemplate,
  validateData,
} from './logic';

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

import { supabase } from '../supabase';
import type { Workflow } from './types';

/**
 * Fetch a workflow by ID
 */
export async function getWorkflow(workflowId: string): Promise<Workflow | null> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('id', workflowId)
    .single();

  if (error || !data) return null;
  return data as Workflow;
}

/**
 * Fetch all workflows for an organization
 */
export async function getWorkflows(organizationId: string): Promise<Workflow[]> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Workflow[];
}

/**
 * Fetch active workflows for an organization
 */
export async function getActiveWorkflows(organizationId: string): Promise<Workflow[]> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Workflow[];
}

/**
 * Create a new workflow
 */
export async function createWorkflow(
  organizationId: string,
  workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<Workflow> {
  const { data, error } = await (supabase
    .from('workflows') as any)
    .insert({
      organization_id: organizationId,
      name: workflow.name,
      description: workflow.description,
      status: workflow.status,
      trigger_definitions: workflow.trigger_definitions,
      nodes: workflow.nodes,
      edges: workflow.edges,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Workflow;
}

/**
 * Update a workflow
 */
export async function updateWorkflow(
  workflowId: string,
  updates: Partial<Workflow>
): Promise<Workflow> {
  const { data, error } = await (supabase
    .from('workflows') as any)
    .update({
      name: updates.name,
      description: updates.description,
      status: updates.status,
      trigger_definitions: updates.trigger_definitions,
      nodes: updates.nodes,
      edges: updates.edges,
    })
    .eq('id', workflowId)
    .select()
    .single();

  if (error) throw error;
  return data as Workflow;
}

/**
 * Delete a workflow
 */
export async function deleteWorkflow(workflowId: string): Promise<void> {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', workflowId);

  if (error) throw error;
}

/**
 * Activate a workflow
 */
export async function activateWorkflow(workflowId: string): Promise<Workflow> {
  return updateWorkflow(workflowId, { status: 'active' });
}

/**
 * Pause a workflow
 */
export async function pauseWorkflow(workflowId: string): Promise<Workflow> {
  return updateWorkflow(workflowId, { status: 'paused' });
}

// ============================================================================
// EXECUTION HISTORY
// ============================================================================

import type { WorkflowExecution } from './types';

/**
 * Fetch execution history for a workflow
 */
export async function getWorkflowExecutions(
  workflowId: string,
  limit: number = 50
): Promise<WorkflowExecution[]> {
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as WorkflowExecution[];
}

/**
 * Fetch a single execution by ID
 */
export async function getExecution(executionId: string): Promise<WorkflowExecution | null> {
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('*')
    .eq('id', executionId)
    .single();

  if (error || !data) return null;
  return data as WorkflowExecution;
}

/**
 * Get execution statistics for a workflow
 */
export async function getWorkflowStats(workflowId: string): Promise<{
  total: number;
  successful: number;
  failed: number;
  running: number;
}> {
  const { data, error } = await supabase
    .from('workflow_executions')
    .select('status')
    .eq('workflow_id', workflowId);

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    successful: 0,
    failed: 0,
    running: 0,
  };

  for (const execution of data || []) {
    switch ((execution as any).status) {
      case 'completed':
        stats.successful++;
        break;
      case 'failed':
        stats.failed++;
        break;
      case 'running':
        stats.running++;
        break;
    }
  }

  return stats;
}

// ============================================================================
// WEBHOOK HELPERS
// ============================================================================

/**
 * Get webhook URL for a workflow trigger
 */
export function getWebhookUrl(workflowId: string, triggerId: string): string {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook/${workflowId}/${triggerId}`;
}

/**
 * Trigger a workflow manually
 */
export async function triggerWorkflow(
  workflowId: string,
  triggerData: Record<string, any>
): Promise<void> {
  // This would typically call the Edge Function
  // For now, we'll use the client-side executor
  const workflow = await getWorkflow(workflowId);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const { executeWorkflow } = await import('./executor');
  await executeWorkflow(workflow, triggerData);
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate a workflow definition
 */
export function validateWorkflow(workflow: Workflow): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!workflow.name) {
    errors.push('Workflow name is required');
  }

  if (!workflow.trigger_definitions || workflow.trigger_definitions.length === 0) {
    errors.push('Workflow must have at least one trigger');
  }

  // Check for nodes
  if (!workflow.nodes || workflow.nodes.length === 0) {
    warnings.push('Workflow has no nodes');
  }

  // Check for trigger node
  const hasTrigger = workflow.nodes.some(n => n.type === 'trigger');
  if (!hasTrigger) {
    warnings.push('Workflow has no trigger node');
  }

  // Check for isolated nodes (no edges)
  const connectedNodeIds = new Set<string>();
  workflow.edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const isolatedNodes = workflow.nodes.filter(n => !connectedNodeIds.has(n.id));
  if (isolatedNodes.length > 0) {
    warnings.push(`${isolatedNodes.length} node(s) are not connected`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// TESTING HELPERS
// ============================================================================

/**
 * Execute a workflow in test mode (dry run)
 * This validates the workflow without actually executing actions
 */
export async function testWorkflow(workflow: Workflow): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  executionPlan: string[];
}> {
  const validation = validateWorkflow(workflow);
  const executionPlan: string[] = [];

  // Build execution plan
  const triggerNode = workflow.nodes.find(n => n.type === 'trigger');
  if (triggerNode) {
    executionPlan.push(`Start: ${triggerNode.data.label || 'Trigger'}`);

    // Follow edges to build plan
    const visited = new Set<string>();
    const queue = [triggerNode.id];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      const outgoingEdges = workflow.edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        const targetNode = workflow.nodes.find(n => n.id === edge.target);
        if (targetNode) {
          executionPlan.push(`→ ${targetNode.data.label || targetNode.type}`);
          queue.push(targetNode.id);
        }
      }
    }
  }

  return {
    ...validation,
    executionPlan,
  };
}
