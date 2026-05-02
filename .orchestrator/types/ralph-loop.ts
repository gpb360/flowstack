/**
 * Ralph Loop Configuration for Top-Level Orchestrator
 *
 * This file defines the TypeScript types for the Ralph Loop validation system
 * used in the .orchestrator multi-agent build coordination system.
 */

/**
 * Ralph Loop configuration
 */
export interface RalphLoopConfig {
  /** Whether Ralph Loop validation is enabled */
  enabled: boolean;
  /** Maximum number of validation retry attempts */
  maxRetries: number;
  /** Agent ID to delegate validation to (typically 'code_reviewer') */
  validationAgent: string;
  /** Delay between retry attempts in milliseconds */
  retryDelay: number;
  /** Behavior when validation fails */
  onValidationFailure: 'stop' | 'retry' | 'continue';
}

/**
 * Ralph Loop state during validation
 */
export interface RalphLoopState {
  /** Current attempt number (1-based) */
  attemptNumber: number;
  /** History of all validation attempts */
  validationResults: ValidationResult[];
  /** Current validation status */
  currentStatus: RalphLoopStatus;
  /** Timestamp of last validation attempt */
  lastValidationAt?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Status of Ralph Loop validation
 */
export type RalphLoopStatus =
  | 'pending'       // Validation not yet started
  | 'validating'    // Validation in progress
  | 'passed'        // Validation passed successfully
  | 'failed'        // Validation failed after all retries
  | 'retrying';     // Retry attempt scheduled

/**
 * Result of a single validation attempt
 */
export interface ValidationResult {
  /** Agent being validated */
  agent: string;
  /** Attempt number */
  attempt: number;
  /** Whether validation passed */
  valid: boolean;
  /** Error messages (blockers) */
  errors: string[];
  /** Warning messages (non-blockers) */
  warnings: string[];
  /** Improvement suggestions */
  suggestions: string[];
  /** Timestamp of validation */
  timestamp: number;
  /** Duration of validation in milliseconds */
  duration?: number;
}

/**
 * Result of agent-level validation (Inner Ralph Loop)
 */
export interface AgentValidationResult {
  /** Agent ID (e.g., 'A1', 'A2', etc.) */
  agentId: string;
  /** Agent name */
  agentName: string;
  /** Whether validation passed */
  valid: boolean;
  /** Error messages (blockers) */
  errors: string[];
  /** Warning messages (non-blockers) */
  warnings: string[];
  /** Improvement suggestions */
  suggestions: string[];
  /** Files validated */
  filesValidated: string[];
  /** Lines of code reviewed */
  linesReviewed: number;
  /** Timestamp of validation */
  timestamp: number;
  /** Validation duration in milliseconds */
  duration: number;
}

/**
 * Result of checkpoint-level validation (Outer Ralph Loop)
 */
export interface CheckpointValidationResult {
  /** Phase number (0-4) */
  phase: number;
  /** Phase name */
  phaseName: string;
  /** Whether overall checkpoint passed */
  valid: boolean;
  /** Results for each agent in the phase */
  agentResults: AgentValidationResult[];
  /** Whether integration tests passed */
  integrationTestsPassed: boolean;
  /** Whether performance benchmarks were met */
  performanceBenchmarksMet: boolean;
  /** Whether documentation is complete */
  documentationComplete: boolean;
  /** Overall error messages */
  errors: string[];
  /** Overall warning messages */
  warnings: string[];
  /** Overall suggestions */
  suggestions: string[];
  /** Timestamp of checkpoint validation */
  timestamp: number;
  /** Validation duration in milliseconds */
  duration: number;
}

/**
 * Ralph Loop validation request
 */
export interface RalphLoopValidationRequest {
  /** Agent or task to validate */
  target: string;
  /** Type of validation */
  validationType: 'agent' | 'checkpoint';
  /** Attempt number */
  attemptNumber: number;
  /** Context for validation */
  context: {
    /** Phase number */
    phase?: number;
    /** Files to validate */
    files?: string[];
    /** Additional context */
    metadata?: Record<string, unknown>;
  };
}

/**
 * Ralph Loop validation response
 */
export interface RalphLoopValidationResponse {
  /** Whether validation passed */
  valid: boolean;
  /** Error messages */
  errors: string[];
  /** Warning messages */
  warnings: string[];
  /** Suggestions */
  suggestions: string[];
  /** Whether to retry */
  shouldRetry: boolean;
  /** Retry feedback */
  retryFeedback?: string;
  /** Timestamp of validation */
  timestamp: number;
  /** Validation duration in milliseconds */
  duration: number;
}

/**
 * Ralph Loop executor configuration
 */
export interface RalphLoopExecutorConfig {
  /** Ralph Loop configuration */
  ralphConfig: RalphLoopConfig;
  /** Validation agent instance */
  validationAgent: CodeReviewerAgent;
  /** Logger instance */
  logger: RalphLoopLogger;
}

/**
 * Code Reviewer Agent interface
 */
export interface CodeReviewerAgent {
  /** Agent ID */
  id: string;
  /** Agent name */
  name: string;
  /** Validate agent work */
  validateAgent(agentId: string, context: ValidationContext): Promise<AgentValidationResult>;
  /** Validate checkpoint */
  validateCheckpoint(phase: number, agents: string[], context: ValidationContext): Promise<CheckpointValidationResult>;
}

/**
 * Validation context
 */
export interface ValidationContext {
  /** Phase number */
  phase: number;
  /** Working directory */
  workingDirectory: string;
  /** Files to validate */
  files?: string[];
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Ralph Loop logger interface
 */
export interface RalphLoopLogger {
  /** Log validation start */
  logStart(agent: string, attempt: number): void;
  /** Log validation result */
  logResult(result: ValidationResult): void;
  /** Log retry */
  logRetry(agent: string, attempt: number, delay: number): void;
  /** Log failure */
  logFailure(agent: string, attempts: number, error: string): void;
  /** Log checkpoint validation */
  logCheckpoint(phase: number, result: CheckpointValidationResult): void;
}

/**
 * Validation rule for specific agent
 */
export interface AgentValidationRule {
  /** Agent ID this rule applies to */
  agentId: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (context: ValidationContext) => Promise<RuleResult>;
  /** Severity of failure */
  severity: 'error' | 'warning' | 'suggestion';
  /** Whether this rule is enabled */
  enabled: boolean;
}

/**
 * Result of a validation rule
 */
export interface RuleResult {
  /** Whether rule passed */
  passed: boolean;
  /** Message if rule failed */
  message?: string;
  /** Suggested fix */
  suggestion?: string;
  /** Location of issue (file:line) */
  location?: string;
}

/**
 * Checkpoint validation rule
 */
export interface CheckpointValidationRule {
  /** Phase this rule applies to */
  phase: number;
  /** Rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Validation function */
  validate: (context: CheckpointValidationContext) => Promise<RuleResult>;
  /** Severity of failure */
  severity: 'error' | 'warning' | 'suggestion';
  /** Whether this rule is enabled */
  enabled: boolean;
}

/**
 * Checkpoint validation context
 */
export interface CheckpointValidationContext extends ValidationContext {
  /** Agents in this checkpoint */
  agents: string[];
  /** Agent validation results */
  agentResults: AgentValidationResult[];
  /** Integration test results */
  integrationTestResults?: TestResult[];
  /** Performance benchmark results */
  benchmarkResults?: BenchmarkResult[];
}

/**
 * Test result
 */
export interface TestResult {
  /** Test name */
  name: string;
  /** Whether test passed */
  passed: boolean;
  /** Test duration in milliseconds */
  duration: number;
  /** Error message if failed */
  error?: string;
}

/**
 * Performance benchmark result
 */
export interface BenchmarkResult {
  /** Benchmark name */
  name: string;
  /** Expected maximum duration in milliseconds */
  expected: number;
  /** Actual duration in milliseconds */
  actual: number;
  /** Whether benchmark passed */
  passed: boolean;
  /** Percentage of expected */
  percentage: number;
}

/**
 * Ralph Loop statistics
 */
export interface RalphLoopStatistics {
  /** Total validations performed */
  totalValidations: number;
  /** Validations passed */
  validationsPassed: number;
  /** Validations failed */
  validationsFailed: number;
  /** Average attempts per validation */
  averageAttempts: number;
  /** Total retry attempts */
  totalRetries: number;
  /** Average validation duration in milliseconds */
  averageDuration: number;
  /** Validation success rate */
  successRate: number;
  /** Breakdown by agent */
  byAgent: Record<string, AgentStatistics>;
}

/**
 * Statistics for a specific agent
 */
export interface AgentStatistics {
  /** Agent ID */
  agentId: string;
  /** Total validations for this agent */
  totalValidations: number;
  /** Validations passed */
  validationsPassed: number;
  /** Validations failed */
  validationsFailed: number;
  /** Average attempts */
  averageAttempts: number;
  /** Success rate */
  successRate: number;
}

/**
 * Ralph Loop event types
 */
export type RalphLoopEvent =
  | { type: 'validation_start'; agent: string; attempt: number }
  | { type: 'validation_complete'; result: ValidationResult }
  | { type: 'validation_retry'; agent: string; attempt: number; delay: number }
  | { type: 'validation_failed'; agent: string; attempts: number; error: string }
  | { type: 'checkpoint_start'; phase: number; agents: string[] }
  | { type: 'checkpoint_complete'; result: CheckpointValidationResult };

/**
 * Ralph Loop event handler
 */
export interface RalphLoopEventHandler {
  /** Handle a Ralph Loop event */
  handle(event: RalphLoopEvent): void | Promise<void>;
}

/**
 * Default Ralph Loop configuration
 */
export const DEFAULT_RALPH_LOOP_CONFIG: RalphLoopConfig = {
  enabled: true,
  maxRetries: 5,
  validationAgent: 'code_reviewer',
  retryDelay: 1000,
  onValidationFailure: 'retry',
} as const;

/**
 * All agent IDs that use Ralph Loop validation
 */
export const RALPH_LOOP_AGENTS = [
  'A1', // Database Schema Agent
  'A2', // TypeScript Types Agent
  'A3', // Workflow Engine Agent
  'A4', // AI Integration Agent
  'A5', // Dashboard Feature Agent
  'A6', // CRM Feature Agent
  'A7', // Builder Feature Agent
  'A8', // Workflows Feature Agent
  'A9', // Marketing Feature Agent
  'A10', // Analytics Feature Agent
] as const;

/**
 * Phase names
 */
export const PHASE_NAMES = [
  'Infrastructure Setup',
  'Foundation Features',
  'Automation Engine',
  'Marketing Features',
  'Extended Features',
] as const;

/**
 * Agent names
 */
export const AGENT_NAMES: Record<string, string> = {
  'A0': 'Code Reviewer Agent',
  'A1': 'Database Schema Agent',
  'A2': 'TypeScript Types Agent',
  'A3': 'Workflow Engine Agent',
  'A4': 'AI Integration Agent',
  'A5': 'Dashboard Feature Agent',
  'A6': 'CRM Feature Agent',
  'A7': 'Builder Feature Agent',
  'A8': 'Workflows Feature Agent',
  'A9': 'Marketing Feature Agent',
  'A10': 'Analytics Feature Agent',
} as const;
