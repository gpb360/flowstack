/**
 * SMS Conversation View Component
 * Shows message thread for a specific conversation
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Phone, MoreVertical, Paperclip } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { Avatar } from '@/components/ui/avatar';
import { useSMSThread, useSMSMessages, useSendSMS, useMarkThreadRead, useSMSNumbers } from '../hooks';
import { formatPhoneNumber } from '../lib/twilio';
import { formatDistanceToNow } from 'date-fns';
import { useParams } from 'react-router-dom';

export function SMSConversation() {
  const { threadId } = useParams<{ threadId: string }>();
  const [message, setMessage] = useState('');

  const { data: thread } = useSMSThread(threadId!);
  const { data: messages } = useSMSMessages(threadId!);
  const { data: phoneNumbers } = useSMSNumbers();
  const sendSMS = useSendSMS();
  const markRead = useMarkThreadRead();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark as read on first load
  useEffect(() => {
    if (threadId && thread?.unread_count! > 0) {
      markRead.mutateAsync(threadId);
    }
  }, [threadId, thread?.unread_count, markRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !thread || !phoneNumbers?.length) return;

    const fromNumber = phoneNumbers[0].phone_number;

    await sendSMS.mutateAsync({
      to: thread.participant_phone,
      from: fromNumber,
      body: message.trim(),
      threadId: thread.id,
    });

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500">Select a conversation to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-[#D4AF37]">
              {thread.contact?.first_name ? (
                <span className="text-white font-medium">
                  {thread.contact.first_name.charAt(0)}
                </span>
              ) : (
                <span className="text-white font-medium">
                  {thread.participant_phone.charAt(0)}
                </span>
              )}
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {thread.contact
                  ? `${thread.contact.first_name} ${thread.contact.last_name}`
                  : formatPhoneNumber(thread.participant_phone)}
              </h2>
              <p className="text-sm text-gray-600">
                {formatPhoneNumber(thread.participant_phone)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ButtonUntitled variant="outline" size="sm" isIconOnly>
              <Phone className="h-4 w-4" />
            </ButtonUntitled>
            <ButtonUntitled variant="ghost" size="sm" isIconOnly>
              <MoreVertical className="h-4 w-4" />
            </ButtonUntitled>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  msg.direction === 'outbound'
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="break-words">{msg.body}</p>

                {/* Media URLs (MMS) */}
                {msg.media_urls && msg.media_urls.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.media_urls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt="MMS attachment"
                        className="rounded-lg max-w-full h-auto"
                      />
                    ))}
                  </div>
                )}

                <div
                  className={`mt-1 flex items-center gap-2 text-xs ${
                    msg.direction === 'outbound' ? 'text-white/80' : 'text-gray-500'
                  }`}
                >
                  <span>
                    {formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true })}
                  </span>
                  {msg.direction === 'outbound' && (
                    <>
                      {msg.status === 'sent' && <span>Sent</span>}
                      {msg.status === 'delivered' && <span>Delivered</span>}
                      {msg.status === 'failed' && <span className="text-red-300">Failed</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2">
            <ButtonUntitled variant="ghost" size="sm" className="shrink-0" isIconOnly>
              <Paperclip className="h-5 w-5" />
            </ButtonUntitled>
            <div className="flex-1">
              <InputUntitled
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sendSMS.isPending}
              />
            </div>
            <ButtonUntitled
              onClick={handleSend}
              disabled={!message.trim() || sendSMS.isPending}
              className="shrink-0"
              isIconOnly
            >
              <Send className="h-5 w-5" />
            </ButtonUntitled>
          </div>
        </div>
      </div>
    </div>
  );
}
