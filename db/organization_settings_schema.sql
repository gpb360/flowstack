-- Organization Settings
-- Stores per-organization configuration including enabled modules
create table if not exists public.organization_settings (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade unique,
  
  -- Module toggles: JSON object mapping module IDs to boolean
  -- e.g. { "crm": true, "workflows": true, "site_builder": false }
  enabled_modules jsonb not null default '{}'::jsonb,
  
  -- General settings
  default_timezone text default 'UTC',
  default_currency text default 'USD',
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.organization_settings enable row level security;

-- Users can view settings for their orgs
create policy "Users can view organization settings"
  on public.organization_settings
  for select
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = organization_settings.organization_id
    )
  );

-- Owners and admins can update settings
create policy "Owners and admins can update organization settings"
  on public.organization_settings
  for update
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = organization_settings.organization_id
      and role in ('owner', 'admin')
    )
  );

-- Auto-create settings when organization is created
create or replace function public.handle_new_org_settings()
returns trigger as $$
begin
  insert into public.organization_settings (organization_id, enabled_modules)
  values (new.id, '{}'::jsonb);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_org_created
  after insert on public.organizations
  for each row execute procedure public.handle_new_org_settings();

-- Index for fast lookups
create index if not exists idx_organization_settings_org_id on public.organization_settings(organization_id);
