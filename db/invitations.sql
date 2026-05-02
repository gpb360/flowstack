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
