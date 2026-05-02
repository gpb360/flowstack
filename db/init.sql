-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User Profiles (Extends auth.users)
create table public.user_profiles (
  id uuid references auth.users not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  job_title text,
  company_size text,
  industry text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

create policy "Users can view their own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Organizations
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references public.user_profiles(id) not null,
  type text,
  timezone text default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.organizations enable row level security;

-- Memberships (Many-to-Many between Users and Orgs)
create table public.memberships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.user_profiles(id) not null,
  organization_id uuid references public.organizations(id) not null,
  role text check (role in ('owner', 'admin', 'member')) not null default 'member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, organization_id)
);

alter table public.memberships enable row level security;

-- Policies for Memberships and Organizations
create policy "Users can view organizations they belong to" on public.organizations
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = id
    )
  );

create policy "Users can view memberships for their organizations" on public.memberships
  for select using (auth.uid() = user_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Newsletter Subscribers
create table public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  source text default 'landing_page',
  status text check (status in ('active', 'unsubscribed', 'bounced')) not null default 'active',
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.newsletter_subscribers enable row level security;

-- Public insert policy for newsletter subscriptions
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);

-- Read policy for users to check their own subscription status
create policy "Users can view newsletter subscriptions by email" on public.newsletter_subscribers
  for select using (true);

-- Update trigger for updated_at
create or replace function public.update_newsletter_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_newsletter_subscribers_updated_at
  before update on public.newsletter_subscribers
  for each row execute procedure public.update_newsletter_updated_at();

-- ========================================
   INVITATIONS SYSTEM
   ========================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create invitations table for team member invitations
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  email text not null,
  role text check (role in ('admin', 'member')) not null default 'member',
  invited_by uuid references public.user_profiles(id) not null,
  status text check (status in ('pending', 'accepted', 'expired')) not null default 'pending',
  token text unique not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.invitations enable row level security;

-- Policy: Users can view invitations for their organizations
create policy "Users can view invitations for their organizations"
  on public.invitations
  for select
  using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = invitations.organization_id
    )
  );

-- Policy: Organization owners/admins can create invitations
create policy "Owners and admins can create invitations"
  on public.invitations
  for insert
  with check (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = invitations.organization_id
      and role in ('owner', 'admin')
    )
  );

-- Policy: Users can update invitation status (accept)
create policy "Users can update invitations they received"
  on public.invitations
  for update
  using (
    status = 'pending'
    and expires_at > now()
  )
  with check (
    auth.uid()::text = (select user_id::text from public.user_profiles where email = invitations.email)
  );

-- Policy: Organization owners/admins can delete invitations
create policy "Owners and admins can delete invitations"
  on public.invitations
  for delete
  using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = invitations.organization_id
      and role in ('owner', 'admin')
    )
  );

-- Create index for faster lookups by token
create index idx_invitations_token on public.invitations(token);

-- Create index for organization lookups
create index idx_invitations_organization on public.invitations(organization_id);

-- Create index for email lookups
create index idx_invitations_email on public.invitations(email);

-- Create index for status filtering
create index idx_invitations_status on public.invitations(status);

-- Create index for expiry cleanup
create index idx_invitations_expires_at on public.invitations(expires_at);

-- Add helpful comments
comment on table public.invitations is 'Stores pending invitations for team members to join organizations';
comment on column public.invitations.token is 'Unique token used for invitation acceptance via email link';
comment on column public.invitations.expires_at is 'Invitation expiry date (typically 7 days from creation)';
comment on column public.invitations.status is 'pending = awaiting acceptance, accepted = user joined, expired = link expired';
