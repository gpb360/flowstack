/**
 * AI Context & Memory System
 * Manages user context, conversation memory, and smart context pruning
 */

import { supabase } from '../supabase';
import type {
  ExecutionContext,
  RecentAction,
  OrganizationContext,
  TeamMember,
  ConversationMemory,
  Message,
  MemorySearchParams,
} from './types';
import { useAuth } from '../../context/AuthContext';

// ============================================================================
// In-Memory Context Cache
// ============================================================================

interface ContextCache {
  userId: string;
  organizationId: string;
  currentModule: string;
  recentActions: RecentAction[];
  lastUpdated: number;
}

class ContextManager {
  private cache: Map<string, ContextCache> = new Map();
  private readonly MAX_RECENT_ACTIONS = 50;
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Get or create context cache entry
   */
  private getCacheEntry(userId: string, organizationId: string): ContextCache {
    const key = `${userId}:${organizationId}`;
    let entry = this.cache.get(key);

    const now = Date.now();

    if (!entry || (now - entry.lastUpdated) > this.CACHE_TTL) {
      entry = {
        userId,
        organizationId,
        currentModule: 'dashboard',
        recentActions: [],
        lastUpdated: now,
      };
      this.cache.set(key, entry);

      // Clean old cache entries
      this.cleanCache();
    }

    return entry;
  }

  /**
   * Clean old cache entries
   */
  private cleanCache(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);

    const toDelete = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
    toDelete.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Track a user action
   */
  trackAction(
    userId: string,
    organizationId: string,
    action: string,
    module: string,
    data?: Record<string, unknown>
  ): void {
    const entry = this.getCacheEntry(userId, organizationId);

    entry.recentActions.push({
      action,
      module,
      timestamp: Date.now(),
      data,
    });

    // Trim recent actions
    if (entry.recentActions.length > this.MAX_RECENT_ACTIONS) {
      entry.recentActions = entry.recentActions.slice(-this.MAX_RECENT_ACTIONS);
    }

    entry.currentModule = module;
    entry.lastUpdated = Date.now();
  }

  /**
   * Get execution context for a user
   */
  async getContext(userId: string, organizationId: string): Promise<ExecutionContext> {
    const entry = this.getCacheEntry(userId, organizationId);

    // Fetch user permissions from database
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    const permissions = this.getPermissionsForRole(membership?.role || 'member');

    return {
      userId,
      organizationId,
      currentModule: entry.currentModule,
      recentActions: [...entry.recentActions], // Return copy
      relevantData: await this.getRelevantData(organizationId),
      permissions,
      timestamp: Date.now(),
    };
  }

  /**
   * Get permissions for a role
   */
  private getPermissionsForRole(role: string): string[] {
    const basePermissions = ['read', 'search'];

    switch (role) {
      case 'owner':
        return [...basePermissions, 'write', 'delete', 'admin', 'integrations'];
      case 'admin':
        return [...basePermissions, 'write', 'delete', 'admin'];
      case 'member':
        return [...basePermissions, 'write'];
      default:
        return basePermissions;
    }
  }

  /**
   * Get relevant data for context
   */
  private async getRelevantData(organizationId: string): Promise<Record<string, unknown>> {
    try {
      // Fetch organization stats
      const [contactsCount, companiesCount, workflowsCount] = await Promise.all([
        supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        supabase
          .from('companies')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
        supabase
          .from('workflows')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', organizationId),
      ]);

      return {
        contactsCount: contactsCount.count || 0,
        companiesCount: companiesCount.count || 0,
        workflowsCount: workflowsCount.count || 0,
      };
    } catch (error) {
      console.error('Failed to fetch relevant data:', error);
      return {};
    }
  }

  /**
   * Clear context for a user
   */
  clearContext(userId: string, organizationId: string): void {
    const key = `${userId}:${organizationId}`;
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const contextManager = new ContextManager();

// ============================================================================
// Memory Storage (Supabase-backed)
// ============================================================================

/**
 * Save conversation memory to Supabase
 */
export async function saveConversationMemory(
  userId: string,
  organizationId: string,
  messages: Message[],
  context: ExecutionContext
): Promise<string> {
  try {
    // Generate a summary of the conversation
    const summary = await generateConversationSummary(messages);

    // Calculate approximate token count
    const tokenCount = messages.reduce((sum, msg) => sum + msg.content.length / 4, 0);

    const { data, error } = await supabase
      .from('conversation_memories')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        messages: messages as unknown as Record<string, unknown>, // Cast for JSONB
        context_data: context as unknown as Record<string, unknown>,
        summary,
        token_count: Math.round(tokenCount),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;

    return data.id;
  } catch (error) {
    console.error('Failed to save conversation memory:', error);
    throw error;
  }
}

/**
 * Load conversation memory from Supabase
 */
export async function loadConversationMemory(
  memoryId: string
): Promise<ConversationMemory | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('conversation_memories')
      .select('*')
      .eq('id', memoryId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      messages: data.messages as Message[],
      context: data.context_data as ExecutionContext,
      summary: data.summary,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    };
  } catch (error) {
    console.error('Failed to load conversation memory:', error);
    return null;
  }
}

/**
 * Search conversation memories
 */
export async function searchConversationMemories(
  params: MemorySearchParams
): Promise<ConversationMemory[]> {
  try {
    let query = supabase
      .from('conversation_memories')
      .select('*')
      .eq('user_id', params.userId)
      .eq('organization_id', params.organizationId);

    // Filter by module if specified
    if (params.module) {
      query = query.contains('context_data', { currentModule: params.module });
    }

    // Filter by time range if specified
    if (params.timeRange) {
      query = query.gte('created_at', new Date(params.timeRange.start).toISOString());
      query = query.lte('created_at', new Date(params.timeRange.end).toISOString());
    }

    // Search in summary and messages (full-text search)
    if (params.query) {
      query = query.or(`summary.ilike.%${params.query}%,messages.cs.{${params.query}}`);
    }

    // Order by most recent and limit
    query = query.order('created_at', { ascending: false }).limit(params.limit || 10);

    const { data, error } = await query;

    if (error) throw error;
    if (!data) return [];

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      userId: row.user_id as string,
      organizationId: row.organization_id as string,
      messages: row.messages as Message[],
      context: row.context_data as ExecutionContext,
      summary: row.summary as string | undefined,
      createdAt: new Date(row.created_at as string).getTime(),
      updatedAt: new Date(row.updated_at as string).getTime(),
    }));
  } catch (error) {
    console.error('Failed to search conversation memories:', error);
    return [];
  }
}

/**
 * Generate a summary of the conversation
 */
async function generateConversationSummary(messages: Message[]): Promise<string> {
  // Simple heuristic-based summary
  const lastMessage = messages[messages.length - 1];
  const firstMessage = messages[0];

  if (messages.length === 1) {
    return firstMessage.content.slice(0, 100) + (firstMessage.content.length > 100 ? '...' : '');
  }

  return `Conversation with ${messages.length} messages. Started with: "${firstMessage.content.slice(0, 50)}..." and ended with: "${lastMessage.content.slice(0, 50)}..."`;
}

// ============================================================================
// Context Pruning (Token Management)
// ============================================================================

/**
 * Prune messages to fit within token limit
 */
export function pruneMessagesToTokenLimit(
  messages: Message[],
  maxTokens: number,
  reserveForSystemPrompt = 1000
): Message[] {
  // Rough estimation: 1 token ≈ 4 characters
  const availableTokens = maxTokens - reserveForSystemPrompt;
  const estimatedCharsPerToken = 4;
  const maxChars = availableTokens * estimatedCharsPerToken;

  // Keep system messages and recent messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const userAndAssistantMessages = messages.filter(m => m.role !== 'system');

  let totalChars = 0;
  const prunedMessages: Message[] = [];

  // Always include system messages
  prunedMessages.push(...systemMessages);
  totalChars += systemMessages.reduce((sum, m) => sum + m.content.length, 0);

  // Add messages from most recent to oldest until we hit the limit
  for (let i = userAndAssistantMessages.length - 1; i >= 0; i--) {
    const message = userAndAssistantMessages[i];
    const messageSize = message.content.length + (message.metadata ? JSON.stringify(message.metadata).length : 0);

    if (totalChars + messageSize > maxChars) {
      break;
    }

    prunedMessages.unshift(message);
    totalChars += messageSize;
  }

  return prunedMessages;
}

/**
 * Create a context window with recent actions and relevant data
 */
export function createContextWindow(
  messages: Message[],
  context: ExecutionContext,
  maxTokens = 8000
): Message[] {
  // Create a system message with context
  const systemMessage: Message = {
    role: 'system',
    content: `Current context:
- Module: ${context.currentModule}
- Organization: ${context.organizationId}
- Permissions: ${context.permissions.join(', ')}

Recent actions:
${context.recentActions.slice(-5).map(a => `- ${a.module}: ${a.action}`).join('\n')}

Relevant data:
${Object.entries(context.relevantData)
  .map(([key, value]) => `- ${key}: ${JSON.stringify(value)}`)
  .join('\n')}`,
    timestamp: Date.now(),
  };

  const allMessages = [systemMessage, ...messages];
  return pruneMessagesToTokenLimit(allMessages, maxTokens);
}

// ============================================================================
// React Hook for Context Management
// ============================================================================

import { useEffect, useState } from 'react';

export function useAIContext() {
  const { user, currentOrganization } = useAuth();
  const [context, setContext] = useState<ExecutionContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !currentOrganization) {
      setContext(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    contextManager
      .getContext(user.id, currentOrganization.id)
      .then(ctx => {
        setContext(ctx);
      })
      .catch(error => {
        console.error('Failed to load AI context:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user, currentOrganization]);

  const trackAction = (action: string, module: string, data?: Record<string, unknown>) => {
    if (!user || !currentOrganization) return;

    contextManager.trackAction(user.id, currentOrganization.id, action, module, data);

    // Update local state
    setContext(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        recentActions: [
          ...prev.recentActions,
          {
            action,
            module,
            timestamp: Date.now(),
            data,
          },
        ].slice(-50),
      };
    });
  };

  return {
    context,
    isLoading,
    trackAction,
  };
}

// ============================================================================
// Organization Context
// ============================================================================

/**
 * Get organization context for AI
 */
export async function getOrganizationContext(organizationId: string): Promise<OrganizationContext> {
  try {
    // Fetch organization details
    const { data: org } = await (supabase as any)
      .from('organizations')
      .select('id, name')
      .eq('id', organizationId)
      .single();

    if (!org) {
      throw new Error('Organization not found');
    }

    // Fetch members
    const { data: memberships } = await (supabase as any)
      .from('memberships')
      .select(`
        role,
        user_id,
        user_profiles (
          id,
          email,
          full_name
        )
      `)
      .eq('organization_id', organizationId);

    const members: TeamMember[] = (memberships || []).map((m: any) => ({
      id: m.user_id,
      name: m.user_profiles?.full_name || m.user_profiles?.email || 'Unknown',
      email: m.user_profiles?.email || '',
      role: m.role,
    }));

    // Get counts
    const [contactsCount, campaignsCount, workflowsCount] = await Promise.all([
      (supabase as any).from('contacts').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
      (supabase as any).from('marketing_campaigns').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
      (supabase as any).from('workflows').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
    ]);

    return {
      id: org.id,
      name: org.name,
      members,
      activeWorkflows: workflowsCount.count || 0,
      contactsCount: contactsCount.count || 0,
      campaignsCount: campaignsCount.count || 0,
    };
  } catch (error) {
    console.error('Failed to fetch organization context:', error);
    throw error;
  }
}
