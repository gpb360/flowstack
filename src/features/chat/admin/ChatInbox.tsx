// @ts-nocheck
/**
 * Chat Inbox Component
 * Main agent inbox for managing conversations
 */

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useChatConversations } from '../hooks/useChatMessages';
import { ConversationView } from './ConversationView';
import { ConversationList } from './ConversationList';
import { ConversationFiltersPanel } from './ConversationFiltersPanel';
import type { ConversationFilters, ConversationSort } from '../types';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';

interface ChatInboxProps {
  organizationId: string;
  currentUserId?: string;
}

export function ChatInbox({ organizationId, currentUserId }: ChatInboxProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>({});
  const [sort, setSort] = useState<ConversationSort>({
    field: 'last_message_at',
    direction: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { conversations, isLoading, refetch, closeConversation, assignConversation } =
    useChatConversations(organizationId, filters, sort);

  const handleFilterChange = (newFilters: ConversationFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (field: ConversationSort['field']) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const activeCount = conversations.filter((c) => c.status === 'active').length;
  const waitingCount = conversations.filter((c) => c.status === 'waiting').length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="flex w-96 flex-col border-r bg-white">
        {/* Header */}
        <div className="border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
            <ButtonUntitled
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="icon"
              aria-label="Toggle filters"
            >
              <Filter className="h-4 w-4" />
            </ButtonUntitled>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-900">{activeCount}</span>
              <span className="text-gray-600"> Active</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{waitingCount}</span>
              <span className="text-gray-600"> Waiting</span>
            </div>
            <div>
              <span className="font-semibold text-gray-900">{conversations.length}</span>
              <span className="text-gray-600"> Total</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <InputUntitled
              type="text"
              placeholder="Search conversations..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ConversationFiltersPanel
            filters={filters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}

        {/* Conversations List */}
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          isLoading={isLoading}
          sort={sort}
          onSort={handleSortChange}
          onCloseConversation={closeConversation}
          currentUserId={currentUserId}
        />
      </div>

      {/* Main Content - Conversation View */}
      <div className="flex-1">
        {selectedConversation ? (
          <ConversationView
            key={selectedConversation}
            conversationId={selectedConversation}
            onClose={() => setSelectedConversation(null)}
            currentUserId={currentUserId}
            onCloseConversation={async () => {
              await closeConversation(selectedConversation);
              setSelectedConversation(null);
            }}
            onAssignConversation={assignConversation}
            onConversationUpdated={refetch}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
