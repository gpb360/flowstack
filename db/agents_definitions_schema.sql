-- ============================================================================
-- Agent Definitions Table
-- Organization-scoped agent configurations
-- ============================================================================

create table if not exists public.agents (
  -- Primary key
  id uuid default uuid_generate_v4() primary key,

  -- Organization scoping
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- Agent identity
  name text not null,
  description text,

  -- Agent type category (used for icon/color defaults and workflow action mapping)
  agent_type text not null check (agent_type in (
    'orchestrator',
    'crm',
    'marketing',
    'analytics',
    'builder',
    'workflow',
    'custom'
  )) default 'custom',

  -- Configuration
  capabilities text[] not null default '{}',
  config jsonb not null default '{}'::jsonb,
  system_prompt text,

  -- Presentation
  icon text default 'Bot',
  color text default '#6366f1',

  -- State
  is_active boolean default true,

  -- Audit timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Unique agent name per organization
  constraint agents_name_organization_unique unique (organization_id, name)
);

-- Create index on organization_id for fast queries
create index if not exists idx_agents_organization_id on public.agents(organization_id);

-- Create index on agent_type for filtering
create index if not exists idx_agents_agent_type on public.agents(agent_type);

-- Create index on is_active
create index if not exists idx_agents_is_active on public.agents(is_active);

-- Enable Row Level Security
alter table public.agents enable row level security;

-- RLS Policy: Users can view agents in their organization
create policy "Users can view agents in their organization"
  on public.agents
  for select
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agents.organization_id
    )
  );

-- RLS Policy: Users can insert agents in their organization
create policy "Users can insert agents in their organization"
  on public.agents
  for insert
  with check (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agents.organization_id
    )
  );

-- RLS Policy: Users can update agents in their organization
create policy "Users can update agents in their organization"
  on public.agents
  for update
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agents.organization_id
    )
  );

-- RLS Policy: Users can delete agents in their organization
create policy "Users can delete agents in their organization"
  on public.agents
  for delete
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = agents.organization_id
    )
  );

-- Trigger to update updated_at timestamp
create or replace function public.update_agents_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger agents_updated_at
  before update on public.agents
  for each row
  execute procedure public.update_agents_updated_at();

-- Grant access
grant select on public.agents to authenticated;
grant insert on public.agents to authenticated;
grant update on public.agents to authenticated;
grant delete on public.agents to authenticated;
