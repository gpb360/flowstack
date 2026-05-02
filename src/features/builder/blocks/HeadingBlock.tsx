import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface HeadingBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
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
  const level = block.props.level || 2;
  const content = block.props.content || `Heading ${level}`;

  // Common props for all heading tags
  const commonProps = {
    ref: setNodeRef,
    style: { ...style, ...blockStyles } as React.CSSProperties,
    ...attributes,
    ...listeners,
    onClick,
    className: cn(
      'relative group transition-all cursor-text',
      isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10',
      isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2',
      !block.visible && 'hidden'
    ),
  };

  // Render the appropriate heading tag based on level
  switch (level) {
    case 1:
      return (
        <h1 {...commonProps}>
          {(isSelected || isHovered) && !block.locked && (
            <div className="absolute -top-6 left-0 pointer-events-none">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                H1
              </span>
            </div>
          )}
          {content}
        </h1>
      );
    case 2:
      return (
        <h2 {...commonProps}>
          {(isSelected || isHovered) && !block.locked && (
            <div className="absolute -top-6 left-0 pointer-events-none">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                H2
              </span>
            </div>
          )}
          {content}
        </h2>
      );
    case 3:
      return (
        <h3 {...commonProps}>
          {(isSelected || isHovered) && !block.locked && (
            <div className="absolute -top-6 left-0 pointer-events-none">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                H3
              </span>
            </div>
          )}
          {content}
        </h3>
      );
    case 4:
      return (
        <h4 {...commonProps}>
          {(isSelected || isHovered) && !block.locked && (
            <div className="absolute -top-6 left-0 pointer-events-none">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                H4
              </span>
            </div>
          )}
          {content}
        </h4>
      );
    case 5:
      return (
        <h5 {...commonProps}>
          {(isSelected || isHovered) && !block.locked && (
            <div className="absolute -top-6 left-0 pointer-events-none">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                H5
              </span>
            </div>
          )}
          {content}
        </h5>
      );
    default:
      return (
        <h6 {...commonProps}>
          {(isSelected || isHovered) && !block.locked && (
            <div className="absolute -top-6 left-0 pointer-events-none">
              <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                H6
              </span>
            </div>
          )}
          {content}
        </h6>
      );
  }
};
