/**
 * Breadcrumb Component (Untitled UI)
 *
 * Navigation breadcrumbs for showing page hierarchy.
 * Based on Untitled UI Breadcrumb design.
 *
 * Features:
 * - Automatic home icon
 * - Collapsed breadcrumbs for long paths
 * - Custom separators
 * - Clickable and non-clickable items
 * - Icon support
 */

import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { Home, ChevronRight, MoreHorizontal } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.ReactNode;
  href?: string;
  onClick?: () => void;
  current?: boolean;
}

export interface BreadcrumbUntitledProps {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[];

  /**
   * Show home icon as first item
   */
  showHome?: boolean;

  /**
   * Home link href
   */
  homeHref?: string;

  /**
   * Maximum items before collapsing
   */
  maxItems?: number;

  /**
   * Separator icon
   */
  separator?: React.ReactNode;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export const BreadcrumbUntitled = React.forwardRef<HTMLDivElement, BreadcrumbUntitledProps>(
  function BreadcrumbUntitledImpl({
    items,
    showHome = true,
    homeHref = '/',
    maxItems = 4,
    separator = <ChevronRight className="w-4 h-4" />,
    size = 'md',
    className,
  }, ref) {
    const sizeStyles = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    };

    // Build breadcrumb list with home
    const homeItem: BreadcrumbItem = {
      id: 'home',
      label: 'Home',
      icon: Home,
      href: homeHref,
    };
    const allItems = showHome
      ? [homeItem, ...items]
      : items;

    // Collapse breadcrumbs if too many items
    const shouldCollapse = allItems.length > maxItems;
    let displayItems = allItems;

    if (shouldCollapse) {
      const keepFromStart = 2;
      const keepFromEnd = maxItems - keepFromStart - 1;

      const collapsedItem: BreadcrumbItem = {
        id: 'collapsed',
        label: '...',
        icon: MoreHorizontal,
      };
      displayItems = [
        ...allItems.slice(0, keepFromStart),
        collapsedItem,
        ...allItems.slice(-keepFromEnd),
      ];
    }

    return (
      <nav ref={ref} aria-label="Breadcrumb" className={cn('flex items-center gap-2', className)}>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const Icon = item.icon as LucideIcon;

          const content = (
            <div className="flex items-center gap-2">
              {Icon && (
                <Icon
                  className={cn(
                    'flex-shrink-0',
                    size === 'sm' && 'w-3 h-3',
                    size === 'md' && 'w-4 h-4',
                    size === 'lg' && 'w-5 h-5',
                    item.current ? 'text-text-primary' : 'text-text-muted'
                  )}
                />
              )}
              <span
                className={cn(
                  'font-medium',
                  sizeStyles[size],
                  item.current
                    ? 'text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {item.label}
              </span>
            </div>
          );

          return (
            <div key={item.id} className="flex items-center gap-2">
              {item.href || item.onClick ? (
                <Link
                  to={item.href || '#'}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={cn(
                    'transition-colors',
                    item.current
                      ? 'cursor-default'
                      : 'hover:text-text-primary'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {content}
                </Link>
              ) : (
                <span className="cursor-default">{content}</span>
              )}

              {!isLast && (
                <span
                  className={cn(
                    'flex-shrink-0 text-text-muted',
                    size === 'sm' && 'w-3 h-3',
                    size === 'md' && 'w-4 h-4',
                    size === 'lg' && 'w-5 h-5'
                  )}
                >
                  {separator}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    );
  }
);

BreadcrumbUntitled.displayName = 'BreadcrumbUntitled';

// ============================================================================
// Breadcrumb with Ellipsis (for mobile)
// ============================================================================

export interface BreadcrumbEllipsisProps extends Omit<BreadcrumbUntitledProps, 'maxItems'> {
  /**
   * Breakpoint for collapsing (in pixels)
   */
  collapseBreakpoint?: number;
}

export const BreadcrumbEllipsis = React.forwardRef<HTMLDivElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsisImpl({ items, collapseBreakpoint = 768, ...props }, ref) {
    const [isCollapsed, setIsCollapsed] = React.useState(
      typeof window !== 'undefined' && window.innerWidth < collapseBreakpoint
    );

    React.useEffect(() => {
      const handleResize = () => {
        setIsCollapsed(window.innerWidth < collapseBreakpoint);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [collapseBreakpoint]);

    // On mobile, only show current item
    const maxItems = isCollapsed ? 2 : 4;

    return <BreadcrumbUntitled ref={ref} items={items} maxItems={maxItems} {...props} />;
  }
);

BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

// ============================================================================
// Breadcrumb Item (for manual construction)
// ============================================================================

export const BreadcrumbItemUntitled: React.FC<{
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  current?: boolean;
  className?: string;
}> = function BreadcrumbItemUntitledImpl({ children, href, onClick, current, className }) {
  const content = (
    <span
      className={cn(
        'text-sm font-medium transition-colors',
        current
          ? 'text-text-primary cursor-default'
          : 'text-text-secondary hover:text-text-primary cursor-pointer'
      )}
    >
      {children}
    </span>
  );

  return (
    <div className={cn('flex items-center', className)}>
      {href || onClick ? (
        <Link
          to={href || '#'}
          onClick={(e) => {
            if (onClick) {
              e.preventDefault();
              onClick();
            }
          }}
          aria-current={current ? 'page' : undefined}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

export const BreadcrumbSeparator: React.FC<{
  children?: React.ReactNode;
  className?: string;
}> = function BreadcrumbSeparatorImpl({ children = <ChevronRight className="w-4 h-4" />, className }) {
  return (
    <span className={cn('flex-shrink-0 text-text-muted w-4 h-4', className)}>
      {children}
    </span>
  );
};

export const BreadcrumbRoot = React.forwardRef<
  HTMLElement,
  {
    children: React.ReactNode;
    className?: string;
  }
>(function BreadcrumbRootImpl({ children, className }, ref) {
  return <nav ref={ref} aria-label="Breadcrumb" className={cn('flex items-center gap-2', className)}>{children}</nav>;
});

BreadcrumbRoot.displayName = 'BreadcrumbRoot';

// ============================================================================
// Breadcrumb List (shortcut for common pattern)
// ============================================================================

export interface BreadcrumbListProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export const BreadcrumbList = React.forwardRef<HTMLDivElement, BreadcrumbListProps>(
  function BreadcrumbListImpl({ items, className }, ref) {
    return (
      <BreadcrumbRoot ref={ref} className={className}>
        {items.map((item, index) => {
          const Icon = typeof item.icon === 'function' ? item.icon : undefined;
          return (
            <React.Fragment key={item.id}>
              <BreadcrumbItemUntitled
                href={item.href}
                onClick={item.onClick}
                current={item.current}
              >
                {Icon && <Icon className="w-4 h-4 mr-1" />}
                {item.label}
              </BreadcrumbItemUntitled>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbRoot>
    );
  }
);

BreadcrumbList.displayName = 'BreadcrumbList';
