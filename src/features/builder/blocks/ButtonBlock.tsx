import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface ButtonBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
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

  const blockStyles = block.styles.desktop || {};
  const variant = (block.props.variant || 'primary') as 'primary' | 'secondary' | 'outline' | 'ghost';
  const size = (block.props.size || 'md') as 'sm' | 'md' | 'lg';

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'relative group transition-all',
        block.props.fullWidth && 'w-full',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10',
        isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2',
        !block.visible && 'hidden'
      )}
    >
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
            Button
          </span>
        </div>
      )}

      <a
        href={block.props.link || '#'}
        target={block.props.openInNewTab ? '_blank' : undefined}
        rel={block.props.openInNewTab ? 'noopener noreferrer' : undefined}
        onClick={(e) => e.stopPropagation()}
        style={blockStyles as React.CSSProperties}
        className={cn(
          'inline-block font-medium rounded-lg transition-colors cursor-pointer',
          sizeClasses[size],
          variantClasses[variant]
        )}
      >
        {block.props.text || 'Click Me'}
      </a>
    </div>
  );
};
