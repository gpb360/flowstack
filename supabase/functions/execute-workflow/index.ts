/**
 * Supabase Edge Function: Execute Workflow
 *
 * This function handles workflow execution triggered by webhooks or events.
 * It's authenticated with service role key for system-level operations.
 *
 * POST /functions/v1/execute-workflow
 *
 * Headers:
 *   Authorization: Bearer <service_role_key>
 *
 * Body:
 *   {
 *     workflow_id: string,
 *     trigger_data: Record<string, any>,
 *     async?: boolean // Whether to queue for async execution (default: true)
 *   }
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify service role authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing or invalid authorization header');
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const token = authHeader.replace('Bearer ', '');

    if (token !== serviceRoleKey) {
      throw new Error('Unauthorized: Invalid service role key');
    }

    // Parse request body
    const { workflow_id, trigger_data, async = true } = await req.json();

    if (!workflow_id) {
      throw new Error('Missing required field: workflow_id');
    }

    if (!trigger_data || typeof trigger_data !== 'object') {
      throw new Error('Missing or invalid field: trigger_data');
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey!);

    // Fetch workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflow_id)
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Workflow not found: ${workflow_id}`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active (status: ${workflow.status})`);
    }

    if (async) {
      // Add to queue for async execution
      const { data: queueItem, error: queueError } = await supabase
        .from('workflow_queue')
        .insert({
          workflow_id: workflow.id,
          organization_id: workflow.organization_id,
          priority: 2, // normal priority
          scheduled_at: new Date().toISOString(),
          status: 'queued',
          attempt_count: 0,
          max_attempts: 3,
        })
        .select()
        .single();

      if (queueError) throw queueError;

      // Store trigger data
      await supabase.from('workflow_queue_data').insert({
        queue_item_id: queueItem.id,
        trigger_data: trigger_data,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Workflow queued for execution',
          queue_item_id: queueItem.id,
          workflow_id: workflow.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 202,
        }
      );

    } else {
      // Execute synchronously (not recommended for complex workflows)
      // Import the executor logic
      // Note: This would require the executor to be ported to run in Edge Function environment
      // For now, we'll create a pending execution record

      const { data: execution, error: executionError } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflow.id,
          organization_id: workflow.organization_id,
          status: 'pending',
          trigger_data: trigger_data,
          execution_log: [],
        })
        .select()
        .single();

      if (executionError) throw executionError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Workflow execution created',
          execution_id: execution.id,
          workflow_id: workflow.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        }
      );
    }

  } catch (error) {
    console.error('[execute-workflow] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 400,
      }
    );
  }
});
