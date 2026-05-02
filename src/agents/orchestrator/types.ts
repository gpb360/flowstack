/**
 * Orchestrator Types
 * Shared types for the orchestrator agent
 */

import type { AgentContext, OrchestratorTask, AgentExecutionResult } from '../types';

// ============================================================================
// Ralph Loop Types
// ============================================================================

/**
 * Ralph Loop Configuration
 */
export interface RalphLoopConfig {
  enabled: boolean;
  maxRetries: number; // Default: 5
  validationAgent: string; // 'code_reviewer'
  retryDelay: number; // ms between retries
  onValidationFailure: 'stop' | 'retry' | 'continue';
}

/**
 * Ralph Loop Execution State
 */
export interface RalphLoopState {
  attemptNumber: number;
  validationResults: Array<{
    attempt: number;
    valid: boolean;
    errors: string[];
    warnings: string[];
    timestamp: number;
  }>;
  currentStatus: 'pending' | 'validating' | 'passed' | 'failed' | 'retrying';
}

/**
 * Orchestrator Task with Ralph Loop
 */
export interface OrchestratorTaskWithRalphLoop extends OrchestratorTask {
  enableRalphLoop?: boolean;
  ralphLoopConfig?: Partial<RalphLoopConfig>;
}

// ============================================================================
// Execution Strategy Types
// ============================================================================

/**
 * Configuration for sequential execution
 */
export interface SequentialExecutionConfig {
  tasks: OrchestratorTask[];
  stopOnError: boolean;
  maxRetries: number;
  context: AgentContext;
  ralphLoopConfig?: RalphLoopConfig;
}

/**
 * Configuration for parallel execution
 */
export interface ParallelExecutionConfig {
  tasks: OrchestratorTask[];
  maxConcurrency: number;
  stopOnError: boolean;
  maxRetries: number;
  context: AgentContext;
  ralphLoopConfig?: RalphLoopConfig;
}

/**
 * Configuration for conditional execution
 */
export interface ConditionalExecutionConfig {
  task: OrchestratorTask;
  context: AgentContext;
  previousResults: Map<string, AgentExecutionResult>;
}

// ============================================================================
// Execution Result Types
// ============================================================================

/**
 * Result of a single task execution
 */
export interface TaskExecutionResult {
  taskId: string;
  success: boolean;
  result: AgentExecutionResult;
  error?: string;
  validationPassed?: boolean;
  validationHistory?: RalphLoopState['validationResults'];
}

/**
 * State of the orchestrator during execution
 */
export interface OrchestratorExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentTaskIndex: number;
  completedTasks: Set<string>;
  failedTasks: Set<string>;
  results: Map<string, AgentExecutionResult>;
  errors: Array<{ taskId: string; error: string }>;
  startTime: number;
  context: AgentContext;
  ralphLoopState?: Map<string, RalphLoopState>;
}
