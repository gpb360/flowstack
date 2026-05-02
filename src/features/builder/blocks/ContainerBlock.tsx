import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface ContainerBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const ContainerBlock: React.FC<ContainerBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getMaxWidth = () => {
    switch (block.props.maxWidth) {
      case 'sm':
        return '640px';
      case 'md':
        return '768px';
      case 'lg':
        return '1024px';
      case 'xl':
        return '1280px';
      case 'full':
        return '100%';
      default:
        return '1024px';
    }
  };

  const blockStyles = block.styles.desktop || {};

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...blockStyles,
        maxWidth: block.props.maxWidth ? getMaxWidth() : blockStyles.maxWidth,
        marginLeft: block.props.centerContent ? 'auto' : blockStyles.marginLeft,
        marginRight: block.props.centerContent ? 'auto' : blockStyles.marginRight,
      } as React.CSSProperties}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'relative group transition-all',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10',
        isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2',
        !block.visible && 'hidden'
      )}
    >
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 left-0 flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            <span>Container</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
