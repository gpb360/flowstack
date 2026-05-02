// @ts-nocheck
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { TimeSlot, BusinessHours, DayOfWeek, Calendar, Appointment } from '../types';
import { generateTimeSlots, filterAvailableSlots } from './utils';

// =====================================================
// Availability Calculation
// =====================================================

export interface AvailableSlotsOptions {
  calendarId: string;
  startDate: Date;
  endDate: Date;
  duration?: number;
}

export const getAvailableSlots = async ({
  calendarId,
  startDate,
  endDate,
  duration = 60,
}: AvailableSlotsOptions): Promise<TimeSlot[]> => {
  // Fetch calendar with business hours
  const { data: calendar, error: calendarError } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .single();

  if (calendarError || !calendar) {
    throw new Error('Calendar not found');
  }

  // Fetch existing appointments in date range
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .eq('calendar_id', calendarId)
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString())
    .in_('status', ['scheduled', 'confirmed', 'in_progress']);

  if (appointmentsError) {
    throw appointmentsError;
  }

  // Convert appointments to calendar events
  const calendarEvents = appointments.map((apt) => ({
    id: apt.id,
    title: apt.title,
    start: new Date(apt.start_time),
    end: new Date(apt.end_time),
    calendarId: apt.calendar_id || '',
    appointment: apt,
  }));

  // Generate slots for each day
  const businessHours = calendar.business_hours as BusinessHours;
  const allSlots: TimeSlot[] = [];

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const daySlots = generateTimeSlots(
      currentDate,
      businessHours,
      duration,
      calendar.buffer_minutes
    );

    allSlots.push(...daySlots);
    currentDate = addDays(currentDate, 1);
  }

  // Filter out unavailable slots
  return filterAvailableSlots(
    allSlots,
    calendarEvents,
    calendar.min_notice_hours
  );
};

// =====================================================
// Check Availability
// =====================================================

export interface AvailabilityCheck {
  available: boolean;
  reason?: string;
  availableSlots?: TimeSlot[];
}

export const checkAvailability = async (
  calendarId: string,
  startTime: Date,
  endTime: Date
): Promise<AvailabilityCheck> => {
  // Fetch calendar
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', calendarId)
    .single();

  if (error || !calendar) {
    return { available: false, reason: 'Calendar not found' };
  }

  // Check minimum notice
  const minBookingTime = new Date(
    Date.now() + calendar.min_notice_hours * 3600000
  );
  if (startTime < minBookingTime) {
    return {
      available: false,
      reason: `Minimum ${calendar.min_notice_hours}h notice required`,
    };
  }

  // Check maximum advance booking
  const maxBookingTime = new Date(
    Date.now() + calendar.max_booking_days_ahead * 86400000
  );
  if (startTime > maxBookingTime) {
    return {
      available: false,
      reason: `Booking limited to ${calendar.max_booking_days_ahead} days in advance`,
    };
  }

  // Check business hours
  const businessHours = calendar.business_hours as BusinessHours;
  const dayOfWeek = format(startTime, 'EEEE').toLowerCase() as DayOfWeek;
  const hours = businessHours[dayOfWeek];

  if (!hours || hours.length === 0) {
    return { available: false, reason: 'Outside business hours' };
  }

  // Check if time falls within any business hour range
  const startTimeStr = format(startTime, 'HH:mm');
  const endTimeStr = format(endTime, 'HH:mm');
  const inBusinessHours = hours.some((range) => {
    return startTimeStr >= range.start && endTimeStr <= range.end;
  });

  if (!inBusinessHours) {
    return { available: false, reason: 'Outside business hours' };
  }

  // Check for conflicting appointments
  const { data: conflicts, error: conflictError } = await supabase
    .from('appointments')
    .select('*')
    .eq('calendar_id', calendarId)
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString())
    .in_('status', ['scheduled', 'confirmed', 'in_progress']);

  if (conflictError) {
    throw conflictError;
  }

  if (conflicts && conflicts.length > 0) {
    return { available: false, reason: 'Time slot already booked' };
  }

  return { available: true };
};

// =====================================================
// Recurring Availability Slots
// =====================================================

export interface RecurringSlotOptions {
  calendarId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxBookings?: number;
  frequency: 'weekly';
  endDate?: Date;
}

export const createRecurringSlots = async (
  options: RecurringSlotOptions
): Promise<void> => {
  const {
    calendarId,
    dayOfWeek,
    startTime,
    endTime,
    maxBookings = 1,
    frequency,
    endDate,
  } = options;

  const slots = [];
  const startDate = startOfWeek(new Date(), { weekStartsOn: 0 });
  startDate.setDate(startDate.getDate() + dayOfWeek);

  const end = endDate || addDays(startDate, 90);

  let currentDate = startDate;
  while (currentDate <= end) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const slotStart = new Date(currentDate);
    slotStart.setHours(startHour, startMinute, 0, 0);

    const slotEnd = new Date(currentDate);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    slots.push({
      calendar_id: calendarId,
      organization_id: (await getOrganizationId(calendarId))!,
      start_time: slotStart.toISOString(),
      end_time: slotEnd.toISOString(),
      max_bookings: maxBookings,
      current_bookings: 0,
      status: 'available',
      is_recurring: true,
      recurring_pattern: {
        frequency,
        days: [dayOfWeek],
        end_date: endDate?.toISOString(),
      },
    });

    currentDate = addDays(currentDate, 7);
  }

  const { error } = await supabase.from('availability_slots').insert(slots);

  if (error) {
    throw error;
  }
};

// =====================================================
// Block Time Slots
// =====================================================

export interface BlockSlotOptions {
  calendarId: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
}

export const blockTimeSlot = async ({
  calendarId,
  startTime,
  endTime,
  reason: _reason,
}: BlockSlotOptions): Promise<void> => {
  const { data: calendar } = await supabase
    .from('calendars')
    .select('organization_id')
    .eq('id', calendarId)
    .single();

  const { error } = await supabase.from('availability_slots').insert({
    calendar_id: calendarId,
    organization_id: calendar?.organization_id || '',
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    max_bookings: 0,
    current_bookings: 0,
    status: 'blocked',
    is_recurring: false,
  });

  if (error) {
    throw error;
  }
};

// =====================================================
// Helper Functions
// =====================================================

async function getOrganizationId(calendarId: string): Promise<string | null> {
  const { data } = await supabase
    .from('calendars')
    .select('organization_id')
    .eq('id', calendarId)
    .single();

  return data?.organization_id || null;
}

export const getAvailableDates = async (
  calendarId: string,
  startDate: Date,
  endDate: Date
): Promise<Date[]> => {
  const slots = await getAvailableSlots({
    calendarId,
    startDate,
    endDate,
  });

  const uniqueDates = new Set<string>();
  slots.forEach((slot) => {
    const date = format(new Date(slot.start_time), 'yyyy-MM-dd');
    uniqueDates.add(date);
  });

  return Array.from(uniqueDates).map((dateStr) => parseISO(dateStr));
};
