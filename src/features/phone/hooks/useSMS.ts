// @ts-nocheck
/**
 * React Query hooks for SMS
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type SMSThread = Database['public']['Tables']['sms_threads']['Row'] & Record<string, any>;
type SMSMessage = Database['public']['Tables']['sms_messages']['Row'] & Record<string, any>;
type SMSMessageInsert = Database['public']['Tables']['sms_messages']['Insert'];

// Fetch all SMS threads (conversations)
export function useSMSThreads(filters?: {
  status?: string;
  unread?: boolean;
}) {
  return useQuery({
    queryKey: ['phone', 'sms', 'threads', filters],
    queryFn: async () => {
      let query = supabase
        .from('sms_threads')
        .select(`
          *,
          phone_number:phone_numbers(id, phone_number),
          contact:contacts(id, first_name, last_name, phone)
        `)
        .order('updated_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.unread) {
        query = query.gt('unread_count', 0);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SMSThread[];
    },
    refetchInterval: 15000, // Refetch every 15 seconds for new messages
  });
}

// Fetch single SMS thread
export function useSMSThread(threadId: string) {
  return useQuery({
    queryKey: ['phone', 'sms', 'threads', threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_threads')
        .select(`
          *,
          phone_number:phone_numbers(id, phone_number),
          contact:contacts(*)
        `)
        .eq('id', threadId)
        .single();

      if (error) throw error;
      return data as SMSThread;
    },
    enabled: !!threadId,
  });
}

// Fetch messages for a thread
export function useSMSMessages(threadId: string) {
  return useQuery({
    queryKey: ['phone', 'sms', 'threads', threadId, 'messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('sent_at', { ascending: true });

      if (error) throw error;
      return data as SMSMessage[];
    },
    enabled: !!threadId,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// Send SMS message
export function useSendSMS() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: {
      to: string;
      from: string;
      body: string;
      mediaUrls?: string[];
      threadId?: string;
    }) => {
      // Import here to avoid circular dependency
      const { sendSMS } = await import('../lib/twilio');

      const result = await sendSMS({
        to: message.to,
        from: message.from,
        body: message.body,
        mediaUrls: message.mediaUrls,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Create message record in database
      const { data: org } = await supabase.auth.getUser();
      const organizationId = org.data.user?.user_metadata?.organization_id;

      const { data, error } = await supabase
        .from('sms_messages')
        .insert({
          thread_id: message.threadId || '',
          organization_id: organizationId,
          phone_number_id: null, // Will be resolved
          direction: 'outbound',
          from_number: message.from,
          to_number: message.to,
          body: message.body,
          media_urls: message.mediaUrls,
          provider_message_id: result.messageSid,
          provider: 'twilio',
          status: 'sent',
        } as SMSMessageInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'sms', 'threads'] });
      if (variables.threadId) {
        queryClient.invalidateQueries({ queryKey: ['phone', 'sms', 'threads', variables.threadId, 'messages'] });
      }
    },
  });
}

// Mark thread messages as read
export function useMarkThreadRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { data, error } = await supabase
        .from('sms_threads')
        .update({ unread_count: 0 })
        .eq('id', threadId)
        .select()
        .single();

      if (error) throw error;

      // Mark all inbound messages as read
      await supabase
        .from('sms_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('thread_id', threadId)
        .eq('direction', 'inbound')
        .is('read_at', null);

      return data;
    },
    onSuccess: (_, threadId) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'sms', 'threads'] });
      queryClient.invalidateQueries({ queryKey: ['phone', 'sms', 'threads', threadId] });
    },
  });
}

// Archive thread
export function useArchiveThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { data, error } = await supabase
        .from('sms_threads')
        .update({ status: 'archived' })
        .eq('id', threadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'sms', 'threads'] });
    },
  });
}

// Delete thread
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase
        .from('sms_threads')
        .delete()
        .eq('id', threadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'sms', 'threads'] });
    },
  });
}

// Get unread SMS count
export function useUnreadSMSCount() {
  return useQuery({
    queryKey: ['phone', 'sms', 'unread', 'count'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('sms_threads')
        .select('*', { count: 'exact', head: true })
        .gt('unread_count', 0);

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000,
  });
}

// Search conversations by phone number or message content
export function useSearchSMS(query: string) {
  return useQuery({
    queryKey: ['phone', 'sms', 'search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_threads')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, phone)
        `)
        .or(`participant_phone.ilike.%${query}%,last_message_preview.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as SMSThread[];
    },
    enabled: query.length > 2,
  });
}
