import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface GalleryBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const images = block.props.images || [];
  const columns = block.props.columns || 4;

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles, display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: block.props.gap || '16px' } as React.CSSProperties}
      {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none z-10">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Gallery ({columns} columns)</span>
        </div>
      )}
      {images.map((img: any, idx: number) => (
        <img key={idx} src={img.src} alt={img.alt || ''} className="w-full h-auto" />
      ))}
    </div>
  );
};
