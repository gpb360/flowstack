/**
 * Command Menu Component (Untitled UI)
 *
 * A command palette for quick navigation and actions.
 * Based on Untitled UI Command Menu design.
 *
 * Features:
 * - Keyboard navigation (Cmd+K to open)
 * - Search/filter functionality
 * - Grouped commands
 * - Keyboard shortcuts display
 * - Recent commands history
 * - Nested navigation
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from '@/types/icons';
import { Search, ChevronRight } from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface CommandItem {
  id: string;
  label: string;
  icon?: LucideIcon | React.ReactNode;
  iconType?: 'lucide' | 'custom';
  description?: string;
  keywords?: string[];
  shortcut?: string[];
  action?: () => void;
  disabled?: boolean;
  badge?: string | number;
  children?: CommandItem[];
}

export interface CommandGroup {
  id: string;
  title?: string;
  items: CommandItem[];
}

export interface CommandMenuUntitledProps {
  /**
   * Command groups
   */
  groups: CommandGroup[];

  /**
   * Is command menu open?
   */
  open: boolean;

  /**
   * Callback when command menu closes
   */
  onClose: () => void;

  /**
   * Placeholder text for search input
   */
  placeholder?: string;

  /**
   * Show recent commands
   */
  showRecent?: boolean;

  /**
   * Max recent commands to show
   */
  maxRecent?: number;

  /**
   * Keyboard shortcut to open
   */
  shortcut?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Z-index for the menu
   */
  zIndex?: number;
}

// ============================================================================
// Helper Components
// ============================================================================

interface CommandItemComponentProps {
  item: CommandItem;
  isSelected: boolean;
  onSelect: () => void;
  depth?: number;
}

const CommandItemComponent = React.memo<CommandItemComponentProps>(
  ({ item, isSelected, onSelect, depth = 0 }) => {
    const Icon = item.icon as LucideIcon;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!item.disabled) {
            onSelect();
          }
        }}
        disabled={item.disabled}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors rounded-md',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-surface-hover text-text-primary',
          item.disabled && 'opacity-50 cursor-not-allowed',
          depth > 0 && 'ml-4'
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {Icon && (
          <Icon
            className={cn(
              'flex-shrink-0',
              isSelected ? 'text-primary-foreground' : 'text-text-muted'
            )}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className={cn('font-medium truncate', depth > 0 && 'text-sm')}>
            {item.label}
          </div>
          {item.description && !isSelected && (
            <div className="text-xs text-text-muted truncate">
              {item.description}
            </div>
          )}
        </div>

        {item.badge && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              isSelected
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-surface-hover text-text-muted'
            )}
          >
            {item.badge}
          </span>
        )}

        {item.shortcut && (
          <div className="flex items-center gap-1">
            {item.shortcut.map((key, index) => (
              <kbd
                key={index}
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded border',
                  isSelected
                    ? 'border-primary-foreground/30 text-primary-foreground'
                    : 'border-border text-text-muted'
                )}
              >
                {key}
              </kbd>
            ))}
          </div>
        )}

        {hasChildren && (
          <ChevronRight
            className={cn(
              'flex-shrink-0 w-4 h-4',
              isSelected ? 'text-primary-foreground' : 'text-text-muted'
            )}
          />
        )}
      </button>
    );
  }
);

CommandItemComponent.displayName = 'CommandItemComponent';

// ============================================================================
// Main Component
// ============================================================================

export const CommandMenuUntitled = React.forwardRef<
  HTMLDivElement,
  CommandMenuUntitledProps
>(
  (
    {
      groups,
      open,
      onClose,
      placeholder = 'Search commands...',
      showRecent = true,
      maxRecent = 5,
      shortcut = '⌘K',
      className,
      zIndex = 50,
    },
    ref
  ) => {
    const [search, setSearch] = React.useState('');
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [recentCommands, setRecentCommands] = React.useState<string[]>([]);
    const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
      new Set()
    );

    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const previousActiveElement = React.useRef<HTMLElement | null>(null);

    // Flatten all items for navigation
    const allItems = React.useMemo(() => {
      const items: { item: CommandItem; groupTitle?: string; depth: number }[] =
        [];

      // Add recent commands if searching
      if (showRecent && recentCommands.length > 0 && !search) {
        items.push(
          ...recentCommands
            .map((id) => {
              for (const group of groups) {
                const found = group.items.find((item) => item.id === id);
                if (found) {
                  return { item: found, groupTitle: 'Recent', depth: 0 };
                }
              }
              return null;
            })
            .filter(Boolean) as { item: CommandItem; groupTitle?: string; depth: number }[]
        );
      }

      // Add all groups
      groups.forEach((group) => {
        const isExpanded = expandedGroups.has(group.id);

        if (group.title) {
          items.push({ groupTitle: group.title, item: null as any, depth: 0 });
        }

        group.items.forEach((item) => {
          items.push({ item, depth: 0 });

          // Add children if expanded
          if (isExpanded && item.children) {
            item.children.forEach((child) => {
              items.push({ item: child, depth: 1 });
            });
          }
        });
      });

      return items;
    }, [groups, expandedGroups, recentCommands, search, showRecent]);

    // Filter items based on search
    const filteredItems = React.useMemo(() => {
      if (!search) return allItems;

      const searchLower = search.toLowerCase();
      return allItems.filter(({ item }) => {
        if (!item) return true; // Keep group titles

        // Check label, description, keywords
        const matchesLabel = item.label.toLowerCase().includes(searchLower);
        const matchesDescription =
          item.description?.toLowerCase().includes(searchLower);
        const matchesKeywords =
          item.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(searchLower)
          ) ?? false;

        return matchesLabel || matchesDescription || matchesKeywords;
      });
    }, [allItems, search]);

    // Get selectable items (exclude group titles)
    const selectableItems = React.useMemo(
      () => filteredItems.filter(({ item }) => item !== null),
      [filteredItems]
    );

    // Reset selected index when search changes
    React.useEffect(() => {
      setSelectedIndex(0);
    }, [search]);

    // Focus management
    React.useEffect(() => {
      if (open) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      } else {
        previousActiveElement.current?.focus();
      }
    }, [open]);

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!open) return;

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < selectableItems.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : selectableItems.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            const selectedItem = selectableItems[selectedIndex]?.item;
            if (selectedItem && !selectedItem.disabled) {
              handleSelectItem(selectedItem);
            }
            break;
          case 'Escape':
            e.preventDefault();
            onClose();
            break;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, selectedIndex, selectableItems, onClose]);

    const handleSelectItem = (item: CommandItem) => {
      // Add to recent commands
      setRecentCommands((prev) => {
        const filtered = prev.filter((id) => id !== item.id);
        return [item.id, ...filtered].slice(0, maxRecent);
      });

      // Execute action
      if (item.action) {
        item.action();
      }

      // Close menu
      onClose();
    };

    const handleGroupToggle = (groupId: string) => {
      setExpandedGroups((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(groupId)) {
          newSet.delete(groupId);
        } else {
          newSet.add(groupId);
        }
        return newSet;
      });
    };
    // TODO: Use handleGroupToggle for collapsible groups
    void handleGroupToggle;

    // Scroll selected item into view
    React.useEffect(() => {
      const selectedElement = containerRef.current?.querySelector(
        `[data-selected="true"]`
      );
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }, [selectedIndex]);

    return (
      <>
        {/* Backdrop */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 transition-opacity duration-200',
            open ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{ zIndex: zIndex - 1 }}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Command Menu */}
        <div
          ref={(node) => {
            if (node) {
              containerRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }
          }}
          className={cn(
            'fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl bg-surface border border-border rounded-lg shadow-2xl transition-all duration-200 overflow-hidden',
            !open && 'opacity-0 pointer-events-none scale-95',
            open && 'opacity-100 scale-100',
            className
          )}
          style={{ zIndex }}
          role="dialog"
          aria-modal="true"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted"
            />
            <kbd className="text-xs px-2 py-1 rounded border border-border text-text-muted">
              {shortcut}
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-text-muted">
                <p>No commands found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredItems.map(({ item, groupTitle, depth }) => {
                  // Group title
                  if (!item) {
                    return (
                      <div
                        key={groupTitle}
                        className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider"
                      >
                        {groupTitle}
                      </div>
                    );
                  }

                  // Command item
                  const globalIndex = selectableItems.findIndex(
                    ({ item: i }) => i.id === item.id
                  );
                  const isSelected = globalIndex === selectedIndex;

                  return (
                    <div key={item.id}>
                      <CommandItemComponent
                        item={item}
                        isSelected={isSelected}
                        onSelect={() => handleSelectItem(item)}
                        depth={depth}
                        data-selected={isSelected}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-surface-hover">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-border">
                    ↑↓
                  </kbd>
                  {' '}
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-border">
                    ↵
                  </kbd>
                  {' '}
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-border">
                    esc
                  </kbd>
                  {' '}
                  to close
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

CommandMenuUntitled.displayName = 'CommandMenuUntitled';

// ============================================================================
// Hook for managing command menu state
// ============================================================================

export function useCommandMenu(defaultOpen = false) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  // Open on Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
}

// ============================================================================
// Preset Command Groups
// ============================================================================

export const navigationCommands: CommandGroup = {
  id: 'navigation',
  title: 'Navigation',
  items: [
    {
      id: 'nav-dashboard',
      label: 'Go to Dashboard',
      icon: Search,
      shortcut: ['G', 'D'],
      action: () => (window.location.href = '/dashboard'),
    },
    {
      id: 'nav-crm',
      label: 'Go to CRM',
      shortcut: ['G', 'C'],
      action: () => (window.location.href = '/crm'),
    },
    {
      id: 'nav-workflows',
      label: 'Go to Workflows',
      shortcut: ['G', 'W'],
      action: () => (window.location.href = '/workflows'),
    },
  ],
};

export const actionCommands: CommandGroup = {
  id: 'actions',
  title: 'Actions',
  items: [
    {
      id: 'action-new-contact',
      label: 'New Contact',
      icon: Search,
      shortcut: ['N', 'C'],
      action: () => console.log('Create new contact'),
    },
    {
      id: 'action-new-company',
      label: 'New Company',
      shortcut: ['N', 'O'],
      action: () => console.log('Create new company'),
    },
    {
      id: 'action-new-deal',
      label: 'New Deal',
      shortcut: ['N', 'D'],
      action: () => console.log('Create new deal'),
    },
  ],
};
