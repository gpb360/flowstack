/**
 * Base Agent Runtime
 *
 * Provides common infrastructure for all runtime implementations:
 * - AbortController for cancellation
 * - Accumulated cost and token tracking
 * - Tool result truncation for context safety
 * - Error normalization
 * - Context building helpers
 */

import type {
  AgentEvent,
  AgentRuntime,
  AgentRuntimeConfig,
  ExecutionContext,
  ToolDefinition,
  ToolResult,
  TokenUsage,
} from './types';

export const MAX_RESULT_ARRAY_ITEMS = 20;
export const MAX_RESULT_STRING_CHARS = 2000;

export abstract class BaseAgentRuntime implements AgentRuntime {
  abstract readonly name: string;
  abstract readonly provider: AgentRuntime['provider'];
  abstract readonly ready: boolean;

  protected _costUSD = 0;
  protected _tokenUsage: Required<TokenUsage> = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    totalCostUSD: 0,
  };

  protected _disposed = false;
  protected _running = false;
  protected _abortController: AbortController | null = null;

  protected defaultTools: ToolDefinition[] = [];
  protected defaultContext: ExecutionContext | null = null;

  // ─── Common Accumulated Stats ──────────────────────────────────────────────

  getCost(): number {
    return this._costUSD;
  }

  getTokenUsage(): TokenUsage {
    return { ...this._tokenUsage };
  }

  protected addCost(costUSD: number): void {
    this._costUSD += costUSD;
    this._tokenUsage.totalCostUSD = this._costUSD;
  }

  protected addTokenUsage(usage: TokenUsage): void {
    this._tokenUsage.inputTokens += usage.inputTokens;
    this._tokenUsage.outputTokens += usage.outputTokens;
    this._tokenUsage.cacheCreationTokens += usage.cacheCreationTokens ?? 0;
    this._tokenUsage.cacheReadTokens += usage.cacheReadTokens ?? 0;
    this._tokenUSD += usage.totalCostUSD;
    this._tokenUsage.totalCostUSD = this._costUSD;
  }

  private _tokenUSD = 0;

  // ─── Abort Control ────────────────────────────────────────────────────────

  abort(): void {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this._running = false;
  }

  protected getAbortSignal(): AbortSignal {
    if (!this._abortController || this._running === false) {
      this._abortController = new AbortController();
    }
    return this._abortController.signal;
  }

  protected startRun(): void {
    this._running = true;
  }

  protected endRun(): void {
    this._running = false;
    this._abortController = null;
  }

  // ─── Validation ────────────────────────────────────────────────────────────

  validateConfig(): void {
    if (this._disposed) {
      throw new Error(`${this.name} has been disposed and cannot be used`);
    }
  }

  dispose(): void {
    this.abort();
    this._disposed = true;
  }

  // ─── Tool Truncation (shared by all runtimes to prevent context overflow) ──

  protected truncateToolResult(result: unknown): unknown {
    if (Array.isArray(result)) {
      if (result.length > MAX_RESULT_ARRAY_ITEMS) {
        return [
          ...result.slice(0, MAX_RESULT_ARRAY_ITEMS),
          { _truncated: true, _total: result.length },
        ];
      }
      return result;
    }

    if (typeof result === 'string') {
      if (result.length > MAX_RESULT_STRING_CHARS) {
        return (
          result.slice(0, MAX_RESULT_STRING_CHARS) +
          `... [truncated, ${result.length} total chars]`
        );
      }
      return result;
    }

    if (result !== null && typeof result === 'object') {
      const obj = result as Record<string, unknown>;
      const truncated: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (Array.isArray(value) && value.length > MAX_RESULT_ARRAY_ITEMS) {
          truncated[key] = [
            ...value.slice(0, MAX_RESULT_ARRAY_ITEMS),
            { _truncated: true, _total: value.length },
          ];
        } else if (
          typeof value === 'string' &&
          value.length > MAX_RESULT_STRING_CHARS
        ) {
          truncated[key] =
            value.slice(0, MAX_RESULT_STRING_CHARS) + '... [truncated]';
        } else {
          truncated[key] = value;
        }
      }
      return truncated;
    }

    return result;
  }

  // ─── Execution Context Helpers ─────────────────────────────────────────────

  /**
   * Build a human-readable context summary for injection into prompts.
   * Used when the runtime doesn't support structured context injection.
   */
  protected buildContextSummary(context?: ExecutionContext): string {
    if (!context) return '';

    const lines: string[] = [];

    lines.push(`Organization: ${context.organizationName}`);
    lines.push(`User ID: ${context.userId}`);

    if (context.currentModule) {
      lines.push(`Current module: ${context.currentModule}`);
    }

    if (context.recentActions.length > 0) {
      lines.push('');
      lines.push('Recent actions:');
      for (const action of context.recentActions.slice(-5)) {
        lines.push(
          `  - [${action.module}] ${action.action}${
            action.data ? ` — ${JSON.stringify(action.data)}` : ''
          }`
        );
      }
    }

    return lines.join('\n');
  }

  /**
   * Build a permissions summary for injection into system prompts.
   */
  protected buildPermissionsSummary(context?: ExecutionContext): string {
    if (!context?.permissions) return 'No specific permissions granted.';

    const perms = context.permissions;
    const lines: string[] = [];

    if (perms.crm) {
      const c = perms.crm;
      const crmPerms: string[] = [];
      if (c.readContacts) crmPerms.push('read contacts');
      if (c.writeContacts) crmPerms.push('create/update contacts');
      if (c.readCompanies) crmPerms.push('read companies');
      if (c.writeCompanies) crmPerms.push('create/update companies');
      if (crmPerms.length) lines.push(`CRM: ${crmPerms.join(', ')}`);
    }

    if (perms.marketing) {
      const m = perms.marketing;
      const mktPerms: string[] = [];
      if (m.readCampaigns) mktPerms.push('read campaigns');
      if (m.writeCampaigns) mktPerms.push('create campaigns');
      if (m.sendEmail) mktPerms.push('send email');
      if (m.sendSMS) mktPerms.push('send SMS');
      if (mktPerms.length) lines.push(`Marketing: ${mktPerms.join(', ')}`);
    }

    if (perms.workflows) {
      const w = perms.workflows;
      const wfPerms: string[] = [];
      if (w.trigger) wfPerms.push('trigger workflows');
      if (w.read) wfPerms.push('read workflow status');
      if (w.write) wfPerms.push('create/update workflows');
      if (wfPerms.length) lines.push(`Workflows: ${wfPerms.join(', ')}`);
    }

    if (perms.github) {
      const g = perms.github;
      const ghPerms: string[] = [];
      if (g.read) ghPerms.push('read repositories');
      if (g.write) ghPerms.push('push to repositories');
      if (ghPerms.length) lines.push(`GitHub: ${ghPerms.join(', ')}`);
    }

    return lines.length > 0
      ? `Permissions:\n${lines.map(l => `  ${l}`).join('\n')}`
      : 'No specific permissions granted.';
  }

  // ─── Normalize Tool Definitions ────────────────────────────────────────────

  /**
   * Validate and merge tool definitions with defaults.
   * Runtimes can override this to apply runtime-specific tool schema.
   */
  protected mergeTools(config?: AgentRuntimeConfig): ToolDefinition[] {
    const tools = config?.tools ?? this.defaultTools;
    return tools.filter(Boolean);
  }

  // ─── Abstract Execute (must be implemented by subclasses) ─────────────────

  abstract execute(
    prompt: string,
    config?: AgentRuntimeConfig
  ): AsyncGenerator<AgentEvent, void, unknown>;
}
