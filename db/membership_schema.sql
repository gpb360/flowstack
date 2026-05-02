-- =====================================================
-- Memberships/Courses Module Schema
-- Subscription tiers, gated content, and access control
-- =====================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- Membership Plans Table
-- Subscription tier definitions
-- =====================================================

create table public.membership_plans (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Plan details
  name text not null,
  description text,
  slug text not null,

  -- Pricing
  price numeric(10, 2) not null default 0.00,
  currency text default 'USD',
  billing_interval text check (billing_interval in ('one_time', 'monthly', 'yearly')),

  -- Trial
  trial_days integer default 0,

  -- Limits
  max_members integer, -- For team plans
  storage_quota_mb integer,

  -- Features
  features jsonb default '[]'::jsonb, -- [{ name, included: true/false }]

  -- Content access
  content_tiers text[], -- Which content tiers this plan grants access to

  -- Integration
  stripe_price_id text, -- Stripe price ID for payments

  -- Status
  status text default 'active' check (status in ('draft', 'active', 'archived')),
  public boolean default false, -- Show on pricing page

  -- Display order
  order_index integer default 0,

  -- Highlighting
  featured boolean default false,
  badge text, -- 'Most Popular', 'Best Value', etc.

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  unique(organization_id, slug)
);

-- Indexes for membership_plans
create index idx_membership_plans_organization_id on public.membership_plans(organization_id);
create index idx_membership_plans_slug on public.membership_plans(slug);
create index idx_membership_plans_status on public.membership_plans(status);
create index idx_membership_plans_public on public.membership_plans(public);

-- =====================================================
-- Membership Subscriptions Table
-- Active subscriptions
-- =====================================================

create table public.membership_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  plan_id uuid references public.membership_plans(id) on delete set null not null,

  -- Subscriber
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  contact_id uuid references public.contacts(id) on delete set null,

  -- Status
  status text default 'active' check (status in (
    'trialing', 'active', 'past_due', 'cancelled',
    'unpaid', 'incomplete', 'incomplete_expired'
  )),

  -- Payment integration
  stripe_subscription_id text unique,
  stripe_customer_id text,

  -- Billing period
  current_period_start timestamptz,
  current_period_end timestamptz,

  -- Trial
  trial_start timestamptz,
  trial_end timestamptz,

  -- Cancellation
  cancel_at_period_end boolean default false,
  cancelled_at timestamptz,
  cancel_at timestamptz,

  -- Payment details
  price numeric(10, 2),
  currency text default 'USD',
  billing_interval text,

  -- Team management (for team plans)
  max_team_members integer,
  current_team_members integer default 0,

  -- Timing
  started_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for membership_subscriptions
create index idx_membership_subscriptions_organization_id on public.membership_subscriptions(organization_id);
create index idx_membership_subscriptions_plan_id on public.membership_subscriptions(plan_id);
create index idx_membership_subscriptions_user_id on public.membership_subscriptions(user_id);
create index idx_membership_subscriptions_contact_id on public.membership_subscriptions(contact_id);
create index idx_membership_subscriptions_status on public.membership_subscriptions(status);
create index idx_membership_subscriptions_stripe_subscription_id on public.membership_subscriptions(stripe_subscription_id);

-- =====================================================
-- Membership Content Table
-- Gated content (courses, videos, resources)
-- =====================================================

create table public.membership_content (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Content type
  content_type text not null check (content_type in ('course', 'video', 'document', 'resource', 'live_event')),

  -- Hierarchy
  parent_content_id uuid references public.membership_content(id) on delete set null, -- For modules/lessons

  -- Basic info
  title text not null,
  slug text not null,
  description text,
  content_body text, -- HTML content

  -- Media
  thumbnail_url text,
  video_url text,
  video_duration_seconds integer,
  file_url text, -- For documents/resources
  file_size_bytes integer,

  -- Course structure
  order_index integer default 0,
  is_published boolean default false,

  -- Access control
  access_tier text not null, -- 'free', 'basic', 'premium', etc.
  require_subscription boolean default false,

  -- Drip content
  drip_delay_days integer default 0, -- Days after subscription when content becomes available

  -- SEO
  meta_title text,
  meta_description text,

  -- Engagement
  views integer default 0,
  likes integer default 0,

  -- Settings
  settings jsonb default '{}'::jsonb, -- { allow_download: true, allow_comments: false }

  -- Timing
  published_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  unique(organization_id, slug)
);

-- Indexes for membership_content
create index idx_membership_content_organization_id on public.membership_content(organization_id);
create index idx_membership_content_parent_content_id on public.membership_content(parent_content_id);
create index idx_membership_content_type on public.membership_content(content_type);
create index idx_membership_content_slug on public.membership_content(slug);
create index idx_membership_content_access_tier on public.membership_content(access_tier);
create index idx_membership_content_is_published on public.membership_content(is_published);

-- =====================================================
-- Membership Access Table
-- Track user access to content
-- =====================================================

create table public.membership_access (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  subscription_id uuid references public.membership_subscriptions(id) on delete cascade not null,
  content_id uuid references public.membership_content(id) on delete cascade not null,

  -- Access details
  access_type text default 'full' check (access_type in ('full', 'preview', 'none')),

  -- Progress tracking
  progress_percent integer default 0 check (progress_percent between 0 and 100),
  is_completed boolean default false,
  completed_at timestamptz,

  -- Last access
  last_accessed_at timestamptz,
  total_time_spent_seconds integer default 0,

  -- Notes/bookmarks
  notes text,
  bookmarked_at timestamptz,

  -- Timing
  granted_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,

  unique(subscription_id, content_id)
);

-- Indexes for membership_access
create index idx_membership_access_organization_id on public.membership_access(organization_id);
create index idx_membership_access_subscription_id on public.membership_access(subscription_id);
create index idx_membership_access_content_id on public.membership_access(content_id);
create index idx_membership_access_is_completed on public.membership_access(is_completed);
create index idx_membership_access_last_accessed_at on public.membership_access(last_accessed_at desc);

-- =====================================================
-- Membership Progress Table
-- Detailed lesson/course progress
-- =====================================================

create table public.membership_progress (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  access_id uuid references public.membership_access(id) on delete cascade not null,

  -- Progress details
  lesson_id uuid references public.membership_content(id) on delete cascade not null,

  -- Status
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),

  -- Position tracking (for videos)
  last_position_seconds integer default 0,

  -- Time spent
  time_spent_seconds integer default 0,

  -- Quiz scores (if applicable)
  quiz_score integer,
  quiz_completed_at timestamptz,

  -- Notes
  notes text,

  -- Timing
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  unique(access_id, lesson_id)
);

-- Indexes for membership_progress
create index idx_membership_progress_organization_id on public.membership_progress(organization_id);
create index idx_membership_progress_access_id on public.membership_progress(access_id);
create index idx_membership_progress_lesson_id on public.membership_progress(lesson_id);
create index idx_membership_progress_status on public.membership_progress(status);

-- =====================================================
-- Course Certificates Table
-- Issued certificates
-- =====================================================

create table public.membership_certificates (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  subscription_id uuid references public.membership_subscriptions(id) on delete cascade not null,
  content_id uuid references public.membership_content(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,

  -- Certificate details
  certificate_number text unique not null,
  recipient_name text not null,
  course_name text not null,

  -- Completion
  completed_at timestamptz not null,

  -- Certificate file
  certificate_url text,
  certificate_pdf_url text,

  -- Verification
  verification_token text unique,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for membership_certificates
create index idx_membership_certificates_organization_id on public.membership_certificates(organization_id);
create index idx_membership_certificates_subscription_id on public.membership_certificates(subscription_id);
create index idx_membership_certificates_user_id on public.membership_certificates(user_id);
create index idx_membership_certificates_content_id on public.membership_certificates(content_id);
create index idx_membership_certificates_certificate_number on public.membership_certificates(certificate_number);
create index idx_membership_certificates_verification_token on public.membership_certificates(verification_token);

-- =====================================================
-- Enable Row Level Security
-- =====================================================

alter table public.membership_plans enable row level security;
alter table public.membership_subscriptions enable row level security;
alter table public.membership_content enable row level security;
alter table public.membership_access enable row level security;
alter table public.membership_progress enable row level security;
alter table public.membership_certificates enable row level security;

-- =====================================================
-- RLS Policies for Membership Plans
-- =====================================================

create policy "Org members can view membership_plans" on public.membership_plans
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_plans.organization_id
    ) or public = true
  );

create policy "Org members can insert membership_plans" on public.membership_plans
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_plans.organization_id
    )
  );

create policy "Org members can update membership_plans" on public.membership_plans
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_plans.organization_id
    )
  );

create policy "Org members can delete membership_plans" on public.membership_plans
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_plans.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Membership Subscriptions
-- =====================================================

create policy "Org members can view membership_subscriptions" on public.membership_subscriptions
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_subscriptions.organization_id
    )
  );

create policy "Org members can insert membership_subscriptions" on public.membership_subscriptions
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_subscriptions.organization_id
    )
  );

create policy "Org members can update membership_subscriptions" on public.membership_subscriptions
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_subscriptions.organization_id
    )
  );

create policy "Users can view their own subscriptions" on public.membership_subscriptions
  for select using (auth.uid() = user_id);

-- =====================================================
-- RLS Policies for Membership Content
-- =====================================================

create policy "Org members can view membership_content" on public.membership_content
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_content.organization_id
    ) or is_published = true
  );

create policy "Org members can insert membership_content" on public.membership_content
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_content.organization_id
    )
  );

create policy "Org members can update membership_content" on public.membership_content
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_content.organization_id
    )
  );

create policy "Org members can delete membership_content" on public.membership_content
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_content.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Membership Access
-- =====================================================

create policy "Org members can view membership_access" on public.membership_access
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_access.organization_id
    )
  );

create policy "Org members can insert membership_access" on public.membership_access
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_access.organization_id
    )
  );

create policy "Org members can update membership_access" on public.membership_access
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_access.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Membership Progress
-- =====================================================

create policy "Org members can view membership_progress" on public.membership_progress
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_progress.organization_id
    )
  );

create policy "Org members can insert membership_progress" on public.membership_progress
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_progress.organization_id
    )
  );

create policy "Org members can update membership_progress" on public.membership_progress
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_progress.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Membership Certificates
-- =====================================================

create policy "Org members can view membership_certificates" on public.membership_certificates
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_certificates.organization_id
    ) or auth.uid() = user_id
  );

create policy "Org members can insert membership_certificates" on public.membership_certificates
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = membership_certificates.organization_id
    )
  );

-- Public access for certificate verification
create policy "Public can view certificates by token" on public.membership_certificates
  for select using (verification_token is not null);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

create or replace function public.update_membership_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger membership_plans_updated_at
  before update on public.membership_plans
  for each row
  execute procedure public.update_membership_updated_at();

create trigger membership_subscriptions_updated_at
  before update on public.membership_subscriptions
  for each row
  execute procedure public.update_membership_updated_at();

create trigger membership_content_updated_at
  before update on public.membership_content
  for each row
  execute procedure public.update_membership_updated_at();

create trigger membership_progress_updated_at
  before update on public.membership_progress
  for each row
  execute procedure public.update_membership_updated_at();

-- =====================================================
-- Triggers for Content Stats
-- =====================================================

create or replace function public.increment_content_views()
returns trigger as $$
begin
  update public.membership_content
  set views = views + 1
  where id = new.content_id;
  return new;
end;
$$ language plpgsql;

create trigger increment_content_views_on_access
  after insert on public.membership_access
  for each row
  execute procedure public.increment_content_views();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get user's accessible content
create or replace function public.get_user_accessible_content(
  p_user_id uuid,
  p_organization_id uuid
)
returns table (
  content_id uuid,
  title text,
  content_type text,
  access_type text,
  progress_percent integer
) as $$
begin
  return query
  select
    c.id as content_id,
    c.title,
    c.content_type,
    coalesce(a.access_type, 'none') as access_type,
    coalesce(a.progress_percent, 0) as progress_percent
  from public.membership_content c
  left join public.membership_subscriptions sub on
    sub.user_id = p_user_id
    and sub.organization_id = p_organization_id
    and sub.status = 'active'
  left join public.membership_access a on
    a.subscription_id = sub.id
    and a.content_id = c.id
  where
    c.organization_id = p_organization_id
    and c.is_published = true
    and (
      c.access_tier = 'free'
      or (sub.id is not null and c.access_tier = ANY((select content_tiers from public.membership_plans where id = sub.plan_id))))
  order by c.order_index;
end;
$$ language plpgsql security definer;
