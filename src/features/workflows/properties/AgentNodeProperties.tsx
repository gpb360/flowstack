/**
 * Agent Node Properties Panel
 * Configure agent type, action, and prompt for workflow agent nodes
 */

import React from 'react';
import { InputUntitled } from '@/components/ui/input-untitled';
import type { Node } from '@xyflow/react';

const AGENT_TYPES = [
  { value: 'orchestrator', label: 'Orchestrator', emoji: '🧠' },
  { value: 'crm', label: 'CRM', emoji: '👥' },
  { value: 'marketing', label: 'Marketing', emoji: '📧' },
  { value: 'analytics', label: 'Analytics', emoji: '📊' },
  { value: 'builder', label: 'Builder', emoji: '🏗️' },
  { value: 'workflow', label: 'Workflow', emoji: '⚡' },
  { value: 'custom', label: 'Custom', emoji: '🤖' },
] as const;

const AGENT_ACTIONS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  orchestrator: [
    { value: 'agent:orchestrate', label: 'Orchestrate Task' },
    { value: 'agent:route', label: 'Route Request' },
    { value: 'agent:workflow_suggest', label: 'Suggest Workflow' },
  ],
  crm: [
    { value: 'agent:crm_find', label: 'Find Contacts' },
    { value: 'agent:crm_create', label: 'Create Contact' },
    { value: 'agent:crm_update', label: 'Update Contact' },
    { value: 'agent:crm_enrich', label: 'Enrich Data' },
    { value: 'agent:crm_score', label: 'Score Lead' },
    { value: 'agent:crm_duplicates', label: 'Find Duplicates' },
    { value: 'agent:crm_suggest', label: 'Suggest Actions' },
  ],
  marketing: [
    { value: 'agent:marketing_generate', label: 'Generate Content' },
    { value: 'agent:marketing_segment', label: 'Segment Audience' },
    { value: 'agent:marketing_optimize', label: 'Optimize Campaigns' },
    { value: 'agent:marketing_analyze', label: 'Analyze Performance' },
    { value: 'agent:marketing_template', label: 'Create Template' },
    { value: 'agent:marketing_personalize', label: 'Personalize Content' },
  ],
  analytics: [
    { value: 'agent:analytics_report', label: 'Generate Report' },
    { value: 'agent:analytics_trends', label: 'Analyze Trends' },
    { value: 'agent:analytics_forecast', label: 'Forecast Metrics' },
    { value: 'agent:analytics_anomaly', label: 'Detect Anomalies' },
    { value: 'agent:analytics_dashboard', label: 'Dashboard Suggestions' },
  ],
  builder: [
    { value: 'agent:builder_layout', label: 'Suggest Layout' },
    { value: 'agent:builder_copy', label: 'Generate Copy' },
    { value: 'agent:builder_optimize', label: 'Optimize Page' },
    { value: 'agent:builder_variant', label: 'Create Variant' },
    { value: 'agent:builder_analyze', label: 'Analyze Page' },
  ],
  workflow: [
    { value: 'agent:workflow_suggest', label: 'Suggest Workflow' },
    { value: 'agent:workflow_optimize', label: 'Optimize Workflow' },
    { value: 'agent:workflow_bottleneck', label: 'Find Bottlenecks' },
    { value: 'agent:workflow_generate', label: 'Generate Workflow' },
  ],
  custom: [],
};

interface AgentNodePropertiesProps {
  node: Node;
  onUpdate: (data: any) => void;
}

export const AgentNodeProperties: React.FC<AgentNodePropertiesProps> = ({ node, onUpdate }) => {
  const data = node.data as any;
  const agentType: string = data.agentType || 'crm';
  const agentAction: string = data.agentAction || '';
  const systemPrompt: string = data.config?.system_prompt || '';

  const availableActions = AGENT_ACTIONS_BY_TYPE[agentType] || [];

  return (
    <div className="space-y-4">
      {/* Agent Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Agent Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {AGENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onUpdate({
                agentType: type.value,
                agentAction: '',
                label: type.emoji + ' ' + type.label,
              })}
              className={`px-3 py-2 rounded-lg border text-sm text-left transition-all flex items-center gap-2 ${
                agentType === type.value
                  ? 'border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span>{type.emoji}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Action */}
      {availableActions.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
          <select
            value={agentAction}
            onChange={(e) => onUpdate({ agentAction: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
          >
            <option value="">Select an action...</option>
            {availableActions.map((action) => (
              <option key={action.value} value={action.value}>
                {action.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* System Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Custom Prompt
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none font-mono"
          rows={4}
          placeholder="Override the default system prompt for this agent..."
          value={systemPrompt}
          onChange={(e) =>
            onUpdate({
              config: { ...(data.config || {}), system_prompt: e.target.value },
            })
          }
        />
        <p className="text-xs text-gray-400 mt-1">
          Leave empty to use the default prompt for the selected action.
        </p>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-xs text-gray-500">
          The agent will use AI (Claude) to process this action with access to relevant tools
          (CRM queries, workflow triggers, etc.) based on the selected type.
        </p>
      </div>
    </div>
  );
};
