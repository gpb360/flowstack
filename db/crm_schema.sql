-- Companies Table
create table public.companies (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  domain text,
  address text,
  owner_id uuid references public.user_profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.companies enable row level security;

-- Contacts Table
create table public.contacts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  company_id uuid references public.companies(id),
  first_name text,
  last_name text,
  email text,
  phone text,
  position text,
  owner_id uuid references public.user_profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.contacts enable row level security;

-- RLS Policies

-- Companies: View/Edit only if user belongs to the same organization
create policy "Users can view companies in their organization" on public.companies
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = companies.organization_id
    )
  );

create policy "Users can insert companies into their organization" on public.companies
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = companies.organization_id
    )
  );

create policy "Users can update companies in their organization" on public.companies
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = companies.organization_id
    )
  );

create policy "Users can delete companies in their organization" on public.companies
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = companies.organization_id
    )
  );

-- Contacts: View/Edit only if user belongs to the same organization
create policy "Users can view contacts in their organization" on public.contacts
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = contacts.organization_id
    )
  );

create policy "Users can insert contacts into their organization" on public.contacts
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = contacts.organization_id
    )
  );

create policy "Users can update contacts in their organization" on public.contacts
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = contacts.organization_id
    )
  );

create policy "Users can delete contacts in their organization" on public.contacts
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = contacts.organization_id
    )
  );
