/**
 * Chat Component (Untitled UI)
 *
 * A versatile chat interface for real-time messaging.
 * Based on Untitled UI Chat design.
 *
 * Features:
 * - Message bubbles with avatars
 * - Typing indicators
 * - Timestamp display
 * - Read receipts
 * - Auto-scroll to bottom
 * - Message input with send button
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { Send, Paperclip, Smile } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  avatar?: string | null;
  senderName?: string;
}

export interface ChatUntitledProps {
  /**
   * Chat messages
   */
  messages: ChatMessage[];

  /**
   * Current user ID
   */
  currentUserId?: string;

  /**
   * Avatar URL for current user
   */
  userAvatar?: string;

  /**
   * Agent avatar URL or component
   */
  agentAvatar?: string | LucideIcon;

  /**
   * Agent name
   */
  agentName?: string;

  /**
   * Whether someone is typing
   */
  isTyping?: boolean;

  /**
   * Typing indicator text
   */
  typingText?: string;

  /**
   * On send message callback
   */
  onSendMessage: (content: string) => void;

  /**
   * On attachment click
   */
  onAttachment?: () => void;

  /**
   * Placeholder text for input
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Show timestamps
   */
  showTimestamps?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Message Bubble Component
// ============================================================================

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  userAvatar?: string;
  agentAvatar?: string | LucideIcon;
  agentName?: string;
  currentUserId?: string;
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
  function MessageBubbleImpl({
    message,
    isOwn,
    showAvatar = true,
    showTimestamp = true,
    userAvatar,
    agentAvatar,
    agentName: _agentName,
    currentUserId: _currentUserId,
  }, ref) {
    const avatarSrc = message.sender === 'user' ? message.avatar || userAvatar : (typeof agentAvatar === 'string' ? agentAvatar : undefined);

    const statusIcons = {
      sending: '○',
      sent: '○',
      delivered: '✓',
      read: '✓✓',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 mb-4 max-w-[85%]',
          isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
        )}
      >
        {/* Avatar */}
        {showAvatar && (
          <div className="flex-shrink-0">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={message.senderName || 'Avatar'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : typeof agentAvatar === 'function' ? (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {React.createElement(agentAvatar, { className: 'w-5 h-5 text-primary' })}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
                <span className="text-xs font-semibold text-text-secondary">
                  {(message.senderName || message.sender)[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
          {/* Sender Name (for group chats) */}
          {message.senderName && message.sender !== 'user' && (
            <span className="text-xs text-text-muted mb-1">
              {message.senderName}
            </span>
          )}

          {/* Bubble */}
          <div
            className={cn(
              'px-4 py-2 rounded-2xl',
              isOwn
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-hover text-text-primary'
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>

          {/* Footer: Timestamp and Status */}
          {showTimestamp && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs text-text-muted', isOwn ? 'flex-row-reverse' : 'flex-row')}>
              {message.timestamp && (
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {isOwn && message.status && (
                <span className="text-text-muted">{statusIcons[message.status]}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

// ============================================================================
// Typing Indicator Component
// ============================================================================

interface TypingIndicatorProps {
  agentName?: string;
  text?: string;
  avatar?: string | LucideIcon;
  className?: string;
}

export const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(
  function TypingIndicatorImpl({ agentName = 'Agent', text = 'typing...', avatar, className }, ref) {
    return (
      <div ref={ref} className={cn('flex items-center gap-3 mb-4 text-text-muted', className)}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            typeof avatar === 'string' ? (
              <img src={avatar} alt={agentName} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {React.createElement(avatar, { className: 'w-5 h-5 text-primary' })}
              </div>
            )
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{agentName[0]}</span>
            </div>
          )}
        </div>

        {/* Typing Animation */}
        <div className="flex items-center gap-1">
          <span className="text-sm">{text}</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }
);

TypingIndicator.displayName = 'TypingIndicator';

// ============================================================================
// Chat Input Component
// ============================================================================

export interface ChatInputUntitledProps {
  /**
   * Input value
   */
  value: string;

  /**
   * On change callback
   */
  onChange: (value: string) => void;

  /**
   * On send callback
   */
  onSend: (content: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Disabled state
   */
  disabled?: boolean;

  /**
   * Show attachment button
   */
  showAttachment?: boolean;

  /**
   * Show emoji button
   */
  showEmoji?: boolean;

  /**
   * Max length
   */
  maxLength?: number;

  /**
   * On attachment click
   */
  onAttachment?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ChatInputUntitled = React.forwardRef<HTMLDivElement, ChatInputUntitledProps>(
  function ChatInputUntitledImpl({
    value,
    onChange,
    onSend,
    placeholder = 'Type a message...',
    disabled = false,
    showAttachment = true,
    showEmoji = true,
    maxLength = 2000,
    onAttachment,
    className,
  }, ref) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !disabled) {
          onSend(value.trim());
          onChange('');
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-end gap-2 p-4 bg-surface border-t border-border',
          className
        )}
      >
        {/* Attachment Button */}
        {showAttachment && (
          <button
            type="button"
            onClick={onAttachment}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}

        {/* Input Field */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className={cn(
              'w-full px-4 py-2 bg-background border border-border rounded-lg resize-none',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              'placeholder:text-text-muted',
              'min-h-[40px] max-h-32'
            )}
            style={{
              height: 'auto',
              minHeight: '40px',
            }}
          />
        </div>

        {/* Emoji Button */}
        {showEmoji && (
          <button
            type="button"
            disabled={disabled}
            className="flex-shrink-0 p-2 text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Insert emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        )}

        {/* Send Button */}
        <button
          type="button"
          onClick={() => {
            if (value.trim() && !disabled) {
              onSend(value.trim());
              onChange('');
            }
          }}
          disabled={disabled || !value.trim()}
          className={cn(
            'flex-shrink-0 p-2 rounded-lg transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    );
  }
);

ChatInputUntitled.displayName = 'ChatInputUntitled';

// ============================================================================
// Main Chat Component
// ============================================================================

export const ChatUntitled = React.forwardRef<HTMLDivElement, ChatUntitledProps>(
  function ChatUntitledImpl({
    messages,
    currentUserId,
    userAvatar,
    agentAvatar,
    agentName = 'Assistant',
    isTyping = false,
    typingText = 'typing...',
    onSendMessage,
    onAttachment,
    placeholder = 'Type a message...',
    disabled = false,
    showTimestamps = true,
    className,
  }, ref) {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages]);

    return (
      <div ref={ref} className={cn('flex flex-col h-full bg-background', className)}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Header */}
          {(agentName || agentAvatar) && (
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              {agentAvatar && (
                typeof agentAvatar === 'string' ? (
                  <img
                    src={agentAvatar}
                    alt={agentName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {React.createElement(agentAvatar, { className: 'w-6 h-6 text-primary' })}
                  </div>
                )
              )}
              <div>
                <h3 className="font-semibold text-text-primary">{agentName}</h3>
                <p className="text-xs text-text-muted">Online</p>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex flex-col">
            {messages.map((message) => {
              const isOwn = message.sender === 'user';
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={message.sender !== 'system'}
                  showTimestamp={showTimestamps}
                  userAvatar={userAvatar}
                  agentAvatar={agentAvatar}
                  agentName={agentName}
                  currentUserId={currentUserId}
                />
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <TypingIndicator
                agentName={agentName}
                text={typingText}
                avatar={agentAvatar}
              />
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <ChatInputUntitled
          value="" // Controlled by parent state
          onChange={() => {}}
          onSend={onSendMessage}
          placeholder={placeholder}
          disabled={disabled}
          showAttachment={!!onAttachment}
          onAttachment={onAttachment}
        />
      </div>
    );
  }
);

ChatUntitled.displayName = 'ChatUntitled';
