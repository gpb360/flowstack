// @ts-nocheck
/**
 * Chat Window Component
 * Main chat interface with messages, input, and header
 */

import { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { AgentInfo } from './AgentInfo';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './typing-indicator/TypingIndicator';
import type { ChatWindowProps } from '../types';

export function ChatWindow({
  messages,
  onSendMessage,
  onTyping,
  isTyping,
  onClose,
  welcomeMessage,
  agentInfo,
  theme,
  isLoading = false,
}: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);

  const position = theme?.position || 'bottom-right';

  const positionClasses = {
    'bottom-right': 'bottom-24 right-6',
    'bottom-left': 'bottom-24 left-6',
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputValue.trim() || attachments.length > 0) {
      onSendMessage(inputValue.trim(), attachments);
      setInputValue('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col overflow-hidden rounded-lg shadow-2xl transition-all',
        isMinimized ? 'h-14 w-80' : 'h-[600px] w-[400px]',
        positionClasses[position]
      )}
      style={{
        backgroundColor: 'white',
        fontFamily: theme?.fontSize ? `var(--font-size-${theme.fontSize})` : undefined,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: theme?.color || '#3B82F6' }}
      >
        <AgentInfo agent={agentInfo} />
        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant="ghost"
            size="sm"
            isIconOnly
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-white hover:opacity-80"
            aria-label={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 className="h-4 w-4" />
          </ButtonUntitled>
          <ButtonUntitled
            variant="ghost"
            size="sm"
            isIconOnly
            onClick={onClose}
            className="text-white hover:text-white hover:opacity-80"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </ButtonUntitled>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                  <p className="text-sm">Connecting...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: theme?.color || '#3B82F6' }}
                >
                  <span className="text-2xl text-white">💬</span>
                </div>
                <p className="text-lg font-medium text-gray-800">
                  {welcomeMessage || 'How can we help you?'}
                </p>
              </div>
            ) : (
              <MessageList
                messages={messages}
                theme={theme}
              />
            )}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="border-t border-gray-200 bg-white px-4 py-2">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700"
                  >
                    <Paperclip className="h-3 w-3" />
                    <span className="max-w-[100px] truncate">{file.name}</span>
                    <button
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-gray-500 hover:text-red-600"
                      aria-label="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex items-end gap-2">
              <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                <Paperclip className="h-5 w-5" />
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileSelect}
                />
              </label>

              <div className="flex-1">
                <MessageInput
                  value={inputValue}
                  onChange={(value) => {
                    setInputValue(value);
                    if (value.length > 0) {
                      onTyping(true);
                    }
                  }}
                  onSend={handleSend}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                />
              </div>

              <ButtonUntitled
                variant="primary"
                size="sm"
                isIconOnly
                onClick={handleSend}
                disabled={!inputValue.trim() && attachments.length === 0}
                className="h-10 w-10 rounded-full"
                style={{
                  backgroundColor: (!inputValue.trim() && attachments.length === 0)
                    ? undefined
                    : theme?.color || '#3B82F6',
                }}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </ButtonUntitled>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
