/**
 * Core workflow execution types for FlowStack
 * This file defines the complete type system for workflow automation
 */

import { type Node, type Edge } from '@xyflow/react';

// ============================================================================
// WORKFLOW DEFINITIONS
// ============================================================================

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export type TriggerType =
  | 'webhook:incoming'          // HTTP webhook trigger
  | 'schedule:cron'             // Scheduled/cron trigger
  | 'crm:contact_created'       // CRM: New contact
  | 'crm:contact_updated'       // CRM: Contact updated
  | 'crm:deal_stage_changed'    // CRM: Deal moved
  | 'form:submission'           // Form submitted
  | 'marketing:email_opened'    // Email opened
  | 'marketing:email_clicked'   // Email link clicked
  | 'marketing:campaign_sent'   // Campaign completed
  | 'builder:page_published'    // Page published
  | 'manual';                   // Manual trigger from UI

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: TriggerConfig;
  enabled: boolean;
}

export type TriggerConfig =
  | WebhookTriggerConfig
  | ScheduleTriggerConfig
  | EventTriggerConfig
  | ManualTriggerConfig;

export interface WebhookTriggerConfig {
  webhook_url?: string;         // Auto-generated URL
  secret?: string;              // Optional secret for verification
  method?: 'POST' | 'GET' | 'PUT';
}

export interface ScheduleTriggerConfig {
  cron: string;                 // Cron expression (e.g., "0 9 * * *")
  timezone?: string;            // IANA timezone (default: UTC)
}

export interface EventTriggerConfig {
  filters?: Record<string, any>; // Event-specific filters
  debounce_seconds?: number;     // Debounce window
}

export interface ManualTriggerConfig {
  allowed_roles?: string[];      // Roles that can trigger
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export type ActionType =
  // CRM Actions
  | 'crm:create_contact'
  | 'crm:update_contact'
  | 'crm:delete_contact'
  | 'crm:create_note'
  | 'crm:change_deal_stage'
  | 'crm:assign_owner'
  // Communication Actions
  | 'communication:send_email'
  | 'communication:send_sms'
  // Marketing Actions
  | 'marketing:add_to_sequence'
  | 'marketing:remove_from_sequence'
  | 'marketing:add_tag'
  | 'marketing:remove_tag'
  | 'marketing:send_campaign'
  // Builder Actions
  | 'builder:publish_page'
  | 'builder:update_site'
  // Logic Actions
  | 'logic:delay'
  | 'logic:condition'
  | 'logic:parallel'
  | 'logic:merge'
  | 'logic:loop'
  // Data Actions
  | 'data:transform'
  | 'data:filter'
  | 'data:map'
  | 'data:aggregate'
  // HTTP Actions
  | 'http:request'
  // AI Agent Actions
  | 'agent:orchestrate'
  | 'agent:route'
  | 'agent:crm_find'
  | 'agent:crm_create'
  | 'agent:crm_update'
  | 'agent:crm_enrich'
  | 'agent:crm_score'
  | 'agent:marketing_generate'
  | 'agent:marketing_segment'
  | 'agent:analytics_report'
  | 'agent:workflow_suggest';

export interface WorkflowNode extends Node<NodeData> {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'parallel' | 'merge' | 'loop' | 'end';
}

export type NodeData =
  | TriggerNodeData
  | ActionNodeData
  | ConditionNodeData
  | DelayNodeData
  | ParallelNodeData
  | MergeNodeData
  | LoopNodeData
  | EndNodeData;

export interface BaseNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
}

export interface TriggerNodeData extends BaseNodeData {
  trigger: WorkflowTrigger;
}

export interface ActionNodeData extends BaseNodeData {
  actionType: ActionType;
  config: ActionConfig;
  retryConfig?: RetryConfig;
  timeout?: number; // milliseconds
}

export type ActionConfig = Record<string, any>;

export interface ConditionNodeData extends BaseNodeData {
  conditions: ConditionGroup;
}

export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: Condition[];
}

export interface Condition {
  field: string;          // Field path (e.g., "contact.email")
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface DelayNodeData extends BaseNodeData {
  duration: number;       // milliseconds
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days';
}

export interface ParallelNodeData extends BaseNodeData {
  branches: number;       // Number of parallel branches
}

export interface MergeNodeData extends BaseNodeData {
  mode: 'wait_all' | 'wait_first' | 'wait_any';
}

export interface LoopNodeData extends BaseNodeData {
  collection: string;     // Field path to array
  maxIterations?: number;
}

export interface EndNodeData extends BaseNodeData {
  output?: Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffType: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;   // milliseconds
  maxDelay?: number;      // milliseconds (for exponential)
}

export interface WorkflowEdge extends Edge<NodeData> {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;     // For conditional branching (edge label)
}

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'retrying';

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  organization_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at?: string;
  trigger_data: Record<string, any>;
  execution_log: ExecutionLogEntry[];
  error?: ExecutionError;
  input: Record<string, any>;
  output?: Record<string, any>;
  current_node_id?: string;
  retry_count?: number;
}

export interface ExecutionLogEntry {
  timestamp: string;
  node_id: string;
  node_type: string;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  duration_ms?: number;
}

export interface ExecutionError {
  message: string;
  code?: string;
  node_id?: string;
  stack_trace?: string;
  details?: Record<string, any>;
}

// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

export interface QueueItem {
  id: string;
  workflow_id: string;
  execution_id: string;
  organization_id: string;
  priority: number;        // Lower = higher priority
  scheduled_at: string;
  status: 'queued' | 'processing' | 'failed' | 'completed';
  attempt_count: number;
  max_attempts: number;
  error?: ExecutionError;
}

export type QueuePriority = 'low' | 'normal' | 'high' | 'critical';

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookEvent {
  id: string;
  workflow_id: string;
  organization_id: string;
  trigger_id: string;
  payload: Record<string, any>;
  headers: Record<string, string>;
  received_at: string;
  processed: boolean;
}

// ============================================================================
// ACTION EXECUTION RESULTS
// ============================================================================

export interface ActionResult {
  success: boolean;
  data?: Record<string, any>;
  error?: string;
  next_node_id?: string;
  should_continue: boolean;
}

// ============================================================================
// WORKFLOW VALIDATION
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  node_id: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  node_id: string;
  message: string;
  code: string;
}

// ============================================================================
// EXPORTS
// ============================================================================

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  trigger_definitions: WorkflowTrigger[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}
