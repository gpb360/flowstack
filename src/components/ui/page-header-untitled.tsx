/**
 * Page Header Component (Untitled UI)
 *
 * A versatile page header component with title, description, and actions.
 * Based on Untitled UI Page Header design.
 *
 * Variants:
 * - default: Standard page header
 * - compact: Smaller variant for tight spaces
 * - gradient: Gradient background for emphasis
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';

export interface PageHeaderUntitledProps {
  /**
   * The main title of the page
   */
  title: string;

  /**
   * Optional subtitle or description
   */
  description?: string;

  /**
   * Optional icon to display before the title
   */
  icon?: LucideIcon;

  /**
   * Actions to display on the right side
   */
  actions?: React.ReactNode;

  /**
   * Breadcrumb navigation
   */
  breadcrumb?: React.ReactNode;

  /**
   * Visual variant
   */
  variant?: 'default' | 'compact' | 'gradient';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Optional background color
   */
  backgroundColor?: 'surface' | 'background' | 'primary';
}

export const PageHeaderUntitled = React.forwardRef<
  HTMLDivElement,
  PageHeaderUntitledProps
>(function PageHeaderUntitledImpl({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
  variant = 'default',
  className,
  backgroundColor = 'background',
}, ref) {
    const bgColors = {
      surface: 'bg-surface',
      background: 'bg-background',
      primary: 'bg-primary/10',
    };

    const variantStyles = {
      default: 'pb-4',
      compact: 'pb-2',
      gradient: 'pb-4 bg-gradient-to-r from-primary/20 to-transparent',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border-b border-border',
          bgColors[backgroundColor],
          variantStyles[variant],
          className
        )}
      >
        <div className="px-6 pt-6">
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="mb-4">
              {breadcrumb}
            </div>
          )}

          {/* Header Content */}
          <div className="flex items-start justify-between gap-4">
            {/* Title Section */}
            <div className="flex items-center gap-3 flex-1">
              {Icon && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PageHeaderUntitled.displayName = 'PageHeaderUntitled';

/**
 * Page Header with Tabs
 */
export interface PageHeaderWithTabsProps extends Omit<PageHeaderUntitledProps, 'actions'> {
  /**
   * Tab items
   */
  tabs: Array<{
    id: string;
    label: string;
    icon?: LucideIcon;
    content?: React.ReactNode;
  }>;

  /**
   * Currently active tab ID
   */
  activeTab: string;

  /**
   * Callback when tab changes
   */
  onTabChange: (tabId: string) => void;

  /**
   * Actions to display (optional, can be combined with tabs)
   */
  actions?: React.ReactNode;
}

export const PageHeaderWithTabs = React.forwardRef<
  HTMLDivElement,
  PageHeaderWithTabsProps
>(function PageHeaderWithTabsImpl({
  title,
  description,
  icon: Icon,
  tabs,
  activeTab,
  onTabChange,
  actions,
  breadcrumb,
  variant: _variant = 'default',
  className,
  backgroundColor = 'background',
}, ref) {
    const bgColors = {
      surface: 'bg-surface',
      background: 'bg-background',
      primary: 'bg-primary/10',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border-b border-border',
          bgColors[backgroundColor],
          'pb-0',
          className
        )}
      >
        <div className="px-6 pt-6 pb-4">
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="mb-4">
              {breadcrumb}
            </div>
          )}

          {/* Header Content */}
          <div className="flex items-start justify-between gap-4 mb-4">
            {/* Title Section */}
            <div className="flex items-center gap-3 flex-1">
              {Icon && (
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-hover p-1 rounded-lg">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-surface text-text-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  )}
                >
                  {TabIcon && <TabIcon className="w-4 h-4" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

PageHeaderWithTabs.displayName = 'PageHeaderWithTabs';
