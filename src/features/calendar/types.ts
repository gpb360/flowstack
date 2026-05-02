import { Database } from '@/types/database.types';

type Calendar = Database['public']['Tables']['calendars']['Row'] & Record<string, any>;
type AppointmentType = Database['public']['Tables']['appointment_types']['Row'] & Record<string, any>;
type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row'] & Record<string, any>;
type Appointment = Database['public']['Tables']['appointments']['Row'] & Record<string, any>;
type AppointmentReminder = Database['public']['Tables']['appointment_reminders']['Row'] & Record<string, any>;
type AppointmentHistory = Database['public']['Tables']['appointment_history']['Row'] & Record<string, any>;

export type {
  Calendar,
  AppointmentType,
  AvailabilitySlot,
  Appointment,
  AppointmentReminder,
  AppointmentHistory,
};

// =====================================================
// Calendar Types
// =====================================================

export type CalendarInsert = Database['public']['Tables']['calendars']['Insert'];
export type CalendarUpdate = Database['public']['Tables']['calendars']['Update'];

export type ViewMode = 'month' | 'week' | 'day' | 'agenda';
export type CalendarFilter = {
  calendarId?: string;
  status?: 'all' | 'available' | 'booked';
  dateFrom?: Date;
  dateTo?: Date;
};

// =====================================================
// Appointment Types
// =====================================================

export type AppointmentTypeInsert = Database['public']['Tables']['appointment_types']['Insert'];
export type AppointmentTypeUpdate = Database['public']['Tables']['appointment_types']['Update'];

export type LocationType = 'in_person' | 'phone' | 'video' | 'custom';

// =====================================================
// Availability Types
// =====================================================

export type AvailabilitySlotInsert = Database['public']['Tables']['availability_slots']['Insert'];
export type AvailabilitySlotUpdate = Database['public']['Tables']['availability_slots']['Update'];

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'cancelled';

export type RecurringPattern = {
  frequency: 'daily' | 'weekly' | 'monthly';
  days?: number[]; // 0-6 (Sunday-Saturday)
  end_date?: string;
  interval?: number;
};

export type TimeSlot = {
  id: string;
  start_time: string;
  end_time: string;
  available: boolean;
  max_bookings: number;
  current_bookings: number;
};

// =====================================================
// Appointment Types
// =====================================================

export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';

export type BookingSource = 'manual' | 'widget' | 'api' | 'email';

export type AppointmentFilters = {
  status?: AppointmentStatus;
  calendarId?: string;
  contactId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
};

// =====================================================
// Business Hours Types
// =====================================================

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type TimeRange = {
  start: string; // HH:mm format
  end: string; // HH:mm format
};

export type BusinessHours = Record<DayOfWeek, TimeRange[]>;

export type WeeklyAvailability = Record<
  DayOfWeek,
  {
    enabled: boolean;
    slots: TimeRange[];
  }
>;

// =====================================================
// Booking Page Types
// =====================================================

export type BookingPage = {
  id: string;
  calendar_id: string;
  appointment_type_id: string;
  slug: string;
  title: string;
  description: string | null;
  welcome_message: string | null;
  timezone: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type BookingPageInsert = Omit<BookingPage, 'id' | 'created_at' | 'updated_at'>;

// =====================================================
// Calendar Sync Types
// =====================================================

export type CalendarSync = {
  id: string;
  calendar_id: string;
  provider: 'google' | 'outlook' | 'apple';
  external_calendar_id: string;
  access_token: string;
  refresh_token: string | null;
  sync_enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SyncDirection = 'pull' | 'push' | 'bidirectional';

// =====================================================
// UI State Types
// =====================================================

export type CalendarState = {
  viewMode: ViewMode;
  selectedDate: Date;
  selectedAppointment: string | null;
  filters: CalendarFilter;
};

export type BookingFlowState = {
  step: 1 | 2 | 3 | 4;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: string;
};

// =====================================================
// Helper Types
// =====================================================

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  calendarId: string;
  appointment?: Appointment;
};

export type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: CalendarEvent[];
};
