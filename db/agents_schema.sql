-- ============================================================================
-- Multi-Agent System Database Schema
-- Follows FlowStack patterns with organization scoping and RLS
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================================
-- Agent Executions Table
-- Tracks all agent executions with organization scoping
-- ============================================================================

create table if not exists public.agent_executions (
  -- Primary key
  id uuid default uuid_generate_v4() primary key,

  -- Organization scoping
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- Agent identification
  agent_id text not null,
  agent_type text not null check (agent_type in (
    'orchestrator',
    'crm',
    'marketing',
    'analytics',
    'builder',
    'workflow'
  )),

  -- Optional workflow execution reference
  workflow_execution_id uuid references public.workflow_executions(id) on delete set null,

  -- Execution status
  status text not null check (status in ('idle', 'running', 'completed', 'failed', 'timeout')) default 'idle',

  -- Input/Output data (JSONB for flexibility)
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  error text,

  -- Additional metadata
  metadata jsonb default '{}'::jsonb,

  -- Timing information
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  duration_ms integer,

  -- Audit timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on organization_id for fast queries
create index if not exists idx_agent_executions_organization_id on public.agent_executions(organization_id);

-- Create index on agent_id for fast lookups
create index if not exists idx_agent_executions_agent_id on public.agent_executions(agent_id);

-- Create index on status for filtering
create index if not exists idx_agent_executions_status on public.agent_executions(status);

-- Create index on workflow_execution_id for workflow tracking
create index if not exists idx_agent_executions_workflow_execution_id on public.agent_executions(workflow_execution_id);

-- Create index on created_at for time-based queries
create index if not exists idx_agent_executions_created_at on public.agent_executions(created_at desc);

-- Enable Row Level Security
alter table public.agent_executions enable row level security;

-- RLS Policy: Users can view agent executions in their organization
create policy "Users can view agent executions in their organization"
  on public.agent_executions
  for select
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agent_executions.organization_id
    )
  );

-- RLS Policy: Users can insert agent executions in their organization
create policy "Users can insert agent executions in their organization"
  on public.agent_executions
  for insert
  with check (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agent_executions.organization_id
    )
  );

-- RLS Policy: Users can update agent executions in their organization
create policy "Users can update agent executions in their organization"
  on public.agent_executions
  for update
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agent_executions.organization_id
    )
  );

-- RLS Policy: Users can delete agent executions in their organization
create policy "Users can delete agent executions in their organization"
  on public.agent_executions
  for delete
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agent_executions.organization_id
    )
  );

-- Trigger to update updated_at timestamp
create or replace function public.update_agent_executions_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger agent_executions_updated_at
  before update on public.agent_executions
  for each row
  execute procedure public.update_agent_executions_updated_at();

-- ============================================================================
-- Orchestrator Tasks Table
-- Tracks orchestrator workflow executions
-- ============================================================================

create table if not exists public.orchestrator_tasks (
  -- Primary key
  id uuid default uuid_generate_v4() primary key,

  -- Organization scoping
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- Optional workflow reference
  workflow_id uuid references public.workflows(id) on delete set null,

  -- Task definition (stores the full orchestrator workflow)
  task_definition jsonb not null default '{}'::jsonb,

  -- Execution status
  status text not null check (status in ('idle', 'running', 'completed', 'failed', 'timeout')) default 'idle',

  -- Execution log (stores step-by-step execution history)
  execution_log jsonb default '[]'::jsonb,

  -- Shared context between tasks
  context jsonb default '{}'::jsonb,

  -- Timing information
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  duration_ms integer,

  -- Audit timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on organization_id
create index if not exists idx_orchestrator_tasks_organization_id on public.orchestrator_tasks(organization_id);

-- Create index on workflow_id
create index if not exists idx_orchestrator_tasks_workflow_id on public.orchestrator_tasks(workflow_id);

-- Create index on status
create index if not exists idx_orchestrator_tasks_status on public.orchestrator_tasks(status);

-- Create index on created_at
create index if not exists idx_orchestrator_tasks_created_at on public.orchestrator_tasks(created_at desc);

-- Enable Row Level Security
alter table public.orchestrator_tasks enable row level security;

-- RLS Policy: Users can view orchestrator tasks in their organization
create policy "Users can view orchestrator tasks in their organization"
  on public.orchestrator_tasks
  for select
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = orchestrator_tasks.organization_id
    )
  );

-- RLS Policy: Users can insert orchestrator tasks in their organization
create policy "Users can insert orchestrator tasks in their organization"
  on public.orchestrator_tasks
  for insert
  with check (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = orchestrator_tasks.organization_id
    )
  );

-- RLS Policy: Users can update orchestrator tasks in their organization
create policy "Users can update orchestrator tasks in their organization"
  on public.orchestrator_tasks
  for update
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = orchestrator_tasks.organization_id
    )
  );

-- RLS Policy: Users can delete orchestrator tasks in their organization
create policy "Users can delete orchestrator tasks in their organization"
  on public.orchestrator_tasks
  for delete
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = orchestrator_tasks.organization_id
    )
  );

-- Trigger to update updated_at timestamp
create or replace function public.update_orchestrator_tasks_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger orchestrator_tasks_updated_at
  before update on public.orchestrator_tasks
  for each row
  execute procedure public.update_orchestrator_tasks_updated_at();

-- ============================================================================
-- Agent Capabilities Table
-- Cache for quick capability lookup (optional, for performance)
-- ============================================================================

create table if not exists public.agent_capabilities (
  -- Primary key
  agent_id text primary key,

  -- Capabilities array
  capabilities text[] not null,

  -- Version for cache invalidation
  version integer default 1,

  -- Timestamp
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.agent_capabilities enable row level security;

-- RLS Policy: All authenticated users can read capabilities
create policy "Authenticated users can view agent capabilities"
  on public.agent_capabilities
  for select
  using (auth.uid() is not null);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to log agent execution
create or replace function public.log_agent_execution(
  p_organization_id uuid,
  p_agent_id text,
  p_agent_type text,
  p_input jsonb,
  p_output jsonb default null,
  p_status text default 'completed',
  p_error text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid as $$
declare
  v_execution_id uuid;
  v_started_at timestamptz;
  v_completed_at timestamptz;
begin
  v_started_at := timezone('utc'::text, now());
  v_completed_at := timezone('utc'::text, now());

  insert into public.agent_executions (
    organization_id,
    agent_id,
    agent_type,
    input,
    output,
    status,
    error,
    metadata,
    started_at,
    completed_at,
    duration_ms
  )
  values (
    p_organization_id,
    p_agent_id,
    p_agent_type,
    p_input,
    p_output,
    p_status,
    p_error,
    p_metadata,
    v_started_at,
    v_completed_at,
    extract(epoch from (v_completed_at - v_started_at)) * 1000
  )
  returning id into v_execution_id;

  return v_execution_id;
end;
$$ language plpgsql security definer;

-- Function to get agent execution statistics
create or replace function public.get_agent_execution_stats(
  p_organization_id uuid,
  p_agent_id text default null,
  p_days integer default 30
)
returns table (
  agent_id text,
  total_executions bigint,
  successful_executions bigint,
  failed_executions bigint,
  avg_duration_ms numeric,
  success_rate numeric
) as $$
begin
  return query
  select
    e.agent_id,
    count(*) as total_executions,
    count(*) filter (where e.status = 'completed') as successful_executions,
    count(*) filter (where e.status = 'failed') as failed_executions,
    avg(e.duration_ms) as avg_duration_ms,
    (count(*) filter (where e.status = 'completed')::numeric / count(*) * 100) as success_rate
  from public.agent_executions e
  where
    e.organization_id = p_organization_id
    and (p_agent_id is null or e.agent_id = p_agent_id)
    and e.created_at >= timezone('utc'::text, now()) - (p_days || ' days')::interval
  group by e.agent_id;
end;
$$ language plpgsql security definer;

-- Grant access to authenticated users
grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert on public.agent_executions to authenticated;
grant insert on public.orchestrator_tasks to authenticated;
grant update on public.agent_executions to authenticated;
grant update on public.orchestrator_tasks to authenticated;
grant delete on public.agent_executions to authenticated;
grant delete on public.orchestrator_tasks to authenticated;
grant execute on function public.log_agent_execution to authenticated;
grant execute on function public.get_agent_execution_stats to authenticated;
