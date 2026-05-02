import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

interface Conversation {
  phoneNumber: string;
  messages: Array<{
    id: string;
    content: string;
    direction: 'inbound' | 'outbound';
    createdAt: Date;
  }>;
  unreadCount: number;
}

export const SMSConversations: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  // Mock data - in production, fetch from database
  const conversations: Conversation[] = [];

  const { data: messages = [] } = useQuery({
    queryKey: ['sms-conversations'],
    queryFn: async () => {
      // Fetch from database when implemented
      return [];
    },
  });

  const filteredConversations = conversations.filter((conv) =>
    conv.phoneNumber.includes(searchQuery)
  );

  const selectedConv = conversations.find((c) => c.phoneNumber === selectedConversation);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    // Send message logic here
    setMessageText('');
  };

  return (
    <div className="h-full flex gap-6">
      {/* Conversations List */}
      <CardUntitled className="w-80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <InputUntitled
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.phoneNumber}
                  onClick={() => setSelectedConversation(conv.phoneNumber)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conv.phoneNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{conv.phoneNumber}</span>
                    {conv.unreadCount > 0 && (
                      <BadgeUntitled variant="destructive" className="text-xs">
                        {conv.unreadCount}
                      </BadgeUntitled>
                    )}
                  </div>
                  <p className="text-xs opacity-75 mt-1 truncate">
                    {conv.messages[conv.messages.length - 1]?.content || 'No messages'}
                  </p>
                </div>
              ))}
              {filteredConversations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No conversations found
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </CardUntitled>

      {/* Conversation View */}
      <CardUntitled className="flex-1">
        {selectedConv ? (
          <>
            <CardHeader className="border-b">
              <CardTitle>{selectedConv.phoneNumber}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 py-4">
                {selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.direction === 'outbound' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {msg.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <InputUntitled
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <ButtonUntitled onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </ButtonUntitled>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </CardUntitled>
    </div>
  );
};

export default SMSConversations;
