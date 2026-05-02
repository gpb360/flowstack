import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AppointmentType, AppointmentTypeInsert, AppointmentTypeUpdate } from '../types';
import { getAvailableSlots, checkAvailability, type AvailableSlotsOptions } from '../lib/availability';

// =====================================================
// Appointment Types
// =====================================================

export const useAppointmentTypes = (
  organizationId: string,
  calendarId?: string
): UseQueryResult<AppointmentType[], Error> => {
  return useQuery({
    queryKey: ['appointment-types', organizationId, calendarId],
    queryFn: async () => {
      let query = supabase
        .from('appointment_types')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('active', true)
        .order('order_index', { ascending: true });

      if (calendarId) {
        query = query.eq('calendar_id', calendarId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

export const useAppointmentType = (
  appointmentTypeId: string
): UseQueryResult<AppointmentType, Error> => {
  return useQuery({
    queryKey: ['appointment-type', appointmentTypeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_types')
        .select('*')
        .eq('id', appointmentTypeId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!appointmentTypeId,
  });
};

// =====================================================
// Available Slots
// =====================================================

export const useAvailableSlots = (options: AvailableSlotsOptions) => {
  return useQuery({
    queryKey: ['available-slots', options],
    queryFn: () => getAvailableSlots(options),
    enabled: !!options.calendarId && !!options.startDate && !!options.endDate,
  });
};

export const useCheckAvailability = (
  calendarId: string,
  startTime: Date,
  endTime: Date,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['availability-check', calendarId, startTime.toISOString(), endTime.toISOString()],
    queryFn: () => checkAvailability(calendarId, startTime, endTime),
    enabled: !!calendarId && enabled,
  });
};

// =====================================================
// Daily Availability
// =====================================================

export const useDailyAvailability = (
  calendarId: string,
  date: Date
): UseQueryResult<Date[], Error> => {
  return useQuery({
    queryKey: ['daily-availability', calendarId, date.toISOString()],
    queryFn: async () => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { getAvailableDates } = await import('../lib/availability');

      return getAvailableDates(calendarId, startOfDay, endOfDay);
    },
    enabled: !!calendarId && !!date,
  });
};

// =====================================================
// Mutations
// =====================================================

export const useCreateAppointmentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentType: AppointmentTypeInsert) => {
      const { data, error } = await supabase
        .from('appointment_types')
        .insert(appointmentType)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointment-types', variables.organization_id],
      });
    },
  });
};

export const useUpdateAppointmentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      appointmentTypeId,
      updates,
    }: {
      appointmentTypeId: string;
      updates: AppointmentTypeUpdate;
    }) => {
      const { data, error } = await supabase
        .from('appointment_types')
        .update(updates)
        .eq('id', appointmentTypeId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointment-types'],
      });
      queryClient.invalidateQueries({
        queryKey: ['appointment-type', variables.appointmentTypeId],
      });
    },
  });
};

export const useDeleteAppointmentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentTypeId: string) => {
      const { error } = await supabase
        .from('appointment_types')
        .update({ active: false })
        .eq('id', appointmentTypeId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointment-types'],
      });
    },
  });
};
