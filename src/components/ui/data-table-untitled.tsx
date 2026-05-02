/**
 * Data Table Component (Untitled UI)
 *
 * A versatile table component for displaying tabular data with sorting, filtering, and pagination.
 * Based on Untitled UI Table design.
 *
 * Features:
 * - Sortable columns
 * - Selectable rows
 * - Custom cell renderers
 * - Loading and empty states
 * - Responsive design
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from '@/types/icons';

// ============================================================================
// Types
// ============================================================================

export interface ColumnDef<TData = any> {
  /**
   * Unique identifier for the column
   */
  id?: string;

  /**
   * Column header label
   */
  header: string;

  /**
   * Accessor key for the data field
   */
  accessorKey?: keyof TData | string;

  /**
   * Alias for accessorKey (compatibility)
   */
  accessor?: string;

  /**
   * Column label (alias for header)
   */
  label?: string;

  /**
   * Custom cell renderer — accepts multiple signatures for compatibility
   */
  cell?: ((props: { row: TData; value: unknown }) => React.ReactNode) | ((row: TData) => React.ReactNode) | ((value: any, row?: any) => React.ReactNode);

  /**
   * Alias for cell (compatibility)
   */
  render?: (item: TData) => React.ReactNode;

  /**
   * Column width (optional)
   */
  width?: number | string;

  /**
   * Enable sorting for this column
   */
  sortable?: boolean;

  /**
   * Enable filtering for this column
   */
  filterable?: boolean;

  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';

  /**
   * Additional CSS classes for the column header
   */
  headerClassName?: string;

  /**
   * Additional CSS classes for cells in this column
   */
  cellClassName?: string;

  /** Catch-all for additional props */
  [key: string]: any;
}

export interface DataTableUntitledProps<TData> {
  /**
   * Column definitions
   */
  columns: ColumnDef<TData>[];

  /**
   * Data to display
   */
  data: TData[];

  /**
   * Unique key selector for rows
   */
  getRowId?: (row: TData, index: number) => string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Empty state message when no data
   */
  emptyMessage?: string;

  /**
   * Empty state description
   */
  emptyDescription?: string;

  /**
   * Enable row selection
   */
  enableRowSelection?: boolean;

  /**
   * Selected row IDs
   */
  selectedRows?: Set<string>;

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedRows: Set<string>) => void;

  /**
   * Sort state
   */
  sortConfig?: {
    columnId: string;
    direction: 'asc' | 'desc';
  };

  /**
   * Callback when sort changes
   */
  onSortChange?: (sortConfig: { columnId: string; direction: 'asc' | 'desc' } | null) => void;

  /**
   * Row click handler
   */
  onRowClick?: (row: TData) => void;

  /**
   * Pagination state
   */
  pagination?: boolean | {
    page: number;
    pageSize: number;
    total: number;
  };

  /**
   * Callback when page changes
   */
  onPageChange?: (page: number) => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Table size variant
   */
  size?: 'sm' | 'md' | 'lg';

  /** Enable sorting on all columns */
  sortable?: boolean;

  /** Enable filtering */
  filterable?: boolean;

  /** Default page size */
  pageSize?: number;

  /** Catch-all for compatibility */
  [key: string]: any;
}

// ============================================================================
// Helper Components
// ============================================================================

interface SortIndicatorProps {
  direction: 'asc' | 'desc' | null;
}

const SortIndicator = ({ direction }: SortIndicatorProps) => {
  if (!direction) return null;

  const Icon = direction === 'asc' ? ChevronUp : ChevronDown;

  return (
    <Icon className="w-4 h-4 inline-block ml-1 text-text-muted" />
  );
};

// ============================================================================
// Main Component
// ============================================================================

export function DataTableUntitled<TData extends Record<string, unknown>>({
  columns,
  data,
  getRowId = (_row, index) => `${index}`,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyDescription = 'Try adjusting your filters or check back later',
  enableRowSelection = false,
  selectedRows = new Set(),
  onSelectionChange,
  sortConfig,
  onSortChange,
  onRowClick,
  pagination,
  onPageChange,
  className,
  size = 'md',
}: DataTableUntitledProps<TData>) {
  const [internalSortConfig, setInternalSortConfig] = React.useState<
    { columnId: string; direction: 'asc' | 'desc' } | undefined
  >();

  const effectiveSort = sortConfig ?? internalSortConfig;

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!onSortChange && !setInternalSortConfig) return;

    let direction: 'asc' | 'desc' = 'asc';

    if (effectiveSort?.columnId === columnId) {
      if (effectiveSort.direction === 'asc') {
        direction = 'desc';
      } else if (effectiveSort.direction === 'desc') {
        // Clear sort
        if (onSortChange) {
          onSortChange(null);
        } else {
          setInternalSortConfig(undefined);
        }
        return;
      }
    }

    const newSort = { columnId, direction };

    if (onSortChange) {
      onSortChange(newSort);
    } else {
      setInternalSortConfig(newSort);
    }
  };

  // Handle row selection
  const handleRowSelection = (rowId: string) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRows.size === data.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(data.map((_, i) => getRowId(_, i))));
    }
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!effectiveSort) return data;

    return [...data].sort((a, b) => {
      const aValue = a[effectiveSort.columnId];
      const bValue = b[effectiveSort.columnId];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return effectiveSort.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue);
      const bStr = String(bValue);

      return effectiveSort.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, effectiveSort]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination || pagination === true) return sortedData;

    const start = (pagination.page - 1) * pagination.pageSize;
    return sortedData.slice(start, start + pagination.pageSize);
  }, [sortedData, pagination]);

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const paddingStyles = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('bg-surface border border-border rounded-lg overflow-hidden', className)}>
        <div className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-surface-hover rounded w-1/4 mx-auto mb-2" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-surface-hover rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn('bg-surface border border-border rounded-lg overflow-hidden', className)}>
        <div className="p-12 text-center">
          <p className="text-text-muted mb-2">{emptyMessage}</p>
          <p className="text-sm text-text-secondary">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  const totalPages = (pagination && pagination !== true) ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const canPreviousPage = (pagination && pagination !== true) ? pagination.page > 1 : false;
  const canNextPage = (pagination && pagination !== true) ? pagination.page < totalPages : false;

  return (
    <div className={cn('bg-surface border border-border rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className={cn('w-full text-left', sizeStyles[size])}>
          {/* Header */}
          <thead className="bg-surface-hover/50 border-b border-border">
            <tr>
              {enableRowSelection && (
                <th className={cn(paddingStyles[size], 'w-12 text-center')}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-border"
                  />
                </th>
              )}
              {columns.map((column) => {
                const isSortable = column.sortable ?? false;
                const isSorted = effectiveSort?.columnId === column.id;

                return (
                  <th
                    key={column.id}
                    className={cn(
                      paddingStyles[size],
                      'font-semibold text-text-secondary uppercase tracking-wider',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      isSortable && 'cursor-pointer hover:bg-surface-hover/30 transition-colors',
                      column.headerClassName
                    )}
                    style={{ width: column.width }}
                    onClick={isSortable && column.id ? () => handleSort(column.id!) : undefined}
                  >
                    <div className={cn(
                      'flex items-center',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end'
                    )}>
                      {column.header}
                      {isSortable && <SortIndicator direction={isSorted && effectiveSort ? effectiveSort.direction : null} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {paginatedData.map((row, index) => {
              const rowId = getRowId(row, index);
              const isSelected = selectedRows.has(rowId);

              return (
                <tr
                  key={rowId}
                  className={cn(
                    'group transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-hover/50',
                    isSelected && 'bg-primary/5'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {enableRowSelection && (
                    <td className={cn(paddingStyles[size], 'w-12 text-center')}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRowSelection(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-border"
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    let cellContent: React.ReactNode;

                    if (column.cell) {
                      cellContent = column.cell({ row, value: row[column.accessorKey as keyof TData] });
                    } else if (column.accessorKey) {
                      cellContent = row[column.accessorKey as keyof TData] as React.ReactNode;
                    } else {
                      cellContent = null;
                    }

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          paddingStyles[size],
                          'text-text-secondary',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.cellClassName
                        )}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination !== true && onPageChange && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface/50">
          <div className="text-sm text-text-muted">
            Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(1)}
              disabled={!canPreviousPage}
              className="p-2 rounded hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!canPreviousPage}
              className="p-2 rounded hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-text-secondary px-2">
              Page {pagination.page} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!canNextPage}
              className="p-2 rounded hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={!canNextPage}
              className="p-2 rounded hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
