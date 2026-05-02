/**
 * Parallel Node Component
 * Represents parallel execution of multiple branches
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import type { ParallelNodeData } from '../../../../lib/workflows/types';

export const ParallelNode = memo((props: NodeProps) => {
  const data = props.data as ParallelNodeData;
  const selected = props.selected;
  const branches = data.branches || 2;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[180px] max-w-[260px]
        ${selected ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' : 'border-indigo-300 shadow-sm'}
        bg-indigo-50 hover:shadow-md transition-all
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-indigo-500 !border-2 !border-indigo-700 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* Parallel Icon */}
        <div className="p-2 rounded-lg bg-indigo-200 shadow-sm">
          <GitBranch size={18} className="text-indigo-700" />
        </div>

        {/* Parallel Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-indigo-700" />
            <span className="font-bold text-gray-800 text-sm">Parallel</span>
          </div>
          <span className="text-xs text-gray-600 mt-0.5 block">
            {data.label || 'Execute in parallel'}
          </span>
        </div>
      </div>

      {/* Branch Count Display */}
      <div className="mt-3 pt-3 border-t border-indigo-200">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs text-gray-600">Branches:</span>
          <span className="text-xl font-bold text-indigo-700">{branches}</span>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="mt-2 pt-2 border-t border-indigo-200">
          <p className="text-xs text-gray-600 line-clamp-2 text-center">{data.description}</p>
        </div>
      )}

      {/* Multiple Output Handles for branches */}
      {Array.from({ length: Math.min(branches, 4) }).map((_, index) => {
        const leftOffset = branches === 1 ? 50 : (index / (branches - 1)) * 80 + 10;
        return (
          <Handle
            key={index}
            type="source"
            position={Position.Bottom}
            id={`branch-${index}`}
            className="!bg-indigo-500 !border-2 !border-indigo-700 !w-3 !h-3"
            style={{ left: `${leftOffset}%` }}
          />
        );
      })}
    </div>
  );
});

ParallelNode.displayName = 'ParallelNode';
