/**
 * Agent Runtime - Core Types
 *
 * Unified interface for running AI agents across any provider:
 * Claude API, Claude Code, Codex, OpenAI Assistants, and DeerFlow.
 *
 * Design principles:
 * - AsyncGenerator for streaming (text chunks, tool calls, done signal)
 * - Tool results are returned as events, not blocking return values
 * - Cost tracking is per-runtime, not per-call (aggregated over session)
 * - ExecutionContext is provider-agnostic business context
 */

// ============================================================================
// Event Types (what the runtime yields)
// ============================================================================

export interface TextChunkEvent {
  type: 'text_chunk';
  content: string;
}

export interface ToolStartEvent {
  type: 'tool_start';
  toolName: string;
  toolId: string;
  input: Record<string, unknown>;
}

export interface ToolResultEvent {
  type: 'tool_result';
  toolId: string;
  toolName: string;
  result: unknown;
  /** Whether the tool explicitly returned an error string */
  isError?: boolean;
  durationMs: number;
}

export interface ToolErrorEvent {
  type: 'tool_error';
  toolName: string;
  toolId: string;
  error: string;
}

export interface DoneEvent {
  type: 'done';
  /** Final output text (concatenation of all text_chunk events) */
  output: string;
  stopReason: string;
  tokenUsage: TokenUsage;
}

export interface ErrorEvent {
  type: 'error';
  message: string;
  code?: string;
  retryable: boolean;
}

export type AgentEvent =
  | TextChunkEvent
  | ToolStartEvent
  | ToolResultEvent
  | ToolErrorEvent
  | DoneEvent
  | ErrorEvent;

// ============================================================================
// Token Usage & Cost
// ============================================================================

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  totalCostUSD: number;
}

// ============================================================================
// Execution Context (provider-agnostic business context)
// ============================================================================

export interface AgentPermissions {
  crm?: {
    readContacts?: boolean;
    writeContacts?: boolean;
    readCompanies?: boolean;
    writeCompanies?: boolean;
    readDeals?: boolean;
    writeDeals?: boolean;
  };
  marketing?: {
    readCampaigns?: boolean;
    writeCampaigns?: boolean;
    sendEmail?: boolean;
    sendSMS?: boolean;
  };
  workflows?: {
    trigger?: boolean;
    read?: boolean;
    write?: boolean;
  };
  builder?: {
    readPages?: boolean;
    writePages?: boolean;
    publish?: boolean;
  };
  github?: {
    read?: boolean;
    write?: boolean;
  };
  [key: string]: unknown;
}

export interface RecentAction {
  action: string;
  module: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface ExecutionContext {
  userId: string;
  organizationId: string;
  organizationName: string;
  currentModule: string;
  recentActions: RecentAction[];
  permissions: AgentPermissions;
  custom?: Record<string, unknown>;
}

// ============================================================================
// Tool / Function Calling
// ============================================================================

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: string[];
  properties?: Record<string, ToolParameter>;
  required?: string[];
  items?: ToolParameter;
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties?: Record<string, ToolParameter>;
    required?: string[];
  };
  category?: 'crm' | 'marketing' | 'workflow' | 'analytics' | 'builder' | 'github' | 'general';
  dangerous?: boolean;
}

export type ToolResult = {
  success: true;
  data: unknown;
} | {
  success: false;
  error: string;
};

// ============================================================================
// Agent Runtime Interface
// ============================================================================

export type AgentProvider =
  | 'claude-api'    // Direct Anthropic API (messages endpoint)
  | 'claude-code'  // Claude Code CLI subprocess
  | 'codex'        // OpenAI Codex
  | 'openai'       // OpenAI Assistants API
  | 'deerflow';    // DeerFlow LangGraph HTTP API

export interface AgentRuntimeConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  tools?: ToolDefinition[];
  context?: ExecutionContext;
}

export interface AgentRuntime {
  /** Human-readable name, e.g. "Claude Sonnet 4 via API" */
  readonly name: string;

  /** Provider identifier */
  readonly provider: AgentProvider;

  /** Whether the runtime is currently initialized and ready */
  readonly ready: boolean;

  /**
   * Execute the agent with a prompt and return a streaming AsyncGenerator.
   *
   * The caller iterates over the generator and yields AgentEvents:
   *   - text_chunk  — streaming response text
   *   - tool_start  — tool is about to execute
   *   - tool_result — tool completed (success or error)
   *   - done        — final result with token usage
   *
   * @param prompt        - User prompt or task description
   * @param config        - Runtime config (tools, model, context)
   */
  execute(
    prompt: string,
    config?: AgentRuntimeConfig
  ): AsyncGenerator<AgentEvent, void, unknown>;

  /**
   * Stop the currently running execution, if any.
   * Idempotent — calling on a non-running session is a no-op.
   */
  abort(): void;

  /**
   * Total accumulated cost in USD for this runtime instance.
   * Reset when the runtime is disposed.
   */
  getCost(): number;

  /**
   * Total token usage for this runtime instance.
   */
  getTokenUsage(): TokenUsage;

  /**
   * Validate that the runtime has all required config (API keys, etc).
   * Throws if not configured.
   */
  validateConfig(): void;

  /**
   * Dispose of the runtime and release resources.
   * After dispose(), the runtime is unusable.
   */
  dispose(): void;
}

// ============================================================================
// Claude API specific config
// ============================================================================

export interface ClaudeRuntimeConfig extends AgentRuntimeConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  thinking?: {
    type: 'enabled' | 'disabled' | 'adaptive';
    budgetTokens?: number;
  };
  /** Cost limit in USD — aborts if estimated cost exceeds this */
  maxBudgetUSD?: number;
}

// ============================================================================
// DeerFlow specific config
// ============================================================================

export interface DeerFlowRuntimeConfig extends AgentRuntimeConfig {
  baseURL?: string;
  apiKey?: string;
  threadId?: string;
  model?: string;
}

// ============================================================================
// Codex specific config
// ============================================================================

export interface CodexRuntimeConfig extends AgentRuntimeConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  systemPrompt?: string;
}

// ============================================================================
// Runtime capabilities (what each runtime supports)
// ============================================================================

export interface RuntimeCapabilities {
  /** Supports streaming via AsyncGenerator */
  streaming: boolean;
  /** Supports structured output (JSON schema) */
  structuredOutput: boolean;
  /** Supports tool calling / function calling */
  toolCalling: boolean;
  /** Supports vision / image input */
  vision: boolean;
  /** Supports system prompt injection */
  systemPrompt: boolean;
  /** Max context window in tokens */
  maxContextTokens: number;
  /** Supports thinking / reasoning budgets */
  thinking: boolean;
}

/** Capability matrix for known runtimes */
export const RUNTIME_CAPABILITIES: Record<AgentProvider, RuntimeCapabilities> = {
  'claude-api': {
    streaming: true,
    structuredOutput: true,
    toolCalling: true,
    vision: true,
    systemPrompt: true,
    maxContextTokens: 200_000,
    thinking: true,
  },
  'claude-code': {
    streaming: true,
    structuredOutput: false,
    toolCalling: true,
    vision: false,
    systemPrompt: true,
    maxContextTokens: 200_000,
    thinking: true,
  },
  'codex': {
    streaming: true,
    structuredOutput: true,
    toolCalling: true,
    vision: false,
    systemPrompt: true,
    maxContextTokens: 128_000,
    thinking: false,
  },
  'openai': {
    streaming: true,
    structuredOutput: true,
    toolCalling: true,
    vision: true,
    systemPrompt: true,
    maxContextTokens: 128_000,
    thinking: false,
  },
  'deerflow': {
    streaming: true,
    structuredOutput: true,
    toolCalling: true,
    vision: false,
    systemPrompt: true,
    maxContextTokens: 128_000,
    thinking: true,
  },
};
