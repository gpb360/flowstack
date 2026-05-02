# FlowStack Workflow Automation System

Complete workflow execution engine for FlowStack's AI-native business platform.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Triggers](#triggers)
- [Actions](#actions)
- [Execution Model](#execution-model)
- [Queue Management](#queue-management)
- [Creating Custom Actions](#creating-custom-actions)
- [API Reference](#api-reference)
- [Examples](#examples)

## Overview

The FlowStack Workflow Automation System is the "nervous system" that connects all modules (CRM, Marketing, Site Builder, etc.) through visual, event-driven automations.

### Key Features

- **Visual Workflow Builder**: Drag-and-drop interface using React Flow
- **Event-Driven Triggers**: Webhooks, schedules, database changes, form submissions
- **Action Registry**: Extensible library of pre-built actions
- **Queue Management**: Async execution with retry logic and dead letter queues
- **Real-time Execution**: Powered by Supabase Realtime and Edge Functions
- **Error Handling**: Comprehensive retry mechanisms with exponential backoff
- **Execution Logging**: Detailed audit trails for all workflow runs

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Workflow Builder UI                     │
│                  (React Flow Canvas)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Workflow Definition                        │
│              (Stored in PostgreSQL/Supabase)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Trigger Detection                         │
│        Webhooks | Schedule | Events | Manual                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Workflow Queue                           │
│              (Priority Queue with Workers)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 Workflow Executor                           │
│          (Node Execution + Flow Control)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Action Registry                           │
│    CRM | Marketing | Communication | Logic | HTTP | AI      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Execution History                          │
│             (Logs + Metrics + Errors)                       │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Create a Simple Workflow

```typescript
import { createWorkflow } from '@/lib/workflows';

const workflow = await createWorkflow('org-123', {
  name: 'Welcome Email Sequence',
  description: 'Send welcome email when contact is created',
  status: 'active',
  trigger_definitions: [
    {
      id: 'trigger-1',
      type: 'crm:contact_created',
      config: {},
      enabled: true,
    },
  ],
  nodes: [
    {
      id: 'trigger-node',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: {
        label: 'Contact Created',
        trigger: {
          id: 'trigger-1',
          type: 'crm:contact_created',
          config: {},
          enabled: true,
        },
      },
    },
    {
      id: 'email-node',
      type: 'action',
      position: { x: 200, y: 0 },
      data: {
        label: 'Send Welcome Email',
        actionType: 'communication:send_email',
        config: {
          to: '{{contact.email}}',
          subject: 'Welcome to FlowStack!',
          body: 'Thanks for signing up!',
        },
      },
    },
  ],
  edges: [
    {
      id: 'edge-1',
      source: 'trigger-node',
      target: 'email-node',
    },
  ],
});
```

### 2. Trigger a Workflow Manually

```typescript
import { triggerWorkflow } from '@/lib/workflows';

await triggerWorkflow('workflow-id', {
  contact: {
    email: 'user@example.com',
    first_name: 'John',
  },
});
```

### 3. View Execution History

```typescript
import { getWorkflowExecutions } from '@/lib/workflows';

const executions = await getWorkflowExecutions('workflow-id', 50);

console.log(executions.map(e => ({
  status: e.status,
  started_at: e.started_at,
  duration: e.completed_at
    ? new Date(e.completed_at) - new Date(e.started_at)
    : null,
})));
```

## Core Concepts

### Workflow Definition

A workflow consists of:

- **Triggers**: Events that start the workflow
- **Nodes**: Individual actions or logic steps
- **Edges**: Connections between nodes that define flow
- **Context**: Data passed between nodes during execution

### Node Types

1. **Trigger Node**: Entry point for the workflow
2. **Action Node**: Executes a specific action (CRM, Marketing, etc.)
3. **Condition Node**: Branching logic based on data
4. **Delay Node**: Pauses execution for a specified duration
5. **Parallel Node**: Executes multiple branches simultaneously
6. **Loop Node**: Iterates over an array of data
7. **End Node**: Marks the completion of a workflow branch

### Execution Context

The context is a key-value store that accumulates data throughout workflow execution:

```javascript
{
  // Initial trigger data
  contact: { email: 'user@example.com', id: '123' },

  // Added by action nodes
  email_sent: { message_id: 'abc-456' },

  // Loop variables
  loop_index: 0,
  loop_item: { ... },
}
```

Access context values in action configs using `{{variable.path}}` syntax.

## Triggers

### Webhook Triggers

Receive HTTP requests to trigger workflows:

```typescript
{
  type: 'webhook:incoming',
  config: {
    secret: 'optional-secret-key', // Verify requests
    method: 'POST', // HTTP method to accept
  },
}
```

Webhook URL format:
```
https://<project-url>.supabase.co/functions/v1/webhook/<workflow_id>/<trigger_id>
```

### Scheduled Triggers

Execute workflows on a schedule using cron expressions:

```typescript
{
  type: 'schedule:cron',
  config: {
    cron: '0 9 * * *', // Daily at 9 AM
    timezone: 'UTC',
  },
}
```

Cron format: `minute hour day month weekday`

### Event Triggers

React to database changes in real-time:

```typescript
{
  type: 'crm:contact_created',
  config: {
    filters: {
      // Only trigger for specific conditions
      source: 'website',
    },
  },
}
```

Available event triggers:
- `crm:contact_created`
- `crm:contact_updated`
- `crm:deal_stage_changed`
- `form:submission`
- `marketing:email_opened`
- `marketing:email_clicked`

### Manual Triggers

Trigger workflows from the UI or API:

```typescript
{
  type: 'manual',
  config: {
    allowed_roles: ['owner', 'admin'],
  },
}
```

## Actions

### CRM Actions

```typescript
// Create a new contact
{
  actionType: 'crm:create_contact',
  config: {
    first_name: '{{first_name}}',
    last_name: '{{last_name}}',
    email: '{{email}}',
    phone: '{{phone}}',
  },
}

// Update existing contact
{
  actionType: 'crm:update_contact',
  config: {
    contact_id: '{{contact.id}}',
    first_name: '{{new_first_name}}',
  },
}

// Add a note to contact
{
  actionType: 'crm:create_note',
  config: {
    contact_id: '{{contact.id}}',
    note: 'Called customer, interested in premium plan',
  },
}
```

### Communication Actions

```typescript
// Send email
{
  actionType: 'communication:send_email',
  config: {
    to: '{{contact.email}}',
    subject: 'Welcome!',
    body: 'Hi {{contact.first_name}}, welcome to FlowStack!',
  },
}

// Send SMS
{
  actionType: 'communication:send_sms',
  config: {
    to: '{{contact.phone}}',
    message: 'Your appointment is confirmed.',
  },
}
```

### Marketing Actions

```typescript
// Add to email sequence
{
  actionType: 'marketing:add_to_sequence',
  config: {
    contact_id: '{{contact.id}}',
    sequence_id: 'welcome-sequence-123',
  },
}

// Add tag to contact
{
  actionType: 'marketing:add_tag',
  config: {
    contact_id: '{{contact.id}}',
    tag: 'vip-customer',
  },
}
```

### Logic Actions

```typescript
// Delay execution
{
  actionType: 'logic:delay',
  config: {
    duration: 5,
    unit: 'minutes',
  },
}

// Condition (use Condition Node in visual builder)
{
  actionType: 'logic:condition',
  config: {
    conditions: {
      operator: 'and',
      conditions: [
        { field: 'contact.age', operator: 'gte', value: 18 },
        { field: 'contact.status', operator: 'eq', value: 'active' },
      ],
    },
  },
}
```

### Data Actions

```typescript
// Transform data
{
  actionType: 'data:transform',
  config: {
    transformation: {
      'contact.fullName': 'contact.first_name',
      'user.email': 'contact.email',
    },
  },
}

// Filter array
{
  actionType: 'data:filter',
  config: {
    array_field: 'contacts',
    conditions: {
      operator: 'and',
      conditions: [
        { field: 'status', operator: 'eq', value: 'active' },
      ],
    },
  },
}
```

### HTTP Actions

```typescript
// Make HTTP request
{
  actionType: 'http:request',
  config: {
    url: 'https://api.example.com/create',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer {{api_key}}',
      'Content-Type': 'application/json',
    },
    body: {
      email: '{{contact.email}}',
      name: '{{contact.first_name}}',
    },
  },
}
```

## Execution Model

### Synchronous vs Asynchronous

Workflows execute asynchronously by default for scalability:

```typescript
// Queue for async execution (recommended)
await queueWorkflow('workflow-id', 'org-id', triggerData);

// Execute synchronously (blocks, not recommended for complex workflows)
await executeWorkflow(workflow, triggerData);
```

### Error Handling and Retries

Actions can be configured with retry logic:

```typescript
{
  actionType: 'crm:create_contact',
  config: { /* ... */ },
  retryConfig: {
    maxAttempts: 3,
    backoffType: 'exponential', // or 'fixed' or 'linear'
    initialDelay: 1000, // milliseconds
    maxDelay: 30000, // max delay for exponential backoff
  },
}
```

### Execution Logging

Every workflow execution creates a detailed log:

```typescript
const execution = await getExecution('execution-id');

console.log(execution.execution_log);
// [
//   {
//     timestamp: '2024-01-15T10:30:00Z',
//     node_id: 'email-node',
//     node_type: 'action',
//     status: 'completed',
//     input: { to: 'user@example.com', subject: 'Welcome' },
//     output: { message_id: 'abc-123' },
//     duration_ms: 234,
//   },
// ]
```

## Queue Management

### Queue Priorities

```typescript
await queueWorkflow('workflow-id', 'org-id', triggerData, {
  priority: 'high', // 'low' | 'normal' | 'high' | 'critical'
});
```

### Queue Statistics

```typescript
const queue = getQueue();
const stats = await queue.getStats();

console.log(stats);
// { queued: 15, processing: 3, completed: 142, failed: 2 }
```

### Dead Letter Queue

Failed items are moved to dead letter queue after max retries:

```typescript
// Get failed items
const failedItems = await getDeadLetterItems('org-id');

// Retry failed items
await restoreFromDeadLetterQueue('dead-letter-id');
```

## Creating Custom Actions

### Define Action Type

Add to `src/lib/workflows/types.ts`:

```typescript
export type ActionType =
  | 'crm:create_contact'
  // ... existing actions
  | 'my_module:custom_action'; // Add yours here
```

### Implement Action Executor

Add to `src/lib/workflows/actions.ts`:

```typescript
actionRegistry.set('my_module:custom_action', {
  execute: async (config, execution, context) => {
    try {
      // Your action logic here
      const result = await performCustomAction(config, context);

      return {
        success: true,
        data: { result },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Action failed',
        should_continue: false,
      };
    }
  },

  // Optional: validate config before execution
  validate: (config) => {
    const errors: string[] = [];

    if (!config.required_field) {
      errors.push('required_field is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
});
```

### Use in Workflows

```typescript
{
  actionType: 'my_module:custom_action',
  config: {
    required_field: 'value',
    option: '{{context_variable}}',
  },
}
```

## API Reference

### Workflow Management

```typescript
// Get workflow
const workflow = await getWorkflow('workflow-id');

// List workflows
const workflows = await getWorkflows('org-id');

// Create workflow
const workflow = await createWorkflow('org-id', workflowDefinition);

// Update workflow
await updateWorkflow('workflow-id', { status: 'active' });

// Delete workflow
await deleteWorkflow('workflow-id');

// Activate workflow
await activateWorkflow('workflow-id');

// Pause workflow
await pauseWorkflow('workflow-id');
```

### Execution

```typescript
// Execute workflow (sync)
const execution = await executeWorkflow(workflow, triggerData);

// Queue workflow (async)
const queueItemId = await queueWorkflow('workflow-id', 'org-id', triggerData);

// Get execution
const execution = await getExecution('execution-id');

// Get execution history
const executions = await getWorkflowExecutions('workflow-id');

// Get workflow stats
const stats = await getWorkflowStats('workflow-id');
```

### Triggers

```typescript
// Generate webhook URL
const url = generateWebhookUrl('workflow-id', 'trigger-id');

// Validate webhook
const isValid = await validateWebhookRequest('workflow-id', 'trigger-id', payload, headers);

// Trigger manually
await triggerWorkflow('workflow-id', triggerData);
```

### Validation

```typescript
// Validate workflow definition
const validation = validateWorkflow(workflow);

if (!validation.valid) {
  console.error(validation.errors);
}

console.warn(validation.warnings);
```

## Examples

### Example 1: Lead Nurturing Sequence

```typescript
const nurturingWorkflow = await createWorkflow('org-123', {
  name: 'Lead Nurturing Sequence',
  status: 'active',

  trigger_definitions: [
    {
      id: 'trigger-1',
      type: 'crm:contact_created',
      config: {
        filters: { source: 'website' },
      },
      enabled: true,
    },
  ],

  nodes: [
    // Trigger
    {
      id: 'trigger',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: {
        label: 'New Lead',
        trigger: { /* ... */ },
      },
    },

    // Check if lead is qualified
    {
      id: 'check-qualified',
      type: 'condition',
      position: { x: 200, y: 0 },
      data: {
        label: 'Is Qualified?',
        conditions: {
          operator: 'and',
          conditions: [
            { field: 'contact.lead_score', operator: 'gte', value: 50 },
          ],
        },
      },
    },

    // Send welcome email if qualified
    {
      id: 'send-welcome',
      type: 'action',
      position: { x: 400, y: -50 },
      data: {
        label: 'Send Welcome Email',
        actionType: 'communication:send_email',
        config: {
          to: '{{contact.email}}',
          subject: 'Welcome!',
          template: 'welcome-email',
        },
      },
    },

    // Add to nurture sequence if not qualified
    {
      id: 'add-nurture',
      type: 'action',
      position: { x: 400, y: 50 },
      data: {
        label: 'Add to Nurture Sequence',
        actionType: 'marketing:add_to_sequence',
        config: {
          sequence_id: 'nurture-sequence-123',
        },
      },
    },
  ],

  edges: [
    { id: 'e1', source: 'trigger', target: 'check-qualified' },
    { id: 'e2', source: 'check-qualified', target: 'send-welcome', condition: 'true' },
    { id: 'e3', source: 'check-qualified', target: 'add-nurture', condition: 'false' },
  ],
});
```

### Example 2: Daily Report

```typescript
const dailyReportWorkflow = await createWorkflow('org-123', {
  name: 'Daily Activity Report',
  status: 'active',

  trigger_definitions: [
    {
      id: 'trigger-1',
      type: 'schedule:cron',
      config: {
        cron: '0 8 * * *', // 8 AM daily
        timezone: 'America/New_York',
      },
      enabled: true,
    },
  ],

  nodes: [
    {
      id: 'generate-report',
      type: 'action',
      position: { x: 0, y: 0 },
      data: {
        label: 'Generate Report',
        actionType: 'agent:analytics_report',
        config: {
          report_type: 'daily_activity',
          date: '{{today}}',
        },
      },
    },
    {
      id: 'send-email',
      type: 'action',
      position: { x: 200, y: 0 },
      data: {
        label: 'Email Report',
        actionType: 'communication:send_email',
        config: {
          to: 'manager@company.com',
          subject: 'Daily Activity Report - {{today}}',
          body: '{{report.data}}',
        },
      },
    },
  ],

  edges: [
    { id: 'e1', source: 'generate-report', target: 'send-email' },
  ],
});
```

### Example 3: Webhook Integration

```typescript
const webhookWorkflow = await createWorkflow('org-123', {
  name: 'Process Stripe Payment',
  status: 'active',

  trigger_definitions: [
    {
      id: 'trigger-1',
      type: 'webhook:incoming',
      config: {
        secret: 'stripe-webhook-secret',
      },
      enabled: true,
    },
  ],

  nodes: [
    {
      id: 'verify-payment',
      type: 'action',
      position: { x: 0, y: 0 },
      data: {
        label: 'Verify Payment',
        actionType: 'http:request',
        config: {
          url: 'https://api.stripe.com/v1/charges/{{payload.charge_id}}',
          method: 'GET',
          headers: {
            'Authorization': 'Bearer {{stripe_secret_key}}',
          },
        },
      },
    },
    {
      id: 'update-contact',
      type: 'action',
      position: { x: 200, y: 0 },
      data: {
        label: 'Update Contact Status',
        actionType: 'crm:update_contact',
        config: {
          contact_id: '{{payload.customer_id}}',
          status: 'paid_customer',
        },
      },
    },
  ],

  edges: [
    { id: 'e1', source: 'verify-payment', target: 'update-contact' },
  ],
});

// Webhook URL:
// https://<project>.supabase.co/functions/v1/webhook/<workflow-id>/trigger-1
```

## Best Practices

1. **Use Async Execution**: Always queue workflows for async execution unless you need immediate results
2. **Implement Timeouts**: Set appropriate timeouts for HTTP requests and external API calls
3. **Handle Errors**: Configure retry logic for transient failures
4. **Log Everything**: Use the execution log for debugging and monitoring
5. **Test Workflows**: Use the test mode to validate workflows before activating
6. **Monitor Performance**: Track execution times and failure rates
7. **Use Conditions**: Branch based on data to avoid unnecessary actions
8. **Secure Webhooks**: Always use secrets for webhook triggers
9. **Queue Priorities**: Use appropriate priorities for time-sensitive workflows
10. **Dead Letter Queue**: Regularly review and retry failed executions

## Troubleshooting

### Workflow Not Executing

1. Check workflow status is `active`
2. Verify triggers are enabled
3. Check execution logs for errors
4. Ensure queue processor is running

### Action Failures

1. Review action configuration
2. Check API credentials and permissions
3. Verify context variable references
4. Check retry configuration

### Performance Issues

1. Monitor queue statistics
2. Check for long-running actions
3. Consider parallel execution for independent actions
4. Optimize database queries

## Support

For issues, questions, or contributions:
- GitHub Issues: [FlowStack Issues](https://github.com/flowstack/flowstack/issues)
- Documentation: [FlowStack Docs](https://docs.flowstack.com)
- Community: [FlowStack Discord](https://discord.gg/flowstack)
