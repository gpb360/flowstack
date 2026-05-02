/**
 * AI Integration Types
 * Core types for Claude API integration and AI interactions
 */

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface ImageContent {
  type: 'image';
  source: {
    type: 'url' | 'base64';
    media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    data: string;
  };
}

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContent {
  type: 'tool_result';
  tool_use_id: string;
  content?: string | Array<TextContent | ImageContent>;
  is_error?: boolean;
}

export type ContentBlock = TextContent | ImageContent | ToolUseContent | ToolResultContent;

export interface EnhancedMessage extends Omit<Message, 'content'> {
  content: string | Array<ContentBlock>;
}

// ============================================================================
// Tool/Function Types
// ============================================================================

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  enum?: string[];
  properties?: Record<string, ToolParameter>;
  required?: string[];
  items?: ToolParameter;
}

export interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties?: Record<string, ToolParameter>;
    required?: string[];
  };
  handler?: (params: unknown, context: ExecutionContext) => Promise<unknown>;
  category?: 'crm' | 'marketing' | 'workflow' | 'analytics' | 'builder' | 'general';
  dangerous?: boolean; // For security validation
}

// ============================================================================
// Context Types
// ============================================================================

export interface ExecutionContext {
  userId: string;
  organizationId: string;
  currentModule: string;
  recentActions: RecentAction[];
  relevantData: Record<string, unknown>;
  permissions: string[];
  timestamp: number;
}

export interface RecentAction {
  action: string;
  module: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface OrganizationContext {
  id: string;
  name: string;
  members: TeamMember[];
  activeWorkflows: number;
  contactsCount: number;
  campaignsCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  commandBarSuggestions: boolean;
  aiAssistance: boolean;
  shortcuts: Record<string, string>;
}

// ============================================================================
// Memory Types
// ============================================================================

export interface ConversationMemory {
  id: string;
  userId: string;
  organizationId: string;
  messages: Message[];
  context: ExecutionContext;
  summary?: string;
  embeddings?: number[];
  createdAt: number;
  updatedAt: number;
}

export interface MemorySearchParams {
  userId: string;
  organizationId: string;
  query: string;
  limit?: number;
  module?: string;
  timeRange?: { start: number; end: number };
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ChatParams {
  messages: Message[];
  tools?: Tool[];
  context?: ExecutionContext;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage: TokenUsage;
  model: string;
  stopReason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  totalCost: number; // In USD
}

export interface StreamChunk {
  type: 'content_block' | 'content_block_delta' | 'content_block_stop' | 'message_delta' | 'message_stop';
  index?: number;
  delta?: {
    type?: string;
    text?: string;
    partial_json?: string;
  };
  content_block?: {
    type: string;
    text?: string;
    tool_use?: {
      id: string;
      name: string;
      input: Record<string, unknown>;
    };
  };
  usage?: TokenUsage;
  stop_reason?: string;
}

// ============================================================================
// Agent Turn Event Types (streaming execution)
// ============================================================================

export type AgentTurnEvent =
  | { type: 'text_chunk'; content: string }
  | { type: 'tool_start'; toolName: string; toolId: string; input: Record<string, unknown> }
  | { type: 'tool_result'; toolId: string; toolName: string; result: unknown; durationMs: number }
  | { type: 'error'; toolName: string; error: string }
  | { type: 'done' };

// ============================================================================
// Agent Types
// ============================================================================

export type AgentType = 'orchestrator' | 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow';

export interface AgentExecution {
  id: string;
  agentId: string;
  agentType: AgentType;
  status: 'idle' | 'running' | 'completed' | 'failed' | 'timeout';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface AgentCapability {
  agentId: string;
  capabilities: string[];
  version: number;
}

// ============================================================================
// Command Bar Types
// ============================================================================

export type CommandCategory = 'navigation' | 'action' | 'search' | 'ai';

export interface Command {
  id: string;
  label: string;
  description: string;
  category: CommandCategory;
  icon?: string;
  shortcut?: string;
  action: () => void | Promise<void>;
  keywords?: string[];
  module?: string;
  requiresPermission?: string[];
}

export interface CommandSuggestion {
  command: Command;
  score: number;
  reason: string;
}

// ============================================================================
// Error Types
// ============================================================================

export type AIErrorCode =
  | 'api_key_missing'
  | 'api_key_invalid'
  | 'rate_limit_exceeded'
  | 'context_too_long'
  | 'invalid_request'
  | 'tool_execution_failed'
  | 'network_error'
  | 'timeout'
  | 'unknown';

export class AIError extends Error {
  code: AIErrorCode;
  details?: Record<string, unknown>;
  retryable: boolean;

  constructor(code: AIErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = details;
    this.retryable = this.isRetryable(code);
  }

  private isRetryable(code: AIErrorCode): boolean {
    return ['rate_limit_exceeded', 'network_error', 'timeout'].includes(code);
  }
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface AIConfig {
  apiKey: string;
  model: string;
  baseURL: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export const DEFAULT_AI_CONFIG: Omit<AIConfig, 'apiKey'> = {
  model: 'claude-3-5-sonnet-20241022',
  baseURL: 'https://api.anthropic.com/v1/messages',
  maxTokens: 8192,
  temperature: 0.7,
  timeout: 60000, // 60 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second
};

// ============================================================================
// Cost Calculation (as of 2024)
// ============================================================================

export const PRICING = {
  'claude-3-5-sonnet-20241022': {
    input: 3.0, // per million tokens
    output: 15.0,
    cacheCreation: 3.75,
    cacheRead: 0.30,
  },
  'claude-3-5-haiku-20241022': {
    input: 0.8,
    output: 4.0,
    cacheCreation: 1.0,
    cacheRead: 0.08,
  },
  'claude-3-opus-20240229': {
    input: 15.0,
    output: 75.0,
  },
} as const;

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens = 0,
  cacheReadTokens = 0
): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const cacheCreationCost = 'cacheCreation' in pricing
    ? (cacheCreationTokens / 1_000_000) * (pricing as { cacheCreation: number }).cacheCreation
    : 0;
  const cacheReadCost = 'cacheRead' in pricing
    ? (cacheReadTokens / 1_000_000) * (pricing as { cacheRead: number }).cacheRead
    : 0;

  return inputCost + outputCost + cacheCreationCost + cacheReadCost;
}
