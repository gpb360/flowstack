/**
 * Claude API Client
 * Wrapper for Anthropic Claude API with streaming, retries, and cost tracking
 */

import type {
  ChatParams,
  ChatResponse,
  Message,
  Tool,
  ToolCall,
  TokenUsage,
  StreamChunk,
  ExecutionContext,
  AgentTurnEvent,
} from './types';
import { AIError } from './types';
import { getConfig, validateConfig } from './config';

/**
 * Default system prompt for FlowStack AI
 */
const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant for FlowStack, an AI-native business platform. You help users manage contacts, create marketing campaigns, build workflows, and automate their business operations.

Key capabilities:
- CRM: Create, find, and update contacts and companies
- Marketing: Create campaigns, generate content, send emails
- Workflows: Build automations, trigger workflows, analyze processes
- Analytics: Generate reports, show metrics, provide insights
- Builder: Suggest designs, optimize layouts

Guidelines:
- Be concise and actionable
- Use tools when available to perform actions
- Always confirm before making destructive changes
- Provide context and explain your reasoning
- Ask for clarification when needed
- Remember user preferences and context`;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoff(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
}

/**
 * Claude API Client
 */
export class AIClient {
  private config: ReturnType<typeof getConfig>;
  private systemPrompt: string;

  constructor(systemPrompt?: string) {
    this.config = getConfig();
    const validation = validateConfig(this.config);

    if (!validation.valid) {
      throw new Error(`Invalid AI configuration: ${validation.errors.join(', ')}`);
    }

    this.systemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;
  }

  /**
   * Send a chat request and get complete response
   */
  async complete(params: ChatParams): Promise<ChatResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(params);

        // Log execution time
        const duration = Date.now() - startTime;
        console.debug(`AI request completed in ${duration}ms`);

        return response;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AIError) {
          if (!error.retryable || attempt === this.config.maxRetries) {
            throw error;
          }

          const backoffDelay = calculateBackoff(attempt, this.config.retryDelay);
          console.warn(`Retrying request after ${backoffDelay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`);
          await sleep(backoffDelay);
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Send a chat request with streaming response
   */
  async *stream(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        for await (const chunk of this.makeStreamingRequest(params)) {
          yield chunk;
        }

        const duration = Date.now() - startTime;
        console.debug(`AI streaming request completed in ${duration}ms`);

        return;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AIError) {
          if (!error.retryable || attempt === this.config.maxRetries) {
            throw error;
          }

          const backoffDelay = calculateBackoff(attempt, this.config.retryDelay);
          console.warn(`Retrying streaming request after ${backoffDelay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`);
          await sleep(backoffDelay);
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Make a non-streaming request — OpenAI-compatible format (Z.ai proxy)
   */
  private async makeRequest(params: ChatParams): Promise<ChatResponse> {
    const isZai = this.config.baseURL.includes('z.ai');

    if (isZai) {
      return this.makeOpenAIRequest(params);
    }

    const requestBody = this.buildRequestBody(params, false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') throw new AIError('timeout', 'Request timeout exceeded');
        throw error;
      }
      throw new AIError('unknown', 'Unknown error occurred');
    }
  }

  /**
   * OpenAI-compatible non-streaming request (used for Z.ai → Claude proxy)
   */
  private async makeOpenAIRequest(params: ChatParams): Promise<ChatResponse> {
    const body = this.buildOpenAIRequestBody(params, false);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json() as Record<string, unknown>;
      return this.parseOpenAIResponse(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') throw new AIError('timeout', 'Request timeout exceeded');
        throw error;
      }
      throw new AIError('unknown', 'Unknown error occurred');
    }
  }

  /**
   * Make a streaming request — dispatches to OpenAI or Anthropic format
   */
  private async *makeStreamingRequest(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const isZai = this.config.baseURL.includes('z.ai');
    if (isZai) {
      yield* this.makeOpenAIStreamingRequest(params);
      return;
    }

    const requestBody = this.buildRequestBody(params, true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw new AIError('invalid_request', 'Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            try {
              const chunk = JSON.parse(data) as StreamChunk;
              if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
                yield chunk.delta.text;
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') throw new AIError('timeout', 'Request timeout exceeded');
        throw error;
      }
      throw new AIError('unknown', 'Unknown error occurred');
    }
  }

  /**
   * OpenAI-compatible streaming request (Z.ai → Claude proxy)
   */
  private async *makeOpenAIStreamingRequest(params: ChatParams): AsyncGenerator<string, void, unknown> {
    const body = this.buildOpenAIRequestBody(params, true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(this.config.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      if (!response.body) {
        throw new AIError('invalid_request', 'Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') return;
            try {
              const chunk = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
              const text = chunk.choices?.[0]?.delta?.content;
              if (text) yield text;
            } catch (e) {
              console.warn('Failed to parse OpenAI SSE chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') throw new AIError('timeout', 'Request timeout exceeded');
        throw error;
      }
      throw new AIError('unknown', 'Unknown error occurred');
    }
  }

  /**
   * Build request body for Anthropic native API
   */
  private buildRequestBody(params: ChatParams, stream: boolean): Record<string, unknown> {
    const messages = params.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: params.maxTokens || this.config.maxTokens,
      temperature: params.temperature ?? this.config.temperature,
      messages,
      stream,
    };

    // Add system prompt
    if (params.systemPrompt || this.systemPrompt) {
      body.system = params.systemPrompt || this.systemPrompt;
    }

    // Add tools if provided
    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.input_schema,
      }));
    }

    // Add context to system prompt if provided
    if (params.context) {
      const contextInfo = this.formatContext(params.context);
      body.system = `${body.system || ''}\n\nCurrent Context:\n${contextInfo}`;
    }

    return body;
  }

  /**
   * Build request body for OpenAI-compatible API (Z.ai → Claude proxy).
   * Converts Anthropic tool schema format to OpenAI function format.
   * Handles mixed message content arrays (tool_use / tool_result blocks).
   */
  private buildOpenAIRequestBody(params: ChatParams, stream: boolean): Record<string, unknown> {
    // System prompt goes as first message with role 'system'
    const systemContent = params.systemPrompt || this.systemPrompt;
    if (params.context) {
      const contextInfo = this.formatContext(params.context);
      const combined = `${systemContent}\n\nCurrent Context:\n${contextInfo}`;
      var resolvedSystem = combined;
    } else {
      var resolvedSystem = systemContent;
    }

    // Convert messages — Anthropic content arrays → OpenAI format
    const messages: Array<Record<string, unknown>> = [
      { role: 'system', content: resolvedSystem },
    ];

    for (const msg of params.messages) {
      if (typeof msg.content === 'string') {
        messages.push({ role: msg.role, content: msg.content });
      } else if (Array.isArray(msg.content)) {
        // Content array — could contain tool_use or tool_result blocks
        const blocks = msg.content as Array<{ type: string; [k: string]: unknown }>;

        // tool_result blocks in a 'user' message → individual 'tool' role messages
        const toolResultBlocks = blocks.filter(b => b.type === 'tool_result');
        if (toolResultBlocks.length > 0) {
          for (const block of toolResultBlocks) {
            messages.push({
              role: 'tool',
              tool_call_id: block.tool_use_id as string,
              content: block.content as string ?? '',
            });
          }
          continue;
        }

        // tool_use blocks in an 'assistant' message → assistant message with tool_calls
        const toolUseBlocks = blocks.filter(b => b.type === 'tool_use');
        const textBlocks = blocks.filter(b => b.type === 'text');
        const textContent = textBlocks.map(b => b.text as string).join('');

        if (toolUseBlocks.length > 0) {
          messages.push({
            role: 'assistant',
            content: textContent || null,
            tool_calls: toolUseBlocks.map(b => ({
              id: b.id as string,
              type: 'function',
              function: {
                name: b.name as string,
                arguments: JSON.stringify(b.input),
              },
            })),
          });
          continue;
        }

        // Plain text blocks
        messages.push({ role: msg.role, content: textContent });
      }
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      max_tokens: params.maxTokens || this.config.maxTokens,
      temperature: params.temperature ?? this.config.temperature,
      messages,
      stream,
    };

    // Convert Anthropic tool schema → OpenAI function schema
    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.input_schema,
        },
      }));
    }

    return body;
  }

  /**
   * Parse OpenAI-compatible response into ChatResponse
   */
  private parseOpenAIResponse(data: Record<string, unknown>): ChatResponse {
    type OAIChoice = {
      message?: {
        content?: string | null;
        tool_calls?: Array<{
          id: string;
          function: { name: string; arguments: string };
        }>;
      };
      finish_reason?: string;
    };

    const choices = data.choices as OAIChoice[] | undefined;
    const choice = choices?.[0];
    const message = choice?.message;

    const content = message?.content ?? '';

    let toolCalls: ToolCall[] | undefined;
    if (message?.tool_calls && message.tool_calls.length > 0) {
      toolCalls = message.tool_calls.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        input: (() => {
          try { return JSON.parse(tc.function.arguments); }
          catch { return {}; }
        })(),
      }));
    }

    const usageRaw = data.usage as Record<string, number> | undefined;
    const usage: TokenUsage = {
      inputTokens: usageRaw?.prompt_tokens ?? 0,
      outputTokens: usageRaw?.completion_tokens ?? 0,
      totalCost: 0,
    };

    const finishReason = choice?.finish_reason;
    const stopReason: ChatResponse['stopReason'] =
      finishReason === 'tool_calls' ? 'tool_use' :
      finishReason === 'length' ? 'max_tokens' :
      'end_turn';

    return { content: content ?? '', toolCalls, usage, model: this.config.model, stopReason };
  }

  /**
   * Format execution context for system prompt
   */
  private formatContext(context: ExecutionContext): string {
    const parts: string[] = [];

    parts.push(`- User ID: ${context.userId}`);
    parts.push(`- Organization ID: ${context.organizationId}`);
    parts.push(`- Current Module: ${context.currentModule}`);

    if (context.recentActions.length > 0) {
      parts.push(`- Recent Actions:`);
      context.recentActions.slice(-5).forEach(action => {
        parts.push(`  * ${action.module}: ${action.action}`);
      });
    }

    if (context.permissions.length > 0) {
      parts.push(`- Permissions: ${context.permissions.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Parse API response
   */
  private parseResponse(data: Record<string, unknown>): ChatResponse {
    const content = this.extractContent(data);
    const toolCalls = this.extractToolCalls(data);
    const usage = this.extractUsage(data);

    return {
      content,
      toolCalls,
      usage,
      model: this.config.model,
      stopReason: data.stop_reason as ChatResponse['stopReason'],
    };
  }

  /**
   * Extract text content from response
   */
  private extractContent(data: Record<string, unknown>): string {
    if (Array.isArray(data.content)) {
      return data.content
        .filter((block: unknown) => typeof block === 'object' && block !== null && (block as { type: string }).type === 'text')
        .map((block: unknown) => ((block as { text: string }).text))
        .join('');
    }
    return '';
  }

  /**
   * Extract tool calls from response
   */
  private extractToolCalls(data: Record<string, unknown>): ToolCall[] | undefined {
    if (!Array.isArray(data.content)) return undefined;

    const toolUseBlocks = data.content.filter(
      (block: unknown) => typeof block === 'object' && block !== null && (block as { type: string }).type === 'tool_use'
    );

    if (toolUseBlocks.length === 0) return undefined;

    return toolUseBlocks.map((block: unknown) => {
      const toolBlock = block as { id: string; name: string; input: Record<string, unknown> };
      return {
        id: toolBlock.id,
        name: toolBlock.name,
        input: toolBlock.input,
      };
    });
  }

  /**
   * Extract token usage from response
   */
  private extractUsage(data: Record<string, unknown>): TokenUsage {
    const usage = data.usage as Record<string, number> | undefined;

    if (!usage) {
      return {
        inputTokens: 0,
        outputTokens: 0,
        totalCost: 0,
      };
    }

    return {
      inputTokens: usage.input_tokens || 0,
      outputTokens: usage.output_tokens || 0,
      cacheCreationTokens: usage.cache_creation_input_tokens || 0,
      cacheReadTokens: usage.cache_read_input_tokens || 0,
      totalCost: 0, // Calculated separately
    };
  }

  /**
   * Handle API error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: Record<string, unknown> = {};

    try {
      errorData = await response.json();
    } catch {
      // Error response is not JSON
    }

    const message = (errorData.error as { message?: string })?.message || response.statusText;

    switch (response.status) {
      case 401:
        throw new AIError('api_key_invalid', 'Invalid API key');
      case 429:
        throw new AIError('rate_limit_exceeded', 'Rate limit exceeded');
      case 400:
        throw new AIError('invalid_request', message);
      case 500:
        throw new AIError('unknown', 'Internal server error');
      default:
        throw new AIError('unknown', message);
    }
  }

  /**
   * Execute a tool call
   */
  async executeToolCall(toolCall: ToolCall, tools: Tool[], context: ExecutionContext): Promise<unknown> {
    const tool = tools.find(t => t.name === toolCall.name);

    if (!tool) {
      throw new Error(`Tool not found: ${toolCall.name}`);
    }

    if (!tool.handler) {
      throw new Error(`Tool has no handler: ${toolCall.name}`);
    }

    // Check if tool requires specific permissions
    if (tool.category === 'general' && tool.dangerous) {
      // Log dangerous tool usage
      console.warn(`Executing dangerous tool: ${toolCall.name}`);
    }

    return await tool.handler(toolCall.input, context);
  }

  /**
   * Chat with tools (handles tool calling loop)
   */
  async chatWithTools(params: ChatParams): Promise<ChatResponse> {
    const maxIterations = 10;
    let iteration = 0;
    let currentParams = { ...params };
    const allToolCalls: ToolCall[] = [];

    while (iteration < maxIterations) {
      const response = await this.complete(currentParams);

      // If no tool calls, return the response
      if (!response.toolCalls || response.toolCalls.length === 0) {
        return response;
      }

      // Execute tool calls
      for (const toolCall of response.toolCalls) {
        try {
          if (params.tools) {
            const result = await this.executeToolCall(toolCall, params.tools, params.context || this.createDefaultContext());

            allToolCalls.push({
              ...toolCall,
              result,
            });
          }
        } catch (error) {
          allToolCalls.push({
            ...toolCall,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Add assistant message with tool calls and user messages with results
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
      };

      const toolResultMessages: Message[] = allToolCalls.map(tc => ({
        role: 'user' as const,
        content: JSON.stringify({
          tool_use_id: tc.id,
          result: tc.result || tc.error,
        }),
        timestamp: Date.now(),
      }));

      currentParams = {
        ...currentParams,
        messages: [...currentParams.messages, assistantMessage, ...toolResultMessages],
      };

      iteration++;
    }

    throw new Error('Maximum tool iterations exceeded');
  }

  /**
   * chatWithToolsStreaming — hybrid tool-calling + streaming response.
   *
   * For each turn:
   *   1. Non-streaming complete() — needed to get full tool_use content blocks.
   *   2. Execute each tool_use block, yielding tool_start / tool_result events.
   *   3. Append the assistant + tool_result messages to history.
   *   4. Repeat until stop_reason is 'end_turn' (no more tool calls).
   *   5. Final assistant turn: stream the text response, yielding text_chunk events.
   *   6. Yield done.
   *
   * The caller sees: tool_start → tool_result → ... → text_chunk* → done
   */
  async *chatWithToolsStreaming(
    params: ChatParams,
  ): AsyncGenerator<AgentTurnEvent, void, unknown> {
    const MAX_ITERATIONS = 10;
    const context = params.context || this.createDefaultContext();

    // Working message list — we'll mutate this as we add tool turns
    // Use raw API format so we can pass tool_use content arrays properly
    type ApiMessage = { role: string; content: string | unknown[] };

    const apiMessages: ApiMessage[] = params.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      // Non-streaming call to detect tool_use
      const response = await this.complete({
        ...params,
        messages: apiMessages as unknown as Message[],
      });

      if (!response.toolCalls || response.toolCalls.length === 0) {
        // No tool calls — stream the final response
        // Re-issue as a streaming request with current history
        for await (const chunk of this.makeStreamingRequest({
          ...params,
          messages: apiMessages as unknown as Message[],
        })) {
          yield { type: 'text_chunk', content: chunk };
        }
        yield { type: 'done' };
        return;
      }

      // Build the assistant message content array (required by Anthropic API
      // for multi-turn tool use — must include both text and tool_use blocks)
      const assistantContentBlocks: unknown[] = [];
      if (response.content) {
        assistantContentBlocks.push({ type: 'text', text: response.content });
      }

      // Collect tool_result content for the follow-up user message
      const toolResultBlocks: unknown[] = [];

      for (const toolCall of response.toolCalls) {
        // Add tool_use block to assistant message
        assistantContentBlocks.push({
          type: 'tool_use',
          id: toolCall.id,
          name: toolCall.name,
          input: toolCall.input,
        });

        // Secondary capability guard: reject tool calls for tools not in params.tools.
        // Primary guard is the API-level filtering (Claude only sees tools in params.tools),
        // but this catches any edge case where the model hallucinates an unavailable tool.
        const toolAllowed = !params.tools || params.tools.some(t => t.name === toolCall.name);

        yield { type: 'tool_start', toolName: toolCall.name, toolId: toolCall.id, input: toolCall.input };

        const startMs = Date.now();
        let toolResult: unknown;
        let toolError: string | undefined;

        if (!toolAllowed) {
          toolError = `Tool '${toolCall.name}' is not available to this agent. The agent's capabilities do not include this action.`;
          toolResult = { error: toolError };
        } else {
          try {
            if (params.tools) {
              toolResult = await this.executeToolCall(toolCall, params.tools, context);
            } else {
              toolResult = { error: 'No tools configured' };
            }
          } catch (err) {
            toolError = err instanceof Error ? err.message : String(err);
            toolResult = { error: toolError };
          }
        }

        const durationMs = Date.now() - startMs;

        if (toolError) {
          yield { type: 'error', toolName: toolCall.name, error: toolError };
        } else {
          yield { type: 'tool_result', toolId: toolCall.id, toolName: toolCall.name, result: toolResult, durationMs };
        }

        toolResultBlocks.push({
          type: 'tool_result',
          tool_use_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }

      // Append assistant message with tool_use blocks
      apiMessages.push({ role: 'assistant', content: assistantContentBlocks });
      // Append user message with tool_result blocks
      apiMessages.push({ role: 'user', content: toolResultBlocks });
    }

    yield { type: 'error', toolName: 'executor', error: 'Maximum tool iterations exceeded' };
    yield { type: 'done' };
  }

  /**
   * Create default execution context
   */
  private createDefaultContext(): ExecutionContext {
    return {
      userId: 'unknown',
      organizationId: 'unknown',
      currentModule: 'general',
      recentActions: [],
      relevantData: {},
      permissions: [],
      timestamp: Date.now(),
    };
  }
}

/**
 * Create a singleton AI client instance
 */
let clientInstance: AIClient | null = null;

export function getAIClient(systemPrompt?: string): AIClient {
  if (!clientInstance || systemPrompt) {
    clientInstance = new AIClient(systemPrompt);
  }
  return clientInstance;
}

/**
 * Reset the AI client instance
 */
export function resetAIClient(): void {
  clientInstance = null;
}
