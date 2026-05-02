/**
 * Tabs Component (Untitled UI)
 *
 * A versatile tabs component with support for icons, badges, and various styles.
 * Based on Untitled UI Tabs design.
 *
 * Features:
 * - Automatic and manual control modes
 * - Icon and badge support
 * - Vertical and horizontal orientations
 * - Multiple size variants
 * - Disabled states
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon | React.ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsUntitledProps {
  /**
   * Tab items (flat API mode)
   */
  tabs?: Tab[];

  /**
   * Currently active tab ID (flat API mode)
   */
  activeTab?: string;

  /**
   * Callback when tab changes
   */
  onTabChange?: (tabId: string) => void;

  /**
   * Default active tab (Radix-style compound API mode)
   */
  defaultValue?: string;

  /**
   * Controlled value (Radix-style compound API mode)
   */
  value?: string;

  /**
   * Tabs variant
   */
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Orientation
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Full width tabs
   */
  fullWidth?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Children (Radix-style compound API mode)
   */
  children?: React.ReactNode;
}

// ============================================================================
// Main Component
// ============================================================================

const TabsUntitledBase = React.forwardRef<HTMLDivElement, TabsUntitledProps>(function TabsUntitledImpl({
  tabs,
  activeTab,
  onTabChange,
  defaultValue,
  value,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  className,
  children,
}, ref) {
    // If children are provided, render as compound wrapper (Radix-style)
    if (children) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    // Otherwise render as flat component with tabs/activeTab/onTabChange
    const currentTab = activeTab || value || defaultValue || '';
    const handleChange = onTabChange || (() => {});
    const variantStyles = {
      default: {
        container: 'bg-surface-hover p-1 rounded-lg',
        tab: (isActive: boolean) =>
          isActive
            ? 'bg-surface text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface/50',
      },
      pills: {
        container: 'bg-surface-hover p-1 rounded-lg',
        tab: (isActive: boolean) =>
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface/50',
      },
      underline: {
        container: 'border-b border-border',
        tab: (isActive: boolean) =>
          cn(
            'px-3 py-2 text-sm font-medium transition-colors border-b-2',
            isActive
              ? 'border-primary text-text-primary'
              : 'border-transparent text-text-muted hover:text-text-secondary hover:border-text-muted'
          ),
      },
      enclosed: {
        container: 'flex bg-surface border border-border rounded-lg p-1 gap-1',
        tab: (isActive: boolean) =>
          isActive
            ? 'bg-surface text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface/50',
      },
    };

    const sizeStyles = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-2',
      lg: 'text-base px-4 py-2',
    };

    const orientationStyles = {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantStyles[variant].container,
          orientationStyles[orientation],
          fullWidth && orientation === 'horizontal' && 'w-full',
          className
        )}
      >
        {(tabs || []).map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon as LucideIcon;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'flex items-center gap-2 font-medium transition-colors rounded-md',
                sizeStyles[size],
                variantStyles[variant].tab(isActive),
                tab.disabled && 'opacity-50 cursor-not-allowed',
                fullWidth && orientation === 'horizontal' && 'flex-1'
              )}
            >
              {Icon && tab.iconPosition !== 'right' && (
                <Icon className={cn('w-4 h-4', size === 'lg' && 'w-5 h-5')} />
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'ml-1 text-xs px-2 py-0.5 rounded-full',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-hover text-text-muted'
                  )}
                >
                  {tab.badge}
                </span>
              )}
              {Icon && tab.iconPosition === 'right' && (
                <Icon className={cn('w-4 h-4', size === 'lg' && 'w-5 h-5')} />
              )}
            </button>
          );
        })}
      </div>
    );
  }
);

TabsUntitledBase.displayName = 'TabsUntitled';

// ============================================================================
// Compound sub-components for Radix-style <TabsUntitled.List>, .Trigger, .Content
// These provide backwards compatibility with the Radix Tabs compound pattern.
// ============================================================================

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('inline-flex h-10 items-center justify-center rounded-md bg-surface-hover p-1 text-text-secondary', className)} {...props} />
  )
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
}
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
}
const TabsContentCompound = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-2', className)} {...props} />
  )
);
TabsContentCompound.displayName = 'TabsContent';

// Re-export TabsUntitled with compound sub-components
const TabsUntitledWithCompound = Object.assign(TabsUntitledBase, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContentCompound,
});

export { TabsUntitledWithCompound as TabsUntitled };

// ============================================================================
// Tabs with Content
// ============================================================================

export interface TabsWithContentProps extends Omit<TabsUntitledProps, 'tabs'> {
  /**
   * Tab items with content panels
   */
  tabs: Array<Tab & { content: React.ReactNode }>;
}

export const TabsWithContent = React.forwardRef<HTMLDivElement, TabsWithContentProps>(
  ({ tabs = [], activeTab, onTabChange, ...props }, ref) => {
    return (
      <div ref={ref}>
        <TabsUntitledBase tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} {...props} />

        {/* Tab Content Panels */}
        <div className="mt-4">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              className={cn('hidden', activeTab === tab.id && 'block')}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

TabsWithContent.displayName = 'TabsWithContent';

// ============================================================================
// Vertical Tabs (for sidebar-like layouts)
// ============================================================================

export interface VerticalTabsProps extends Omit<TabsUntitledProps, 'orientation'> {
  /**
   * Width of the tabs container
   */
  width?: 'fit' | 'fixed' | 'full';
}

export const VerticalTabs = React.forwardRef<HTMLDivElement, VerticalTabsProps>(
  ({ tabs = [], activeTab, onTabChange, size: _size = 'md', variant = 'underline', width = 'fit', className }, ref) => {
    const widthStyles = {
      fit: 'w-fit',
      fixed: 'w-48',
      full: 'w-full',
    };

    return (
      <div ref={ref} className={cn('flex gap-4', className)}>
        {/* Tab Headers */}
        <div className={cn('flex flex-col space-y-1', widthStyles[width])}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon as LucideIcon;

            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && onTabChange?.(tab.id)}
                disabled={tab.disabled}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left',
                  isActive
                    ? 'bg-surface text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50',
                  tab.disabled && 'opacity-50 cursor-not-allowed',
                  variant === 'underline' && isActive && 'border-b-2 border-primary'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-auto text-xs bg-surface-hover text-text-muted px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="flex-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              className={cn('hidden', activeTab === tab.id && 'block')}
            >
              {tab.content}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

VerticalTabs.displayName = 'VerticalTabs';
