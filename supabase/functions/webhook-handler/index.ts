// Webhook Handler Edge Function
// Receives webhooks from external integrations and routes them appropriately

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, stripe-signature, x-slack-signature, x-slack-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Integration-specific webhook handlers
const webhookHandlers: Record<string, (payload: any, headers: Record<string, string>) => Promise<{ eventType: string; data: any }>> = {
  stripe: async (payload, headers) => {
    // Stripe webhooks
    const eventType = payload.type;
    const data = payload.data.object;

    return {
      eventType: `stripe.${eventType}`,
      data,
    };
  },

  slack: async (payload, headers) => {
    // Slack events and interactions
    if (payload.type === 'url_verification') {
      return {
        eventType: 'slack.verification',
        data: payload,
      };
    }

    if (payload.type === 'event_callback') {
      const event = payload.event;
      return {
        eventType: `slack.${event.type}`,
        data: event,
      };
    }

    return {
      eventType: 'slack.unknown',
      data: payload,
    };
  },

  google: async (payload, headers) => {
    // Google Workspace notifications
    return {
      eventType: `google.${payload.kind || 'notification'}`,
      data: payload,
    };
  },

  paypal: async (payload, headers) => {
    // PayPal webhooks
    const eventType = payload.event_type;
    return {
      eventType: `paypal.${eventType}`,
      data: payload.resource,
    };
  },

  hubspot: async (payload, headers) => {
    // HubSpot webhooks
    return {
      eventType: `hubspot.${payload.subscriptionType || 'event'}`,
      data: payload,
    };
  },

  shopify: async (payload, headers) => {
    // Shopify webhooks
    const eventType = headers['x-shopify-topic'] || 'unknown';
    return {
      eventType: `shopify.${eventType}`,
      data: payload,
    };
  },

  zoom: async (payload, headers) => {
    // Zoom webhooks
    const eventType = payload.event;
    return {
      eventType: `zoom.${eventType}`,
      data: payload,
    };
  },

  calendly: async (payload, headers) => {
    // Calendly webhooks
    const eventType = payload.event;
    return {
      eventType: `calendly.${eventType}`,
      data: payload,
    };
  },

  sendgrid: async (payload, headers) => {
    // SendGrid events
    return {
      eventType: `sendgrid.${payload[0]?.event || 'event'}`,
      data: payload,
    };
  },

  mailgun: async (payload, headers) => {
    // Mailgun events
    const signatureData = payload.signature || {};
    const eventData = payload['event-data'] || payload;

    return {
      eventType: `mailgun.${signatureData.event || 'event'}`,
      data: eventData,
    };
  },

  zapier: async (payload, headers) => {
    // Zapier webhooks
    return {
      eventType: 'zapier.webhook',
      data: payload,
    };
  },
};

// Verify webhook signatures
async function verifyWebhookSignature(
  integrationId: string,
  payload: string,
  signature: string,
  timestamp?: string,
  headers?: Record<string, string>
): Promise<boolean> {
  // Get webhook secret from database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { data: webhooks } = await supabase
    .from('integration_webhooks')
    .select('secret, integration_id')
    .eq('integration_id', integrationId)
    .eq('active', true);

  if (!webhooks || webhooks.length === 0) {
    return false;
  }

  // Verify based on integration
  switch (integrationId) {
    case 'stripe':
      // Stripe signature verification
      const crypto = require('crypto');
      const [timestampStr, signatureElements] = signature.split(',');
      const signaturePayload = `${timestampStr}.${payload}`;

      for (const webhook of webhooks) {
        if (!webhook.secret) continue;

        const expectedSignature = crypto
          .createHmac('sha256', webhook.secret)
          .update(signaturePayload)
          .digest('hex');

        const receivedSignatures = signatureElements
          .split(',')
          .filter((s: string) => s.startsWith('v1='))
          .map((s: string) => s.split('=')[1]);

        if (receivedSignatures.some((sig: string) => sig === expectedSignature)) {
          return true;
        }
      }
      return false;

    case 'slack':
      // Slack signature verification
      if (!timestamp) return false;

      // Check timestamp is within 5 minutes
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - parseInt(timestamp)) > 300) {
        return false;
      }

      const baseString = `v0:${timestamp}:${payload}`;
      for (const webhook of webhooks) {
        if (!webhook.secret) continue;

        const expectedSignature = 'v0=' + crypto
          .createHmac('sha256', webhook.secret)
          .update(baseString)
          .digest('hex');

        // Use timing-safe comparison
        const textEncoder = new TextEncoder();
        const signatureBuffer = textEncoder.encode(signature);
        const expectedBuffer = textEncoder.encode(expectedSignature);

        if (signatureBuffer.length === expectedBuffer.length &&
            crypto.subtle.timingSafeEqual(signatureBuffer, expectedBuffer)) {
          return true;
        }
      }
      return false;

    default:
      // Generic HMAC verification
      for (const webhook of webhooks) {
        if (!webhook.secret) continue;

        const expectedSignature = crypto
          .createHmac('sha256', webhook.secret)
          .update(payload)
          .digest('hex');

        if (signature === expectedSignature) {
          return true;
        }
      }
      return false;
  }
}

// Process webhook and trigger workflows
async function processWebhook(
  integrationId: string,
  eventType: string,
  payload: any,
  headers: Record<string, string>
): Promise<void> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Log the webhook event
  const { data: webhookEvent } = await supabase
    .from('integration_webhook_events')
    .insert({
      webhook_id: null, // Will be updated after finding the webhook
      event_type: eventType,
      payload,
      headers,
      status: 'received',
      received_at: new Date().toISOString(),
    })
    .select()
    .single();

  // Find matching webhook subscription
  const { data: webhooks } = await supabase
    .from('integration_webhooks')
    .select('id, connection_id, organization_id')
    .eq('integration_id', integrationId)
    .eq('event_type', eventType)
    .eq('active', true);

  if (!webhooks || webhooks.length === 0) {
    // No webhook subscription found, but still log the event
    await supabase
      .from('integration_webhook_events')
      .update({ status: 'processed' })
      .eq('id', webhookEvent.id);
    return;
  }

  // Trigger workflows for each matching webhook
  for (const webhook of webhooks) {
    // Check if there are any workflows listening for this trigger
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, trigger_definitions')
      .eq('organization_id', webhook.organization_id)
      .eq('status', 'active');

    if (workflows) {
      for (const workflow of workflows) {
        const triggers = workflow.trigger_definitions as any[];
        const matchingTrigger = triggers?.find(
          (t) => t.integration === integrationId && t.event === eventType
        );

        if (matchingTrigger) {
          // Create workflow execution
          await supabase
            .from('workflow_executions')
            .insert({
              workflow_id: workflow.id,
              organization_id: webhook.organization_id,
              status: 'pending',
              trigger_data: payload,
              execution_log: null,
              started_at: new Date().toISOString(),
            });

          // Update webhook event with workflow execution reference
          await supabase
            .from('integration_webhook_events')
            .update({
              webhook_id: webhook.id,
              connection_id: webhook.connection_id,
              status: 'processed',
            })
            .eq('id', webhookEvent.id);
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Extract integration from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const integrationId = pathParts[pathParts.length - 1];

    // Parse request body
    const requestBody = await req.text();
    let payload: any;

    try {
      payload = JSON.parse(requestBody);
    } catch {
      // Some webhooks send form-encoded data
      const params = new URLSearchParams(requestBody);
      payload = Object.fromEntries(params);
    }

    // Get headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    // Get signature
    const signature = headers['stripe-signature'] ||
                      headers['x-webhook-signature'] ||
                      headers['x-slack-signature'] ||
                      headers['webhook-signature'] ||
                      '';

    const timestamp = headers['x-slack-timestamp'];

    // Verify signature (if available)
    if (signature) {
      const isValid = await verifyWebhookSignature(
        integrationId,
        requestBody,
        signature,
        timestamp,
        headers
      );

      if (!isValid) {
        return new Response('Invalid signature', {
          status: 401,
          headers: corsHeaders,
        });
      }
    }

    // Process webhook with integration-specific handler
    const handler = webhookHandlers[integrationId];
    if (!handler) {
      return new Response('Unknown integration', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { eventType, data } = await handler(payload, headers);

    // Process webhook and trigger workflows
    await processWebhook(integrationId, eventType, data, headers);

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
