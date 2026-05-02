-- Pipelines Table (e.g., "Sales Pipeline", "Hiring Pipeline")
create table public.pipelines (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stages Table (e.g., "Lead", "Meeting Booked", "Closed Won")
create table public.stages (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  pipeline_id uuid references public.pipelines(id) on delete cascade not null,
  name text not null,
  position integer not null default 0, -- Order in the Kanban board
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deals Table (The actual opportunities)
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  pipeline_id uuid references public.pipelines(id) on delete set null,
  stage_id uuid references public.stages(id) on delete set null,
  
  title text not null,
  value decimal(15, 2) default 0.00,
  currency text default 'USD',
  
  -- Relations
  contact_id uuid references public.contacts(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  
  -- Status
  status text check (status in ('open', 'won', 'lost', 'abandoned')) default 'open',
  expected_close_date date,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

alter table public.pipelines enable row level security;
alter table public.stages enable row level security;
alter table public.deals enable row level security;

-- Pipelines Policies
create policy "Users can view pipelines in their organization" on public.pipelines
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pipelines.organization_id
    )
  );

create policy "Users can insert pipelines into their organization" on public.pipelines
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pipelines.organization_id
    )
  );

create policy "Users can update pipelines in their organization" on public.pipelines
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pipelines.organization_id
    )
  );

create policy "Users can delete pipelines in their organization" on public.pipelines
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pipelines.organization_id
    )
  );

-- Stages Policies
create policy "Users can view stages in their organization" on public.stages
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = stages.organization_id
    )
  );

create policy "Users can insert stages into their organization" on public.stages
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = stages.organization_id
    )
  );

create policy "Users can update stages in their organization" on public.stages
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = stages.organization_id
    )
  );

create policy "Users can delete stages in their organization" on public.stages
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = stages.organization_id
    )
  );

-- Deals Policies
create policy "Users can view deals in their organization" on public.deals
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = deals.organization_id
    )
  );

create policy "Users can insert deals into their organization" on public.deals
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = deals.organization_id
    )
  );

create policy "Users can update deals in their organization" on public.deals
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = deals.organization_id
    )
  );

create policy "Users can delete deals in their organization" on public.deals
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = deals.organization_id
    )
  );
