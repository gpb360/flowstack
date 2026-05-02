# Workflow System - Quick Reference Guide

**For FlowStack Developers**

## Import Statements

```typescript
// Import everything
import * as Workflow from '@/lib/workflows';

// Or import specific functions
import {
  createWorkflow,
  triggerWorkflow,
  getWorkflowExecutions,
  queueWorkflow,
} from '@/lib/workflows';

// Import types
import type {
  Workflow,
  WorkflowNode,
  WorkflowExecution,
  ActionType,
} from '@/lib/workflows/types';
```

## Common Operations

### Create a Workflow

```typescript
const workflow = await createWorkflow('org-id', {
  name: 'My Workflow',
  description: 'Description',
  status: 'active',
  trigger_definitions: [{ /* trigger */ }],
  nodes: [{ /* nodes */ }],
  edges: [{ /* edges */ }],
});
```

### Execute a Workflow

```typescript
// Manual trigger
await triggerWorkflow('workflow-id', { key: 'value' });

// Queue for async execution
await queueWorkflow('workflow-id', 'org-id', { key: 'value' });

// With priority
await queueWorkflow('workflow-id', 'org-id', data, {
  priority: 'high',
});
```

### Get Execution History

```typescript
// Get recent executions
const executions = await getWorkflowExecutions('workflow-id', 50);

// Get specific execution
const execution = await getExecution('execution-id');

// Get statistics
const stats = await getWorkflowStats('workflow-id');
```

## Node Types Reference

### Trigger Node
```typescript
{
  id: 'trigger-1',
  type: 'trigger',
  position: { x: 0, y: 0 },
  data: {
    label: 'Webhook Trigger',
    trigger: {
      id: 't1',
      type: 'webhook:incoming',
      config: {},
      enabled: true,
    },
  },
}
```

### Action Node
```typescript
{
  id: 'action-1',
  type: 'action',
  position: { x: 200, y: 0 },
  data: {
    label: 'Send Email',
    actionType: 'communication:send_email',
    config: {
      to: '{{contact.email}}',
      subject: 'Hello',
    },
    retryConfig: {
      maxAttempts: 3,
      backoffType: 'exponential',
      initialDelay: 1000,
    },
  },
}
```

### Condition Node
```typescript
{
  id: 'cond-1',
  type: 'condition',
  position: { x: 400, y: 0 },
  data: {
    label: 'Is VIP?',
    conditions: {
      operator: 'and',
      conditions: [
        { field: 'contact.score', operator: 'gte', value: 80 },
      ],
    },
  },
}
```

### Delay Node
```typescript
{
  id: 'delay-1',
  type: 'delay',
  position: { x: 600, y: 0 },
  data: {
    label: 'Wait 5 minutes',
    duration: 5,
    unit: 'minutes',
  },
}
```

## Trigger Types

| Type | Description | Config |
|------|-------------|--------|
| `webhook:incoming` | HTTP webhook | `{ secret?: string }` |
| `schedule:cron` | Scheduled/cron | `{ cron: string, timezone?: string }` |
| `crm:contact_created` | New contact | `{ filters?: Record<string, any> }` |
| `crm:contact_updated` | Contact updated | `{ filters?: Record<string, any> }` |
| `form:submission` | Form submitted | `{ form_id: string }` |
| `manual` | Manual trigger | `{ allowed_roles?: string[] }` |

## Action Types

### CRM
- `crm:create_contact` - Create new contact
- `crm:update_contact` - Update contact
- `crm:create_note` - Add note to contact
- `crm:assign_owner` - Assign contact owner

### Communication
- `communication:send_email` - Send email
- `communication:send_sms` - Send SMS

### Marketing
- `marketing:add_to_sequence` - Add to email sequence
- `marketing:add_tag` - Add tag to contact
- `marketing:remove_tag` - Remove tag

### Logic
- `logic:delay` - Pause execution
- `logic:condition` - Branch based on conditions

### Data
- `data:transform` - Transform data structure
- `data:filter` - Filter array data

### HTTP
- `http:request` - Make HTTP request

### AI Agents
- `agent:workflow_suggest` - AI workflow suggestions
- `agent:crm_*` - CRM agent actions
- `agent:marketing_*` - Marketing agent actions
- `agent:analytics_*` - Analytics agent actions

## Context Variables

Access context data using `{{path}}` syntax:

```typescript
// Simple reference
'{{contact.email}}'

// Nested reference
'{{contact.company.name}}'

// Array access
'{{items.0.name}}'

// In action config
config: {
  to: '{{contact.email}}',
  body: 'Hello {{contact.first_name}}',
}
```

## Conditional Edges

Branch workflows based on conditions:

```typescript
// Edge with condition
{
  id: 'e1',
  source: 'condition-node',
  target: 'action-if-true',
  condition: 'true', // Follows if condition is true
}

// Opposite edge
{
  id: 'e2',
  source: 'condition-node',
  target: 'action-if-false',
  condition: 'false', // Follows if condition is false
}
```

## Webhook URLs

Generate webhook URLs:

```typescript
const url = generateWebhookUrl('workflow-id', 'trigger-id');
// https://<project>.supabase.co/functions/v1/webhook/workflow-id/trigger-id
```

Test webhooks:

```bash
curl -X POST https://<project>.supabase.co/functions/v1/webhook/<workflow-id>/<trigger-id> \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your-secret" \
  -d '{"key": "value"}'
```

## Error Handling

### Retry Configuration

```typescript
{
  retryConfig: {
    maxAttempts: 3,
    backoffType: 'exponential', // 'fixed' | 'exponential' | 'linear'
    initialDelay: 1000, // milliseconds
    maxDelay: 30000, // optional
  },
}
```

### Error Logs

```typescript
const execution = await getExecution('execution-id');

if (execution.error) {
  console.error('Workflow failed:', execution.error.message);
  console.error('Node:', execution.error.node_id);
  console.error('Details:', execution.error.details);
}
```

## Queue Management

### Get Queue Stats

```typescript
const queue = getQueue();
const stats = await queue.getStats();

console.log(stats);
// { queued: 10, processing: 2, completed: 100, failed: 1 }
```

### Retry Failed Items

```typescript
// Retry specific item
await queue.retryFailed('queue-item-id');

// Retry all failed
await queue.retryFailed();
```

### Dead Letter Queue

```typescript
// Get failed items
const failed = await getDeadLetterItems('org-id');

// Restore and retry
await restoreFromDeadLetterQueue('dead-letter-id');
```

## Validation

### Validate Workflow

```typescript
import { validateWorkflow } from '@/lib/workflows';

const validation = validateWorkflow(workflow);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}
```

### Test Workflow

```typescript
import { testWorkflow } from '@/lib/workflows';

const result = await testWorkflow(workflow);

console.log('Execution plan:', result.executionPlan);
console.log('Valid:', result.valid);
```

## Creating Custom Actions

```typescript
import { registerAction } from '@/lib/workflows/actions';

registerAction('my_module:custom_action', {
  execute: async (config, execution, context) => {
    try {
      // Your logic here
      const result = await doSomething(config, context);

      return {
        success: true,
        data: { result },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        should_continue: false,
      };
    }
  },

  validate: (config) => {
    const errors = [];

    if (!config.requiredField) {
      errors.push('requiredField is missing');
    }

    return { valid: errors.length === 0, errors };
  },
});
```

## Best Practices

1. **Always queue workflows** for async execution
2. **Use retry configs** for external API calls
3. **Add timeouts** to HTTP requests
4. **Log execution data** for debugging
5. **Test workflows** before activating
6. **Use conditions** to avoid unnecessary actions
7. **Secure webhooks** with secrets
8. **Monitor queue stats** for performance
9. **Review dead letter queue** regularly
10. **Document complex workflows** with descriptions

## Troubleshooting

### Workflow not executing?
- Check status is `active`
- Verify triggers are enabled
- Check queue is processing
- Review execution logs

### Action failing?
- Check action config
- Verify API credentials
- Check context variables
- Review error logs

### Performance issues?
- Monitor queue stats
- Check for long-running actions
- Consider parallel execution
- Optimize database queries

## Environment Variables

```bash
# Supabase
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Service Role (for Edge Functions)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Webhook Secrets (optional)
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing

```typescript
// Test workflow with sample data
await testWorkflow('workflow-id', {
  contact: {
    email: 'test@example.com',
    first_name: 'Test',
  },
});

// View execution logs
const executions = await getWorkflowExecutions('workflow-id', 1);
console.log(executions[0].execution_log);
```

## Resources

- **Full Documentation**: `WORKFLOW_SYSTEM.md`
- **Implementation Report**: `WORKFLOW_IMPLEMENTATION_REPORT.md`
- **Examples**: `src/lib/workflows/examples.ts`
- **Tests**: `src/lib/workflows/__tests__/`

## Support

For questions or issues:
1. Check `WORKFLOW_SYSTEM.md` for detailed docs
2. Review `examples.ts` for integration patterns
3. Run tests to verify functionality
4. Check execution logs for errors

---

**Last Updated**: 2026-01-26
**Version**: 1.0.0
**Status**: Production Ready ✅
