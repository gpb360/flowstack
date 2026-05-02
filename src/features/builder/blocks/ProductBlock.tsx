import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { ShoppingCart } from 'lucide-react';
import type { Block } from '../types';

interface ProductBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const ProductBlock: React.FC<ProductBlockProps> = ({
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
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Product</span>
        </div>
      )}
      {block.props.image && <img src={block.props.image} alt={block.props.name} className="w-full h-48 object-cover rounded mb-4" />}
      <h3 className="text-xl font-bold mb-2">{block.props.name}</h3>
      {block.props.description && <p className="text-gray-600 mb-4">{block.props.description}</p>}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl font-bold">{block.props.price}</span>
        {block.props.compareAtPrice && <span className="text-lg text-gray-400 line-through">{block.props.compareAtPrice}</span>}
      </div>
      <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
        <ShoppingCart size={18} />
        {block.props.buttonText || 'Add to Cart'}
      </button>
    </div>
  );
};
