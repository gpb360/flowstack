import { BuilderCanvas as BuilderCanvasComponent } from '../canvas/BuilderCanvas';
import { createBlock } from '../blocks/registry';
import { useBuilderStore } from '../stores/useBuilderStore';

// ============================================================================
// CANVAS COMPONENT - Wrapper for BuilderCanvas with block creation
// ============================================================================

export const Canvas = () => {
  const { addBlock } = useBuilderStore();

  const handleDropBlock = (blockType: string, parentId: string | null, index?: number) => {
    const newBlock = createBlock(blockType as any);
    addBlock(newBlock, parentId, index);
  };

  return <BuilderCanvasComponent onDropBlock={handleDropBlock} />;
};
