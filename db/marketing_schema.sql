-- Marketing Templates Table
create table public.marketing_templates (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  type text check (type in ('email', 'sms')) not null,
  subject text, -- Only for email
  content text not null, -- HTML for email, plain text for sms
  variables jsonb default '[]'::jsonb, -- List of expected variables
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Marketing Campaigns Table
create table public.marketing_campaigns (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  type text check (type in ('email', 'sms')) not null,
  status text check (status in ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled')) default 'draft',
  template_id uuid references public.marketing_templates(id),
  
  -- Audience definition
  audience_filters jsonb default '{}'::jsonb, -- e.g. { "tags": ["newsletter"], "segment": "active" }
  
  -- Scheduling and Stats
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- Stats cache
  total_recipients int default 0,
  sent_count int default 0,
  failed_count int default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Marketing Logs (Individual Messages)
create table public.marketing_logs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  
  type text check (type in ('email', 'sms')) not null,
  status text check (status in ('pending', 'sent', 'delivered', 'failed', 'clicked', 'opened')) default 'pending',
  
  provider_message_id text, -- ID from Resend/Twilio
  error_message text,
  
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.marketing_templates enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.marketing_logs enable row level security;

-- Policies for Templates
create policy "Users can view templates in their organization" on public.marketing_templates
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_templates.organization_id
    )
  );

create policy "Users can insert templates into their organization" on public.marketing_templates
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_templates.organization_id
    )
  );

create policy "Users can update templates in their organization" on public.marketing_templates
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_templates.organization_id
    )
  );

create policy "Users can delete templates in their organization" on public.marketing_templates
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_templates.organization_id
    )
  );

-- Policies for Campaigns
create policy "Users can view campaigns in their organization" on public.marketing_campaigns
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_campaigns.organization_id
    )
  );

create policy "Users can insert campaigns into their organization" on public.marketing_campaigns
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_campaigns.organization_id
    )
  );

create policy "Users can update campaigns in their organization" on public.marketing_campaigns
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_campaigns.organization_id
    )
  );

create policy "Users can delete campaigns in their organization" on public.marketing_campaigns
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_campaigns.organization_id
    )
  );

-- Policies for Logs
create policy "Users can view marketing logs in their organization" on public.marketing_logs
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_logs.organization_id
    )
  );

-- Logs are usually inserted by system or edge functions, but if we do client-side sending (unlikely) or just for standard write access:
create policy "Users can insert marketing logs into their organization" on public.marketing_logs
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = marketing_logs.organization_id
    )
  );
