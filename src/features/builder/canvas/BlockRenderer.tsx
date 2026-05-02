import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useBuilderStore } from '../stores/useBuilderStore';
import * as Blocks from '../blocks';
import type { Block } from '../types';
import { cn } from '../../../lib/utils';

// ============================================================================
// BLOCK RENDERER - Renders blocks in edit mode with controls
// ============================================================================

interface BlockRendererProps {
  block: Block;
  parentId: string | null;
  index?: number;
  isSelected?: boolean;
  isHovered?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  parentId,
  index,
  isSelected = false,
  isHovered = false,
}) => {
  const { selectBlock, hoverBlock, deleteBlock, duplicateBlock, selectedBlockId } = useBuilderStore();

  const handleClick = () => {
    selectBlock(block.id);
  };

  const handleMouseEnter = () => {
    hoverBlock(block.id);
  };

  const handleMouseLeave = () => {
    hoverBlock(null);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this block?')) {
      deleteBlock(block.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateBlock(block.id);
  };

  // Get the block component
  const BlockComponent = Blocks[getBlockComponentName(block.type)];

  if (!BlockComponent) {
    return <div>Unknown block type: {block.type}</div>;
  }

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Drop zone before this block */}
      <DropZone parentId={parentId} index={index} />

      {/* Block controls overlay */}
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-10 left-0 z-20 flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-md px-2 py-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleDuplicate(e); }}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900"
            title="Duplicate"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
            className="p-1.5 hover:bg-red-50 rounded text-gray-600 hover:text-red-600"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="w-px h-4 bg-gray-200 mx-1" />
          <span className="text-xs font-medium text-gray-500 px-1">
            {block.type}
          </span>
        </div>
      )}

      {/* Render the block component */}
      <BlockComponent
        block={block}
        isSelected={isSelected}
        isHovered={isHovered}
        onClick={handleClick}
      >
        {/* Render children if block supports them */}
        {block.children && block.children.length > 0 && (
          <div className="space-y-2">
            {block.children.map((child, childIndex) => (
              <BlockRenderer
                key={child.id}
                block={child}
                parentId={block.id}
                index={childIndex}
                isSelected={child.id === selectedBlockId}
                isHovered={child.id === selectedBlockId}
              />
            ))}
          </div>
        )}
      </BlockComponent>

      {/* Drop zone after this block */}
      <DropZone parentId={parentId} index={index ? index + 1 : undefined} />
    </div>
  );
};

// ============================================================================
// DROP ZONE COMPONENT
// ============================================================================

interface DropZoneProps {
  parentId: string | null;
  index?: number;
}

const DropZone: React.FC<DropZoneProps> = ({ parentId, index }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `dropzone-${parentId || 'root'}-${index || 'end'}`,
    data: { parentId, index },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'h-2 border-2 border-dashed border-transparent rounded transition-all',
        isOver && 'border-blue-500 bg-blue-50'
      )}
    />
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert block type to component name (PascalCase + "Block" suffix)
function getBlockComponentName(type: string): keyof typeof Blocks {
  const componentName = type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Block' as keyof typeof Blocks;

  return componentName;
}
