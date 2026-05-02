/**
 * Conversation List Component
 * List of conversations in the inbox sidebar
 */

import { formatDistanceToNow } from 'date-fns';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { cn } from '@/lib/utils';
import type { ChatConversation, ConversationSort } from '../types';

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  sort: ConversationSort;
  onSort: (field: ConversationSort['field']) => void;
  onCloseConversation: (id: string) => Promise<{ error: any }>;
  currentUserId?: string;
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading,
  sort,
  onSort,
  onCloseConversation: _onCloseConversation,
  currentUserId: _currentUserId,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm">Conversations will appear here when visitors start chatting</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sort Headers */}
      <div className="flex border-b bg-gray-50 px-4 py-2 text-xs font-medium text-gray-600">
        <ButtonUntitled
          onClick={() => onSort('last_message_at')}
          variant="ghost"
          className="flex flex-1 items-center gap-1 hover:text-gray-900"
        >
          Recent
          {sort.field === 'last_message_at' && (
            <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>
          )}
        </ButtonUntitled>
        <ButtonUntitled
          onClick={() => onSort('started_at')}
          variant="ghost"
          className="flex flex-1 items-center gap-1 hover:text-gray-900"
        >
          Started
          {sort.field === 'started_at' && (
            <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>
          )}
        </ButtonUntitled>
        <ButtonUntitled
          onClick={() => onSort('status')}
          variant="ghost"
          className="flex flex-1 items-center gap-1 hover:text-gray-900"
        >
          Status
          {sort.field === 'status' && (
            <span>{sort.direction === 'asc' ? '↑' : '↓'}</span>
          )}
        </ButtonUntitled>
      </div>

      {/* Conversations */}
      <div>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={cn(
              'cursor-pointer border-b p-4 transition-colors hover:bg-gray-50',
              selectedConversation === conversation.id && 'bg-blue-50 hover:bg-blue-50'
            )}
          >
            <div className="flex items-start justify-between">
              {/* Visitor Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.visitor_name || 'Visitor'}
                  </h3>
                  {conversation.visitor_email && (
                    <span className="text-xs text-gray-500 truncate">
                      ({conversation.visitor_email})
                    </span>
                  )}
                </div>

                <p className="mb-1 truncate text-sm text-gray-600">
                  {conversation.last_message || 'No messages yet'}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(conversation.started_at), {
                      addSuffix: true,
                    })}
                  </span>
                  {conversation.source_url && (
                    <span className="truncate max-w-[150px]">
                      from {new URL(conversation.source_url).hostname}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Meta */}
              <div className="ml-2 flex flex-col items-end gap-2">
                <BadgeUntitled className={getStatusColor(conversation.status)}>
                  {conversation.status}
                </BadgeUntitled>

                {conversation.assigned_to && (
                  <div className="flex items-center gap-1">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs text-blue-600">
                        {conversation.assigned_agent?.full_name?.[0] || 'A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {conversation.tags && conversation.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {conversation.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
