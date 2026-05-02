/**
 * Condition Node Component
 * Represents conditional branching logic (if/else)
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch, Check, X } from 'lucide-react';
import type { ConditionNodeData } from '../../../../lib/workflows/types';

export const ConditionNode = memo((props: NodeProps) => {
  const data = props.data as ConditionNodeData;
  const selected = props.selected;
  const conditions = data.conditions || { operator: 'and', conditions: [] };
  const conditionCount = conditions.conditions.length;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[220px] max-w-[300px]
        ${selected ? 'border-yellow-500 shadow-lg ring-2 ring-yellow-200' : 'border-yellow-400 shadow-sm'}
        bg-yellow-50 hover:shadow-md transition-all
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-yellow-500 !border-2 !border-yellow-700 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* Condition Icon */}
        <div className="p-2 rounded-lg bg-yellow-200 shadow-sm">
          <GitBranch size={18} className="text-yellow-700" />
        </div>

        {/* Condition Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-yellow-700" />
            <span className="font-bold text-gray-800 text-sm">Condition</span>
          </div>
          <span className="text-xs text-gray-600 mt-0.5 block">
            {data.label || 'If... Then... Else...'}
          </span>
        </div>
      </div>

      {/* Condition Details */}
      {conditionCount > 0 && (
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <div className="text-xs text-gray-600 mb-2">
            {conditionCount} condition{conditionCount !== 1 ? 's' : ''}
          </div>

          {/* Show first few conditions */}
          {conditions.conditions.slice(0, 2).map((condition, index) => (
            <div key={index} className="text-xs text-gray-600 mb-1 flex items-center gap-1">
              <span className="font-medium">{condition.field}</span>
              <span className="text-gray-400">{condition.operator}</span>
              <span className="text-gray-600">{String(condition.value).substring(0, 15)}</span>
            </div>
          ))}

          {conditionCount > 2 && (
            <div className="text-xs text-gray-400 mt-1">
              +{conditionCount - 2} more
            </div>
          )}
        </div>
      )}

      {/* Operator Badge */}
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800">
          {conditions.operator === 'and' ? 'AND' : 'OR'}
        </span>
      </div>

      {/* Branch Labels */}
      <div className="mt-3 flex justify-between text-xs">
        <div className="flex items-center gap-1">
          <Check size={12} className="text-green-600" />
          <span className="font-medium text-green-700">True</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-red-700">False</span>
          <X size={12} className="text-red-600" />
        </div>
      </div>

      {/* True Branch Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !border-2 !border-green-700 !w-3 !h-3"
        style={{ left: '30%' }}
      />

      {/* False Branch Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !border-2 !border-red-700 !w-3 !h-3"
        style={{ left: '70%' }}
      />
    </div>
  );
});

ConditionNode.displayName = 'ConditionNode';
