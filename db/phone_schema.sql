-- =====================================================
-- Phone/VoIP Module Schema
-- Phone numbers, calls, recordings, SMS
-- =====================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- Phone Numbers Table
-- Purchased/tracked phone numbers
-- =====================================================

create table public.phone_numbers (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Number details
  phone_number text not null unique,
  country_code text default '+1',
  type text default 'local' check (type in ('local', 'toll_free', 'mobile')),

  -- Provider info
  provider text not null, -- twilio, plivo, etc.
  provider_phone_id text, -- External ID

  -- Routing
  forward_to text, -- Forward incoming calls to this number
  sip_trunk_id text, -- For SIP trunking
  webhook_url text, -- For call events

  -- Status
  status text default 'active' check (status in ('active', 'suspended', 'cancelled')),

  -- Tracking
  tracking_source text, -- Which campaign/source this number is for
  call_tracking_enabled boolean default true,

  -- Settings
  recording_enabled boolean default false,
  voicemail_enabled boolean default true,
  sms_enabled boolean default true,

  -- Timing
  purchased_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for phone_numbers
create index idx_phone_numbers_organization_id on public.phone_numbers(organization_id);
create index idx_phone_numbers_status on public.phone_numbers(status);
create index idx_phone_numbers_phone_number on public.phone_numbers(phone_number);

-- =====================================================
-- Phone Calls Table
-- Call log and metadata
-- =====================================================

create table public.phone_calls (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  phone_number_id uuid references public.phone_numbers(id) on delete set null,

  -- Call details
  direction text not null check (direction in ('inbound', 'outbound')),
  from_number text not null,
  to_number text not null,

  -- Contact association
  contact_id uuid references public.contacts(id) on delete set null,

  -- Call status
  status text default 'ringing' check (status in (
    'ringing', 'in_progress', 'completed', 'failed',
    'busy', 'no_answer', 'cancelled', 'voicemail'
  )),

  -- Timing
  started_at timestamptz default timezone('utc'::text, now()) not null,
  ended_at timestamptz,
  duration_seconds integer,

  -- Provider info
  provider_call_id text, -- External call SID
  provider text not null,

  -- Recording
  recording_id uuid references public.phone_recordings(id) on delete set null,
  recording_enabled boolean default false,

  -- Voicemail
  voicemail_id uuid references public.voicemails(id) on delete set null,

  -- Call flow tracking
  call_flow jsonb, -- Track IVR options selected, transfers, etc.

  -- Quality metrics
  quality_score numeric(2, 1), -- 1.0-5.0
  hangup_reason text,

  -- Agent assignment (for call centers)
  agent_id uuid references public.user_profiles(id) on delete set null,

  -- Tags and notes
  tags text[],
  notes text,

  -- Created timestamp
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for phone_calls
create index idx_phone_calls_organization_id on public.phone_calls(organization_id);
create index idx_phone_calls_phone_number_id on public.phone_calls(phone_number_id);
create index idx_phone_calls_contact_id on public.phone_calls(contact_id);
create index idx_phone_calls_status on public.phone_calls(status);
create index idx_phone_calls_started_at on public.phone_calls(started_at desc);
create index idx_phone_calls_from_number on public.phone_calls(from_number);
create index idx_phone_calls_to_number on public.phone_calls(to_number);

-- =====================================================
-- Phone Recordings Table
-- Call recordings storage
-- =====================================================

create table public.phone_recordings (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  call_id uuid references public.phone_calls(id) on delete cascade not null,

  -- Storage info
  storage_path text not null, -- Path to recording file
  storage_provider text default 'supabase', -- supabase, s3, etc.
  duration_seconds integer,
  file_size_bytes integer,

  -- Format
  format text default 'mp3', -- mp3, wav, etc.
  url text, -- Public/temporary URL

  -- Transcription
  transcript text,
  transcription_status text check (transcription_status in ('pending', 'processing', 'completed', 'failed')),
  transcribed_at timestamptz,

  -- AI analysis
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score numeric(3, 2), -- Confidence 0.00-1.00
  keywords text[], -- Extracted keywords
  summary text, -- AI-generated summary

  -- Compliance
  consent_obtained boolean default false,
  consent_obtained_at timestamptz,

  -- Access control
  accessible_by_roles text[], -- ['owner', 'admin']

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for phone_recordings
create index idx_phone_recordings_organization_id on public.phone_recordings(organization_id);
create index idx_phone_recordings_call_id on public.phone_recordings(call_id);
create index idx_phone_recordings_transcription_status on public.phone_recordings(transcription_status);

-- =====================================================
-- Voicemails Table
-- Voicemail messages
-- =====================================================

create table public.voicemails (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  phone_number_id uuid references public.phone_numbers(id) on delete set null,
  call_id uuid references public.phone_calls(id) on delete set null,

  -- Caller info
  from_number text not null,
  caller_name text,

  -- Message details
  duration_seconds integer,
  transcription text,
  transcription_status text default 'pending' check (transcription_status in ('pending', 'processing', 'completed', 'failed')),

  -- Storage
  storage_path text not null,
  storage_provider text default 'supabase',
  url text,
  file_size_bytes integer,

  -- Status
  status text default 'new' check (status in ('new', 'listened', 'archived', 'deleted')),

  -- Notifications
  notification_sent boolean default false,
  notification_sent_at timestamptz,

  -- Timing
  received_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for voicemails
create index idx_voicemails_organization_id on public.voicemails(organization_id);
create index idx_voicemails_phone_number_id on public.voicemails(phone_number_id);
create index idx_voicemails_call_id on public.voicemails(call_id);
create index idx_voicemails_status on public.voicemails(status);
create index idx_voicemails_received_at on public.voicemails(received_at desc);

-- =====================================================
-- SMS Threads Table
-- Conversation threads for SMS
-- =====================================================

create table public.sms_threads (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Participants
  phone_number_id uuid references public.phone_numbers(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,

  -- The other party's phone number
  participant_phone text not null,

  -- Thread status
  status text default 'active' check (status in ('active', 'archived', 'closed')),

  -- Assignment
  assigned_to uuid references public.user_profiles(id) on delete set null,

  -- Last message preview
  last_message_at timestamptz,
  last_message_preview text,

  -- Unread count
  unread_count integer default 0,

  -- Tags
  tags text[],

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for sms_threads
create index idx_sms_threads_organization_id on public.sms_threads(organization_id);
create index idx_sms_threads_phone_number_id on public.sms_threads(phone_number_id);
create index idx_sms_threads_contact_id on public.sms_threads(contact_id);
create index idx_sms_threads_participant_phone on public.sms_threads(participant_phone);
create index idx_sms_threads_status on public.sms_threads(status);
create index idx_sms_threads_updated_at on public.sms_threads(updated_at desc);

-- =====================================================
-- SMS Messages Table
-- Individual SMS messages
-- =====================================================

create table public.sms_messages (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  thread_id uuid references public.sms_threads(id) on delete cascade not null,
  phone_number_id uuid references public.phone_numbers(id) on delete set null,

  -- Message details
  direction text not null check (direction in ('inbound', 'outbound')),
  from_number text not null,
  to_number text not null,

  -- Content
  body text not null,
  media_urls text[], -- MMS images/files

  -- Status
  status text default 'sent' check (status in (
    'queued', 'sent', 'delivered', 'failed',
    'undelivered', 'received', 'read'
  )),

  -- Provider info
  provider_message_id text, -- External message SID
  provider text not null,
  error_code text,
  error_message text,

  -- Read status
  read_at timestamptz,

  -- Sent from
  sent_by uuid references public.user_profiles(id) on delete set null,

  -- Timing
  sent_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for sms_messages
create index idx_sms_messages_organization_id on public.sms_messages(organization_id);
create index idx_sms_messages_thread_id on public.sms_messages(thread_id);
create index idx_sms_messages_phone_number_id on public.sms_messages(phone_number_id);
create index idx_sms_messages_status on public.sms_messages(status);
create index idx_sms_messages_sent_at on public.sms_messages(sent_at desc);

-- =====================================================
-- Enable Row Level Security
-- =====================================================

alter table public.phone_numbers enable row level security;
alter table public.phone_calls enable row level security;
alter table public.phone_recordings enable row level security;
alter table public.voicemails enable row level security;
alter table public.sms_threads enable row level security;
alter table public.sms_messages enable row level security;

-- =====================================================
-- RLS Policies for Phone Numbers
-- =====================================================

create policy "Org members can view phone_numbers" on public.phone_numbers
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_numbers.organization_id
    )
  );

create policy "Org members can insert phone_numbers" on public.phone_numbers
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_numbers.organization_id
    )
  );

create policy "Org members can update phone_numbers" on public.phone_numbers
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_numbers.organization_id
    )
  );

create policy "Org members can delete phone_numbers" on public.phone_numbers
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_numbers.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Phone Calls
-- =====================================================

create policy "Org members can view phone_calls" on public.phone_calls
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_calls.organization_id
    )
  );

create policy "Org members can insert phone_calls" on public.phone_calls
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_calls.organization_id
    )
  );

create policy "Org members can update phone_calls" on public.phone_calls
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_calls.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Phone Recordings
-- =====================================================

create policy "Org members can view phone_recordings" on public.phone_recordings
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_recordings.organization_id
    )
  );

create policy "Org members can insert phone_recordings" on public.phone_recordings
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_recordings.organization_id
    )
  );

create policy "Org members can update phone_recordings" on public.phone_recordings
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = phone_recordings.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Voicemails
-- =====================================================

create policy "Org members can view voicemails" on public.voicemails
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = voicemails.organization_id
    )
  );

create policy "Org members can insert voicemails" on public.voicemails
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = voicemails.organization_id
    )
  );

create policy "Org members can update voicemails" on public.voicemails
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = voicemails.organization_id
    )
  );

create policy "Org members can delete voicemails" on public.voicemails
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = voicemails.organization_id
    )
  );

-- =====================================================
-- RLS Policies for SMS Threads
-- =====================================================

create policy "Org members can view sms_threads" on public.sms_threads
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_threads.organization_id
    )
  );

create policy "Org members can insert sms_threads" on public.sms_threads
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_threads.organization_id
    )
  );

create policy "Org members can update sms_threads" on public.sms_threads
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_threads.organization_id
    )
  );

create policy "Org members can delete sms_threads" on public.sms_threads
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_threads.organization_id
    )
  );

-- =====================================================
-- RLS Policies for SMS Messages
-- =====================================================

create policy "Org members can view sms_messages" on public.sms_messages
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_messages.organization_id
    )
  );

create policy "Org members can insert sms_messages" on public.sms_messages
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_messages.organization_id
    )
  );

create policy "Org members can update sms_messages" on public.sms_messages
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sms_messages.organization_id
    )
  );

-- =====================================================
-- Triggers for updated_at
-- =====================================================

create or replace function public.update_phone_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger phone_numbers_updated_at
  before update on public.phone_numbers
  for each row
  execute procedure public.update_phone_updated_at();

create trigger sms_threads_updated_at
  before update on public.sms_threads
  for each row
  execute procedure public.update_phone_updated_at();

-- =====================================================
-- Triggers for SMS thread updates
-- =====================================================

create or replace function public.update_sms_thread_last_message()
returns trigger as $$
begin
  update public.sms_threads
  set
    last_message_at = new.sent_at,
    last_message_preview = left(new.body, 100),
    updated_at = timezone('utc'::text, now())
  where id = new.thread_id;

  if new.direction = 'inbound' then
    update public.sms_threads
    set unread_count = unread_count + 1
    where id = new.thread_id;
  end if;

  return new;
end;
$$ language plpgsql;

create trigger sms_messages_update_thread
  after insert on public.sms_messages
  for each row
  execute procedure public.update_sms_thread_last_message();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get call statistics
create or replace function public.get_call_statistics(
  p_organization_id uuid,
  p_days integer default 30
)
returns table (
  total_calls bigint,
  inbound_calls bigint,
  outbound_calls bigint,
  answered_calls bigint,
  missed_calls bigint,
  avg_duration_seconds numeric,
  avg_ring_time_seconds numeric
) as $$
begin
  return query
  select
    count(*) as total_calls,
    count(*) filter (where direction = 'inbound') as inbound_calls,
    count(*) filter (where direction = 'outbound') as outbound_calls,
    count(*) filter (where status = 'completed') as answered_calls,
    count(*) filter (where status in ('no_answer', 'busy', 'cancelled')) as missed_calls,
    avg(duration_seconds) filter (where duration_seconds is not null) as avg_duration_seconds,
    avg(extract(epoch from (ended_at - started_at))) filter (where status = 'completed') as avg_ring_time_seconds
  from public.phone_calls
  where
    organization_id = p_organization_id
    and started_at >= timezone('utc'::text, now()) - (p_days || ' days')::interval;
end;
$$ language plpgsql security definer;

-- Function to get SMS statistics
create or replace function public.get_sms_statistics(
  p_organization_id uuid,
  p_days integer default 30
)
returns table (
  total_messages bigint,
  sent_messages bigint,
  received_messages bigint,
  delivered_messages bigint,
  failed_messages bigint
) as $$
begin
  return query
  select
    count(*) as total_messages,
    count(*) filter (where direction = 'outbound') as sent_messages,
    count(*) filter (where direction = 'inbound') as received_messages,
    count(*) filter (where status = 'delivered') as delivered_messages,
    count(*) filter (where status = 'failed') as failed_messages
  from public.sms_messages
  where
    organization_id = p_organization_id
    and sent_at >= timezone('utc'::text, now()) - (p_days || ' days')::interval;
end;
$$ language plpgsql security definer;
