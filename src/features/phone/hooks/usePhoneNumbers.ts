/**
 * React Query hooks for phone numbers
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type PhoneNumber = Database['public']['Tables']['phone_numbers']['Row'] & Record<string, any>;
type PhoneNumberInsert = Database['public']['Tables']['phone_numbers']['Insert'];
type PhoneNumberUpdate = Database['public']['Tables']['phone_numbers']['Update'];

// Fetch all phone numbers for current organization
export function usePhoneNumbers() {
  return useQuery({
    queryKey: ['phone', 'numbers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data as PhoneNumber[];
    },
  });
}

// Fetch single phone number
export function usePhoneNumber(numberId: string) {
  return useQuery({
    queryKey: ['phone', 'numbers', numberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('id', numberId)
        .single();

      if (error) throw error;
      return data as PhoneNumber;
    },
    enabled: !!numberId,
  });
}

// Create phone number
export function useCreatePhoneNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (number: PhoneNumberInsert) => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .insert(number)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'numbers'] });
    },
  });
}

// Update phone number
export function useUpdatePhoneNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ numberId, updates }: { numberId: string; updates: PhoneNumberUpdate }) => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .update(updates)
        .eq('id', numberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'numbers'] });
      queryClient.invalidateQueries({ queryKey: ['phone', 'numbers', variables.numberId] });
    },
  });
}

// Delete phone number
export function useDeletePhoneNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (numberId: string) => {
      const { error } = await supabase
        .from('phone_numbers')
        .delete()
        .eq('id', numberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'numbers'] });
    },
  });
}

// Update phone number settings
export function useUpdatePhoneNumberSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      numberId,
      settings
    }: {
      numberId: string;
      settings: {
        forward_to?: string;
        recording_enabled?: boolean;
        voicemail_enabled?: boolean;
        sms_enabled?: boolean;
        call_tracking_enabled?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .update(settings)
        .eq('id', numberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['phone', 'numbers', variables.numberId] });
    },
  });
}

// Get active phone numbers (status = 'active')
export function useActivePhoneNumbers() {
  return useQuery({
    queryKey: ['phone', 'numbers', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active')
        .order('phone_number');

      if (error) throw error;
      return data as PhoneNumber[];
    },
  });
}

// Get phone numbers with SMS enabled
export function useSMSNumbers() {
  return useQuery({
    queryKey: ['phone', 'numbers', 'sms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('status', 'active')
        .eq('sms_enabled', true)
        .order('phone_number');

      if (error) throw error;
      return data as PhoneNumber[];
    },
  });
}
