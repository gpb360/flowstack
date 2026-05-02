import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface ProgressBarBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const ProgressBarBlock: React.FC<ProgressBarBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const progress = Math.min(100, Math.max(0, block.props.progress || 0));
  const height = block.props.height || '8px';

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Progress Bar</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden" style={{ height }}>
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: block.props.color || '#3b82f6',
            animation: block.props.animated ? 'pulse 2s infinite' : undefined,
          }}
        />
      </div>
      {block.props.showLabel && (
        <div className="text-center mt-2 text-sm font-medium">{progress}%</div>
      )}
    </div>
  );
};
