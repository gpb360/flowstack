// @ts-nocheck
/**
 * Chat Data Layer
 * Supabase queries and real-time subscriptions for the Chat Widget system
 */

import { supabase } from '@/lib/supabase';
import type {
  ChatConversation,
  ChatMessage,
  ChatSettings,
  ChatTag,
  ChatCannedResponse,
  ChatAnalytics,
  ChatAgentStatus,
  ChatRating,
  ChatNote,
  ConversationStatus,
  ConversationFilters,
  ConversationSort,
} from '../types';
import type { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';

// =====================================================
// Conversation Queries
// =====================================================

export async function fetchConversations(
  organizationId: string,
  filters?: ConversationFilters,
  sort?: ConversationSort
): Promise<{ data: ChatConversation[]; error: PostgrestError | null }> {
  let query = supabase
    .from('chat_conversations')
    .select(`
      *,
      assigned_agent:user_profiles!chat_conversations_assigned_to_fkey(
        id,
        full_name,
        avatar_url
      ),
      tags:chat_conversation_tags(
        tag:chat_tags(*)
      )
    `)
    .eq('organization_id', organizationId);

  // Apply filters
  if (filters?.status?.length) {
    query = query.in('status', filters.status);
  }
  if (filters?.assignedTo?.length) {
    query = query.in('assigned_to', filters.assignedTo);
  }
  if (filters?.dateFrom) {
    query = query.gte('started_at', filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte('started_at', filters.dateTo);
  }
  if (filters?.search) {
    query = query.or(`visitor_name.ilike.%${filters.search}%,visitor_email.ilike.%${filters.search}%`);
  }

  // Apply sorting
  if (sort) {
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });
  } else {
    query = query.order('last_message_at', { ascending: false });
  }

  const { data, error } = await query;

  // Transform tags
  const transformedData = data?.map((conv: any) => ({
    ...conv,
    tags: conv.tags?.map((t: any) => t.tag).filter(Boolean) || [],
  })) || [];

  return { data: transformedData, error };
}

export async function fetchConversation(
  conversationId: string
): Promise<{ data: ChatConversation | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select(`
      *,
      assigned_agent:user_profiles!chat_conversations_assigned_to_fkey(
        id,
        full_name,
        avatar_url
      ),
      tags:chat_conversation_tags(
        tag:chat_tags(*)
      )
    `)
    .eq('id', conversationId)
    .single();

  if (data) {
    data.tags = data.tags?.map((t: any) => t.tag).filter(Boolean) || [];
  }

  return { data, error };
}

export async function createConversation(
  conversation: Partial<ChatConversation>
): Promise<{ data: ChatConversation | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert(conversation)
    .select()
    .single();

  return { data, error };
}

export async function updateConversation(
  conversationId: string,
  updates: Partial<ChatConversation>
): Promise<{ data: ChatConversation | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single();

  return { data, error };
}

export async function closeConversation(
  conversationId: string
): Promise<{ data: ChatConversation | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({
      status: 'closed',
      ended_at: new Date().toISOString(),
    })
    .eq('id', conversationId)
    .select()
    .single();

  return { data, error };
}

export async function assignConversation(
  conversationId: string,
  agentId: string
): Promise<{ data: ChatConversation | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update({ assigned_to: agentId })
    .eq('id', conversationId)
    .select()
    .single();

  return { data, error };
}

// =====================================================
// Message Queries
// =====================================================

export async function fetchMessages(
  conversationId: string,
  limit = 100
): Promise<{ data: ChatMessage[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at', { ascending: true })
    .limit(limit);

  return { data: data || [], error };
}

export async function sendMessage(
  message: Partial<ChatMessage>
): Promise<{ data: ChatMessage | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      ...message,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

export async function markMessagesAsRead(
  conversationId: string,
  senderType: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_type', senderType)
    .is('read_at', null);

  return { error };
}

export async function getUnreadCount(
  organizationId: string
): Promise<{ data: number; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .innerJoin('chat_conversations', 'chat_messages.conversation_id = chat_conversations.id')
    .eq('chat_conversations.organization_id', organizationId)
    .is('read_at', null);

  return { data: data || 0, error };
}

// =====================================================
// Settings Queries
// =====================================================

export async function fetchChatSettings(
  organizationId: string
): Promise<{ data: ChatSettings | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .single();

  return { data, error };
}

export async function upsertChatSettings(
  organizationId: string,
  settings: Partial<ChatSettings>
): Promise<{ data: ChatSettings | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_settings')
    .upsert({
      ...settings,
      organization_id: organizationId,
    })
    .select()
    .single();

  return { data, error };
}

// =====================================================
// Tag Queries
// =====================================================

export async function fetchTags(
  organizationId: string
): Promise<{ data: ChatTag[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_tags')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  return { data: data || [], error };
}

export async function createTag(
  tag: Partial<ChatTag>
): Promise<{ data: ChatTag | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_tags')
    .insert(tag)
    .select()
    .single();

  return { data, error };
}

export async function updateTag(
  tagId: string,
  updates: Partial<ChatTag>
): Promise<{ data: ChatTag | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_tags')
    .update(updates)
    .eq('id', tagId)
    .select()
    .single();

  return { data, error };
}

export async function deleteTag(
  tagId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('chat_tags')
    .delete()
    .eq('id', tagId);

  return { error };
}

export async function addTagToConversation(
  conversationId: string,
  tagId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('chat_conversation_tags')
    .insert({ conversation_id: conversationId, tag_id: tagId });

  return { error };
}

export async function removeTagFromConversation(
  conversationId: string,
  tagId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('chat_conversation_tags')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('tag_id', tagId);

  return { error };
}

// =====================================================
// Canned Response Queries
// =====================================================

export async function fetchCannedResponses(
  organizationId: string,
  category?: string
): Promise<{ data: ChatCannedResponse[]; error: PostgrestError | null }> {
  let query = supabase
    .from('chat_canned_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('usage_count', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  return { data: data || [], error };
}

export async function searchCannedResponses(
  organizationId: string,
  query: string
): Promise<{ data: ChatCannedResponse[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_canned_responses')
    .select('*')
    .eq('organization_id', organizationId)
    .or(`name.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`)
    .order('usage_count', { ascending: false });

  return { data: data || [], error };
}

export async function createCannedResponse(
  response: Partial<ChatCannedResponse>
): Promise<{ data: ChatCannedResponse | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_canned_responses')
    .insert(response)
    .select()
    .single();

  return { data, error };
}

export async function updateCannedResponse(
  responseId: string,
  updates: Partial<ChatCannedResponse>
): Promise<{ data: ChatCannedResponse | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_canned_responses')
    .update(updates)
    .eq('id', responseId)
    .select()
    .single();

  return { data, error };
}

export async function deleteCannedResponse(
  responseId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('chat_canned_responses')
    .delete()
    .eq('id', responseId);

  return { error };
}

export async function useCannedResponse(
  responseId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase.rpc('increment_canned_response_usage', {
    canned_response_id: responseId,
  });

  return { error };
}

// =====================================================
// Analytics Queries
// =====================================================

export async function fetchChatAnalytics(
  organizationId: string,
  dateFrom: string,
  dateTo: string
): Promise<{ data: ChatAnalytics[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_analytics')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('date', dateFrom)
    .lte('date', dateTo)
    .order('date', { ascending: true });

  return { data: data || [], error };
}

export async function fetchChatMetrics(
  organizationId: string
): Promise<{
  data: {
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
    avgResponseTime: number;
    satisfactionScore: number;
  } | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from('chat_analytics')
    .select(`
      conversations_started,
      conversations_closed,
      messages_sent,
      avg_response_time,
      satisfaction_score
    `)
    .eq('organization_id', organizationId)
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) {
    return { data: null, error };
  }

  const totalConversations = data.reduce((sum, row) => sum + (row.conversations_started || 0), 0);
  const totalMessages = data.reduce((sum, row) => sum + (row.messages_sent || 0), 0);
  const avgResponseTime = data.reduce((sum, row) => {
    const seconds = row.avg_response_time ? parseInt(row.avg_response_time) || 0 : 0;
    return sum + seconds;
  }, 0) / data.length;
  const satisfactionScore = data.reduce((sum, row) => sum + (row.satisfaction_score || 0), 0) / data.length;

  const { data: activeData } = await supabase
    .from('chat_conversations')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  return {
    data: {
      totalConversations,
      activeConversations: activeData || 0,
      totalMessages,
      avgResponseTime: Math.round(avgResponseTime),
      satisfactionScore: Math.round(satisfactionScore * 100),
    },
    error: null,
  };
}

// =====================================================
// Agent Status Queries
// =====================================================

export async function fetchAgentStatuses(
  organizationId: string
): Promise<{ data: ChatAgentStatus[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_agent_status')
    .select(`
      *,
      agent:user_profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .order('last_active_at', { ascending: false });

  return { data: data || [], error };
}

export async function updateAgentStatus(
  agentId: string,
  organizationId: string,
  status: string,
  statusMessage?: string
): Promise<{ data: ChatAgentStatus | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_agent_status')
    .upsert({
      agent_id: agentId,
      organization_id: organizationId,
      status,
      status_message: statusMessage,
      last_active_at: new Date().toISOString(),
    })
    .select(`
      *,
      agent:user_profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

export async function setAgentOnline(
  agentId: string,
  organizationId: string
): Promise<{ error: PostgrestError | null }> {
  return updateAgentStatus(agentId, organizationId, 'online').then(() => ({ error: null }));
}

export async function setAgentAway(
  agentId: string,
  organizationId: string
): Promise<{ error: PostgrestError | null }> {
  return updateAgentStatus(agentId, organizationId, 'away').then(() => ({ error: null }));
}

export async function setAgentOffline(
  agentId: string,
  organizationId: string
): Promise<{ error: PostgrestError | null }> {
  return updateAgentStatus(agentId, organizationId, 'offline').then(() => ({ error: null }));
}

// =====================================================
// Note Queries
// =====================================================

export async function fetchNotes(
  conversationId: string
): Promise<{ data: ChatNote[]; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_notes')
    .select(`
      *,
      agent:user_profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
}

export async function createNote(
  note: Partial<ChatNote>
): Promise<{ data: ChatNote | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_notes')
    .insert(note)
    .select(`
      *,
      agent:user_profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

export async function updateNote(
  noteId: string,
  updates: Partial<ChatNote>
): Promise<{ data: ChatNote | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_notes')
    .update(updates)
    .eq('id', noteId)
    .select(`
      *,
      agent:user_profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .single();

  return { data, error };
}

export async function deleteNote(
  noteId: string
): Promise<{ error: PostgrestError | null }> {
  const { error } = await supabase
    .from('chat_notes')
    .delete()
    .eq('id', noteId);

  return { error };
}

// =====================================================
// Rating Queries
// =====================================================

export async function createRating(
  rating: Partial<ChatRating>
): Promise<{ data: ChatRating | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from('chat_ratings')
    .insert(rating)
    .select()
    .single();

  return { data, error };
}

// =====================================================
// Real-time Subscriptions
// =====================================================

export function subscribeToMessages(
  conversationId: string,
  callback: (message: ChatMessage) => void
): RealtimeChannel {
  return supabase
    .channel(`chat_messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as ChatMessage);
      }
    )
    .subscribe();
}

export function subscribeToConversationUpdates(
  organizationId: string,
  callback: (conversation: ChatConversation) => void
): RealtimeChannel {
  return supabase
    .channel(`chat_conversations:${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_conversations',
        filter: `organization_id=eq.${organizationId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as ChatConversation);
        }
      }
    )
    .subscribe();
}

export function subscribeToTypingIndicator(
  conversationId: string,
  callback: (isTyping: boolean) => void
): RealtimeChannel {
  return supabase
    .channel(`chat_typing:${conversationId}`)
    .on(
      'broadcast',
      { event: 'typing' },
      ({ payload }) => {
        callback((payload as { isTyping: boolean }).isTyping);
      }
    )
    .subscribe();
}

export function broadcastTypingIndicator(
  conversationId: string,
  isTyping: boolean
): void {
  supabase.channel(`chat_typing:${conversationId}`).send({
    type: 'broadcast',
    event: 'typing',
    payload: { isTyping },
  });
}

// =====================================================
// File Upload
// =====================================================

export async function uploadChatFile(
  conversationId: string,
  file: File
): Promise<{ data: { url: string; name: string } | null; error: Error | null }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${conversationId}/${Date.now()}.${fileExt}`;
  const filePath = `chat/${fileName}`;

  const { data, error } = await supabase.storage
    .from('chat-files')
    .upload(filePath, file);

  if (error) {
    return { data: null, error };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('chat-files')
    .getPublicUrl(filePath);

  return {
    data: { url: publicUrl, name: file.name },
    error: null,
  };
}

// =====================================================
// Visitor Detection
// =====================================================

export interface VisitorInfo {
  ip: string;
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  language?: string;
  country?: string;
  city?: string;
  referrer?: string;
}

export function detectVisitorInfo(): VisitorInfo {
  const userAgent = navigator.userAgent;
  const language = navigator.language;

  // Basic browser detection
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Basic OS detection
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'MacOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  // Device detection
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'mobile' : 'desktop';

  return {
    ip: '', // Will be filled by backend
    userAgent,
    browser,
    os,
    device,
    language,
    referrer: document.referrer || undefined,
  };
}

export function getUTMParameters(): Record<string, string> {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
    utm_term: urlParams.get('utm_term') || '',
    utm_content: urlParams.get('utm_content') || '',
  };
}
