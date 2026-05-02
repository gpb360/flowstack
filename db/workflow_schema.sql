-- Workflows Table
create table public.workflows (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  description text,
  status text check (status in ('active', 'paused', 'draft')) default 'draft',
  
  -- The core definition storage
  trigger_definitions jsonb default '[]'::jsonb, -- Array of triggers that start this workflow
  nodes jsonb default '[]'::jsonb,               -- React Flow nodes
  edges jsonb default '[]'::jsonb,               -- React Flow edges
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Workflow Executions Table (History)
create table public.workflow_executions (
  id uuid default uuid_generate_v4() primary key,
  workflow_id uuid references public.workflows(id) on delete cascade not null,
  organization_id uuid references public.organizations(id) not null, -- Denormalized for RLS efficiency
  
  status text check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')) default 'pending',
  
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  
  trigger_data jsonb,      -- Data that triggered the workflow (e.g. contact_id)
  execution_log jsonb,     -- Step by step execution trace
  error jsonb,             -- Error details if failed
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.workflows enable row level security;
alter table public.workflow_executions enable row level security;

-- Policies for Workflows
create policy "Users can view workflows in their organization" on public.workflows
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = workflows.organization_id
    )
  );

create policy "Users can insert workflows into their organization" on public.workflows
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = workflows.organization_id
    )
  );

create policy "Users can update workflows in their organization" on public.workflows
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = workflows.organization_id
    )
  );

create policy "Users can delete workflows in their organization" on public.workflows
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = workflows.organization_id
    )
  );

-- Policies for Workflow Executions
create policy "Users can view executions in their organization" on public.workflow_executions
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = workflow_executions.organization_id
    )
  );

-- Executions are typically created by the system/backend, but for testing/manual triggers:
create policy "Users can insert executions into their organization" on public.workflow_executions
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = workflow_executions.organization_id
    )
  );
