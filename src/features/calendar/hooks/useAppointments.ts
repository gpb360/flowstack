// @ts-nocheck
import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentInsert, AppointmentUpdate, AppointmentFilters } from '../types';
import {
  createAppointment,
  updateAppointment as updateAppointmentAction,
  cancelAppointment,
  rescheduleAppointment,
  confirmAppointment,
} from '../lib/booking';

// =====================================================
// Fetch Appointments
// =====================================================

export interface AppointmentsQuery extends AppointmentFilters {
  organizationId: string;
}

export const useAppointments = (
  filters: AppointmentsQuery
): UseQueryResult<Appointment[], Error> => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select('*, contacts(*), appointment_types(*)')
        .eq('organization_id', filters.organizationId)
        .order('start_time', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.calendarId) {
        query = query.eq('calendar_id', filters.calendarId);
      }

      if (filters.contactId) {
        query = query.eq('contact_id', filters.contactId);
      }

      if (filters.dateFrom) {
        query = query.gte('start_time', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('start_time', filters.dateTo.toISOString());
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

export const useAppointment = (appointmentId: string): UseQueryResult<Appointment, Error> => {
  return useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, contacts(*), appointment_types(*)')
        .eq('id', appointmentId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!appointmentId,
  });
};

// =====================================================
// Upcoming Appointments
// =====================================================

export const useUpcomingAppointments = (
  organizationId: string,
  limit: number = 10
): UseQueryResult<Appointment[], Error> => {
  return useQuery({
    queryKey: ['upcoming-appointments', organizationId, limit],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('organization_id', organizationId)
        .in_('status', ['scheduled', 'confirmed'])
        .gte('start_time', now)
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

// =====================================================
// Today's Appointments
// =====================================================

export const useTodaysAppointments = (
  organizationId: string
): UseQueryResult<Appointment[], Error> => {
  return useQuery({
    queryKey: ['todays-appointments', organizationId],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
};

// =====================================================
// Appointment Statistics
// =====================================================

export const useAppointmentStats = (organizationId: string) => {
  return useQuery({
    queryKey: ['appointment-stats', organizationId],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Total appointments this month
      const { count: total } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('start_time', startOfMonth);

      // By status
      const { data: byStatus } = await supabase
        .from('appointments')
        .select('status')
        .eq('organization_id', organizationId)
        .gte('start_time', startOfMonth);

      // Upcoming
      const { count: upcoming } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .in_('status', ['scheduled', 'confirmed'])
        .gte('start_time', now.toISOString());

      const statusCounts = (byStatus || []).reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: total || 0,
        upcoming: upcoming || 0,
        byStatus: statusCounts,
      };
    },
  });
};

// =====================================================
// Mutations
// =====================================================

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: Parameters<typeof createAppointment>[0]) =>
      createAppointment(options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments', { organizationId: variables.organizationId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['appointment-stats', variables.organizationId],
      });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: Parameters<typeof updateAppointmentAction>[0]) =>
      updateAppointmentAction(options),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.appointmentId],
      });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      organizationId,
      reason,
    }: {
      appointmentId: string;
      organizationId: string;
      reason?: string;
    }) => cancelAppointment(appointmentId, organizationId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.appointmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['appointment-stats', variables.organizationId],
      });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: Parameters<typeof rescheduleAppointment>[0]) =>
      rescheduleAppointment(options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });
      queryClient.invalidateQueries({
        queryKey: ['appointment', variables.appointmentId],
      });
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => confirmAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['appointments'],
      });
    },
  });
};

// =====================================================
// Appointment History
// =====================================================

export const useAppointmentHistory = (appointmentId: string) => {
  return useQuery({
    queryKey: ['appointment-history', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_history')
        .select('*, user_profiles(*)')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
    enabled: !!appointmentId,
  });
};
