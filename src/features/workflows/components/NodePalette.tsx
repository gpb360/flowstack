import React from 'react';
import {
  Bot,
  Mail,
  MessageSquare,
  Clock,
  GitBranch,
  Zap,
  Users,
  Workflow,
  Search,
  UserPlus,
  UserCog,
  Sparkles,
  Star,
  Copy,
  Lightbulb,
  Megaphone,
  TrendingUp,
  FileText,
  Layout,
  Type,
  BarChart3,
  AlertTriangle,
  LayoutGrid,
  LineChart,
} from 'lucide-react';
import { type ActionType, type TriggerType } from '../types';

// Defining our palette items
const TRIGGERS = [
  { type: 'crm:contact_created', label: 'Contact Created', icon: Users, color: 'bg-blue-500' },
  { type: 'form:submission', label: 'Form Submitted', icon: Zap, color: 'bg-orange-500' },
  { type: 'schedule:cron', label: 'Schedule / Chron', icon: Clock, color: 'bg-green-500' },
  { type: 'webhook:incoming', label: 'Webhook', icon: GitBranch, color: 'bg-purple-500' },
];

const ACTIONS = [
  { type: 'communication:send_email', label: 'Send Email', icon: Mail, color: 'bg-indigo-500' },
  { type: 'communication:send_sms', label: 'Send SMS', icon: MessageSquare, color: 'bg-sky-500' },
  { type: 'crm:update_contact', label: 'Update Contact', icon: Users, color: 'bg-blue-600' },
  { type: 'logic:condition', label: 'Condition (If/Else)', icon: GitBranch, color: 'bg-gray-600' },
  { type: 'logic:delay', label: 'Wait / Delay', icon: Clock, color: 'bg-amber-600' },
];

// AI Agent Actions - Orchestrator
const AGENT_ORCHESTRATOR = [
  { type: 'agent:orchestrate', label: 'Orchestrate Tasks', icon: Workflow, color: 'bg-rose-500', agentType: 'orchestrator' },
  { type: 'agent:route', label: 'Route by Intent', icon: GitBranch, color: 'bg-rose-600', agentType: 'orchestrator' },
];

// AI Agent Actions - CRM
const AGENT_CRM = [
  { type: 'agent:crm_find', label: 'Find Contact', icon: Search, color: 'bg-blue-500', agentType: 'crm' },
  { type: 'agent:crm_create', label: 'Create Contact', icon: UserPlus, color: 'bg-blue-600', agentType: 'crm' },
  { type: 'agent:crm_update', label: 'Update Contact', icon: UserCog, color: 'bg-blue-700', agentType: 'crm' },
  { type: 'agent:crm_enrich', label: 'Enrich Contact', icon: Sparkles, color: 'bg-cyan-500', agentType: 'crm' },
  { type: 'agent:crm_score', label: 'Score Lead', icon: Star, color: 'bg-yellow-500', agentType: 'crm' },
  { type: 'agent:crm_duplicates', label: 'Find Duplicates', icon: Copy, color: 'bg-slate-500', agentType: 'crm' },
  { type: 'agent:crm_suggest', label: 'Suggest Next Action', icon: Lightbulb, color: 'bg-amber-500', agentType: 'crm' },
];

// AI Agent Actions - Marketing
const AGENT_MARKETING = [
  { type: 'agent:marketing_generate', label: 'Generate Campaign', icon: Megaphone, color: 'bg-purple-500', agentType: 'marketing' },
  { type: 'agent:marketing_segment', label: 'Segment Audience', icon: Users, color: 'bg-fuchsia-500', agentType: 'marketing' },
  { type: 'agent:marketing_optimize', label: 'Optimize Send Time', icon: Clock, color: 'bg-violet-500', agentType: 'marketing' },
  { type: 'agent:marketing_analyze', label: 'Analyze Performance', icon: TrendingUp, color: 'bg-indigo-500', agentType: 'marketing' },
  { type: 'agent:marketing_template', label: 'Generate Template', icon: FileText, color: 'bg-pink-500', agentType: 'marketing' },
  { type: 'agent:marketing_personalize', label: 'Personalize Content', icon: Sparkles, color: 'bg-rose-500', agentType: 'marketing' },
];

// AI Agent Actions - Analytics
const AGENT_ANALYTICS = [
  { type: 'agent:analytics_report', label: 'Generate Report', icon: FileText, color: 'bg-emerald-500', agentType: 'analytics' },
  { type: 'agent:analytics_trends', label: 'Detect Trends', icon: TrendingUp, color: 'bg-teal-500', agentType: 'analytics' },
  { type: 'agent:analytics_forecast', label: 'Forecast Metrics', icon: LineChart, color: 'bg-green-500', agentType: 'analytics' },
  { type: 'agent:analytics_anomaly', label: 'Detect Anomalies', icon: AlertTriangle, color: 'bg-red-500', agentType: 'analytics' },
  { type: 'agent:analytics_dashboard', label: 'Create Dashboard', icon: LayoutGrid, color: 'bg-lime-500', agentType: 'analytics' },
];

// AI Agent Actions - Builder
const AGENT_BUILDER = [
  { type: 'agent:builder_layout', label: 'Suggest Layout', icon: Layout, color: 'bg-orange-500', agentType: 'builder' },
  { type: 'agent:builder_copy', label: 'Generate Copy', icon: Type, color: 'bg-amber-500', agentType: 'builder' },
  { type: 'agent:builder_optimize', label: 'Optimize Conversion', icon: Zap, color: 'bg-yellow-500', agentType: 'builder' },
  { type: 'agent:builder_variant', label: 'Create Variant', icon: GitBranch, color: 'bg-orange-600', agentType: 'builder' },
  { type: 'agent:builder_analyze', label: 'Analyze Performance', icon: BarChart3, color: 'bg-amber-600', agentType: 'builder' },
];

// AI Agent Actions - Workflow
const AGENT_WORKFLOW = [
  { type: 'agent:workflow_suggest', label: 'Suggest Automation', icon: Lightbulb, color: 'bg-cyan-500', agentType: 'workflow' },
  { type: 'agent:workflow_optimize', label: 'Optimize Workflow', icon: Zap, color: 'bg-sky-500', agentType: 'workflow' },
  { type: 'agent:workflow_bottleneck', label: 'Detect Bottlenecks', icon: AlertTriangle, color: 'bg-blue-500', agentType: 'workflow' },
  { type: 'agent:workflow_generate', label: 'Generate Workflow', icon: Workflow, color: 'bg-indigo-500', agentType: 'workflow' },
];

// Combine all agent actions (available for future use)
/* eslint-disable */
// @ts-ignore: TS6133 - reserved for future use
const _AGENT_ACTIONS = [
  ...AGENT_ORCHESTRATOR,
  ...AGENT_CRM,
  ...AGENT_MARKETING,
  ...AGENT_ANALYTICS,
  ...AGENT_BUILDER,
  ...AGENT_WORKFLOW,
];

export const NodePalette = () => {
  const onDragStart = (event: React.DragEvent, nodeType: TriggerType | ActionType, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Triggers</h3>
        <div className="space-y-2">
          {TRIGGERS.map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-sm transition-all"
              draggable
              onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
            >
              <div className={`p-1.5 rounded-md text-white ${item.color}`}>
                <item.icon size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h3>
        <div className="space-y-2">
          {ACTIONS.map((item) => (
            <div
              key={item.type}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:shadow-sm transition-all"
              draggable
              onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
            >
              <div className={`p-1.5 rounded-md text-white ${item.color}`}>
                <item.icon size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bot size={14} />
          AI Agents
        </h3>
        <div className="space-y-3">
          {/* Orchestrator */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1.5">Orchestrator</h4>
            <div className="space-y-1.5">
              {AGENT_ORCHESTRATOR.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded cursor-grab hover:border-rose-400 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
                >
                  <div className={`p-1 rounded text-white ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CRM */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1.5">CRM</h4>
            <div className="space-y-1.5">
              {AGENT_CRM.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded cursor-grab hover:border-blue-400 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
                >
                  <div className={`p-1 rounded text-white ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1.5">Marketing</h4>
            <div className="space-y-1.5">
              {AGENT_MARKETING.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded cursor-grab hover:border-purple-400 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
                >
                  <div className={`p-1 rounded text-white ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1.5">Analytics</h4>
            <div className="space-y-1.5">
              {AGENT_ANALYTICS.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded cursor-grab hover:border-emerald-400 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
                >
                  <div className={`p-1 rounded text-white ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Builder */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1.5">Builder</h4>
            <div className="space-y-1.5">
              {AGENT_BUILDER.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded cursor-grab hover:border-orange-400 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
                >
                  <div className={`p-1 rounded text-white ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-1.5">Workflow</h4>
            <div className="space-y-1.5">
              {AGENT_WORKFLOW.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-2 p-2 bg-cyan-50 border border-cyan-200 rounded cursor-grab hover:border-cyan-400 hover:shadow-sm transition-all"
                  draggable
                  onDragStart={(e) => onDragStart(e, item.type as any, item.label)}
                >
                  <div className={`p-1 rounded text-white ${item.color}`}>
                    <item.icon size={14} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
