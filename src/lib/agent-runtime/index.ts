/**
 * Agent Runtime — Unified AI Agent Interface
 *
 * A single interface for running AI agents across any provider:
 * Claude API, DeerFlow, Codex, OpenAI Assistants.
 *
 * Built to replace the ad-hoc tool-calling + streaming in src/lib/ai/.
 * The workflow engine uses this to run AI nodes without caring which
 * provider is configured.
 *
 * @example
 * import { getRuntime, registerRuntimes, buildExecutionContext } from '@/lib/agent-runtime';
 *
 * // At app startup:
 * registerRuntimes();
 *
 * // In a component or workflow node:
 * const runtime = await getRuntime('claude-api');
 *
 * for await (const event of runtime.execute('Analyze these leads', {
 *   context: buildExecutionContext({ userId, organizationId, organizationName }),
 *   tools: myTools,
 * })) {
 *   if (event.type === 'text_chunk') {
 *     appendToOutput(event.content);
 *   } else if (event.type === 'tool_result') {
 *     await handleToolResult(event);
 *   } else if (event.type === 'done') {
 *     showCost(event.tokenUsage.totalCostUSD);
 *   }
 * }
 */

// ─── Types ───────────────────────────────────────────────────────────────

export type {
  AgentEvent,
  TextChunkEvent,
  ToolStartEvent,
  ToolResultEvent,
  ToolErrorEvent,
  DoneEvent,
  ErrorEvent,
  TokenUsage,
  AgentRuntime,
  AgentRuntimeConfig,
  AgentProvider,
  AgentPermissions,
  ExecutionContext,
  RecentAction,
  ToolDefinition,
  ToolParameter,
  ToolResult,
  ClaudeRuntimeConfig,
  DeerFlowRuntimeConfig,
  CodexRuntimeConfig,
  RuntimeCapabilities,
} from './types';

export { RUNTIME_CAPABILITIES } from './types';

// ─── Base Class ─────────────────────────────────────────────────────────

export { BaseAgentRuntime } from './base-runtime';

// ─── Implementations ─────────────────────────────────────────────────────

export { ClaudeAPIRuntime } from './claude-api';
export { DeerFlowRuntime } from './deerflow';

// ─── Registry ───────────────────────────────────────────────────────────

export {
  registerRuntimes,
  register,
  unregister,
  getRuntime,
  getRuntimeSync,
  listRuntimes,
  hasRuntime,
  isRuntimeReady,
  getRuntimeCapabilities,
  disposeRuntime,
  disposeAll,
  executeAndCollect,
  executeTextOnly,
  buildExecutionContext,
} from './registry';
