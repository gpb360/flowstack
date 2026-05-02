/**
 * Agent Node Component
 * Custom node for AI agent actions in the workflow builder
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Bot,
  Workflow,
  Users,
  Mail,
  BarChart3,
  Layout,
  Zap,
} from 'lucide-react';
import type { AgentNodeData } from '../../types';

// Agent type icons and colors
const AGENT_CONFIG: Record<string, { icon: typeof Bot; color: string; bgColor: string }> = {
  orchestrator: { icon: Workflow, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  crm: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  marketing: { icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  analytics: { icon: BarChart3, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  builder: { icon: Layout, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  workflow: { icon: Zap, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
};

// Status indicator component
const StatusIndicator = ({ status }: { status: 'idle' | 'running' | 'completed' | 'failed' }) => {
  const statusColors: Record<string, string> = {
    idle: 'bg-gray-300',
    running: 'bg-blue-500 animate-pulse',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
  );
};

export const AgentNode = memo((props: NodeProps) => {
  const data = props.data as AgentNodeData;
  const selected = props.selected;
  const agentType = data.agentType || 'orchestrator';
  const config = AGENT_CONFIG[agentType] || AGENT_CONFIG.orchestrator;
  const Icon = config.icon;
  const status = (data.status as any) || 'idle';

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[200px] max-w-[280px]
        ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-300 shadow-sm'}
        bg-white hover:shadow-md transition-all
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !border-2 !border-gray-600"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* Agent Icon */}
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Icon size={18} className={config.color} />
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-sm truncate">{data.label}</span>
            <StatusIndicator status={status} />
          </div>
          <span className="text-xs text-gray-500">
            {data.agentAction || 'Agent Action'}
          </span>
        </div>
      </div>

      {/* Agent Type Badge */}
      <div className="mt-2 flex items-center gap-1.5">
        <Bot size={12} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-500 capitalize">
          {agentType} Agent
        </span>
      </div>

      {/* Configuration Summary (if exists) */}
      {data.config && Object.keys(data.config).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            {Object.keys(data.config).length} configuration parameter
            {Object.keys(data.config).length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !border-2 !border-gray-600"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';

// Export node type for React Flow registration
export const agentNodeType = 'agentNode';
