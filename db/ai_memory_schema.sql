-- ============================================================================
-- AI Memory & Context Schema
-- Extends FlowStack with conversation memory and context tracking
-- ============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================================
-- Conversation Memories Table
-- Stores conversation history and context for AI interactions
-- ============================================================================

create table if not exists public.conversation_memories (
  -- Primary key
  id uuid default uuid_generate_v4() primary key,

  -- User and organization scoping
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- Conversation data
  messages jsonb not null default '[]'::jsonb,
  context_data jsonb not null default '{}'::jsonb,
  summary text,

  -- Metadata
  token_count integer default 0,
  module text,
  tags text[] default array[]::text[],

  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Soft delete
  deleted_at timestamp with time zone
);

-- Create index on user_id for fast user-specific queries
create index if not exists idx_conversation_memories_user_id on public.conversation_memories(user_id);

-- Create index on organization_id for fast org-specific queries
create index if not exists idx_conversation_memories_organization_id on public.conversation_memories(organization_id);

-- Create index on module for filtering by feature
create index if not exists idx_conversation_memories_module on public.conversation_memories(module);

-- Create index on created_at for time-based queries
create index if not exists idx_conversation_memories_created_at on public.conversation_memories(created_at desc);

-- Create GIN index on tags for array searching
create index if not exists idx_conversation_memories_tags on public.conversation_memories using gin(tags);

-- Create GIN index on messages for full-text search
create index if not exists idx_conversation_memories_messages on public.conversation_memories using gin(messages);

-- Enable Row Level Security
alter table public.conversation_memories enable row level security;

-- RLS Policy: Users can view their own conversation memories in their organization
create policy "Users can view their own conversation memories"
  on public.conversation_memories
  for select
  using (
    auth.uid() = user_id
    and organization_id in (
      select organization_id from public.memberships
      where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert conversation memories
create policy "Users can insert conversation memories"
  on public.conversation_memories
  for insert
  with check (
    auth.uid() = user_id
    and organization_id in (
      select organization_id from public.memberships
      where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update their own conversation memories
create policy "Users can update their own conversation memories"
  on public.conversation_memories
  for update
  using (
    auth.uid() = user_id
  );

-- RLS Policy: Users can delete their own conversation memories
create policy "Users can delete their own conversation memories"
  on public.conversation_memories
  for delete
  using (
    auth.uid() = user_id
  );

-- Trigger to update updated_at timestamp
create or replace function public.update_conversation_memories_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger conversation_memories_updated_at
  before update on public.conversation_memories
  for each row
  execute function public.update_conversation_memories_updated_at();

-- ============================================================================
-- User Preferences Table
-- Stores AI and user-specific preferences
-- ============================================================================

create table if not exists public.user_preferences (
  -- Primary key (composite)
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,

  -- AI Preferences
  ai_assistance_enabled boolean default true,
  command_bar_suggestions boolean default true,
  smart_notifications boolean default true,
  auto_suggestions boolean default false,

  -- UI Preferences
  theme text default 'auto' check (theme in ('light', 'dark', 'auto')),
  density text default 'comfortable' check (density in ('compact', 'comfortable', 'spacious')),

  -- Custom shortcuts
  shortcuts jsonb default '{}'::jsonb,

  -- Notification preferences
  notification_email boolean default true,
  notification_push boolean default true,
  notification_summary_frequency text default 'daily' check (notification_summary_frequency in ('realtime', 'hourly', 'daily', 'weekly')),

  -- Timestamps
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Primary key constraint
  primary key (user_id, organization_id)
);

-- Enable Row Level Security
alter table public.user_preferences enable row level security;

-- RLS Policy: Users can view their own preferences
create policy "Users can view their own preferences"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can insert their own preferences
create policy "Users can insert their own preferences"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can update their own preferences
create policy "Users can update their own preferences"
  on public.user_preferences
  for update
  using (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row
  execute function public.update_user_preferences_updated_at();

create or replace function public.update_user_preferences_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get or create user preferences
create or replace function public.get_or_create_user_preferences(
  p_user_id uuid,
  p_organization_id uuid
)
returns jsonb as $$
declare
  v_prefs jsonb;
begin
  -- Try to get existing preferences
  select * into v_prefs
  from public.user_preferences
  where user_id = p_user_id and organization_id = p_organization_id;

  -- If not found, create default preferences
  if not found then
    insert into public.user_preferences (user_id, organization_id)
    values (p_user_id, p_organization_id)
    returning row_to_json(public.user_preferences)::jsonb into v_prefs;
  end if;

  return v_prefs;
end;
$$ language plpgsql security definer;

-- Function to search conversation memories by similarity (text-based)
create or replace function public.search_conversation_memories(
  p_user_id uuid,
  p_organization_id uuid,
  p_query text,
  p_limit integer default 10
)
returns table (
  memory_id uuid,
  summary text,
  similarity_score numeric
) as $$
begin
  return query
  select
    cm.id as memory_id,
    cm.summary,
    -- Simple word overlap similarity score
    case
      when cm.summary ilike '%' || p_query || '%' then 1.0
      when length(cm.summary) > 0 then
        (array_length(regexp_split_to_array(p_query, '\s'), 1) -
         array_length(regexp_split_to_array(cm.summary, '\s'), 1) +
         array_length(regexp_split_to_array(
           replace(lower(cm.summary), lower(p_query), ''),
           '\s'
         ), 1))::numeric / nullif(array_length(regexp_split_to_array(p_query, '\s'), 1), 0)
      else 0
    end as similarity_score
  from public.conversation_memories cm
  where
    cm.user_id = p_user_id
    and cm.organization_id = p_organization_id
    and cm.deleted_at is null
    and (
      cm.summary ilike '%' || p_query || '%'
      or cm.messages::text ilike '%' || p_query || '%'
    )
  order by similarity_score desc, cm.created_at desc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- ============================================================================
-- Grant permissions
-- ============================================================================

grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert on public.conversation_memories to authenticated;
grant insert on public.user_preferences to authenticated;
grant update on public.conversation_memories to authenticated;
grant update on public.user_preferences to authenticated;
grant delete on public.conversation_memories to authenticated;
grant execute on function public.get_or_create_user_preferences to authenticated;
grant execute on function public.search_conversation_memories to authenticated;
