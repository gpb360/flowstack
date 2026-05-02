/**
 * Sidebar Component (Untitled UI)
 *
 * A collapsible sidebar navigation component with support for nested menus.
 * Based on Untitled UI Sidebar design.
 *
 * Features:
 * - Collapsible sections
 * - Active state highlighting
 * - Icons and badges
 * - Multiple sizes
 * - Mobile responsive
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
  Menu,
} from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconType?: 'lucide' | 'custom';
  badge?: string | number;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  active?: boolean;
  children?: SidebarItem[];
}

export interface SidebarSection {
  id: string;
  title?: string;
  items: SidebarItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface SidebarUntitledProps {
  /**
   * Logo or brand element
   */
  logo?: React.ReactNode;

  /**
   * Sidebar sections with navigation items
   */
  sections: SidebarSection[];

  /**
   * Currently active item ID
   */
  activeItemId?: string;

  /**
   * Callback when item is clicked
   */
  onItemClick?: (item: SidebarItem) => void;

  /**
   * Is sidebar collapsed?
   */
  collapsed?: boolean;

  /**
   * Callback when collapse state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Show collapse toggle button
   */
  showCollapseButton?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Sidebar width (when expanded)
   */
  width?: 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Background color variant
   */
  variant?: 'default' | 'elevated' | 'border';

  /**
   * Position variant
   */
  position?: 'left' | 'right' | 'floating';
}

// ============================================================================
// Helper Components
// ============================================================================

interface SidebarItemProps {
  item: SidebarItem;
  depth?: number;
  active?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  onItemClick?: (item: SidebarItem) => void;
}

const SidebarItemComponent = React.memo<SidebarItemProps>(
  ({ item, depth = 0, active, collapsed, onToggle, onItemClick }) => {
    const [isExpanded, setIsExpanded] = React.useState(
      item.children && item.children.length > 0
    );

    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;
    const paddingLeft = depth * 16 + 16;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (hasChildren) {
        setIsExpanded(!isExpanded);
        onToggle?.();
      }

      if (item.onClick) {
        item.onClick();
      }

      if (onItemClick) {
        onItemClick(item);
      }
    };

    const content = (
      <>
        {Icon && (
          <Icon
            className={cn(
              'w-4 h-4 flex-shrink-0',
              active && 'text-primary',
              item.disabled && 'opacity-50'
            )}
          />
        )}
        <span
          className={cn(
            'flex-1 truncate text-sm',
            active && 'font-medium text-text-primary',
            !active && 'text-text-secondary',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {collapsed && depth === 0 ? '' : item.label}
        </span>
        {item.badge && (
          <span
            className={cn(
              'ml-auto text-xs px-2 py-0.5 rounded-full',
              active
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface-hover text-text-muted'
            )}
          >
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <ChevronRight
            className={cn(
              'w-4 h-4 flex-shrink-0 transition-transform',
              isExpanded && 'transform rotate-90',
              active && 'text-primary'
            )}
          />
        )}
      </>
    );

    if (item.href) {
      return (
        <a
          href={item.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
            'hover:bg-surface-hover',
            active && 'bg-surface-hover text-text-primary shadow-sm',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left',
          'hover:bg-surface-hover',
          active && 'bg-surface-hover text-text-primary shadow-sm',
          item.disabled && 'opacity-50 cursor-not-allowed'
        )}
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={handleClick}
        disabled={item.disabled}
      >
        {content}
      </button>
    );
  });

SidebarItemComponent.displayName = 'SidebarItemComponent';

// ============================================================================
// Main Component
// ============================================================================

export const SidebarUntitled = React.forwardRef<HTMLDivElement, SidebarUntitledProps>(
  (
    {
      logo,
      sections,
      activeItemId,
      onItemClick,
      collapsed = false,
      onCollapsedChange,
      showCollapseButton = true,
      className,
      width = 'lg',
      variant = 'default',
      position = 'left',
    },
    ref
  ) => {
    const [internalCollapsed, setInternalCollapsed] = React.useState(collapsed);
    const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(
      new Set()
    );

    const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed;
    const setIsCollapsed = onCollapsedChange ?? setInternalCollapsed;

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const toggleSection = (sectionId: string) => {
      const newCollapsed = new Set(collapsedSections);
      if (newCollapsed.has(sectionId)) {
        newCollapsed.delete(sectionId);
      } else {
        newCollapsed.add(sectionId);
      }
      setCollapsedSections(newCollapsed);
    };

    const widthStyles = {
      sm: isCollapsed ? 'w-16' : 'w-56',
      md: isCollapsed ? 'w-16' : 'w-64',
      lg: isCollapsed ? 'w-20' : 'w-72',
      xl: isCollapsed ? 'w-20' : 'w-80',
    };

    const variantStyles = {
      default: 'bg-background border-r border-border',
      elevated: 'bg-surface border-r border-border shadow-lg',
      border: 'bg-surface border border-border shadow-sm',
    };

    const positionStyles = {
      left: 'left-0',
      right: 'right-0',
      floating: 'left-0 top-4 bottom-4 m-auto w-fit rounded-xl border border-border shadow-2xl',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'fixed h-full flex flex-col transition-all duration-300',
          widthStyles[width],
          variantStyles[variant],
          positionStyles[position],
          className
        )}
      >
        {/* Logo/Header */}
        {logo && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            {!isCollapsed && logo}
            {showCollapseButton && (
              <button
                onClick={toggleCollapse}
                className="p-1 rounded hover:bg-surface-hover transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-text-muted" />
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {sections.map((section) => {
            const isCollapsed = collapsedSections.has(section.id);

            return (
              <div key={section.id} className="space-y-1">
                {section.title && !isCollapsed && (
                  <div className="px-3 mb-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {section.title}
                  </div>
                )}

                {section.items.map((item) => (
                  <SidebarItemComponent
                    key={item.id}
                    item={item}
                    depth={0}
                    active={activeItemId === item.id}
                    collapsed={isCollapsed}
                    onToggle={() => toggleSection(section.id)}
                    onItemClick={onItemClick}
                  />
                ))}

                {section.collapsible && isCollapsed && !isCollapsed && (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors"
                  >
                    <span>Show more</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border">
          {!isCollapsed && (
            <div className="text-xs text-text-muted">
              © 2025 FlowStack
            </div>
          )}
        </div>
      </div>
    );
  }
);

SidebarUntitled.displayName = 'SidebarUntitled';

// ============================================================================
// Sidebar with Section Control
// ============================================================================

export interface SidebarWithSectionsProps extends SidebarUntitledProps {
  /**
   * Control which sections are collapsed
   */
  sectionState?: Record<string, boolean>;
  onSectionStateChange?: (sectionId: string, collapsed: boolean) => void;
}

export const SidebarWithSections = React.forwardRef<
  HTMLDivElement,
  SidebarWithSectionsProps
>(({ sectionState, onSectionStateChange, sections, ...props }, ref) => {
  // Convert sectionState to Set of collapsed sections
  const collapsedSections = React.useMemo(() => {
    if (!sectionState) return new Set<string>();
    return new Set(
      Object.entries(sectionState)
        .filter(([, collapsed]) => collapsed)
        .map(([id]) => id)
    );
  }, [sectionState]);

  return (
    <SidebarUntitled
      ref={ref}
      {...props}
      sections={sections.map((section) => ({
        ...section,
        collapsible: section.collapsible ?? true,
        defaultCollapsed: collapsedSections.has(section.id),
      }))}
    />
  );
});

SidebarWithSections.displayName = 'SidebarWithSections';
