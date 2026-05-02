-- Sites Table
create table public.sites (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  subdomain text unique,
  custom_domain text unique,
  cloudflare_project_name text unique, -- Cloudflare Pages project name for publishing
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sites enable row level security;

-- Funnels Table
create table public.funnels (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  site_id uuid references public.sites(id) on delete set null,
  name text not null,
  steps jsonb default '[]'::jsonb, -- Array of step configurations
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.funnels enable row level security;

-- Pages Table
create table public.pages (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  site_id uuid references public.sites(id) on delete cascade,
  funnel_id uuid references public.funnels(id) on delete set null,
  path text not null, -- e.g., /home, /offer, /thank-you
  title text not null,
  content jsonb default '{}'::jsonb, -- The builder state
  compiled_html text, -- Optional: cache for rendered HTML
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(site_id, path)
);

alter table public.pages enable row level security;

-- RLS Policies

-- Sites
create policy "Users can view sites in their organization" on public.sites
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sites.organization_id
    )
  );

create policy "Users can insert sites into their organization" on public.sites
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sites.organization_id
    )
  );

create policy "Users can update sites in their organization" on public.sites
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sites.organization_id
    )
  );

create policy "Users can delete sites in their organization" on public.sites
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = sites.organization_id
    )
  );

-- Funnels
create policy "Users can view funnels in their organization" on public.funnels
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = funnels.organization_id
    )
  );

create policy "Users can insert funnels into their organization" on public.funnels
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = funnels.organization_id
    )
  );

create policy "Users can update funnels in their organization" on public.funnels
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = funnels.organization_id
    )
  );

create policy "Users can delete funnels in their organization" on public.funnels
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = funnels.organization_id
    )
  );

-- Pages
create policy "Users can view pages in their organization" on public.pages
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pages.organization_id
    )
  );

create policy "Users can insert pages into their organization" on public.pages
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pages.organization_id
    )
  );

create policy "Users can update pages in their organization" on public.pages
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pages.organization_id
    )
  );

create policy "Users can delete pages in their organization" on public.pages
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = pages.organization_id
    )
  );

-- Site Versions Table (Publish History)
create table public.site_versions (
  id uuid default uuid_generate_v4() primary key,
  site_id uuid references public.sites(id) on delete cascade not null,
  version text not null,                          -- e.g., "2026.03.22-0944"
  published_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published_by uuid references auth.users(id),    -- User who triggered the publish
  url text,                                       -- Live deployment URL
  status text not null default 'success',         -- 'success' | 'failed'
  deployment_id text,                             -- Cloudflare deployment ID
  error_message text,                             -- Error details if status = 'failed'
  pages_snapshot jsonb,                           -- Snapshot of pages at time of publish (for rollback)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index idx_site_versions_site_id on public.site_versions(site_id);
create index idx_site_versions_published_at on public.site_versions(published_at desc);

alter table public.site_versions enable row level security;

-- site_versions RLS — org members can manage via their site's organization
create policy "Users can view versions for their org sites" on public.site_versions
  for select using (
    site_id in (
      select s.id from public.sites s
      inner join public.memberships m on m.organization_id = s.organization_id
      where m.user_id = auth.uid()
    )
  );

create policy "Users can insert versions for their org sites" on public.site_versions
  for insert with check (
    site_id in (
      select s.id from public.sites s
      inner join public.memberships m on m.organization_id = s.organization_id
      where m.user_id = auth.uid()
    )
  );

create policy "Users can delete versions for their org sites" on public.site_versions
  for delete using (
    site_id in (
      select s.id from public.sites s
      inner join public.memberships m on m.organization_id = s.organization_id
      where m.user_id = auth.uid()
    )
  );
