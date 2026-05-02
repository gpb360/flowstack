import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { Download, File } from 'lucide-react';
import type { Block } from '../types';

interface FileDownloadBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const FileDownloadBlock: React.FC<FileDownloadBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">File Download</span>
        </div>
      )}
      <a href={block.props.fileUrl || '#'} download className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
        <File size={32} className="text-blue-600" />
        <div className="flex-1">
          <p className="font-medium">{block.props.fileName || 'File Name'}</p>
          <p className="text-sm text-gray-500">{block.props.fileSize || '0 KB'}</p>
        </div>
        <Download size={20} className="text-gray-400" />
      </a>
    </div>
  );
};
