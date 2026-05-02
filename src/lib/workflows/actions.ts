/**
 * Action Registry and Execution
 * Defines all available workflow actions and their execution logic
 */

import type { ActionResult, ActionConfig, WorkflowExecution } from './types';
import { supabase } from '../supabase';

/**
 * Action Registry - Maps action types to their executors
 */
interface ActionExecutor {
  execute: (
    config: ActionConfig,
    execution: WorkflowExecution,
    context: Record<string, any>
  ) => Promise<ActionResult>;
  validate?: (config: ActionConfig) => { valid: boolean; errors: string[] };
}

const actionRegistry: Map<string, ActionExecutor> = new Map();

// ============================================================================
// CRM ACTIONS
// ============================================================================

actionRegistry.set('crm:create_contact', {
  execute: async (config, execution, _context) => {
    try {
      const { data, error } = await (supabase
        .from('contacts') as any)
        .insert({
          organization_id: execution.organization_id,
          first_name: config.first_name,
          last_name: config.last_name,
          email: config.email,
          phone: config.phone,
          company_id: config.company_id,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: { contact_id: data.id, contact: data },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact',
        should_continue: false,
      };
    }
  },
});

actionRegistry.set('crm:update_contact', {
  execute: async (config, execution, _context) => {
    try {
      const contactId = config.contact_id || _context.contact_id;

      const { data, error } = await (supabase
        .from('contacts') as any)
        .update({
          first_name: config.first_name,
          last_name: config.last_name,
          email: config.email,
          phone: config.phone,
        })
        .eq('id', contactId)
        .eq('organization_id', execution.organization_id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: { contact: data },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update contact',
        should_continue: false,
      };
    }
  },
});

actionRegistry.set('crm:create_note', {
  execute: async (config, execution, _context) => {
    try {
      // Note: This assumes an activities table exists for notes
      const { data, error } = await (supabase
        .from('activities') as any)
        .insert({
          organization_id: execution.organization_id,
          contact_id: config.contact_id || _context.contact_id,
          type: 'note',
          description: config.note,
          created_by: execution.organization_id, // Would be user_id in real implementation
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: { note_id: data.id },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create note',
        should_continue: false,
      };
    }
  },
});

actionRegistry.set('crm:assign_owner', {
  execute: async (config, execution, _context) => {
    try {
      const contactId = config.contact_id || _context.contact_id;

      const { data, error } = await (supabase
        .from('contacts') as any)
        .update({ owner_id: config.owner_id })
        .eq('id', contactId)
        .eq('organization_id', execution.organization_id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: { contact: data },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign owner',
        should_continue: false,
      };
    }
  },
});

// ============================================================================
// COMMUNICATION ACTIONS
// ============================================================================

actionRegistry.set('communication:send_email', {
  execute: async (config, _execution, _context) => {
    try {
      // In a real implementation, this would integrate with an email service
      // For now, we'll log it and return success
      console.log('[Email Action] Sending email:', {
        to: config.to,
        subject: config.subject,
        body: config.body,
      });

      // Would typically call an Edge Function or external service
      return {
        success: true,
        data: {
          message_id: crypto.randomUUID(),
          status: 'sent',
        },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
        should_continue: false,
      };
    }
  },
});

actionRegistry.set('communication:send_sms', {
  execute: async (config, _execution, _context) => {
    try {
      // In a real implementation, this would integrate with Twilio or similar
      console.log('[SMS Action] Sending SMS:', {
        to: config.to,
        message: config.message,
      });

      return {
        success: true,
        data: {
          message_id: crypto.randomUUID(),
          status: 'sent',
        },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS',
        should_continue: false,
      };
    }
  },
});

// ============================================================================
// MARKETING ACTIONS
// ============================================================================

actionRegistry.set('marketing:add_to_sequence', {
  execute: async (config, _execution, _context) => {
    try {
      // This would add a contact to a marketing sequence
      return {
        success: true,
        data: {
          sequence_id: config.sequence_id,
          contact_id: config.contact_id || _context.contact_id,
          status: 'added',
        },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add to sequence',
        should_continue: false,
      };
    }
  },
});

actionRegistry.set('marketing:add_tag', {
  execute: async (config, _execution, _context) => {
    try {
      // This would add a tag to a contact
      return {
        success: true,
        data: {
          tag: config.tag,
          contact_id: config.contact_id || _context.contact_id,
        },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add tag',
        should_continue: false,
      };
    }
  },
});

// ============================================================================
// BUILDER ACTIONS
// ============================================================================

actionRegistry.set('builder:publish_page', {
  execute: async (config, _execution, _context) => {
    try {
      // This would publish a page in the site builder
      return {
        success: true,
        data: {
          page_id: config.page_id,
          status: 'published',
          url: `https://${config.domain}/${config.slug}`,
        },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish page',
        should_continue: false,
      };
    }
  },
});

// ============================================================================
// LOGIC ACTIONS
// ============================================================================

actionRegistry.set('logic:delay', {
  execute: async (config, _execution, _context) => {
    const duration = config.duration || 1000;
    await new Promise(resolve => setTimeout(resolve, duration));

    return {
      success: true,
      data: { delayed_ms: duration },
      should_continue: true,
    };
  },
});

actionRegistry.set('logic:condition', {
  execute: async (_config, _execution, _context) => {
    // Condition is handled by the executor, not as an action
    return {
      success: true,
      should_continue: true,
    };
  },
});

// ============================================================================
// DATA ACTIONS
// ============================================================================

actionRegistry.set('data:transform', {
  execute: async (config, _execution, context) => {
    try {
      // Simple transformation for now
      const transformed = { ...context, ...config.transformation };

      return {
        success: true,
        data: { transformed },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transform data',
        should_continue: false,
      };
    }
  },
});

actionRegistry.set('data:filter', {
  execute: async (config, _execution, context) => {
    try {
      const items = (context as any)[config.array_field] || [];
      // Simple filter implementation
      const filtered = items.filter((_item: any) => {
        // Basic filtering logic
        return true;
      });

      return {
        success: true,
        data: { filtered, count: filtered.length },
        should_continue: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to filter data',
        should_continue: false,
      };
    }
  },
});

// ============================================================================
// HTTP ACTIONS
// ============================================================================

actionRegistry.set('http:request', {
  execute: async (config, _execution, _context) => {
    try {
      const response = await fetch(config.url, {
        method: config.method || 'POST',
        headers: config.headers || {},
        body: config.body ? JSON.stringify(config.body) : undefined,
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: {
          status: response.status,
          data,
        },
        should_continue: response.ok,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HTTP request failed',
        should_continue: false,
      };
    }
  },
});

// ============================================================================
// AI AGENT ACTIONS
// ============================================================================

/**
 * Execute an AI agent action by calling Claude with appropriate tools and context.
 * This bridges the workflow executor with the AI tool system.
 */
async function executeAgentAction(
  actionType: string,
  systemPrompt: string,
  userMessage: string,
  allowedTools: string[],
  execution: any,
  context: Record<string, any>,
): Promise<ActionResult> {
  try {
    const { getAIClient } = await import('../ai/client');
    const { getToolDefinitions, TOOL_REGISTRY } = await import('../ai/commands');

    const client = getAIClient();
    if (!client) {
      return {
        success: false,
        error: 'AI client not configured. Set CLAUDE_API_KEY in settings.',
        should_continue: false,
      };
    }

    // Filter tool definitions to only allowed tools
    const allTools = getToolDefinitions();
    const filteredTools = allTools.filter((t: any) =>
      allowedTools.includes(t.name)
    );

    const result = await client.complete({
      systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      tools: filteredTools.length > 0 ? filteredTools : undefined,
      maxTokens: 4096,
    });

    // If the model returned tool calls, execute them
    if (result.toolCalls && result.toolCalls.length > 0) {
      const toolResults: any[] = [];
      for (const toolCall of result.toolCalls) {
        const toolDef = TOOL_REGISTRY[toolCall.name as keyof typeof TOOL_REGISTRY];
        if (toolDef?.handler) {
          const toolResult = await toolDef.handler(
            (toolCall as any).input,
            {
              userId: context.userId || '',
              organizationId: execution.organization_id,
              currentModule: 'ai_agents',
              recentActions: [],
              relevantData: {},
              permissions: [],
              timestamp: Date.now(),
            }
          );
          toolResults.push({ tool: toolCall.name, result: toolResult });
        }
      }

      return {
        success: true,
        data: {
          response: result.content,
          tool_calls: toolResults,
        },
        should_continue: true,
      };
    }

    return {
      success: true,
      data: { response: result.content },
      should_continue: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI agent request failed',
      should_continue: false,
    };
  }
}

// --- CRM Agent Actions ---

actionRegistry.set('agent:crm_find', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_find',
      'You are a CRM assistant. Find contacts or companies based on the user request. Use the find_contacts tool to search.',
      config.query || 'Find recent contacts',
      ['find_contacts', 'search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:crm_create', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_create',
      'You are a CRM assistant. Create a contact or company based on the provided details. Use create_contact or create_company tools.',
      config.prompt || 'Create a new contact',
      ['create_contact', 'create_company'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:crm_update', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_update',
      'You are a CRM assistant. Update a contact based on the provided details. Use update_contact tool.',
      config.prompt || 'Update the contact',
      ['update_contact', 'find_contacts'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:crm_enrich', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_enrich',
      'You are a CRM data enrichment assistant. Find a contact and suggest enrichments based on available data.',
      config.prompt || 'Enrich contact data',
      ['find_contacts', 'update_contact', 'search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:crm_score', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_score',
      'You are a lead scoring assistant. Analyze the contact data and provide a lead score from 1-100 with reasoning.',
      config.prompt || 'Score this contact',
      ['find_contacts', 'search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:crm_duplicates', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_duplicates',
      'You are a CRM data quality assistant. Find potential duplicate contacts and suggest merges.',
      config.prompt || 'Find duplicate contacts',
      ['find_contacts', 'search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:crm_suggest', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:crm_suggest',
      'You are a CRM assistant. Suggest next actions for the sales team based on contact data.',
      config.prompt || 'Suggest follow-up actions',
      ['find_contacts', 'search', 'get_metrics'],
      execution,
      context,
    ),
});

// --- Workflow Agent Actions ---

actionRegistry.set('agent:workflow_suggest', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:workflow_suggest',
      'You are a workflow automation assistant. Suggest workflow improvements or new automations.',
      config.prompt || 'Suggest workflow improvements',
      ['get_workflow_status', 'search', 'get_metrics'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:orchestrate', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:orchestrate',
      'You are an orchestration agent. Break down complex tasks and coordinate across available tools.',
      config.prompt || 'Orchestrate the requested task',
      ['find_contacts', 'create_contact', 'update_contact', 'trigger_workflow', 'get_workflow_status', 'search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:route', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:route',
      'You are a routing agent. Analyze the request and determine the best action to take.',
      config.prompt || 'Route this request',
      ['search', 'find_contacts', 'get_metrics'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:workflow_optimize', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:workflow_optimize',
      'You are a workflow optimization assistant. Analyze workflow execution data and suggest optimizations.',
      config.prompt || 'Optimize workflow performance',
      ['get_workflow_status', 'get_metrics'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:workflow_bottleneck', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:workflow_bottleneck',
      'You are a workflow analysis assistant. Identify bottlenecks and failures in workflow executions.',
      config.prompt || 'Find workflow bottlenecks',
      ['get_workflow_status', 'get_metrics'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:workflow_generate', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:workflow_generate',
      'You are a workflow builder assistant. Create a workflow definition based on the described automation.',
      config.prompt || 'Generate a new workflow',
      ['create_workflow', 'get_metrics'],
      execution,
      context,
    ),
});

// --- Marketing Agent Actions ---

actionRegistry.set('agent:marketing_generate', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:marketing_generate',
      'You are a marketing content assistant. Generate marketing copy, emails, or social media posts.',
      config.prompt || 'Generate marketing content',
      ['generate_content', 'save_template'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:marketing_segment', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:marketing_segment',
      'You are a marketing segmentation assistant. Analyze contacts and suggest audience segments.',
      config.prompt || 'Segment the audience',
      ['find_contacts', 'get_metrics'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:marketing_optimize', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:marketing_optimize',
      'You are a marketing optimization assistant. Analyze campaign performance and suggest improvements.',
      config.prompt || 'Optimize marketing campaigns',
      ['get_metrics', 'generate_report'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:marketing_analyze', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:marketing_analyze',
      'You are a marketing analytics assistant. Analyze campaign and content performance.',
      config.prompt || 'Analyze marketing performance',
      ['get_metrics', 'generate_report'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:marketing_template', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:marketing_template',
      'You are a marketing template assistant. Create reusable marketing content templates.',
      config.prompt || 'Create a marketing template',
      ['save_template', 'generate_content'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:marketing_personalize', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:marketing_personalize',
      'You are a personalization assistant. Tailor marketing content to specific contacts or segments.',
      config.prompt || 'Personalize this content',
      ['find_contacts', 'generate_content'],
      execution,
      context,
    ),
});

// --- Analytics Agent Actions ---

actionRegistry.set('agent:analytics_report', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:analytics_report',
      'You are a business analytics assistant. Generate reports and insights from available data.',
      config.prompt || 'Generate an analytics report',
      ['get_metrics', 'generate_report', 'search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:analytics_trends', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:analytics_trends',
      'You are a trend analysis assistant. Identify patterns and trends in the data.',
      config.prompt || 'Analyze business trends',
      ['get_metrics', 'generate_report'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:analytics_forecast', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:analytics_forecast',
      'You are a forecasting assistant. Provide data-driven forecasts and predictions.',
      config.prompt || 'Forecast business metrics',
      ['get_metrics', 'generate_report'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:analytics_anomaly', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:analytics_anomaly',
      'You are an anomaly detection assistant. Identify unusual patterns or outliers in the data.',
      config.prompt || 'Detect anomalies in the data',
      ['get_metrics', 'generate_report'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:analytics_dashboard', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:analytics_dashboard',
      'You are a dashboard design assistant. Suggest metrics, charts, and KPIs for a business dashboard.',
      config.prompt || 'Suggest dashboard metrics',
      ['get_metrics'],
      execution,
      context,
    ),
});

// --- Builder Agent Actions ---

actionRegistry.set('agent:builder_layout', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:builder_layout',
      'You are a web design assistant. Suggest page layouts, sections, and content structure.',
      config.prompt || 'Suggest a page layout',
      ['search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:builder_copy', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:builder_copy',
      'You are a copywriting assistant. Generate compelling website copy, headlines, and CTAs.',
      config.prompt || 'Generate website copy',
      ['generate_content'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:builder_optimize', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:builder_optimize',
      'You are a conversion optimization assistant. Suggest improvements to page design and copy.',
      config.prompt || 'Optimize this page',
      ['search'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:builder_variant', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:builder_variant',
      'You are an A/B testing assistant. Create variant versions of page content.',
      config.prompt || 'Create a page variant',
      ['generate_content'],
      execution,
      context,
    ),
});

actionRegistry.set('agent:builder_analyze', {

  execute: async (config, execution, context) =>
    executeAgentAction(
      'agent:builder_analyze',
      'You are a page analytics assistant. Analyze page structure and suggest improvements.',
      config.prompt || 'Analyze page performance',
      ['get_metrics', 'search'],
      execution,
      context,
    ),
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Execute an action by type
 */
export async function executeAction(
  actionType: string,
  config: ActionConfig,
  execution: WorkflowExecution,
  context: Record<string, any>
): Promise<ActionResult> {
  const executor = actionRegistry.get(actionType);

  if (!executor) {
    return {
      success: false,
      error: `Unknown action type: ${actionType}`,
      should_continue: false,
    };
  }

  // Validate config if validator exists
  if (executor.validate) {
    const validation = executor.validate(config);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid config: ${validation.errors.join(', ')}`,
        should_continue: false,
      };
    }
  }

  return executor.execute(config, execution, context);
}

/**
 * Register a custom action
 */
export function registerAction(
  actionType: string,
  executor: ActionExecutor
): void {
  actionRegistry.set(actionType, executor);
}

/**
 * Get all registered action types
 */
export function getRegisteredActions(): string[] {
  return Array.from(actionRegistry.keys());
}

/**
 * Check if an action type is registered
 */
export function hasAction(actionType: string): boolean {
  return actionRegistry.has(actionType);
}
