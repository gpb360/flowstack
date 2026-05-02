/**
 * Progress Component (Untitled UI)
 *
 * Visual progress indicators for showing completion status.
 * Based on Untitled UI Progress design.
 *
 * Features:
 * - Linear and circular progress bars
 * - Multiple size variants
 * - Color variants
 * - Animated progress
 * - Indeterminate state
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { Check } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export type ProgressSize = 'sm' | 'md' | 'lg';
export type ProgressColor = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type ProgressVariant = 'linear' | 'circular';

export interface ProgressUntitledProps {
  /**
   * Progress value (0-100)
   */
  value?: number;

  /**
   * Maximum value (default: 100)
   */
  max?: number;

  /**
   * Size variant
   */
  size?: ProgressSize;

  /**
   * Color variant
   */
  color?: ProgressColor;

  /**
   * Visual variant
   */
  variant?: ProgressVariant;

  /**
   * Show progress label
   */
  showLabel?: boolean;

  /**
   * Custom label
   */
  label?: string;

  /**
   * Indeterminate state (loading)
   */
  indeterminate?: boolean;

  /**
   * Icon to show when complete
   */
  completeIcon?: LucideIcon | React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Linear Progress
// ============================================================================

interface LinearProgressProps {
  value: number;
  max: number;
  size: ProgressSize;
  color: ProgressColor;
  indeterminate: boolean;
  showLabel: boolean;
  label?: string;
  completeIcon?: LucideIcon | React.ReactNode;
  className?: string;
}

const LinearProgress: React.FC<LinearProgressProps> = ({
  value,
  max,
  size,
  color,
  indeterminate,
  showLabel,
  label,
  completeIcon,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isComplete = percentage >= 100;

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorStyles = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info',
  };

  const CompleteIcon = completeIcon as LucideIcon;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className="text-xs font-medium text-text-primary">
            {label || `${Math.round(percentage)}%`}
          </span>
        )}
        {isComplete && completeIcon && (
          <CompleteIcon className="w-4 h-4 text-success" />
        )}
      </div>
      <div
        className={cn(
          'w-full bg-surface-hover rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            colorStyles[color],
            indeterminate && 'animate-pulse'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Circular Progress
// ============================================================================

interface CircularProgressProps {
  value: number;
  max: number;
  size: ProgressSize;
  color: ProgressColor;
  indeterminate: boolean;
  showLabel: boolean;
  label?: string;
  completeIcon?: LucideIcon | React.ReactNode;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size,
  color,
  indeterminate,
  showLabel,
  label,
  completeIcon,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const isComplete = percentage >= 100;

  const sizeStyles = {
    sm: { size: 32, strokeWidth: 3 },
    md: { size: 48, strokeWidth: 4 },
    lg: { size: 64, strokeWidth: 5 },
  };

  const config = sizeStyles[size];
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const colorStyles = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-error',
    info: 'stroke-info',
  };

  const CompleteIcon = completeIcon as LucideIcon;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          className="stroke-surface-hover"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          className={cn(
            'transition-all duration-300',
            colorStyles[color],
            indeterminate && 'animate-spin-slow'
          )}
          strokeWidth={config.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={indeterminate ? circumference * 0.75 : offset}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isComplete && completeIcon ? (
          <CompleteIcon className="w-4 h-4 text-success" />
        ) : showLabel ? (
          <span
            className={cn(
              'font-medium text-text-primary',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {label || Math.round(percentage)}
          </span>
        ) : null}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const ProgressUntitled = React.forwardRef<
  HTMLDivElement,
  ProgressUntitledProps
>(
  (
    {
      value = 0,
      max = 100,
      size = 'md',
      color = 'primary',
      variant = 'linear',
      showLabel = false,
      label,
      indeterminate = false,
      completeIcon = Check,
      className,
    },
    _ref
  ) => {
    const props = {
      value,
      max,
      size,
      color,
      indeterminate,
      showLabel,
      label,
      completeIcon,
      className,
    };

    return (
      <div className={className}>
        {variant === 'circular' ? (
          <CircularProgress {...props} />
        ) : (
          <LinearProgress {...props} />
        )}
      </div>
    );
  }
);

ProgressUntitled.displayName = 'ProgressUntitled';

// ============================================================================
// Progress Group (multiple progress bars)
// ============================================================================

export interface ProgressItem {
  id: string;
  label: string;
  value: number;
  max?: number;
  color?: ProgressColor;
}

export interface ProgressGroupProps {
  /**
   * Progress items
   */
  items: ProgressItem[];

  /**
   * Size variant
   */
  size?: ProgressSize;

  /**
   * Show labels
   */
  showLabels?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ProgressGroup = React.forwardRef<
  HTMLDivElement,
  ProgressGroupProps
>(({ items, size = 'md', showLabels = true, className }, ref) => {
  return (
    <div ref={ref} className={cn('space-y-3', className)}>
      {items.map((item) => (
        <ProgressUntitled
          key={item.id}
          value={item.value}
          max={item.max}
          size={size}
          color={item.color}
          showLabel={showLabels}
          label={item.label}
        />
      ))}
    </div>
  );
});

ProgressGroup.displayName = 'ProgressGroup';

// ============================================================================
// Progress Steps (step indicators)
// ============================================================================

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status?: 'complete' | 'current' | 'pending';
  icon?: LucideIcon | React.ReactNode;
}

export interface ProgressStepsProps {
  /**
   * Steps
   */
  steps: ProgressStep[];

  /**
   * Size variant
   */
  size?: ProgressSize;

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Show step numbers
   */
  showNumbers?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const ProgressSteps = React.forwardRef<
  HTMLDivElement,
  ProgressStepsProps
>(({ steps, size = 'md', orientation = 'horizontal', showNumbers = true, className }, ref) => {
  const sizeStyles = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const connectorOrientation = orientation === 'horizontal' ? 'w-full h-0.5' : 'h-full w-0.5';

  return (
    <div ref={ref} className={cn('flex', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}>
      {steps.map((step, index) => {
        const isComplete = step.status === 'complete';
        const isCurrent = step.status === 'current';
        const isLast = index === steps.length - 1;
        const Icon = step.icon as LucideIcon;

        return (
          <div key={step.id} className={cn('flex items-center', orientation === 'horizontal' ? 'flex-1' : 'flex-col flex-1')}>
            {/* Step Circle */}
            <div className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center rounded-full font-semibold transition-colors',
                  sizeStyles[size],
                  isComplete && 'bg-success text-white',
                  isCurrent && 'bg-primary text-white',
                  !isComplete && !isCurrent && 'bg-surface-hover text-text-muted'
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : step.icon ? (
                  <Icon className="w-4 h-4" />
                ) : showNumbers ? (
                  index + 1
                ) : null}
              </div>

              {/* Step Label */}
              <div className={cn('ml-3', orientation === 'vertical' && 'ml-0 mt-2 text-center')}>
                <div
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-text-primary' : 'text-text-secondary'
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-xs text-text-muted mt-0.5">{step.description}</div>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  'mx-4 bg-surface-hover',
                  connectorOrientation,
                  isComplete && 'bg-success'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

ProgressSteps.displayName = 'ProgressSteps';
