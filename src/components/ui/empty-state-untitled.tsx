/**
 * Empty State Component (Untitled UI)
 *
 * A component for displaying empty states with optional illustrations, actions, and descriptions.
 * Based on Untitled UI Empty State design.
 *
 * Variants:
 * - default: Standard empty state
 * - compact: Smaller variant
 * - centered: Centered with larger visual
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';

export interface EmptyStateUntitledProps {
  /**
   * Icon or illustration to display
   */
  icon?: LucideIcon | React.ReactNode;

  /**
   * Main heading/title
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Optional primary action button
   */
  action?: React.ReactNode;

  /**
   * Optional secondary action link/button
   */
  secondaryAction?: React.ReactNode;

  /**
   * Visual variant
   */
  variant?: 'default' | 'compact' | 'centered';

  /**
   * Size of the icon/illustration
   */
  iconSize?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const EmptyStateUntitled = React.forwardRef<HTMLDivElement, EmptyStateUntitledProps>(
  function EmptyStateUntitledImpl({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    variant = 'default',
    iconSize = 'lg',
    className,
  }, ref) {
    const variantStyles = {
      default: 'py-12 px-6',
      compact: 'py-8 px-4',
      centered: 'py-16 px-6',
    };

    const iconSizes = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
    };

    const iconColor = 'text-text-muted';
    const iconBg = 'bg-surface-hover/50';

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          variantStyles[variant],
          className
        )}
      >
        {/* Icon or Illustration */}
        {Icon && (
          <div className={cn('mb-4', iconBg, 'rounded-full p-4', typeof Icon === 'function' && 'inline-flex')}>
            {typeof Icon === 'string' || React.isValidElement(Icon) ? (
              <div className={iconSizes[iconSize]}>{Icon as React.ReactNode}</div>
            ) : (
              <div className={iconSizes[iconSize]}>
                {React.createElement(Icon as React.ComponentType<{ className?: string }>, {
                  className: cn(iconColor, 'w-full h-full'),
                })}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-text-secondary max-w-md mb-6">
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex items-center gap-3">
            {action}
            {secondaryAction}
          </div>
        )}
      </div>
    );
  }
);

EmptyStateUntitled.displayName = 'EmptyStateUntitled';

/**
 * Empty State with List (e.g., for "no items found" with suggestions)
 */
export interface EmptyStateWithListProps {
  /**
   * Main title
   */
  title: string;

  /**
   * Description
   */
  description?: string;

  /**
   * List of suggestions/tips
   */
  suggestions: Array<{
    icon?: LucideIcon;
    text: string;
    action?: () => void;
  }>;

  /**
   * Optional action button
   */
  action?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const EmptyStateWithList = React.forwardRef<
  HTMLDivElement,
  EmptyStateWithListProps
>(({ title, description, suggestions, action, className }, ref) => {
  return (
    <div ref={ref} className={cn('py-12 px-6', className)}>
      <div className="max-w-md mx-auto text-center">
        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-text-secondary mb-6">
            {description}
          </p>
        )}

        {/* Suggestions List */}
        <div className="text-left bg-surface border border-border rounded-lg p-4 mb-6">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
            Suggestions
          </p>
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <li
                  key={index}
                  className={cn(
                    'flex items-start gap-3 text-sm',
                    suggestion.action && 'cursor-pointer hover:text-primary transition-colors'
                  )}
                  onClick={suggestion.action}
                >
                  {Icon && (
                    <Icon className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                  )}
                  <span className="text-text-secondary">{suggestion.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Action */}
        {action && <div className="flex justify-center">{action}</div>}
      </div>
    </div>
  );
});

EmptyStateWithList.displayName = 'EmptyStateWithList';

/**
 * Empty State Type (for common scenarios)
 */
export type EmptyStateType =
  | 'no-results'
  | 'no-data'
  | 'no-connections'
  | 'no-activity'
  | 'error'
  | 'not-authorized'
  | 'custom';

export interface EmptyStateTypedProps extends Omit<EmptyStateUntitledProps, 'icon' | 'title' | 'description'> {
  type: EmptyStateType;
  customTitle?: string;
  customDescription?: string;
}

export const EmptyStateTyped = React.forwardRef<
  HTMLDivElement,
  EmptyStateTypedProps
>(({ type, customTitle, customDescription, ...props }, ref) => {
  const emptyStateConfig = {
    'no-results': {
      title: customTitle || 'No results found',
      description: customDescription || 'Try adjusting your filters or search query',
    },
    'no-data': {
      title: customTitle || 'No data available',
      description: customDescription || 'Data will appear here once available',
    },
    'no-connections': {
      title: customTitle || 'No connections yet',
      description: customDescription || 'Connect with other services to see data here',
    },
    'no-activity': {
      title: customTitle || 'No recent activity',
      description: customDescription || 'Activity will appear here once you start using this feature',
    },
    'error': {
      title: customTitle || 'Something went wrong',
      description: customDescription || 'An error occurred while loading data',
    },
    'not-authorized': {
      title: customTitle || 'Access denied',
      description: customDescription || "You don't have permission to view this content",
    },
    custom: {
      title: customTitle || 'No data',
      description: customDescription,
    },
  }[type];

  return (
    <EmptyStateUntitled
      ref={ref}
      title={emptyStateConfig.title}
      description={emptyStateConfig.description}
      {...props}
    />
  );
});

EmptyStateTyped.displayName = 'EmptyStateTyped';
