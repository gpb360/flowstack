// @ts-nocheck
/**
 * Chat Widget Component
 * Main embeddable chat widget for websites
 */

import { useState, useEffect } from 'react';
import { ChatLauncher } from './ChatLauncher';
import { ChatWindow } from './ChatWindow';
import { PreChatForm } from './PreChatForm';
import { useChatWidget, useChatRealtime } from '../hooks/useChatMessages';
import type { ChatWidgetProps } from '../types';

export function ChatWidget({
  organizationId,
  theme,
  welcomeMessage,
  agentInfo,
  onMessageSent,
  onConversationStarted,
  preChatFormEnabled,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreChatForm, setShowPreChatForm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const {
    conversationId,
    settings,
    startConversation,
  } = useChatWidget(organizationId);

  const {
    messages,
    sendMessage,
    isTyping,
    broadcastTyping,
  } = useChatRealtime(conversationId || '');

  // Initialize conversation on first open if pre-chat form is not required
  useEffect(() => {
    if (isOpen && !initialized && !conversationId) {
      const needsPreChatForm = settings?.pre_chat_form_enabled || preChatFormEnabled;

      if (!needsPreChatForm) {
        startConversation().then((id) => {
          setInitialized(true);
          onConversationStarted?.(id);
        });
      } else {
        setShowPreChatForm(true);
      }
    }
  }, [isOpen, initialized, conversationId, settings, preChatFormEnabled, startConversation, onConversationStarted]);

  const handlePreChatSubmit = async (data: { name?: string; email?: string; phone?: string }) => {
    const id = await startConversation(data);
    setInitialized(true);
    setShowPreChatForm(false);
    onConversationStarted?.(id);
  };

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    await sendMessage(message, attachments);
    onMessageSent?.(message);
  };

  const effectiveTheme = {
    ...theme,
    color: theme?.color || settings?.widget_color,
    position: theme?.position || settings?.widget_position,
  };

  const effectiveWelcomeMessage = welcomeMessage || settings?.welcome_message;
  const effectiveAgentInfo = agentInfo || {
    name: settings?.header_title,
    status: 'online',
  };

  return (
    <>
      <ChatLauncher
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        theme={effectiveTheme}
      />

      {isOpen && (
        <>
          {!conversationId && showPreChatForm ? (
            <PreChatForm
              onSubmit={handlePreChatSubmit}
              onClose={() => {
                setShowPreChatForm(false);
                setIsOpen(false);
              }}
              theme={effectiveTheme}
              settings={settings}
            />
          ) : (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              onTyping={broadcastTyping}
              isTyping={isTyping}
              onClose={() => setIsOpen(false)}
              welcomeMessage={effectiveWelcomeMessage}
              agentInfo={effectiveAgentInfo}
              theme={effectiveTheme}
              isLoading={!conversationId}
            />
          )}
        </>
      )}
    </>
  );
}
