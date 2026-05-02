/**
 * Accordion Component (Untitled UI)
 *
 * A vertically stacked set of interactive headings that reveal/hide content.
 * Based on Untitled UI Accordion design.
 *
 * Features:
 * - Single and multiple expand modes
 * - Icon and badge support
 * - Disabled states
 * - Multiple size variants
 * - Keyboard navigation
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { ChevronRight } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface AccordionItem {
  id: string;
  title: string;
  icon?: LucideIcon | React.ReactNode;
  description?: string;
  content: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  defaultExpanded?: boolean;
}

export interface AccordionUntitledProps {
  /**
   * Accordion items
   */
  items: AccordionItem[];

  /**
   * Currently expanded item IDs (controlled mode)
   */
  expandedIds?: string[];

  /**
   * Callback when expansion changes
   */
  onExpandedChange?: (expandedIds: string[]) => void;

  /**
   * Allow multiple items expanded at once
   */
  allowMultiple?: boolean;

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Visual variant
   */
  variant?: 'default' | 'bordered' | 'elevated' | 'minimal';

  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

interface AccordionItemComponentProps {
  item: AccordionItem;
  isExpanded: boolean;
  onToggle: () => void;
  size: 'sm' | 'md' | 'lg';
  variant: string;
}

const AccordionItemComponent = React.memo<AccordionItemComponentProps>(
  ({ item, isExpanded, onToggle, size, variant }) => {
    const Icon = item.icon as LucideIcon;

    const sizeStyles = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };

    const paddingStyles = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-5 py-4',
    };

    const contentPaddingStyles = {
      sm: 'px-3 pb-3',
      md: 'px-4 pb-4',
      lg: 'px-5 pb-5',
    };

    return (
      <div
        className={cn(
          'border border-border rounded-lg overflow-hidden transition-all duration-200',
          variant === 'elevated' && 'shadow-sm',
          variant === 'minimal' && 'border-transparent',
          isExpanded && variant === 'elevated' && 'shadow-md'
        )}
      >
        <button
          onClick={onToggle}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center gap-3 text-left transition-colors',
            paddingStyles[size],
            isExpanded
              ? 'bg-surface-hover text-text-primary'
              : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-expanded={isExpanded}
          aria-controls={`accordion-content-${item.id}`}
        >
          {Icon && (
            <Icon
              className={cn(
                'flex-shrink-0 transition-colors',
                size === 'sm' && 'w-4 h-4',
                size === 'md' && 'w-5 h-5',
                size === 'lg' && 'w-6 h-6',
                isExpanded && 'text-primary'
              )}
            />
          )}

          <div className="flex-1 min-w-0">
            <div
              className={cn(
                'font-medium truncate',
                sizeStyles[size],
                isExpanded && 'text-text-primary'
              )}
            >
              {item.title}
            </div>
            {item.description && !isExpanded && (
              <div className="text-xs text-text-muted mt-0.5 truncate">
                {item.description}
              </div>
            )}
          </div>

          {item.badge && (
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                isExpanded
                  ? 'bg-primary/20 text-primary'
                  : 'bg-surface-hover text-text-muted'
              )}
            >
              {item.badge}
            </span>
          )}

          <ChevronRight
            className={cn(
              'flex-shrink-0 transition-transform duration-200',
              size === 'sm' && 'w-4 h-4',
              size === 'md' && 'w-5 h-5',
              size === 'lg' && 'w-6 h-6',
              isExpanded && 'transform rotate-90',
              isExpanded && 'text-primary'
            )}
          />
        </button>

        <div
          id={`accordion-content-${item.id}`}
          role="region"
          aria-labelledby={`accordion-header-${item.id}`}
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-96' : 'max-h-0'
          )}
        >
          <div className={cn(contentPaddingStyles[size])}>
            <div className="text-text-secondary">{item.content}</div>
          </div>
        </div>
      </div>
    );
  }
);

AccordionItemComponent.displayName = 'AccordionItemComponent';

// ============================================================================
// Main Component
// ============================================================================

export const AccordionUntitled = React.forwardRef<
  HTMLDivElement,
  AccordionUntitledProps
>(
  (
    {
      items,
      expandedIds: controlledExpandedIds,
      onExpandedChange,
      allowMultiple = false,
      size = 'md',
      variant = 'default',
      className,
    },
    ref
  ) => {
    // Internal state for uncontrolled mode
    const [internalExpandedIds, setInternalExpandedIds] = React.useState<
      Set<string>
    >(
      new Set(
        items
          .filter((item) => item.defaultExpanded)
          .map((item) => item.id)
      )
    );

    const isControlled = controlledExpandedIds !== undefined;
    const expandedSet = isControlled
      ? new Set(controlledExpandedIds)
      : internalExpandedIds;

    const toggleItem = (itemId: string) => {
      const newExpanded = new Set(expandedSet);

      if (allowMultiple) {
        // Toggle the clicked item
        if (newExpanded.has(itemId)) {
          newExpanded.delete(itemId);
        } else {
          newExpanded.add(itemId);
        }
      } else {
        // Single mode: close all others, toggle clicked
        newExpanded.clear();
        if (!expandedSet.has(itemId)) {
          newExpanded.add(itemId);
        }
      }

      if (isControlled) {
        onExpandedChange?.(Array.from(newExpanded));
      } else {
        setInternalExpandedIds(newExpanded);
      }
    };

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        {items.map((item) => (
          <AccordionItemComponent
            key={item.id}
            item={item}
            isExpanded={expandedSet.has(item.id)}
            onToggle={() => toggleItem(item.id)}
            size={size}
            variant={variant}
          />
        ))}
      </div>
    );
  }
);

AccordionUntitled.displayName = 'AccordionUntitled';

// ============================================================================
// Accordion with Controlled Sections
// ============================================================================

export interface AccordionControlledProps extends Omit<AccordionUntitledProps, 'expandedIds' | 'onExpandedChange'> {
  /**
   * Default expanded item IDs
   */
  defaultExpanded?: string[];
}

export const AccordionControlled = React.forwardRef<
  HTMLDivElement,
  AccordionControlledProps
>(({ items, defaultExpanded = [], ...props }, ref) => {
  const [expandedIds, setExpandedIds] = React.useState<string[]>(defaultExpanded);

  return (
    <AccordionUntitled
      ref={ref}
      items={items}
      expandedIds={expandedIds}
      onExpandedChange={setExpandedIds}
      {...props}
    />
  );
});

AccordionControlled.displayName = 'AccordionControlled';

// ============================================================================
// Accordion Section (for single item usage)
// ============================================================================

export interface AccordionSectionProps {
  id: string;
  title: string;
  icon?: LucideIcon | React.ReactNode;
  description?: string;
  children: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'elevated' | 'minimal';
  className?: string;
}

export const AccordionSection = React.forwardRef<
  HTMLDivElement,
  AccordionSectionProps
>(
  (
    {
      id,
      title,
      icon,
      description,
      children,
      badge,
      disabled = false,
      defaultExpanded = false,
      expanded: controlledExpanded,
      onExpandedChange,
      size = 'md',
      variant = 'default',
      className,
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] =
      React.useState(defaultExpanded);

    const isControlled = controlledExpanded !== undefined;
    const isExpanded = isControlled ? controlledExpanded : internalExpanded;

    const toggle = () => {
      const newState = !isExpanded;
      if (isControlled) {
        onExpandedChange?.(newState);
      } else {
        setInternalExpanded(newState);
      }
    };

    const item: AccordionItem = {
      id,
      title,
      icon,
      description,
      content: children,
      badge,
      disabled,
    };

    return (
      <div ref={ref} className={className}>
        <AccordionItemComponent
          item={item}
          isExpanded={isExpanded}
          onToggle={toggle}
          size={size}
          variant={variant}
        />
      </div>
    );
  }
);

AccordionSection.displayName = 'AccordionSection';
