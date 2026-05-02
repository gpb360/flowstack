/**
 * React Query hooks for phone calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type PhoneCall = Database['public']['Tables']['phone_calls']['Row'] & Record<string, any>;
type PhoneCallInsert = Database['public']['Tables']['phone_calls']['Insert'];
type PhoneCallUpdate = Database['public']['Tables']['phone_calls']['Update'];

// Fetch calls for current organization
export function useCalls(filters?: {
  status?: string;
  direction?: string;
  contactId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return useQuery({
    queryKey: ['phone', 'calls', filters],
    queryFn: async () => {
      let query = supabase
        .from('phone_calls')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          recording:phone_recordings(id, url, duration_seconds),
          voicemail:voicemails(id, url, transcription)
        `)
        .order('started_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.direction) {
        query = query.eq('direction', filters.direction);
      }
      if (filters?.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }
      if (filters?.startDate) {
        query = query.gte('started_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('started_at', filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PhoneCall[];
    },
  });
}

// Fetch single call with details
export function useCall(callId: string) {
  return useQuery({
    queryKey: ['phone', 'calls', callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_calls')
        .select(`
          *,
          contact:contacts(id, first_name, last_name, email, phone),
          recording:phone_recordings(*),
          voicemail:voicemails(*),
          agent:user_profiles(id, full_name, email)
        `)
        .eq('id', callId)
        .single();

      if (error) throw error;
      return data as PhoneCall;
    },
    enabled: !!callId,
  });
}

// Create call log
export function useCreateCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (call: PhoneCallInsert) => {
      const { data, error } = await supabase
        .from('phone_calls')
        .insert(call)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'calls'] });
    },
  });
}

// Update call
export function useUpdateCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ callId, updates }: { callId: string; updates: PhoneCallUpdate }) => {
      const { data, error } = await supabase
        .from('phone_calls')
        .update(updates)
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'calls'] });
      queryClient.invalidateQueries({ queryKey: ['phone', 'calls', variables.callId] });
    },
  });
}

// Add note to call
export function useAddCallNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ callId, notes }: { callId: string; notes: string }) => {
      const { data, error } = await supabase
        .from('phone_calls')
        .update({ notes })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'calls', variables.callId] });
    },
  });
}

// Add tags to call
export function useAddCallTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ callId, tags }: { callId: string; tags: string[] }) => {
      const { data, error } = await supabase
        .from('phone_calls')
        .update({ tags })
        .eq('id', callId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'calls', variables.callId] });
    },
  });
}

// Get call statistics
export function useCallStatistics(days: number = 30) {
  return useQuery({
    queryKey: ['phone', 'statistics', days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_call_statistics', {
        p_days: days,
      });

      if (error) throw error;
      return data;
    },
  });
}

// Get recent calls for dashboard
export function useRecentCalls(limit: number = 10) {
  return useQuery({
    queryKey: ['phone', 'calls', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_calls')
        .select(`
          *,
          contact:contacts(id, first_name, last_name)
        `)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as PhoneCall[];
    },
  });
}

// Search calls by phone number
export function useSearchCalls(phoneNumber: string) {
  return useQuery({
    queryKey: ['phone', 'calls', 'search', phoneNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_calls')
        .select(`
          *,
          contact:contacts(id, first_name, last_name)
        `)
        .or(`from_number.ilike.%${phoneNumber}%,to_number.ilike.%${phoneNumber}%`)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as PhoneCall[];
    },
    enabled: phoneNumber.length > 2,
  });
}
