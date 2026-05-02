import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Enhanced Badge component inspired by Untitled UI
 * Features status colors, gold accents, and subtle animations
 */

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        // Primary - Gold
        primary: [
          'bg-gradient-to-r from-primary/20 to-primary/10',
          'text-primary border border-primary/30',
          'shadow-sm shadow-primary/10',
        ],
        // Secondary - Gray
        secondary: [
          'bg-surface border border-border',
          'text-text-secondary',
        ],
        // Neutral - Gray/Neutral
        neutral: [
          'bg-surface-hover border border-border',
          'text-text-secondary',
        ],
        // Success - Green
        success: [
          'bg-success/10 border border-success/30',
          'text-success',
          'shadow-sm shadow-success/10',
        ],
        // Warning - Yellow
        warning: [
          'bg-warning/10 border border-warning/30',
          'text-warning',
          'shadow-sm shadow-warning/10',
        ],
        // Error - Red
        error: [
          'bg-error/10 border border-error/30',
          'text-error',
          'shadow-sm shadow-error/10',
        ],
        // Aliases
        danger: [
          'bg-error/10 border border-error/30',
          'text-error',
          'shadow-sm shadow-error/10',
        ],
        destructive: [
          'bg-error/10 border border-error/30',
          'text-error',
          'shadow-sm shadow-error/10',
        ],
        gold: [
          'bg-gradient-to-r from-primary/20 to-primary/10',
          'text-primary border border-primary/30',
          'shadow-sm shadow-primary/10',
        ],
        // Info - Blue
        info: [
          'bg-info/10 border border-info/30',
          'text-info',
          'shadow-sm shadow-info/10',
        ],
        // Outline - Minimal
        outline: [
          'bg-transparent border border-border',
          'text-text-secondary',
          'hover:border-primary/30',
        ],
        // Solid variants
        'solid-primary': 'bg-primary text-white',
        'solid-success': 'bg-success text-white',
        'solid-warning': 'bg-warning text-white',
        'solid-error': 'bg-error text-white',
        'solid-info': 'bg-info text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      dot: {
        true: 'gap-2',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      dot: false,
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  icon?: React.ReactNode;
}

const BadgeComponent = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot }), className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full animate-pulse',
              variant === 'primary' && 'bg-primary',
              variant === 'success' && 'bg-success',
              variant === 'warning' && 'bg-warning',
              variant === 'error' && 'bg-error',
              variant === 'info' && 'bg-info',
              (variant === 'secondary' || variant === 'outline') && 'bg-text-muted'
            )}
          />
        )}
        {children}
      </div>
    );
  }
);

BadgeComponent.displayName = 'Badge';

export const BadgeUntitled = BadgeComponent;

// Alias for backwards-compatible imports
export const Badge = BadgeComponent;
