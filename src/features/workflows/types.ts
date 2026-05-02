import { type Node, type Edge } from '@xyflow/react';

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  trigger_definitions: TriggerDefinition[];
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
}

export type TriggerType = 
  | 'crm:contact_created' 
  | 'crm:contact_updated' 
  | 'form:submission' 
  | 'schedule:cron' 
  | 'webhook:incoming';

export interface TriggerDefinition {
  id: string;
  type: TriggerType;
  config: Record<string, any>;
}

export type ActionType =
  | 'crm:create_contact'
  | 'crm:update_contact'
  | 'communication:send_email'
  | 'communication:send_sms'
  | 'logic:delay'
  | 'logic:condition'
  // Agent action types
  | 'agent:orchestrate'
  | 'agent:route'
  | 'agent:crm_find'
  | 'agent:crm_create'
  | 'agent:crm_update'
  | 'agent:crm_enrich'
  | 'agent:crm_score'
  | 'agent:crm_duplicates'
  | 'agent:crm_suggest'
  | 'agent:marketing_generate'
  | 'agent:marketing_segment'
  | 'agent:marketing_optimize'
  | 'agent:marketing_analyze'
  | 'agent:marketing_template'
  | 'agent:marketing_personalize'
  | 'agent:analytics_report'
  | 'agent:analytics_trends'
  | 'agent:analytics_forecast'
  | 'agent:analytics_anomaly'
  | 'agent:analytics_dashboard'
  | 'agent:builder_layout'
  | 'agent:builder_copy'
  | 'agent:builder_optimize'
  | 'agent:builder_variant'
  | 'agent:builder_analyze'
  | 'agent:workflow_suggest'
  | 'agent:workflow_optimize'
  | 'agent:workflow_bottleneck'
  | 'agent:workflow_generate';

// Data types for specific nodes
export interface ActionNodeData extends Record<string, unknown> {
  label: string;
  actionType: ActionType;
  config: Record<string, any>;
}

// Agent-specific node data
export interface AgentNodeData extends Record<string, unknown> {
  label: string;
  actionType: ActionType;
  agentType: 'orchestrator' | 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow';
  agentAction: string;
  config: Record<string, any>;
}
