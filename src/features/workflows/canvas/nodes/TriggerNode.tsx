/**
 * Trigger Node Component
 * Represents workflow trigger/start events
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Zap, Users, Clock, GitBranch, FileText, Calendar } from 'lucide-react';
import type { TriggerNodeData } from '../../../../lib/workflows/types';

// Trigger type configurations
const TRIGGER_CONFIG: Record<string, { icon: typeof Zap; color: string; bgColor: string; label: string }> = {
  'webhook:incoming': {
    icon: GitBranch,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Webhook',
  },
  'schedule:cron': {
    icon: Clock,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Scheduled',
  },
  'manual': {
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    label: 'Manual',
  },
  'form:submission': {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Form Submitted',
  },
  'crm:contact_created': {
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    label: 'Contact Created',
  },
  'crm:contact_updated': {
    icon: Users,
    color: 'text-sky-600',
    bgColor: 'bg-sky-100',
    label: 'Contact Updated',
  },
  'crm:deal_stage_changed': {
    icon: GitBranch,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    label: 'Deal Stage Changed',
  },
  'marketing:email_opened': {
    icon: Calendar,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Email Opened',
  },
  'marketing:email_clicked': {
    icon: Calendar,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    label: 'Email Clicked',
  },
  'builder:page_published': {
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Page Published',
  },
};

export const TriggerNode = memo((props: NodeProps) => {
  const data = props.data as TriggerNodeData;
  const selected = props.selected;
  const triggerType = data.trigger?.type || 'manual';
  const config = TRIGGER_CONFIG[triggerType] || TRIGGER_CONFIG.manual;
  const Icon = config.icon;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[280px]
        ${selected ? 'border-green-500 shadow-lg ring-2 ring-green-200' : 'border-green-300 shadow-sm'}
        ${config.bgColor} hover:shadow-md transition-all
      `}
    >
      {/* Source Handle - triggers only have outputs */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500 !border-2 !border-green-700 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* Trigger Icon */}
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <Icon size={18} className={config.color} />
        </div>

        {/* Trigger Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-green-600" />
            <span className="font-bold text-gray-800 text-sm">Trigger</span>
          </div>
          <span className="text-xs font-semibold text-gray-700 mt-0.5 block">
            {config.label}
          </span>
        </div>
      </div>

      {/* Trigger Description */}
      {data.description && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 line-clamp-2">{data.description}</p>
        </div>
      )}

      {/* Trigger Config Summary */}
      {data.trigger?.config && Object.keys(data.trigger.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            {Object.keys(data.trigger.config).length} configuration parameter
            {Object.keys(data.trigger.config).length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Enabled Badge */}
      {data.trigger?.enabled !== undefined && (
        <div className="mt-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            data.trigger.enabled
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {data.trigger.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      )}
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
