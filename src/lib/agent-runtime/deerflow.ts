/**
 * DeerFlow Runtime
 *
 * AgentRuntime implementation that talks to a DeerFlow LangGraph HTTP API server.
 * DeerFlow (by ByteDance) is a multi-agent research harness with HTTP APIs
 * for threads, skills, memory, and MCP configuration.
 *
 * Server: http://localhost:2026/api/langgraph (default)
 * Auth: Bearer token via Authorization header
 *
 * Key DeerFlow concepts:
 * - Threads: conversation sessions (equivalent to an agent session)
 * - Runs: a single turn within a thread (equivalent to one execute() call)
 * - Skills: prompt templates loaded at runtime
 * - Memory: persistent context across turns
 */

import type {
  AgentEvent,
  AgentRuntime,
  DeerFlowRuntimeConfig,
  ExecutionContext,
  ToolDefinition,
} from './types';
import { BaseAgentRuntime } from './base-runtime';
import { PRICING } from '../ai/types';

interface DeerFlowThread {
  id: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface DeerFlowRunResponse {
  assistant: Array<{
    type: string;
    text?: string;
    tool_use?: {
      id: string;
      name: string;
      input: Record<string, unknown>;
    };
    tool_result?: {
      tool_use_id: string;
      content?: string;
    };
  }>;
  metadata?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    stop_reason?: string;
  };
}

// DeerFlow SSE event types (Anthropic-compatible format)
interface SSEContentBlockDelta {
  type: 'content_block_delta';
  index?: number;
  delta: {
    type: 'text_delta' | 'input_json_delta';
    text?: string;
    partial_json?: string;
  };
}

interface SSEContentBlockStart {
  type: 'content_block_start';
  index?: number;
  content_block: {
    type: 'text' | 'tool_use';
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
  };
}

interface SSEMessageDelta {
  type: 'message_delta';
  delta: {
    stop_reason?: string;
  };
}

interface SSEMessage {
  type: 'message';
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  };
}

type SSEEvent = SSEContentBlockDelta | SSEContentBlockStart | SSEMessageDelta | SSEMessage;

export class DeerFlowRuntime
  extends BaseAgentRuntime
  implements AgentRuntime
{
  readonly name = 'DeerFlow';
  readonly provider = 'deerflow' as const;
  private _ready = false;
  private _config: DeerFlowRuntimeConfig;
  private _threadId: string | null = null;
  private _baseURL: string;
  private _authToken: string;

  constructor(config: DeerFlowRuntimeConfig = {}) {
    super();
    this._config = config;
    this._baseURL = config.baseURL ?? 'http://localhost:2026';
    this._authToken = config.apiKey ?? '';
    this._validateConnection();
  }

  get ready(): boolean {
    return this._ready;
  }

  private async _validateConnection(): Promise<void> {
    try {
      const response = await fetch(`${this._baseURL}/api`, {
        method: 'GET',
        headers: this._headers(),
        signal: AbortSignal.timeout(5000),
      });
      this._ready = response.ok;
    } catch {
      this._ready = false;
    }
  }

  private _headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this._authToken) {
      headers['Authorization'] = `Bearer ${this._authToken}`;
    }
    return headers;
  }

  validateConfig(): void {
    super.validateConfig();
    if (!this._ready) {
      throw new Error(
        `DeerFlow server not reachable at ${this._baseURL}. ` +
          'Ensure DeerFlow is running (make docker-start) before using this runtime.'
      );
    }
  }

  /**
   * Execute a prompt against DeerFlow.
   *
   * Uses DeerFlow's LangGraph threads API:
   * 1. Create or reuse a thread (session)
   * 2. POST the prompt as a new run
   * 3. Stream SSE events from the run
   * 4. Yield AgentEvents
   */
  async *execute(
    prompt: string,
    config?: DeerFlowRuntimeConfig
  ): AsyncGenerator<AgentEvent, void, unknown> {
    this.validateConfig();
    this.startRun();

    const mergedConfig = { ...this._config, ...config };

    try {
      // Get or create thread
      const threadId = await this._getOrCreateThread(mergedConfig.threadId);

      // Build the run payload
      const runPayload = this._buildRunPayload(prompt, mergedConfig);

      // Start the run and get SSE stream
      const runResponse = await fetch(
        `${this._baseURL}/api/langgraph/threads/${threadId}/runs/stream`,
        {
          method: 'POST',
          headers: this._headers(),
          body: JSON.stringify(runPayload),
          signal: this.getAbortSignal(),
        }
      );

      if (!runResponse.ok) {
        const errorText = await runResponse.text();
        throw new Error(
          `DeerFlow run failed (${runResponse.status}): ${errorText}`
        );
      }

      if (!runResponse.body) {
        throw new Error('DeerFlow returned empty response body');
      }

      // Parse SSE stream
      let finalOutput = '';
      let stopReason = 'end_turn';
      let inputTokens = 0;
      let outputTokens = 0;

      const reader = runResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          const event = this._parseSSELine(data);
          if (!event) continue;

          if (event.type === 'content_block_delta') {
            if (event.delta?.type === 'text_delta') {
              const text = event.delta.text ?? '';
              finalOutput += text;
              yield { type: 'text_chunk', content: text };
            } else if (event.delta?.type === 'input_json_delta') {
              // Structured input — not typical for DeerFlow but handle it
            }
          } else if (event.type === 'content_block_start') {
            const block = event.content_block;
            if (block?.type === 'tool_use') {
              yield {
                type: 'tool_start',
                toolName: block.name ?? 'unknown',
                toolId: block.id ?? '',
                input: block.input ?? {},
              };
            }
          } else if (event.type === 'message_delta') {
            stopReason = event.delta?.stop_reason ?? stopReason;
          } else if (event.type === 'message') {
            // Final message with usage
            if (event.usage) {
              inputTokens = event.usage.input_tokens ?? 0;
              outputTokens = event.usage.output_tokens ?? 0;
            }
          }
        }
      }

      // Calculate cost
      const model = mergedConfig.model ?? 'claude-3-5-sonnet-20241022';
      const pricing = PRICING[model as keyof typeof PRICING];
      let costUSD = 0;
      if (pricing) {
        costUSD =
          (inputTokens / 1_000_000) * pricing.input +
          (outputTokens / 1_000_000) * pricing.output;
      }

      this.addCost(costUSD);
      this.addTokenUsage({
        inputTokens,
        outputTokens,
        totalCostUSD: costUSD,
      });

      yield {
        type: 'done',
        output: finalOutput,
        stopReason,
        tokenUsage: this.getTokenUsage(),
      };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        yield {
          type: 'error',
          message: 'Execution aborted',
          code: 'ABORTED',
          retryable: false,
        };
      } else {
        yield {
          type: 'error',
          message: (err as Error).message,
          code: undefined,
          retryable: true,
        };
      }
    } finally {
      this.endRun();
    }
  }

  /**
   * Get or create a DeerFlow thread (conversation session).
   */
  private async _getOrCreateThread(
    preferredThreadId?: string
  ): Promise<string> {
    if (preferredThreadId) {
      this._threadId = preferredThreadId;
      return preferredThreadId;
    }

    if (this._threadId) {
      return this._threadId;
    }

    const response = await fetch(`${this._baseURL}/api/langgraph/threads`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create DeerFlow thread: ${response.statusText}`
      );
    }

    const thread = (await response.json()) as DeerFlowThread;
    this._threadId = thread.id;
    return thread.id;
  }

  /**
   * Build the run payload for DeerFlow's LangGraph API.
   */
  private _buildRunPayload(
    prompt: string,
    config: DeerFlowRuntimeConfig
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      input: {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      },
    };

    // Add model override if specified
    if (config.model) {
      payload.metadata = {
        ...(payload.metadata as Record<string, unknown>),
        model: config.model,
      };
    }

    // System prompt injection via first message modification
    if (config.systemPrompt) {
      const contextSummary = config.context
        ? this.buildContextSummary(config.context)
        : '';
      const permsSummary = config.context
        ? this.buildPermissionsSummary(config.context)
        : '';

      const systemMessage = [
        config.systemPrompt,
        contextSummary,
        permsSummary,
      ]
        .filter(Boolean)
        .join('\n\n');

      payload.input = {
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      };
    }

    return payload;
  }

  /**
   * Parse a single SSE data line into a partial event.
   */
  private _parseSSELine(data: string): SSEEvent | null {
    try {
      return JSON.parse(data) as SSEEvent;
    } catch {
      return null;
    }
  }

  dispose(): void {
    this.abort();
    this._threadId = null;
    this._ready = false;
    this._disposed = true;
  }
}
