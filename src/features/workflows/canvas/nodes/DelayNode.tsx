/**
 * Delay Node Component
 * Represents wait/delay actions in workflows
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import type { DelayNodeData } from '../../../../lib/workflows/types';

// Unit display mapping
const UNIT_LABELS: Record<string, string> = {
  milliseconds: 'ms',
  seconds: 'sec',
  minutes: 'min',
  hours: 'hr',
  days: 'day',
};

export const DelayNode = memo((props: NodeProps) => {
  const data = props.data as DelayNodeData;
  const selected = props.selected;
  const duration = data.duration || 1000;
  const unit = data.unit || 'milliseconds';
  const unitLabel = UNIT_LABELS[unit] || 'ms';

  // Format duration for display
  const formatDuration = (value: number, u: string) => {
    if (u === 'milliseconds') return `${value}ms`;
    if (u === 'seconds') return `${value}s`;
    if (u === 'minutes') return `${value}m`;
    if (u === 'hours') return `${value}h`;
    if (u === 'days') return `${value}d`;
    return `${value}${unitLabel}`;
  };

  return (
    <div
      className={`
        relative px-4 py-3 rounded-lg border-2 min-w-[180px] max-w-[260px]
        ${selected ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : 'border-purple-300 shadow-sm'}
        bg-purple-50 hover:shadow-md transition-all
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500 !border-2 !border-purple-700 !w-3 !h-3"
      />

      {/* Node Header */}
      <div className="flex items-center gap-3">
        {/* Delay Icon */}
        <div className="p-2 rounded-lg bg-purple-200 shadow-sm">
          <Clock size={18} className="text-purple-700" />
        </div>

        {/* Delay Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-purple-700" />
            <span className="font-bold text-gray-800 text-sm">Delay</span>
          </div>
          <span className="text-xs text-gray-600 mt-0.5 block">
            {data.label || 'Wait...'}
          </span>
        </div>
      </div>

      {/* Duration Display */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-center">
          <span className="text-2xl font-bold text-purple-700">
            {formatDuration(duration, unit)}
          </span>
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="mt-2 pt-2 border-t border-purple-200">
          <p className="text-xs text-gray-600 line-clamp-2 text-center">{data.description}</p>
        </div>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-purple-500 !border-2 !border-purple-700 !w-3 !h-3"
      />
    </div>
  );
});

DelayNode.displayName = 'DelayNode';
