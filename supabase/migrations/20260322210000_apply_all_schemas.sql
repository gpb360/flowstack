-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Profiles (Extends auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  job_title text,
  company_size text,
  industry text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table if exists public.user_profiles enable row level security;

do $$ begin create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id); exception when others then null; end $$;

do $$ begin create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id); exception when others then null; end $$;

-- Organizations
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references public.user_profiles(id) not null,
  type text,
  timezone text default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table if exists public.organizations enable row level security;

-- Memberships (Many-to-Many between Users and Orgs)
create table if not exists public.memberships (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) not null,
  organization_id uuid references public.organizations(id) not null,
  role text check (role in ('owner', 'admin', 'member')) not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, organization_id)
);

alter table if exists public.memberships enable row level security;

-- Policies for Memberships and Organizations
do $$ begin create policy "Users can view organizations they belong to" on public.organizations
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = id
    )
  ); exception when others then null; end $$;

do $$ begin create policy "Users can view memberships for their organizations" on public.memberships
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = organization_id
    )
  ); exception when others then null; end $$;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url, job_title, company_size, industry)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'job_title', new.raw_user_meta_data->>'company_size', new.raw_user_meta_data->>'industry');
  return new;
end;
$$ language plpgsql security definer;
