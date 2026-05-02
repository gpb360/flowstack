import React, { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Enhanced Card component inspired by Untitled UI
 * Features subtle borders, hover effects, and gold accents
 */

const cardVariants = cva(
  'rounded-xl transition-all duration-200',
  {
    variants: {
      variant: {
        default: [
          'bg-surface border border-border',
          'hover:border-primary/30 hover:shadow-gold',
        ],
        elevated: [
          'bg-surface-elevated border border-border shadow-lg',
          'hover:shadow-gold hover:shadow-xl',
        ],
        flat: 'bg-surface border-0',
        outline: [
          'bg-transparent border-2 border-border',
          'hover:border-primary/50',
        ],
        gold: [
          'bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5',
          'border border-primary/20',
          'hover:border-primary/40 hover:shadow-gold',
        ],
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  description?: string;
}

const CardComponent = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      header,
      footer,
      title,
      description,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive }), className)}
        {...props}
      >
        {(header || title || description) && (
          <div className="mb-4 space-y-1">
            {header}
            {title && (
              <h3 className="text-lg font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-text-secondary">{description}</p>
            )}
          </div>
        )}
        {children}
        {footer && (
          <div className="mt-4 pt-4 border-t border-border">{footer}</div>
        )}
      </div>
    );
  }
);

CardComponent.displayName = 'Card';

// ============================================================================
// Compound sub-components for compatibility with shadcn Card patterns
// ============================================================================

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4 space-y-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-semibold text-text-primary leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-text-secondary', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 pt-4 border-t border-border flex items-center', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// Attach sub-components as statics for compound usage: CardUntitled.Header, etc.
export const CardUntitled = Object.assign(CardComponent, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});

// Alias for backwards-compatible imports
export const Card = CardUntitled;
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
