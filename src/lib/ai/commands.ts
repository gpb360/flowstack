/**
 * AI Function Registry
 * Tool definitions for Claude's function calling capability
 * Organized by module with handlers for each operation
 */

import { supabase } from '../supabase';
import type { Tool } from './types';

// ============================================================================
// CRM Tools
// ============================================================================

/**
 * Create a new contact
 */
export const createContactTool: Tool = {
  name: 'create_contact',
  description: 'Create a new contact in the CRM system',
  category: 'crm',
  input_schema: {
    type: 'object',
    properties: {
      first_name: {
        type: 'string',
        description: 'Contact first name',
      },
      last_name: {
        type: 'string',
        description: 'Contact last name',
      },
      email: {
        type: 'string',
        description: 'Contact email address',
      },
      phone: {
        type: 'string',
        description: 'Contact phone number',
      },
      company_id: {
        type: 'string',
        description: 'Optional company ID to associate with',
      },
      position: {
        type: 'string',
        description: 'Contact job title or position',
      },
    },
    required: ['first_name', 'email'],
  },
  handler: async (params: any, context: any) => {
    const p = params as {
      first_name: string;
      last_name?: string;
      email: string;
      phone?: string;
      company_id?: string;
      position?: string;
    };
    const { data, error } = await (supabase
      .from('contacts') as any)
      .insert({
        organization_id: context.organizationId,
        first_name: p.first_name,
        last_name: p.last_name || null,
        email: p.email,
        phone: p.phone || null,
        company_id: p.company_id || null,
        position: p.position || null,
        owner_id: context.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      contact: data,
    };
  },
};

/**
 * Find contacts by email, name, or company
 */
export const findContactsTool: Tool = {
  name: 'find_contacts',
  description: 'Search for contacts in the CRM system',
  category: 'crm',
  input_schema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address to search for',
      },
      first_name: {
        type: 'string',
        description: 'First name to search for',
      },
      last_name: {
        type: 'string',
        description: 'Last name to search for',
      },
      company_id: {
        type: 'string',
        description: 'Company ID to filter by',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
      },
    },
  },
  handler: async (params: any, context: any) => {
    const p = params as {
      email?: string;
      first_name?: string;
      last_name?: string;
      company_id?: string;
      limit?: number;
    };
    let query = supabase
      .from('contacts')
      .select('*')
      .eq('organization_id', context.organizationId);

    if (p.email) {
      query = query.ilike('email', `%${p.email}%`);
    }
    if (p.first_name) {
      query = query.ilike('first_name', `%${p.first_name}%`);
    }
    if (p.last_name) {
      query = query.ilike('last_name', `%${p.last_name}%`);
    }
    if (p.company_id) {
      query = query.eq('company_id', p.company_id);
    }

    query = query.limit(p.limit || 10);

    const { data, error } = await query;

    if (error) throw error;

    return {
      success: true,
      contacts: data || [],
      count: data?.length || 0,
    };
  },
};

/**
 * Update contact information
 */
export const updateContactTool: Tool = {
  name: 'update_contact',
  description: 'Update an existing contact',
  category: 'crm',
  input_schema: {
    type: 'object',
    properties: {
      contact_id: {
        type: 'string',
        description: 'Contact ID to update',
      },
      first_name: {
        type: 'string',
        description: 'New first name',
      },
      last_name: {
        type: 'string',
        description: 'New last name',
      },
      email: {
        type: 'string',
        description: 'New email address',
      },
      phone: {
        type: 'string',
        description: 'New phone number',
      },
      position: {
        type: 'string',
        description: 'New job title or position',
      },
    },
    required: ['contact_id'],
  },
  handler: async (params: any, context: any) => {
    const p = params as {
      contact_id: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      position?: string;
    };
    const updateData: Record<string, unknown> = {};

    if (p.first_name !== undefined) updateData.first_name = p.first_name;
    if (p.last_name !== undefined) updateData.last_name = p.last_name;
    if (p.email !== undefined) updateData.email = p.email;
    if (p.phone !== undefined) updateData.phone = p.phone;
    if (p.position !== undefined) updateData.position = p.position;

    const { data, error } = await (supabase
      .from('contacts') as any)
      .update(updateData)
      .eq('id', p.contact_id)
      .eq('organization_id', context.organizationId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      contact: data,
    };
  },
};

/**
 * Create a new company
 */
export const createCompanyTool: Tool = {
  name: 'create_company',
  description: 'Create a new company in the CRM system',
  category: 'crm',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Company name',
      },
      domain: {
        type: 'string',
        description: 'Company website domain',
      },
      address: {
        type: 'string',
        description: 'Company address',
      },
    },
    required: ['name'],
  },
  handler: async (params: any, context: any) => {
    const p = params as {
      name: string;
      domain?: string;
      address?: string;
    };
    const { data, error } = await (supabase
      .from('companies') as any)
      .insert({
        organization_id: context.organizationId,
        name: p.name,
        domain: p.domain || null,
        address: p.address || null,
        owner_id: context.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      company: data,
    };
  },
};

// ============================================================================
// Marketing Tools
// ============================================================================

/**
 * Create an email campaign
 */
export const createCampaignTool: Tool = {
  name: 'create_campaign',
  description: 'Create a new marketing campaign',
  category: 'marketing',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Campaign name',
      },
      type: {
        type: 'string',
        description: 'Campaign type (email, sms, etc.)',
        enum: ['email', 'sms'],
      },
      subject: {
        type: 'string',
        description: 'Email subject line',
      },
      content: {
        type: 'string',
        description: 'Campaign content/body',
      },
      scheduled_at: {
        type: 'string',
        description: 'ISO 8601 timestamp for scheduled send',
      },
    },
    required: ['name', 'type', 'content'],
  },
  handler: async (params: any, context: any) => {
    const p = params as {
      name: string;
      type: string;
      subject?: string;
      content: string;
      scheduled_at?: string;
    };
    const { data, error } = await (supabase
      .from('marketing_campaigns') as any)
      .insert({
        organization_id: context.organizationId,
        name: p.name,
        type: p.type,
        subject: p.subject || null,
        content: p.content,
        status: 'draft',
        scheduled_at: p.scheduled_at || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      campaign: data,
    };
  },
};

/**
 * Generate marketing content with AI
 */
export const generateContentTool: Tool = {
  name: 'generate_content',
  description: 'Generate marketing content using AI',
  category: 'marketing',
  input_schema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        description: 'Content type to generate',
        enum: ['email_subject', 'email_body', 'sms_message', 'ad_copy', 'social_post'],
      },
      topic: {
        type: 'string',
        description: 'Topic or product to write about',
      },
      tone: {
        type: 'string',
        description: 'Desired tone',
        enum: ['professional', 'casual', 'friendly', 'urgent', 'persuasive'],
      },
      audience: {
        type: 'string',
        description: 'Target audience description',
      },
      length: {
        type: 'string',
        description: 'Content length',
        enum: ['short', 'medium', 'long'],
      },
    },
    required: ['type', 'topic'],
  },
  handler: async (params: any) => {
    const p = params as {
      type: string;
      topic: string;
    };
    // This would call AI to generate content
    // For now, return a placeholder
    return {
      success: true,
      content: `Generated ${p.type} content about ${p.topic}...`,
      note: 'This tool requires AI integration to generate actual content',
    };
  },
};

/**
 * Save an email template
 */
export const saveTemplateTool: Tool = {
  name: 'save_template',
  description: 'Save a marketing template',
  category: 'marketing',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Template name',
      },
      subject: {
        type: 'string',
        description: 'Email subject line',
      },
      body: {
        type: 'string',
        description: 'Email body content',
      },
      category: {
        type: 'string',
        description: 'Template category',
      },
    },
    required: ['name', 'body'],
  },
  handler: async (params: any, context: any) => {
    const p = params as {
      name: string;
      subject?: string;
      body: string;
      category?: string;
    };
    const { data, error } = await (supabase
      .from('marketing_templates') as any)
      .insert({
        organization_id: context.organizationId,
        name: p.name,
        subject: p.subject || null,
        body: p.body,
        category: p.category || 'general',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      template: data,
    };
  },
};

/**
 * Send an email via Resend (through the marketing-send Edge Function)
 */
export const sendEmailTool: Tool = {
  name: 'send_email',
  description: 'Send an email to a recipient via Resend',
  category: 'marketing',
  input_schema: {
    type: 'object',
    properties: {
      to: {
        type: 'string',
        description: 'Recipient email address',
      },
      subject: {
        type: 'string',
        description: 'Email subject line',
      },
      body: {
        type: 'string',
        description: 'Email body content (HTML or plain text)',
      },
      from_name: {
        type: 'string',
        description: 'Sender display name (optional)',
      },
    },
    required: ['to', 'subject', 'body'],
  },
  handler: async (params: any) => {
    const p = params as {
      to: string;
      subject: string;
      body: string;
      from_name?: string;
    };

    const { data, error } = await supabase.functions.invoke('marketing-send', {
      body: {
        type: 'email',
        to: p.to,
        subject: p.subject,
        content: p.body,
      },
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return {
      success: true,
      messageId: (data as any)?.id ?? null,
      to: p.to,
      subject: p.subject,
    };
  },
};

// ============================================================================
// Workflow Tools
// ============================================================================

/**
 * Create a new workflow
 */
export const createWorkflowTool: Tool = {
  name: 'create_workflow',
  description: 'Create a new workflow automation',
  category: 'workflow',
  input_schema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Workflow name',
      },
      description: {
        type: 'string',
        description: 'Workflow description',
      },
      trigger_type: {
        type: 'string',
        description: 'Type of trigger',
        enum: ['manual', 'scheduled', 'webhook', 'contact_created', 'contact_updated'],
      },
      trigger_config: {
        type: 'object',
        description: 'Trigger configuration',
      },
    },
    required: ['name', 'trigger_type'],
  },
  handler: async (params: any, context: any) => {
    const { data, error } = await supabase
      .from('workflows')
      .insert({
        organization_id: context.organizationId,
        name: params.name,
        description: params.description || null,
        trigger_type: params.trigger_type,
        trigger_config: params.trigger_config || {},
        status: 'active',
        definition: { nodes: [], edges: [] }, // Empty workflow to start
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      workflow: data,
    };
  },
};

/**
 * Trigger a workflow execution
 */
export const triggerWorkflowTool: Tool = {
  name: 'trigger_workflow',
  description: 'Manually trigger a workflow execution',
  category: 'workflow',
  input_schema: {
    type: 'object',
    properties: {
      workflow_id: {
        type: 'string',
        description: 'Workflow ID to trigger',
      },
      input_data: {
        type: 'object',
        description: 'Input data for the workflow',
      },
    },
    required: ['workflow_id'],
  },
  handler: async (params: any, context: any) => {
    const { executeWorkflow } = await import('../workflows/executor');

    // Fetch the workflow definition
    const { data: workflow, error: fetchError } = await (supabase
      .from('workflows') as any)
      .select('*')
      .eq('id', params.workflow_id)
      .single();

    if (fetchError) throw fetchError;
    if (!workflow) throw new Error(`Workflow ${params.workflow_id} not found`);

    // Execute the workflow
    const execution = await executeWorkflow(workflow, {
      event_type: 'agent_trigger',
      agent_context: context,
      ...params.input_data,
    });

    return {
      success: true,
      execution_id: execution.id,
      status: execution.status,
      message: `Workflow executed: ${execution.status}`,
    };
  },
};

/**
 * Get workflow execution status
 */
export const getWorkflowStatusTool: Tool = {
  name: 'get_workflow_status',
  description: 'Get the status of a workflow execution',
  category: 'workflow',
  input_schema: {
    type: 'object',
    properties: {
      execution_id: {
        type: 'string',
        description: 'Execution ID to check',
      },
    },
    required: ['execution_id'],
  },
  handler: async (params: any) => {
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', params.execution_id)
      .single();

    if (error) throw error;

    return {
      success: true,
      execution: data,
    };
  },
};

// ============================================================================
// Analytics Tools
// ============================================================================

/**
 * Generate a report
 */
export const generateReportTool: Tool = {
  name: 'generate_report',
  description: 'Generate analytics report for various metrics',
  category: 'analytics',
  input_schema: {
    type: 'object',
    properties: {
      report_type: {
        type: 'string',
        description: 'Type of report to generate',
        enum: [
          'contacts_summary',
          'campaign_performance',
          'workflow_stats',
          'team_activity',
          'conversion_funnel',
        ],
      },
      date_range: {
        type: 'string',
        description: 'Date range for the report',
        enum: ['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_90_days', 'this_month', 'last_month', 'custom'],
      },
      custom_start: {
        type: 'string',
        description: 'Custom start date (ISO 8601)',
      },
      custom_end: {
        type: 'string',
        description: 'Custom end date (ISO 8601)',
      },
    },
    required: ['report_type', 'date_range'],
  },
  handler: async (params: any, context: any) => {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (params.date_range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'last_7_days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'last_30_days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last_90_days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'this_month':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setMonth(0);
        endDate.setDate(0);
        break;
      case 'custom':
        if (params.custom_start) startDate.setTime(Date.parse(params.custom_start));
        if (params.custom_end) endDate.setTime(Date.parse(params.custom_end));
        break;
    }

    // Generate report based on type
    let reportData: Record<string, unknown> = {};

    switch (params.report_type) {
      case 'contacts_summary':
        const { count: contactsCount } = await supabase
          .from('contacts')
          .select('id', { count: 'exact', head: true })
          .eq('organization_id', context.organizationId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        reportData = {
          type: 'contacts_summary',
          period: { start: startDate.toISOString(), end: endDate.toISOString() },
          total_contacts: contactsCount || 0,
        };
        break;

      case 'campaign_performance':
        const { data: campaigns } = await supabase
          .from('marketing_campaigns')
          .select('*')
          .eq('organization_id', context.organizationId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        reportData = {
          type: 'campaign_performance',
          period: { start: startDate.toISOString(), end: endDate.toISOString() },
          total_campaigns: campaigns?.length || 0,
          campaigns: campaigns || [],
        };
        break;

      default:
        reportData = {
          type: params.report_type,
          period: { start: startDate.toISOString(), end: endDate.toISOString() },
          message: 'Report generation not yet fully implemented',
        };
    }

    return {
      success: true,
      report: reportData,
    };
  },
};

/**
 * Get key metrics
 */
export const getMetricsTool: Tool = {
  name: 'get_metrics',
  description: 'Get key business metrics',
  category: 'analytics',
  input_schema: {
    type: 'object',
    properties: {
      metrics: {
        type: 'array',
        description: 'List of metrics to fetch',
        items: {
          type: 'string',
          enum: [
            'total_contacts',
            'total_companies',
            'active_workflows',
            'active_campaigns',
            'recent_signups',
            'conversion_rate',
          ],
        },
      },
    },
    required: ['metrics'],
  },
  handler: async (params: any, context: any) => {
    const metrics: Record<string, unknown> = {};

    for (const metric of params.metrics as string[]) {
      switch (metric) {
        case 'total_contacts':
          const { count: contacts } = await supabase
            .from('contacts')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', context.organizationId);
          metrics[metric] = contacts || 0;
          break;

        case 'total_companies':
          const { count: companies } = await supabase
            .from('companies')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', context.organizationId);
          metrics[metric] = companies || 0;
          break;

        case 'active_workflows':
          const { count: workflows } = await supabase
            .from('workflows')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', context.organizationId)
            .eq('status', 'active');
          metrics[metric] = workflows || 0;
          break;

        case 'active_campaigns':
          const { count: campaigns } = await supabase
            .from('marketing_campaigns')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', context.organizationId)
            .in('status', ['draft', 'scheduled', 'running']);
          metrics[metric] = campaigns || 0;
          break;

        default:
          metrics[metric] = 'Not implemented';
      }
    }

    return {
      success: true,
      metrics,
    };
  },
};

// ============================================================================
// General Tools
// ============================================================================

/**
 * Search across all entities
 */
export const searchTool: Tool = {
  name: 'search',
  description: 'Search across contacts, companies, campaigns, and workflows',
  category: 'general',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
      entity_types: {
        type: 'array',
        description: 'Entity types to search',
        items: {
          type: 'string',
          enum: ['contacts', 'companies', 'campaigns', 'workflows'],
        },
      },
      limit: {
        type: 'number',
        description: 'Results per entity type (default: 5)',
      },
    },
    required: ['query'],
  },
  handler: async (params: any, context: any) => {
    const results: Record<string, unknown[]> = {};
    const limit = params.limit || 5;
    const entityTypes = (params.entity_types as string[]) || ['contacts', 'companies', 'campaigns', 'workflows'];

    for (const entityType of entityTypes) {
      switch (entityType) {
        case 'contacts':
          const { data: contacts } = await supabase
            .from('contacts')
            .select('*')
            .eq('organization_id', context.organizationId)
            .or(`first_name.ilike.%${params.query}%,last_name.ilike.%${params.query}%,email.ilike.%${params.query}%`)
            .limit(limit);
          results.contacts = contacts || [];
          break;

        case 'companies':
          const { data: companies } = await supabase
            .from('companies')
            .select('*')
            .eq('organization_id', context.organizationId)
            .ilike('name', `%${params.query}%`)
            .limit(limit);
          results.companies = companies || [];
          break;

        case 'campaigns':
          const { data: campaigns } = await supabase
            .from('marketing_campaigns')
            .select('*')
            .eq('organization_id', context.organizationId)
            .ilike('name', `%${params.query}%`)
            .limit(limit);
          results.campaigns = campaigns || [];
          break;

        case 'workflows':
          const { data: workflows } = await supabase
            .from('workflows')
            .select('*')
            .eq('organization_id', context.organizationId)
            .ilike('name', `%${params.query}%`)
            .limit(limit);
          results.workflows = workflows || [];
          break;
      }
    }

    return {
      success: true,
      results,
      query: params.query,
    };
  },
};

/**
 * Get current user info
 */
export const getCurrentUserTool: Tool = {
  name: 'get_current_user',
  description: 'Get information about the current user',
  category: 'general',
  input_schema: {
    type: 'object',
    properties: {},
  },
  handler: async (_, context) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', context.userId)
      .single();

    return {
      success: true,
      user: {
        id: context.userId,
        organization_id: context.organizationId,
        profile,
        current_module: context.currentModule,
        permissions: context.permissions,
      },
    };
  },
};

// ============================================================================
// Tool Registry
// ============================================================================

/**
 * All available tools organized by category
 */
export const TOOL_REGISTRY: Record<string, Tool> = {
  // CRM Tools
  create_contact: createContactTool,
  find_contacts: findContactsTool,
  update_contact: updateContactTool,
  create_company: createCompanyTool,

  // Marketing Tools
  create_campaign: createCampaignTool,
  generate_content: generateContentTool,
  save_template: saveTemplateTool,
  send_email: sendEmailTool,

  // Workflow Tools
  create_workflow: createWorkflowTool,
  trigger_workflow: triggerWorkflowTool,
  get_workflow_status: getWorkflowStatusTool,

  // Analytics Tools
  generate_report: generateReportTool,
  get_metrics: getMetricsTool,

  // General Tools
  search: searchTool,
  get_current_user: getCurrentUserTool,
};

/**
 * Get tools by category
 */
export function getToolsByCategory(category: Tool['category']): Tool[] {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.category === category);
}

/**
 * Get all tools
 */
export function getAllTools(): Tool[] {
  return Object.values(TOOL_REGISTRY);
}

/**
 * Get tool by name
 */
export function getTool(name: string): Tool | undefined {
  return TOOL_REGISTRY[name];
}

/**
 * Get tool definitions for Claude API (without handlers)
 */
export function getToolDefinitions(): Array<Omit<Tool, 'handler' | 'category' | 'dangerous'>> {
  return Object.values(TOOL_REGISTRY).map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));
}
