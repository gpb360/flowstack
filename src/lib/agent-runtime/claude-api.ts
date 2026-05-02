/**
 * Claude API Runtime
 *
 * AgentRuntime implementation that uses the direct Anthropic Claude API
 * (via the existing src/lib/ai/client.ts AIClient).
 *
 * Supports:
 * - Streaming text and tool calls via AsyncGenerator
 * - Per-request tool filtering (capability-based)
 * - Cost tracking
 * - Abort on timeout
 * - Budget limits
 */

import { getAIClient, resetAIClient } from '../ai/client';
import type { AIClient } from '../ai/client';
import type { AgentTurnEvent } from '../ai/types';
import type { Tool } from '../ai/types';
import type {
  AgentEvent,
  AgentRuntime,
  ClaudeRuntimeConfig,
  ExecutionContext,
  ToolDefinition,
} from './types';
import { BaseAgentRuntime } from './base-runtime';
import { PRICING } from '../ai/types';

export class ClaudeAPIRuntime
  extends BaseAgentRuntime
  implements AgentRuntime
{
  readonly name = 'Claude API';
  readonly provider = 'claude-api' as const;
  private _ready = false;
  private _config: ClaudeRuntimeConfig;
  private _client: AIClient | null = null;

  constructor(config: ClaudeRuntimeConfig = {}) {
    super();
    this._config = config;
    this._initializeClient();
  }

  get ready(): boolean {
    return this._ready;
  }

  private _initializeClient(): void {
    try {
      this._client = getAIClient(this._config.systemPrompt);
      this._ready = true;
    } catch {
      this._ready = false;
    }
  }

  validateConfig(): void {
    super.validateConfig();
    if (!this._client) {
      throw new Error(
        'Claude API client not initialized. Check VITE_CLAUDE_API_KEY or VITE_ZAI_API_KEY.'
      );
    }
  }

  async *execute(
    prompt: string,
    config?: ClaudeRuntimeConfig
  ): AsyncGenerator<AgentEvent, void, unknown> {
    this.validateConfig();
    this.startRun();

    const mergedConfig = { ...this._config, ...config };
    const client = this._client!;
    const tools = this._buildTools(mergedConfig);
    const context = mergedConfig.context ?? this.defaultContext;

    const adaptedContext = context
      ? this._adaptToAIClientContext(context)
      : undefined;

    let systemPrompt = mergedConfig.systemPrompt ?? '';
    if (context) {
      const contextInfo = this._buildSystemContext(context);
      systemPrompt = systemPrompt ? `${systemPrompt}\n\n${contextInfo}` : contextInfo;
    }

    const messages = [
      {
        role: 'user' as const,
        content: prompt,
        timestamp: Date.now(),
      },
    ];

    const stream = client.chatWithToolsStreaming({
      messages,
      tools,
      context: adaptedContext,
      systemPrompt,
      maxTokens: mergedConfig.maxTokens ?? 8192,
      temperature: mergedConfig.temperature ?? 0.7,
    });

    let finalOutput = '';
    let stopReason = 'end_turn';

    try {
      let result = await stream.next();
      while (!result.done) {
        const event = result.value as AgentTurnEvent;

        if (event.type === 'text_chunk') {
          finalOutput += event.content;
          yield { type: 'text_chunk', content: event.content };
        } else if (event.type === 'tool_start') {
          yield {
            type: 'tool_start',
            toolName: event.toolName,
            toolId: event.toolId,
            input: event.input,
          };
        } else if (event.type === 'tool_result') {
          const truncated = this.truncateToolResult(event.result);
          yield {
            type: 'tool_result',
            toolId: event.toolId,
            toolName: event.toolName,
            result: truncated,
            isError: false,
            durationMs: event.durationMs,
          };
        } else if (event.type === 'error') {
          yield {
            type: 'error',
            message: event.error,
            code: undefined,
            retryable: true,
          };
        } else if (event.type === 'done') {
          stopReason = 'end_turn';
        }

        result = await stream.next();
      }
    } catch (err) {
      const error = err as Error;
      yield {
        type: 'error',
        message: error.message || 'Execution failed',
        code: undefined,
        retryable: this._isRetryableError(error),
      };
    } finally {
      const estimatedOutputTokens = Math.ceil(finalOutput.length / 4);
      const estimatedInputTokens = Math.ceil(prompt.length / 4) + 500;

      const model = mergedConfig.model ?? 'claude-3-5-sonnet-20241022';
      const pricing = PRICING[model as keyof typeof PRICING];

      let costUSD = 0;
      if (pricing) {
        costUSD =
          (estimatedInputTokens / 1_000_000) * pricing.input +
          (estimatedOutputTokens / 1_000_000) * pricing.output;
      }

      this.addCost(costUSD);
      this.addTokenUsage({
        inputTokens: estimatedInputTokens,
        outputTokens: estimatedOutputTokens,
        totalCostUSD: costUSD,
      });

      this.endRun();

      yield {
        type: 'done',
        output: finalOutput,
        stopReason,
        tokenUsage: this.getTokenUsage(),
      };
    }
  }

  private _buildTools(config: ClaudeRuntimeConfig): Tool[] {
    const toolDefs = config.tools ?? this.defaultTools;
    return toolDefs.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    }));
  }

  private _buildSystemContext(context: ExecutionContext): string {
    const parts: string[] = [];

    parts.push(`Organization: ${context.organizationName}`);
    parts.push(`User: ${context.userId}`);
    parts.push(`Module: ${context.currentModule}`);

    if (context.recentActions.length > 0) {
      parts.push('');
      parts.push('Recent actions:');
      for (const action of context.recentActions.slice(-5)) {
        parts.push(
          `  - [${action.module}] ${action.action}${
            action.data ? ` — ${JSON.stringify(action.data)}` : ''
          }`
        );
      }
    }

    const permsSummary = this.buildPermissionsSummary(context);
    if (permsSummary) {
      parts.push('');
      parts.push(permsSummary);
    }

    return parts.join('\n');
  }

  private _adaptToAIClientContext(
    ctx: ExecutionContext
  ): import('../ai/types').ExecutionContext {
    return {
      userId: ctx.userId,
      organizationId: ctx.organizationId,
      currentModule: ctx.currentModule,
      recentActions: ctx.recentActions,
      relevantData: {},
      permissions: [], // capability-based tools don't use string permissions here
      timestamp: Date.now(),
    };
  }

  private _isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('network') ||
      message.includes('econnrefused')
    );
  }

  dispose(): void {
    this.abort();
    resetAIClient();
    this._client = null;
    this._ready = false;
    this._disposed = true;
  }
}
