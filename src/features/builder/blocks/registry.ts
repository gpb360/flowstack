import type { Block, BlockDefinition, BlockType } from '../types';

// ============================================================================
// BLOCK REGISTRY - FlowStack Site Builder
// ============================================================================

export const BLOCK_DEFINITIONS: Record<BlockType, BlockDefinition> = {
  // ========================================================================
  // LAYOUT BLOCKS
  // ========================================================================

  section: {
    type: 'section',
    category: 'layout',
    name: 'Section',
    description: 'Full-width section for grouping content',
    icon: 'layout',
    defaultProps: {
      fullWidth: true,
    },
    defaultStyles: {
      desktop: {
        padding: '80px 20px',
      },
    },
    canHaveChildren: true,
    isContainer: true,
  },

  container: {
    type: 'container',
    category: 'layout',
    name: 'Container',
    description: 'Centered container for content',
    icon: 'container',
    defaultProps: {
      maxWidth: 'lg',
      centerContent: true,
    },
    defaultStyles: {
      desktop: {
        margin: '0 auto',
        padding: '0 20px',
      },
    },
    canHaveChildren: true,
    isContainer: true,
  },

  columns: {
    type: 'columns',
    category: 'layout',
    name: 'Columns',
    description: 'Multi-column layout (1-4 columns)',
    icon: 'columns',
    defaultProps: {
      columns: 2,
      gap: '20px',
    },
    defaultStyles: {
      desktop: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
      },
      tablet: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      mobile: {
        gridTemplateColumns: '1fr',
      },
    },
    canHaveChildren: true,
    isContainer: true,
  },

  divider: {
    type: 'divider',
    category: 'layout',
    name: 'Divider',
    description: 'Horizontal divider line',
    icon: 'minus',
    defaultProps: {
      thickness: '1px',
      color: '#e5e7eb',
      style: 'solid',
    },
    defaultStyles: {
      desktop: {
        border: 'none',
        borderTop: '1px solid #e5e7eb',
        margin: '40px 0',
      },
    },
  },

  spacer: {
    type: 'spacer',
    category: 'layout',
    name: 'Spacer',
    description: 'Vertical spacing',
    icon: 'space',
    defaultProps: {
      height: '40px',
    },
    defaultStyles: {
      desktop: {
        height: '40px',
      },
    },
  },

  // ========================================================================
  // CONTENT BLOCKS
  // ========================================================================

  heading: {
    type: 'heading',
    category: 'content',
    name: 'Heading',
    description: 'H1-H6 heading with styling',
    icon: 'heading',
    defaultProps: {
      level: 2,
      content: 'Heading Text',
    },
    defaultStyles: {
      desktop: {
        fontSize: '2rem',
        fontWeight: '700',
        lineHeight: '1.2',
        marginBottom: '16px',
        color: '#111827',
      },
    },
  },

  text: {
    type: 'text',
    category: 'content',
    name: 'Text',
    description: 'Paragraph with rich text options',
    icon: 'text',
    defaultProps: {
      content: 'Enter your text here...',
      richText: false,
    },
    defaultStyles: {
      desktop: {
        fontSize: '1rem',
        lineHeight: '1.6',
        color: '#374151',
      },
    },
  },

  image: {
    type: 'image',
    category: 'content',
    name: 'Image',
    description: 'Image with sizing, alt, link',
    icon: 'image',
    defaultProps: {
      src: '/placeholder-image.svg',
      alt: 'Image description',
      width: '100%',
      objectFit: 'cover',
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        height: 'auto',
      },
    },
  },

  video: {
    type: 'video',
    category: 'content',
    name: 'Video',
    description: 'Embed YouTube/Vimeo or custom',
    icon: 'video',
    defaultProps: {
      type: 'youtube',
      videoId: '',
      autoplay: false,
      controls: true,
      aspectRatio: '16/9',
    },
    defaultStyles: {
      desktop: {
        width: '100%',
      },
    },
  },

  button: {
    type: 'button',
    category: 'content',
    name: 'Button',
    description: 'CTA button with link',
    icon: 'button',
    defaultProps: {
      text: 'Click Me',
      link: '#',
      openInNewTab: false,
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
    defaultStyles: {
      desktop: {
        display: 'inline-block',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        border: 'none',
      },
    },
  },

  list: {
    type: 'list',
    category: 'content',
    name: 'List',
    description: 'Bulleted or numbered list',
    icon: 'list',
    defaultProps: {
      type: 'bullet',
      items: ['Item 1', 'Item 2', 'Item 3'],
    },
    defaultStyles: {
      desktop: {
        paddingLeft: '20px',
        lineHeight: '1.6',
      },
    },
  },

  quote: {
    type: 'quote',
    category: 'content',
    name: 'Quote',
    description: 'Blockquote with attribution',
    icon: 'quote',
    defaultProps: {
      content: 'Quote text goes here',
      attribution: 'Author Name',
    },
    defaultStyles: {
      desktop: {
        borderLeft: '4px solid #3b82f6',
        paddingLeft: '20px',
        fontStyle: 'italic',
        fontSize: '1.125rem',
        color: '#6b7280',
      },
    },
  },

  code: {
    type: 'code',
    category: 'content',
    name: 'Code',
    description: 'Code snippet with syntax highlighting',
    icon: 'code',
    defaultProps: {
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      showLineNumbers: true,
    },
    defaultStyles: {
      desktop: {
        backgroundColor: '#1f2937',
        color: '#f3f4f6',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        overflowX: 'auto',
      },
    },
  },

  // ========================================================================
  // MEDIA BLOCKS
  // ========================================================================

  gallery: {
    type: 'gallery',
    category: 'media',
    name: 'Gallery',
    description: 'Image grid',
    icon: 'gallery',
    defaultProps: {
      images: [
        { src: '/placeholder-image.svg', alt: 'Image 1' },
        { src: '/placeholder-image.svg', alt: 'Image 2' },
        { src: '/placeholder-image.svg', alt: 'Image 3' },
        { src: '/placeholder-image.svg', alt: 'Image 4' },
      ],
      columns: 4,
      gap: '16px',
      enableLightbox: true,
    },
    defaultStyles: {
      desktop: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
      },
      tablet: {
        gridTemplateColumns: 'repeat(2, 1fr)',
      },
      mobile: {
        gridTemplateColumns: '1fr',
      },
    },
  },

  slider: {
    type: 'slider',
    category: 'media',
    name: 'Slider',
    description: 'Image carousel',
    icon: 'slider',
    defaultProps: {
      images: [
        { src: '/placeholder-image.svg', alt: 'Slide 1' },
        { src: '/placeholder-image.svg', alt: 'Slide 2' },
        { src: '/placeholder-image.svg', alt: 'Slide 3' },
      ],
      autoplay: true,
      autoplayDelay: 5000,
      showDots: true,
      showArrows: true,
    },
    defaultStyles: {
      desktop: {
        width: '100%',
        height: '500px',
        overflow: 'hidden',
      },
    },
  },

  fileDownload: {
    type: 'fileDownload',
    category: 'media',
    name: 'File Download',
    description: 'Downloadable file',
    icon: 'download',
    defaultProps: {
      fileName: 'example.pdf',
      fileUrl: '#',
      fileSize: '2.5 MB',
      buttonText: 'Download',
      icon: 'file',
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
      },
    },
  },

  socialIcons: {
    type: 'socialIcons',
    category: 'media',
    name: 'Social Icons',
    description: 'Social media links',
    icon: 'share',
    defaultProps: {
      platforms: [
        { name: 'facebook', url: '#' },
        { name: 'twitter', url: '#' },
        { name: 'instagram', url: '#' },
        { name: 'linkedin', url: '#' },
      ],
      size: 'md',
      style: 'circle',
      alignment: 'center',
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
      },
    },
  },

  // ========================================================================
  // FORM BLOCKS
  // ========================================================================

  form: {
    type: 'form',
    category: 'form',
    name: 'Form',
    description: 'Form container',
    icon: 'form',
    defaultProps: {
      formId: '',
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      redirectTo: '',
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '500px',
        margin: '0 auto',
      },
    },
    canHaveChildren: true,
    isContainer: true,
  },

  input: {
    type: 'input',
    category: 'form',
    name: 'Input',
    description: 'Text/email/phone input',
    icon: 'input',
    defaultProps: {
      type: 'text',
      name: 'field',
      label: 'Label',
      placeholder: 'Enter text...',
      required: false,
    },
    defaultStyles: {
      desktop: {
        width: '100%',
      },
    },
  },

  textarea: {
    type: 'textarea',
    category: 'form',
    name: 'Textarea',
    description: 'Multi-line text',
    icon: 'textarea',
    defaultProps: {
      name: 'message',
      label: 'Message',
      placeholder: 'Enter your message...',
      required: false,
      rows: 4,
    },
    defaultStyles: {
      desktop: {
        width: '100%',
      },
    },
  },

  select: {
    type: 'select',
    category: 'form',
    name: 'Select',
    description: 'Dropdown select',
    icon: 'select',
    defaultProps: {
      name: 'select',
      label: 'Select an option',
      placeholder: 'Choose...',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    defaultStyles: {
      desktop: {
        width: '100%',
      },
    },
  },

  checkbox: {
    type: 'checkbox',
    category: 'form',
    name: 'Checkbox',
    description: 'Checkbox/radio',
    icon: 'checkbox',
    defaultProps: {
      type: 'checkbox',
      name: 'checkbox',
      label: 'Checkbox Options',
      required: false,
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      },
    },
  },

  // ========================================================================
  // ADVANCED BLOCKS
  // ========================================================================

  countdown: {
    type: 'countdown',
    category: 'advanced',
    name: 'Countdown',
    description: 'Countdown timer',
    icon: 'clock',
    defaultProps: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      format: 'full',
      timezone: 'UTC',
      onCompleteMessage: 'Countdown complete!',
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        fontSize: '2rem',
        fontWeight: '700',
        color: '#111827',
      },
    },
  },

  progressBar: {
    type: 'progressBar',
    category: 'advanced',
    name: 'Progress Bar',
    description: 'Progress indicator',
    icon: 'progress',
    defaultProps: {
      progress: 50,
      showLabel: true,
      color: '#3b82f6',
      height: '8px',
      animated: true,
    },
    defaultStyles: {
      desktop: {
        width: '100%',
      },
    },
  },

  testimonial: {
    type: 'testimonial',
    category: 'advanced',
    name: 'Testimonial',
    description: 'Customer testimonial',
    icon: 'testimonial',
    defaultProps: {
      quote: 'This is an amazing product!',
      author: 'John Doe',
      role: 'CEO',
      company: 'Company Inc.',
      rating: 5,
    },
    defaultStyles: {
      desktop: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
      },
    },
  },

  pricing: {
    type: 'pricing',
    category: 'advanced',
    name: 'Pricing',
    description: 'Pricing table',
    icon: 'pricing',
    defaultProps: {
      plans: [
        {
          name: 'Basic',
          price: '$9',
          period: '/month',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          highlighted: false,
          buttonText: 'Get Started',
          buttonLink: '#',
        },
        {
          name: 'Pro',
          price: '$29',
          period: '/month',
          features: ['All Basic features', 'Feature 4', 'Feature 5'],
          highlighted: true,
          buttonText: 'Get Started',
          buttonLink: '#',
        },
      ],
      toggleMonthlyYearly: false,
    },
    defaultStyles: {
      desktop: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
      },
    },
  },

  faq: {
    type: 'faq',
    category: 'advanced',
    name: 'FAQ',
    description: 'Accordion FAQ',
    icon: 'faq',
    defaultProps: {
      items: [
        {
          question: 'What is your refund policy?',
          answer: 'We offer a 30-day money-back guarantee.',
          open: true,
        },
        {
          question: 'How do I contact support?',
          answer: 'You can reach us at support@example.com',
          open: false,
        },
      ],
      allowMultipleOpen: false,
    },
    defaultStyles: {
      desktop: {
        maxWidth: '800px',
        margin: '0 auto',
      },
    },
  },

  html: {
    type: 'html',
    category: 'advanced',
    name: 'HTML',
    description: 'Raw HTML embed',
    icon: 'code',
    defaultProps: {
      html: '<div>Custom HTML content</div>',
      sanitize: false,
    },
    defaultStyles: {
      desktop: {},
    },
  },

  // ========================================================================
  // E-COMMERCE BLOCKS
  // ========================================================================

  product: {
    type: 'product',
    category: 'ecommerce',
    name: 'Product',
    description: 'Product display',
    icon: 'shopping',
    defaultProps: {
      productId: '',
      name: 'Product Name',
      description: 'Product description goes here',
      price: '$99',
      compareAtPrice: '$129',
      buttonText: 'Add to Cart',
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
      },
    },
  },

  cart: {
    type: 'cart',
    category: 'ecommerce',
    name: 'Cart',
    description: 'Shopping cart',
    icon: 'cart',
    defaultProps: {
      showSummary: true,
      showThumbnail: true,
    },
    defaultStyles: {
      desktop: {
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
      },
    },
  },

  checkout: {
    type: 'checkout',
    category: 'ecommerce',
    name: 'Checkout',
    description: 'Checkout form',
    icon: 'checkout',
    defaultProps: {
      showShipping: true,
      showTax: true,
    },
    defaultStyles: {
      desktop: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px',
      },
    },
  },

  orderBump: {
    type: 'orderBump',
    category: 'ecommerce',
    name: 'Order Bump',
    description: 'One-click upsell',
    icon: 'gift',
    defaultProps: {
      productId: '',
      name: 'Special Offer',
      description: 'Add this to your order for a special price!',
      price: '$29',
      checked: false,
    },
    defaultStyles: {
      desktop: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        border: '2px solid #fbbf24',
        borderRadius: '8px',
        backgroundColor: '#fef3c7',
      },
    },
  },
};

// Helper function to get block definition
export const getBlockDefinition = (type: BlockType): BlockDefinition => {
  return BLOCK_DEFINITIONS[type];
};

// Helper function to get blocks by category
export const getBlocksByCategory = (category: string): BlockDefinition[] => {
  return Object.values(BLOCK_DEFINITIONS).filter(
    (def) => def.category === category
  );
};

// Helper function to create a new block instance
export const createBlock = (
  type: BlockType,
  customProps?: Block['props']
): Omit<Block, 'id'> => {
  const definition = BLOCK_DEFINITIONS[type];

  return {
    type,
    category: definition.category,
    props: { ...definition.defaultProps, ...customProps },
    styles: definition.defaultStyles,
    children: [],
    locked: false,
    visible: true,
  };
};
