/**
 * Message List Component
 * Displays chat messages in a scrollable list
 */

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  theme?: {
    color?: string;
    borderRadius?: number;
  };
  showAvatar?: boolean;
  showSenderName?: boolean;
}

export function MessageList({
  messages,
  theme,
  showAvatar = true,
  showSenderName = true,
}: MessageListProps) {
  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="space-y-4">
      {groupedMessages.map((group) => (
        <div key={group.date}>
          {/* Date divider */}
          <div className="mb-4 flex items-center">
            <div className="flex-1 border-t border-gray-300" />
            <span className="mx-4 text-xs text-gray-500">{group.date}</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Messages */}
          <div className="space-y-2">
            {group.messages.map((message, index) => {
              const showAvatarForMessage =
                showAvatar &&
                message.sender_type !== 'visitor' &&
                (index === 0 || group.messages[index - 1].sender_id !== message.sender_id);

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwnMessage={message.sender_type === 'visitor'}
                  showAvatar={showAvatarForMessage}
                  showSenderName={showSenderName && message.sender_type !== 'visitor'}
                  theme={theme}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  theme?: {
    color?: string;
    borderRadius?: number;
  };
}

function MessageBubble({
  message,
  isOwnMessage,
  showAvatar,
  showSenderName,
  theme,
}: MessageBubbleProps) {
  const borderRadius = theme?.borderRadius || 8;

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
          {message.message}
        </span>
      </div>
    );
  }

  if (message.message_type === 'file' && message.file_url) {
    return (
      <div
        className={cn(
          'flex gap-2',
          isOwnMessage ? 'justify-end' : 'justify-start'
        )}
      >
        {!isOwnMessage && showAvatar && <AgentAvatar senderName={message.sender_name} />}

        <div
          className={cn(
            'max-w-[70%] rounded-lg p-3',
            isOwnMessage
              ? 'rounded-br-sm'
              : 'rounded-bl-sm'
          )}
          style={{
            backgroundColor: isOwnMessage
              ? theme?.color || '#3B82F6'
              : '#F3F4F6',
            color: isOwnMessage ? 'white' : '#1F2937',
            borderRadius: `${borderRadius}px ${borderRadius}px ${borderRadius}px ${borderRadius}px`,
          }}
        >
          {showSenderName && message.sender_name && (
            <p className="mb-1 text-xs font-semibold opacity-80">
              {message.sender_name}
            </p>
          )}

          <div className="flex items-center gap-2">
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 underline"
            >
              <span>📎</span>
              <span className="text-sm">{message.file_name || 'File'}</span>
            </a>
          </div>

          <span className="mt-1 text-xs opacity-70">
            {format(new Date(message.sent_at), 'h:mm a')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2',
        isOwnMessage ? 'justify-end' : 'justify-start'
      )}
    >
      {!isOwnMessage && showAvatar && <AgentAvatar senderName={message.sender_name} />}

      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2',
          isOwnMessage
            ? 'rounded-br-sm'
            : 'rounded-bl-sm'
        )}
        style={{
          backgroundColor: isOwnMessage
            ? theme?.color || '#3B82F6'
            : '#F3F4F6',
          color: isOwnMessage ? 'white' : '#1F2937',
          borderRadius: `${borderRadius}px ${borderRadius}px ${borderRadius}px ${borderRadius}px`,
        }}
      >
        {showSenderName && message.sender_name && (
          <p className="mb-1 text-xs font-semibold opacity-80">
            {message.sender_name}
          </p>
        )}

        <p className="text-sm whitespace-pre-wrap break-words">
          {message.message}
        </p>

        <span
          className={cn(
            'mt-1 text-xs opacity-70',
            isOwnMessage ? 'text-right' : 'text-left'
          )}
        >
          {format(new Date(message.sent_at), 'h:mm a')}
          {message.read_at && (
            <span className="ml-2">✓✓</span>
          )}
        </span>
      </div>
    </div>
  );
}

function AgentAvatar({ senderName }: { senderName?: string }) {
  const initials = senderName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AI';

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-300 text-xs font-medium text-gray-700">
      {initials}
    </div>
  );
}

// Helper function to group messages by date
function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: Record<string, ChatMessage[]> = {};

  for (const message of messages) {
    const date = format(new Date(message.sent_at), 'MMM d, yyyy');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  }

  return Object.entries(groups).map(([date, messages]) => ({
    date,
    messages,
  }));
}
