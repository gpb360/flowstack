import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Calendar, CalendarInsert, CalendarUpdate } from '../types';

// =====================================================
// Fetch Calendars
// =====================================================

export const useCalendars = (
  organizationId: string
): UseQueryResult<Calendar[], Error> => {
  return useQuery({
    queryKey: ['calendars', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendars')
        .select('*, user_profiles(*)')
        .eq('organization_id', organizationId)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

export const useCalendar = (
  calendarId: string
): UseQueryResult<Calendar, Error> => {
  return useQuery({
    queryKey: ['calendar', calendarId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .eq('id', calendarId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!calendarId,
  });
};

// =====================================================
// My Calendars
// =====================================================

export const useMyCalendars = (
  organizationId: string,
  userId: string
): UseQueryResult<Calendar[], Error> => {
  return useQuery({
    queryKey: ['my-calendars', organizationId, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('owner_id', userId)
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

// =====================================================
// Mutations
// =====================================================

export const useCreateCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calendar: CalendarInsert) => {
      const { data, error } = await supabase
        .from('calendars')
        .insert(calendar)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['calendars', variables.organization_id],
      });
    },
  });
};

export const useUpdateCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      calendarId,
      updates,
    }: {
      calendarId: string;
      updates: CalendarUpdate;
    }) => {
      const { data, error } = await supabase
        .from('calendars')
        .update(updates)
        .eq('id', calendarId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['calendars'],
      });
      queryClient.invalidateQueries({
        queryKey: ['calendar', variables.calendarId],
      });
    },
  });
};

export const useDeleteCalendar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (calendarId: string) => {
      const { error } = await supabase
        .from('calendars')
        .update({ active: false })
        .eq('id', calendarId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['calendars'],
      });
    },
  });
};
