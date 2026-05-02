/**
 * SMS Conversations List Component
 * Main view showing all SMS conversations
 */

import { useState } from 'react';
import { Search, MessageCircle, MoreVertical, Phone, Plus } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { useSMSThreads, useUnreadSMSCount } from '../hooks';
import { formatPhoneNumber } from '../lib/twilio';
import { formatDistanceToNow } from 'date-fns';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

export function SMSList() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: threads, isLoading } = useSMSThreads();
  const { data: unreadCount } = useUnreadSMSCount();
  const navigate = useNavigate();
  const { threadId } = useParams();

  const filteredThreads = threads?.filter((thread) =>
    thread.participant_phone.includes(searchQuery) ||
    thread.contact?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.contact?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.last_message_preview?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="flex h-screen">
      {/* Conversations List */}
      <div className="w-96 border-r bg-white">
        <div className="border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount || 0} unread conversations
              </p>
            </div>
            <ButtonUntitled>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </ButtonUntitled>
          </div>

          <InputUntitled
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="relative"
          />
        </div>

        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
          {isLoading ? (
            <div className="p-4 text-center">Loading conversations...</div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations found
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => navigate(`/phone/sms/${thread.id}`)}
                className={`cursor-pointer border-b p-4 transition-colors hover:bg-muted ${
                  threadId === thread.id ? 'bg-[#D4AF37]/10' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37] text-white font-semibold">
                        {thread.contact?.first_name?.charAt(0) ||
                          thread.participant_phone.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {thread.contact
                              ? `${thread.contact.first_name} ${thread.contact.last_name}`
                              : formatPhoneNumber(thread.participant_phone)}
                          </h3>
                          {thread.unread_count > 0 && (
                            <BadgeUntitled variant="error" size="sm">
                              {thread.unread_count}
                            </BadgeUntitled>
                          )}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {thread.last_message_preview}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-2 flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(thread.last_message_at!), { addSuffix: true })}
                    </span>
                    <ButtonUntitled variant="ghost" size="sm" isIconOnly className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </ButtonUntitled>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Conversation View */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
