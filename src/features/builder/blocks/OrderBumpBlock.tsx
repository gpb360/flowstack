import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { Gift } from 'lucide-react';
import type { Block } from '../types';

interface OrderBumpBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const OrderBumpBlock: React.FC<OrderBumpBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all border-2 border-yellow-400 bg-yellow-50 rounded-lg p-4', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Order Bump</span>
        </div>
      )}
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" defaultChecked={block.props.checked} className="mt-1 w-5 h-5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={18} className="text-yellow-600" />
            <span className="font-bold text-lg">{block.props.name}</span>
          </div>
          {block.props.description && <p className="text-gray-600 text-sm mb-2">{block.props.description}</p>}
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
            Add for {block.props.price}
          </span>
        </div>
      </label>
    </div>
  );
};
