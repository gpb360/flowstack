// @ts-nocheck
/**
 * Conversation View Component
 * Detailed view of a single conversation with messages
 */

import { useState } from 'react';
import { X, MoreVertical, Tag, UserPlus } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { AvatarUntitled } from '@/components/ui/avatar-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useChatMessages, useChatNotes, useChatTags } from '../hooks/useChatMessages';
import { MessageList } from '../widget/MessageList';
import { MessageInput } from '../widget/MessageInput';
import { ConversationDetails } from './ConversationDetails';
import { ConversationNotes } from './ConversationNotes';

interface ConversationViewProps {
  conversationId: string;
  onClose: () => void;
  currentUserId?: string;
  onCloseConversation: (id: string) => Promise<{ error: any }>;
  onAssignConversation?: (id: string, agentId: string) => Promise<{ error: any }>;
  onConversationUpdated?: () => void;
}

export function ConversationView({
  conversationId,
  onClose,
  currentUserId,
  onCloseConversation,
  onAssignConversation: _onAssignConversation,
  onConversationUpdated: _onConversationUpdated,
}: ConversationViewProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'details' | 'notes'>('chat');
  const [messageInput, setMessageInput] = useState('');

  const { messages, sendMessage, markAsRead } = useChatMessages({
    conversationId,
    enabled: true,
  });

  const { notes, createNote } = useChatNotes(conversationId);
  const { tags: _tags } = useChatTags(''); // Will need org ID

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput.trim(), 'agent', currentUserId);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mark messages as read when viewing
  if (currentUserId) {
    markAsRead('agent');
  }

  const visitorInfo = {
    name: messages[0]?.sender_name || 'Visitor',
    email: '', // Would come from conversation data
    phone: '', // Would come from conversation data
    location: '', // Would come from conversation data
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <AvatarUntitled className="h-10 w-10">
            <AvatarUntitled.Image src="" />
            <AvatarUntitled.Fallback>
              {visitorInfo.name[0]?.toUpperCase() || 'V'}
            </AvatarUntitled.Fallback>
          </AvatarUntitled>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{visitorInfo.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{visitorInfo.email}</span>
              {visitorInfo.phone && <span>• {visitorInfo.phone}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-md shadow-sm">
            <ButtonUntitled
              onClick={() => setActiveTab('chat')}
              variant={activeTab === 'chat' ? 'primary' : 'outline'}
              className="rounded-r-none rounded-l-md border-r-0"
            >
              Chat
            </ButtonUntitled>
            <ButtonUntitled
              onClick={() => setActiveTab('details')}
              variant={activeTab === 'details' ? 'primary' : 'outline'}
              className="rounded-none border-r-0"
            >
              Details
            </ButtonUntitled>
            <ButtonUntitled
              onClick={() => setActiveTab('notes')}
              variant={activeTab === 'notes' ? 'primary' : 'outline'}
              className="rounded-l-none rounded-r-md"
            >
              Notes ({notes.length})
            </ButtonUntitled>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonUntitled variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </ButtonUntitled>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign to...
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Tag className="mr-2 h-4 w-4" />
                Add tag
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onCloseConversation(conversationId)}
                className="text-red-600"
              >
                Close conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ButtonUntitled variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </ButtonUntitled>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="flex h-full flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <MessageList messages={messages} />
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <MessageInput
                    value={messageInput}
                    onChange={setMessageInput}
                    onSend={handleSendMessage}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                  />
                </div>
                <ButtonUntitled onClick={() => handleSendMessage()}>
                  Send
                </ButtonUntitled>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <ConversationDetails conversationId={conversationId} />
        )}

        {activeTab === 'notes' && (
          <ConversationNotes
            conversationId={conversationId}
            notes={notes}
            onCreateNote={createNote.mutate}
          />
        )}
      </div>
    </div>
  );
}
