-- =====================================================
-- Social Media Planner Module Schema
-- Social accounts, scheduled posts, and analytics
-- =====================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- Social Accounts Table
-- Connected social media accounts
-- =====================================================

create table public.social_accounts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Platform details
  platform text not null check (platform in ('facebook', 'twitter', 'linkedin', 'instagram', 'tiktok', 'pinterest', 'youtube')),

  -- Account info
  account_name text not null,
  account_id text, -- Platform-specific account ID
  username text,
  profile_url text,
  profile_image_url text,

  -- OAuth tokens (encrypted)
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,

  -- Page/account details
  page_name text, -- For Facebook pages, LinkedIn company pages
  page_id text,

  -- Connection status
  status text default 'active' check (status in ('active', 'expired', 'error', 'disconnected')),
  last_synced_at timestamptz,
  error_message text,

  -- Capabilities
  can_post boolean default true,
  can_schedule boolean default true,
  can_analytics boolean default true,

  -- Settings
  auto_post boolean default false,
  default_hashtags text[],

  -- Timing
  connected_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for social_accounts
create index idx_social_accounts_organization_id on public.social_accounts(organization_id);
create index idx_social_accounts_platform on public.social_accounts(platform);
create index idx_social_accounts_status on public.social_accounts(status);

-- =====================================================
-- Social Posts Table
-- Post content and metadata
-- =====================================================

create table public.social_posts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Post content
  content text not null,
  media_urls text[], -- Images, videos
  media_type text check (media_type in ('text', 'image', 'video', 'link', 'carousel')),

  -- Link preview
  link_url text,
  link_title text,
  link_description text,
  link_image_url text,

  -- Hashtags and mentions
  hashtags text[],
  mentions text[], -- @mentions

  -- Post settings
  post_type text default 'post' check (post_type in ('post', 'story', 'reel', 'article')),

  -- Campaign association
  campaign_id uuid references public.marketing_campaigns(id) on delete set null,

  -- Notes
  internal_notes text,

  -- Status
  status text default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled')),

  -- Publishing results
  published_at timestamptz,
  platform_post_ids jsonb, -- { facebook: '123', twitter: '456' }
  error_message text,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for social_posts
create index idx_social_posts_organization_id on public.social_posts(organization_id);
create index idx_social_posts_status on public.social_posts(status);
create index idx_social_posts_published_at on public.social_posts(published_at desc);
create index idx_social_posts_campaign_id on public.social_posts(campaign_id);

-- =====================================================
-- Social Scheduled Posts Table
-- Schedule posts to specific platforms
-- =====================================================

create table public.social_scheduled_posts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  post_id uuid references public.social_posts(id) on delete cascade not null,
  account_id uuid references public.social_accounts(id) on delete cascade not null,

  -- Scheduling
  scheduled_for timestamptz not null,
  timezone text default 'UTC',

  -- Platform-specific overrides
  platform_content text, -- Override default content for this platform
  platform_media_urls text[], -- Override media for this platform

  -- Status
  status text default 'pending' check (status in ('pending', 'processing', 'posted', 'failed', 'cancelled')),

  -- Retry on failure
  retry_count integer default 0,
  max_retries integer default 3,
  retry_after timestamptz,

  -- Results
  posted_at timestamptz,
  platform_post_id text,
  post_url text,
  error_message text,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for social_scheduled_posts
create index idx_social_scheduled_posts_organization_id on public.social_scheduled_posts(organization_id);
create index idx_social_scheduled_posts_post_id on public.social_scheduled_posts(post_id);
create index idx_social_scheduled_posts_account_id on public.social_scheduled_posts(account_id);
create index idx_social_scheduled_posts_scheduled_for on public.social_scheduled_posts(scheduled_for);
create index idx_social_scheduled_posts_status on public.social_scheduled_posts(status);

-- =====================================================
-- Social Analytics Table
-- Engagement metrics
-- =====================================================

create table public.social_analytics (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  post_id uuid references public.social_posts(id) on delete cascade,
  account_id uuid references public.social_accounts(id) on delete cascade not null,

  -- Date of metrics
  metric_date date not null,

  -- Engagement metrics
  impressions integer default 0,
  reach integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  clicks integer default 0,
  saves integer default 0,

  -- Video metrics (if applicable)
  views integer default 0,
  view_duration_seconds integer default 0,
  video_completion_rate numeric(5, 2),

  -- Story metrics (if applicable)
  exits integer default 0,
  replies integer default 0,

  -- Profile metrics
  profile_visits integer default 0,
  follows integer default 0,
  unfollows integer default 0,

  -- Platform-specific data
  raw_data jsonb, -- Store full platform response

  -- Timing
  fetched_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,

  unique(account_id, post_id, metric_date)
);

-- Indexes for social_analytics
create index idx_social_analytics_organization_id on public.social_analytics(organization_id);
create index idx_social_analytics_post_id on public.social_analytics(post_id);
create index idx_social_analytics_account_id on public.social_analytics(account_id);
create index idx_social_analytics_metric_date on public.social_analytics(metric_date desc);

-- =====================================================
-- Social Comments Table
-- Comments on social posts
-- =====================================================

create table public.social_comments (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  post_id uuid references public.social_posts(id) on delete cascade not null,
  account_id uuid references public.social_accounts(id) on delete set null,

  -- Comment details
  platform text not null,
  platform_comment_id text not null,
  parent_comment_id uuid references public.social_comments(id) on delete set null, -- For replies

  -- Commenter info
  commenter_name text,
  commenter_username text,
  commenter_profile_url text,

  -- Comment content
  content text not null,

  -- Status
  status text default 'new' check (status in ('new', 'read', 'replied', 'hidden', 'reported')),

  -- Moderation
  hidden boolean default false,
  flagged boolean default false,

  -- Auto-response
  auto_replied boolean default false,
  auto_reply_template_id uuid references public.marketing_templates(id) on delete set null,

  -- Timing
  commented_at timestamptz not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for social_comments
create index idx_social_comments_organization_id on public.social_comments(organization_id);
create index idx_social_comments_post_id on public.social_comments(post_id);
create index idx_social_comments_account_id on public.social_comments(account_id);
create index idx_social_comments_status on public.social_comments(status);
create index idx_social_comments_commented_at on public.social_comments(commented_at desc);

-- =====================================================
-- Social Comment Replies Table
-- Replies to social comments
-- =====================================================

create table public.social_comment_replies (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  comment_id uuid references public.social_comments(id) on delete cascade not null,

  -- Reply details
  content text not null,

  -- Platform info
  platform_reply_id text,
  posted_on_platform boolean default false,

  -- Who replied
  replied_by uuid references public.user_profiles(id) on delete set null,

  -- Timing
  replied_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for social_comment_replies
create index idx_social_comment_replies_organization_id on public.social_comment_replies(organization_id);
create index idx_social_comment_replies_comment_id on public.social_comment_replies(comment_id);

-- =====================================================
-- Social Media Library Table
-- Media assets for social posts
-- =====================================================

create table public.social_media_library (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- File info
  file_name text not null,
  file_url text not null,
  file_type text check (file_type in ('image', 'video', 'gif')),
  file_size_bytes integer,

  -- Dimensions (for images/video)
  width integer,
  height integer,
  duration_seconds integer, -- For video

  -- Thumbnails
  thumbnail_url text,

  -- Organization
  folder text default 'uncategorized', -- Virtual folder
  tags text[],

  -- Alt text for accessibility
  alt_text text,

  -- Usage tracking
  usage_count integer default 0,
  last_used_at timestamptz,

  -- Timing
  uploaded_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for social_media_library
create index idx_social_media_library_organization_id on public.social_media_library(organization_id);
create index idx_social_media_library_file_type on public.social_media_library(file_type);
create index idx_social_media_library_folder on public.social_media_library(folder);
create index idx_social_media_library_tags on public.social_media_library(tags);

-- =====================================================
-- Enable Row Level Security
-- =====================================================

alter table public.social_accounts enable row level security;
alter table public.social_posts enable row level security;
alter table public.social_scheduled_posts enable row level security;
alter table public.social_analytics enable row level security;
alter table public.social_comments enable row level security;
alter table public.social_comment_replies enable row level security;
alter table public.social_media_library enable row level security;

-- =====================================================
-- RLS Policies for Social Accounts
-- =====================================================

create policy "Org members can view social_accounts" on public.social_accounts
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_accounts.organization_id
    )
  );

create policy "Org members can insert social_accounts" on public.social_accounts
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_accounts.organization_id
    )
  );

create policy "Org members can update social_accounts" on public.social_accounts
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_accounts.organization_id
    )
  );

create policy "Org members can delete social_accounts" on public.social_accounts
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_accounts.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Social Posts
-- =====================================================

create policy "Org members can view social_posts" on public.social_posts
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_posts.organization_id
    )
  );

create policy "Org members can insert social_posts" on public.social_posts
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_posts.organization_id
    )
  );

create policy "Org members can update social_posts" on public.social_posts
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_posts.organization_id
    )
  );

create policy "Org members can delete social_posts" on public.social_posts
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_posts.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Social Scheduled Posts
-- =====================================================

create policy "Org members can view social_scheduled_posts" on public.social_scheduled_posts
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_scheduled_posts.organization_id
    )
  );

create policy "Org members can insert social_scheduled_posts" on public.social_scheduled_posts
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_scheduled_posts.organization_id
    )
  );

create policy "Org members can update social_scheduled_posts" on public.social_scheduled_posts
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_scheduled_posts.organization_id
    )
  );

create policy "Org members can delete social_scheduled_posts" on public.social_scheduled_posts
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_scheduled_posts.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Social Analytics
-- =====================================================

create policy "Org members can view social_analytics" on public.social_analytics
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_analytics.organization_id
    )
  );

create policy "System can insert social_analytics" on public.social_analytics
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_analytics.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Social Comments
-- =====================================================

create policy "Org members can view social_comments" on public.social_comments
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_comments.organization_id
    )
  );

create policy "System can insert social_comments" on public.social_comments
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_comments.organization_id
    )
  );

create policy "Org members can update social_comments" on public.social_comments
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_comments.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Social Comment Replies
-- =====================================================

create policy "Org members can view social_comment_replies" on public.social_comment_replies
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_comment_replies.organization_id
    )
  );

create policy "Org members can insert social_comment_replies" on public.social_comment_replies
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_comment_replies.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Social Media Library
-- =====================================================

create policy "Org members can view social_media_library" on public.social_media_library
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_media_library.organization_id
    )
  );

create policy "Org members can insert social_media_library" on public.social_media_library
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_media_library.organization_id
    )
  );

create policy "Org members can update social_media_library" on public.social_media_library
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_media_library.organization_id
    )
  );

create policy "Org members can delete social_media_library" on public.social_media_library
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = social_media_library.organization_id
    )
  );

-- =====================================================
-- Triggers for updated_at
-- =====================================================

create or replace function public.update_social_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger social_accounts_updated_at
  before update on public.social_accounts
  for each row
  execute procedure public.update_social_updated_at();

create trigger social_posts_updated_at
  before update on public.social_posts
  for each row
  execute procedure public.update_social_updated_at();

create trigger social_scheduled_posts_updated_at
  before update on public.social_scheduled_posts
  for each row
  execute procedure public.update_social_updated_at();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get scheduled posts for a date range
create or replace function public.get_scheduled_posts(
  p_organization_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
returns table (
  scheduled_post_id uuid,
  post_id uuid,
  account_name text,
  platform text,
  content text,
  scheduled_for timestamptz,
  status text
) as $$
begin
  return query
  select
    sp.id as scheduled_post_id,
    sp.post_id,
    sa.account_name,
    sa.platform,
    p.content,
    sp.scheduled_for,
    sp.status
  from public.social_scheduled_posts sp
  join public.social_posts p on p.id = sp.post_id
  join public.social_accounts sa on sa.id = sp.account_id
  where
    sp.organization_id = p_organization_id
    and sp.scheduled_for >= p_start_date
    and sp.scheduled_for <= p_end_date
    and sp.status in ('pending', 'processing')
  order by sp.scheduled_for asc;
end;
$$ language plpgsql security definer;

-- Function to get analytics summary
create or replace function public.get_social_analytics_summary(
  p_organization_id uuid,
  p_account_id uuid default null,
  p_days integer default 30
)
returns table (
  total_posts bigint,
  total_impressions bigint,
  total_engagement bigint,
  avg_engagement_rate numeric,
  top_performing_post_id uuid,
  top_performing_post_likes bigint
) as $$
declare
  v_top_post uuid;
  v_top_likes bigint;
begin
  -- Find top performing post
  select
    a.post_id,
    max(a.likes)
  into v_top_post, v_top_likes
  from public.social_analytics a
  where
    a.organization_id = p_organization_id
    and (p_account_id is null or a.account_id = p_account_id)
    and a.metric_date >= current_date - (p_days || ' days')::interval
  group by a.post_id
  order by max(a.likes) desc
  limit 1;

  return query
  select
    count(distinct a.post_id) as total_posts,
    coalesce(sum(a.impressions), 0) as total_impressions,
    coalesce(sum(a.likes + a.comments + a.shares), 0) as total_engagement,
    case
      when sum(a.impressions) > 0 then
        (sum(a.likes + a.comments + a.shares)::numeric / sum(a.impressions) * 100)
      else 0
    end as avg_engagement_rate,
    v_top_post as top_performing_post_id,
    v_top_likes as top_performing_post_likes
  from public.social_analytics a
  where
    a.organization_id = p_organization_id
    and (p_account_id is null or a.account_id = p_account_id)
    and a.metric_date >= current_date - (p_days || ' days')::interval;
end;
$$ language plpgsql security definer;
