import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface CheckboxBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const CheckboxBlock: React.FC<CheckboxBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const options = block.props.options || [];
  const inputType = block.props.type || 'checkbox';

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">{inputType === 'radio' ? 'Radio' : 'Checkbox'}</span>
        </div>
      )}
      {block.props.label && (
        <label className="block text-sm font-medium mb-2">
          {block.props.label}
          {block.props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt: any, idx: number) => (
          <label key={idx} className="flex items-center gap-2 cursor-pointer">
            <input type={inputType} name={block.props.name} value={opt.value} required={block.props.required} className="w-4 h-4" />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
