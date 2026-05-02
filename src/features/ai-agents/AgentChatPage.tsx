/**
 * AgentChatPage
 * Scoped chat interface for a specific agent. Loads agent by ID from route params,
 * drives the full tool-calling execution loop, renders tool events inline.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bot,
  Send,
  User,
  Loader2,
  AlertCircle,
  Wrench,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { isConfigured } from '@/lib/ai/config';
import { useAgentChat, type ChatMessage, type ToolEventAttachment } from './hooks/useAgentChat';

// ────────────────────────────────────────────────────────────────────────────
// Tool result card (collapsible)
// ────────────────────────────────────────────────────────────────────────────

function ToolResultCard({ event }: { event: ToolEventAttachment }) {
  const [expanded, setExpanded] = useState(false);

  if (event.type === 'tool_start') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-text-muted py-1 pl-1">
        <Loader2 className="w-3 h-3 animate-spin text-primary/60 flex-shrink-0" />
        <span>
          Using tool: <span className="font-mono text-primary/80">{event.toolName}</span>…
        </span>
      </div>
    );
  }

  if (event.type === 'tool_result') {
    const result = event.result;
    let summary = 'done';
    let itemCount: number | null = null;

    if (Array.isArray(result)) {
      itemCount = result.length;
      summary = `${itemCount} result${itemCount !== 1 ? 's' : ''}`;
    } else if (result && typeof result === 'object') {
      // Check common result shapes
      const r = result as Record<string, unknown>;
      if (Array.isArray(r.contacts)) {
        itemCount = (r.contacts as unknown[]).length;
        summary = `${itemCount} contact${itemCount !== 1 ? 's' : ''}`;
      } else if (r.success === true) {
        summary = 'success';
      }
    }

    const jsonPreview = JSON.stringify(result, null, 2);
    const jsonLines = jsonPreview.split('\n');
    const truncated = jsonLines.length > 50 ? jsonLines.slice(0, 50).join('\n') + '\n… (truncated)' : jsonPreview;

    return (
      <div className="my-1 border border-border rounded-lg overflow-hidden text-xs">
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-surface hover:bg-surface-hover transition-colors text-left"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <span className="font-mono text-text-primary/80 flex-1">{event.toolName}</span>
          <span className="text-text-muted">{summary}</span>
          {event.durationMs != null && (
            <span className="text-text-muted tabular-nums">{event.durationMs}ms</span>
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          )}
        </button>
        {expanded && (
          <pre className="px-3 py-2 bg-background text-text-primary overflow-auto max-h-48 leading-relaxed">
            {truncated}
          </pre>
        )}
      </div>
    );
  }

  if (event.type === 'error') {
    return (
      <div className="flex items-start gap-1.5 text-xs text-red-500 my-1 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
        <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        <span>
          <span className="font-mono font-medium">{event.toolName}</span>
          {' — '}{event.error}
        </span>
      </div>
    );
  }

  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Message bubble
// ────────────────────────────────────────────────────────────────────────────

function MessageBubble({ message, agentColor }: { message: ChatMessage; agentColor: string }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${agentColor}20` }}
        >
          <Bot className="w-4 h-4" style={{ color: agentColor }} />
        </div>
      )}

      <div className="max-w-2xl space-y-0.5">
        {/* Tool result cards above the message text */}
        {!isUser && message.toolEvents && message.toolEvents.length > 0 && (
          <div className="px-1 space-y-0.5">
            {message.toolEvents.map((te, i) => (
              <ToolResultCard key={`${te.toolName}-${i}`} event={te} />
            ))}
          </div>
        )}

        <div
          className={`rounded-lg px-4 py-3 ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface border border-border'
          }`}
        >
          {message.content ? (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          ) : (
            !isUser && message.isStreaming && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────────

export function AgentChatPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { agent, agentLoading, agentError, messages, isLoading, error, sendMessage, clearMessages } =
    useAgentChat(agentId);

  const apiConfigured = isConfigured();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !apiConfigured) return;
    const text = input;
    setInput('');
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Loading / error states ──────────────────────────────────────────────

  if (agentLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (agentError || !agent) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <div>
          <p className="font-semibold text-text-primary">Agent not found</p>
          <p className="text-sm text-text-muted mt-1">{agentError || `No agent with ID "${agentId}"`}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/ai-agents')}
          className="text-sm text-primary hover:underline"
        >
          ← Back to agents
        </button>
      </div>
    );
  }

  const agentColor = agent.color || '#6366f1';

  // ── Suggested prompts based on agent type ──────────────────────────────

  const SUGGESTIONS: Record<string, string[]> = {
    crm:         ['How many contacts do we have?', 'Find contacts named John', 'Create a contact for jane@example.com'],
    workflow:    ['What workflows are active?', 'Trigger the onboarding workflow', 'Show workflow execution status'],
    marketing:   ['How many campaigns do we have?', 'Show contact growth this month'],
    analytics:   ['Show me key metrics', 'How many contacts joined this week?'],
    orchestrator:['What is the status of the business?', 'Find contacts and show me workflow stats'],
    custom:      ['What can you help me with?'],
    builder:     ['What pages have been published?'],
  };
  const suggestions = SUGGESTIONS[agent.agent_type] ?? ['What can you help me with?'];

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/ai-agents')}
          className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary"
          aria-label="Back to agents"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${agentColor}20` }}
        >
          <Bot className="w-5 h-5" style={{ color: agentColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-text-primary truncate">{agent.name}</h2>
          <p className="text-xs text-text-muted capitalize">{agent.agent_type} agent</p>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary"
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* API key warning */}
      {!apiConfigured && (
        <div className="mx-6 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-600">Claude API key not configured</p>
            <p className="text-text-muted mt-0.5">
              Add <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">VITE_CLAUDE_API_KEY</code> to your environment to enable agent chat.
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${agentColor}20` }}
              >
                <Wrench className="w-7 h-7" style={{ color: agentColor }} />
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{agent.name}</h3>
              <p className="text-sm text-text-muted mb-6">
                {agent.description || `A ${agent.agent_type} agent. Ask me anything.`}
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    disabled={!apiConfigured}
                    className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-lg text-sm text-left transition-colors disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} agentColor={agentColor} />
          ))
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-600">
            <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={apiConfigured ? `Message ${agent.name}… (Shift+Enter for new line)` : 'Configure VITE_CLAUDE_API_KEY to chat'}
            rows={1}
            disabled={isLoading || !apiConfigured}
            className="flex-1 px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '200px' }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 200) + 'px';
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !apiConfigured}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <p className="text-xs text-text-muted mt-2">
          {agent.capabilities.length > 0
            ? `${agent.capabilities.length} capability${agent.capabilities.length !== 1 ? 'ies' : 'y'} enabled`
            : 'All tools available (no capability restrictions)'}
        </p>
      </div>
    </div>
  );
}
