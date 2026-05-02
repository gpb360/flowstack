/**
 * Agent Runtime Registry
 *
 * Factory and registry for all agent runtime implementations.
 *
 * Usage:
 *   // Register runtimes (call once at app startup)
 *   registerRuntimes();
 *
 *   // Get a runtime by name
 *   const runtime = await getRuntime('claude-api');
 *   for await (const event of runtime.execute('Hello')) {
 *     console.log(event);
 *   }
 *
 *   // Check which runtimes are available
 *   const available = listRuntimes();
 */

import type {
  AgentProvider,
  AgentRuntime,
  ClaudeRuntimeConfig,
  DeerFlowRuntimeConfig,
  ExecutionContext,
  RuntimeCapabilities,
} from './types';
import { RUNTIME_CAPABILITIES } from './types';
import { ClaudeAPIRuntime } from './claude-api';
import { DeerFlowRuntime } from './deerflow';

export type { AgentProvider };

// ─── Registry Map ─────────────────────────────────────────────────────────

type RuntimeFactory = (config?: Record<string, unknown>) => AgentRuntime;

const _registry = new Map<AgentProvider, RuntimeFactory>();
const _instances = new Map<AgentProvider, AgentRuntime>();

// ─── Registration ─────────────────────────────────────────────────────────

/**
 * Register all built-in runtimes.
 * Call once at app startup.
 */
export function registerRuntimes(): void {
  register('claude-api', (cfg) => new ClaudeAPIRuntime(cfg as ClaudeRuntimeConfig));
  register('deerflow', (cfg) => new DeerFlowRuntime(cfg as DeerFlowRuntimeConfig));
}

/**
 * Register a runtime factory.
 */
export function register(provider: AgentProvider, factory: RuntimeFactory): void {
  _registry.set(provider, factory);
}

/**
 * Unregister a runtime.
 */
export function unregister(provider: AgentProvider): void {
  _registry.delete(provider);
  _instances.delete(provider);
}

// ─── Factory ─────────────────────────────────────────────────────────────

/**
 * Get or create a runtime instance for the given provider.
 * Instances are cached per-provider.
 */
export async function getRuntime(
  provider: AgentProvider,
  config?: Record<string, unknown>
): Promise<AgentRuntime> {
  const factory = _registry.get(provider);
  if (!factory) {
    const available = Array.from(_registry.keys()).join(', ');
    throw new Error(
      `Unknown agent runtime provider: "${provider}". ` +
        `Available: ${available || 'none (call registerRuntimes() first)'}`
    );
  }

  if (!_instances.has(provider)) {
    _instances.set(provider, factory(config));
  }

  const instance = _instances.get(provider)!;
  instance.validateConfig();
  return instance;
}

/**
 * Get a runtime synchronously (no config validation).
 * Throws if not yet instantiated.
 */
export function getRuntimeSync(provider: AgentProvider): AgentRuntime {
  const instance = _instances.get(provider);
  if (!instance) {
    throw new Error(
      `Runtime "${provider}" not yet instantiated. Call getRuntime('${provider}') first.`
    );
  }
  return instance;
}

/**
 * List all registered runtime providers.
 */
export function listRuntimes(): AgentProvider[] {
  return Array.from(_registry.keys());
}

/**
 * Check if a runtime provider is registered.
 */
export function hasRuntime(provider: AgentProvider): boolean {
  return _registry.has(provider);
}

/**
 * Check if a runtime is ready (initialized and configured).
 */
export function isRuntimeReady(provider: AgentProvider): boolean {
  const instance = _instances.get(provider);
  return instance?.ready ?? false;
}

/**
 * Get capabilities for a runtime.
 */
export function getRuntimeCapabilities(
  provider: AgentProvider
): RuntimeCapabilities | null {
  return RUNTIME_CAPABILITIES[provider] ?? null;
}

/**
 * Dispose of a specific runtime instance.
 */
export function disposeRuntime(provider: AgentProvider): void {
  const instance = _instances.get(provider);
  if (instance) {
    instance.dispose();
    _instances.delete(provider);
  }
}

/**
 * Dispose of all runtime instances.
 */
export function disposeAll(): void {
  for (const [provider] of _instances) {
    disposeRuntime(provider);
  }
}

// ─── Convenience helpers ─────────────────────────────────────────────────

/**
 * Execute a prompt with a runtime and collect all text chunks.
 * Returns the full concatenated output.
 */
export async function executeAndCollect(
  provider: AgentProvider,
  prompt: string,
  config?: Record<string, unknown>
): Promise<string> {
  const runtime = await getRuntime(provider, config);
  let output = '';

  for await (const event of runtime.execute(prompt, config)) {
    if (event.type === 'text_chunk') {
      output += event.content;
    }
  }

  return output;
}

/**
 * Execute a prompt and yield only text chunks (no tool events).
 */
export async function* executeTextOnly(
  provider: AgentProvider,
  prompt: string,
  config?: Record<string, unknown>
): AsyncGenerator<string, void, unknown> {
  const runtime = await getRuntime(provider, config);

  for await (const event of runtime.execute(prompt, config)) {
    if (event.type === 'text_chunk') {
      yield event.content;
    }
  }
}

// ─── Context helpers ────────────────────────────────────────────────────

/**
 * Build an ExecutionContext from React Context values.
 * This bridges the React AuthContext to the agent runtime.
 */
export function buildExecutionContext(params: {
  userId: string;
  organizationId: string;
  organizationName: string;
  currentModule?: string;
  permissions?: Record<string, unknown>;
}): ExecutionContext {
  return {
    userId: params.userId,
    organizationId: params.organizationId,
    organizationName: params.organizationName,
    currentModule: params.currentModule ?? 'general',
    recentActions: [],
    permissions: (params.permissions ?? {}) as ExecutionContext['permissions'],
  };
}
