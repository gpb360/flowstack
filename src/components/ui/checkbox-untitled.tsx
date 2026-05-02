/**
 * Enhanced Checkbox component inspired by Untitled UI
 * Features gold accent on checked state, error handling, and label support
 */

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useId } from 'react';

const checkboxVariants = cva(
  'shrink-0 rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border-border bg-surface',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
          'hover:border-primary/50',
        ],
        filled: [
          'border-border bg-surface-elevated',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary',
          'hover:bg-surface-hover',
        ],
        outline: [
          'border-2 border-border',
          'data-[state=checked]:border-primary',
          'hover:border-primary/50',
        ],
      },
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      state: {
        default: '',
        error: 'border-error focus-visible:ring-error/20',
        success: 'border-success focus-visible:ring-success/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export interface CheckboxUntitledProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  indeterminate?: boolean;
}

const CheckboxBase = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants> & { error?: string }
>(({ className, variant, size, state, error, ...props }, ref) => {
  const hasError = error || state === 'error';
  const finalState = hasError ? 'error' : state;

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        checkboxVariants({ variant, size, state: finalState }),
        'focus-visible:ring-offset-background',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-white')}
      >
        <Check size={size === 'sm' ? 12 : size === 'lg' ? 18 : 14} strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
CheckboxBase.displayName = CheckboxPrimitive.Root.displayName;

// Wrapper component with label, error, and helper text
const CheckboxUntitledWrapper = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxUntitledProps
>(({ className, variant, size, state, label, error, helperText, id, ...props }, ref) => {
  const generatedId = useId();
  const checkboxId = id || `checkbox-${generatedId}`;
  const hasError = error || state === 'error';
  const finalState = hasError ? 'error' : state;

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <CheckboxBase
          ref={ref}
          id={checkboxId}
          variant={variant}
          size={size}
          state={finalState}
          className={cn('mt-0.5', className)}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'text-sm font-medium leading-none cursor-pointer select-none',
                hasError ? 'text-error' : 'text-text-primary'
              )}
            >
              {label}
            </label>
          )}
          {(error || helperText) && (
            <p
              className={cn(
                'mt-1 text-xs',
                error ? 'text-error' : 'text-text-muted'
              )}
            >
              {error || helperText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

CheckboxUntitledWrapper.displayName = 'CheckboxUntitled';

export const CheckboxUntitled = CheckboxUntitledWrapper;
export { CheckboxBase };
