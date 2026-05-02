import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface SectionBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
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

  // Get responsive styles based on view mode
  const getResponsiveStyles = () => {
    return block.styles.desktop || {};
  };

  const blockStyles = getResponsiveStyles();

  return (
    <section
      ref={setNodeRef}
      style={{ ...style, ...blockStyles } as React.CSSProperties}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'relative group transition-all',
        block.props.fullWidth && 'w-full',
        !block.props.fullWidth && 'max-w-7xl mx-auto',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10',
        isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2',
        !block.visible && 'hidden'
      )}
    >
      {/* Edit overlay */}
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-8 left-0 flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
            <span>Section</span>
          </div>
        </div>
      )}

      {children}
    </section>
  );
};
