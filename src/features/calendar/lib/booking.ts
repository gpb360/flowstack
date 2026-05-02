// @ts-nocheck
import { supabase } from '@/lib/supabase';
import type { Appointment, AppointmentInsert, AppointmentReminder } from '../types';

// =====================================================
// Create Appointment
// =====================================================

export interface CreateAppointmentOptions extends Omit<AppointmentInsert, 'organization_id'> {
  organizationId: string;
  sendReminder?: boolean;
  reminderHours?: number[];
}

export const createAppointment = async (
  options: CreateAppointmentOptions
): Promise<Appointment> => {
  const { organizationId, sendReminder = true, reminderHours = [24, 1], ...appointmentData } =
    options;

  // Create appointment
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      ...appointmentData,
      organization_id: organizationId,
    })
    .select()
    .single();

  if (appointmentError) {
    throw appointmentError;
  }

  // Update availability slot if exists
  if (appointment.calendar_id) {
    await updateSlotBookings(appointment.calendar_id, appointment.start_time, appointment.end_time);
  }

  // Create reminders
  if (sendReminder && reminderHours.length > 0) {
    await createReminders(appointment.id, organizationId, reminderHours);
  }

  // Log history
  await logAppointmentHistory(appointment.id, organizationId, 'created', null);

  // Trigger workflow (if configured)
  await triggerWorkflow('appointment_created', appointment);

  return appointment;
};

// =====================================================
// Update Appointment
// =====================================================

export interface UpdateAppointmentOptions {
  appointmentId: string;
  organizationId: string;
  updates: Partial<AppointmentInsert>;
  previousValues?: Record<string, any>;
}

export const updateAppointment = async ({
  appointmentId,
  organizationId,
  updates,
  previousValues,
}: UpdateAppointmentOptions): Promise<Appointment> => {
  // Fetch current appointment
  const { data: current } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (!current) {
    throw new Error('Appointment not found');
  }

  // Update appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log history
  await logAppointmentHistory(appointmentId, organizationId, 'updated', previousValues || current);

  return appointment;
};

// =====================================================
// Cancel Appointment
// =====================================================

export const cancelAppointment = async (
  appointmentId: string,
  organizationId: string,
  reason?: string
): Promise<void> => {
  // Fetch appointment
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  // Update status
  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      customer_notes: reason ? `${appointment.customer_notes || ''}\nCancellation: ${reason}`.trim() : appointment.customer_notes,
    })
    .eq('id', appointmentId);

  if (error) {
    throw error;
  }

  // Update slot
  if (appointment.calendar_id) {
    await decrementSlotBookings(appointment.calendar_id, appointment.start_time, appointment.end_time);
  }

  // Log history
  await logAppointmentHistory(appointmentId, organizationId, 'cancelled', { status: appointment.status });

  // Trigger workflow
  await triggerWorkflow('appointment_cancelled', appointment);
};

// =====================================================
// Reschedule Appointment
// =====================================================

export interface RescheduleAppointmentOptions {
  appointmentId: string;
  organizationId: string;
  newStartTime: string;
  newEndTime: string;
}

export const rescheduleAppointment = async ({
  appointmentId,
  organizationId,
  newStartTime,
  newEndTime,
}: RescheduleAppointmentOptions): Promise<Appointment> => {
  // Fetch current appointment
  const { data: current } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (!current) {
    throw new Error('Appointment not found');
  }

  // Release old slot
  if (current.calendar_id) {
    await decrementSlotBookings(current.calendar_id, current.start_time, current.end_time);
  }

  // Update appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      start_time: newStartTime,
      end_time: newEndTime,
      status: 'rescheduled',
    })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Book new slot
  if (appointment.calendar_id) {
    await updateSlotBookings(appointment.calendar_id, newStartTime, newEndTime);
  }

  // Log history
  await logAppointmentHistory(appointmentId, organizationId, 'rescheduled', {
    start_time: current.start_time,
    end_time: current.end_time,
  });

  // Trigger workflow
  await triggerWorkflow('appointment_rescheduled', appointment);

  return appointment;
};

// =====================================================
// Confirm Appointment
// =====================================================

export const confirmAppointment = async (appointmentId: string): Promise<void> => {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId);

  if (error) {
    throw error;
  }

  // Fetch appointment for workflow
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (appointment) {
    await triggerWorkflow('appointment_confirmed', appointment);
  }
};

// =====================================================
// Reminders
// =====================================================

export const createReminders = async (
  appointmentId: string,
  organizationId: string,
  hours: number[]
): Promise<void> => {
  const reminders = hours.map((hoursBefore) => ({
    appointment_id: appointmentId,
    organization_id: organizationId,
    remind_before_hours: hoursBefore,
    type: 'email' as const,
    status: 'pending' as const,
  }));

  const { error } = await supabase.from('appointment_reminders').insert(reminders);

  if (error) {
    throw error;
  }
};

export const getPendingReminders = async (): Promise<AppointmentReminder[]> => {
  const now = new Date();

  const { data, error } = await supabase
    .from('appointment_reminders')
    .select('*, appointments(*)')
    .eq('status', 'pending')
    .lte('remind_before_hours', 24); // Get reminders that should be sent

  if (error) {
    throw error;
  }

  // Filter reminders that should actually be sent now
  const dueReminders = (data || []).filter((reminder: any) => {
    if (!reminder.appointments) return false;

    const appointmentTime = new Date(reminder.appointments.start_time);
    const reminderTime = new Date(appointmentTime.getTime() - reminder.remind_before_hours * 3600000);

    return now >= reminderTime;
  });

  return dueReminders;
};

export const markReminderSent = async (reminderId: string): Promise<void> => {
  const { error } = await supabase
    .from('appointment_reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', reminderId);

  if (error) {
    throw error;
  }
};

// =====================================================
// History
// =====================================================

export const logAppointmentHistory = async (
  appointmentId: string,
  organizationId: string,
  action: string,
  previousValues: Record<string, any> | null
): Promise<void> => {
  const { error } = await supabase.from('appointment_history').insert({
    appointment_id: appointmentId,
    organization_id: organizationId,
    action,
    previous_values: previousValues as any,
    changed_by_user_id: null, // Will be set by RLS
  });

  if (error) {
    console.error('Failed to log appointment history:', error);
  }
};

// =====================================================
// Slot Management
// =====================================================

export const updateSlotBookings = async (
  calendarId: string,
  startTime: string,
  endTime: string
): Promise<void> => {
  // Find matching slot
  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('calendar_id', calendarId)
    .eq('status', 'available')
    .lte('start_time', startTime)
    .gte('end_time', endTime);

  if (slots && slots.length > 0) {
    const slot = slots[0];
    const { error } = await supabase
      .from('availability_slots')
      .update({
        current_bookings: slot.current_bookings + 1,
        status: slot.current_bookings + 1 >= slot.max_bookings ? 'booked' : 'available',
      })
      .eq('id', slot.id);

    if (error) {
      throw error;
    }
  }
};

export const decrementSlotBookings = async (
  calendarId: string,
  startTime: string,
  endTime: string
): Promise<void> => {
  const { data: slots } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('calendar_id', calendarId)
    .in_('status', ['booked', 'available'])
    .lte('start_time', startTime)
    .gte('end_time', endTime);

  if (slots && slots.length > 0) {
    const slot = slots[0];
    if (slot.current_bookings > 0) {
      const { error } = await supabase
        .from('availability_slots')
        .update({
          current_bookings: slot.current_bookings - 1,
          status: 'available',
        })
        .eq('id', slot.id);

      if (error) {
        throw error;
      }
    }
  }
};

// =====================================================
// Workflow Integration
// =====================================================

const triggerWorkflow = async (
  trigger: string,
  appointment: Appointment
): Promise<void> => {
  // This would integrate with the workflows module
  // For now, just log the event
  console.log(`Workflow trigger: ${trigger}`, appointment);
};

// =====================================================
// Meeting Link Generation
// =====================================================

export const generateMeetingLink = async (
  appointmentId: string,
  _provider: 'zoom' | 'google_meet' | 'teams'
): Promise<{ link: string; meetingId?: string; password?: string }> => {
  // This would integrate with video conferencing providers
  // For now, return a placeholder
  return {
    link: `https://meet.example.com/${appointmentId}`,
    meetingId: appointmentId,
  };
};
