import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface ImageBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
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
  const ImageContent = (
    <img
        src={block.props.src || '/placeholder-image.svg'}
      alt={block.props.alt || 'Image'}
      style={{
        width: block.props.width || '100%',
        height: block.props.height || 'auto',
        objectFit: block.props.objectFit || 'cover',
        display: 'block',
      }}
    />
  );

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...blockStyles } as React.CSSProperties}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'relative group transition-all inline-block',
        isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10',
        isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2',
        !block.visible && 'hidden'
      )}
    >
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
            Image
          </span>
        </div>
      )}

      {block.props.link ? (
        <a
          href={block.props.link}
          target={block.props.openInNewTab ? '_blank' : undefined}
          rel={block.props.openInNewTab ? 'noopener noreferrer' : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {ImageContent}
        </a>
      ) : (
        ImageContent
      )}
    </div>
  );
};
