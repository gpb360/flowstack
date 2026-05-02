import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Block } from '../types';

interface SliderBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const SliderBlock: React.FC<SliderBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const [currentIndex, setCurrentIndex] = useState(0);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const images = block.props.images || [];

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles, position: 'relative' } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none z-20">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Slider</span>
        </div>
      )}
      {images.length > 0 && (
        <>
          <img src={images[currentIndex].src} alt={images[currentIndex].alt || ''} className="w-full h-auto" />
          {block.props.showArrows && images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white">
                <ChevronRight size={20} />
              </button>
            </>
          )}
          {block.props.showDots && images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_src: string, idx: number) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} className={cn('w-2 h-2 rounded-full', idx === currentIndex ? 'bg-white' : 'bg-white/50')} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
