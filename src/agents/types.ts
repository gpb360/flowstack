/**
 * Multi-Agent System Types
 * Shared types for the agent system following FlowStack patterns
 */

import type { ModuleId } from '@/lib/registry';

// ============================================================================
// Core Agent Types
// ============================================================================

/**
 * Capabilities that agents can perform
 */
export type AgentCapability =
  | 'data_query'     // Query and retrieve data
  | 'data_mutate'    // Create, update, delete data
  | 'analysis'       // Analyze data and generate insights
  | 'generation'     // Generate content (copy, templates, etc.)
  | 'automation'     // Automate workflows and processes
  | 'coordination';  // Coordinate other agents (orchestrator)

/**
 * Current status of an agent
 */
export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed' | 'timeout';

/**
 * Categories of agents
 */
export type AgentCategory = 'crm' | 'marketing' | 'builder' | 'analytics' | 'workflows' | 'orchestrator';

/**
 * Types of agents in the system
 */
export type AgentType =
  | 'orchestrator'
  | 'crm'
  | 'marketing'
  | 'analytics'
  | 'builder'
  | 'workflow'
  | 'code_reviewer';

/**
 * Priority levels for agent execution
 */
export type AgentPriority = 'low' | 'normal' | 'high' | 'urgent';

// ============================================================================
// Agent Definition Types
// ============================================================================

/**
 * Definition of an agent type (metadata about an agent)
 */
export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  type: AgentType;
  capabilities: AgentCapability[];
  dependencies?: string[];
  requiresModules?: ModuleId[];
  maxConcurrency?: number;
  timeout?: number;
  isCore?: boolean;
  icon?: string;
  color?: string;
}

/**
 * Configuration for an agent instance
 */
export interface AgentConfig {
  organizationId: string;
  userId?: string;
  timeout?: number;
  retryMax?: number;
  retryDelay?: number;
  priority?: AgentPriority;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Agent Execution Types
// ============================================================================

/**
 * Input passed to an agent for execution
 */
export interface AgentInput {
  action: string;
  params: Record<string, unknown>;
  context?: AgentContext;
}

/**
 * Output returned by an agent after execution
 */
export interface AgentOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Context shared between agents in a workflow
 */
export interface AgentContext {
  organizationId: string;
  userId?: string;
  workflowExecutionId?: string;
  previousResults?: Map<string, unknown>;
  sharedData?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * Result of an agent execution
 */
export interface AgentExecutionResult {
  agentId: string;
  agentType: AgentType;
  status: AgentStatus;
  input: AgentInput;
  output: AgentOutput;
  startTime: number;
  endTime: number;
  duration: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Orchestrator Types
// ============================================================================

/**
 * Execution strategy for orchestrator tasks
 */
export type ExecutionStrategy = 'sequential' | 'parallel' | 'conditional';

/**
 * A single task definition for the orchestrator
 */
export interface OrchestratorTask {
  id: string;
  agentType: AgentType;
  action: string;
  params: Record<string, unknown>;
  dependsOn?: string[];  // Task IDs that must complete first
  condition?: {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'contains';
    value: unknown;
  };
  retryMax?: number;
  timeout?: number;
}

/**
 * Definition of an orchestrator workflow
 */
export interface OrchestratorWorkflow {
  id: string;
  name: string;
  description?: string;
  strategy: ExecutionStrategy;
  tasks: OrchestratorTask[];
  onError?: 'stop' | 'continue' | 'retry';
  maxRetries?: number;
  maxConcurrency?: number;
  enableRalphLoop?: boolean;
  ralphLoopConfig?: {
    enabled: boolean;
    maxRetries: number;
    validationAgent: string;
    retryDelay: number;
    onValidationFailure: 'stop' | 'retry' | 'continue';
  };
}

/**
 * Result of an orchestrator execution
 */
export interface OrchestratorResult {
  workflowId: string;
  status: AgentStatus;
  results: Map<string, AgentExecutionResult>;
  errors: Array<{ taskId: string; error: string }>;
  startTime: number;
  endTime: number;
  duration: number;
}

// ============================================================================
// Database Types (matches agents_schema.sql)
// ============================================================================

/**
 * Database row for agent_executions table
 */
export interface DbAgentExecution {
  id: string;
  organization_id: string;
  agent_id: string;
  agent_type: AgentType;
  workflow_execution_id?: string;
  status: AgentStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  metadata?: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Database row for orchestrator_tasks table
 */
export interface DbOrchestratorTask {
  id: string;
  organization_id: string;
  workflow_id?: string;
  task_definition: OrchestratorWorkflow;
  status: AgentStatus;
  execution_log: Record<string, unknown>[];
  context?: Record<string, unknown>;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Database row for agent_capabilities cache table
 */
export interface DbAgentCapability {
  agent_id: string;
  capabilities: AgentCapability[];
  version: number;
  updated_at: string;
}

// ============================================================================
// Agent Action Types (for workflow integration)
// ============================================================================

/**
 * Agent-specific actions that can be used in workflows
 */
export interface AgentActionDefinition {
  type: string;
  label: string;
  agentType: AgentType;
  description: string;
  category: 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow' | 'orchestrator';
  icon?: string;
  color?: string;
  config?: Record<string, unknown>;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * State for agent execution hook
 */
export interface AgentExecutionState {
  isExecuting: boolean;
  result: AgentExecutionResult | null;
  error: string | null;
  progress: number;
}

/**
 * State for orchestrator hook
 */
export interface OrchestratorState {
  isRunning: boolean;
  result: OrchestratorResult | null;
  error: string | null;
  currentTask: string | null;
  completedTasks: string[];
  progress: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error class for agent-related errors
 */
export class AgentError extends Error {
  public code: string;
  public agentId?: string;
  public originalError?: unknown;

  constructor(
    message: string,
    code: string,
    agentId?: string,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AgentError';
    this.code = code;
    this.agentId = agentId;
    this.originalError = originalError;
  }
}

/**
 * Error thrown when agent execution times out
 */
export class AgentTimeoutError extends AgentError {
  constructor(agentId: string, timeout: number) {
    super(
      `Agent ${agentId} timed out after ${timeout}ms`,
      'AGENT_TIMEOUT',
      agentId
    );
    this.name = 'AgentTimeoutError';
  }
}

/**
 * Error thrown when agent dependency is not met
 */
export class AgentDependencyError extends AgentError {
  constructor(agentId: string, missingDependency: string) {
    super(
      `Agent ${agentId} requires ${missingDependency} which is not available`,
      'AGENT_DEPENDENCY_ERROR',
      agentId
    );
    this.name = 'AgentDependencyError';
  }
}
