import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { Facebook, Twitter, Instagram, Linkedin, Share2 } from 'lucide-react';
import type { Block } from '../types';

interface SocialIconsBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

const ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
};

export const SocialIconsBlock: React.FC<SocialIconsBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const platforms = block.props.platforms || [];
  const size = (block.props.size || 'md') as 'sm' | 'md' | 'lg';
  const iconStyle = (block.props.style || 'circle') as 'circle' | 'square';

  const sizeClasses: Record<string, string> = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const styleClasses: Record<string, string> = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Social Icons</span>
        </div>
      )}
      <div className="flex justify-center gap-4">
        {platforms.map((platform: any, idx: number) => {
          const Icon = ICONS[platform.name] || Share2;
          return (
            <a key={idx} href={platform.url} target="_blank" rel="noopener noreferrer" className={cn('flex items-center justify-center bg-gray-100 hover:bg-gray-200', sizeClasses[size], styleClasses[iconStyle])}>
              <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
            </a>
          );
        })}
      </div>
    </div>
  );
};
