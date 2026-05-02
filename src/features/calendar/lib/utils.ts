import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import type { CalendarEvent, DayCell, TimeSlot, BusinessHours, DayOfWeek, TimeRange, Appointment } from '../types';

// =====================================================
// Type Exports
// =====================================================

export type ViewMode = 'month' | 'week' | 'day' | 'agenda';

// Re-export CalendarEvent for convenience
export type { CalendarEvent };

// =====================================================
// Date Utilities
// =====================================================

export const formatDate = (date: Date | string, formatStr: string = 'PPP'): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'PPp');
};

export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'p');
};

export const formatTimeRange = (start: Date | string, end: Date | string): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

export const isInPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d < new Date();
};

export const isFuture = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d > new Date();
};

// =====================================================
// Calendar Grid Generation
// =====================================================

export interface MonthWeek {
  weekNumber: number;
  days: DayCell[];
}

export const generateMonthGrid = (date: Date, appointments: CalendarEvent[]): MonthWeek[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weeks: MonthWeek[] = [];
  let currentWeek: DayCell[] = [];

  days.forEach((day, index) => {
    const dayAppointments = appointments.filter((apt) =>
      isSameDay(apt.start, day)
    );

    currentWeek.push({
      date: day,
      isCurrentMonth: isSameMonth(day, date),
      isToday: isToday(day),
      appointments: dayAppointments,
    });

    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push({
        weekNumber: getWeekNumber(day),
        days: currentWeek,
      });
      currentWeek = [];
    }
  });

  return weeks;
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const generateWeekGrid = (date: Date, appointments: CalendarEvent[]): DayCell[] => {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return days.map((day) => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
    appointments: appointments.filter((apt) => isSameDay(apt.start, day)),
  }));
};

// =====================================================
// Time Slot Generation
// =====================================================

export const generateTimeSlots = (
  date: Date,
  businessHours: BusinessHours,
  duration: number = 60,
  bufferMinutes: number = 0
): TimeSlot[] => {
  const dayOfWeek = format(date, 'EEEE').toLowerCase() as DayOfWeek;
  const hours = businessHours[dayOfWeek];

  if (!hours || hours.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];

  hours.forEach((range) => {
    const [startHour, startMinute] = range.start.split(':').map(Number);
    const [endHour, endMinute] = range.end.split(':').map(Number);

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    while (currentTime.getTime() + duration * 60000 <= endTime.getTime()) {
      const slotEndTime = new Date(currentTime.getTime() + duration * 60000);

      slots.push({
        id: `${date.getTime()}-${currentTime.getTime()}`,
        start_time: currentTime.toISOString(),
        end_time: slotEndTime.toISOString(),
        available: true,
        max_bookings: 1,
        current_bookings: 0,
      });

      // Move to next slot with buffer
      currentTime = new Date(slotEndTime.getTime() + bufferMinutes * 60000);
    }
  });

  return slots;
};

export const filterAvailableSlots = (
  slots: TimeSlot[],
  existingAppointments: CalendarEvent[],
  minNoticeHours: number = 24
): TimeSlot[] => {
  const now = new Date();
  const minBookingTime = new Date(now.getTime() + minNoticeHours * 3600000);

  return slots.filter((slot) => {
    const slotStart = new Date(slot.start_time);

    // Check minimum notice
    if (slotStart < minBookingTime) {
      return false;
    }

    // Check for conflicts with existing appointments
    const hasConflict = existingAppointments.some((apt) => {
      const aptStart = new Date(apt.start);
      const aptEnd = new Date(apt.end);
      const slotEnd = new Date(slot.end_time);

      return slotStart < aptEnd && slotEnd > aptStart;
    });

    return !hasConflict && slot.available;
  });
};

// =====================================================
// Business Hours Utilities
// =====================================================

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: [{ start: '09:00', end: '17:00' }],
  tuesday: [{ start: '09:00', end: '17:00' }],
  wednesday: [{ start: '09:00', end: '17:00' }],
  thursday: [{ start: '09:00', end: '17:00' }],
  friday: [{ start: '09:00', end: '17:00' }],
  saturday: [],
  sunday: [],
};

export const isDayAvailable = (day: DayOfWeek, businessHours: BusinessHours): boolean => {
  return businessHours[day] && businessHours[day].length > 0;
};

export const isTimeInBusinessHours = (
  date: Date,
  businessHours: BusinessHours
): boolean => {
  const dayOfWeek = format(date, 'EEEE').toLowerCase() as DayOfWeek;
  const hours = businessHours[dayOfWeek];

  if (!hours || hours.length === 0) {
    return false;
  }

  const currentTime = format(date, 'HH:mm');

  return hours.some((range) => {
    return currentTime >= range.start && currentTime <= range.end;
  });
};

// =====================================================
// Appointment Utilities
// =====================================================

export const getAppointmentDuration = (start: Date | string, end: Date | string): number => {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return (endDate.getTime() - startDate.getTime()) / 60000; // minutes
};

export const canReschedule = (
  appointment: { start_time: string; status: string },
  minNoticeHours: number = 24
): boolean => {
  if (['completed', 'cancelled'].includes(appointment.status)) {
    return false;
  }

  const startTime = new Date(appointment.start_time);
  const now = new Date();
  const hoursUntilAppointment = (startTime.getTime() - now.getTime()) / 3600000;

  return hoursUntilAppointment >= minNoticeHours;
};

export const hasReminder = (
  reminders: Array<{ remind_before_hours: number; status: string }>,
  hours: number
): boolean => {
  return reminders.some((r) => r.remind_before_hours === hours && r.status !== 'cancelled');
};

// =====================================================
// Color Utilities
// =====================================================

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500',
  confirmed: 'bg-green-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-purple-500',
  rescheduled: 'bg-orange-500',
};

export const getStatusColor = (status: string): string => {
  return APPOINTMENT_STATUS_COLORS[status] || 'bg-gray-500';
};

export const getPastelColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
};

// =====================================================
// Validation Utilities
// =====================================================

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhone = (phone: string): boolean => {
  return /^[\d\s\-+()]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateTimeRange = (start: string, end: string): boolean => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return endMinutes > startMinutes;
};

// =====================================================
// Export Utilities
// =====================================================

export const exportToICS = (appointment: {
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  location?: string;
}): string => {
  const startDate = format(new Date(appointment.start_time), "yyyyMMdd'T'HHmmss");
  const endDate = format(new Date(appointment.end_time), "yyyyMMdd'T'HHmmss");

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${appointment.title}`,
    appointment.description ? `DESCRIPTION:${appointment.description}` : '',
    appointment.location ? `LOCATION:${appointment.location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
};
