/**
 * Enhanced Radio Group component inspired by Untitled UI
 * Features gold accent on selected state, error handling, and label support
 */

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useId } from 'react';

const radioVariants = cva(
  'shrink-0 rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'border-border bg-surface',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
          'hover:border-primary/50',
        ],
        filled: [
          'border-border bg-surface-elevated',
          'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
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

export interface RadioUntitledProps
  extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'size'>,
    VariantProps<typeof radioVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroupBase = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root className={cn('gap-2', className)} {...props} ref={ref} />
  );
});
RadioGroupBase.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & VariantProps<typeof radioVariants> & { error?: string }
>(({ className, variant, size, state, error, ...props }, ref) => {
  const hasError = error || state === 'error';
  const finalState = hasError ? 'error' : state;

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        radioVariants({ variant, size, state: finalState }),
        'focus-visible:ring-offset-background',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle
          size={size === 'sm' ? 6 : size === 'lg' ? 10 : 8}
          className="fill-white text-white"
          strokeWidth={3}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Wrapper component with label, error, and helper text
const RadioUntitledWrapper = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioUntitledProps
>(({ className, variant, size, state, label, error, helperText, options, orientation = 'vertical', id, name, ...props }, ref) => {
  const generatedId = useId();
  const groupId = id || `radio-${generatedId}`;
  const groupName = name || `radio-group-${generatedId}`;
  const hasError = error || state === 'error';
  const finalState = hasError ? 'error' : state;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={groupId}
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          {label}
        </label>
      )}
      <RadioGroupBase
        ref={ref}
        name={groupName}
        className={cn(
          orientation === 'vertical' ? 'flex flex-col gap-3' : 'flex flex-row gap-6',
          className
        )}
        {...props}
      >
        {options.map((option: RadioUntitledProps['options'][number]) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem
              id={`${groupId}-${option.value}`}
              value={option.value}
              variant={variant}
              size={size}
              state={finalState}
              disabled={option.disabled}
            />
            <label
              htmlFor={`${groupId}-${option.value}`}
              className={cn(
                'text-sm font-medium cursor-pointer select-none',
                option.disabled && 'opacity-50 cursor-not-allowed',
                hasError ? 'text-error' : 'text-text-primary'
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroupBase>
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
});

RadioUntitledWrapper.displayName = 'RadioUntitled';

export const RadioUntitled = RadioUntitledWrapper;
export { RadioGroupBase as RadioGroup, RadioGroupItem };
