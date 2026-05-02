/**
 * Action Node Component
 * Represents workflow actions
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Play,
  Mail,
  MessageSquare,
  Users,
  UserPlus,
  Pencil,
  Clock,
  GitBranch,
  FileText,
  Globe,
  Database,
  Sparkles,
} from 'lucide-react';
import type { ActionNodeData } from '../../../../lib/workflows/types';

// Action type configurations
const ACTION_CONFIG: Record<string, { icon: typeof Play; color: string; bgColor: string; category: string }> = {
  // CRM Actions
  'crm:create_contact': {
    icon: UserPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'CRM',
  },
  'crm:update_contact': {
    icon: Pencil,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    category: 'CRM',
  },
  'crm:delete_contact': {
    icon: Users,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    category: 'CRM',
  },
  'crm:create_note': {
    icon: FileText,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'CRM',
  },
  'crm:change_deal_stage': {
    icon: GitBranch,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    category: 'CRM',
  },
  'crm:assign_owner': {
    icon: Users,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    category: 'CRM',
  },

  // Communication Actions
  'communication:send_email': {
    icon: Mail,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    category: 'Communication',
  },
  'communication:send_sms': {
    icon: MessageSquare,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    category: 'Communication',
  },

  // Marketing Actions
  'marketing:add_to_sequence': {
    icon: GitBranch,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    category: 'Marketing',
  },
  'marketing:remove_from_sequence': {
    icon: GitBranch,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    category: 'Marketing',
  },
  'marketing:add_tag': {
    icon: Sparkles,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    category: 'Marketing',
  },
  'marketing:remove_tag': {
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    category: 'Marketing',
  },
  'marketing:send_campaign': {
    icon: Mail,
    color: 'text-fuchsia-600',
    bgColor: 'bg-fuchsia-50',
    category: 'Marketing',
  },

  // Builder Actions
  'builder:publish_page': {
    icon: Globe,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    category: 'Builder',
  },
  'builder:update_site': {
    icon: Database,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'Builder',
  },

  // Logic Actions
  'logic:delay': {
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    category: 'Logic',
  },
  'logic:condition': {
    icon: GitBranch,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    category: 'Logic',
  },
  'logic:parallel': {
    icon: GitBranch,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    category: 'Logic',
  },
  'logic:merge': {
    icon: GitBranch,
    color: 'text-zinc-600',
    bgColor: 'bg-zinc-50',
    category: 'Logic',
  },
  'logic:loop': {
    icon: GitBranch,
    color: 'text-stone-600',
    bgColor: 'bg-stone-50',
    category: 'Logic',
  },

  // Data Actions
  'data:transform': {
    icon: Database,
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    category: 'Data',
  },
  'data:filter': {
    icon: Database,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    category: 'Data',
  },
  'data:map': {
    icon: Database,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    category: 'Data',
  },
  'data:aggregate': {
    icon: Database,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    category: 'Data',
  },

  // HTTP Actions
  'http:request': {
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'HTTP',
  },

  // AI Agent Actions (default)
  'agent:orchestrate': {
    icon: Sparkles,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    category: 'AI Agent',
  },
};

export const ActionNode = memo((props: NodeProps) => {
  const data = props.data as ActionNodeData;
  const selected = props.selected;
  const actionType = data.actionType || 'logic:delay';
  const config = ACTION_CONFIG[actionType] || {
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    category: 'Action',
  };
  const Icon = config.icon;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[280px]
        ${selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-blue-300 shadow-sm'}
        ${config.bgColor} hover:shadow-md transition-all
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-2 !border-blue-700 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* Action Icon */}
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <Icon size={18} className={config.color} />
        </div>

        {/* Action Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Play size={14} className="text-blue-600" />
            <span className="font-bold text-gray-800 text-xs">{config.category}</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 mt-0.5 block truncate">
            {data.label}
          </span>
        </div>
      </div>

      {/* Action Description */}
      {data.description && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">{data.description}</p>
        </div>
      )}

      {/* Config Summary */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {Object.keys(data.config).length} parameter
            {Object.keys(data.config).length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Retry Config Badge */}
      {data.retryConfig && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            Retry: {data.retryConfig.maxAttempts}x
          </span>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-2 !border-blue-700 !w-3 !h-3"
      />
    </div>
  );
});

ActionNode.displayName = 'ActionNode';
