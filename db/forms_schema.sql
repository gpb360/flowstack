-- =====================================================
-- Forms Module Schema
-- Multi-step forms with conditional logic and CRM integration
-- =====================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- Forms Table
-- Multi-step forms with conditional logic
-- =====================================================

create table public.forms (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Basic info
  name text not null,
  description text,
  status text default 'draft' check (status in ('draft', 'active', 'archived')),

  -- Form configuration
  settings jsonb default '{}'::jsonb, -- { theme: {}, branding: {}, submit_button: {} }
  thank_you_message text,
  redirect_url text,

  -- CRM integration
  create_contact boolean default false,
  create_company boolean default false,
  add_tags text[],

  -- Notifications
  send_email_notification boolean default false,
  notification_emails text[],

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for forms
create index idx_forms_organization_id on public.forms(organization_id);
create index idx_forms_status on public.forms(status);
create index idx_forms_created_at on public.forms(created_at desc);

-- =====================================================
-- Form Fields Table
-- Individual field definitions with validation
-- =====================================================

create table public.form_fields (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  form_id uuid references public.forms(id) on delete cascade not null,

  -- Field definition
  field_type text not null check (field_type in (
    'text', 'email', 'phone', 'number', 'textarea',
    'select', 'multiselect', 'checkbox', 'radio',
    'date', 'time', 'datetime', 'file',
    'rating', 'signature', 'hidden', 'section_break'
  )),

  label text not null,
  placeholder text,
  help_text text,
  default_value text,

  -- Validation
  required boolean default false,
  validation_rules jsonb default '{}'::jsonb, -- { min_length, max_length, pattern, min, max }

  -- Options (for select, radio, checkbox)
  options jsonb default '[]'::jsonb, -- [{ value, label, order }]

  -- Conditional logic
  conditional_logic jsonb, -- { show_when: { field_id, operator, value } }

  -- Layout
  order_index integer not null default 0,
  column_width integer default 12, -- 12-column grid

  -- CRM field mapping
  crm_field_mapping text, -- Maps to contact field (first_name, email, etc.)

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  unique(form_id, order_index)
);

-- Indexes for form_fields
create index idx_form_fields_organization_id on public.form_fields(organization_id);
create index idx_form_fields_form_id on public.form_fields(form_id);
create index idx_form_fields_order on public.form_fields(form_id, order_index);

-- =====================================================
-- Form Submissions Table
-- Stores submitted form data
-- =====================================================

create table public.form_submissions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  form_id uuid references public.forms(id) on delete cascade not null,

  -- Lead identification
  contact_id uuid references public.contacts(id) on delete set null,
  email text, -- Submitted email for lookup
  phone text,

  -- Submission data
  data jsonb not null default '{}'::jsonb, -- { field_id: value }
  files jsonb default '[]'::jsonb, -- Uploaded files

  -- Status tracking
  status text default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),

  -- UTM tracking
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,

  -- Technical info
  ip_address text,
  user_agent text,
  referrer text,

  -- Timing
  submitted_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for form_submissions
create index idx_form_submissions_organization_id on public.form_submissions(organization_id);
create index idx_form_submissions_form_id on public.form_submissions(form_id);
create index idx_form_submissions_contact_id on public.form_submissions(contact_id);
create index idx_form_submissions_email on public.form_submissions(email);
create index idx_form_submissions_status on public.form_submissions(status);
create index idx_form_submissions_submitted_at on public.form_submissions(submitted_at desc);

-- =====================================================
-- Form Notifications Table
-- Email and webhook notifications on submit
-- =====================================================

create table public.form_notifications (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  form_id uuid references public.forms(id) on delete cascade not null,

  -- Notification type
  type text not null check (type in ('email', 'webhook', 'sms')),

  -- Trigger conditions
  trigger_conditions jsonb default '{}'::jsonb, -- { status: 'new', field_equals: { field_id: value } }

  -- Email notification
  email_to text[], -- Recipient emails
  email_template_id uuid references public.marketing_templates(id) on delete set null,
  email_subject text,
  email_body text,

  -- Webhook notification
  webhook_url text,
  webhook_method text default 'POST' check (webhook_method in ('POST', 'PUT', 'PATCH')),
  webhook_headers jsonb default '{}'::jsonb,

  -- SMS notification
  sms_to text[], -- Phone numbers

  -- Status
  active boolean default true,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for form_notifications
create index idx_form_notifications_organization_id on public.form_notifications(organization_id);
create index idx_form_notifications_form_id on public.form_notifications(form_id);
create index idx_form_notifications_active on public.form_notifications(active);

-- =====================================================
-- Enable Row Level Security
-- =====================================================

alter table public.forms enable row level security;
alter table public.form_fields enable row level security;
alter table public.form_submissions enable row level security;
alter table public.form_notifications enable row level security;

-- =====================================================
-- RLS Policies for Forms
-- =====================================================

create policy "Org members can view forms" on public.forms
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = forms.organization_id
    )
  );

create policy "Org members can insert forms" on public.forms
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = forms.organization_id
    )
  );

create policy "Org members can update forms" on public.forms
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = forms.organization_id
    )
  );

create policy "Org members can delete forms" on public.forms
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = forms.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Form Fields
-- =====================================================

create policy "Org members can view form_fields" on public.form_fields
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_fields.organization_id
    )
  );

create policy "Org members can insert form_fields" on public.form_fields
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_fields.organization_id
    )
  );

create policy "Org members can update form_fields" on public.form_fields
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_fields.organization_id
    )
  );

create policy "Org members can delete form_fields" on public.form_fields
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_fields.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Form Submissions
-- =====================================================

create policy "Org members can view form_submissions" on public.form_submissions
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_submissions.organization_id
    )
  );

create policy "Org members can insert form_submissions" on public.form_submissions
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_submissions.organization_id
    )
  );

create policy "Org members can update form_submissions" on public.form_submissions
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_submissions.organization_id
    )
  );

create policy "Org members can delete form_submissions" on public.form_submissions
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_submissions.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Form Notifications
-- =====================================================

create policy "Org members can view form_notifications" on public.form_notifications
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_notifications.organization_id
    )
  );

create policy "Org members can insert form_notifications" on public.form_notifications
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_notifications.organization_id
    )
  );

create policy "Org members can update form_notifications" on public.form_notifications
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_notifications.organization_id
    )
  );

create policy "Org members can delete form_notifications" on public.form_notifications
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = form_notifications.organization_id
    )
  );

-- =====================================================
-- Triggers for updated_at
-- =====================================================

create or replace function public.update_forms_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger forms_updated_at
  before update on public.forms
  for each row
  execute procedure public.update_forms_updated_at();

create trigger form_fields_updated_at
  before update on public.form_fields
  for each row
  execute procedure public.update_forms_updated_at();

create trigger form_notifications_updated_at
  before update on public.form_notifications
  for each row
  execute procedure public.update_forms_updated_at();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get form submission stats
create or replace function public.get_form_submission_stats(
  p_form_id uuid,
  p_days integer default 30
)
returns table (
  total_submissions bigint,
  unique_submitters bigint,
  avg_completion_time_seconds numeric
) as $$
begin
  return query
  select
    count(*) as total_submissions,
    count(distinct email) as unique_submitters,
    avg(extract(epoch from (submitted_at - created_at))) as avg_completion_time_seconds
  from public.form_submissions
  where
    form_id = p_form_id
    and submitted_at >= timezone('utc'::text, now()) - (p_days || ' days')::interval;
end;
$$ language plpgsql security definer;
