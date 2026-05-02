// ============================================================================
// BUILDER TYPES - FlowStack Site & Funnel Builder
// ============================================================================

export type BlockType =
  // Layout Blocks
  | 'section'
  | 'container'
  | 'columns'
  | 'divider'
  | 'spacer'
  // Content Blocks
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'list'
  | 'quote'
  | 'code'
  // Media Blocks
  | 'gallery'
  | 'slider'
  | 'fileDownload'
  | 'socialIcons'
  // Form Blocks
  | 'form'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  // Advanced Blocks
  | 'countdown'
  | 'progressBar'
  | 'testimonial'
  | 'pricing'
  | 'faq'
  | 'html'
  // E-commerce Blocks
  | 'product'
  | 'cart'
  | 'checkout'
  | 'orderBump';

export type BlockCategory =
  | 'layout'
  | 'content'
  | 'media'
  | 'form'
  | 'advanced'
  | 'ecommerce';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

// ============================================================================
// BLOCK STYLES
// ============================================================================

export interface BlockStyles {
  // Layout
  display?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;

  // Typography
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  textDecoration?: string;
  textTransform?: string;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;

  // Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;

  // Effects
  boxShadow?: string;
  opacity?: string | number;

  // Position
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: number;

  // Flexbox
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;

  // Grid
  gridTemplateColumns?: string;
  gridGap?: string;

  // Additional styles
  cursor?: string;
  fontStyle?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
}

// ============================================================================
// RESPONSIVE STYLES
// ============================================================================

export interface ResponsiveStyles {
  desktop?: BlockStyles;
  tablet?: BlockStyles;
  mobile?: BlockStyles;
}

// ============================================================================
// BLOCK PROPS (Block-specific properties)
// ============================================================================

export interface BaseBlockProps {
  id?: string;
}

// Layout Block Props
export interface SectionBlockProps extends BaseBlockProps {
  fullWidth?: boolean;
}

export interface ContainerBlockProps extends BaseBlockProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centerContent?: boolean;
}

export interface ColumnsBlockProps extends BaseBlockProps {
  columns: number;
  gap?: string;
}

export interface DividerBlockProps extends BaseBlockProps {
  thickness?: string;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface SpacerBlockProps extends BaseBlockProps {
  height?: string;
}

// Content Block Props
export interface HeadingBlockProps extends BaseBlockProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  content: string;
}

export interface TextBlockProps extends BaseBlockProps {
  content: string;
  richText?: boolean;
}

export interface ImageBlockProps extends BaseBlockProps {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  link?: string;
  openInNewTab?: boolean;
}

export interface VideoBlockProps extends BaseBlockProps {
  type: 'youtube' | 'vimeo' | 'custom';
  videoId?: string;
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  controls?: boolean;
  width?: string;
  aspectRatio?: string;
}

export interface ButtonBlockProps extends BaseBlockProps {
  text: string;
  link?: string;
  openInNewTab?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export interface ListBlockProps extends BaseBlockProps {
  type: 'bullet' | 'number';
  items: string[];
}

export interface QuoteBlockProps extends BaseBlockProps {
  content: string;
  attribution?: string;
  citeUrl?: string;
}

export interface CodeBlockProps extends BaseBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

// Media Block Props
export interface GalleryBlockProps extends BaseBlockProps {
  images: Array<{
    src: string;
    alt?: string;
    thumbnail?: string;
  }>;
  columns?: number;
  gap?: string;
  enableLightbox?: boolean;
}

export interface SliderBlockProps extends BaseBlockProps {
  images: Array<{
    src: string;
    alt?: string;
    link?: string;
  }>;
  autoplay?: boolean;
  autoplayDelay?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export interface FileDownloadBlockProps extends BaseBlockProps {
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  buttonText?: string;
  icon?: string;
}

export interface SocialIconsBlockProps extends BaseBlockProps {
  platforms: Array<{
    name: string;
    url: string;
    icon?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  style?: 'circle' | 'square';
  alignment?: 'left' | 'center' | 'right';
}

// Form Block Props
export interface FormBlockProps extends BaseBlockProps {
  formId?: string;
  submitButtonText?: string;
  successMessage?: string;
  redirectTo?: string;
}

export interface InputBlockProps extends BaseBlockProps {
  type: 'text' | 'email' | 'tel' | 'url' | 'number' | 'password';
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export interface TextareaBlockProps extends BaseBlockProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

export interface SelectBlockProps extends BaseBlockProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
}

export interface CheckboxBlockProps extends BaseBlockProps {
  type: 'checkbox' | 'radio';
  name: string;
  label?: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}

// Advanced Block Props
export interface CountdownBlockProps extends BaseBlockProps {
  targetDate: string;
  format?: 'days' | 'hours' | 'minutes' | 'seconds' | 'full';
  timezone?: string;
  onCompleteMessage?: string;
}

export interface ProgressBarBlockProps extends BaseBlockProps {
  progress: number; // 0-100
  showLabel?: boolean;
  color?: string;
  height?: string;
  animated?: boolean;
}

export interface TestimonialBlockProps extends BaseBlockProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
  rating?: number; // 1-5
}

export interface PricingBlockProps extends BaseBlockProps {
  plans: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    highlighted?: boolean;
    buttonText?: string;
    buttonLink?: string;
  }>;
  toggleMonthlyYearly?: boolean;
}

export interface FaqBlockProps extends BaseBlockProps {
  items: Array<{
    question: string;
    answer: string;
    open?: boolean;
  }>;
  allowMultipleOpen?: boolean;
}

export interface HtmlBlockProps extends BaseBlockProps {
  html: string;
  sanitize?: boolean;
}

// E-commerce Block Props
export interface ProductBlockProps extends BaseBlockProps {
  productId?: string;
  name: string;
  description?: string;
  price: string;
  compareAtPrice?: string;
  image?: string;
  buttonText?: string;
}

export interface CartBlockProps extends BaseBlockProps {
  showSummary?: boolean;
  showThumbnail?: boolean;
}

export interface CheckoutBlockProps extends BaseBlockProps {
  showShipping?: boolean;
  showTax?: boolean;
}

export interface OrderBumpBlockProps extends BaseBlockProps {
  productId?: string;
  name: string;
  description?: string;
  price: string;
  checked?: boolean;
}

// ============================================================================
// MAIN BLOCK INTERFACE
// ============================================================================

export interface Block {
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

// ============================================================================
// PAGE & SITE TYPES
// ============================================================================

export interface Page {
  id: string;
  siteId: string;
  funnelId?: string;
  path: string;
  title: string;
  content: Block[];
  compiledHtml?: string;
  isPublished: boolean;
  seo?: PageSEO;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageSEO {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  customMeta?: Array<{ name: string; content: string }>;
}

export interface Site {
  id: string;
  organizationId: string;
  name: string;
  subdomain?: string;
  customDomain?: string;
  settings: SiteSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings {
  favicon?: string;
  logo?: string;
  customCss?: string;
  customJs?: string;
  tracking?: {
    googleAnalytics?: string;
    facebookPixel?: string;
    googleTagManager?: string;
  };
  fonts?: Array<{
    family: string;
    source: 'google' | 'custom';
    url?: string;
  }>;
}

export interface Funnel {
  id: string;
  organizationId: string;
  siteId?: string;
  name: string;
  steps: FunnelStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FunnelStep {
  pageId: string;
  order: number;
}

// ============================================================================
// BUILDER STATE
// ============================================================================

export interface BuilderState {
  // Current page being edited
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
  history: {
    blocks: Block[];
    timestamp: number;
  }[];
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

  // Persistence
  isSaving: boolean;
  isDirty: boolean;
  lastSavedAt: string | null;
  loadPage: (pageId: string) => Promise<void>;
  savePage: () => Promise<void>;

  undo: () => void;
  redo: () => void;

  setBlocks: (blocks: Block[]) => void;

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
}

// ============================================================================
// BLOCK REGISTRY
// ============================================================================

export interface BlockDefinition {
  type: BlockType;
  category: BlockCategory;
  name: string;
  description: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultStyles: ResponsiveStyles;
  canHaveChildren?: boolean;
  allowedChildren?: BlockType[];
  isContainer?: boolean;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {} as Record<BlockType, BlockDefinition>;

// ============================================================================
// PUBLISHING TYPES
// ============================================================================

// ============================================================================
// THEME TYPES
// ============================================================================

export interface Theme {
  id: string;
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

export interface PublishOptions {
  format: 'html' | 'react';
  minify: boolean;
  inlineCss: boolean;
  includeScripts: boolean;
}

export interface PublishedPage {
  html: string;
  css: string;
  js: string;
  assets: string[];
}

// ============================================================================
// LEGACY TYPES (for backward compatibility)
// ============================================================================

export type ElementType = BlockType;
export type ElementStyle = BlockStyles;
export interface BuilderElement extends Block {}
