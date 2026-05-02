// @ts-nocheck
// TODO: Fix Supabase return type unwrapping in all queryFn callbacks
/**
 * Chat Hooks
 * Custom React hooks for chat functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  ChatConversation,
  ChatMessage,
  ChatSettings,
  ChatTag,
  ChatCannedResponse,
  ChatAnalytics,
  ChatAgentStatus,
  ChatNote,
  ConversationFilters,
  ConversationSort,
  SenderType,
} from '../types';
import * as chatApi from '../lib/supabase';

// =====================================================
// useChatMessages Hook
// =====================================================

interface UseChatMessagesOptions {
  conversationId: string;
  enabled?: boolean;
  pollInterval?: number;
}

export function useChatMessages(
  { conversationId, enabled = true, pollInterval = 0 }: UseChatMessagesOptions
) {
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);

  // Fetch messages
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-messages', conversationId],
    queryFn: async () => { const r = await chatApi.fetchMessages(conversationId); return r.data || []; },
    enabled: enabled && !!conversationId,
    refetchInterval: pollInterval,
  });

  // Real-time subscription
  useEffect(() => {
    if (!enabled || !conversationId) return;

    const channel = chatApi.subscribeToMessages(conversationId, (message) => {
      queryClient.setQueryData<ChatMessage[]>(
        ['chat-messages', conversationId],
        (old = []) => [...old, message]
      );
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, enabled, queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      message,
      senderType = 'visitor',
      senderId,
      fileUrl,
      fileName,
    }: {
      message: string;
      senderType?: SenderType;
      senderId?: string;
      fileUrl?: string;
      fileName?: string;
    }) => {
      setIsSending(true);
      return chatApi.sendMessage({
        conversation_id: conversationId,
        sender_type: senderType,
        sender_id: senderId,
        message,
        message_type: fileUrl ? 'file' : 'text',
        file_url: fileUrl,
        file_name: fileName,
      });
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData<ChatMessage[]>(
          ['chat-messages', conversationId],
          (old = []) => [...old, data]
        );
      }
      setIsSending(false);
    },
    onError: () => {
      setIsSending(false);
    },
  });

  const sendMessage = useCallback(
    (message: string, senderType?: SenderType, senderId?: string, fileUrl?: string, fileName?: string) => {
      return sendMessageMutation.mutate({
        message,
        senderType,
        senderId,
        fileUrl,
        fileName,
      });
    },
    [sendMessageMutation]
  );

  // Mark as read
  const markAsRead = useCallback(
    async (senderType: SenderType) => {
      await chatApi.markMessagesAsRead(conversationId, senderType);
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    [conversationId, queryClient]
  );

  return {
    messages,
    isLoading,
    error,
    refetch,
    sendMessage,
    markAsRead,
    isSending: isSending || sendMessageMutation.isPending,
  };
}

// =====================================================
// useChatRealtime Hook
// =====================================================

export function useChatRealtime(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof chatApi.subscribeToMessages> | null>(null);

  useEffect(() => {
    // Subscribe to new messages
    const messageChannel = chatApi.subscribeToMessages(conversationId, (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Subscribe to typing indicator
    const typingChannel = chatApi.subscribeToTypingIndicator(conversationId, (typing) => {
      setIsTyping(typing);
    });

    channelRef.current = messageChannel;

    // Load existing messages
    chatApi.fetchMessages(conversationId).then(({ data }) => {
      if (data) setMessages(data);
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (content: string, attachments?: File[]) => {
      const { error } = await chatApi.sendMessage({
        conversation_id: conversationId,
        sender_type: 'visitor',
        message: content,
      });

      if (error) throw error;
    },
    [conversationId]
  );

  const broadcastTyping = useCallback(
    (typing: boolean) => {
      chatApi.broadcastTypingIndicator(conversationId, typing);
    },
    [conversationId]
  );

  return { messages, sendMessage, isTyping, broadcastTyping };
}

// =====================================================
// useChatWidget Hook
// =====================================================

export function useChatWidget(organizationId: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['chat-settings', organizationId],
    queryFn: async () => { const r = await chatApi.fetchChatSettings(organizationId); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!organizationId,
  });

  const startConversation = useCallback(
    async (visitorInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    }) => {
      const visitorData = chatApi.detectVisitorInfo();
      const utmParams = chatApi.getUTMParameters();

      const { data, error } = await chatApi.createConversation({
        organization_id: organizationId,
        visitor_name: visitorInfo?.name,
        visitor_email: visitorInfo?.email,
        visitor_phone: visitorInfo?.phone,
        source_url: window.location.href,
        referrer_url: visitorData.referrer,
        user_agent: visitorData.userAgent,
        browser: visitorData.browser,
        os: visitorData.os,
        device_type: visitorData.device,
        language: visitorData.language,
        utm_source: utmParams.utm_source || undefined,
        utm_medium: utmParams.utm_medium || undefined,
        utm_campaign: utmParams.utm_campaign || undefined,
        utm_term: utmParams.utm_term || undefined,
        utm_content: utmParams.utm_content || undefined,
      });

      if (data) {
        setConversationId(data.id);
        return data.id;
      }

      throw error;
    },
    [organizationId]
  );

  return {
    isOpen,
    setIsOpen,
    conversationId,
    setConversationId,
    settings,
    startConversation,
  };
}

// =====================================================
// useChatConversations Hook
// =====================================================

export function useChatConversations(
  organizationId: string,
  filters?: ConversationFilters,
  sort?: ConversationSort
) {
  const {
    data: conversations = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-conversations', organizationId, filters, sort],
    queryFn: async () => { const r = await chatApi.fetchConversations(organizationId, filters, sort); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!organizationId,
  });

  // Real-time updates
  useEffect(() => {
    if (!organizationId) return;

    const channel = chatApi.subscribeToConversationUpdates(organizationId, (conversation) => {
      refetch();
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, refetch]);

  const closeConversation = useCallback(
    async (conversationId: string) => {
      const { error } = await chatApi.closeConversation(conversationId);
      if (!error) {
        refetch();
      }
      return { error };
    },
    [refetch]
  );

  const assignConversation = useCallback(
    async (conversationId: string, agentId: string) => {
      const { error } = await chatApi.assignConversation(conversationId, agentId);
      if (!error) {
        refetch();
      }
      return { error };
    },
    [refetch]
  );

  return {
    conversations,
    isLoading,
    error,
    refetch,
    closeConversation,
    assignConversation,
  };
}

// =====================================================
// useChatSettings Hook
// =====================================================

export function useChatSettings(organizationId: string) {
  const queryClient = useQueryClient();

  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-settings', organizationId],
    queryFn: async () => { const r = await chatApi.fetchChatSettings(organizationId); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!organizationId,
  });

  const updateSettings = useMutation({
    mutationFn: (updates: Partial<ChatSettings>) =>
      chatApi.upsertChatSettings(organizationId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-settings', organizationId] });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}

// =====================================================
// useChatTags Hook
// =====================================================

export function useChatTags(organizationId: string) {
  const queryClient = useQueryClient();

  const {
    data: tags = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-tags', organizationId],
    queryFn: async () => { const r = await chatApi.fetchTags(organizationId); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!organizationId,
  });

  const createTag = useMutation({
    mutationFn: (tag: Partial<ChatTag>) => chatApi.createTag(tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-tags', organizationId] });
    },
  });

  const updateTag = useMutation({
    mutationFn: ({ tagId, updates }: { tagId: string; updates: Partial<ChatTag> }) =>
      chatApi.updateTag(tagId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-tags', organizationId] });
    },
  });

  const deleteTag = useMutation({
    mutationFn: (tagId: string) => chatApi.deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-tags', organizationId] });
    },
  });

  return {
    tags,
    isLoading,
    error,
    refetch,
    createTag: createTag.mutate,
    updateTag: updateTag.mutate,
    deleteTag: deleteTag.mutate,
  };
}

// =====================================================
// useChatCannedResponses Hook
// =====================================================

export function useChatCannedResponses(organizationId: string, category?: string) {
  const queryClient = useQueryClient();

  const {
    data: responses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-canned-responses', organizationId, category],
    queryFn: async () => { const r = await chatApi.fetchCannedResponses(organizationId, category); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!organizationId,
  });

  const searchResponses = useCallback(
    async (query: string) => {
      const { data } = await chatApi.searchCannedResponses(organizationId, query);
      return data;
    },
    [organizationId]
  );

  const createResponse = useMutation({
    mutationFn: (response: Partial<ChatCannedResponse>) =>
      chatApi.createCannedResponse(response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-canned-responses', organizationId] });
    },
  });

  const updateResponse = useMutation({
    mutationFn: ({
      responseId,
      updates,
    }: {
      responseId: string;
      updates: Partial<ChatCannedResponse>;
    }) => chatApi.updateCannedResponse(responseId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-canned-responses', organizationId] });
    },
  });

  const deleteResponse = useMutation({
    mutationFn: (responseId: string) => chatApi.deleteCannedResponse(responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-canned-responses', organizationId] });
    },
  });

  const useResponse = useCallback(
    async (responseId: string) => {
      await chatApi.useCannedResponse(responseId);
      queryClient.invalidateQueries({ queryKey: ['chat-canned-responses', organizationId] });
    },
    [organizationId, queryClient]
  );

  return {
    responses,
    isLoading,
    error,
    searchResponses,
    createResponse: createResponse.mutate,
    updateResponse: updateResponse.mutate,
    deleteResponse: deleteResponse.mutate,
    useResponse,
  };
}

// =====================================================
// useChatAnalytics Hook
// =====================================================

export function useChatAnalytics(organizationId: string, dateFrom: string, dateTo: string) {
  const {
    data: analytics = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-analytics', organizationId, dateFrom, dateTo],
    queryFn: async () => {
      const result = await chatApi.fetchChatAnalytics(organizationId, dateFrom, dateTo);
      return result.data;
    },
    enabled: !!organizationId && !!dateFrom && !!dateTo,
  });

  const {
    data: metricsResponse,
    isLoading: isLoadingMetrics,
  } = useQuery({
    queryKey: ['chat-metrics', organizationId],
    queryFn: async () => {
      const result = await chatApi.fetchChatMetrics(organizationId);
      return result.data;
    },
    enabled: !!organizationId,
  });

  return {
    analytics,
    metrics: metricsResponse,
    isLoading: isLoading || isLoadingMetrics,
    error,
  };
}

// =====================================================
// useChatAgentStatus Hook
// =====================================================

export function useChatAgentStatus(organizationId: string, agentId?: string) {
  const queryClient = useQueryClient();

  const {
    data: statuses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-agent-statuses', organizationId],
    queryFn: async () => { const r = await chatApi.fetchAgentStatuses(organizationId); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!organizationId,
  });

  const updateStatus = useCallback(
    async (status: string, statusMessage?: string) => {
      if (!agentId) return;
      await chatApi.updateAgentStatus(agentId, organizationId, status, statusMessage);
      queryClient.invalidateQueries({ queryKey: ['chat-agent-statuses', organizationId] });
    },
    [agentId, organizationId, queryClient]
  );

  const setOnline = useCallback(() => updateStatus('online'), [updateStatus]);
  const setAway = useCallback(() => updateStatus('away'), [updateStatus]);
  const setOffline = useCallback(() => updateStatus('offline'), [updateStatus]);
  const setBusy = useCallback(() => updateStatus('busy'), [updateStatus]);

  const myStatus = statuses.find((s) => s.agent_id === agentId);

  return {
    statuses,
    myStatus,
    isLoading,
    error,
    setOnline,
    setAway,
    setOffline,
    setBusy,
    updateStatus,
  };
}

// =====================================================
// useChatNotes Hook
// =====================================================

export function useChatNotes(conversationId: string) {
  const queryClient = useQueryClient();

  const {
    data: notes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['chat-notes', conversationId],
    queryFn: async () => { const r = await chatApi.fetchNotes(conversationId); return (r && r.data !== undefined) ? r.data : r; },
    enabled: !!conversationId,
  });

  const createNote = useMutation({
    mutationFn: (note: Partial<ChatNote>) => chatApi.createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-notes', conversationId] });
    },
  });

  const updateNote = useMutation({
    mutationFn: ({ noteId, updates }: { noteId: string; updates: Partial<ChatNote> }) =>
      chatApi.updateNote(noteId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-notes', conversationId] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: (noteId: string) => chatApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-notes', conversationId] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    createNote: createNote.mutate,
    updateNote: updateNote.mutate,
    deleteNote: deleteNote.mutate,
  };
}

// =====================================================
// useUnreadCount Hook
// =====================================================

export function useUnreadCount(organizationId: string) {
  const {
    data: count = 0,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat-unread-count', organizationId],
    queryFn: () => chatApi.getUnreadCount(organizationId).then((r) => r.data),
    enabled: !!organizationId,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  return { count, isLoading, error };
}
