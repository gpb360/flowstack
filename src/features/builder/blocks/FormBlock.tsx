import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface FormBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const FormBlock: React.FC<FormBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};

  return (
    <form ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick} onSubmit={(e) => e.preventDefault()}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Form</span>
        </div>
      )}
      {children || (
        <div className="flex flex-col gap-4">
          <p className="text-gray-400">Drop form fields here</p>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            {block.props.submitButtonText || 'Submit'}
          </button>
        </div>
      )}
    </form>
  );
};
