import { BlockPalette } from '../palette/BlockPalette';
import { useBuilderStore } from '../stores/useBuilderStore';
import { createBlock } from '../blocks/registry';

// ============================================================================
// BUILDER SIDEBAR - Left panel with block palette
// ============================================================================

export const BuilderSidebar = () => {
  const { addBlock } = useBuilderStore();

  const handleAddBlock = (blockType: string) => {
    const newBlock = createBlock(blockType as any);
    addBlock(newBlock, null);
  };

  return <BlockPalette onAddBlock={handleAddBlock} />;
};
