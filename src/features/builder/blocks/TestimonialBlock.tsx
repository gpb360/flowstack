import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { Star, Quote } from 'lucide-react';
import type { Block } from '../types';

interface TestimonialBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const rating = block.props.rating || 5;

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Testimonial</span>
        </div>
      )}
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Quote size={32} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg italic mb-4">"{block.props.quote || 'This is an amazing product!'}"</p>
        <div className="flex justify-center mb-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star key={idx} size={16} className={idx < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
          ))}
        </div>
        <div className="font-semibold">{block.props.author || 'John Doe'}</div>
        <div className="text-sm text-gray-500">{block.props.role && `${block.props.role}`}{block.props.role && block.props.company && ', '} {block.props.company}</div>
      </div>
    </div>
  );
};
