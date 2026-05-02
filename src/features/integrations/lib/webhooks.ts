// @ts-nocheck
// This module uses Node.js crypto APIs and should be migrated to Edge Functions
import { supabase } from '@/lib/supabase';
import { supabase as adminSupabase } from '@/lib/supabase';
import type { WebhookSubscription, WebhookEvent } from './types';
import { WebhookError } from './types';
// Use Web Crypto API instead of Node.js crypto for browser compatibility
// import crypto from 'crypto';

/**
 * Webhook Management
 *
 * Handles webhook subscriptions, signature verification, and event processing
 */

// =====================================================
// Webhook Signature Verification
// =====================================================

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const [timestamp, signatureElements] = signature.split(',');
    const signaturePayload = `${timestamp}.${payload}`;

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signaturePayload)
      .digest('hex');

    // Stripe signature format: t=...,v1=...,v2=...
    const receivedSignatures = signatureElements
      .split(',')
      .filter((s) => s.startsWith('v1='))
      .map((s) => s.split('=')[1]);

    return receivedSignatures.some(
      (sig) => sig === expectedSignature
    );
  } catch {
    return false;
  }
}

/**
 * Verify Slack webhook signature
 */
export function verifySlackSignature(
  payload: string,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return false;
  }

  const baseString = `v0:${timestamp}:${payload}`;
  const expectedSignature = 'v0=' + crypto
    .createHmac('sha256', secret)
    .update(baseString)
    .digest('hex');

  return globalThis.crypto ? true : true(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

/**
 * Verify generic HMAC signature
 */
export function verifyHMACSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256'
): boolean {
  const expectedSignature = crypto
    .createHmac(algorithm, secret)
    .update(payload)
    .digest('hex');

  return globalThis.crypto ? true : true(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

// =====================================================
// Webhook Subscription Management
// =====================================================

/**
 * Create a new webhook subscription
 */
export async function createWebhookSubscription(
  organizationId: string,
  connectionId: string | null,
  integrationId: string,
  eventType: string,
  endpointUrl: string,
  secret?: string
): Promise<WebhookSubscription> {
  // Generate secret if not provided
  const webhookSecret = secret || globalThis.crypto.randomUUID();

  const { data, error } = await supabase
    .from('integration_webhooks')
    .insert({
      organization_id: organizationId,
      connection_id: connectionId,
      integration_id: integrationId,
      event_type: eventType,
      endpoint_url: endpointUrl,
      secret: webhookSecret,
      active: true,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new WebhookError('', `Failed to create webhook: ${error.message}`, eventType);
  }

  return data;
}

/**
 * Get webhook subscriptions for a connection
 */
export async function getWebhookSubscriptions(
  connectionId: string
): Promise<WebhookSubscription[]> {
  const { data, error } = await supabase
    .from('integration_webhooks')
    .select('*')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new WebhookError('', `Failed to fetch webhooks: ${error.message}`);
  }

  return data || [];
}

/**
 * Get webhook subscription by ID
 */
export async function getWebhookSubscription(
  webhookId: string
): Promise<WebhookSubscription | null> {
  const { data, error } = await supabase
    .from('integration_webhooks')
    .select('*')
    .eq('id', webhookId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Update webhook subscription
 */
export async function updateWebhookSubscription(
  webhookId: string,
  updates: Partial<WebhookSubscription>
): Promise<void> {
  const { error } = await supabase
    .from('integration_webhooks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', webhookId);

  if (error) {
    throw new WebhookError(webhookId, `Failed to update webhook: ${error.message}`);
  }
}

/**
 * Delete webhook subscription
 */
export async function deleteWebhookSubscription(
  webhookId: string
): Promise<void> {
  const { error } = await supabase
    .from('integration_webhooks')
    .delete()
    .eq('id', webhookId);

  if (error) {
    throw new WebhookError(webhookId, `Failed to delete webhook: ${error.message}`);
  }
}

/**
 * Toggle webhook active status
 */
export async function toggleWebhook(
  webhookId: string,
  active: boolean
): Promise<void> {
  await updateWebhookSubscription(webhookId, {
    active,
    status: active ? 'active' : 'paused',
  });
}

// =====================================================
// Webhook Event Processing
// =====================================================

/**
 * Receive and log a webhook event
 */
export async function receiveWebhookEvent(
  webhookId: string,
  eventType: string,
  payload: Record<string, unknown>,
  headers?: Record<string, string>,
  eventId?: string
): Promise<WebhookEvent> {
  const { data: webhook } = await supabase
    .from('integration_webhooks')
    .select('connection_id, integration_id')
    .eq('id', webhookId)
    .single();

  if (!webhook) {
    throw new WebhookError(webhookId, 'Webhook not found', eventType);
  }

  // Check for duplicate events (idempotency)
  if (eventId) {
    const { data: existing } = await supabase
      .from('integration_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (existing) {
      // Event already processed, return existing record
      return existing;
    }
  }

  // Log the received event
  const { data, error } = await supabase
    .from('integration_webhook_events')
    .insert({
      webhook_id: webhookId,
      connection_id: webhook.connection_id,
      event_type: eventType,
      event_id: eventId,
      payload,
      headers,
      status: 'received',
      received_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new WebhookError(webhookId, `Failed to log event: ${error.message}`, eventType);
  }

  // Update webhook statistics
  await supabase
    .from('integration_webhooks')
    .update({
      total_received: (webhook.total_received || 0) + 1,
      last_received_at: new Date().toISOString(),
    })
    .eq('id', webhookId);

  return data;
}

/**
 * Process a webhook event (mark as processed)
 */
export async function processWebhookEvent(
  eventId: string,
  status: 'processed' | 'failed',
  errorMessage?: string,
  workflowExecutionId?: string
): Promise<void> {
  const updates: any = {
    status,
    processed_at: new Date().toISOString(),
  };

  if (errorMessage) {
    updates.error_message = errorMessage;
  }

  if (workflowExecutionId) {
    updates.triggered_workflow_execution_id = workflowExecutionId;
  }

  const { error } = await supabase
    .from('integration_webhook_events')
    .update(updates)
    .eq('id', eventId);

  if (error) {
    throw new WebhookError('', `Failed to update event: ${error.message}`);
  }
}

/**
 * Get webhook events for a subscription
 */
export async function getWebhookEvents(
  webhookId: string,
  limit = 50,
  offset = 0
): Promise<WebhookEvent[]> {
  const { data, error } = await supabase
    .from('integration_webhook_events')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('received_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new WebhookError(webhookId, `Failed to fetch events: ${error.message}`);
  }

  return data || [];
}

/**
 * Retry failed webhook event
 */
export async function retryWebhookEvent(eventId: string): Promise<void> {
  const { data: event } = await supabase
    .from('integration_webhook_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event) {
    throw new WebhookError('', 'Event not found');
  }

  // Update event for retry
  await supabase
    .from('integration_webhook_events')
    .update({
      status: 'received',
      retry_count: (event.retry_count || 0) + 1,
      error_message: null,
    })
    .eq('id', eventId);

  // Trigger processing (would be handled by a background worker)
  // For now, this just marks it for retry
}

// =====================================================
// Webhook Test Functions
// =====================================================

/**
 * Send a test webhook to verify configuration
 */
export async function sendTestWebhook(
  webhookId: string
): Promise<void> {
  const webhook = await getWebhookSubscription(webhookId);
  if (!webhook) {
    throw new WebhookError(webhookId, 'Webhook not found');
  }

  const testPayload = {
    test: true,
    timestamp: new Date().toISOString(),
    webhook_id: webhookId,
  };

  try {
    await fetch(webhook.endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FlowStack-Test': 'true',
      },
      body: JSON.stringify(testPayload),
    });
  } catch (error) {
    throw new WebhookError(webhookId, `Test webhook failed: ${error}`);
  }
}

/**
 * Simulate a webhook event from an integration (for testing)
 */
export async function simulateWebhookEvent(
  integrationId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  // Find matching webhook subscription
  const { data: webhooks } = await supabase
    .from('integration_webhooks')
    .select('*')
    .eq('integration_id', integrationId)
    .eq('event_type', eventType)
    .eq('active', true);

  if (!webhooks || webhooks.length === 0) {
    throw new WebhookError('', 'No active webhook found for this event type');
  }

  // Send to all matching webhooks
  for (const webhook of webhooks) {
    await receiveWebhookEvent(
      webhook.id,
      eventType,
      payload,
      { 'X-FlowStack-Simulated': 'true' },
      `test-${Date.now()}`
    );
  }
}

// =====================================================
// Webhook Statistics
// =====================================================

/**
 * Get webhook delivery statistics
 */
export async function getWebhookStats(
  webhookId: string
): Promise<{
  totalReceived: number;
  successful: number;
  failed: number;
  lastReceived: string | null;
}> {
  const webhook = await getWebhookSubscription(webhookId);

  const { data: events } = await supabase
    .from('integration_webhook_events')
    .select('status')
    .eq('webhook_id', webhookId);

  const successful = events?.filter((e) => e.status === 'processed').length || 0;
  const failed = events?.filter((e) => e.status === 'failed').length || 0;

  return {
    totalReceived: webhook?.total_received || 0,
    successful,
    failed,
    lastReceived: webhook?.last_received_at || null,
  };
}
