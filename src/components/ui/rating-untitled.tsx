/**
 * Enhanced Rating component inspired by Untitled UI
 * Features 5-star rating, hover states, and controlled/uncontrolled modes
 * Uses gold color for filled stars
 */

import * as React from 'react';
import { Star, StarHalf } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useId } from 'react';

const starVariants = cva(
  'transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface RatingUntitledProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'value'>,
    VariantProps<typeof starVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number; // Controlled
  defaultValue?: number; // Uncontrolled
  onChange?: (value: number) => void;
  count?: number;
  allowHalf?: boolean;
  readonly?: boolean;
  disabled?: boolean;
}

const RatingUntitled = React.forwardRef<HTMLDivElement, RatingUntitledProps>(
  (
    {
      className,
      size,
      label,
      error,
      helperText,
      value: controlledValue,
      defaultValue = 0,
      onChange,
      count = 5,
      allowHalf = false,
      readonly = false,
      disabled = false,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const ratingId = id || `rating-${generatedId}`;

    // Uncontrolled state
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    // Determine if controlled or uncontrolled
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;
    const displayValue = hoverValue !== null ? hoverValue : currentValue;

    const handleMouseEnter = (index: number, event: React.MouseEvent) => {
      if (readonly || disabled) return;

      let newValue = index + 1;

      // Handle half-star rating
      if (allowHalf) {
        const star = event.currentTarget as SVGElement;
        const rect = star.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;

        if (x < width / 2) {
          newValue -= 0.5;
        }
      }

      setHoverValue(newValue);
    };

    const handleMouseLeave = () => {
      setHoverValue(null);
    };

    const handleClick = (index: number, event: React.MouseEvent) => {
      if (readonly || disabled) return;

      let newValue = index + 1;

      // Handle half-star rating
      if (allowHalf) {
        const star = event.currentTarget as SVGElement;
        const rect = star.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const width = rect.width;

        if (x < width / 2) {
          newValue -= 0.5;
        }
      }

      if (isControlled) {
        onChange?.(newValue);
      } else {
        setInternalValue(newValue);
        onChange?.(newValue);
      }
    };

    const renderStars = () => {
      const stars: React.ReactNode[] = [];

      for (let i = 0; i < count; i++) {
        const starValue = i + 1;
        const isFilled = displayValue >= starValue;
        const isHalf = allowHalf && displayValue >= i + 0.5 && displayValue < starValue;
        const isEmpty = !isFilled && !isHalf;

        const StarIcon = isHalf ? StarHalf : Star;

        stars.push(
          <StarIcon
            key={i}
            size={size === 'sm' ? 16 : size === 'lg' ? 24 : size === 'xl' ? 32 : 20}
            className={cn(
              starVariants({ size }),
              'cursor-pointer',
              isFilled && 'fill-primary text-primary',
              isHalf && 'fill-primary/50 text-primary',
              isEmpty && 'fill-transparent text-text-muted hover:text-primary/50',
              readonly && 'cursor-default',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            onMouseEnter={(e) => handleMouseEnter(i, e)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(i, e)}
          />
        );
      }

      return stars;
    };

    return (
      <div className="w-full" ref={ref} {...props}>
        {label && (
          <label
            htmlFor={ratingId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="flex items-center gap-1">
          {renderStars()}
          {!readonly && (
            <span className="ml-2 text-sm font-medium text-text-primary">
              {displayValue > 0 ? displayValue.toFixed(allowHalf ? 1 : 0) : ''}
            </span>
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

RatingUntitled.displayName = 'RatingUntitled';

export { RatingUntitled };
