/**
 * AI Configuration Management
 * Handles API key management, model selection, and configuration
 */

import type { AIConfig, DEFAULT_AI_CONFIG } from './types';

/**
 * Get the AI API key from environment variables.
 * Supports VITE_ZAI_API_KEY (Z.ai → Claude proxy) or VITE_CLAUDE_API_KEY (direct Anthropic).
 */
export function getApiKey(): string {
  // Priority: ZAI key → Claude key → localStorage → throw
  const zaiKey = import.meta.env.VITE_ZAI_API_KEY;
  if (zaiKey) return zaiKey;

  const envKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (envKey) return envKey;

  // Check localStorage for development/testing
  try {
    const storedKey = localStorage.getItem('claude_api_key');
    if (storedKey) return storedKey;
  } catch (e) {
    // localStorage might be disabled
  }

  throw new Error(
    'AI API key not found. Set VITE_ZAI_API_KEY (Z.ai proxy) or VITE_CLAUDE_API_KEY environment variable.'
  );
}

/**
 * Set API key in localStorage (for development only)
 */
export function setApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('claude_api_key', key);
  } catch (e) {
    console.error('Failed to store API key:', e);
  }
}

/**
 * Clear API key from localStorage
 */
export function clearApiKey(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('claude_api_key');
  } catch (e) {
    console.error('Failed to clear API key:', e);
  }
}

/**
 * Get the AI configuration.
 * When VITE_ZAI_API_KEY is set, uses Z.ai's OpenAI-compatible Claude proxy.
 * Otherwise falls back to direct Anthropic API.
 */
export function getConfig(): AIConfig {
  const useZai = !!import.meta.env.VITE_ZAI_API_KEY;

  return {
    apiKey: getApiKey(),
    model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-5',
    baseURL: useZai
      ? 'https://api.z.ai/api/paas/v4/chat/completions'
      : 'https://api.anthropic.com/v1/messages',
    maxTokens: 8192,
    temperature: 0.7,
    timeout: 60000,
    maxRetries: 3,
    retryDelay: 1000,
  };
}

/**
 * Check if the AI is properly configured
 */
export function isConfigured(): boolean {
  try {
    getApiKey();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get model-specific defaults
 */
export function getModelDefaults(model: string): Partial<typeof DEFAULT_AI_CONFIG> {
  const defaults: Record<string, Partial<typeof DEFAULT_AI_CONFIG>> = {
    'claude-3-5-sonnet-20241022': {
      maxTokens: 8192,
      temperature: 0.7,
    },
    'claude-3-5-haiku-20241022': {
      maxTokens: 4096,
      temperature: 0.7,
    },
    'claude-3-opus-20240229': {
      maxTokens: 4096,
      temperature: 0.7,
    },
  };

  return defaults[model] || {};
}

/**
 * Validate configuration
 */
export function validateConfig(config: AIConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('API key is missing');
  }

  if (!config.model) {
    errors.push('Model is not specified');
  }

  if (config.maxTokens < 1 || config.maxTokens > 200000) {
    errors.push('maxTokens must be between 1 and 200000');
  }

  if (config.temperature < 0 || config.temperature > 1) {
    errors.push('temperature must be between 0 and 1');
  }

  if (config.timeout < 1000) {
    errors.push('timeout must be at least 1000ms');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
