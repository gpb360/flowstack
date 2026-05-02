/**
 * Agent Registry
 * Central registry for all agent definitions (mirrors src/lib/registry.ts pattern)
 */

import type { AgentDefinition, AgentCapability, AgentCategory, AgentType } from './types';
import type { ModuleId } from '@/lib/registry';
import { Bot, Users, Mail, Layout, BarChart3, Workflow, CheckCircle2 } from 'lucide-react';

// ============================================================================
// Agent Type Registry
// ============================================================================

/**
 * All registered agent definitions
 * Add new agents here to make them available in the system
 */
export const AGENT_REGISTRY: Record<string, AgentDefinition> = {
  // Core Agents (cannot be disabled)
  orchestrator: {
    id: 'orchestrator',
    name: 'Orchestrator',
    description: 'Coordinates multiple agents to complete complex tasks',
    category: 'orchestrator',
    type: 'orchestrator',
    capabilities: ['coordination', 'automation'],
    dependencies: [],
    requiresModules: ['workflows'],
    maxConcurrency: 10,
    timeout: 300000, // 5 minutes
    isCore: true,
    icon: 'workflow',
    color: 'bg-rose-500',
  },
  crm: {
    id: 'crm',
    name: 'CRM Agent',
    description: 'Manages contacts, companies, and lead scoring',
    category: 'crm',
    type: 'crm',
    capabilities: ['data_query', 'data_mutate', 'analysis'],
    dependencies: [],
    requiresModules: ['crm'],
    maxConcurrency: 5,
    timeout: 60000, // 1 minute
    isCore: true,
    icon: 'users',
    color: 'bg-blue-500',
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Agent',
    description: 'Creates campaigns, templates, and manages audience segmentation',
    category: 'marketing',
    type: 'marketing',
    capabilities: ['data_query', 'data_mutate', 'generation', 'analysis'],
    dependencies: [],
    requiresModules: ['email_marketing'],
    maxConcurrency: 3,
    timeout: 120000, // 2 minutes
    isCore: true,
    icon: 'mail',
    color: 'bg-purple-500',
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Generates reports, detects trends, and forecasts metrics',
    category: 'analytics',
    type: 'analytics',
    capabilities: ['data_query', 'analysis', 'generation'],
    dependencies: [],
    requiresModules: ['analytics'],
    maxConcurrency: 5,
    timeout: 180000, // 3 minutes
    isCore: true,
    icon: 'bar-chart-3',
    color: 'bg-green-500',
  },
  builder: {
    id: 'builder',
    name: 'Builder Agent',
    description: 'Suggests layouts, generates copy, and optimizes conversions',
    category: 'builder',
    type: 'builder',
    capabilities: ['data_query', 'generation', 'analysis'],
    dependencies: [],
    requiresModules: ['site_builder'],
    maxConcurrency: 3,
    timeout: 90000, // 1.5 minutes
    isCore: true,
    icon: 'layout',
    color: 'bg-amber-500',
  },
  workflow: {
    id: 'workflow',
    name: 'Workflow Agent',
    description: 'Suggests automations and optimizes workflow efficiency',
    category: 'workflows',
    type: 'workflow',
    capabilities: ['data_query', 'analysis', 'generation', 'automation'],
    dependencies: [],
    requiresModules: ['workflows'],
    maxConcurrency: 5,
    timeout: 120000, // 2 minutes
    isCore: true,
    icon: 'workflow',
    color: 'bg-cyan-500',
  },
  code_reviewer: {
    id: 'code_reviewer',
    name: 'Code Reviewer',
    description: 'Validates code for errors and best practices',
    category: 'orchestrator',
    type: 'code_reviewer',
    capabilities: ['analysis'],
    dependencies: [],
    requiresModules: [],
    maxConcurrency: 5,
    timeout: 60000, // 1 minute
    isCore: true,
    icon: 'check-circle',
    color: 'bg-emerald-500',
  },
};

// ============================================================================
// Agent Action Registry
// ============================================================================

/**
 * Action definitions for each agent type
 * Used in workflow node palette
 */
export const AGENT_ACTIONS: Record<AgentType, Array<{
  type: string;
  label: string;
  description: string;
  icon: string;
}>> = {
  orchestrator: [
    {
      type: 'agent:orchestrate',
      label: 'Orchestrate Tasks',
      description: 'Run multiple agents in sequence or parallel',
      icon: 'workflow',
    },
    {
      type: 'agent:route',
      label: 'Route by Intent',
      description: 'Route tasks to appropriate agents based on intent',
      icon: 'git-branch',
    },
  ],
  crm: [
    {
      type: 'agent:crm_find',
      label: 'Find Contact',
      description: 'Search contacts by email, phone, or name',
      icon: 'search',
    },
    {
      type: 'agent:crm_create',
      label: 'Create Contact',
      description: 'Create a new contact',
      icon: 'user-plus',
    },
    {
      type: 'agent:crm_update',
      label: 'Update Contact',
      description: 'Update existing contact information',
      icon: 'user-cog',
    },
    {
      type: 'agent:crm_enrich',
      label: 'Enrich Contact',
      description: 'AI-powered data enrichment',
      icon: 'sparkles',
    },
    {
      type: 'agent:crm_score',
      label: 'Score Lead',
      description: 'Calculate lead score based on engagement',
      icon: 'star',
    },
    {
      type: 'agent:crm_duplicates',
      label: 'Find Duplicates',
      description: 'Detect duplicate contacts',
      icon: 'copy',
    },
    {
      type: 'agent:crm_suggest',
      label: 'Suggest Next Action',
      description: 'Recommend next action for a contact',
      icon: 'lightbulb',
    },
  ],
  marketing: [
    {
      type: 'agent:marketing_generate',
      label: 'Generate Campaign',
      description: 'Create a marketing campaign',
      icon: 'megaphone',
    },
    {
      type: 'agent:marketing_segment',
      label: 'Segment Audience',
      description: 'Create audience segments',
      icon: 'users',
    },
    {
      type: 'agent:marketing_optimize',
      label: 'Optimize Send Time',
      description: 'Find optimal send times',
      icon: 'clock',
    },
    {
      type: 'agent:marketing_analyze',
      label: 'Analyze Performance',
      description: 'Analyze campaign performance',
      icon: 'trending-up',
    },
    {
      type: 'agent:marketing_template',
      label: 'Generate Template',
      description: 'Generate email/template content',
      icon: 'file-text',
    },
    {
      type: 'agent:marketing_personalize',
      label: 'Personalize Content',
      description: 'Personalize content for recipients',
      icon: 'sparkles',
    },
  ],
  analytics: [
    {
      type: 'agent:analytics_report',
      label: 'Generate Report',
      description: 'Generate analytics report',
      icon: 'file-bar-chart',
    },
    {
      type: 'agent:analytics_trends',
      label: 'Detect Trends',
      description: 'Detect trends in your data',
      icon: 'trending-up',
    },
    {
      type: 'agent:analytics_forecast',
      label: 'Forecast Metrics',
      description: 'Forecast future metrics',
      icon: 'line-chart',
    },
    {
      type: 'agent:analytics_anomaly',
      label: 'Detect Anomalies',
      description: 'Find anomalies in data',
      icon: 'alert-triangle',
    },
    {
      type: 'agent:analytics_dashboard',
      label: 'Create Dashboard',
      description: 'Suggest dashboard configuration',
      icon: 'layout-grid',
    },
  ],
  builder: [
    {
      type: 'agent:builder_layout',
      label: 'Suggest Layout',
      description: 'Get layout suggestions',
      icon: 'layout',
    },
    {
      type: 'agent:builder_copy',
      label: 'Generate Copy',
      description: 'Generate page copy',
      icon: 'type',
    },
    {
      type: 'agent:builder_optimize',
      label: 'Optimize Conversion',
      description: 'Get conversion optimization tips',
      icon: 'zap',
    },
    {
      type: 'agent:builder_variant',
      label: 'Create Variant',
      description: 'Create A/B test variant',
      icon: 'git-branch',
    },
    {
      type: 'agent:builder_analyze',
      label: 'Analyze Performance',
      description: 'Analyze page performance',
      icon: 'bar-chart',
    },
  ],
  workflow: [
    {
      type: 'agent:workflow_suggest',
      label: 'Suggest Automation',
      description: 'Get automation suggestions',
      icon: 'lightbulb',
    },
    {
      type: 'agent:workflow_optimize',
      label: 'Optimize Workflow',
      description: 'Optimize workflow efficiency',
      icon: 'zap',
    },
    {
      type: 'agent:workflow_bottleneck',
      label: 'Detect Bottlenecks',
      description: 'Find workflow bottlenecks',
      icon: 'alert-circle',
    },
    {
      type: 'agent:workflow_generate',
      label: 'Generate Workflow',
      description: 'Generate workflow from description',
      icon: 'workflow',
    },
  ],
  code_reviewer: [
    {
      type: 'agent:review_completion',
      label: 'Review Completion',
      description: 'Review task completion for errors',
      icon: 'check-circle',
    },
    {
      type: 'agent:validate_syntax',
      label: 'Validate Syntax',
      description: 'Validate code syntax',
      icon: 'code',
    },
    {
      type: 'agent:check_best_practices',
      label: 'Check Best Practices',
      description: 'Check code against best practices',
      icon: 'star',
    },
  ],
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get an agent definition by ID
 */
export function getAgentDefinition(id: string): AgentDefinition | undefined {
  return AGENT_REGISTRY[id];
}

/**
 * Get all agent definitions
 */
export function getAllAgentDefinitions(): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY);
}

/**
 * Get agent definitions by category
 */
export function getAgentsByCategory(category: AgentCategory): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY).filter(agent => agent.category === category);
}

/**
 * Get agent definitions by required module
 */
export function getAgentsByModule(moduleId: ModuleId): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY).filter(agent =>
    agent.requiresModules?.includes(moduleId)
  );
}

/**
 * Get agent definitions by capability
 */
export function getAgentsByCapability(capability: AgentCapability): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY).filter(agent =>
    agent.capabilities.includes(capability)
  );
}

/**
 * Check if an agent is available (core or required modules enabled)
 */
export function isAgentAvailable(
  agentId: string,
  enabledModules: Set<ModuleId>
): boolean {
  const agent = AGENT_REGISTRY[agentId];
  if (!agent) return false;
  if (agent.isCore) return true;
  if (!agent.requiresModules) return true;
  return agent.requiresModules.every(module => enabledModules.has(module));
}

/**
 * Get all available agents based on enabled modules
 */
export function getAvailableAgents(enabledModules: Set<ModuleId>): AgentDefinition[] {
  return Object.values(AGENT_REGISTRY).filter(agent =>
    isAgentAvailable(agent.id, enabledModules)
  );
}

/**
 * Get actions for an agent type
 */
export function getAgentActions(agentType: AgentType): Array<{
  type: string;
  label: string;
  description: string;
  icon: string;
}> {
  return AGENT_ACTIONS[agentType] || [];
}

/**
 * Get icon component for an agent
 */
export function getAgentIcon(agentId: string): typeof Bot {
  const agent = AGENT_REGISTRY[agentId];
  switch (agent?.icon) {
    case 'users':
      return Users;
    case 'mail':
      return Mail;
    case 'layout':
      return Layout;
    case 'bar-chart-3':
      return BarChart3;
    case 'workflow':
      return Workflow;
    case 'check-circle':
      return CheckCircle2;
    default:
      return Bot;
  }
}
