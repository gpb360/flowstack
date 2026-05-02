# FlowStack Workflow System - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                 │
│                   React Flow Visual Builder                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │
│  │ Node Palette │  │ Canvas Area  │  │ Properties   │                 │
│  │              │  │              │  │ Panel        │                 │
│  └──────────────┘  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW DEFINITION                              │
│                     PostgreSQL / Supabase                               │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ workflows Table                                                  │ │
│  │  • id, organization_id                                          │ │
│  │  • name, description, status                                     │ │
│  │  • trigger_definitions (JSONB)                                  │ │
│  │  • nodes (JSONB) - React Flow nodes                             │ │
│  │  • edges (JSONB) - React Flow edges                             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TRIGGER DETECTION                                │
│                                                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   WEBHOOK TRIGGER│  │  SCHEDULE TRIGGER│  │  EVENT TRIGGER   │      │
│  │                  │  │                  │  │                  │      │
│  │  Edge Function   │  │  Cron Scheduler  │  │  Supabase        │      │
│  │  /webhook/*      │  │  (scheduled_     │  │  Realtime        │      │
│  │                  │  │   triggers)      │  │  postgres_changes│      │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘      │
│           │                     │                      │                  │
│           └─────────────────────┴──────────────────────┘                  │
│                                   │                                     │
│                                   ▼                                     │
│                        Trigger Event Received                            │
│                        { workflow_id, trigger_data }                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOW QUEUE                                  │
│                      Priority Queue Management                           │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ workflow_queue Table                                             │ │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐             │ │
│  │  │ P0  │ │ P1  │ │ P2  │ │ P2  │ │ P3  │ │ P3  │ ...          │ │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘             │ │
│  │                                                                  │ │
│  │  Priority: 0 (highest) → 10 (lowest)                             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Worker Pool (5 workers by default)                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │Worker 1 │  │Worker 2 │  │Worker 3 │  │Worker 4 │  │Worker 5 │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │            │            │            │             │
│       └────────────┴────────────┴────────────┴────────────┘             │
                                │                                          │
                                ▼                                         │
│                    Pick next item by priority                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       WORKFLOW EXECUTION                                 │
│                      WorkflowExecutor Class                              │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Execution Context                                                │ │
│  │  {                                                              │ │
│  │    trigger_data: {...},                                         │ │
│  │    contact: {...},                                              │ │
│  │    loop_index: 0,                                               │ │
│  │    custom_field: value                                          │ │
│  │  }                                                              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Node Execution Loop:                                                    │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐   │
│  │Trigger │───▶│Action 1│───▶│Action 2│───▶│Action 3│───▶│  End   │   │
│  └────────┘    └────────┘    └────────┘    └────────┘    └────────┘   │
│       │            │            │            │                         │
│       ▼            ▼            ▼            ▼                         │
│   [START]    [EXECUTE]    [EXECUTE]    [EXECUTE]                    │
│               [LOG]        [LOG]        [LOG]                        │
│               [UPDATE]     [UPDATE]     [UPDATE]                     │
│                      [CONTEXT]                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ACTION REGISTRY                                   │
│                      Action Execution                                    │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ CRM Actions                                                      │ │
│  │  • create_contact, update_contact, create_note                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Communication Actions                                            │ │
│  │  • send_email, send_sms                                          │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Marketing Actions                                                │ │
│  │  • add_to_sequence, add_tag                                      │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Logic Actions                                                    │ │
│  │  • delay, condition, transform                                   │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ HTTP Actions                                                     │ │
│  │  • request (GET, POST, PUT, DELETE)                              │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ AI Agent Actions                                                 │ │
│  │  • workflow_suggest, crm_*, marketing_*, analytics_*             │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL INTEGRATIONS                               │
│                                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │Supabase DB │  │Email Service│  │SMS Service │  │External API│       │
│  │            │  │             │  │             │  │             │       │
│  │CRM Tables  │  │SendGrid/    │  │Twilio/     │  │Stripe/     │       │
│  │            │  │Postmark/    │  │Plivo/      │  │Slack/      │       │
│  │            │  │Custom SMTP  │  │Custom HTTP │  │Custom HTTP │       │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXECUTION HISTORY & LOGGING                          │
│                     Audit Trail & Analytics                              │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ workflow_executions Table                                        │ │
│  │  • workflow_id, organization_id                                  │ │
│  │  • status (pending/running/completed/failed)                     │ │
│  │  • started_at, completed_at                                       │ │
│  │  • trigger_data, execution_log, error                            │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ workflow_execution_logs Table                                    │ │
│  │  • execution_id, node_id, node_type                              │ │
│  │  • status (started/completed/failed)                             │ │
│  │  • input, output, error, duration_ms                             │ │
│  │  • timestamp                                                     │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLING & RETRY                             │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Retry Logic                                                       │ │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │ │
│  │  │Attempt 1 │───▶│Attempt 2 │───▶│Attempt 3 │──▶ Success?       │ │
│  │  └──────────┘    └──────────┘    └──────────┘                    │ │
│  │       │              │              │                            │ │
│  │       ▼              ▼              ▼                            │ │
│  │   Fixed/       Exponential    Linear                           │ │
│  │   Exponential   Backoff       Backoff                           │ │
│  │   Backoff       (2^n * delay)  (n * delay)                      │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │ Dead Letter Queue                                                 │ │
│  │  Failed items stored for review and manual retry                 │ │
│  │  workflow_dead_letter_queue Table                                │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: Webhook → CRM → Email

```
1. External System sends POST to webhook URL
   ↓
2. Edge Function validates and stores webhook event
   ↓
3. Workflow added to queue (priority: normal)
   ↓
4. Worker picks up workflow from queue
   ↓
5. Executor creates contact in CRM
   ↓
6. Executor sends welcome email
   ↓
7. Execution marked as completed
   ↓
8. Execution log stored with timestamps
```

### Example 2: Database Event → Condition → Parallel

```
1. Contact created in database
   ↓
2. Supabase Realtime detects INSERT
   ↓
3. Trigger fires workflow
   ↓
4. Queue worker starts execution
   ↓
5. Condition node evaluates lead score
   ↓
6. If score >= 80:
   ├─▶ Branch 1: Assign to senior rep
   │   ├─▶ Send SMS notification
   │   └─▶ Add to VIP sequence
   │
   └─▶ If score < 80:
       ├─▶ Branch 2: Assign to junior rep
       │   └─▶ Add to nurture sequence
       │
       └─▶ Both branches merge
           └─▶ Send team notification
```

### Example 3: Scheduled Report → AI Agent → Email

```
1. Cron scheduler triggers at 9 AM daily
   ↓
2. Workflow queued with high priority
   ↓
3. Executor calls AI agent for report generation
   ↓
4. Agent queries analytics data
   ↓
5. Agent generates summary report
   ↓
6. Executor emails report to team
   ↓
7. Execution logged with duration
```

## Key Components Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                     MODULE INTERACTIONS                         │
│                                                                  │
│  ┌─────────┐      ┌──────────┐      ┌─────────────┐            │
│  │   CRM   │◀─────│Workflows │─────▶│  Marketing   │            │
│  │ Module  │      │   API    │      │   Module     │            │
│  └─────────┘      └──────────┘      └─────────────┘            │
│       ▲                  │                    ▲                │
│       │                  │                    │                │
│       │                  ▼                    │                │
│       │         ┌───────────────┐            │                │
│       │         │  Workflow     │            │                │
│       │         │  Executor     │            │                │
│       │         └───────────────┘            │                │
│       │                  │                    │                │
│       │                  ▼                    │                │
│       │         ┌───────────────┐            │                │
│       └─────────│Action Registry│────────────┘                │
│                 │  (30+ actions)│                            │
│                 └───────────────┘                            │
│                                                                  │
│  ┌─────────┐      ┌──────────┐      ┌─────────────┐            │
│  │ Builder │──────▶│Workflows │─────▶│   Forms      │            │
│  │ Module  │      │   API    │      │   Module     │            │
│  └─────────┘      └──────────┘      └─────────────┘            │
│                                                                  │
│  ┌─────────┐      ┌──────────┐      ┌─────────────┐            │
│  │AI Agents│──────▶│Workflows │─────▶│  Analytics   │            │
│  │ Module  │      │   API    │      │   Module     │            │
│  └─────────┘      └──────────┘      └─────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE METRICS                          │
│                                                                  │
│  Throughput:                                                     │
│  • Queue processing: 5 workers (configurable)                    │
│  • Each worker: ~10-50 workflows/minute (depending on actions)   │
│  • Total: 50-250 workflows/minute                                │
│                                                                  │
│  Latency:                                                        │
│  • Simple workflow: < 1 second                                   │
│  • Medium complexity: 1-5 seconds                                │
│  • Complex with external APIs: 5-30 seconds                      │
│                                                                  │
│  Scalability:                                                    │
│  • Horizontal: Add more workers                                  │
│  • Vertical: Increase worker count                               │
│  • Database: Supabase handles scaling                            │
│                                                                  │
│  Reliability:                                                    │
│  • Retry: 3 attempts with exponential backoff                    │
│  • Dead letter queue: No data loss                               │
│  • Execution logs: Full audit trail                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY MODEL                             │
│                                                                  │
│  Layer 1: Authentication                                         │
│  • Supabase Auth (JWT tokens)                                    │
│  • Service role for Edge Functions                              │
│                                                                  │
│  Layer 2: Authorization                                          │
│  • Row Level Security (RLS) on all tables                        │
│  • Organization-based access control                            │
│  • Role-based permissions (owner/admin/member)                   │
│                                                                  │
│  Layer 3: Input Validation                                       │
│  • Action config validation before execution                     │
│  • Webhook secret verification                                  │
│  • Type checking on all inputs                                  │
│                                                                  │
│  Layer 4: Execution Isolation                                    │
│  • Separate execution contexts per workflow                     │
│  • No cross-workflow data leakage                               │
│  • Sandboxed action execution                                   │
│                                                                  │
│  Layer 5: Audit Trail                                            │
│  • Complete execution logs                                      │
│  • Timestamp tracking for all operations                        │
│  • Error logging with stack traces                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-26
**Status**: Production Architecture ✅
