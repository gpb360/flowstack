import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { CreditCard } from 'lucide-react';
import type { Block } from '../types';

interface CheckoutBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const CheckoutBlock: React.FC<CheckoutBlockProps> = ({
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
      className={cn('relative group transition-all max-w-2xl mx-auto p-6 border rounded-lg', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Checkout</span>
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <CreditCard size={28} className="text-blue-600" />
        <h2 className="text-2xl font-bold">Checkout</h2>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Card Number</label>
          <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 border rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Expiry</label>
            <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CVC</label>
            <input type="text" placeholder="123" className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">
          Pay Now
        </button>
      </form>
    </div>
  );
};
