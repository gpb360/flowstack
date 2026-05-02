# FlowStack Data Model Documentation

**Document Version**: 1.0
**Last Updated**: 2026-01-26
**Maintainer**: Database Schema Agent (A1)

## Complete Database Schema Bible

This document provides a comprehensive overview of all database tables, columns, relationships, and RLS policies in the FlowStack platform.

---

## Schema Overview

**Total Tables**: 23
**Total Schemas**: 7
**Primary Key Pattern**: UUID (auto-generated via `uuid_generate_v4()`)
**RLS**: Enabled on all tables
**Multi-Tenancy**: All tables scoped to `organization_id`

---

## 1. Core Schema (init.sql)

**Purpose**: User authentication, multi-tenancy foundation
**Tables**: 3

### 1.1 user_profiles

Extends Supabase `auth.users` with additional profile data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, FK → auth.users | User ID from Supabase Auth |
| `email` | text | NOT NULL | User email address |
| `full_name` | text | NULLABLE | Full name |
| `avatar_url` | text | NULLABLE | Profile avatar URL |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |

**RLS Policies**:
- Users can view their own profile: `auth.uid() = id`
- Users can update their own profile: `auth.uid() = id`

**Triggers**:
- `handle_new_user()` - Auto-create profile on signup

---

### 1.2 organizations

Multi-tenant organization containers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Organization ID |
| `name` | text | NOT NULL | Organization display name |
| `slug` | text | NOT NULL, UNIQUE | URL-friendly identifier |
| `owner_id` | uuid | NOT NULL, FK → user_profiles.id | Organization owner |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |

**RLS Policies**:
- Users can view orgs they belong to (via memberships table)
- Only accessible to organization members

**Relationships**:
- One-to-many: `memberships`, `companies`, `contacts`, `workflows`, `sites`, etc.

---

### 1.3 memberships

Many-to-many relationship between users and organizations with role-based access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Membership ID |
| `user_id` | uuid | NOT NULL, FK → user_profiles.id | User reference |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Organization reference |
| `role` | text | NOT NULL, CHECK (role in ('owner', 'admin', 'member')), DEFAULT 'member' | User role |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |

**Unique Constraint**: `(user_id, organization_id)`

**RLS Policies**:
- Users can view memberships for their organizations
- Organization-scoped access control

**Role Hierarchy**:
- `owner`: Full control, can delete organization
- `admin`: Full control except deletion
- `member`: Read-only, limited actions

---

## 2. CRM Schema (crm_schema.sql)

**Purpose**: Contact and company management
**Tables**: 2

### 2.1 companies

Business/company accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Company ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `name` | text | NOT NULL | Company name |
| `domain` | text | NULLABLE | Website domain |
| `address` | text | NULLABLE | Physical address |
| `owner_id` | uuid | NULLABLE, FK → user_profiles.id | Assigned owner |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**RLS Policies**: Organization-scoped access via memberships

**Relationships**:
- One-to-many: `contacts` (company has many contacts)
- Many-to-one: `organizations` (company belongs to org)

---

### 2.2 contacts

Individual contact records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Contact ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `company_id` | uuid | NULLABLE, FK → companies.id | Company association |
| `first_name` | text | NULLABLE | First name |
| `last_name` | text | NULLABLE | Last name |
| `email` | text | NULLABLE | Email address |
| `phone` | text | NULLABLE | Phone number |
| `position` | text | NULLABLE | Job title |
| `owner_id` | uuid | NULLABLE, FK → user_profiles.id | Assigned owner |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**RLS Policies**: Organization-scoped access via memberships

**Relationships**:
- Many-to-one: `companies` (contact belongs to company)
- Many-to-one: `organizations` (contact belongs to org)

---

## 3. Deals Schema (deals_schema.sql)

**Purpose**: Pipeline and opportunity management
**Tables**: 3

### 3.1 pipelines

Custom pipelines for different processes (sales, hiring, onboarding, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Pipeline ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `name` | text | NOT NULL | Pipeline name |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Relationships**:
- One-to-many: `stages`, `deals`

---

### 3.2 stages

Pipeline stages (Kanban columns).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Stage ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `pipeline_id` | uuid | NOT NULL, FK → pipelines.id ON DELETE CASCADE | Parent pipeline |
| `name` | text | NOT NULL | Stage name |
| `position` | integer | NOT NULL, DEFAULT 0 | Order in Kanban board |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Relationships**:
- Many-to-one: `pipelines`
- One-to-many: `deals`

---

### 3.3 deals

Opportunities/deals with value tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Deal ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `pipeline_id` | uuid | NULLABLE, FK → pipelines.id ON DELETE SET NULL | Parent pipeline |
| `stage_id` | uuid | NULLABLE, FK → stages.id ON DELETE SET NULL | Current stage |
| `title` | text | NOT NULL | Deal title |
| `value` | decimal(15,2) | NOT NULL, DEFAULT 0.00 | Monetary value |
| `currency` | text | NOT NULL, DEFAULT 'USD' | Currency code |
| `contact_id` | uuid | NULLABLE, FK → contacts.id ON DELETE SET NULL | Associated contact |
| `company_id` | uuid | NULLABLE, FK → companies.id ON DELETE SET NULL | Associated company |
| `status` | text | NOT NULL, CHECK (status in ('open', 'won', 'lost', 'abandoned')), DEFAULT 'open' | Deal status |
| `expected_close_date` | date | NULLABLE | Expected close date |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Relationships**:
- Many-to-one: `pipelines`, `stages`, `contacts`, `companies`

---

## 4. Workflow Schema (workflow_schema.sql)

**Purpose**: Visual workflow automation engine
**Tables**: 2

### 4.1 workflows

Workflow definitions with triggers, nodes, and edges.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Workflow ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `name` | text | NOT NULL | Workflow name |
| `description` | text | NULLABLE | Workflow description |
| `status` | text | NOT NULL, CHECK (status in ('active', 'paused', 'draft')), DEFAULT 'draft' | Workflow status |
| `trigger_definitions` | jsonb | NOT NULL, DEFAULT '[]'::jsonb | Array of trigger configurations |
| `nodes` | jsonb | NOT NULL, DEFAULT '[]'::jsonb | React Flow nodes |
| `edges` | jsonb | NOT NULL, DEFAULT '[]'::jsonb | React Flow edges |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**JSONB Structure**:
```typescript
// trigger_definitions
[{
  type: 'webhook' | 'schedule' | 'event',
  config: { /* trigger-specific config */ }
}]

// nodes (React Flow format)
[{
  id: string,
  type: string,
  position: { x: number, y: number },
  data: { /* node data */ }
}]

// edges (React Flow format)
[{
  id: string,
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string
}]
```

**Relationships**:
- One-to-many: `workflow_executions`

---

### 4.2 workflow_executions

Workflow execution history and logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Execution ID |
| `workflow_id` | uuid | NOT NULL, FK → workflows.id ON DELETE CASCADE | Parent workflow |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Denormalized for RLS efficiency |
| `status` | text | NOT NULL, CHECK (status in ('pending', 'running', 'completed', 'failed', 'cancelled')), DEFAULT 'pending' | Execution status |
| `started_at` | timestamptz | NOT NULL, DEFAULT now() | Start timestamp |
| `completed_at` | timestamptz | NULLABLE | Completion timestamp |
| `trigger_data` | jsonb | NULLABLE | Data that triggered workflow |
| `execution_log` | jsonb | NULLABLE | Step-by-step execution trace |
| `error` | jsonb | NULLABLE | Error details if failed |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |

**JSONB Structure**:
```typescript
// execution_log
[{
  step: string,
  status: 'success' | 'failed',
  timestamp: string,
  data?: any,
  error?: string
}]
```

**Relationships**:
- Many-to-one: `workflows`
- One-to-many: `agent_executions` (via agents_schema)

---

## 5. Builder Schema (builder_schema.sql)

**Purpose**: Site and funnel builder
**Tables**: 3

### 5.1 sites

Websites with domain management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Site ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `name` | text | NOT NULL | Site name |
| `subdomain` | text | NULLABLE, UNIQUE | Subdomain (e.g., mysite.flowstack.app) |
| `custom_domain` | text | NULLABLE, UNIQUE | Custom domain |
| `settings` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Site settings (SEO, analytics, etc.) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Relationships**:
- One-to-many: `pages`, `funnels`

---

### 5.2 funnels

Funnel definitions with step sequences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Funnel ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `site_id` | uuid | NULLABLE, FK → sites.id ON DELETE SET NULL | Parent site |
| `name` | text | NOT NULL | Funnel name |
| `steps` | jsonb | NOT NULL, DEFAULT '[]'::jsonb | Funnel step configurations |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**JSONB Structure**:
```typescript
// steps
[{
  page_id: uuid,
  order: number,
  name: string,
  conditions?: { /* entry conditions */ }
}]
```

**Relationships**:
- Many-to-one: `sites`
- One-to-many: `pages`

---

### 5.3 pages

Individual pages with builder content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Page ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `site_id` | uuid | NOT NULL, FK → sites.id ON DELETE CASCADE | Parent site |
| `funnel_id` | uuid | NULLABLE, FK → funnels.id ON DELETE SET NULL | Parent funnel |
| `path` | text | NOT NULL | URL path (e.g., /home, /offer) |
| `title` | text | NOT NULL | Page title |
| `content` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Builder state (blocks, styles) |
| `compiled_html` | text | NULLABLE | Cached rendered HTML |
| `is_published` | boolean | NOT NULL, DEFAULT false | Publication status |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Unique Constraint**: `(site_id, path)`

**JSONB Structure**:
```typescript
// content (builder state)
{
  blocks: [{
    id: string,
    type: string,
    props: { /* block properties */ },
    children: [ /* nested blocks */ ]
  }],
  styles: { /* custom styles */ }
}
```

**Relationships**:
- Many-to-one: `sites`, `funnels`

---

## 6. Marketing Schema (marketing_schema.sql)

**Purpose**: Email and SMS marketing campaigns
**Tables**: 3

### 6.1 marketing_templates

Reusable message templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Template ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `name` | text | NOT NULL | Template name |
| `type` | text | NOT NULL, CHECK (type in ('email', 'sms')) | Message type |
| `subject` | text | NULLABLE | Email subject (email only) |
| `content` | text | NOT NULL | HTML (email) or plain text (SMS) |
| `variables` | jsonb | NOT NULL, DEFAULT '[]'::jsonb | Expected template variables |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**JSONB Structure**:
```typescript
// variables
['first_name', 'company_name', 'appointment_date']
```

**Relationships**:
- One-to-many: `marketing_campaigns`

---

### 6.2 marketing_campaigns

Campaign management and execution.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Campaign ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `name` | text | NOT NULL | Campaign name |
| `type` | text | NOT NULL, CHECK (type in ('email', 'sms')) | Message type |
| `status` | text | NOT NULL, CHECK (status in ('draft', 'scheduled', 'sending', 'completed', 'failed', 'cancelled')), DEFAULT 'draft' | Campaign status |
| `template_id` | uuid | NULLABLE, FK → marketing_templates.id | Associated template |
| `audience_filters` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Audience targeting rules |
| `scheduled_at` | timestamptz | NULLABLE | Scheduled send time |
| `started_at` | timestamptz | NULLABLE | Actual send start time |
| `completed_at` | timestamptz | NULLABLE | Send completion time |
| `total_recipients` | integer | NOT NULL, DEFAULT 0 | Total recipients count |
| `sent_count` | integer | NOT NULL, DEFAULT 0 | Successfully sent count |
| `failed_count` | integer | NOT NULL, DEFAULT 0 | Failed sends count |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**JSONB Structure**:
```typescript
// audience_filters
{
  tags: ['newsletter', 'leads'],
  segment: 'active',
  custom_field: 'value'
}
```

**Relationships**:
- Many-to-one: `marketing_templates`
- One-to-many: `marketing_logs`

---

### 6.3 marketing_logs

Individual message delivery tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Log ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id | Tenant scoping |
| `campaign_id` | uuid | NULLABLE, FK → marketing_campaigns.id ON DELETE SET NULL | Parent campaign |
| `contact_id` | uuid | NULLABLE, FK → contacts.id ON DELETE SET NULL | Target contact |
| `type` | text | NOT NULL, CHECK (type in ('email', 'sms')) | Message type |
| `status` | text | NOT NULL, CHECK (status in ('pending', 'sent', 'delivered', 'failed', 'clicked', 'opened')), DEFAULT 'pending' | Delivery status |
| `provider_message_id` | text | NULLABLE | External provider ID (Resend/Twilio) |
| `error_message` | text | NULLABLE | Error details if failed |
| `sent_at` | timestamptz | NULLABLE | Send timestamp |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |

**Relationships**:
- Many-to-one: `marketing_campaigns`, `contacts`

---

## 7. Agents Schema (agents_schema.sql)

**Purpose**: Multi-agent system orchestration
**Tables**: 3

### 7.1 agent_executions

Agent execution tracking and history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Execution ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id ON DELETE CASCADE | Tenant scoping |
| `agent_id` | text | NOT NULL | Agent identifier |
| `agent_type` | text | NOT NULL, CHECK (agent_type in ('orchestrator', 'crm', 'marketing', 'analytics', 'builder', 'workflow')) | Agent category |
| `workflow_execution_id` | uuid | NULLABLE, FK → workflow_executions.id ON DELETE SET NULL | Parent workflow execution |
| `status` | text | NOT NULL, CHECK (status in ('idle', 'running', 'completed', 'failed', 'timeout')), DEFAULT 'idle' | Execution status |
| `input` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Agent input data |
| `output` | jsonb | NULLABLE | Agent output data |
| `error` | text | NULLABLE | Error message if failed |
| `metadata` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Additional metadata |
| `started_at` | timestamptz | NOT NULL, DEFAULT now() | Start timestamp |
| `completed_at` | timestamptz | NULLABLE | Completion timestamp |
| `duration_ms` | integer | NULLABLE | Execution duration in milliseconds |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes**:
- `organization_id`
- `agent_id`
- `status`
- `workflow_execution_id`
- `created_at DESC`

**Relationships**:
- Many-to-one: `organizations`, `workflow_executions`

---

### 7.2 orchestrator_tasks

Orchestrator workflow execution tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PK, DEFAULT uuid_generate_v4() | Task ID |
| `organization_id` | uuid | NOT NULL, FK → organizations.id ON DELETE CASCADE | Tenant scoping |
| `workflow_id` | uuid | NULLABLE, FK → workflows.id ON DELETE SET NULL | Associated workflow |
| `task_definition` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Full orchestrator workflow |
| `status` | text | NOT NULL, CHECK (status in ('idle', 'running', 'completed', 'failed', 'timeout')), DEFAULT 'idle' | Execution status |
| `execution_log` | jsonb | NOT NULL, DEFAULT '[]'::jsonb | Step-by-step history |
| `context` | jsonb | NOT NULL, DEFAULT '{}'::jsonb | Shared context between tasks |
| `started_at` | timestamptz | NOT NULL, DEFAULT now() | Start timestamp |
| `completed_at` | timestamptz | NULLABLE | Completion timestamp |
| `duration_ms` | integer | NULLABLE | Execution duration in milliseconds |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes**:
- `organization_id`
- `workflow_id`
- `status`
- `created_at DESC`

**Triggers**:
- `orchestrator_tasks_updated_at` - Auto-update timestamp on modification

---

### 7.3 agent_capabilities

Agent capability cache for fast lookup.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `agent_id` | text | PK | Agent identifier |
| `capabilities` | text[] | NOT NULL | Array of capability names |
| `version` | integer | NOT NULL, DEFAULT 1 | Cache version |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |

**RLS Policies**:
- All authenticated users can read capabilities

---

## Helper Functions

### log_agent_execution()

Log agent execution to `agent_executions` table.

```sql
create function public.log_agent_execution(
  p_organization_id uuid,
  p_agent_id text,
  p_agent_type text,
  p_input jsonb,
  p_output jsonb default null,
  p_status text default 'completed',
  p_error text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
```

**Usage**:
```sql
select public.log_agent_execution(
  'org-uuid',
  'crm-agent-001',
  'crm',
  '{"action": "search_contacts", "query": "John"}'::jsonb,
  '{"results": [...]}'::jsonb
);
```

---

### get_agent_execution_stats()

Get execution statistics for agents.

```sql
create function public.get_agent_execution_stats(
  p_organization_id uuid,
  p_agent_id text default null,
  p_days integer default 30
)
returns table (
  agent_id text,
  total_executions bigint,
  successful_executions bigint,
  failed_executions bigint,
  avg_duration_ms numeric,
  success_rate numeric
)
```

---

## RLS Policy Pattern

All tables follow this RLS pattern:

```sql
-- Enable RLS
alter table public.<table> enable row level security;

-- Select policy
create policy "Users can view <table> in their organization"
  on public.<table>
  for select using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = <table>.organization_id
    )
  );

-- Insert policy
create policy "Users can insert <table> into their organization"
  on public.<table>
  for insert with check (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = <table>.organization_id
    )
  );

-- Update policy
create policy "Users can update <table> in their organization"
  on public.<table>
  for update using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = <table>.organization_id
    )
  );

-- Delete policy (if applicable)
create policy "Users can delete <table> in their organization"
  on public.<table>
  for delete using (
    auth.uid() in (
      select user_id from public.memberships
      where organization_id = <table>.organization_id
    )
  );
```

---

## Index Strategy

### Standard Indexes (all tables)
- Primary key: `id` (automatic)
- Foreign keys: `organization_id`, `user_id`, etc.
- Timestamps: `created_at DESC` (for time-based queries)

### Composite Indexes
- `memberships(user_id, organization_id)` - Unique constraint
- `pages(site_id, path)` - Unique constraint
- `workflow_executions(organization_id, status)` - For filtering

### JSONB Indexes (recommended)
```sql
-- GIN indexes for JSONB columns
create index idx_workflows_nodes on public.workflows using gin (nodes);
create index idx_workflows_trigger_definitions on public.workflows using gin (trigger_definitions);
create index idx_workflow_executions_trigger_data on public.workflow_executions using gin (trigger_data);
```

---

## Migration Strategy

### Schema Application Order

1. **init.sql** - Always first (extensions, core tables)
2. **crm_schema.sql** - Core CRM data
3. **deals_schema.sql** - Depends on CRM
4. **workflow_schema.sql** - Independent, but core
5. **builder_schema.sql** - Independent
6. **marketing_schema.sql** - Depends on CRM (contacts)
7. **agents_schema.sql** - Depends on workflows

### Migration Script Template

```bash
# Via Supabase CLI
supabase migration apply init.sql
supabase migration apply crm_schema.sql
# ... etc

# Or via psql
psql $DATABASE_URL -f db/init.sql
psql $DATABASE_URL -f db/crm_schema.sql
# ... etc
```

---

## Type Generation Requirements

For TypeScript types generator (A2 Agent):

### Required Type Definitions

All 23 tables need complete type definitions in `src/types/database.types.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      // Core (3 tables)
      user_profiles: { Row: {...}, Insert: {...}, Update: {...} }
      organizations: { Row: {...}, Insert: {...}, Update: {...} }
      memberships: { Row: {...}, Insert: {...}, Update: {...} }

      // CRM (2 tables)
      companies: { Row: {...}, Insert: {...}, Update: {...} }
      contacts: { Row: {...}, Insert: {...}, Update: {...} }

      // Deals (3 tables)
      pipelines: { Row: {...}, Insert: {...}, Update: {...} }
      stages: { Row: {...}, Insert: {...}, Update: {...} }
      deals: { Row: {...}, Insert: {...}, Update: {...} }

      // Workflows (2 tables)
      workflows: { Row: {...}, Insert: {...}, Update: {...} }
      workflow_executions: { Row: {...}, Insert: {...}, Update: {...} }

      // Builder (3 tables)
      sites: { Row: {...}, Insert: {...}, Update: {...} }
      funnels: { Row: {...}, Insert: {...}, Update: {...} }
      pages: { Row: {...}, Insert: {...}, Update: {...} }

      // Marketing (3 tables)
      marketing_templates: { Row: {...}, Insert: {...}, Update: {...} }
      marketing_campaigns: { Row: {...}, Insert: {...}, Update: {...} }
      marketing_logs: { Row: {...}, Insert: {...}, Update: {...} }

      // Agents (3 tables)
      agent_executions: { Row: {...}, Insert: {...}, Update: {...} }
      orchestrator_tasks: { Row: {...}, Insert: {...}, Update: {...} }
      agent_capabilities: { Row: {...}, Insert: {...}, Update: {...} }
    }
  }
}
```

---

## Summary

- **23 tables** across **7 schema files**
- **Multi-tenant architecture**: All tables scoped to `organization_id`
- **RLS enabled**: All tables protected with organization-based policies
- **UUID primary keys**: Auto-generated for all tables
- **Timestamp tracking**: `created_at` on all tables, `updated_at` on most
- **JSONB columns**: For flexible data storage (workflows, pages, etc.)
- **Helper functions**: `log_agent_execution()`, `get_agent_execution_stats()`

**Next Steps**:
1. A1: Review and optimize indexes
2. A2: Generate complete TypeScript types
3. A3: Design workflow execution engine using these schemas
4. Feature agents: Begin implementation with solid type foundation

---

**Document Maintainer**: Database Schema Agent (A1)
**Last Updated**: 2026-01-26
**Next Review**: After Phase 1 completion
