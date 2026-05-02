import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"

const tableVariants = cva("", {
  variants: {
    variant: {
      default: "",
      bordered: "border",
      striped: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (props: { row: Row<T> }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
}

export interface Row<T> {
  original: T
  index: number
  getValue: (key: keyof T) => any
}

export interface DataTableProps<T extends object>
  extends React.HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {
  data: T[]
  columns: ColumnDef<T>[]
  sortable?: boolean
  filterable?: boolean
  selectable?: boolean
  onRowClick?: (row: T) => void
  actions?: (row: T) => {
    label: string
    onClick: () => void
    variant?: "default" | "destructive"
  }[]
  emptyMessage?: string
  pageSize?: number
}

function DataTable<T extends object>({
  data,
  columns,
  sortable = false,
  filterable = false,
  selectable = false,
  onRowClick,
  actions,
  emptyMessage = "No data available",
  pageSize,
  variant,
  className,
  ...props
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)
  const [filterText, setFilterText] = React.useState("")
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)

  // Handle sorting
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key]
      const bValue = (b as any)[sortConfig.key]

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  // Handle filtering
  const filteredData = React.useMemo(() => {
    if (!filterText) return sortedData

    return sortedData.filter((row) =>
      columns.some((col) => {
        const value = (row as any)[col.accessorKey]
        return String(value)
          .toLowerCase()
          .includes(filterText.toLowerCase())
      })
    )
  }, [sortedData, filterText, columns])

  // Handle pagination
  const paginatedData = React.useMemo(() => {
    if (!pageSize) return filteredData

    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = pageSize ? Math.ceil(filteredData.length / pageSize) : 1

  const handleSort = (columnId: string) => {
    if (!sortable) return

    let direction: "asc" | "desc" = "asc"
    if (sortConfig?.key === columnId && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key: columnId, direction })
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => i)))
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const createRow = (item: T, index: number): Row<T> => ({
    original: item,
    index,
    getValue: (key) => (item as any)[key],
  })

  const SortIcon = sortConfig?.direction === "asc" ? ChevronUp : ChevronDown

  return (
    <div className="space-y-4">
      {filterable && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter..."
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <table
          className={cn(
            "w-full caption-bottom text-sm",
            variant === "striped" && "[&_tr:nth-child(odd)]:bg-muted/50",
            className
          )}
          {...props}
        >
          <thead className={cn("[&_tr]:border-b", variant === "bordered" && "border-b")}>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {selectable && (
                <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedData.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                    column.sortable && sortable && "cursor-pointer hover:bg-accent"
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable &&
                      sortable &&
                      (sortConfig?.key === column.id ? (
                        <SortIcon className="h-4 w-4" />
                      ) : (
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                      ))}
                  </div>
                </th>
              ))}
              {actions && <th className="w-[70px]" />}
            </tr>
          </thead>
          <tbody className={cn("[&_tr:last-child]:border-0")}>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (actions ? 1 : 0)
                  }
                  className="p-4 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIndex) => {
                const row = createRow(item, rowIndex)
                const isSelected = selectedRows.has(rowIndex)

                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
                      onRowClick && "cursor-pointer",
                      isSelected && "bg-muted"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowIndex)}
                          className="h-4 w-4 rounded border-gray-300"
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                      >
                        {column.cell
                          ? column.cell({ row })
                          : column.accessorKey && (
                              <span>{String(row.getValue(column.accessorKey))}</span>
                            )}
                      </td>
                    ))}
                    {actions && (
                      <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {actions(item).map((action, i) => (
                              <DropdownMenuItem
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  action.onClick()
                                }}
                                className={cn(
                                  action.variant === "destructive" &&
                                    "text-destructive focus:text-destructive"
                                )}
                              >
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {pageSize && pageSize < filteredData.length && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)} to{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable, tableVariants }
