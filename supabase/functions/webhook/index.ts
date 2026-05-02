/**
 * Supabase Edge Function: Webhook Handler
 *
 * This function receives webhook requests and triggers workflows.
 * It validates webhooks and stores events for processing.
 *
 * POST /functions/v1/webhook/:workflowId/:triggerId
 *
 * The webhook URL format is:
 * https://<project-url>.supabase.co/functions/v1/webhook/{workflow_id}/{trigger_id}
 *
 * Headers:
 *   x-webhook-secret: (optional) Secret for verification
 *   Content-Type: application/json
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Extract workflow_id and trigger_id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Expected format: /webhook/:workflowId/:triggerId
    if (pathParts.length < 3 || pathParts[0] !== 'webhook') {
      throw new Error('Invalid webhook URL format');
    }

    const workflowId = pathParts[1];
    const triggerId = pathParts[2];

    // Get webhook secret from header
    const webhookSecret = req.headers.get('x-webhook-secret');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch workflow and trigger
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, organization_id, status, trigger_definitions')
      .eq('id', workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status !== 'active') {
      throw new Error('Workflow is not active');
    }

    // Find the trigger
    const trigger = workflow.trigger_definitions.find((t: any) => t.id === triggerId);
    if (!trigger || trigger.type !== 'webhook:incoming') {
      throw new Error('Trigger not found or not a webhook trigger');
    }

    // Verify webhook secret if configured
    const triggerConfig = trigger.config || {};
    if (triggerConfig.secret && triggerConfig.secret !== webhookSecret) {
      throw new Error('Invalid webhook secret');
    }

    // Parse request body
    let payload: Record<string, any>;
    try {
      payload = await req.json();
    } catch (error) {
      throw new Error('Invalid JSON payload');
    }

    // Store webhook event
    const { data: webhookEvent, error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        workflow_id: workflowId,
        trigger_id: triggerId,
        organization_id: workflow.organization_id,
        payload: payload,
        headers: Object.fromEntries(req.headers.entries()),
        received_at: new Date().toISOString(),
        processed: false,
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Trigger workflow execution via the execute-workflow function
    const executeUrl = `${supabaseUrl}/functions/v1/execute-workflow`;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(executeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        trigger_data: {
          event_type: 'webhook',
          event_data: payload,
          webhook_event_id: webhookEvent.id,
          headers: Object.fromEntries(req.headers.entries()),
        },
        async: true,
      }),
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received and workflow triggered',
        webhook_event_id: webhookEvent.id,
        workflow_id: workflowId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[webhook] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.message.includes('not found') ? 404 :
                error instanceof Error && error.message.includes('secret') ? 401 : 400,
      }
    );
  }
});
