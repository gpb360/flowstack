/**
 * Agent Execute Edge Function
 * Server-side execution for agent actions with proper security and database logging
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get user from auth context
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's organization
    const { data: membership } = await supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!membership) {
      throw new Error('No organization found for user');
    }

    const organizationId = membership.organization_id;

    // Parse request body
    const { agentType, action, params, workflowExecutionId } = await req.json();

    // Validation
    if (!agentType || !action) {
      throw new Error('Missing required fields: agentType, action');
    }

    // Log execution start
    const startedAt = new Date().toISOString();

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('agent_executions')
      .insert({
        organization_id: organizationId,
        agent_id: agentType,
        agent_type: agentType,
        workflow_execution_id: workflowExecutionId,
        status: 'running',
        input: { action, params },
        started_at: startedAt,
      })
      .select()
      .single();

    if (execError) {
      throw new Error(`Failed to create execution record: ${execError.message}`);
    }

    let output: any = null;
    let error: string | null = null;
    let status = 'completed';

    try {
      // Execute agent action
      // In a real implementation, this would:
      // 1. Load the appropriate agent class
      // 2. Execute the action with the provided params
      // 3. Return the result

      // For now, return mock response based on agent type
      output = await executeMockAgentAction(agentType, action, params, organizationId);

    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      status = 'failed';
    }

    // Calculate duration
    const completedAt = new Date().toISOString();
    const duration = new Date(completedAt).getTime() - new Date(startedAt).getTime();

    // Update execution record
    const { error: updateError } = await supabase
      .from('agent_executions')
      .update({
        status,
        output,
        error,
        completed_at: completedAt,
        duration_ms: duration,
      })
      .eq('id', execution.id);

    if (updateError) {
      console.error('Failed to update execution record:', updateError);
    }

    // Return response
    if (error) {
      return new Response(
        JSON.stringify({ error, executionId: execution.id }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: output,
        executionId: execution.id,
        duration,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400,
      }
    );
  }
});

/**
 * Mock agent action executor
 * In production, this would import and use actual agent classes
 */
async function executeMockAgentAction(
  agentType: string,
  action: string,
  params: any,
  organizationId: string
): Promise<any> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock responses based on agent type and action
  switch (agentType) {
    case 'crm':
      return executeMockCRMAction(action, params);

    case 'marketing':
      return executeMockMarketingAction(action, params);

    case 'analytics':
      return executeMockAnalyticsAction(action, params);

    case 'builder':
      return executeMockBuilderAction(action, params);

    case 'workflow':
      return executeMockWorkflowAction(action, params);

    case 'orchestrator':
      return executeMockOrchestratorAction(action, params);

    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }
}

function executeMockCRMAction(action: string, params: any) {
  switch (action) {
    case 'find_contact':
      return {
        contacts: [
          { id: 'contact-1', email: params.email, first_name: 'John', last_name: 'Doe' },
        ],
      };

    case 'create_contact':
      return {
        contact: {
          id: `contact-${Date.now()}`,
          email: params.email,
          first_name: params.first_name,
          last_name: params.last_name,
        },
      };

    case 'score_lead':
      return {
        score: 75,
        tier: 'warm',
        factors: { email_engagement: 8, website_visits: 12 },
      };

    default:
      return { message: `CRM action ${action} executed` };
  }
}

function executeMockMarketingAction(action: string, params: any) {
  switch (action) {
    case 'generate_campaign':
      return {
        campaign: {
          id: `campaign-${Date.now()}`,
          name: params.name,
          status: 'draft',
        },
      };

    case 'optimize_send_time':
      return {
        optimal_time: '10:00 AM',
        timezone: 'America/New_York',
        reasoning: 'Highest engagement rates observed',
      };

    default:
      return { message: `Marketing action ${action} executed` };
  }
}

function executeMockAnalyticsAction(action: string, params: any) {
  switch (action) {
    case 'generate_report':
      return {
        report: {
          id: `report-${Date.now()}`,
          metrics: { revenue: 50000, users: 1200 },
        },
      };

    case 'detect_trends':
      return {
        trends: [
          { metric: 'revenue', direction: 'up', change_percent: 15.5 },
        ],
      };

    default:
      return { message: `Analytics action ${action} executed` };
  }
}

function executeMockBuilderAction(action: string, params: any) {
  switch (action) {
    case 'suggest_layout':
      return {
        layout: {
          type: params.page_type,
          sections: ['hero', 'features', 'cta'],
        },
      };

    case 'generate_copy':
      return {
        copy: [
          { element_id: 'headline', content: 'Transform Your Business Today' },
        ],
      };

    default:
      return { message: `Builder action ${action} executed` };
  }
}

function executeMockWorkflowAction(action: string, params: any) {
  switch (action) {
    case 'suggest_automation':
      return {
        suggestions: [
          {
            name: 'Lead Follow-up',
            trigger: { type: 'webhook', event: 'contact.created' },
            actions: [{ type: 'send_email' }],
          },
        ],
      };

    default:
      return { message: `Workflow action ${action} executed` };
  }
}

function executeMockOrchestratorAction(action: string, params: any) {
  switch (action) {
    case 'orchestrate':
      return {
        workflowId: params.workflow?.id || `orch-${Date.now()}`,
        status: 'completed',
        results: {},
      };

    default:
      return { message: `Orchestrator action ${action} executed` };
  }
}
