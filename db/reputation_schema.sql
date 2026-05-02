-- =====================================================
-- Reputation Management Module Schema
-- Review monitoring and response management
-- =====================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- =====================================================
-- Review Sources Table
-- Connected review platforms
-- =====================================================

create table public.review_sources (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,

  -- Platform details
  platform text not null check (platform in ('google', 'yelp', 'facebook', 'tripadvisor', 'trustpilot', 'zomato', 'opentable')),

  -- Business location
  business_name text not null,
  business_location text, -- Physical address
  business_id text, -- Platform-specific business ID

  -- Platform URL
  platform_url text,
  review_page_url text,

  -- API credentials
  api_key text,
  api_secret text,

  -- Sync settings
  sync_enabled boolean default true,
  sync_frequency_hours integer default 24,
  last_synced_at timestamptz,
  next_sync_at timestamptz,

  -- Auto-response settings
  auto_response_enabled boolean default false,
  auto_response_template_id uuid references public.marketing_templates(id) on delete set null,
  auto_response_delay_hours integer default 0,

  -- Status
  status text default 'active' check (status in ('active', 'error', 'disconnected')),
  error_message text,

  -- Average rating cache
  average_rating numeric(3, 2),
  total_reviews integer default 0,

  -- Timing
  connected_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,

  unique(organization_id, platform, business_id)
);

-- Indexes for review_sources
create index idx_review_sources_organization_id on public.review_sources(organization_id);
create index idx_review_sources_platform on public.review_sources(platform);
create index idx_review_sources_status on public.review_sources(status);
create index idx_review_sources_next_sync_at on public.review_sources(next_sync_at);

-- =====================================================
-- Reviews Table
-- Fetched reviews from platforms
-- =====================================================

create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  source_id uuid references public.review_sources(id) on delete cascade not null,

  -- Platform review ID (for deduplication)
  platform_review_id text not null,

  -- Reviewer info
  reviewer_name text,
  reviewer_username text,
  reviewer_profile_url text,
  reviewer_image_url text,

  -- Verified status
  is_verified_purchase boolean default false,

  -- Review content
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,

  -- Media
  images text[], -- URLs to images attached to review
  videos text[], -- URLs to videos attached to review

  -- Timing
  review_date timestamptz not null,

  -- Platform-specific data
  raw_data jsonb, -- Store full platform response

  -- Status
  status text default 'new' check (status in ('new', 'read', 'flagged', 'hidden')),

  -- Sentiment analysis
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score numeric(3, 2), -- Confidence 0.00-1.00

  -- Tags
  tags text[], -- ['service_issue', 'product_praise', etc.]

  -- Assigned to
  assigned_to uuid references public.user_profiles(id) on delete set null,

  -- Timing
  fetched_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,

  unique(source_id, platform_review_id)
);

-- Indexes for reviews
create index idx_reviews_organization_id on public.reviews(organization_id);
create index idx_reviews_source_id on public.reviews(source_id);
create index idx_reviews_rating on public.reviews(rating);
create index idx_reviews_review_date on public.reviews(review_date desc);
create index idx_reviews_status on public.reviews(status);
create index idx_reviews_sentiment on public.reviews(sentiment);
create index idx_reviews_assigned_to on public.reviews(assigned_to);

-- =====================================================
-- Review Responses Table
-- Management responses to reviews
-- =====================================================

create table public.review_responses (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  review_id uuid references public.reviews(id) on delete cascade not null,

  -- Response content
  content text not null,

  -- Author
  author_id uuid references public.user_profiles(id) on delete set null,
  author_name text,

  -- Status
  status text default 'draft' check (status in ('draft', 'posted', 'failed')),

  -- Platform info
  platform_response_id text, -- Response ID on the platform

  -- Posted status
  posted_at timestamptz,
  posted_on_platform boolean default false,

  -- Error handling
  error_message text,

  -- Response type
  response_type text default 'public' check (response_type in ('public', 'private', 'both')),

  -- Template used (if any)
  template_id uuid references public.marketing_templates(id) on delete set null,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for review_responses
create index idx_review_responses_organization_id on public.review_responses(organization_id);
create index idx_review_responses_review_id on public.review_responses(review_id);
create index idx_review_responses_status on public.review_responses(status);
create index idx_review_responses_author_id on public.review_responses(author_id);

-- =====================================================
-- Review Flags Table
-- Flagged reviews for moderation
-- =====================================================

create table public.review_flags (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  review_id uuid references public.reviews(id) on delete cascade not null,

  -- Flag details
  flag_reason text not null check (flag_reason in (
    'spam', 'fake_review', 'inappropriate_content',
    'competitor', 'off_topic', 'other'
  )),
  notes text,

  -- Resolution
  resolved boolean default false,
  resolved_at timestamptz,
  resolved_by uuid references public.user_profiles(id) on delete set null,
  resolution_notes text,

  -- Action taken
  action_taken text check (action_taken in ('none', 'hidden', 'reported', 'removed')),

  -- Flagged by
  flagged_by uuid references public.user_profiles(id) on delete set null,

  -- Timing
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for review_flags
create index idx_review_flags_organization_id on public.review_flags(organization_id);
create index idx_review_flags_review_id on public.review_flags(review_id);
create index idx_review_flags_resolved on public.review_flags(resolved);

-- =====================================================
-- Review Notifications Table
-- Notification settings for new reviews
-- =====================================================

create table public.review_notifications (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  source_id uuid references public.review_sources(id) on delete cascade not null,

  -- Notification triggers
  notify_on_new_review boolean default true,
  notify_on_rating_change boolean default false,
  notify_on_negative_review boolean default true,
  negative_threshold integer default 3, -- Rating at or below triggers notification

  -- Notification methods
  email_enabled boolean default true,
  email_recipients text[], -- Email addresses
  sms_enabled boolean default false,
  sms_recipients text[], -- Phone numbers
  slack_enabled boolean default false,
  slack_webhook_url text,

  -- Digest settings
  send_digest boolean default false,
  digest_frequency text default 'daily' check (digest_frequency in ('immediate', 'hourly', 'daily', 'weekly')),

  -- Status
  active boolean default true,

  -- Timing
  last_sent_at timestamptz,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Indexes for review_notifications
create index idx_review_notifications_organization_id on public.review_notifications(organization_id);
create index idx_review_notifications_source_id on public.review_notifications(source_id);
create index idx_review_notifications_active on public.review_notifications(active);

-- =====================================================
-- Review Analytics Table
-- Aggregated review metrics
-- =====================================================

create table public.review_analytics (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  source_id uuid references public.review_sources(id) on delete cascade not null,

  -- Date period
  period_start date not null,
  period_end date not null,

  -- Metrics
  total_reviews integer default 0,
  average_rating numeric(3, 2),

  -- Rating distribution
  rating_1_count integer default 0,
  rating_2_count integer default 0,
  rating_3_count integer default 0,
  rating_4_count integer default 0,
  rating_5_count integer default 0,

  -- Response metrics
  responded_count integer default 0,
  response_rate numeric(5, 2), -- Percentage of reviews responded to
  avg_response_time_hours numeric,

  -- Sentiment breakdown
  positive_count integer default 0,
  neutral_count integer default 0,
  negative_count integer default 0,

  -- Trend vs previous period
  rating_change numeric(3, 2),
  review_count_change integer,

  -- Timing
  calculated_at timestamptz default timezone('utc'::text, now()) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,

  unique(source_id, period_start, period_end)
);

-- Indexes for review_analytics
create index idx_review_analytics_organization_id on public.review_analytics(organization_id);
create index idx_review_analytics_source_id on public.review_analytics(source_id);
create index idx_review_analytics_period_start on public.review_analytics(period_start desc);

-- =====================================================
-- Enable Row Level Security
-- =====================================================

alter table public.review_sources enable row level security;
alter table public.reviews enable row level security;
alter table public.review_responses enable row level security;
alter table public.review_flags enable row level security;
alter table public.review_notifications enable row level security;
alter table public.review_analytics enable row level security;

-- =====================================================
-- RLS Policies for Review Sources
-- =====================================================

create policy "Org members can view review_sources" on public.review_sources
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_sources.organization_id
    )
  );

create policy "Org members can insert review_sources" on public.review_sources
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_sources.organization_id
    )
  );

create policy "Org members can update review_sources" on public.review_sources
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_sources.organization_id
    )
  );

create policy "Org members can delete review_sources" on public.review_sources
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_sources.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Reviews
-- =====================================================

create policy "Org members can view reviews" on public.reviews
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = reviews.organization_id
    )
  );

create policy "System can insert reviews" on public.reviews
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = reviews.organization_id
    )
  );

create policy "Org members can update reviews" on public.reviews
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = reviews.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Review Responses
-- =====================================================

create policy "Org members can view review_responses" on public.review_responses
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_responses.organization_id
    )
  );

create policy "Org members can insert review_responses" on public.review_responses
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_responses.organization_id
    )
  );

create policy "Org members can update review_responses" on public.review_responses
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_responses.organization_id
    )
  );

create policy "Org members can delete review_responses" on public.review_responses
  for delete using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_responses.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Review Flags
-- =====================================================

create policy "Org members can view review_flags" on public.review_flags
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_flags.organization_id
    )
  );

create policy "Org members can insert review_flags" on public.review_flags
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_flags.organization_id
    )
  );

create policy "Org members can update review_flags" on public.review_flags
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_flags.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Review Notifications
-- =====================================================

create policy "Org members can view review_notifications" on public.review_notifications
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_notifications.organization_id
    )
  );

create policy "Org members can insert review_notifications" on public.review_notifications
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_notifications.organization_id
    )
  );

create policy "Org members can update review_notifications" on public.review_notifications
  for update using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_notifications.organization_id
    )
  );

-- =====================================================
-- RLS Policies for Review Analytics
-- =====================================================

create policy "Org members can view review_analytics" on public.review_analytics
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_analytics.organization_id
    )
  );

create policy "System can insert review_analytics" on public.review_analytics
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships where organization_id = review_analytics.organization_id
    )
  );

-- =====================================================
-- Triggers for updated_at
-- =====================================================

create or replace function public.update_reputation_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger review_sources_updated_at
  before update on public.review_sources
  for each row
  execute procedure public.update_reputation_updated_at();

create trigger review_responses_updated_at
  before update on public.review_responses
  for each row
  execute procedure public.update_reputation_updated_at();

create trigger review_notifications_updated_at
  before update on public.review_notifications
  for each row
  execute procedure public.update_reputation_updated_at();

-- =====================================================
-- Triggers for Source Rating Cache
-- =====================================================

create or replace function public.update_source_rating_cache()
returns trigger as $$
declare
  v_avg_rating numeric;
  v_total_reviews bigint;
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    select
      avg(rating),
      count(*)
    into v_avg_rating, v_total_reviews
    from public.reviews
    where source_id = new.source_id;

    update public.review_sources
    set
      average_rating = v_avg_rating,
      total_reviews = v_total_reviews
    where id = new.source_id;
  elsif TG_OP = 'DELETE' then
    select
      avg(rating),
      count(*)
    into v_avg_rating, v_total_reviews
    from public.reviews
    where source_id = old.source_id;

    update public.review_sources
    set
      average_rating = v_avg_rating,
      total_reviews = v_total_reviews
    where id = old.source_id;
  end if;

  if TG_OP = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql;

create trigger update_source_rating_on_review_change
  after insert or update or delete on public.reviews
  for each row
  execute procedure public.update_source_rating_cache();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get review summary
create or replace function public.get_review_summary(
  p_organization_id uuid,
  p_source_id uuid default null,
  p_days integer default 30
)
returns table (
  total_reviews bigint,
  average_rating numeric,
  rating_1_count bigint,
  rating_2_count bigint,
  rating_3_count bigint,
  rating_4_count bigint,
  rating_5_count bigint,
  positive_count bigint,
  negative_count bigint,
  response_rate numeric
) as $$
begin
  return query
  select
    count(*) as total_reviews,
    avg(r.rating) as average_rating,
    count(*) filter (where rating = 1) as rating_1_count,
    count(*) filter (where rating = 2) as rating_2_count,
    count(*) filter (where rating = 3) as rating_3_count,
    count(*) filter (where rating = 4) as rating_4_count,
    count(*) filter (where rating = 5) as rating_5_count,
    count(*) filter (where sentiment = 'positive') as positive_count,
    count(*) filter (where sentiment = 'negative') as negative_count,
    case
      when count(*) > 0 then
        (count(distinct rr.review_id)::numeric / count(*) * 100)
      else 0
    end as response_rate
  from public.reviews r
  left join public.review_responses rr on rr.review_id = r.id and rr.status = 'posted'
  where
    r.organization_id = p_organization_id
    and (p_source_id is null or r.source_id = p_source_id)
    and r.review_date >= current_date - (p_days || ' days')::interval;
end;
$$ language plpgsql security definer;

-- Function to calculate review analytics
create or replace function public.calculate_review_analytics(
  p_source_id uuid,
  p_period_start date,
  p_period_end date
)
returns void as $$
declare
  v_analytics record;
begin
  insert into public.review_analytics (
    organization_id,
    source_id,
    period_start,
    period_end,
    total_reviews,
    average_rating,
    rating_1_count,
    rating_2_count,
    rating_3_count,
    rating_4_count,
    rating_5_count,
    responded_count,
    positive_count,
    neutral_count,
    negative_count
  )
  select
    r.organization_id,
    r.source_id,
    p_period_start,
    p_period_end,
    count(*) as total_reviews,
    avg(r.rating) as average_rating,
    count(*) filter (where rating = 1) as rating_1_count,
    count(*) filter (where rating = 2) as rating_2_count,
    count(*) filter (where rating = 3) as rating_3_count,
    count(*) filter (where rating = 4) as rating_4_count,
    count(*) filter (where rating = 5) as rating_5_count,
    count(distinct rr.id) filter (where rr.status = 'posted') as responded_count,
    count(*) filter (where sentiment = 'positive') as positive_count,
    count(*) filter (where sentiment = 'neutral') as neutral_count,
    count(*) filter (where sentiment = 'negative') as negative_count
  from public.reviews r
  left join public.review_responses rr on rr.review_id = r.id
  where
    r.source_id = p_source_id
    and r.review_date >= p_period_start
    and r.review_date <= p_period_end
  group by r.organization_id, r.source_id
  on conflict (source_id, period_start, period_end)
  do update set
    total_reviews = excluded.total_reviews,
    average_rating = excluded.average_rating,
    rating_1_count = excluded.rating_1_count,
    rating_2_count = excluded.rating_2_count,
    rating_3_count = excluded.rating_3_count,
    rating_4_count = excluded.rating_4_count,
    rating_5_count = excluded.rating_5_count,
    responded_count = excluded.responded_count,
    positive_count = excluded.positive_count,
    neutral_count = excluded.neutral_count,
    negative_count = excluded.negative_count,
    calculated_at = timezone('utc'::text, now());
end;
$$ language plpgsql security definer;
