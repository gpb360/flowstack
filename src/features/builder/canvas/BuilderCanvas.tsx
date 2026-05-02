import React from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useBuilderStore } from '../stores/useBuilderStore';
import { BlockRenderer } from './BlockRenderer';
import { cn } from '../../../lib/utils';
import { useViewMode } from '../hooks/useViewMode';

// ============================================================================
// BUILDER CANVAS - Main editing interface
// ============================================================================

interface BuilderCanvasProps {
  onDropBlock: (blockType: string, parentId: string | null, index?: number) => void;
}

export const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ onDropBlock }) => {
  const {
    blocks,
    selectedBlockId,
    hoveredBlockId,
    selectBlock,
    moveBlock,
    isPreview,
  } = useBuilderStore();

  const { canvasWidth } = useViewMode();

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (_event, _args) => {
        // Keyboard drag handling for accessibility
        return { x: 0, y: 0 };
      },
    })
  );

  const handleDragStart = (_event: any) => {
    // Track active drag
  };

  const handleDragMove = (_event: any) => {
    // Update drag overlay position
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      // Dropped outside canvas - cancel
      return;
    }

    // Check if it's a new block from palette or reordering
    if (active.data.current?.type === 'NEW_BLOCK') {
      const blockType = active.data.current.blockType;
      const parentId = over.data.current?.parentId || null;
      const index = over.data.current?.index;
      onDropBlock(blockType, parentId, index);
    } else if (active.id !== over.id) {
      // Reordering existing blocks
      const parentId = over.data.current?.parentId || null;
      moveBlock(active.id as string, over.id as string, parentId);
    }
  };

  // Deselect when clicking empty canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectBlock(null);
    }
  };

  // Get the dragged block for overlay
  const activeBlock = null as { type: string } | null; // TODO: Track from drag start

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex-1 bg-gray-100 overflow-y-auto min-h-full flex justify-center p-8"
        onClick={handleCanvasClick}
      >
        {/* Canvas area */}
        <DropZone parentId={null} />

        {/* Page canvas */}
        <div
          className={cn(
            'bg-white shadow-sm rounded-lg transition-all duration-300',
            isPreview && 'shadow-none rounded-none'
          )}
          style={{
            width: canvasWidth,
            minHeight: '800px',
          }}
        >
          {blocks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-12">
              <svg
                className="w-16 h-16 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <p className="text-lg font-medium mb-2">Start Building Your Page</p>
              <p className="text-sm">Drag blocks from the palette to get started</p>
            </div>
          ) : (
            <div className="min-h-full">
              {blocks.map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  parentId={null}
                  isSelected={block.id === selectedBlockId}
                  isHovered={block.id === hoveredBlockId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeBlock && (
          <div className="bg-white shadow-lg rounded-lg p-4 border-2 border-blue-500">
            <div className="text-sm font-medium text-gray-700">
              {activeBlock.type}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

// ============================================================================
// DROP ZONE COMPONENT
// ============================================================================

interface DropZoneProps {
  parentId: string | null;
  index?: number;
  children?: React.ReactNode;
}

const DropZone: React.FC<DropZoneProps> = ({ parentId, index, children }) => {
  const { setNodeRef } = useDroppable({
    id: `dropzone-${parentId || 'root'}-${index || 'end'}`,
    data: { parentId, index },
  });

  return (
    <div ref={setNodeRef} className="dropzone">
      {children}
    </div>
  );
};
