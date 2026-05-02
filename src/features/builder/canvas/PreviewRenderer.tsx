import React from 'react';
import * as Blocks from '../blocks';
import type { Block } from '../types';
import { useViewMode } from '../hooks/useViewMode';

// ============================================================================
// PREVIEW RENDERER - Clean rendering without edit controls
// ============================================================================

interface PreviewRendererProps {
  blocks: Block[];
  isLive?: boolean; // For live published pages
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({ blocks, isLive = false }) => {
  const { mode } = useViewMode();

  return (
    <div className={`preview-mode ${mode}`}>
      {blocks.map((block) => (
        <PreviewBlockRenderer key={block.id} block={block} isLive={isLive} />
      ))}
    </div>
  );
};

// ============================================================================
// PREVIEW BLOCK RENDERER - Individual block without controls
// ============================================================================

interface PreviewBlockRendererProps {
  block: Block;
  isLive?: boolean;
}

const PreviewBlockRenderer: React.FC<PreviewBlockRendererProps> = ({ block, isLive }) => {
  const BlockComponent = Blocks[getBlockComponentName(block.type)];

  if (!BlockComponent) {
    return null;
  }

  // Get styles for current view mode
  const { mode } = useViewMode();
  const responsiveStyles = block.styles[mode] || block.styles.desktop || {};

  // Create a wrapper block with only styles (no edit controls)
  const previewBlock = {
    ...block,
    styles: {
      desktop: responsiveStyles,
    },
  };

  return (
    <div style={getInlineStyles(responsiveStyles)}>
      <BlockComponent block={previewBlock} isSelected={false} isHovered={false}>
        {/* Render children recursively */}
        {block.children && block.children.length > 0 && (
          <>
            {block.children.map((child) => (
              <PreviewBlockRenderer key={child.id} block={child} isLive={isLive} />
            ))}
          </>
        )}
      </BlockComponent>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert block styles object to inline styles
function getInlineStyles(styles: Record<string, any>): React.CSSProperties {
  const inlineStyles: React.CSSProperties = {};

  Object.entries(styles).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert camelCase to CSS property names if needed
      (inlineStyles as any)[key] = value;
    }
  });

  return inlineStyles;
}

// Convert block type to component name (PascalCase)
function getBlockComponentName(type: string): keyof typeof Blocks {
  const componentName = type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof Blocks;

  return componentName;
}

// ============================================================================
// EXPORT PREVIEW RENDERER
// ============================================================================

export default PreviewRenderer;
