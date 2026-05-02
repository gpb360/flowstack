import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Enhanced Button component inspired by Untitled UI
 * Features sophisticated hover states, loading indicators, and icon support
 */

const buttonVariants = cva(
  // Base styles - group relative for child element targeting
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Gold gradient with shimmer effect
        primary: [
          'bg-gradient-to-r from-primary-light via-primary to-primary-dark',
          'text-white shadow-lg shadow-primary/25',
          'hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]',
          'active:scale-[0.98]',
          'before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300',
          'hover:before:opacity-100',
        ],
        // Secondary - Surface with gold border
        secondary: [
          'bg-surface border-2 border-primary text-text-primary',
          'hover:bg-primary/10 hover:border-primary-light',
          'active:bg-primary/20',
        ],
        // Tertiary - Subtle hover
        tertiary: [
          'bg-transparent text-text-secondary',
          'hover:bg-surface-hover hover:text-text-primary',
        ],
        // Ghost - Minimal
        ghost: [
          'bg-transparent text-text-secondary hover:text-text-primary',
          'hover:bg-primary/5',
        ],
        // Link - Text only
        link: [
          'bg-transparent text-primary underline-offset-4',
          'hover:underline',
        ],
        // Destructive - Red
        destructive: [
          'bg-error text-white shadow-lg shadow-error/25',
          'hover:bg-error/90 hover:shadow-xl hover:shadow-error/30',
          'active:scale-[0.98]',
        ],
        // Destructive Secondary
        'destructive-secondary': [
          'bg-surface border-2 border-error text-error',
          'hover:bg-error/10',
        ],
        // Outline - Border only
        outline: [
          'bg-transparent border border-border text-text-primary',
          'hover:bg-surface-hover hover:border-primary/30',
          'active:bg-surface',
        ],
        // Error - Red (alias for destructive)
        error: [
          'bg-error text-white shadow-lg shadow-error/25',
          'hover:bg-error/90 hover:shadow-xl hover:shadow-error/30',
          'active:scale-[0.98]',
        ],
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-md',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isIconOnly?: boolean;
  fullWidth?: boolean;
  href?: string; // If provided, renders as anchor
}

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      isIconOnly,
      fullWidth,
      children,
      disabled,
      href,
      ...props
    },
    ref
  ) => {
    // Calculate size for icon-only buttons (make them square)
    const iconOnlySize = size === 'xs' ? 'w-7' : size === 'sm' ? 'w-8' : size === 'md' ? 'w-10' : size === 'lg' ? 'w-12' : 'w-14';

    // If href is provided, render as anchor
    if (href) {
      return (
        <a
          href={href}
          className={cn(buttonVariants({ variant, size }), isIconOnly && iconOnlySize, fullWidth && 'w-full', className)}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {!isIconOnly && children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), isIconOnly && iconOnlySize, fullWidth && 'w-full', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {!isIconOnly && <span className="opacity-70">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {!isIconOnly && children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

ButtonComponent.displayName = 'Button';

export const ButtonUntitled = ButtonComponent;

// Alias for backwards-compatible imports
export const Button = ButtonComponent;
