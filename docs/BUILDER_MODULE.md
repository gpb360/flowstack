# FlowStack Site & Funnel Builder - Complete Documentation

## Overview

The FlowStack Site & Funnel Builder is a comprehensive drag-and-drop page builder that enables users to create landing pages, websites, and marketing funnels with visual editing. Built with React 19, TypeScript, @dnd-kit for drag-and-drop, and Zustand for state management.

## Architecture

### Directory Structure

```
src/features/builder/
├── blocks/                  # 30+ block components
│   ├── registry.ts         # Block definitions and factory
│   ├── SectionBlock.tsx
│   ├── ContainerBlock.tsx
│   ├── ColumnsBlock.tsx
│   ├── ... (30+ blocks)
│   └── index.ts
├── canvas/                  # Builder canvas and rendering
│   ├── BuilderCanvas.tsx   # Main editing interface
│   ├── BlockRenderer.tsx   # Edit mode renderer
│   ├── PreviewRenderer.tsx # Preview mode renderer
│   └── index.ts
├── palette/                 # Block palette
│   └── BlockPalette.tsx
├── panels/                  # Style and settings panels
│   ├── StylePanel.tsx
│   ├── SettingsPanel.tsx
│   └── index.ts
├── stores/                  # Zustand state management
│   └── useBuilderStore.ts
├── hooks/                   # Custom hooks
│   └── useViewMode.ts
├── components/              # Legacy components (being migrated)
├── types.ts                 # TypeScript definitions
└── BuilderPage.tsx          # Main page component
```

### Block Categories

1. **Layout Blocks** (5)
   - Section - Full-width section
   - Container - Centered container
   - Columns - Multi-column layout
   - Divider - Horizontal divider
   - Spacer - Vertical spacing

2. **Content Blocks** (8)
   - Heading - H1-H6 headings
   - Text - Paragraph text
   - Image - Images with links
   - Video - YouTube/Vimeo embeds
   - Button - CTA buttons
   - List - Bulleted/numbered lists
   - Quote - Blockquotes
   - Code - Code snippets

3. **Media Blocks** (4)
   - Gallery - Image grids
   - Slider - Image carousels
   - FileDownload - Downloadable files
   - SocialIcons - Social media links

4. **Form Blocks** (5)
   - Form - Form container
   - Input - Text inputs
   - Textarea - Multi-line text
   - Select - Dropdowns
   - Checkbox - Checkboxes/radios

5. **Advanced Blocks** (6)
   - Countdown - Countdown timers
   - ProgressBar - Progress indicators
   - Testimonial - Customer testimonials
   - Pricing - Pricing tables
   - Faq - FAQ accordions
   - Html - Raw HTML embeds

6. **E-commerce Blocks** (4)
   - Product - Product display
   - Cart - Shopping cart
   - Checkout - Checkout form
   - OrderBump - One-click upsells

## Block System

### Block Interface

```typescript
interface Block {
  id: string;
  type: BlockType;
  category: BlockCategory;
  parent?: string | null;
  children?: Block[];
  props: Record<string, any>;
  styles: ResponsiveStyles;
  locked?: boolean;
  visible?: boolean;
}
```

### Creating a New Block

1. **Define the block in the registry** (`blocks/registry.ts`):

```typescript
yourBlock: {
  type: 'yourBlock',
  category: 'content',
  name: 'Your Block',
  description: 'Description here',
  icon: 'icon-name',
  defaultProps: { ... },
  defaultStyles: {
    desktop: { ... },
    tablet: { ... },
    mobile: { ... }
  },
  canHaveChildren: false,
}
```

2. **Create the block component** (`blocks/YourBlock.tsx`):

```typescript
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

interface YourBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const YourBlock: React.FC<YourBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...blockStyles }}
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
      {/* Your block content here */}
    </div>
  );
};
```

3. **Export from index** (`blocks/index.ts`):

```typescript
export { YourBlock } from './YourBlock';
```

4. **Add settings** (optional) in `panels/SettingsPanel.tsx`:

```typescript
case 'yourBlock':
  return (
    <>
      <SettingRow label="Your Setting">
        <input
          type="text"
          value={block.props.yourProp || ''}
          onChange={(e) => onPropChange('yourProp', e.target.value)}
        />
      </SettingRow>
    </>
  );
```

## State Management (Zustand)

### Store Structure

```typescript
interface BuilderState {
  // Current page and site
  currentPage: Page | null;
  currentSite: Site | null;

  // Canvas state
  blocks: Block[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;

  // View mode
  viewMode: ViewMode;
  isPreview: boolean;

  // History for undo/redo
  history: { blocks: Block[]; timestamp: number }[];
  historyIndex: number;

  // UI state
  leftPanelWidth: number;
  rightPanelWidth: number;
  showLeftPanel: boolean;
  showRightPanel: boolean;

  // Actions
  setCurrentPage: (page: Page | null) => void;
  setCurrentSite: (site: Site | null) => void;
  addBlock: (block: Omit<Block, 'id'>, parentId?: string | null, index?: number) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (dragId: string, hoverId: string, parentId?: string) => void;
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  setPreview: (isPreview: boolean) => void;
  undo: () => void;
  redo: () => void;
  setBlocks: (blocks: Block[]) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
}
```

### Usage Examples

```typescript
// Add a block
const { addBlock } = useBuilderStore();
addBlock({
  type: 'heading',
  category: 'content',
  props: { level: 1, content: 'Hello World' },
  styles: { desktop: { fontSize: '32px' } },
});

// Update a block
const { updateBlock } = useBuilderStore();
updateBlock(blockId, {
  props: { content: 'Updated Content' }
});

// Delete a block
const { deleteBlock } = useBuilderStore();
deleteBlock(blockId);

// Undo/Redo
const { undo, redo } = useBuilderStore();
undo();
redo();
```

## Responsive Design

### Breakpoints

- **Desktop**: 1200px+ (default)
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

### Responsive Styles

Each block has responsive styles:

```typescript
interface ResponsiveStyles {
  desktop?: BlockStyles;
  tablet?: BlockStyles;
  mobile?: BlockStyles;
}
```

When editing, use the view mode toggle to switch between breakpoints and set styles for each.

## Publishing

### Publishing Process

1. **Export to HTML** - Convert blocks to clean HTML
2. **Inline CSS** - Embed styles for self-contained pages
3. **Minify** - Optimize file size
4. **Deploy** - Push to CDN/hosting

### Publishing Options

```typescript
interface PublishOptions {
  format: 'html' | 'react';
  minify: boolean;
  inlineCss: boolean;
  includeScripts: boolean;
}
```

## Integration Points

### CRM Integration

Form submissions create contacts in the CRM:

```typescript
// Form submission handling
const handleFormSubmit = async (formData: FormFields) => {
  // Create contact in CRM
  await createContact({
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    source: 'landing-page',
    pageId: currentPage.id,
  });
};
```

### Workflow Triggers

Builder events trigger workflows:

```typescript
// Page published
triggerWorkflow('page.published', { pageId, url });

// Form submitted
triggerWorkflow('form.submitted', { formId, data, pageId });

// Button clicked (analytics)
trackEvent('button.clicked', { buttonText, pageId });
```

## Database Schema

### Sites Table

```sql
create table public.sites (
  id uuid primary key,
  organization_id uuid references public.organizations(id),
  name text not null,
  subdomain text unique,
  custom_domain text unique,
  settings jsonb default '{}',
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

### Pages Table

```sql
create table public.pages (
  id uuid primary key,
  organization_id uuid references public.organizations(id),
  site_id uuid references public.sites(id),
  path text not null,
  title text not null,
  content jsonb default '{}',
  compiled_html text,
  is_published boolean default false,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  unique(site_id, path)
);
```

### Funnels Table

```sql
create table public.funnels (
  id uuid primary key,
  organization_id uuid references public.organizations(id),
  site_id uuid references public.sites(id),
  name text not null,
  steps jsonb default '[]',
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);
```

## Routes

```typescript
// Site list
/s/sites

// Site pages
/sites/:siteId

// Page editor
/sites/:siteId/pages/:pageId

// Page preview
/sites/:siteId/pages/:pageId/preview

// Site settings
/sites/:siteId/settings
```

## Features Implemented

### Phase 1: Block Library (Complete ✅)
- ✅ 30+ block components
- ✅ Block registry system
- ✅ Responsive block definitions
- ✅ Default props and styles

### Phase 2: Builder Canvas (Complete ✅)
- ✅ Drag-and-drop with @dnd-kit
- ✅ Drop zones between blocks
- ✅ Nested block rendering
- ✅ Responsive preview modes
- ✅ Click to select blocks
- ✅ Hover states

### Phase 3: Style Panel (Complete ✅)
- ✅ Layout controls
- ✅ Typography controls
- ✅ Background controls
- ✅ Border controls
- ✅ Responsive mode toggle

### Phase 4: Settings Panel (Complete ✅)
- ✅ Dynamic forms per block type
- ✅ Block-specific properties
- ✅ Visibility toggle
- ✅ Locked toggle

### Phase 5: Block Palette (Complete ✅)
- ✅ Search/filter blocks
- ✅ Category tabs
- ✅ Drag to canvas
- ✅ Click to add

### Phase 6: Page Management (Pending)
- ⏳ Pages list
- ⏳ Page settings
- ⏳ SEO settings
- ⏳ Page duplication

### Phase 7: Site Settings (Pending)
- ⏳ Site name/domain
- ⏳ Favicon/logo
- ⏳ Custom CSS/JS
- ⏳ Tracking codes

### Phase 8: Publishing (Pending)
- ⏳ Publishing dialog
- ⏳ HTML export
- ⏳ Version history
- ⏳ Preview before publish

### Phase 9: Responsive Editor (Complete ✅)
- ✅ Device switcher
- ✅ Canvas width adjustment
- ✅ Per-breakpoint styles

## Best Practices

### Performance

1. **Lazy load blocks** - Only import blocks when needed
2. **Optimize re-renders** - Use React.memo on block components
3. **Debounce style updates** - Prevent excessive state updates

### Accessibility

1. **Keyboard navigation** - Full keyboard support for drag-drop
2. **Screen reader support** - Proper ARIA labels
3. **Focus management** - Clear focus indicators

### User Experience

1. **Visual feedback** - Clear hover/selection states
2. **Undo/Redo** - Always have undo available
3. **Auto-save** - Periodic saving to prevent data loss
4. **Preview mode** - WYSIWYG preview without edit controls

## Troubleshooting

### Common Issues

1. **Blocks not rendering**
   - Check block is exported from index
   - Verify block type matches registry
   - Check console for errors

2. **Styles not applying**
   - Verify responsive breakpoint
   - Check specificity order
   - Ensure style object format

3. **Drag-drop not working**
   - Check @dnd-kit setup
   - Verify droppable IDs
   - Check sensor configuration

## Future Enhancements

1. **AI-powered suggestions**
   - Suggest layouts based on content
   - Auto-generate sections
   - Smart image placement

2. **Templates**
   - Pre-built page templates
   - Industry-specific templates
   - Conversion-optimized funnels

3. **Collaboration**
   - Real-time editing
   - Comments and annotations
   - Version history

4. **Analytics**
   - Built-in heatmap
   - Conversion tracking
   - A/B testing

## Contributing

When adding new features:

1. Update types in `types.ts`
2. Add block to `registry.ts`
3. Create block component
4. Add settings panel (if needed)
5. Update documentation
6. Test responsive breakpoints

## License

Part of FlowStack - Internal use only.
