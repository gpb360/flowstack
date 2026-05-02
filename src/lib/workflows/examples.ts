/**
 * Workflow Integration Examples
 *
 * This file demonstrates how to integrate the workflow system
 * with existing FlowStack modules (CRM, Marketing, Builder, etc.)
 */

import {
  createWorkflow,
  activateWorkflow,
  triggerWorkflow,
  getWorkflowExecutions,
  generateWebhookUrl,
} from './index';
import type { Workflow } from './types';

// ============================================================================
// CRM INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example 1: Auto-assign new leads to sales team
 *
 * When a new contact is created via website form:
 * 1. Check lead score
 * 2. If high value, assign to senior sales rep
 * 3. If medium value, assign to junior sales rep
 * 4. Send notification email
 * 5. Add to "New Leads" sequence
 */
export async function setupLeadAssignmentWorkflow(organizationId: string) {
  const workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'> = {
    name: 'Auto-Assign New Leads',
    description: 'Automatically assign new leads based on lead score',
    status: 'active',
    trigger_definitions: [
      {
        id: 'trigger-1',
        type: 'crm:contact_created',
        config: {
          filters: { source: 'website_form' },
        },
        enabled: true,
      },
    ],
    nodes: [
      // Trigger node
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 100 },
        data: {
          label: 'New Lead from Website',
          trigger: {
            id: 'trigger-1',
            type: 'crm:contact_created',
            config: {},
            enabled: true,
          },
        },
      },

      // Condition: Check lead score
      {
        id: 'check-score',
        type: 'condition',
        position: { x: 250, y: 100 },
        data: {
          label: 'Lead Score >= 80?',
          conditions: {
            operator: 'and',
            conditions: [
              { field: 'contact.lead_score', operator: 'gte', value: 80 },
            ],
          },
        },
      },

      // High value path - Assign to senior rep
      {
        id: 'assign-senior',
        type: 'action',
        position: { x: 500, y: 50 },
        data: {
          label: 'Assign to Senior Rep',
          actionType: 'crm:assign_owner',
          config: {
            contact_id: '{{contact.id}}',
            owner_id: 'senior-rep-user-id',
          },
        },
      },

      // Low value path - Assign to junior rep
      {
        id: 'assign-junior',
        type: 'action',
        position: { x: 500, y: 150 },
        data: {
          label: 'Assign to Junior Rep',
          actionType: 'crm:assign_owner',
          config: {
            contact_id: '{{contact.id}}',
            owner_id: 'junior-rep-user-id',
          },
        },
      },

      // Add to sequence
      {
        id: 'add-sequence',
        type: 'action',
        position: { x: 750, y: 100 },
        data: {
          label: 'Add to Welcome Sequence',
          actionType: 'marketing:add_to_sequence',
          config: {
            contact_id: '{{contact.id}}',
            sequence_id: 'new-leads-sequence',
          },
        },
      },

      // Send notification
      {
        id: 'notify-team',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Notify Sales Team',
          actionType: 'communication:send_email',
          config: {
            to: 'sales@company.com',
            subject: 'New Lead Assigned: {{contact.first_name}} {{contact.last_name}}',
            body: `
              A new lead has been assigned to you:

              Name: {{contact.first_name}} {{contact.last_name}}
              Email: {{contact.email}}
              Phone: {{contact.phone}}
              Lead Score: {{contact.lead_score}}
              Source: {{contact.source}}
            `,
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'check-score' },
      { id: 'e2', source: 'check-score', target: 'assign-senior', condition: 'true' },
      { id: 'e3', source: 'check-score', target: 'assign-junior', condition: 'false' },
      { id: 'e4', source: 'assign-senior', target: 'add-sequence' },
      { id: 'e5', source: 'assign-junior', target: 'add-sequence' },
      { id: 'e6', source: 'add-sequence', target: 'notify-team' },
    ],
  };

  const created = await createWorkflow(organizationId, workflow);
  await activateWorkflow(created.id);

  return created;
}

// ============================================================================
// MARKETING INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example 2: Email engagement workflow
 *
 * When a contact clicks a link in an email:
 * 1. Update lead score
 * 2. Check if they should be moved to sales pipeline
 * 3. If yes, create deal and notify sales
 */
export async function setupEmailEngagementWorkflow(organizationId: string) {
  const workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'> = {
    name: 'Email Engagement Tracker',
    description: 'Track email clicks and qualify leads',
    status: 'active',
    trigger_definitions: [
      {
        id: 'trigger-1',
        type: 'marketing:email_clicked',
        config: {
          filters: { link_type: 'product_pricing' },
        },
        enabled: true,
      },
    ],
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 100 },
        data: {
          label: 'Pricing Link Clicked',
          trigger: {
            id: 'trigger-1',
            type: 'marketing:email_clicked',
            config: {},
            enabled: true,
          },
        },
      },
      {
        id: 'update-score',
        type: 'action',
        position: { x: 250, y: 100 },
        data: {
          label: 'Increase Lead Score',
          actionType: 'crm:update_contact',
          config: {
            contact_id: '{{contact.id}}',
            lead_score: '{{contact.lead_score + 20}}',
          },
        },
      },
      {
        id: 'check-qualified',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: {
          label: 'Lead Score >= 100?',
          conditions: {
            operator: 'and',
            conditions: [
              { field: 'contact.lead_score', operator: 'gte', value: 100 },
            ],
          },
        },
      },
      {
        id: 'create-deal',
        type: 'action',
        position: { x: 750, y: 50 },
        data: {
          label: 'Create Deal',
          actionType: 'crm:create_deal',
          config: {
            contact_id: '{{contact.id}}',
            deal_name: '{{contact.company_name}} - Opportunity',
            value: 10000,
            stage: 'qualification',
          },
        },
      },
      {
        id: 'notify-sales',
        type: 'action',
        position: { x: 1000, y: 50 },
        data: {
          label: 'Notify Sales Rep',
          actionType: 'communication:send_email',
          config: {
            to: '{{contact.owner_id}}',
            subject: 'Qualified Lead Ready: {{contact.first_name}} {{contact.last_name}}',
            body: 'Contact clicked pricing link. Lead score: {{contact.lead_score}}',
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'update-score' },
      { id: 'e2', source: 'update-score', target: 'check-qualified' },
      { id: 'e3', source: 'check-qualified', target: 'create-deal', condition: 'true' },
      { id: 'e4', source: 'create-deal', target: 'notify-sales' },
    ],
  };

  const created = await createWorkflow(organizationId, workflow);
  await activateWorkflow(created.id);

  return created;
}

// ============================================================================
// BUILDER INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example 3: Form submission to CRM
 *
 * When a form is submitted on a built page:
 * 1. Create or update contact
 * 2. Send confirmation email
 * 3. Notify team
 * 4. Add to nurture sequence
 */
export async function setupFormSubmissionWorkflow(organizationId: string, formId: string) {
  const workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'> = {
    name: `Process ${formId} Submissions`,
    description: 'Handle form submissions and add to CRM',
    status: 'active',
    trigger_definitions: [
      {
        id: 'trigger-1',
        type: 'form:submission',
        config: {
          form_id: formId,
        } as any,
        enabled: true,
      },
    ],
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 100 },
        data: {
          label: 'Form Submitted',
          trigger: {
            id: 'trigger-1',
            type: 'form:submission',
            config: {},
            enabled: true,
          },
        },
      },
      {
        id: 'create-contact',
        type: 'action',
        position: { x: 250, y: 100 },
        data: {
          label: 'Create Contact',
          actionType: 'crm:create_contact',
          config: {
            first_name: '{{form_data.first_name}}',
            last_name: '{{form_data.last_name}}',
            email: '{{form_data.email}}',
            phone: '{{form_data.phone}}',
            source: `${formId}_form`,
          },
        },
      },
      {
        id: 'send-confirm',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Send Confirmation',
          actionType: 'communication:send_email',
          config: {
            to: '{{form_data.email}}',
            subject: 'Thanks for contacting us!',
            template: 'form-submission-confirmation',
          },
        },
      },
      {
        id: 'add-sequence',
        type: 'action',
        position: { x: 750, y: 100 },
        data: {
          label: 'Add to Nurture',
          actionType: 'marketing:add_to_sequence',
          config: {
            contact_id: '{{contact.id}}',
            sequence_id: 'form-submission-nurture',
          },
        },
      },
      {
        id: 'notify-team',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Slack Notification',
          actionType: 'http:request',
          config: {
            url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: {
              text: 'New form submission from {{form_data.first_name}} {{form_data.last_name}}',
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `*New Form Submission*\n\n*Name:* {{form_data.first_name}} {{form_data.last_name}}\n*Email:* {{form_data.email}}\n*Form:* ${formId}`,
                  },
                },
              ],
            },
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'create-contact' },
      { id: 'e2', source: 'create-contact', target: 'send-confirm' },
      { id: 'e3', source: 'send-confirm', target: 'add-sequence' },
      { id: 'e4', source: 'add-sequence', target: 'notify-team' },
    ],
  };

  const created = await createWorkflow(organizationId, workflow);
  await activateWorkflow(created.id);

  return created;
}

// ============================================================================
// WEBHOOK INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example 4: Stripe payment integration
 *
 * When a payment is received via Stripe webhook:
 * 1. Verify payment
 * 2. Update contact status
 * 3. Send receipt
 * 4. Grant access (if applicable)
 */
export async function setupStripePaymentWorkflow(organizationId: string) {
  const workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'> = {
    name: 'Process Stripe Payments',
    description: 'Handle Stripe payment webhooks',
    status: 'active',
    trigger_definitions: [
      {
        id: 'trigger-1',
        type: 'webhook:incoming',
        config: {
          secret: (globalThis as any).process?.env?.VITE_STRIPE_WEBHOOK_SECRET || 'default-secret',
        },
        enabled: true,
      },
    ],
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 100 },
        data: {
          label: 'Stripe Webhook',
          trigger: {
            id: 'trigger-1',
            type: 'webhook:incoming',
            config: {},
            enabled: true,
          },
        },
      },
      {
        id: 'verify-payment',
        type: 'action',
        position: { x: 250, y: 100 },
        data: {
          label: 'Verify Payment',
          actionType: 'http:request',
          config: {
            url: `https://api.stripe.com/v1/charges/{{payload.data.object.charge}}`,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${(globalThis as any).process?.env?.VITE_STRIPE_SECRET_KEY || 'default-key'}`,
            },
          },
        },
      },
      {
        id: 'update-contact',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Mark as Paid',
          actionType: 'crm:update_contact',
          config: {
            contact_id: '{{payload.data.object.metadata.contact_id}}',
            payment_status: 'paid',
            customer_type: 'paid',
          },
        },
      },
      {
        id: 'send-receipt',
        type: 'action',
        position: { x: 750, y: 100 },
        data: {
          label: 'Send Receipt',
          actionType: 'communication:send_email',
          config: {
            to: '{{payload.data.object.receipt_email}}',
            subject: 'Payment Receipt - Order #{{payload.data.object.metadata.order_id}}',
            template: 'payment-receipt',
          },
        },
      },
      {
        id: 'grant-access',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: {
          label: 'Grant Premium Access',
          actionType: 'marketing:add_tag',
          config: {
            contact_id: '{{payload.data.object.metadata.contact_id}}',
            tag: 'premium_member',
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'verify-payment' },
      { id: 'e2', source: 'verify-payment', target: 'update-contact' },
      { id: 'e3', source: 'update-contact', target: 'send-receipt' },
      { id: 'e4', source: 'send-receipt', target: 'grant-access' },
    ],
  };

  const created = await createWorkflow(organizationId, workflow);
  await activateWorkflow(created.id);

  // Generate and return webhook URL
  const webhookUrl = generateWebhookUrl(created.id, 'trigger-1');

  return { workflow: created, webhookUrl };
}

// ============================================================================
// SCHEDULED WORKFLOW EXAMPLES
// ============================================================================

/**
 * Example 5: Daily summary report
 *
 * Every day at 9 AM:
 * 1. Generate activity report
 * 2. Send to team
 */
export async function setupDailyReportWorkflow(organizationId: string) {
  const workflow: Omit<Workflow, 'id' | 'organization_id' | 'created_at' | 'updated_at'> = {
    name: 'Daily Activity Report',
    description: 'Send daily summary at 9 AM',
    status: 'active',
    trigger_definitions: [
      {
        id: 'trigger-1',
        type: 'schedule:cron',
        config: {
          cron: '0 9 * * *', // 9 AM daily
          timezone: 'UTC',
        },
        enabled: true,
      },
    ],
    nodes: [
      {
        id: 'trigger',
        type: 'trigger',
        position: { x: 0, y: 100 },
        data: {
          label: '9 AM Daily',
          trigger: {
            id: 'trigger-1',
            type: 'schedule:cron',
            config: {},
            enabled: true,
          },
        },
      },
      {
        id: 'generate-report',
        type: 'action',
        position: { x: 250, y: 100 },
        data: {
          label: 'Generate Report',
          actionType: 'agent:analytics_report',
          config: {
            report_type: 'daily_summary',
            date: '{{today}}',
            include_metrics: ['new_contacts', 'deals_closed', 'revenue'],
          },
        },
      },
      {
        id: 'send-email',
        type: 'action',
        position: { x: 500, y: 100 },
        data: {
          label: 'Email Report',
          actionType: 'communication:send_email',
          config: {
            to: 'team@company.com',
            subject: 'Daily Report - {{today}}',
            body: '{{report.data}}',
          },
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'generate-report' },
      { id: 'e2', source: 'generate-report', target: 'send-email' },
    ],
  };

  const created = await createWorkflow(organizationId, workflow);
  await activateWorkflow(created.id);

  return created;
}

// ============================================================================
// TESTING EXAMPLES
// ============================================================================

/**
 * Test a workflow with sample data
 */
export async function testWorkflow(workflowId: string, testData: Record<string, any>) {
  console.log(`Testing workflow ${workflowId} with data:`, testData);

  // Trigger workflow with test data
  void triggerWorkflow(workflowId, testData);

  // Wait a bit for execution
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get execution history
  const executions = await getWorkflowExecutions(workflowId, 1);

  if (executions.length > 0) {
    const latest = executions[0];
    console.log('Execution result:', {
      status: latest.status,
      duration: latest.completed_at
        ? new Date(latest.completed_at).getTime() - new Date(latest.started_at).getTime()
        : null,
      log_entries: latest.execution_log.length,
      error: latest.error,
    });

    return latest;
  }

  return null;
}

/**
 * Example: Test the lead assignment workflow
 */
export async function exampleTestLeadAssignment(workflowId: string) {
  // Test high-value lead
  await testWorkflow(workflowId, {
    contact: {
      id: 'test-123',
      first_name: 'John',
      last_name: 'Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      source: 'website_form',
      lead_score: 85, // High value
    },
  });

  // Test low-value lead
  await testWorkflow(workflowId, {
    contact: {
      id: 'test-456',
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      phone: '+0987654321',
      source: 'website_form',
      lead_score: 45, // Low value
    },
  });
}

// ============================================================================
// BATCH WORKFLOW SETUP
// ============================================================================

/**
 * Setup all standard workflows for a new organization
 */
export async function setupOrganizationWorkflows(organizationId: string) {
  const workflows = await Promise.all([
    setupLeadAssignmentWorkflow(organizationId),
    setupEmailEngagementWorkflow(organizationId),
    setupDailyReportWorkflow(organizationId),
  ]);

  console.log(`Set up ${workflows.length} workflows for organization ${organizationId}`);

  return workflows;
}
