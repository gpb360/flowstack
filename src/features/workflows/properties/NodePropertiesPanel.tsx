/**
 * Node Properties Panel Component
 * Allows editing of node configurations
 */

import { type Node } from '@xyflow/react';
import { X, Settings, GitBranch, Clock, Sparkles } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TriggerNodeProperties } from './TriggerNodeProperties';
import { ActionNodeProperties } from './ActionNodeProperties';
import { ConditionNodeProperties } from './ConditionNodeProperties';
import { DelayNodeProperties } from './DelayNodeProperties';
import { AgentNodeProperties } from './AgentNodeProperties';

interface NodePropertiesPanelProps {
  node: Node;
  onUpdate: (data: any) => void;
  onClose: () => void;
}

export const NodePropertiesPanel = ({ node, onUpdate, onClose }: NodePropertiesPanelProps) => {
  const nodeType = node.type;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          {nodeType === 'trigger' && <Settings size={16} className="text-green-600" />}
          {nodeType === 'action' && <Sparkles size={16} className="text-blue-600" />}
          {nodeType === 'condition' && <GitBranch size={16} className="text-yellow-600" />}
          {nodeType === 'delay' && <Clock size={16} className="text-purple-600" />}
          {nodeType === 'parallel' && <GitBranch size={16} className="text-indigo-600" />}
          {nodeType === 'agentNode' && <Sparkles size={16} className="text-rose-600" />}
          <span className="font-semibold text-gray-800 capitalize">{nodeType} Properties</span>
        </div>
        <ButtonUntitled variant="ghost" size="sm" isIconOnly onClick={onClose}>
          <X size={16} />
        </ButtonUntitled>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Common Properties for all nodes */}
        <div className="mb-6">
          <InputUntitled
            label="Label"
            value={(node.data as any).label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Enter node label..."
          />
        </div>

        <div className="mb-6">
          <InputUntitled
            label="Description"
            value={(node.data as any).description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Enter description..."
          />
        </div>

        {/* Type-specific properties */}
        {nodeType === 'trigger' && <TriggerNodeProperties node={node} onUpdate={onUpdate} />}

        {nodeType === 'action' && <ActionNodeProperties node={node} onUpdate={onUpdate} />}

        {nodeType === 'condition' && <ConditionNodeProperties node={node} onUpdate={onUpdate} />}

        {nodeType === 'delay' && <DelayNodeProperties node={node} onUpdate={onUpdate} />}

        {nodeType === 'parallel' && (
          <div className="text-sm text-gray-500">
            <p>Parallel node properties</p>
            <p className="text-xs mt-1">Configure branch count and execution mode</p>
          </div>
        )}

        {nodeType === 'agentNode' && (
          <AgentNodeProperties node={node} onUpdate={onUpdate} />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          Node ID: <code className="bg-gray-200 px-1 py-0.5 rounded">{node.id}</code>
        </div>
      </div>
    </div>
  );
};
