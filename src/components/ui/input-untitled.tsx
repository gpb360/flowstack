import React, { forwardRef, useId } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Enhanced Input component inspired by Untitled UI
 * Features gold focus states, error handling, and icon support
 */

const inputVariants = cva(
  'flex w-full rounded-lg border bg-transparent transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border-border bg-surface',
          'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
        ],
        filled: [
          'border-transparent bg-surface-elevated',
          'focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-primary/20',
        ],
        underline: [
          'border-b-2 border-t-0 border-l-0 border-r-0 border-border rounded-none bg-transparent px-0',
          'focus-visible:border-primary',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-md',
        lg: 'h-12 px-5 text-lg',
      },
      state: {
        default: '',
        error: 'border-error focus-visible:border-error focus-visible:ring-error/20',
        success: 'border-success focus-visible:border-success focus-visible:ring-success/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  /** Select mode: render as <select> with provided options */
  options?: Array<{ value: string; label: string }>;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      state,
      label,
      error,
      leftIcon,
      rightIcon,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const hasError = error || state === 'error';
    const finalState = hasError ? 'error' : state;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, state: finalState }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              error ? 'text-error' : 'text-text-muted'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

InputComponent.displayName = 'Input';

export const InputUntitled = InputComponent;

export const Input = InputComponent;
