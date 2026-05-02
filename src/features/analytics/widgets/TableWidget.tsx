// @ts-nocheck
import React from 'react';
import { DataTableUntitled, CardUntitled } from '@/components/ui';
import type { ColumnDef } from '@/components/ui';
import type { TableWidgetConfig } from '../types';

interface TableWidgetProps {
  title: string;
  data: any[];
  config?: TableWidgetConfig;
  className?: string;
}

export function TableWidget({
  title,
  data,
  config,
  className,
}: TableWidgetProps) {
  const {
    columns,
    sortable = true,
    filterable = true,
    pageSize = 10,
    showIndex: _showIndex = true,
  } = config || { columns: [] };

  // Generate columns if not provided
  const tableColumns: ColumnDef<any>[] = React.useMemo(() => {
    if (columns && columns.length > 0) {
      return columns;
    }

    // Auto-generate columns from data
    if (data.length > 0) {
      return Object.keys(data[0]).map((key) => ({
        id: key,
        header: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        accessorKey: key,
        sortable: true,
        filterable: true,
      }));
    }

    return [];
  }, [columns, data]);

  return (
    <CardUntitled title={title} className={className}>
      <DataTableUntitled
        data={data}
        columns={tableColumns}
        sortable={sortable}
        filterable={filterable}
        pageSize={pageSize}
        emptyMessage="No data available"
      />
    </CardUntitled>
  );
}
