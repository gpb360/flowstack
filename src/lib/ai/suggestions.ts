/**
 * AI-Powered Suggestions
 * Smart suggestions for various modules including next best actions
 */

import type { ExecutionContext } from './types';
import { getAIClient } from './client';

// ============================================================================
// CRM Suggestions
// ============================================================================

export interface CRMSuggestion {
  type: 'action' | 'insight' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: () => void | Promise<void>;
}

/**
 * Get CRM-specific suggestions based on context
 */
export async function getCRMSuggestions(context: ExecutionContext): Promise<CRMSuggestion[]> {
  const suggestions: CRMSuggestion[] = [];

  // Analyze recent actions
  const recentContactActions = context.recentActions.filter(
    a => a.module === 'crm' && a.action.includes('contact')
  );

  // If user just viewed a contact, suggest related actions
  if (recentContactActions.length > 0) {
    suggestions.push({
      type: 'action',
      priority: 'high',
      title: 'Follow up with recent contact',
      description: 'You recently viewed a contact. Consider sending a follow-up email or scheduling a call.',
    });
  }

  // Suggest creating contacts if count is low
  const contactsCount = (context.relevantData.contactsCount as number) || 0;
  if (contactsCount < 10) {
    suggestions.push({
      type: 'recommendation',
      priority: 'medium',
      title: 'Grow your contact database',
      description: 'You have fewer than 10 contacts. Consider importing contacts or creating new ones.',
    });
  }

  // AI-powered insights
  try {
    const insights = await getCRMInsights(context);
    suggestions.push(...insights);
  } catch (error) {
    console.error('Failed to get CRM insights:', error);
  }

  return suggestions;
}

/**
 * Get AI-powered CRM insights
 */
async function getCRMInsights(context: ExecutionContext): Promise<CRMSuggestion[]> {
  const client = getAIClient(
    `You are a CRM expert assistant. Analyze the user's recent actions and provide actionable insights for managing contacts and customers better.`
  );

  const recentActionsText = context.recentActions
    .slice(-10)
    .map(a => `- ${a.module}: ${a.action}`)
    .join('\n');

  const response = await client.complete({
    messages: [
      {
        role: 'user',
        content: `Based on my recent CRM activity:
${recentActionsText}

Context:
- Total contacts: ${context.relevantData.contactsCount || 0}
- Current module: ${context.currentModule}

Provide 2-3 specific, actionable recommendations for improving my CRM workflow. Respond as a JSON array with objects containing: type (insight), title, description, and priority (high/medium/low).`,
      },
    ],
    maxTokens: 500,
  });

  try {
    const insights = JSON.parse(response.content);
    return insights.map((insight: any) => ({
      type: 'insight' as const,
      priority: insight.priority || 'medium',
      title: insight.title,
      description: insight.description,
    }));
  } catch {
    // If AI response is not valid JSON, return generic insight
    return [
      {
        type: 'insight',
        priority: 'low',
        title: 'Review your contacts',
        description: response.content,
      },
    ];
  }
}

// ============================================================================
// Workflow Suggestions
// ============================================================================

export interface WorkflowSuggestion {
  type: 'automation' | 'optimization' | 'template';
  title: string;
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedTime?: string;
  definition?: Record<string, unknown>;
}

/**
 * Get workflow automation suggestions
 */
export async function getWorkflowSuggestions(context: ExecutionContext): Promise<WorkflowSuggestion[]> {
  const suggestions: WorkflowSuggestion[] = [];

  // Analyze repetitive patterns in recent actions
  const actionFrequency = context.recentActions.reduce((acc, action) => {
    const key = `${action.module}:${action.action}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Suggest automations for repeated actions
  for (const [actionKey, count] of Object.entries(actionFrequency)) {
    if (count >= 3) {
      const [module, action] = actionKey.split(':');
      suggestions.push({
        type: 'automation',
        title: `Automate "${action}" in ${module}`,
        description: `You've performed this action ${count} times recently. Consider creating a workflow automation.`,
        complexity: 'simple',
        estimatedTime: '5-10 minutes',
      });
    }
  }

  // AI-powered workflow suggestions
  try {
    const aiSuggestions = await getWorkflowAISuggestions(context);
    suggestions.push(...aiSuggestions);
  } catch (error) {
    console.error('Failed to get workflow suggestions:', error);
  }

  return suggestions;
}

/**
 * Get AI-powered workflow suggestions
 */
async function getWorkflowAISuggestions(context: ExecutionContext): Promise<WorkflowSuggestion[]> {
  const client = getAIClient(
    `You are a workflow automation expert. Suggest practical automations that could save time and improve efficiency based on the user's activity patterns.`
  );

  const recentActionsText = context.recentActions
    .slice(-15)
    .map(a => `- ${a.module}: ${a.action}`)
    .join('\n');

  const response = await client.complete({
    messages: [
      {
        role: 'user',
        content: `Based on my recent activity:
${recentActionsText}

Suggest 2-3 workflow automations I could create to save time. For each suggestion, provide: title, description, complexity (simple/medium/complex), and estimated time to build. Respond as a JSON array.`,
      },
    ],
    maxTokens: 800,
  });

  try {
    const suggestions = JSON.parse(response.content);
    return suggestions.map((s: any) => ({
      type: 'automation' as const,
      title: s.title,
      description: s.description,
      complexity: s.complexity || 'medium',
      estimatedTime: s.estimatedTime,
    }));
  } catch {
    return [];
  }
}

// ============================================================================
// Marketing Content Generation
// ============================================================================

export interface ContentGenerationOptions {
  type: 'email_subject' | 'email_body' | 'sms_message' | 'ad_copy' | 'social_post';
  topic: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'urgent' | 'persuasive';
  audience?: string;
  length?: 'short' | 'medium' | 'long';
  includeEmoji?: boolean;
}

export interface GeneratedContent {
  content: string;
  alternatives?: string[];
  suggestions?: string[];
}

/**
 * Generate marketing content with AI
 */
export async function generateMarketingContent(
  options: ContentGenerationOptions,
  _context: ExecutionContext
): Promise<GeneratedContent> {
  const client = getAIClient();

  const toneMap = {
    professional: 'formal and business-appropriate',
    casual: 'relaxed and conversational',
    friendly: 'warm and approachable',
    urgent: 'time-sensitive with strong call-to-action',
    persuasive: 'compelling with persuasive language',
  };

  const lengthMap = {
    short: 'concise and to the point (50-100 words)',
    medium: 'balanced with key details (100-200 words)',
    long: 'comprehensive with full information (200-400 words)',
  };

  const prompt = `Generate ${options.type} content about: ${options.topic}
Tone: ${options.tone ? toneMap[options.tone] : 'professional and engaging'}
Target Audience: ${options.audience || 'general business audience'}
Length: ${options.length ? lengthMap[options.length] : 'medium'}
${options.includeEmoji ? 'Include relevant emojis' : 'No emojis'}

Provide the main content, and if appropriate, 2-3 alternative variations.`;

  const response = await client.complete({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    maxTokens: 1000,
  });

  // Parse the response to extract main content and alternatives
  const content = response.content;
  const alternatives: string[] = [];

  // Simple parsing logic - in production, you'd want more sophisticated parsing
  const lines = content.split('\n');
  let currentContent = '';
  let currentAlternative = '';
  let inAlternatives = false;

  for (const line of lines) {
    if (line.toLowerCase().includes('alternative') || line.toLowerCase().includes('variation')) {
      if (currentAlternative) {
        alternatives.push(currentAlternative.trim());
        currentAlternative = '';
      }
      inAlternatives = true;
      continue;
    }

    if (inAlternatives) {
      currentAlternative += line + '\n';
    } else {
      currentContent += line + '\n';
    }
  }

  if (currentAlternative) {
    alternatives.push(currentAlternative.trim());
  }

  return {
    content: currentContent.trim() || content,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
    suggestions: ['Consider A/B testing this content', 'Add personalization tokens'],
  };
}

// ============================================================================
// Smart Assistance (General)
// ============================================================================

export interface SmartSuggestion {
  module: string;
  type: string;
  title: string;
  description: string;
  action?: string;
  confidence: number;
}

/**
 * Get context-aware smart suggestions
 */
export async function getSmartSuggestions(
  context: ExecutionContext
): Promise<SmartSuggestion[]> {
  const suggestions: SmartSuggestion[] = [];

  // Module-specific suggestions
  switch (context.currentModule) {
    case 'crm':
      const crmSuggestions = await getCRMSuggestions(context);
      suggestions.push(
        ...crmSuggestions.map(s => ({
          module: 'crm',
          type: s.type,
          title: s.title,
          description: s.description,
          confidence: s.priority === 'high' ? 0.9 : s.priority === 'medium' ? 0.7 : 0.5,
        }))
      );
      break;

    case 'workflows':
      const workflowSuggestions = await getWorkflowSuggestions(context);
      suggestions.push(
        ...workflowSuggestions.map(s => ({
          module: 'workflows',
          type: s.type,
          title: s.title,
          description: s.description,
          confidence: s.complexity === 'simple' ? 0.8 : 0.6,
        }))
      );
      break;
  }

  // Cross-module suggestions
  const crossModuleSuggestions = await getCrossModuleSuggestions(context);
  suggestions.push(...crossModuleSuggestions);

  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Get suggestions that span multiple modules
 */
async function getCrossModuleSuggestions(
  context: ExecutionContext
): Promise<SmartSuggestion[]> {
  const suggestions: SmartSuggestion[] = [];

  // If user has been working in CRM, suggest marketing campaigns
  const crmActivity = context.recentActions.filter(a => a.module === 'crm').length;
  if (crmActivity > 5) {
    const hasMarketingActivity = context.recentActions.some(a => a.module === 'marketing');
    if (!hasMarketingActivity) {
      suggestions.push({
        module: 'marketing',
        type: 'recommendation',
        title: 'Launch a campaign for your contacts',
        description: `You've been active in CRM with ${context.relevantData.contactsCount || 0} contacts. Consider launching an email campaign.`,
        confidence: 0.75,
      });
    }
  }

  // Suggest workflow automation for repetitive tasks
  const repetitiveTasks = findRepetitiveTasks(context);
  for (const task of repetitiveTasks) {
    suggestions.push({
      module: 'workflows',
      type: 'automation',
      title: `Automate "${task.action}"`,
      description: `You've done this ${task.count} times recently. A workflow could save you time.`,
      confidence: Math.min(0.9, task.count * 0.15),
    });
  }

  return suggestions;
}

/**
 * Find repetitive tasks in recent actions
 */
function findRepetitiveTasks(context: ExecutionContext): Array<{ action: string; count: number }> {
  const actionCounts = context.recentActions.reduce((acc, action) => {
    const key = action.action;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(actionCounts)
    .filter(([_, count]) => count >= 3)
    .map(([action, count]) => ({ action, count }))
    .sort((a, b) => b.count - a.count);
}

// ============================================================================
// Anomaly Detection
// ============================================================================

export interface Anomaly {
  type: 'drop' | 'spike' | 'stagnation' | 'opportunity';
  severity: 'low' | 'medium' | 'high';
  metric: string;
  description: string;
  recommendation?: string;
}

/**
 * Detect anomalies in user activity and business metrics
 */
export async function detectAnomalies(context: ExecutionContext): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Check for activity drops
  const recentActivity = context.recentActions.slice(-7);
  const olderActivity = context.recentActions.slice(-14, -7);

  if (recentActivity.length < olderActivity.length * 0.5) {
    anomalies.push({
      type: 'drop',
      severity: 'medium',
      metric: 'activity',
      description: 'Your activity has decreased significantly compared to last week',
      recommendation: 'Consider reviewing your priorities and setting up automations',
    });
  }

  // Check for stagnation (same action repeated without variation)
  const uniqueActions = new Set(context.recentActions.slice(-10).map(a => a.action));
  if (uniqueActions.size < 3) {
    anomalies.push({
      type: 'stagnation',
      severity: 'low',
      metric: 'task_variety',
      description: 'You\'ve been repeating similar tasks. There may be an opportunity for automation.',
      recommendation: 'Explore workflow automations to streamline repetitive tasks',
    });
  }

  return anomalies;
}

// ============================================================================
// Proactive Notifications
// ============================================================================

export interface ProactiveNotification {
  id: string;
  type: 'tip' | 'reminder' | 'opportunity' | 'warning';
  title: string;
  message: string;
  actions?: Array<{ label: string; action: string }>;
  dismissible: boolean;
}

/**
 * Generate proactive notifications based on context
 */
export async function getProactiveNotifications(
  context: ExecutionContext
): Promise<ProactiveNotification[]> {
  const notifications: ProactiveNotification[] = [];

  // Tips based on module
  if (context.currentModule === 'crm' && !context.recentActions.some(a => a.action.includes('contact'))) {
    notifications.push({
      id: 'crm-tip-' + Date.now(),
      type: 'tip',
      title: 'CRM Tip',
      message: 'Regular contact interactions help maintain relationships. Consider reaching out to inactive contacts.',
      dismissible: true,
    });
  }

  // Reminders for unfinished tasks
  const incompleteActions = context.recentActions.filter(a => a.action.includes('create') && !a.action.includes('completed'));
  if (incompleteActions.length > 0) {
    notifications.push({
      id: 'reminder-' + Date.now(),
      type: 'reminder',
      title: 'Incomplete Tasks',
      message: `You have ${incompleteActions.length} items that may need follow-up.`,
      actions: [
        { label: 'Review', action: 'navigate:/workflows' },
        { label: 'Dismiss', action: 'dismiss' },
      ],
      dismissible: true,
    });
  }

  // Opportunities
  const contactsCount = (context.relevantData.contactsCount as number | undefined) || 0;
  if (contactsCount > 50) {
    notifications.push({
      id: 'opportunity-' + Date.now(),
      type: 'opportunity',
      title: 'Growth Opportunity',
      message: 'With your contact base growing, consider setting up automated email campaigns.',
      actions: [
        { label: 'Create Campaign', action: 'navigate:/marketing/campaigns/new' },
        { label: 'Learn More', action: 'navigate:/help/campaigns' },
      ],
      dismissible: true,
    });
  }

  return notifications.slice(0, 3); // Limit to 3 notifications
}
