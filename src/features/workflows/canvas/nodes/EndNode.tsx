/**
 * End Node Component
 * Represents the end/termination of a workflow
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Square } from 'lucide-react';
import type { EndNodeData } from '../../../../lib/workflows/types';

export const EndNode = memo((props: NodeProps) => {
  const data = props.data as EndNodeData;
  const selected = props.selected;
  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[160px] max-w-[240px]
        ${selected ? 'border-gray-700 shadow-lg ring-2 ring-gray-400' : 'border-gray-500 shadow-sm'}
        bg-gray-100 hover:shadow-md transition-all
      `}
    >
      {/* Input Handle - end nodes only have inputs */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-700 !border-2 !border-gray-900 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* End Icon */}
        <div className="p-2 rounded-lg bg-gray-300 shadow-sm">
          <Square size={18} className="text-gray-800" />
        </div>

        {/* End Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Square size={14} className="text-gray-800" />
            <span className="font-bold text-gray-800 text-sm">End</span>
          </div>
          <span className="text-xs text-gray-600 mt-0.5 block">
            {data.label || 'Workflow Complete'}
          </span>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <p className="text-xs text-gray-600 line-clamp-2">{data.description}</p>
        </div>
      )}

      {/* Output Summary */}
      {data.output && Object.keys(data.output).length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <div className="text-xs text-gray-500">
            Returns {Object.keys(data.output).length} value
            {Object.keys(data.output).length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
});

EndNode.displayName = 'EndNode';
