-- Activities Table (Track all interactions with contacts/companies)
create table public.activities (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Relations
  contact_id uuid references public.contacts(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  user_id uuid references public.user_profiles(id),

  -- Activity Details
  type text not null check (type in ('note', 'email_sent', 'email_received', 'call', 'meeting', 'task', 'deal_stage_change', 'other')),
  title text not null,
  description text,

  -- Additional Data
  metadata jsonb default '{}'::jsonb,

  -- Duration (for calls/meetings in minutes)
  duration_minutes integer,

  -- Status (for tasks/meetings)
  status text check (status in ('pending', 'in_progress', 'completed', 'cancelled')) default 'completed',

  -- Timestamps
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index idx_activities_organization_id on public.activities(organization_id);
create index idx_activities_contact_id on public.activities(contact_id);
create index idx_activities_company_id on public.activities(company_id);
create index idx_activities_deal_id on public.activities(deal_id);
create index idx_activities_user_id on public.activities(user_id);
create index idx_activities_type on public.activities(type);
create index idx_activities_created_at on public.activities(created_at desc);
create index idx_activities_due_date on public.activities(due_date);

-- RLS Policies
alter table public.activities enable row level security;

create policy "Users can view activities in their organization" on public.activities
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = activities.organization_id
    )
  );

create policy "Users can insert activities into their organization" on public.activities
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = activities.organization_id
    )
  );

create policy "Users can update activities in their organization" on public.activities
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = activities.organization_id
    )
  );

create policy "Users can delete activities in their organization" on public.activities
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = activities.organization_id
    )
  );

-- Deal History Table (Track stage changes for deals)
create table public.deal_history (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  deal_id uuid references public.deals(id) on delete cascade not null,

  -- Stage Change Details
  from_stage_id uuid references public.stages(id),
  to_stage_id uuid references public.stages(id),
  from_stage_name text,
  to_stage_name text,

  -- Status Change Details
  from_status text,
  to_status text,

  -- Metadata
  changed_by_user_id uuid references public.user_profiles(id),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_deal_history_deal_id on public.deal_history(deal_id);
create index idx_deal_history_created_at on public.deal_history(created_at desc);

-- RLS Policies
alter table public.deal_history enable row level security;

create policy "Users can view deal history in their organization" on public.deal_history
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = deal_history.organization_id
    )
  );

create policy "Users can insert deal history into their organization" on public.deal_history
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = deal_history.organization_id
    )
  );

-- Tags Table (for tagging contacts, companies, deals)
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  color text default '#3b82f6',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(organization_id, name)
);

-- RLS Policies
alter table public.tags enable row level security;

create policy "Users can view tags in their organization" on public.tags
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = tags.organization_id
    )
  );

create policy "Users can insert tags into their organization" on public.tags
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = tags.organization_id
    )
  );

create policy "Users can update tags in their organization" on public.tags
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = tags.organization_id
    )
  );

-- Contact Tags Junction Table
create table public.contact_tags (
  contact_id uuid references public.contacts(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (contact_id, tag_id)
);

-- RLS
alter table public.contact_tags enable row level security;

create policy "Users can view contact tags" on public.contact_tags
  for select using (
    exists (
      select 1 from public.contacts c
      join public.memberships m on m.organization_id = c.organization_id
      where c.id = contact_tags.contact_id and m.user_id = auth.uid()
    )
  );

create policy "Users can insert contact tags" on public.contact_tags
  for insert with check (
    exists (
      select 1 from public.contacts c
      join public.memberships m on m.organization_id = c.organization_id
      where c.id = contact_tags.contact_id and m.user_id = auth.uid()
    )
  );

create policy "Users can delete contact tags" on public.contact_tags
  for delete using (
    exists (
      select 1 from public.contacts c
      join public.memberships m on m.organization_id = c.organization_id
      where c.id = contact_tags.contact_id and m.user_id = auth.uid()
    )
  );

-- Lead Scores Table (cached lead scores)
create table public.lead_scores (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  contact_id uuid references public.contacts(id) on delete cascade not null unique,

  -- Score Details
  score integer not null default 0 check (score >= 0 and score <= 100),
  grade text check (grade in ('A', 'B', 'C', 'D', 'F')),

  -- Factor Breakdown (stored as JSON)
  factors jsonb default '{"engagement": 0, "demographics": 0, "behavior": 0, "timing": 0}'::jsonb,

  -- Metadata
  last_calculated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes
create index idx_lead_scores_contact_id on public.lead_scores(contact_id);
create index idx_lead_scores_score on public.lead_scores(score desc);
create index idx_lead_scores_grade on public.lead_scores(grade);

-- RLS
alter table public.lead_scores enable row level security;

create policy "Users can view lead scores in their organization" on public.lead_scores
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = lead_scores.organization_id
    )
  );

-- Function to update updated_at timestamp
create or replace function update_lead_scores_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_lead_scores_updated_at
  before update on public.lead_scores
  for each row
  execute procedure update_lead_scores_updated_at();
