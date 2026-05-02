/**
 * React Query hooks for voicemails
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Voicemail = Database['public']['Tables']['voicemails']['Row'] & Record<string, any>;
type VoicemailUpdate = Database['public']['Tables']['voicemails']['Update'];

// Fetch all voicemails for current organization
export function useVoicemails(filters?: {
  status?: string;
  phoneNumberId?: string;
}) {
  return useQuery({
    queryKey: ['phone', 'voicemails', filters],
    queryFn: async () => {
      let query = supabase
        .from('voicemails')
        .select(`
          *,
          phone_number:phone_numbers(id, phone_number),
          call:phone_calls(id, from_number, to_number, started_at)
        `)
        .order('received_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.phoneNumberId) {
        query = query.eq('phone_number_id', filters.phoneNumberId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Voicemail[];
    },
  });
}

// Fetch single voicemail
export function useVoicemail(voicemailId: string) {
  return useQuery({
    queryKey: ['phone', 'voicemails', voicemailId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voicemails')
        .select(`
          *,
          phone_number:phone_numbers(id, phone_number),
          call:phone_calls(*)
        `)
        .eq('id', voicemailId)
        .single();

      if (error) throw error;
      return data as Voicemail;
    },
    enabled: !!voicemailId,
  });
}

// Update voicemail
export function useUpdateVoicemail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ voicemailId, updates }: { voicemailId: string; updates: VoicemailUpdate }) => {
      const { data, error } = await supabase
        .from('voicemails')
        .update(updates)
        .eq('id', voicemailId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'voicemails'] });
      queryClient.invalidateQueries({ queryKey: ['phone', 'voicemails', variables.voicemailId] });
    },
  });
}

// Mark voicemail as listened
export function useMarkVoicemailListened() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voicemailId: string) => {
      const { data, error } = await supabase
        .from('voicemails')
        .update({ status: 'listened' })
        .eq('id', voicemailId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'voicemails'] });
    },
  });
}

// Delete voicemail
export function useDeleteVoicemail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voicemailId: string) => {
      const { error } = await supabase
        .from('voicemails')
        .delete()
        .eq('id', voicemailId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'voicemails'] });
    },
  });
}

// Archive voicemail
export function useArchiveVoicemail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voicemailId: string) => {
      const { data, error } = await supabase
        .from('voicemails')
        .update({ status: 'archived' })
        .eq('id', voicemailId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'voicemails'] });
    },
  });
}

// Get new (unlistened) voicemails count
export function useNewVoicemailsCount() {
  return useQuery({
    queryKey: ['phone', 'voicemails', 'new', 'count'],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('voicemails')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Get recent voicemails for dashboard
export function useRecentVoicemails(limit: number = 5) {
  return useQuery({
    queryKey: ['phone', 'voicemails', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voicemails')
        .select('*')
        .order('received_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Voicemail[];
    },
  });
}
