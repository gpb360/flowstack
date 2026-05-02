# FlowStack Data Model Documentation

Complete documentation of all database tables, relationships, RLS policies, and indexes for the FlowStack multi-tenant SaaS platform.

## Table of Contents

1. [Core Tables](#core-tables)
2. [CRM Module](#crm-module)
3. [Workflows Module](#workflows-module)
4. [Site Builder Module](#site-builder-module)
5. [Marketing Module](#marketing-module)
6. [Deals/Pipeline Module](#dealspipeline-module)
7. [Agents Module](#agents-module)
8. [Forms Module](#forms-module)
9. [Calendar/Appointments Module](#calendarappointments-module)
10. [Phone/VoIP Module](#phonevoip-module)
11. [Memberships Module](#memberships-module)
12. [Social Media Module](#social-media-module)
13. [Reputation Management Module](#reputation-management-module)
14. [Migration Order](#migration-order)

---

## Core Tables

### `user_profiles`

Extends Supabase auth.users with additional profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users | User ID from auth |
| email | text | NOT NULL | User email |
| full_name | text | | Full name |
| avatar_url | text | | Profile avatar URL |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Account created |

**RLS Policies:**
- Users can view their own profile
- Users can update their own profile

### `organizations`

Tenant organizations for multi-tenancy.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Organization ID |
| name | text | NOT NULL | Organization name |
| slug | text | NOT NULL, UNIQUE | URL-friendly identifier |
| owner_id | uuid | NOT NULL, FK → user_profiles | Owner user ID |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Creation timestamp |

**RLS Policies:**
- Users can view organizations they belong to (via memberships)

### `memberships`

Many-to-many relationship between users and organizations with roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Membership ID |
| user_id | uuid | NOT NULL, FK → user_profiles | User ID |
| organization_id | uuid | NOT NULL, FK → organizations | Organization ID |
| role | text | NOT NULL, CHECK('owner','admin','member'), DEFAULT 'member' | User role |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Join timestamp |

**Unique Constraint:** (user_id, organization_id)

**RLS Policies:**
- Users can view memberships for their organizations

**Indexes:**
- Implicit index on unique constraint

---

## CRM Module

### `companies`

Business companies for CRM.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Company ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Company name |
| domain | text | | Company domain/website |
| address | text | | Physical address |
| owner_id | uuid | FK → user_profiles | Assigned owner |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view companies
- Organization members can insert companies
- Organization members can update companies
- Organization members can delete companies

**Indexes:**
- idx_companies_organization_id (organization_id)

### `contacts`

Individual contacts for CRM.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Contact ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| company_id | uuid | FK → companies | Associated company |
| first_name | text | | First name |
| last_name | text | | Last name |
| email | text | | Email address |
| phone | text | | Phone number |
| position | text | | Job title |
| owner_id | uuid | FK → user_profiles | Assigned owner |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view contacts
- Organization members can insert contacts
- Organization members can update contacts
- Organization members can delete contacts

**Indexes:**
- idx_contacts_organization_id (organization_id)
- idx_contacts_company_id (company_id)

---

## Workflows Module

### `workflows`

Visual workflow automation definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Workflow ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Workflow name |
| description | text | | Description |
| status | text | CHECK('active','paused','draft'), DEFAULT 'draft' | Status |
| trigger_definitions | jsonb | DEFAULT '[]' | Triggers JSON |
| nodes | jsonb | DEFAULT '[]' | React Flow nodes |
| edges | jsonb | DEFAULT '[]' | React Flow edges |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view workflows
- Organization members can insert workflows
- Organization members can update workflows
- Organization members can delete workflows

**Indexes:**
- idx_workflows_organization_id (organization_id)
- idx_workflows_status (status)

### `workflow_executions`

Workflow execution history and logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Execution ID |
| workflow_id | uuid | NOT NULL, FK → workflows(on delete cascade) | Workflow |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID (denormalized) |
| status | text | CHECK('pending','running','completed','failed','cancelled'), DEFAULT 'pending' | Execution status |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Start timestamp |
| completed_at | timestamptz | | Completion timestamp |
| trigger_data | jsonb | | Trigger data |
| execution_log | jsonb | | Step-by-step log |
| error | jsonb | | Error details if failed |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |

**RLS Policies:**
- Organization members can view executions
- Organization members can insert executions

**Indexes:**
- idx_workflow_executions_organization_id (organization_id)
- idx_workflow_executions_workflow_id (workflow_id)
- idx_workflow_executions_status (status)
- idx_workflow_executions_started_at (started_at DESC)

---

## Site Builder Module

### `sites`

Websites/builder sites.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Site ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Site name |
| subdomain | text | UNIQUE | Subdomain |
| custom_domain | text | UNIQUE | Custom domain |
| settings | jsonb | DEFAULT '{}' | Site settings JSON |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view sites
- Organization members can insert sites
- Organization members can update sites
- Organization members can delete sites

**Indexes:**
- idx_sites_organization_id (organization_id)

### `funnels`

Sales funnels with multi-step flows.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Funnel ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| site_id | uuid | FK → sites(on delete set null) | Parent site |
| name | text | NOT NULL | Funnel name |
| steps | jsonb | DEFAULT '[]' | Funnel steps JSON |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view funnels
- Organization members can insert funnels
- Organization members can update funnels
- Organization members can delete funnels

**Indexes:**
- idx_funnels_organization_id (organization_id)
- idx_funnels_site_id (site_id)

### `pages`

Individual pages within sites/funnels.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Page ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| site_id | uuid | NOT NULL, FK → sites(on delete cascade) | Parent site |
| funnel_id | uuid | FK → funnels(on delete set null) | Parent funnel |
| path | text | NOT NULL | Page path |
| title | text | NOT NULL | Page title |
| content | jsonb | DEFAULT '{}' | Builder state JSON |
| compiled_html | text | | Cached HTML |
| is_published | boolean | DEFAULT false | Published status |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**Unique Constraint:** (site_id, path)

**RLS Policies:**
- Organization members can view pages
- Organization members can insert pages
- Organization members can update pages
- Organization members can delete pages

**Indexes:**
- idx_pages_organization_id (organization_id)
- idx_pages_site_id (site_id)
- idx_pages_funnel_id (funnel_id)

---

## Marketing Module

### `marketing_templates`

Email/SMS marketing templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Template ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Template name |
| type | text | CHECK('email','sms'), NOT NULL | Template type |
| subject | text | | Email subject |
| content | text | NOT NULL | Template content |
| variables | jsonb | DEFAULT '[]' | Expected variables |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view templates
- Organization members can insert templates
- Organization members can update templates
- Organization members can delete templates

**Indexes:**
- idx_marketing_templates_organization_id (organization_id)
- idx_marketing_templates_type (type)

### `marketing_campaigns`

Email/SMS campaigns.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Campaign ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Campaign name |
| type | text | CHECK('email','sms'), NOT NULL | Campaign type |
| status | text | CHECK('draft','scheduled','sending','completed','failed','cancelled'), DEFAULT 'draft' | Status |
| template_id | uuid | FK → marketing_templates | Template |
| audience_filters | jsonb | DEFAULT '{}' | Audience filters JSON |
| scheduled_at | timestamptz | | Scheduled timestamp |
| started_at | timestamptz | | Started timestamp |
| completed_at | timestamptz | | Completed timestamp |
| total_recipients | integer | DEFAULT 0 | Total recipients |
| sent_count | integer | DEFAULT 0 | Sent count |
| failed_count | integer | DEFAULT 0 | Failed count |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view campaigns
- Organization members can insert campaigns
- Organization members can update campaigns
- Organization members can delete campaigns

**Indexes:**
- idx_marketing_campaigns_organization_id (organization_id)
- idx_marketing_campaigns_status (status)
- idx_marketing_campaigns_scheduled_at (scheduled_at)

### `marketing_logs`

Individual message delivery logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Log ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| campaign_id | uuid | FK → marketing_campaigns(on delete set null) | Campaign |
| contact_id | uuid | FK → contacts(on delete set null) | Contact |
| type | text | CHECK('email','sms'), NOT NULL | Message type |
| status | text | CHECK('pending','sent','delivered','failed','clicked','opened'), DEFAULT 'pending' | Status |
| provider_message_id | text | | Provider message ID |
| error_message | text | | Error message |
| sent_at | timestamptz | | Sent timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |

**RLS Policies:**
- Organization members can view logs
- Organization members can insert logs

**Indexes:**
- idx_marketing_logs_organization_id (organization_id)
- idx_marketing_logs_campaign_id (campaign_id)
- idx_marketing_logs_contact_id (contact_id)
- idx_marketing_logs_status (status)

---

## Deals/Pipeline Module

### `pipelines`

Sales pipelines (e.g., "Sales Pipeline", "Hiring Pipeline").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Pipeline ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Pipeline name |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view pipelines
- Organization members can insert pipelines
- Organization members can update pipelines
- Organization members can delete pipelines

**Indexes:**
- idx_pipelines_organization_id (organization_id)

### `stages`

Pipeline stages (e.g., "Lead", "Meeting Booked", "Closed Won").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Stage ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| pipeline_id | uuid | NOT NULL, FK → pipelines(on delete cascade) | Parent pipeline |
| name | text | NOT NULL | Stage name |
| position | integer | NOT NULL, DEFAULT 0 | Display order |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view stages
- Organization members can insert stages
- Organization members can update stages
- Organization members can delete stages

**Indexes:**
- idx_stages_organization_id (organization_id)
- idx_stages_pipeline_id (pipeline_id)
- idx_stages_position (position)

### `deals`

Opportunities/deals in pipelines.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Deal ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| pipeline_id | uuid | FK → pipelines(on delete set null) | Pipeline |
| stage_id | uuid | FK → stages(on delete set null) | Current stage |
| title | text | NOT NULL | Deal title |
| value | decimal(15,2) | DEFAULT 0.00 | Deal value |
| currency | text | DEFAULT 'USD' | Currency |
| contact_id | uuid | FK → contacts(on delete set null) | Associated contact |
| company_id | uuid | FK → companies(on delete set null) | Associated company |
| status | text | CHECK('open','won','lost','abandoned'), DEFAULT 'open' | Status |
| expected_close_date | date | | Expected close date |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view deals
- Organization members can insert deals
- Organization members can update deals
- Organization members can delete deals

**Indexes:**
- idx_deals_organization_id (organization_id)
- idx_deals_pipeline_id (pipeline_id)
- idx_deals_stage_id (stage_id)
- idx_deals_contact_id (contact_id)
- idx_deals_status (status)

---

## Agents Module

### `agent_executions`

AI agent execution tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Execution ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| agent_id | text | NOT NULL | Agent identifier |
| agent_type | text | CHECK('orchestrator','crm','marketing','analytics','builder','workflow'), NOT NULL | Agent type |
| workflow_execution_id | uuid | FK → workflow_executions(on delete set null) | Workflow execution |
| status | text | CHECK('idle','running','completed','failed','timeout'), DEFAULT 'idle' | Status |
| input | jsonb | NOT NULL, DEFAULT '{}' | Input data |
| output | jsonb | | Output data |
| error | text | | Error message |
| metadata | jsonb | DEFAULT '{}' | Additional metadata |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Start timestamp |
| completed_at | timestamptz | | Completion timestamp |
| duration_ms | integer | | Duration in milliseconds |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view executions
- Organization members can insert executions
- Organization members can update executions
- Organization members can delete executions

**Indexes:**
- idx_agent_executions_organization_id (organization_id)
- idx_agent_executions_agent_id (agent_id)
- idx_agent_executions_status (status)
- idx_agent_executions_workflow_execution_id (workflow_execution_id)
- idx_agent_executions_created_at (created_at DESC)

### `orchestrator_tasks`

Orchestrator workflow executions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Task ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| workflow_id | uuid | FK → workflows(on delete set null) | Workflow |
| task_definition | jsonb | NOT NULL, DEFAULT '{}' | Task definition |
| status | text | CHECK('idle','running','completed','failed','timeout'), DEFAULT 'idle' | Status |
| execution_log | jsonb | DEFAULT '[]' | Execution log |
| context | jsonb | DEFAULT '{}' | Shared context |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Start timestamp |
| completed_at | timestamptz | | Completion timestamp |
| duration_ms | integer | | Duration in milliseconds |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view tasks
- Organization members can insert tasks
- Organization members can update tasks
- Organization members can delete tasks

**Indexes:**
- idx_orchestrator_tasks_organization_id (organization_id)
- idx_orchestrator_tasks_workflow_id (workflow_id)
- idx_orchestrator_tasks_status (status)
- idx_orchestrator_tasks_created_at (created_at DESC)

### `agent_capabilities`

Agent capabilities cache.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| agent_id | text | PK | Agent ID |
| capabilities | text[] | NOT NULL | Capabilities list |
| version | integer | DEFAULT 1 | Cache version |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Authenticated users can view capabilities

---

## Forms Module

### `forms`

Multi-step forms with conditional logic.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Form ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Form name |
| description | text | | Description |
| status | text | CHECK('draft','active','archived'), DEFAULT 'draft' | Status |
| settings | jsonb | DEFAULT '{}' | Form settings |
| thank_you_message | text | | Thank you message |
| redirect_url | text | | Redirect URL |
| create_contact | boolean | DEFAULT false | Create contact on submit |
| create_company | boolean | DEFAULT false | Create company on submit |
| add_tags | text[] | | Tags to add |
| send_email_notification | boolean | DEFAULT false | Send notifications |
| notification_emails | text[] | | Notification recipients |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view forms
- Organization members can insert forms
- Organization members can update forms
- Organization members can delete forms

**Indexes:**
- idx_forms_organization_id (organization_id)
- idx_forms_status (status)
- idx_forms_created_at (created_at DESC)

### `form_fields`

Form field definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Field ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| form_id | uuid | NOT NULL, FK → forms(on delete cascade) | Parent form |
| field_type | text | NOT NULL, CHECK(...) | Field type |
| label | text | NOT NULL | Field label |
| placeholder | text | | Placeholder |
| help_text | text | | Help text |
| default_value | text | | Default value |
| required | boolean | DEFAULT false | Required field |
| validation_rules | jsonb | DEFAULT '{}' | Validation rules |
| options | jsonb | DEFAULT '[]' | Field options |
| conditional_logic | jsonb | | Conditional logic |
| order_index | integer | NOT NULL, DEFAULT 0 | Display order |
| column_width | integer | DEFAULT 12 | Column width |
| crm_field_mapping | text | | CRM field mapping |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**Unique Constraint:** (form_id, order_index)

**RLS Policies:**
- Organization members can view fields
- Organization members can insert fields
- Organization members can update fields
- Organization members can delete fields

**Indexes:**
- idx_form_fields_organization_id (organization_id)
- idx_form_fields_form_id (form_id)
- idx_form_fields_order (form_id, order_index)

### `form_submissions`

Form submission data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Submission ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| form_id | uuid | NOT NULL, FK → forms(on delete cascade) | Form |
| contact_id | uuid | FK → contacts(on delete set null) | Created contact |
| email | text | | Submitted email |
| phone | text | | Submitted phone |
| data | jsonb | NOT NULL, DEFAULT '{}' | Submission data |
| files | jsonb | DEFAULT '[]' | Uploaded files |
| status | text | CHECK('new','contacted','qualified','converted','lost'), DEFAULT 'new' | Status |
| utm_source | text | | UTM source |
| utm_medium | text | | UTM medium |
| utm_campaign | text | | UTM campaign |
| utm_term | text | | UTM term |
| utm_content | text | | UTM content |
| ip_address | text | | IP address |
| user_agent | text | | User agent |
| referrer | text | | Referrer |
| submitted_at | timestamptz | NOT NULL, DEFAULT NOW() | Submission timestamp |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |

**RLS Policies:**
- Organization members can view submissions
- Organization members can insert submissions
- Organization members can update submissions
- Organization members can delete submissions

**Indexes:**
- idx_form_submissions_organization_id (organization_id)
- idx_form_submissions_form_id (form_id)
- idx_form_submissions_contact_id (contact_id)
- idx_form_submissions_email (email)
- idx_form_submissions_status (status)
- idx_form_submissions_submitted_at (submitted_at DESC)

### `form_notifications`

Form notification configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Notification ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| form_id | uuid | NOT NULL, FK → forms(on delete cascade) | Form |
| type | text | CHECK('email','webhook','sms'), NOT NULL | Type |
| trigger_conditions | jsonb | DEFAULT '{}' | Triggers |
| email_to | text[] | | Email recipients |
| email_template_id | uuid | FK → marketing_templates(on delete set null) | Template |
| email_subject | text | | Subject |
| email_body | text | | Body |
| webhook_url | text | | Webhook URL |
| webhook_method | text | CHECK('POST','PUT','PATCH'), DEFAULT 'POST' | HTTP method |
| webhook_headers | jsonb | DEFAULT '{}' | Headers |
| sms_to | text[] | | SMS recipients |
| active | boolean | DEFAULT true | Active status |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view notifications
- Organization members can insert notifications
- Organization members can update notifications
- Organization members can delete notifications

**Indexes:**
- idx_form_notifications_organization_id (organization_id)
- idx_form_notifications_form_id (form_id)
- idx_form_notifications_active (active)

---

## Calendar/Appointments Module

### `calendars`

User appointment calendars.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Calendar ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Calendar name |
| description | text | | Description |
| color | text | DEFAULT '#3b82f6' | Display color |
| owner_id | uuid | FK → user_profiles(on delete set null) | Calendar owner |
| timezone | text | DEFAULT 'UTC' | Timezone |
| buffer_minutes | integer | DEFAULT 0 | Buffer between appointments |
| min_notice_hours | integer | DEFAULT 24 | Minimum booking notice |
| max_booking_days_ahead | integer | DEFAULT 90 | Max days ahead |
| business_hours | jsonb | DEFAULT '{}' | Business hours JSON |
| active | boolean | DEFAULT true | Active status |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view calendars
- Organization members can insert calendars
- Organization members can update calendars
- Organization members can delete calendars

**Indexes:**
- idx_calendars_organization_id (organization_id)
- idx_calendars_owner_id (owner_id)
- idx_calendars_active (active)

### `appointment_types`

Configurable appointment types.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Type ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| calendar_id | uuid | NOT NULL, FK → calendars(on delete cascade) | Calendar |
| name | text | NOT NULL | Type name |
| description | text | | Description |
| duration_minutes | integer | NOT NULL, DEFAULT 60 | Duration |
| price | numeric(10,2) | DEFAULT 0.00 | Price |
| location_type | text | CHECK('in_person','phone','video','custom'), DEFAULT 'in_person' | Location |
| location_details | text | | Location details |
| availability | jsonb | DEFAULT '{}' | Availability rules |
| require_payment | boolean | DEFAULT false | Require payment |
| require_deposit | boolean | DEFAULT false | Require deposit |
| deposit_amount | numeric(10,2) | | Deposit amount |
| max_advance_days | integer | DEFAULT 90 | Max days ahead |
| min_notice_hours | integer | DEFAULT 24 | Min notice |
| active | boolean | DEFAULT true | Active status |
| order_index | integer | DEFAULT 0 | Display order |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**RLS Policies:**
- Organization members can view types
- Organization members can insert types
- Organization members can update types
- Organization members can delete types

**Indexes:**
- idx_appointment_types_organization_id (organization_id)
- idx_appointment_types_calendar_id (calendar_id)
- idx_appointment_types_active (active)

### `availability_slots`

Available time slots.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Slot ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| calendar_id | uuid | NOT NULL, FK → calendars(on delete cascade) | Calendar |
| start_time | timestamptz | NOT NULL | Start time |
| end_time | timestamptz | NOT NULL | End time |
| max_bookings | integer | DEFAULT 1 | Max bookings |
| current_bookings | integer | DEFAULT 0 | Current bookings |
| status | text | CHECK('available','booked','blocked','cancelled'), DEFAULT 'available' | Status |
| is_recurring | boolean | DEFAULT false | Is recurring |
| recurring_pattern | jsonb | | Recurring pattern |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**Exclusion Constraint:** (start_time, end_time) WITH &&

**RLS Policies:**
- Organization members can view slots
- Organization members can insert slots
- Organization members can update slots
- Organization members can delete slots

**Indexes:**
- idx_availability_slots_organization_id (organization_id)
- idx_availability_slots_calendar_id (calendar_id)
- idx_availability_slots_start_time (start_time)
- idx_availability_slots_status (status)

### `appointments`

Booked appointments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Appointment ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| calendar_id | uuid | FK → calendars(on delete set null) | Calendar |
| appointment_type_id | uuid | FK → appointment_types(on delete set null) | Type |
| contact_id | uuid | FK → contacts(on delete set null) | Contact |
| customer_name | text | NOT NULL | Customer name |
| customer_email | text | | Customer email |
| customer_phone | text | | Customer phone |
| title | text | NOT NULL | Title |
| description | text | | Description |
| location | text | | Location |
| start_time | timestamptz | NOT NULL | Start time |
| end_time | timestamptz | NOT NULL | End time |
| duration_minutes | integer | | Duration |
| timezone | text | DEFAULT 'UTC' | Timezone |
| status | text | CHECK('scheduled','confirmed','in_progress','completed','cancelled','no_show','rescheduled'), DEFAULT 'scheduled' | Status |
| payment_status | text | CHECK('pending','paid','refunded','cancelled') | Payment status |
| meeting_link | text | | Meeting link |
| meeting_id | text | | Meeting ID |
| meeting_password | text | | Meeting password |
| internal_notes | text | | Internal notes |
| customer_notes | text | | Customer notes |
| calendar_event_id | text | | External event ID |
| synced_to_external_cal | boolean | DEFAULT false | Synced |
| booking_source | text | CHECK('manual','widget','api','email'), DEFAULT 'manual' | Source |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Last updated |

**Exclusion Constraint:** (start_time, end_time) WITH &&

**RLS Policies:**
- Organization members can view appointments
- Organization members can insert appointments
- Organization members can update appointments
- Organization members can delete appointments

**Indexes:**
- idx_appointments_organization_id (organization_id)
- idx_appointments_calendar_id (calendar_id)
- idx_appointments_contact_id (contact_id)
- idx_appointments_start_time (start_time)
- idx_appointments_status (status)
- idx_appointments_customer_email (customer_email)

### `appointment_reminders`

Appointment reminder notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Reminder ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| appointment_id | uuid | NOT NULL, FK → appointments(on delete cascade) | Appointment |
| remind_before_hours | integer | NOT NULL | Hours before |
| type | text | CHECK('email','sms'), NOT NULL | Type |
| status | text | CHECK('pending','sent','failed'), DEFAULT 'pending' | Status |
| sent_at | timestamptz | | Sent timestamp |
| error_message | text | | Error message |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |

**RLS Policies:**
- Organization members can view reminders
- Organization members can insert reminders
- Organization members can update reminders

**Indexes:**
- idx_appointment_reminders_organization_id (organization_id)
- idx_appointment_reminders_appointment_id (appointment_id)
- idx_appointment_reminders_status (status)

### `appointment_history`

Appointment change history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | History ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| appointment_id | uuid | NOT NULL, FK → appointments(on delete cascade) | Appointment |
| action | text | NOT NULL | Action |
| changed_by_user_id | uuid | FK → user_profiles(on delete set null) | Changed by |
| previous_values | jsonb | | Previous values |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created timestamp |

**RLS Policies:**
- Organization members can view history
- System can insert history

**Indexes:**
- idx_appointment_history_organization_id (organization_id)
- idx_appointment_history_appointment_id (appointment_id)
- idx_appointment_history_created_at (created_at DESC)

---

## Phone/VoIP Module

### `phone_numbers`

Purchased/tracked phone numbers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Number ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| phone_number | text | NOT NULL, UNIQUE | Phone number |
| country_code | text | DEFAULT '+1' | Country code |
| type | text | CHECK('local','toll_free','mobile'), DEFAULT 'local' | Number type |
| provider | text | NOT NULL | Provider |
| provider_phone_id | text | | Provider ID |
| forward_to | text | | Forward to |
| sip_trunk_id | text | | SIP trunk ID |
| webhook_url | text | | Webhook URL |
| status | text | CHECK('active','suspended','cancelled'), DEFAULT 'active' | Status |
| tracking_source | text | | Tracking source |
| call_tracking_enabled | boolean | DEFAULT true | Call tracking |
| recording_enabled | boolean | DEFAULT false | Recording |
| voicemail_enabled | boolean | DEFAULT true | Voicemail |
| sms_enabled | boolean | DEFAULT true | SMS |
| purchased_at | timestamptz | NOT NULL, DEFAULT NOW() | Purchased |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view numbers
- Organization members can insert numbers
- Organization members can update numbers
- Organization members can delete numbers

**Indexes:**
- idx_phone_numbers_organization_id (organization_id)
- idx_phone_numbers_status (status)
- idx_phone_numbers_phone_number (phone_number)

### `phone_calls`

Call logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Call ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| phone_number_id | uuid | FK → phone_numbers(on delete set null) | Phone number |
| direction | text | CHECK('inbound','outbound'), NOT NULL | Direction |
| from_number | text | NOT NULL | From number |
| to_number | text | NOT NULL | To number |
| contact_id | uuid | FK → contacts(on delete set null) | Contact |
| status | text | CHECK('ringing','in_progress','completed','failed','busy','no_answer','cancelled','voicemail'), DEFAULT 'ringing' | Status |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Started |
| ended_at | timestamptz | | Ended |
| duration_seconds | integer | | Duration |
| provider_call_id | text | | Provider call ID |
| provider | text | NOT NULL | Provider |
| recording_id | uuid | FK → phone_recordings(on delete set null) | Recording |
| recording_enabled | boolean | DEFAULT false | Recording |
| voicemail_id | uuid | FK → voicemails(on delete set null) | Voicemail |
| call_flow | jsonb | | Call flow |
| quality_score | numeric(2,1) | | Quality 1.0-5.0 |
| hangup_reason | text | | Hangup reason |
| agent_id | uuid | FK → user_profiles(on delete set null) | Agent |
| tags | text[] | | Tags |
| notes | text | | Notes |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view calls
- Organization members can insert calls
- Organization members can update calls

**Indexes:**
- idx_phone_calls_organization_id (organization_id)
- idx_phone_calls_phone_number_id (phone_number_id)
- idx_phone_calls_contact_id (contact_id)
- idx_phone_calls_status (status)
- idx_phone_calls_started_at (started_at DESC)
- idx_phone_calls_from_number (from_number)
- idx_phone_calls_to_number (to_number)

### `phone_recordings`

Call recordings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Recording ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| call_id | uuid | NOT NULL, FK → phone_calls(on delete cascade) | Call |
| storage_path | text | NOT NULL | Storage path |
| storage_provider | text | DEFAULT 'supabase' | Storage provider |
| duration_seconds | integer | | Duration |
| file_size_bytes | integer | | File size |
| format | text | DEFAULT 'mp3' | Format |
| url | text | | URL |
| transcript | text | | Transcript |
| transcription_status | text | CHECK('pending','processing','completed','failed') | Status |
| transcribed_at | timestamptz | | Transcribed |
| sentiment | text | CHECK('positive','neutral','negative') | Sentiment |
| sentiment_score | numeric(3,2) | Confidence 0.00-1.00 |
| keywords | text[] | | Keywords |
| summary | text | | AI summary |
| consent_obtained | boolean | DEFAULT false | Consent |
| consent_obtained_at | timestamptz | | Consent time |
| accessible_by_roles | text[] | | Access control |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view recordings
- Organization members can insert recordings
- Organization members can update recordings

**Indexes:**
- idx_phone_recordings_organization_id (organization_id)
- idx_phone_recordings_call_id (call_id)
- idx_phone_recordings_transcription_status (transcription_status)

### `voicemails`

Voicemail messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Voicemail ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| phone_number_id | uuid | FK → phone_numbers(on delete set null) | Phone number |
| call_id | uuid | FK → phone_calls(on delete set null) | Call |
| from_number | text | NOT NULL | From number |
| caller_name | text | | Caller name |
| duration_seconds | integer | | Duration |
| transcription | text | | Transcript |
| transcription_status | text | CHECK('pending','processing','completed','failed'), DEFAULT 'pending' | Status |
| storage_path | text | NOT NULL | Storage path |
| storage_provider | text | DEFAULT 'supabase' | Provider |
| url | text | | URL |
| file_size_bytes | integer | | File size |
| status | text | CHECK('new','listened','archived','deleted'), DEFAULT 'new' | Status |
| notification_sent | boolean | DEFAULT false | Notified |
| notification_sent_at | timestamptz | | Notified at |
| received_at | timestamptz | NOT NULL, DEFAULT NOW() | Received |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view voicemails
- Organization members can insert voicemails
- Organization members can update voicemails
- Organization members can delete voicemails

**Indexes:**
- idx_voicemails_organization_id (organization_id)
- idx_voicemails_phone_number_id (phone_number_id)
- idx_voicemails_call_id (call_id)
- idx_voicemails_status (status)
- idx_voicemails_received_at (received_at DESC)

### `sms_threads`

SMS conversation threads.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Thread ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| phone_number_id | uuid | FK → phone_numbers(on delete set null) | Phone number |
| contact_id | uuid | FK → contacts(on delete set null) | Contact |
| participant_phone | text | NOT NULL | Participant phone |
| status | text | CHECK('active','archived','closed'), DEFAULT 'active' | Status |
| assigned_to | uuid | FK → user_profiles(on delete set null) | Assigned to |
| last_message_at | timestamptz | | Last message |
| last_message_preview | text | | Message preview |
| unread_count | integer | DEFAULT 0 | Unread count |
| tags | text[] | | Tags |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view threads
- Organization members can insert threads
- Organization members can update threads
- Organization members can delete threads

**Indexes:**
- idx_sms_threads_organization_id (organization_id)
- idx_sms_threads_phone_number_id (phone_number_id)
- idx_sms_threads_contact_id (contact_id)
- idx_sms_threads_participant_phone (participant_phone)
- idx_sms_threads_status (status)
- idx_sms_threads_updated_at (updated_at DESC)

### `sms_messages`

Individual SMS messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Message ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| thread_id | uuid | NOT NULL, FK → sms_threads(on delete cascade) | Thread |
| phone_number_id | uuid | FK → phone_numbers(on delete set null) | Phone number |
| direction | text | CHECK('inbound','outbound'), NOT NULL | Direction |
| from_number | text | NOT NULL | From number |
| to_number | text | NOT NULL | To number |
| body | text | NOT NULL | Message body |
| media_urls | text[] | | Media URLs |
| status | text | CHECK('queued','sent','delivered','failed','undelivered','received','read'), DEFAULT 'sent' | Status |
| provider_message_id | text | | Provider ID |
| provider | text | NOT NULL | Provider |
| error_code | text | | Error code |
| error_message | text | | Error message |
| read_at | timestamptz | | Read at |
| sent_by | uuid | FK → user_profiles(on delete set null) | Sent by |
| sent_at | timestamptz | NOT NULL, DEFAULT NOW() | Sent |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view messages
- Organization members can insert messages
- Organization members can update messages

**Indexes:**
- idx_sms_messages_organization_id (organization_id)
- idx_sms_messages_thread_id (thread_id)
- idx_sms_messages_phone_number_id (phone_number_id)
- idx_sms_messages_status (status)
- idx_sms_messages_sent_at (sent_at DESC)

---

## Memberships Module

### `membership_plans`

Subscription tier definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Plan ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| name | text | NOT NULL | Plan name |
| description | text | | Description |
| slug | text | NOT NULL | URL slug |
| price | numeric(10,2) | NOT NULL, DEFAULT 0.00 | Price |
| currency | text | DEFAULT 'USD' | Currency |
| billing_interval | text | CHECK('one_time','monthly','yearly') | Billing |
| trial_days | integer | DEFAULT 0 | Trial days |
| max_members | integer | | Max members |
| storage_quota_mb | integer | | Storage quota |
| features | jsonb | DEFAULT '[]' | Features list |
| content_tiers | text[] | | Content tiers |
| stripe_price_id | text | | Stripe price ID |
| status | text | CHECK('draft','active','archived'), DEFAULT 'active' | Status |
| public | boolean | DEFAULT false | Public listing |
| order_index | integer | DEFAULT 0 | Display order |
| featured | boolean | DEFAULT false | Featured |
| badge | text | | Badge text |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**Unique Constraint:** (organization_id, slug)

**RLS Policies:**
- Organization members can view plans
- Organization members can insert plans
- Organization members can update plans
- Organization members can delete plans

**Indexes:**
- idx_membership_plans_organization_id (organization_id)
- idx_membership_plans_slug (slug)
- idx_membership_plans_status (status)
- idx_membership_plans_public (public)

### `membership_subscriptions`

Active subscriptions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Subscription ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| plan_id | uuid | NOT NULL, FK → membership_plans(on delete set null) | Plan |
| user_id | uuid | NOT NULL, FK → user_profiles(on delete cascade) | User |
| contact_id | uuid | FK → contacts(on delete set null) | Contact |
| status | text | CHECK('trialing','active','past_due','cancelled','unpaid','incomplete','incomplete_expired'), DEFAULT 'active' | Status |
| stripe_subscription_id | text | UNIQUE | Stripe ID |
| stripe_customer_id | text | | Stripe customer |
| current_period_start | timestamptz | | Period start |
| current_period_end | timestamptz | | Period end |
| trial_start | timestamptz | | Trial start |
| trial_end | timestamptz | | Trial end |
| cancel_at_period_end | boolean | DEFAULT false | Cancel at end |
| cancelled_at | timestamptz | | Cancelled |
| cancel_at | timestamptz | | Cancel at |
| price | numeric(10,2) | | Price |
| currency | text | DEFAULT 'USD' | Currency |
| billing_interval | text | | Billing interval |
| max_team_members | integer | | Max team |
| current_team_members | integer | DEFAULT 0 | Current team |
| started_at | timestamptz | NOT NULL, DEFAULT NOW() | Started |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view subscriptions
- Organization members can insert subscriptions
- Organization members can update subscriptions
- Users can view their own subscriptions

**Indexes:**
- idx_membership_subscriptions_organization_id (organization_id)
- idx_membership_subscriptions_plan_id (plan_id)
- idx_membership_subscriptions_user_id (user_id)
- idx_membership_subscriptions_contact_id (contact_id)
- idx_membership_subscriptions_status (status)
- idx_membership_subscriptions_stripe_subscription_id (stripe_subscription_id)

### `membership_content`

Gated content.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Content ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| content_type | text | CHECK('course','video','document','resource','live_event'), NOT NULL | Type |
| parent_content_id | uuid | FK → membership_content(on delete set null) | Parent |
| title | text | NOT NULL | Title |
| slug | text | NOT NULL | URL slug |
| description | text | | Description |
| content_body | text | | HTML content |
| thumbnail_url | text | | Thumbnail |
| video_url | text | | Video URL |
| video_duration_seconds | integer | | Duration |
| file_url | text | | File URL |
| file_size_bytes | integer | | File size |
| order_index | integer | DEFAULT 0 | Order |
| is_published | boolean | DEFAULT false | Published |
| access_tier | text | NOT NULL | Access tier |
| require_subscription | boolean | DEFAULT false | Require sub |
| drip_delay_days | integer | DEFAULT 0 | Drip delay |
| meta_title | text | | SEO title |
| meta_description | text | | SEO description |
| views | integer | DEFAULT 0 | View count |
| likes | integer | DEFAULT 0 | Like count |
| settings | jsonb | DEFAULT '{}' | Settings |
| published_at | timestamptz | | Published |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**Unique Constraint:** (organization_id, slug)

**RLS Policies:**
- Organization members can view content
- Organization members can insert content
- Organization members can update content
- Organization members can delete content

**Indexes:**
- idx_membership_content_organization_id (organization_id)
- idx_membership_content_parent_content_id (parent_content_id)
- idx_membership_content_type (content_type)
- idx_membership_content_slug (slug)
- idx_membership_content_access_tier (access_tier)
- idx_membership_content_is_published (is_published)

### `membership_access`

User content access tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Access ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| subscription_id | uuid | NOT NULL, FK → membership_subscriptions(on delete cascade) | Subscription |
| content_id | uuid | NOT NULL, FK → membership_content(on delete cascade) | Content |
| access_type | text | DEFAULT 'full', CHECK('full','preview','none') | Access |
| progress_percent | integer | DEFAULT 0, CHECK(0-100) | Progress |
| is_completed | boolean | DEFAULT false | Completed |
| completed_at | timestamptz | | Completed |
| last_accessed_at | timestamptz | | Last accessed |
| total_time_spent_seconds | integer | DEFAULT 0 | Time spent |
| notes | text | | Notes |
| bookmarked_at | timestamptz | | Bookmarked |
| granted_at | timestamptz | NOT NULL, DEFAULT NOW() | Granted |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**Unique Constraint:** (subscription_id, content_id)

**RLS Policies:**
- Organization members can view access
- Organization members can insert access
- Organization members can update access

**Indexes:**
- idx_membership_access_organization_id (organization_id)
- idx_membership_access_subscription_id (subscription_id)
- idx_membership_access_content_id (content_id)
- idx_membership_access_is_completed (is_completed)
- idx_membership_access_last_accessed_at (last_accessed_at DESC)

### `membership_progress`

Detailed lesson progress.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Progress ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| access_id | uuid | NOT NULL, FK → membership_access(on delete cascade) | Access |
| lesson_id | uuid | NOT NULL, FK → membership_content(on delete cascade) | Lesson |
| status | text | DEFAULT 'not_started', CHECK('not_started','in_progress','completed') | Status |
| last_position_seconds | integer | DEFAULT 0 | Video position |
| time_spent_seconds | integer | DEFAULT 0 | Time spent |
| quiz_score | integer | | Quiz score |
| quiz_completed_at | timestamptz | | Quiz completed |
| notes | text | | Notes |
| started_at | timestamptz | | Started |
| completed_at | timestamptz | | Completed |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**Unique Constraint:** (access_id, lesson_id)

**RLS Policies:**
- Organization members can view progress
- Organization members can insert progress
- Organization members can update progress

**Indexes:**
- idx_membership_progress_organization_id (organization_id)
- idx_membership_progress_access_id (access_id)
- idx_membership_progress_lesson_id (lesson_id)
- idx_membership_progress_status (status)

### `membership_certificates`

Issued certificates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Certificate ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| subscription_id | uuid | NOT NULL, FK → membership_subscriptions(on delete cascade) | Subscription |
| content_id | uuid | NOT NULL, FK → membership_content(on delete cascade) | Course |
| user_id | uuid | NOT NULL, FK → user_profiles(on delete cascade) | User |
| certificate_number | text | NOT NULL, UNIQUE | Certificate # |
| recipient_name | text | NOT NULL | Recipient |
| course_name | text | NOT NULL | Course |
| completed_at | timestamptz | NOT NULL | Completed |
| certificate_url | text | | Certificate URL |
| certificate_pdf_url | text | | PDF URL |
| verification_token | text | UNIQUE | Verification |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view certificates
- Organization members can insert certificates
- Users can view their own certificates
- Public can verify by token

**Indexes:**
- idx_membership_certificates_organization_id (organization_id)
- idx_membership_certificates_subscription_id (subscription_id)
- idx_membership_certificates_user_id (user_id)
- idx_membership_certificates_content_id (content_id)
- idx_membership_certificates_certificate_number (certificate_number)
- idx_membership_certificates_verification_token (verification_token)

---

## Social Media Module

### `social_accounts`

Connected social media accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Account ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| platform | text | CHECK('facebook','twitter','linkedin','instagram','tiktok','pinterest','youtube'), NOT NULL | Platform |
| account_name | text | NOT NULL | Account name |
| account_id | text | | Platform account ID |
| username | text | | Username |
| profile_url | text | | Profile URL |
| profile_image_url | text | | Profile image |
| access_token | text | | OAuth token |
| refresh_token | text | | Refresh token |
| token_expires_at | timestamptz | | Token expires |
| page_name | text | | Page name |
| page_id | text | | Page ID |
| status | text | CHECK('active','expired','error','disconnected'), DEFAULT 'active' | Status |
| last_synced_at | timestamptz | | Last synced |
| error_message | text | | Error |
| can_post | boolean | DEFAULT true | Can post |
| can_schedule | boolean | DEFAULT true | Can schedule |
| can_analytics | boolean | DEFAULT true | Analytics |
| auto_post | boolean | DEFAULT false | Auto post |
| default_hashtags | text[] | | Default hashtags |
| connected_at | timestamptz | NOT NULL, DEFAULT NOW() | Connected |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view accounts
- Organization members can insert accounts
- Organization members can update accounts
- Organization members can delete accounts

**Indexes:**
- idx_social_accounts_organization_id (organization_id)
- idx_social_accounts_platform (platform)
- idx_social_accounts_status (status)

### `social_posts`

Post content and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Post ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| content | text | NOT NULL | Post content |
| media_urls | text[] | | Media URLs |
| media_type | text | CHECK('text','image','video','link','carousel') | Media type |
| link_url | text | | Link URL |
| link_title | text | | Link title |
| link_description | text | | Link description |
| link_image_url | text | | Link image |
| hashtags | text[] | | Hashtags |
| mentions | text[] | | Mentions |
| post_type | text | DEFAULT 'post', CHECK('post','story','reel','article') | Post type |
| campaign_id | uuid | FK → marketing_campaigns(on delete set null) | Campaign |
| internal_notes | text | | Notes |
| status | text | CHECK('draft','scheduled','publishing','published','failed','cancelled'), DEFAULT 'draft' | Status |
| published_at | timestamptz | | Published |
| platform_post_ids | jsonb | | Platform IDs |
| error_message | text | | Error |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view posts
- Organization members can insert posts
- Organization members can update posts
- Organization members can delete posts

**Indexes:**
- idx_social_posts_organization_id (organization_id)
- idx_social_posts_status (status)
- idx_social_posts_published_at (published_at DESC)
- idx_social_posts_campaign_id (campaign_id)

### `social_scheduled_posts`

Scheduled posts to platforms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Schedule ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| post_id | uuid | NOT NULL, FK → social_posts(on delete cascade) | Post |
| account_id | uuid | NOT NULL, FK → social_accounts(on delete cascade) | Account |
| scheduled_for | timestamptz | NOT NULL | Scheduled for |
| timezone | text | DEFAULT 'UTC' | Timezone |
| platform_content | text | | Platform-specific content |
| platform_media_urls | text[] | | Platform media |
| status | text | CHECK('pending','processing','posted','failed','cancelled'), DEFAULT 'pending' | Status |
| retry_count | integer | DEFAULT 0 | Retry count |
| max_retries | integer | DEFAULT 3 | Max retries |
| retry_after | timestamptz | | Retry after |
| posted_at | timestamptz | | Posted |
| platform_post_id | text | | Platform post ID |
| post_url | text | | Post URL |
| error_message | text | | Error |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view scheduled posts
- Organization members can insert scheduled posts
- Organization members can update scheduled posts
- Organization members can delete scheduled posts

**Indexes:**
- idx_social_scheduled_posts_organization_id (organization_id)
- idx_social_scheduled_posts_post_id (post_id)
- idx_social_scheduled_posts_account_id (account_id)
- idx_social_scheduled_posts_scheduled_for (scheduled_for)
- idx_social_scheduled_posts_status (status)

### `social_analytics`

Engagement metrics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Analytics ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| post_id | uuid | FK → social_posts(on delete cascade) | Post |
| account_id | uuid | NOT NULL, FK → social_accounts(on delete cascade) | Account |
| metric_date | date | NOT NULL | Date |
| impressions | integer | DEFAULT 0 | Impressions |
| reach | integer | DEFAULT 0 | Reach |
| likes | integer | DEFAULT 0 | Likes |
| comments | integer | DEFAULT 0 | Comments |
| shares | integer | DEFAULT 0 | Shares |
| clicks | integer | DEFAULT 0 | Clicks |
| saves | integer | DEFAULT 0 | Saves |
| views | integer | DEFAULT 0 | Views |
| view_duration_seconds | integer | | Duration |
| video_completion_rate | numeric(5,2) | | Completion |
| exits | integer | DEFAULT 0 | Exits |
| replies | integer | DEFAULT 0 | Replies |
| profile_visits | integer | DEFAULT 0 | Profile visits |
| follows | integer | DEFAULT 0 | Follows |
| unfollows | integer | DEFAULT 0 | Unfollows |
| raw_data | jsonb | | Raw data |
| fetched_at | timestamptz | NOT NULL, DEFAULT NOW() | Fetched |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**Unique Constraint:** (account_id, post_id, metric_date)

**RLS Policies:**
- Organization members can view analytics
- System can insert analytics

**Indexes:**
- idx_social_analytics_organization_id (organization_id)
- idx_social_analytics_post_id (post_id)
- idx_social_analytics_account_id (account_id)
- idx_social_analytics_metric_date (metric_date DESC)

### `social_comments`

Comments on posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Comment ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| post_id | uuid | FK → social_posts(on delete cascade) | Post |
| account_id | uuid | FK → social_accounts(on delete set null) | Account |
| platform | text | NOT NULL | Platform |
| platform_comment_id | text | NOT NULL | Platform ID |
| parent_comment_id | uuid | FK → social_comments(on delete set null) | Parent |
| commenter_name | text | | Commenter name |
| commenter_username | text | | Username |
| commenter_profile_url | text | | Profile URL |
| content | text | NOT NULL | Comment content |
| status | text | CHECK('new','read','replied','hidden','reported'), DEFAULT 'new' | Status |
| hidden | boolean | DEFAULT false | Hidden |
| flagged | boolean | DEFAULT false | Flagged |
| auto_replied | boolean | DEFAULT false | Auto replied |
| auto_reply_template_id | uuid | FK → marketing_templates(on delete set null) | Template |
| commented_at | timestamptz | NOT NULL | Commented |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view comments
- System can insert comments
- Organization members can update comments

**Indexes:**
- idx_social_comments_organization_id (organization_id)
- idx_social_comments_post_id (post_id)
- idx_social_comments_account_id (account_id)
- idx_social_comments_status (status)
- idx_social_comments_commented_at (commented_at DESC)

### `social_comment_replies`

Replies to comments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Reply ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| comment_id | uuid | NOT NULL, FK → social_comments(on delete cascade) | Comment |
| content | text | NOT NULL | Reply content |
| platform_reply_id | text | | Platform ID |
| posted_on_platform | boolean | DEFAULT false | Posted |
| replied_by | uuid | FK → user_profiles(on delete set null) | Replied by |
| replied_at | timestamptz | NOT NULL, DEFAULT NOW() | Replied |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view replies
- Organization members can insert replies

**Indexes:**
- idx_social_comment_replies_organization_id (organization_id)
- idx_social_comment_replies_comment_id (comment_id)

### `social_media_library`

Media asset library.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Asset ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| file_name | text | NOT NULL | File name |
| file_url | text | NOT NULL | File URL |
| file_type | text | CHECK('image','video','gif') | File type |
| file_size_bytes | integer | | File size |
| width | integer | | Width |
| height | integer | | Height |
| duration_seconds | integer | | Duration |
| thumbnail_url | text | | Thumbnail |
| folder | text | DEFAULT 'uncategorized' | Folder |
| tags | text[] | | Tags |
| alt_text | text | | Alt text |
| usage_count | integer | DEFAULT 0 | Usage count |
| last_used_at | timestamptz | | Last used |
| uploaded_at | timestamptz | NOT NULL, DEFAULT NOW() | Uploaded |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view library
- Organization members can insert library
- Organization members can update library
- Organization members can delete library

**Indexes:**
- idx_social_media_library_organization_id (organization_id)
- idx_social_media_library_file_type (file_type)
- idx_social_media_library_folder (folder)
- idx_social_media_library_tags (tags)

---

## Reputation Management Module

### `review_sources`

Connected review platforms.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Source ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| platform | text | CHECK('google','yelp','facebook','tripadvisor','trustpilot','zomato','opentable'), NOT NULL | Platform |
| business_name | text | NOT NULL | Business name |
| business_location | text | | Location |
| business_id | text | | Platform business ID |
| platform_url | text | | Platform URL |
| review_page_url | text | | Review page |
| api_key | text | | API key |
| api_secret | text | | API secret |
| sync_enabled | boolean | DEFAULT true | Sync enabled |
| sync_frequency_hours | integer | DEFAULT 24 | Sync frequency |
| last_synced_at | timestamptz | | Last synced |
| next_sync_at | timestamptz | | Next sync |
| auto_response_enabled | boolean | DEFAULT false | Auto response |
| auto_response_template_id | uuid | FK → marketing_templates(on delete set null) | Template |
| auto_response_delay_hours | integer | DEFAULT 0 | Delay |
| status | text | CHECK('active','error','disconnected'), DEFAULT 'active' | Status |
| error_message | text | | Error |
| average_rating | numeric(3,2) | | Avg rating |
| total_reviews | integer | DEFAULT 0 | Total reviews |
| connected_at | timestamptz | NOT NULL, DEFAULT NOW() | Connected |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**Unique Constraint:** (organization_id, platform, business_id)

**RLS Policies:**
- Organization members can view sources
- Organization members can insert sources
- Organization members can update sources
- Organization members can delete sources

**Indexes:**
- idx_review_sources_organization_id (organization_id)
- idx_review_sources_platform (platform)
- idx_review_sources_status (status)
- idx_review_sources_next_sync_at (next_sync_at)

### `reviews`

Fetched reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Review ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| source_id | uuid | NOT NULL, FK → review_sources(on delete cascade) | Source |
| platform_review_id | text | NOT NULL | Platform ID |
| reviewer_name | text | | Reviewer name |
| reviewer_username | text | | Username |
| reviewer_profile_url | text | | Profile URL |
| reviewer_image_url | text | | Image URL |
| is_verified_purchase | boolean | DEFAULT false | Verified |
| rating | integer | NOT NULL, CHECK(1-5) | Rating |
| title | text | | Title |
| content | text | | Content |
| images | text[] | | Images |
| videos | text[] | | Videos |
| review_date | timestamptz | NOT NULL | Review date |
| raw_data | jsonb | | Raw data |
| status | text | CHECK('new','read','flagged','hidden'), DEFAULT 'new' | Status |
| sentiment | text | CHECK('positive','neutral','negative') | Sentiment |
| sentiment_score | numeric(3,2) | Confidence 0.00-1.00 |
| tags | text[] | | Tags |
| assigned_to | uuid | FK → user_profiles(on delete set null) | Assigned |
| fetched_at | timestamptz | NOT NULL, DEFAULT NOW() | Fetched |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**Unique Constraint:** (source_id, platform_review_id)

**RLS Policies:**
- Organization members can view reviews
- System can insert reviews
- Organization members can update reviews

**Indexes:**
- idx_reviews_organization_id (organization_id)
- idx_reviews_source_id (source_id)
- idx_reviews_rating (rating)
- idx_reviews_review_date (review_date DESC)
- idx_reviews_status (status)
- idx_reviews_sentiment (sentiment)
- idx_reviews_assigned_to (assigned_to)

### `review_responses`

Management responses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Response ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| review_id | uuid | NOT NULL, FK → reviews(on delete cascade) | Review |
| content | text | NOT NULL | Response |
| author_id | uuid | FK → user_profiles(on delete set null) | Author |
| author_name | text | | Author name |
| status | text | CHECK('draft','posted','failed'), DEFAULT 'draft' | Status |
| platform_response_id | text | | Platform ID |
| posted_at | timestamptz | | Posted |
| posted_on_platform | boolean | DEFAULT false | Posted |
| error_message | text | | Error |
| response_type | text | DEFAULT 'public', CHECK('public','private','both') | Type |
| template_id | uuid | FK → marketing_templates(on delete set null) | Template |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view responses
- Organization members can insert responses
- Organization members can update responses
- Organization members can delete responses

**Indexes:**
- idx_review_responses_organization_id (organization_id)
- idx_review_responses_review_id (review_id)
- idx_review_responses_status (status)
- idx_review_responses_author_id (author_id)

### `review_flags`

Flagged reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Flag ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| review_id | uuid | NOT NULL, FK → reviews(on delete cascade) | Review |
| flag_reason | text | CHECK('spam','fake_review','inappropriate_content','competitor','off_topic','other'), NOT NULL | Reason |
| notes | text | | Notes |
| resolved | boolean | DEFAULT false | Resolved |
| resolved_at | timestamptz | | Resolved |
| resolved_by | uuid | FK → user_profiles(on delete set null) | Resolved by |
| resolution_notes | text | | Resolution |
| action_taken | text | CHECK('none','hidden','reported','removed') | Action |
| flagged_by | uuid | FK → user_profiles(on delete set null) | Flagged by |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**RLS Policies:**
- Organization members can view flags
- Organization members can insert flags
- Organization members can update flags

**Indexes:**
- idx_review_flags_organization_id (organization_id)
- idx_review_flags_review_id (review_id)
- idx_review_flags_resolved (resolved)

### `review_notifications`

Notification settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Notification ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| source_id | uuid | NOT NULL, FK → review_sources(on delete cascade) | Source |
| notify_on_new_review | boolean | DEFAULT true | New review |
| notify_on_rating_change | boolean | DEFAULT false | Rating change |
| notify_on_negative_review | boolean | DEFAULT true | Negative |
| negative_threshold | integer | DEFAULT 3 | Threshold |
| email_enabled | boolean | DEFAULT true | Email |
| email_recipients | text[] | | Recipients |
| sms_enabled | boolean | DEFAULT false | SMS |
| sms_recipients | text[] | | SMS recipients |
| slack_enabled | boolean | DEFAULT false | Slack |
| slack_webhook_url | text | | Webhook |
| send_digest | boolean | DEFAULT false | Digest |
| digest_frequency | text | DEFAULT 'daily', CHECK('immediate','hourly','daily','weekly') | Frequency |
| active | boolean | DEFAULT true | Active |
| last_sent_at | timestamptz | | Last sent |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |
| updated_at | timestamptz | NOT NULL, DEFAULT NOW() | Updated |

**RLS Policies:**
- Organization members can view notifications
- Organization members can insert notifications
- Organization members can update notifications

**Indexes:**
- idx_review_notifications_organization_id (organization_id)
- idx_review_notifications_source_id (source_id)
- idx_review_notifications_active (active)

### `review_analytics`

Aggregated metrics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Analytics ID |
| organization_id | uuid | NOT NULL, FK → organizations | Tenant ID |
| source_id | uuid | NOT NULL, FK → review_sources(on delete cascade) | Source |
| period_start | date | NOT NULL | Period start |
| period_end | date | NOT NULL | Period end |
| total_reviews | integer | DEFAULT 0 | Total |
| average_rating | numeric(3,2) | | Average |
| rating_1_count | integer | DEFAULT 0 | 1-star |
| rating_2_count | integer | DEFAULT 0 | 2-star |
| rating_3_count | integer | DEFAULT 0 | 3-star |
| rating_4_count | integer | DEFAULT 0 | 4-star |
| rating_5_count | integer | DEFAULT 0 | 5-star |
| responded_count | integer | DEFAULT 0 | Responded |
| response_rate | numeric(5,2) | | Response rate |
| avg_response_time_hours | numeric | | Avg time |
| positive_count | integer | DEFAULT 0 | Positive |
| neutral_count | integer | DEFAULT 0 | Neutral |
| negative_count | integer | DEFAULT 0 | Negative |
| rating_change | numeric(3,2) | | Rating change |
| review_count_change | integer | | Count change |
| calculated_at | timestamptz | NOT NULL, DEFAULT NOW() | Calculated |
| created_at | timestamptz | NOT NULL, DEFAULT NOW() | Created |

**Unique Constraint:** (source_id, period_start, period_end)

**RLS Policies:**
- Organization members can view analytics
- System can insert analytics

**Indexes:**
- idx_review_analytics_organization_id (organization_id)
- idx_review_analytics_source_id (source_id)
- idx_review_analytics_period_start (period_start DESC)

---

## Migration Order

Apply schema files in this order to satisfy foreign key dependencies:

1. **init.sql** - Core: user_profiles, organizations, memberships
2. **crm_schema.sql** - companies, contacts (foundational for many modules)
3. **workflow_schema.sql** - workflows, workflow_executions
4. **builder_schema.sql** - sites, funnels, pages
5. **marketing_schema.sql** - marketing_templates, campaigns, logs (referenced by other modules)
6. **deals_schema.sql** - pipelines, stages, deals (references contacts, companies)
7. **agents_schema.sql** - agent_executions, orchestrator_tasks (references workflow_executions)
8. **forms_schema.sql** - forms, form_fields, submissions, notifications (references contacts, marketing_templates)
9. **calendar_schema.sql** - calendars, appointments, availability (references contacts)
10. **phone_schema.sql** - phone_numbers, calls, recordings, SMS (references contacts)
11. **membership_schema.sql** - membership_plans, subscriptions, content (references user_profiles, marketing_templates)
12. **social_schema.sql** - social_accounts, posts, analytics (references marketing_campaigns)
13. **reputation_schema.sql** - review_sources, reviews, responses (references marketing_templates)

---

## Common Patterns

### Row Level Security (RLS)

All tables follow this pattern:
```sql
alter table public.<table> enable row level security;

create policy "Org members can view <table>" on public.<table>
  for select using (
    auth.uid() in (
      select user_id from public.memberships where organization_id = <table>.organization_id
    )
  );
```

### Timestamps

All tables include:
- `created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())`
- `updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())`

With trigger:
```sql
create trigger <table>_updated_at
  before update on public.<table>
  for each row execute procedure public.update_<module>_updated_at();
```

### Indexes

Standard indexes:
- `organization_id` on all tenant-scoped tables
- Foreign key columns
- Status/type columns
- Date/timestamp columns (DESC for queries)
- Unique constraints where appropriate

---

## Performance Notes

1. **Organization filtering**: All queries filter by `organization_id` - this index is critical
2. **Denormalization**: `workflow_executions.organization_id` is denormalized for RLS efficiency
3. **JSONB columns**: Used for flexible data storage (settings, metadata, configs)
4. **Cascade deletes**: Set appropriately based on data model requirements
5. **Exclusion constraints**: Used for time-based overlaps (appointments, availability)

---

## Data Types

- **uuid**: Primary keys and foreign keys
- **text**: Variable-length text (preferred over varchar)
- **timestamptz**: Timestamps with timezone (always UTC)
- **jsonb**: Structured JSON data with binary storage
- **numeric**: Decimal values (money, ratings)
- **integer**: Whole numbers
- **boolean**: True/false flags
- **text[]**: String arrays
- **date**: Date without time
- **decimal(15,2)**: Money values (deal value, price)
- **decimal(10,2)**: Standard decimal (price, amount)

---

## Summary Statistics

- **Total Tables**: 73
- **Total Schemas**: 13
- **Core Tables**: 3 (user_profiles, organizations, memberships)
- **CRM Tables**: 2 (companies, contacts)
- **Workflow Tables**: 2 (workflows, workflow_executions)
- **Builder Tables**: 3 (sites, funnels, pages)
- **Marketing Tables**: 3 (templates, campaigns, logs)
- **Deals Tables**: 3 (pipelines, stages, deals)
- **Agents Tables**: 3 (agent_executions, orchestrator_tasks, agent_capabilities)
- **Forms Tables**: 4 (forms, form_fields, submissions, notifications)
- **Calendar Tables**: 6 (calendars, appointment_types, availability, appointments, reminders, history)
- **Phone Tables**: 6 (phone_numbers, calls, recordings, voicemails, sms_threads, sms_messages)
- **Membership Tables**: 6 (plans, subscriptions, content, access, progress, certificates)
- **Social Tables**: 7 (accounts, posts, scheduled_posts, analytics, comments, replies, media_library)
- **Reputation Tables**: 6 (sources, reviews, responses, flags, notifications, analytics)
