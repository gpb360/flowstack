/**
 * Enhanced Textarea component inspired by Untitled UI
 * Features gold focus states, error handling, auto-resize, and character counter
 */

import React, { forwardRef, useId, useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex w-full rounded-lg border bg-transparent transition-all duration-200 placeholder:text-text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none',
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
        sm: 'h-20 px-3 py-2 text-sm',
        md: 'h-24 px-4 py-3 text-md',
        lg: 'h-32 px-5 py-4 text-lg',
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

export interface TextareaUntitledProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  maxLength?: number;
  autoResize?: boolean;
  showCharacterCount?: boolean;
}

const TextareaUntitledComponent = forwardRef<HTMLTextAreaElement, TextareaUntitledProps>(
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
      maxLength,
      autoResize = false,
      showCharacterCount = false,
      id,
      value,
      rows,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const hasError = error || state === 'error';
    const finalState = hasError ? 'error' : state;
    const [currentValue, setCurrentValue] = useState((value as string) || '');
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Sync with external value changes
    useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(value as string);
      }
    }, [value]);

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [currentValue, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setCurrentValue(newValue);
      props.onChange?.(e);
    };

    const characterCount = currentValue?.length || 0;
    const characterRemaining = maxLength ? maxLength - characterCount : null;
    const isOverLimit = maxLength && characterCount > maxLength;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-text-secondary"
            >
              {label}
            </label>
            {maxLength && showCharacterCount && (
              <span
                className={cn(
                  'text-xs',
                  isOverLimit ? 'text-error' : 'text-text-muted'
                )}
              >
                {characterRemaining !== null ? (
                  <>
                    {characterRemaining} {characterRemaining === 1 ? 'character' : 'characters'} remaining
                  </>
                ) : (
                  <>{characterCount} characters</>
                )}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-3 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          <textarea
            ref={textareaRef}
            id={textareaId}
            value={value}
            maxLength={maxLength}
            className={cn(
              textareaVariants({ variant, size, state: finalState }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            onChange={handleChange}
            rows={rows}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-3 text-text-muted pointer-events-none">
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

        {/* Character count at bottom (alternative position) */}
        {maxLength && showCharacterCount && !label && (
          <div className="flex justify-end mt-1.5">
            <span
              className={cn(
                'text-xs',
                isOverLimit ? 'text-error' : 'text-text-muted'
              )}
            >
              {characterCount}/{maxLength}
            </span>
          </div>
        )}
      </div>
    );
  }
);

TextareaUntitledComponent.displayName = 'TextareaUntitled';

export const TextareaUntitled = TextareaUntitledComponent;

export const Textarea = TextareaUntitledComponent;
