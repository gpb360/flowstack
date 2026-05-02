-- FlowStack Audit intake and fulfillment

create table if not exists audit_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  business_name text,
  website_url text,
  focus text[] not null default '{}',
  current_pain text,
  desired_outcome text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'reviewing', 'brief_ready', 'sprint_proposed', 'closed')),
  source text not null default 'public_audit_intake',
  flow_brief jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_answers (
  id uuid primary key default gen_random_uuid(),
  audit_request_id uuid not null references audit_requests(id) on delete cascade,
  question_key text not null,
  answer jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table audit_requests enable row level security;
alter table audit_answers enable row level security;

create policy "Users can read their own audit requests"
  on audit_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own audit requests"
  on audit_requests for insert
  with check (
    auth.uid() = user_id
    and (
      organization_id is null
      or exists (
        select 1 from memberships
        where memberships.organization_id = audit_requests.organization_id
          and memberships.user_id = auth.uid()
      )
    )
  );

create policy "Users can update draft audit requests"
  on audit_requests for update
  using (auth.uid() = user_id and status in ('draft', 'submitted'))
  with check (
    auth.uid() = user_id
    and (
      organization_id is null
      or exists (
        select 1 from memberships
        where memberships.organization_id = audit_requests.organization_id
          and memberships.user_id = auth.uid()
      )
    )
  );

create policy "Users can read answers for their audit requests"
  on audit_answers for select
  using (
    exists (
      select 1 from audit_requests
      where audit_requests.id = audit_answers.audit_request_id
        and audit_requests.user_id = auth.uid()
    )
  );

create policy "Users can insert answers for their audit requests"
  on audit_answers for insert
  with check (
    exists (
      select 1 from audit_requests
      where audit_requests.id = audit_answers.audit_request_id
        and audit_requests.user_id = auth.uid()
    )
  );
