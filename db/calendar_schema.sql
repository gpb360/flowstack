-- =====================================================
-- Calendar/Appointments Module Schema
-- Appointment scheduling with availability management
-- =====================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- Calendars Table
-- User calendars for appointments
-- =====================================================

create table public.calendars (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Basic info
  name text not null,
  description text,
  color text default '#3b82f6', -- Hex color for UI

  -- Owner
  owner_id uuid references public.user_profiles(id) on delete set null,

  -- Calendar settings
  timezone text default 'UTC',
  buffer_minutes integer default 0, -- Buffer between appointments
  min_notice_hours integer default 24, -- Minimum booking notice
  max_booking_days_ahead integer default 90,

  -- Business hours
  business_hours jsonb default '{}'::jsonb, -- { mon: [{ start, end }], tue: [...] }

  -- Status
  active boolean default true,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for calendars
create index idx_calendars_organization_id on public.calendars(organization_id);
create index idx_calendars_owner_id on public.calendars(owner_id);
create index idx_calendars_active on public.calendars(active);

-- =====================================================
-- Appointment Types Table
-- Configurable appointment types
-- =====================================================

create table public.appointment_types (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  calendar_id uuid references public.calendars(id) on delete cascade not null,

  -- Type details
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price numeric(10, 2) default 0.00,

  -- Scheduling options
  location_type text default 'in_person' check (location_type in ('in_person', 'phone', 'video', 'custom')),
  location_details text, -- Address, video link, phone number, etc.

  -- Availability
  availability jsonb default '{}'::jsonb, -- { days: [1,2,3,4,5], start_time: '09:00', end_time: '17:00' }

  -- Booking options
  require_payment boolean default false,
  require_deposit boolean default false,
  deposit_amount numeric(10, 2),

  -- Limitations
  max_advance_days integer default 90,
  min_notice_hours integer default 24,

  -- Status
  active boolean default true,

  -- Display order
  order_index integer default 0,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for appointment_types
create index idx_appointment_types_organization_id on public.appointment_types(organization_id);
create index idx_appointment_types_calendar_id on public.appointment_types(calendar_id);
create index idx_appointment_types_active on public.appointment_types(active);

-- =====================================================
-- Availability Slots Table
-- Available time slots for booking
-- =====================================================

create table public.availability_slots (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  calendar_id uuid references public.calendars(id) on delete cascade not null,

  -- Time slot
  start_time timestamptz not null,
  end_time timestamptz not null,

  -- Capacity
  max_bookings integer default 1,
  current_bookings integer default 0,

  -- Status
  status text default 'available' check (status in ('available', 'booked', 'blocked', 'cancelled')),

  -- Recurring info
  is_recurring boolean default false,
  recurring_pattern jsonb, -- { frequency: 'weekly', days: [1,3,5], end_date: '2024-12-31' }

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  exclude (start_time, end_time) with &&
);

-- Indexes for availability_slots
create index idx_availability_slots_organization_id on public.availability_slots(organization_id);
create index idx_availability_slots_calendar_id on public.availability_slots(calendar_id);
create index idx_availability_slots_start_time on public.availability_slots(start_time);
create index idx_availability_slots_status on public.availability_slots(status);

-- =====================================================
-- Appointments Table
-- Booked appointments
-- =====================================================

create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  calendar_id uuid references public.calendars(id) on delete set null,
  appointment_type_id uuid references public.appointment_types(id) on delete set null,

  -- Customer info
  contact_id uuid references public.contacts(id) on delete set null,
  customer_name text not null,
  customer_email text,
  customer_phone text,

  -- Appointment details
  title text not null,
  description text,
  location text,

  -- Timing
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_minutes integer,

  -- Timezone
  timezone text default 'UTC',

  -- Status
  status text default 'scheduled' check (status in (
    'scheduled', 'confirmed', 'in_progress', 'completed',
    'cancelled', 'no_show', 'rescheduled'
  )),

  -- Payment
  payment_status text check (payment_status in ('pending', 'paid', 'refunded', 'cancelled')),

  -- Meeting link (for video appointments)
  meeting_link text,
  meeting_id text,
  meeting_password text,

  -- Notes
  internal_notes text,
  customer_notes text,

  -- Calendar sync
  calendar_event_id text, -- External calendar event ID (Google, Outlook, etc.)
  synced_to_external_cal boolean default false,

  -- Booking source
  booking_source text default 'manual' check (booking_source in ('manual', 'widget', 'api', 'email')),

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  exclude (start_time, end_time) with &&
);

-- Indexes for appointments
create index idx_appointments_organization_id on public.appointments(organization_id);
create index idx_appointments_calendar_id on public.appointments(calendar_id);
create index idx_appointments_contact_id on public.appointments(contact_id);
create index idx_appointments_start_time on public.appointments(start_time);
create index idx_appointments_status on public.appointments(status);
create index idx_appointments_customer_email on public.appointments(customer_email);

-- =====================================================
-- Appointment Reminders Table
-- Automated reminders for appointments
-- =====================================================

create table public.appointment_reminders (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  appointment_id uuid references public.appointments(id) on delete cascade not null,

  -- Reminder timing
  remind_before_hours integer not null, -- e.g., 24 = 24 hours before

  -- Reminder method
  type text not null check (type in ('email', 'sms')),

  -- Status
  status text default 'pending' check (status in ('pending', 'sent', 'failed')),

  -- Tracking
  sent_at timestamptz,
  error_message text,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for appointment_reminders
create index idx_appointment_reminders_organization_id on public.appointment_reminders(organization_id);
create index idx_appointment_reminders_appointment_id on public.appointment_reminders(appointment_id);
create index idx_appointment_reminders_status on public.appointment_reminders(status);

-- =====================================================
-- Appointment History Table
-- Audit trail for appointment changes
-- =====================================================

create table public.appointment_history (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  appointment_id uuid references public.appointments(id) on delete cascade not null,

  -- Change tracking
  action text not null, -- created, updated, cancelled, rescheduled, completed
  changed_by_user_id uuid references public.user_profiles(id) on delete set null,

  -- Previous values
  previous_values jsonb, -- Store the changed fields

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for appointment_history
create index idx_appointment_history_organization_id on public.appointment_history(organization_id);
create index idx_appointment_history_appointment_id on public.appointment_history(appointment_id);
create index idx_appointment_history_created_at on public.appointment_history(created_at desc);

-- =====================================================
-- Enable Row Level Security
-- =====================================================

alter table public.calendars enable row level security;
alter table public.appointment_types enable row level security;
alter table public.availability_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_reminders enable row level security;
alter table public.appointment_history enable row level security;

-- =====================================================
-- RLS Policies for Calendars
-- =====================================================

create policy "Org members can view calendars" on public.calendars
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = calendars.organization_id
    )
  );

create policy "Org members can insert calendars" on public.calendars
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = calendars.organization_id
    )
  );

create policy "Org members can update calendars" on public.calendars
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = calendars.organization_id
    )
  );

create policy "Org members can delete calendars" on public.calendars
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = calendars.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Appointment Types
-- =====================================================

create policy "Org members can view appointment_types" on public.appointment_types
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_types.organization_id
    )
  );

create policy "Org members can insert appointment_types" on public.appointment_types
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_types.organization_id
    )
  );

create policy "Org members can update appointment_types" on public.appointment_types
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_types.organization_id
    )
  );

create policy "Org members can delete appointment_types" on public.appointment_types
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_types.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Availability Slots
-- =====================================================

create policy "Org members can view availability_slots" on public.availability_slots
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = availability_slots.organization_id
    )
  );

create policy "Org members can insert availability_slots" on public.availability_slots
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = availability_slots.organization_id
    )
  );

create policy "Org members can update availability_slots" on public.availability_slots
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = availability_slots.organization_id
    )
  );

create policy "Org members can delete availability_slots" on public.availability_slots
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = availability_slots.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Appointments
-- =====================================================

create policy "Org members can view appointments" on public.appointments
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointments.organization_id
    )
  );

create policy "Org members can insert appointments" on public.appointments
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointments.organization_id
    )
  );

create policy "Org members can update appointments" on public.appointments
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointments.organization_id
    )
  );

create policy "Org members can delete appointments" on public.appointments
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointments.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Appointment Reminders
-- =====================================================

create policy "Org members can view appointment_reminders" on public.appointment_reminders
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_reminders.organization_id
    )
  );

create policy "Org members can insert appointment_reminders" on public.appointment_reminders
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_reminders.organization_id
    )
  );

create policy "Org members can update appointment_reminders" on public.appointment_reminders
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_reminders.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Appointment History
-- =====================================================

create policy "Org members can view appointment_history" on public.appointment_history
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_history.organization_id
    )
  );

create policy "System can insert appointment_history" on public.appointment_history
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = appointment_history.organization_id
    )
  );

-- =====================================================
-- Triggers for updated_at
-- =====================================================

create or replace function public.update_calendar_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger calendars_updated_at
  before update on public.calendars
  for each row
  execute procedure public.update_calendar_updated_at();

create trigger appointment_types_updated_at
  before update on public.appointment_types
  for each row
  execute procedure public.update_calendar_updated_at();

create trigger availability_slots_updated_at
  before update on public.availability_slots
  for each row
  execute procedure public.update_calendar_updated_at();

create trigger appointments_updated_at
  before update on public.appointments
  for each row
  execute procedure public.update_calendar_updated_at();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get available slots
create or replace function public.get_available_slots(
  p_calendar_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
returns table (
  slot_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  available_spots integer
) as $$
begin
  return query
  select
    s.id as slot_id,
    s.start_time,
    s.end_time,
    (s.max_bookings - s.current_bookings) as available_spots
  from public.availability_slots s
  where
    s.calendar_id = p_calendar_id
    and s.status = 'available'
    and s.start_time >= p_start_date
    and s.end_time <= p_end_date
    and (s.max_bookings - s.current_bookings) > 0
  order by s.start_time;
end;
$$ language plpgsql security definer;
