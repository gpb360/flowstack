/**
 * Metric Card Component (Untitled UI)
 *
 * A card component for displaying key metrics with optional trends and sparklines.
 * Based on Untitled UI Metric Card design.
 *
 * Variants:
 * - default: Standard metric card
 * - compact: Smaller variant for tight spaces
 * - large: Larger variant for emphasis
 * - gradient: Gradient background for visual appeal
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { TrendingUp, TrendingDown, Minus } from '@/types/icons';

export interface MetricCardUntitledProps {
  /**
   * Metric title/label
   */
  title: string;

  /**
   * Primary metric value to display
   */
  value: string | number;

  /**
   * Optional subtitle or context
   */
  subtitle?: string;

  /**
   * Optional icon to display
   */
  icon?: React.ReactNode | LucideIcon;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Trend percentage (e.g., "+12.5%")
   */
  trend?: string;

  /**
   * Is the trend positive?
   */
  trendUp?: boolean;

  /**
   * Is the trend neutral (no change)?
   */
  trendNeutral?: boolean;

  /**
   * Visual variant
   */
  variant?: 'default' | 'compact' | 'large' | 'gradient';

  /**
   * Optional sparkline data (array of numbers)
   */
  sparkline?: number[];

  /**
   * Color theme for the card
   */
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const MetricCardUntitled = React.forwardRef<HTMLDivElement, MetricCardUntitledProps>(
  function MetricCardUntitledImpl({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendUp = true,
    trendNeutral = false,
    variant = 'default',
    sparkline,
    color = 'primary',
    onClick,
    loading = false,
    className,
  }, ref) {
    const colorStyles = {
      primary: 'text-primary',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
      info: 'text-blue-500',
    };

    const bgStyles = {
      primary: 'bg-primary/10',
      success: 'bg-green-500/10',
      warning: 'bg-yellow-500/10',
      error: 'bg-red-500/10',
      info: 'bg-blue-500/10',
    };

    const variantStyles = {
      default: 'p-6',
      compact: 'p-4',
      large: 'p-8',
      gradient: 'p-6 bg-gradient-to-br from-primary/20 to-transparent',
    };

    const TrendIcon = trendUp ? TrendingUp : trendNeutral ? Minus : TrendingDown;
    const trendColor = trendNeutral
      ? 'text-text-muted'
      : trendUp
        ? 'text-green-500'
        : 'text-red-500';

    // Calculate sparkline SVG path
    const sparklinePath = React.useMemo(() => {
      if (!sparkline || sparkline.length < 2) return '';

      const max = Math.max(...sparkline);
      const min = Math.min(...sparkline);
      const range = max - min || 1;

      const width = 100;
      const height = 30;
      const step = width / (sparkline.length - 1);

      const path = sparkline
        .map((value, index) => {
          const x = index * step;
          const y = height - ((value - min) / range) * height;
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

      return path;
    }, [sparkline]);

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-surface border border-border rounded-lg',
            variantStyles[variant],
            onClick && 'cursor-pointer hover:border-border-strong transition-colors',
            className
          )}
        >
          <div className="animate-pulse">
            <div className="h-4 bg-surface-hover rounded w-1/3 mb-2" />
            <div className="h-8 bg-surface-hover rounded w-2/3 mb-4" />
            <div className="h-3 bg-surface-hover rounded w-1/4" />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-surface border border-border rounded-lg',
          variantStyles[variant],
          onClick && 'cursor-pointer hover:border-border-strong transition-colors',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon and Content */}
          <div className="flex items-center gap-4 flex-1">
            {Icon && (
              <div className={cn('p-2 rounded-lg', bgStyles[color])}>
                {React.isValidElement(Icon) ? Icon : typeof Icon === 'function' ? <Icon className={cn('w-5 h-5', colorStyles[color])} /> : null}
              </div>
            )}

            <div className="flex-1">
              {/* Title */}
              <p className="text-sm text-text-secondary font-medium mb-1">
                {title}
              </p>

              {/* Value */}
              <p className={cn(
                'text-2xl font-bold text-text-primary',
                variant === 'large' && 'text-3xl',
                variant === 'compact' && 'text-xl'
              )}>
                {value}
              </p>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-xs text-text-muted mt-1">
                  {subtitle}
                </p>
              )}

              {/* Trend */}
              {trend && (
                <div className={cn('flex items-center gap-1 mt-2 text-sm font-medium', trendColor)}>
                  <TrendIcon className="w-4 h-4" />
                  <span>{trend}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Sparkline */}
          {sparkline && sparkline.length > 1 && (
            <div className="flex-shrink-0 w-24 h-12">
              <svg
                viewBox="0 0 100 30"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={colorStyles[color]}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id={`gradient-${color}`}>
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${sparklinePath} L 100 30 L 0 30 Z`}
                  fill={`url(#gradient-${color})`}
                  className={colorStyles[color]}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MetricCardUntitled.displayName = 'MetricCardUntitled';

/**
 * Metric Grid - Container for multiple metric cards
 */
export interface MetricGridProps {
  children: React.ReactNode;
  /**
   * Number of columns (responsive)
   */
  cols?: 2 | 3 | 4 | 6;
  /**
   * Gap between cards
   */
  gap?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
}

export const MetricGrid = React.forwardRef<HTMLDivElement, MetricGridProps>(
  ({ children, cols = 4, gap = 'md', className }, ref) => {
    const colStyles = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
    };

    const gapStyles = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn('grid', colStyles[cols], gapStyles[gap], className)}
      >
        {children}
      </div>
    );
  }
);

MetricGrid.displayName = 'MetricGrid';
