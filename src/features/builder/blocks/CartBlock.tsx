import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { ShoppingCart } from 'lucide-react';
import type { Block } from '../types';

interface CartBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const CartBlock: React.FC<CartBlockProps> = ({
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
      className={cn('relative group transition-all border rounded-lg p-6', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Shopping Cart</span>
        </div>
      )}
      <div className="flex items-center gap-4 mb-6">
        <ShoppingCart size={32} className="text-blue-600" />
        <h3 className="text-xl font-bold">Your Cart</h3>
      </div>
      <div className="text-center text-gray-400 py-8">
        <p>Your cart is empty</p>
      </div>
      {block.props.showSummary && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>$0.00</span>
          </div>
        </div>
      )}
    </div>
  );
};
