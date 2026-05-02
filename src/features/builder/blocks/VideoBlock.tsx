import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface VideoBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
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

  const renderVideo = () => {
    const videoId = block.props.videoId;
    const autoplay = block.props.autoplay ? 1 : 0;

    if (block.props.type === 'youtube' && videoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay}`}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (block.props.type === 'vimeo' && videoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://player.vimeo.com/video/${videoId}?autoplay=${autoplay}`}
          title="Vimeo video"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }

    if (block.props.type === 'custom' && block.props.src) {
      return (
        <video
          src={block.props.src}
          controls={block.props.controls}
          autoPlay={block.props.autoplay}
          loop={block.props.loop}
          style={{ width: '100%', height: '100%' }}
        />
      );
    }

    return (
      <div className="flex items-center justify-center bg-gray-200 h-64">
        <p className="text-gray-500">
          {block.props.type === 'youtube'
            ? 'Enter YouTube video ID'
            : block.props.type === 'vimeo'
            ? 'Enter Vimeo video ID'
            : 'Enter video URL'}
        </p>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...blockStyles } as React.CSSProperties}
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
        <div className="absolute -top-6 left-0 pointer-events-none z-20">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">
            Video ({block.props.type})
          </span>
        </div>
      )}

      <div style={{ position: 'relative', paddingBottom: block.props.aspectRatio || '56.25%', height: 0 }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {renderVideo()}
        </div>
      </div>
    </div>
  );
};
