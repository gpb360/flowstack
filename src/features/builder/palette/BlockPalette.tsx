import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { BLOCK_DEFINITIONS } from '../blocks/registry';
import { cn } from '../../../lib/utils';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TabsUntitled, type Tab } from '@/components/ui/tabs-untitled';
import {
  Search,
  Layout,
  Type,
  Image,
  Video,
  MousePointer2,
  Form,
  Gift,
  ShoppingCart,
  Layers,
} from 'lucide-react';

// ============================================================================
// BLOCK PALETTE - Left sidebar with draggable blocks
// ============================================================================

interface BlockPaletteProps {
  onAddBlock: (blockType: string) => void;
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter blocks by search and category
  const filteredBlocks = Object.values(BLOCK_DEFINITIONS).filter((block) => {
    const matchesSearch =
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: Tab[] = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'content', label: 'Content', icon: Type },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'form', label: 'Forms', icon: Form },
    { id: 'advanced', label: 'Advanced', icon: Gift },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
  ];

  return (
    <div className="w-72 bg-surface border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-text-primary mb-3">Add Blocks</h3>

        {/* Search */}
        <InputUntitled
          type="text"
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          size="sm"
        />
      </div>

      {/* Category tabs */}
      <div className="px-4 py-2 border-b border-border overflow-x-auto">
        <TabsUntitled
          tabs={categories}
          activeTab={selectedCategory}
          onTabChange={setSelectedCategory}
          variant="pills"
          size="sm"
          fullWidth
        />
      </div>

      {/* Block list */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-muted">
              No blocks found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredBlocks.map((block) => (
              <DraggableBlockItem
                key={block.type}
                block={block}
                onAdd={onAddBlock}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent blocks */}
      <div className="p-4 border-t border-border">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
          Recent
        </h4>
        <div className="text-xs text-text-muted">
          Your recently used blocks will appear here
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DRAGGABLE BLOCK ITEM
// ============================================================================

interface DraggableBlockItemProps {
  block: {
    type: string;
    name: string;
    description: string;
    icon: string;
    category: string;
  };
  onAdd: (blockType: string) => void;
}

const DraggableBlockItem: React.FC<DraggableBlockItemProps> = ({
  block,
  onAdd,
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block-${block.type}`,
    data: {
      type: 'NEW_BLOCK',
      blockType: block.type,
    },
  });

  const handleClick = () => {
    onAdd(block.type);
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-3 bg-surface-hover hover:bg-primary/10 border border-transparent hover:border-primary/30 rounded-lg transition-all cursor-pointer group',
        isDragging && 'opacity-50'
      )}
    >
      <BlockIcon iconName={block.icon} />
      <span className="text-xs font-medium text-text-secondary group-hover:text-primary text-center">
        {block.name}
      </span>
    </div>
  );
};

// ============================================================================
// BLOCK ICON COMPONENT
// ============================================================================

interface BlockIconProps {
  iconName: string;
}

const BlockIcon: React.FC<BlockIconProps> = ({ iconName }) => {
  // Simple icon mapping for common blocks
  const iconMap: Record<string, React.ElementType> = {
    layout: Layout,
    container: Layers,
    columns: Layout,
    divider: Layers,
    spacer: Layers,
    heading: Type,
    text: Type,
    image: Image,
    video: Video,
    button: MousePointer2,
    list: Type,
    quote: Type,
    code: Type,
    gallery: Image,
    slider: Image,
    fileDownload: MousePointer2,
    socialIcons: MousePointer2,
    form: Form,
    input: Form,
    textarea: Form,
    select: Form,
    checkbox: Form,
    countdown: Gift,
    progressBar: Gift,
    testimonial: Gift,
    pricing: Gift,
    faq: Gift,
    html: Type,
    product: ShoppingCart,
    cart: ShoppingCart,
    checkout: ShoppingCart,
    orderBump: ShoppingCart,
  };

  const Icon = iconMap[iconName] || Layers;

  return (
    <Icon
      size={24}
      className="text-text-muted group-hover:text-primary transition-colors"
    />
  );
};
