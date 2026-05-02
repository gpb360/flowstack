/**
 * useAgentChat
 * Manages conversation state for a specific agent, drives executeAgentTurn(),
 * and exposes the message list + send function to the chat UI.
 */

import { useState, useCallback, useRef } from 'react';
import { useAgent } from './useAgents';
import { useAuth } from '@/context/AuthContext';
import { executeAgentTurn } from '@/lib/ai/executor';
import type { Message, AgentTurnEvent, ExecutionContext } from '@/lib/ai/types';

export interface ToolEventAttachment {
  type: 'tool_start' | 'tool_result' | 'error';
  toolName: string;
  toolId?: string;
  input?: Record<string, unknown>;
  result?: unknown;
  durationMs?: number;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  toolEvents?: ToolEventAttachment[];
}

function getPermissionsForRole(role: string | null | undefined): string[] {
  const base = ['read', 'search'];
  switch (role) {
    case 'owner': return [...base, 'write', 'delete', 'admin', 'integrations'];
    case 'admin': return [...base, 'write', 'delete', 'admin'];
    case 'member': return [...base, 'write'];
    default: return base;
  }
}

export function useAgentChat(agentId: string | undefined) {
  const { data: agent, isLoading: agentLoading, error: agentError } = useAgent(agentId);
  const { user, currentOrganization, currentRole } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the current assistant message ID being streamed so we can append to it
  const streamingIdRef = useRef<string | null>(null);
  // Track conversation history for the API (plain Message format)
  const historyRef = useRef<Message[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    if (!agent || !user || !currentOrganization) {
      setError('Not ready — agent, user, or organization missing.');
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);

    // Append to history
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content, timestamp: Date.now() },
    ];

    // Create placeholder assistant message
    const assistantId = `assistant-${Date.now() + 1}`;
    streamingIdRef.current = assistantId;

    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
      toolEvents: [],
    };

    setMessages(prev => [...prev, assistantMsg]);

    const context: ExecutionContext = {
      userId: user.id,
      organizationId: currentOrganization.id,
      currentModule: 'ai_agents',
      recentActions: [],
      relevantData: {},
      permissions: getPermissionsForRole(currentRole),
      timestamp: Date.now(),
    };

    let finalContent = '';

    try {
      const stream = executeAgentTurn(
        agent,
        historyRef.current,
        context,
        currentOrganization.name,
      );

      for await (const event of stream) {
        handleEvent(event, assistantId, (text) => { finalContent = text; });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(msg);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `Error: ${msg}`, isStreaming: false }
            : m,
        ),
      );
    } finally {
      // Finalize streaming state
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId ? { ...m, isStreaming: false } : m,
        ),
      );

      // Append final assistant message to history
      if (finalContent) {
        historyRef.current = [
          ...historyRef.current,
          { role: 'assistant', content: finalContent, timestamp: Date.now() },
        ];
      }

      streamingIdRef.current = null;
      setIsLoading(false);
    }
  }, [agent, user, currentOrganization, currentRole]);

  function handleEvent(
    event: AgentTurnEvent,
    assistantId: string,
    onText: (full: string) => void,
  ) {
    switch (event.type) {
      case 'text_chunk':
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== assistantId) return m;
            const newContent = m.content + event.content;
            onText(newContent);
            return { ...m, content: newContent };
          }),
        );
        break;

      case 'tool_start':
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== assistantId) return m;
            return {
              ...m,
              toolEvents: [
                ...(m.toolEvents ?? []),
                {
                  type: 'tool_start' as const,
                  toolName: event.toolName,
                  toolId: event.toolId,
                  input: event.input,
                },
              ],
            };
          }),
        );
        break;

      case 'tool_result':
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== assistantId) return m;
            // Replace the matching tool_start with a tool_result
            const toolEvents = (m.toolEvents ?? []).map(te =>
              te.toolId === event.toolId && te.type === 'tool_start'
                ? {
                    type: 'tool_result' as const,
                    toolName: event.toolName,
                    toolId: event.toolId,
                    result: event.result,
                    durationMs: event.durationMs,
                  }
                : te,
            );
            return { ...m, toolEvents };
          }),
        );
        break;

      case 'error':
        setMessages(prev =>
          prev.map(m => {
            if (m.id !== assistantId) return m;
            return {
              ...m,
              toolEvents: [
                ...(m.toolEvents ?? []),
                {
                  type: 'error' as const,
                  toolName: event.toolName,
                  error: event.error,
                },
              ],
            };
          }),
        );
        break;

      case 'done':
        break;
    }
  }

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    historyRef.current = [];
  }, []);

  return {
    agent,
    agentLoading,
    agentError: agentError ? (agentError as Error).message : null,
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
