/**
 * Alert Component (Untitled UI)
 *
 * Contextual feedback messages for user actions.
 * Based on Untitled UI Alert design.
 *
 * Features:
 * - Multiple variants (success, error, warning, info)
 * - Dismissible alerts
 * - Icon support
 * - Action buttons
 * - Banner style
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertUntitledProps {
  /**
   * Alert variant
   */
  variant?: AlertVariant;

  /**
   * Size variant
   */
  size?: AlertSize;

  /**
   * Alert title
   */
  title?: string;

  /**
   * Alert message
   */
  children: React.ReactNode;

  /**
   * Show icon
   */
  showIcon?: boolean;

  /**
   * Custom icon
   */
  icon?: LucideIcon | React.ReactNode;

  /**
   * Dismissible
   */
  dismissible?: boolean;

  /**
   * Callback when dismissed
   */
  onDismiss?: () => void;

  /**
   * Action button
   */
  action?: React.ReactNode;

  /**
   * Banner style (full width)
   */
  banner?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

const DefaultIcons: Record<AlertVariant, LucideIcon> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: string; title: string }
> = {
  success: {
    container: 'bg-success/10 border-success/20 text-success',
    icon: 'text-success',
    title: 'text-success',
  },
  error: {
    container: 'bg-error/10 border-error/20 text-error',
    icon: 'text-error',
    title: 'text-error',
  },
  warning: {
    container: 'bg-warning/10 border-warning/20 text-warning',
    icon: 'text-warning',
    title: 'text-warning',
  },
  info: {
    container: 'bg-info/10 border-info/20 text-info',
    icon: 'text-info',
    title: 'text-info',
  },
};

// ============================================================================
// Main Component
// ============================================================================

export const AlertUntitled = React.forwardRef<HTMLDivElement, AlertUntitledProps>(
  (
    {
      variant = 'info',
      size = 'md',
      title,
      children,
      showIcon = true,
      icon,
      dismissible = false,
      onDismiss,
      action,
      banner = false,
      className,
    },
    ref
  ) => {
    const [isDismissed, setIsDismissed] = React.useState(false);

    const styles = variantStyles[variant];
    const DefaultIcon = DefaultIcons[variant];
    const Icon = (icon || DefaultIcon) as LucideIcon;

    const sizeStyles = {
      sm: 'text-sm p-3',
      md: 'text-base p-4',
      lg: 'text-lg p-5',
    };

    const handleDismiss = () => {
      setIsDismissed(true);
      onDismiss?.();
    };

    if (isDismissed) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'rounded-lg border flex items-start gap-3',
          styles.container,
          sizeStyles[size],
          banner && 'rounded-none border-x-0 border-t-0 first:border-t-0',
          className
        )}
      >
        {/* Icon */}
        {showIcon && (
          <Icon
            className={cn(
              'flex-shrink-0 mt-0.5',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6',
              styles.icon
            )}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4
              className={cn(
                'font-semibold mb-1',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg',
                styles.title
              )}
            >
              {title}
            </h4>
          )}
          <div
            className={cn(
              'text-text-primary',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base'
            )}
          >
            {children}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {action && <div className="flex-shrink-0">{action}</div>}
          {dismissible && (
            <button
              onClick={handleDismiss}
              className={cn(
                'flex-shrink-0 rounded p-1 hover:bg-black/5 transition-colors',
                styles.icon
              )}
              aria-label="Dismiss alert"
            >
              <X
                className={cn(
                  size === 'sm' && 'w-3 h-3',
                  size === 'md' && 'w-4 h-4',
                  size === 'lg' && 'w-5 h-5'
                )}
              />
            </button>
          )}
        </div>
      </div>
    );
  }
);

AlertUntitled.displayName = 'AlertUntitled';

// ============================================================================
// Alert with Actions
// ============================================================================

export interface AlertWithActionsProps extends AlertUntitledProps {
  /**
   * Primary action button
   */
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const AlertWithActions = React.forwardRef<
  HTMLDivElement,
  AlertWithActionsProps
>(({ primaryAction, ...props }, ref) => {
  return (
    <AlertUntitled
      ref={ref}
      {...props}
      action={
        primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="text-sm font-medium underline hover:no-underline"
          >
            {primaryAction.label}
          </button>
        )
      }
    />
  );
});

AlertWithActions.displayName = 'AlertWithActions';

// ============================================================================
// Inline Alert (compact, no border)
// ============================================================================

export interface InlineAlertProps extends Omit<
  AlertUntitledProps,
  'dismissible' | 'banner'
> {}

export const InlineAlert = React.forwardRef<HTMLDivElement, InlineAlertProps>(
  ({ variant = 'info', title, children, showIcon = true, icon, className }, ref) => {
  const styles = variantStyles[variant];
  const DefaultIcon = DefaultIcons[variant];
  const Icon = (icon || DefaultIcon) as LucideIcon;

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'flex items-center gap-2 text-sm',
        styles.container,
        'rounded-md px-2 py-1',
        className
      )}
    >
      {showIcon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        {title && <span className="font-semibold">{title}</span>}
        {title && ' '}
        <span className="text-text-primary">{children}</span>
      </div>
    </div>
  );
});

InlineAlert.displayName = 'InlineAlert';

// ============================================================================
// Alert Group (stacked alerts)
// ============================================================================

export interface AlertGroupProps {
  /**
   * Alert items
   */
  alerts: Array<{
    id: string;
    variant?: AlertVariant;
    title?: string;
    message: React.ReactNode;
  }>;

  /**
   * Allow dismissing
   */
  dismissible?: boolean;

  /**
   * Callback when alert dismissed
   */
  onDismiss?: (id: string) => void;

  /**
   * Maximum alerts to show
   */
  maxAlerts?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export const AlertGroup = React.forwardRef<HTMLDivElement, AlertGroupProps>(
  ({ alerts, dismissible = false, onDismiss, maxAlerts = 5, className }, ref) => {
    const [dismissedAlerts, setDismissedAlerts] = React.useState<Set<string>>(new Set());

    const visibleAlerts = alerts
      .filter((alert) => !dismissedAlerts.has(alert.id))
      .slice(0, maxAlerts);

    const handleDismiss = (id: string) => {
      setDismissedAlerts((prev) => new Set([...prev, id]));
      onDismiss?.(id);
    };

    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {visibleAlerts.map((alert) => (
          <AlertUntitled
            key={alert.id}
            variant={alert.variant}
            title={alert.title}
            dismissible={dismissible}
            onDismiss={() => handleDismiss(alert.id)}
          >
            {alert.message}
          </AlertUntitled>
        ))}
      </div>
    );
  });

AlertGroup.displayName = 'AlertGroup';

// ============================================================================
// Preset Alerts (common patterns)
// ============================================================================

export const SuccessAlert: React.FC<{
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}> = ({ title, children, onDismiss }) => (
  <AlertUntitled variant="success" title={title} dismissible onDismiss={onDismiss}>
    {children}
  </AlertUntitled>
);

export const ErrorAlert: React.FC<{
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}> = ({ title, children, onDismiss }) => (
  <AlertUntitled variant="error" title={title} dismissible onDismiss={onDismiss}>
    {children}
  </AlertUntitled>
);

export const WarningAlert: React.FC<{
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}> = ({ title, children, onDismiss }) => (
  <AlertUntitled variant="warning" title={title} dismissible onDismiss={onDismiss}>
    {children}
  </AlertUntitled>
);

export const InfoAlert: React.FC<{
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
}> = ({ title, children, onDismiss }) => (
  <AlertUntitled variant="info" title={title} dismissible onDismiss={onDismiss}>
    {children}
  </AlertUntitled>
);
