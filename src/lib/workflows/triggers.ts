/**
 * Trigger System for Workflows
 * Handles trigger detection, webhook management, and event listening
 */

import type { WorkflowTrigger, TriggerType, WebhookEvent } from './types';
import { supabase } from '../supabase';
import { executeWorkflow } from './executor';

/**
 * Manually trigger a workflow execution
 */
export async function triggerManualExecution(workflowId: string): Promise<any> {
  // Fetch the workflow
  const { data: workflow, error } = await (supabase
    .from('workflows') as any)
    .select('*')
    .eq('id', workflowId)
    .single();

  if (error) throw new Error(`Failed to fetch workflow: ${error.message}`);
  if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
  if (workflow.status !== 'active') throw new Error('Workflow is not active');

  // Execute with manual trigger context
  const execution = await executeWorkflow(workflow, {
    event_type: 'manual',
    triggered_by: 'user',
    triggered_at: new Date().toISOString(),
  });

  return execution;
}

/**
 * Initialize triggers for all active workflows in an organization
 */
export async function initializeOrganizationTriggers(
  organizationId: string,
  triggerManager: TriggerManager
): Promise<void> {
  const { data: workflows, error } = await (supabase
    .from('workflows') as any)
    .select('id, trigger_definitions, status')
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (error) {
    console.error('[TriggerManager] Failed to fetch active workflows:', error.message);
    return;
  }

  if (!workflows) return;

  for (const workflow of workflows) {
    const triggers = (workflow.trigger_definitions || []) as WorkflowTrigger[];
    await triggerManager.initializeTriggers(workflow.id, triggers);
  }
}

/**
 * Trigger Manager Class
 */
export class TriggerManager {
  private listeners: Map<string, () => void> = new Map();

  /**
   * Initialize all triggers for a workflow
   */
  async initializeTriggers(workflowId: string, triggers: WorkflowTrigger[]): Promise<void> {
    for (const trigger of triggers) {
      if (!trigger.enabled) continue;

      switch (trigger.type) {
        case 'webhook:incoming':
          // Webhooks are handled by Edge Functions
          break;
        case 'schedule:cron':
          await this.setupScheduledTrigger(workflowId, trigger);
          break;
        case 'crm:contact_created':
        case 'crm:contact_updated':
        case 'crm:deal_stage_changed':
          await this.setupDatabaseTrigger(workflowId, trigger);
          break;
        case 'form:submission':
          await this.setupFormTrigger(workflowId, trigger);
          break;
      }
    }
  }

  /**
   * Remove all triggers for a workflow
   */
  async removeTriggers(workflowId: string, triggers: WorkflowTrigger[]): Promise<void> {
    for (const trigger of triggers) {
      const listenerKey = `${workflowId}-${trigger.id}`;
      const listener = this.listeners.get(listenerKey);

      if (listener) {
        listener();
        this.listeners.delete(listenerKey);
      }
    }
  }

  /**
   * Setup a scheduled (cron) trigger
   */
  private async setupScheduledTrigger(workflowId: string, trigger: WorkflowTrigger): Promise<void> {
    // In a real implementation, this would:
    // 1. Store the schedule in a scheduled_jobs table
    // 2. Have a background worker check and execute due jobs
    // 3. Or use an external service like cron-job.org

    const config = trigger.config as any;

    await (supabase.from('scheduled_triggers') as any).insert({
      workflow_id: workflowId,
      trigger_id: trigger.id,
      cron_expression: config.cron,
      timezone: config.timezone || 'UTC',
      next_run: this.calculateNextRun(config.cron, config.timezone || 'UTC'),
    });
  }

  /**
   * Setup a database change trigger using Supabase Realtime
   */
  private async setupDatabaseTrigger(workflowId: string, trigger: WorkflowTrigger): Promise<void> {
    const config = trigger.config as any;

    // Subscribe to database changes
    const channel = supabase
      .channel(`workflow-${workflowId}-${trigger.id}`)
      .on(
        'postgres_changes' as any,
        {
          event: this.getPostgresEvent(trigger.type),
          schema: 'public',
          table: this.getTableName(trigger.type),
          filter: config.filters ? this.buildFilter(config.filters) : undefined,
        },
        async (payload: any) => {
          await this.handleDatabaseEvent(workflowId, trigger, payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[TriggerManager] Subscribed to ${trigger.type} for workflow ${workflowId}`);
        }
      });

    // Store unsubscribe function
    this.listeners.set(`${workflowId}-${trigger.id}`, () => {
      supabase.removeChannel(channel);
    });
  }

  /**
   * Setup a form submission trigger
   */
  private async setupFormTrigger(_workflowId: string, trigger: WorkflowTrigger): Promise<void> {
    const config = trigger.config as any;

    // Forms would typically use webhooks or database triggers
    // This is a placeholder for form-specific logic
    console.log(`[TriggerManager] Setup form trigger for form ${config.form_id}`);
  }

  /**
   * Handle a database event
   */
  private async handleDatabaseEvent(
    workflowId: string,
    trigger: WorkflowTrigger,
    payload: any
  ): Promise<void> {
    // Fetch workflow
    const { data: workflow } = await (supabase
      .from('workflows') as any)
      .select('*')
      .eq('id', workflowId)
      .single();

    if (!workflow || workflow.status !== 'active') {
      return;
    }

    // Execute workflow with event data
    await executeWorkflow(workflow, {
      event_type: trigger.type,
      event_data: payload,
      record: payload.new || payload.old,
    });
  }

  /**
   * Map trigger type to PostgreSQL event type
   */
  private getPostgresEvent(triggerType: TriggerType): 'INSERT' | 'UPDATE' | 'DELETE' {
    if (triggerType.includes('created')) return 'INSERT';
    if (triggerType.includes('updated')) return 'UPDATE';
    if (triggerType.includes('deleted')) return 'DELETE';
    return 'INSERT';
  }

  /**
   * Map trigger type to table name
   */
  private getTableName(triggerType: TriggerType): string {
    if (triggerType.startsWith('crm:')) {
      if (triggerType.includes('deal')) return 'deals';
      return 'contacts';
    }
    return 'unknown';
  }

  /**
   * Build Supabase Realtime filter from config
   */
  private buildFilter(filters: Record<string, any>): string {
    const conditions = Object.entries(filters).map(
      ([key, value]) => `${key}=eq.${value}`
    );
    return conditions.join(',');
  }

  /**
   * Calculate next run time for cron expression
   * This is a simplified version - use a proper cron library in production
   */
  private calculateNextRun(_cron: string, _timezone: string): Date {
    // Simplified implementation
    // In production, use libraries like 'cron' or 'node-cron'
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now;
  }
}

/**
 * Generate a unique webhook URL for a workflow
 */
export function generateWebhookUrl(workflowId: string, triggerId: string): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${baseUrl}/functions/v1/webhook/${workflowId}/${triggerId}`;
}

/**
 * Validate a webhook request
 */
export async function validateWebhookRequest(
  workflowId: string,
  triggerId: string,
  _payload: any,
  headers: Headers
): Promise<boolean> {
  // Fetch trigger config
  const { data: workflow } = await (supabase
    .from('workflows') as any)
    .select('trigger_definitions')
    .eq('id', workflowId)
    .single();

  if (!workflow) return false;

  const trigger = workflow.trigger_definitions.find((t: any) => t.id === triggerId);
  if (!trigger || trigger.type !== 'webhook:incoming') return false;

  const config = trigger.config;

  // Verify secret if configured
  if (config.secret) {
    const providedSecret = headers.get('x-webhook-secret');
    if (providedSecret !== config.secret) {
      return false;
    }
  }

  // Verify method if configured
  if (config.method) {
    const method = headers.get('x-webhook-method') || 'POST';
    if (method !== config.method) {
      return false;
    }
  }

  return true;
}

/**
 * Store a webhook event
 */
export async function storeWebhookEvent(
  workflowId: string,
  triggerId: string,
  organizationId: string,
  payload: any,
  headers: Record<string, string>
): Promise<WebhookEvent> {
  const { data, error } = await (supabase
    .from('webhook_events') as any)
    .insert({
      workflow_id: workflowId,
      trigger_id: triggerId,
      organization_id: organizationId,
      payload,
      headers,
      received_at: new Date().toISOString(),
      processed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Process a webhook event and trigger workflow execution
 */
export async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  // Fetch workflow
  const { data: workflow } = await (supabase
    .from('workflows') as any)
    .select('*')
    .eq('id', event.workflow_id)
    .single();

  if (!workflow || workflow.status !== 'active') {
    return;
  }

  // Execute workflow
  await executeWorkflow(workflow, {
    event_type: 'webhook',
    event_data: event.payload,
    webhook_event_id: event.id,
  });

  // Mark as processed
  await (supabase
    .from('webhook_events') as any)
    .update({ processed: true })
    .eq('id', event.id);
}

/**
 * Check if a trigger should fire based on filters
 */
export function checkTriggerFilters(
  trigger: WorkflowTrigger,
  data: Record<string, any>
): boolean {
  const config = trigger.config as any;
  if (!config.filters) return true;

  return Object.entries(config.filters).every(([key, value]) => {
    const actualValue = data[key];
    return actualValue === value;
  });
}

// ============================================================================
// TRIGGER VALIDATION
// ============================================================================

/**
 * Validate a trigger configuration
 */
export function validateTrigger(trigger: WorkflowTrigger): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  switch (trigger.type) {
    case 'webhook:incoming':
      const webhookConfig = trigger.config as any;
      if (webhookConfig.secret && typeof webhookConfig.secret !== 'string') {
        errors.push('Webhook secret must be a string');
      }
      break;

    case 'schedule:cron':
      const scheduleConfig = trigger.config as any;
      if (!scheduleConfig.cron || typeof scheduleConfig.cron !== 'string') {
        errors.push('Cron expression is required');
      }
      break;

    case 'crm:contact_created':
    case 'crm:contact_updated':
    case 'form:submission':
      // These are generally valid without additional config
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
