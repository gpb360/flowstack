/**
 * Agent Turn Executor
 * Orchestrates a single agent conversation turn: builds context, filters tools,
 * drives chatWithToolsStreaming(), and handles result truncation.
 */

import { getAIClient } from './client';
import { getToolsForCapabilities, formatCapabilitySummary } from './tools';
import type { Agent } from '../../features/ai-agents/hooks/useAgents';
import type { Message, ExecutionContext, AgentTurnEvent, Tool } from './types';

// Max array items to pass back to Claude in a tool result.
// Prevents context window exhaustion on large Supabase queries.
const MAX_RESULT_ARRAY_ITEMS = 20;
const MAX_RESULT_STRING_CHARS = 2000;

/**
 * Truncate tool result values to avoid blowing the context window.
 * - Arrays: capped at MAX_RESULT_ARRAY_ITEMS, _truncated flag added
 * - Strings: capped at MAX_RESULT_STRING_CHARS
 * - Objects: truncated recursively (shallow — one level deep)
 */
function truncateToolResult(result: unknown): unknown {
  if (Array.isArray(result)) {
    if (result.length > MAX_RESULT_ARRAY_ITEMS) {
      return [...result.slice(0, MAX_RESULT_ARRAY_ITEMS), { _truncated: true, _total: result.length }];
    }
    return result;
  }

  if (typeof result === 'string') {
    if (result.length > MAX_RESULT_STRING_CHARS) {
      return result.slice(0, MAX_RESULT_STRING_CHARS) + `... [truncated, ${result.length} total chars]`;
    }
    return result;
  }

  if (result !== null && typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    const truncated: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value) && value.length > MAX_RESULT_ARRAY_ITEMS) {
        truncated[key] = [...value.slice(0, MAX_RESULT_ARRAY_ITEMS), { _truncated: true, _total: value.length }];
      } else if (typeof value === 'string' && value.length > MAX_RESULT_STRING_CHARS) {
        truncated[key] = value.slice(0, MAX_RESULT_STRING_CHARS) + '... [truncated]';
      } else {
        truncated[key] = value;
      }
    }
    return truncated;
  }

  return result;
}

/**
 * Build the system prompt for a specific agent.
 * Injects agent identity, custom system prompt, and tool capability summary.
 */
function buildAgentSystemPrompt(
  agent: Agent,
  orgName: string,
  tools: Tool[],
): string {
  const parts: string[] = [];

  parts.push(`You are ${agent.name}, an AI agent for ${orgName}.`);

  if (agent.description) {
    parts.push(agent.description);
  }

  if (agent.system_prompt) {
    parts.push('');
    parts.push(agent.system_prompt);
  }

  parts.push('');
  parts.push(`You are operating on behalf of organization "${orgName}". Always scope your actions to this organization. Never access data from other organizations.`);

  parts.push('');
  parts.push(formatCapabilitySummary(agent.capabilities, tools));

  parts.push('');
  parts.push('When using tools, be concise about what you found. If a query returns no results, say so clearly. If a tool returns an error, explain what went wrong and suggest alternatives.');

  if (agent.capabilities.length > 0) {
    parts.push('');
    parts.push('Important: You only have the tools listed above. If a user asks you to do something that requires a capability you don\'t have, state clearly that this agent is not configured for that action. Do not apologize excessively — explain the limitation briefly and suggest what you can do instead.');
  }

  return parts.join('\n');
}

/**
 * Execute a single agent conversation turn.
 *
 * Yields AgentTurnEvents:
 *   tool_start  — a tool call is about to execute
 *   tool_result — a tool call completed (result truncated for context safety)
 *   error       — a tool call failed
 *   text_chunk  — a chunk of the streaming final response
 *   done        — the turn is complete
 *
 * @param agent        The agent definition from Supabase
 * @param messages     Conversation history (user + assistant messages)
 * @param context      ExecutionContext with userId, organizationId, permissions
 * @param orgName      Human-readable org name for system prompt
 */
export async function* executeAgentTurn(
  agent: Agent,
  messages: Message[],
  context: ExecutionContext,
  orgName: string,
): AsyncGenerator<AgentTurnEvent, void, unknown> {
  // Resolve which tools this agent is allowed to use
  const tools = getToolsForCapabilities(agent.capabilities);

  // Build agent-scoped system prompt
  const systemPrompt = buildAgentSystemPrompt(agent, orgName, tools);

  // Get AI client (uses VITE_CLAUDE_API_KEY)
  let client;
  try {
    client = getAIClient(systemPrompt);
  } catch (err) {
    yield {
      type: 'error',
      toolName: 'executor',
      error: err instanceof Error ? err.message : 'Failed to initialize AI client. Check VITE_CLAUDE_API_KEY.',
    };
    yield { type: 'done' };
    return;
  }

  // Wrap chatWithToolsStreaming to intercept tool results for truncation
  const stream = client.chatWithToolsStreaming({
    messages,
    tools,
    context,
    systemPrompt,
    maxTokens: 4096,
  });

  for await (const event of stream) {
    if (event.type === 'tool_result') {
      // Truncate before yielding and before it gets fed back to Claude
      // Note: truncation happens inside chatWithToolsStreaming via executeToolCall;
      // here we truncate the yielded event for display purposes.
      const truncatedResult = truncateToolResult(event.result);
      console.debug(
        `[executor] tool_result: ${event.toolName}`,
        typeof event.result === 'object' && event.result !== null && 'length' in event.result
          ? `(${(event.result as unknown[]).length} items)`
          : typeof event.result,
        `${event.durationMs}ms`,
      );
      yield { ...event, result: truncatedResult };
    } else {
      if (event.type === 'tool_start') {
        console.debug(`[executor] tool_start: ${event.toolName}`, event.input);
      } else if (event.type === 'error') {
        console.debug(`[executor] error: ${event.toolName}:`, event.error);
      } else if (event.type === 'done') {
        console.debug('[executor] done');
      }
      yield event;
    }
  }
}
