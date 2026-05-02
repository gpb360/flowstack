import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card } from "./card"

export interface KanbanItem {
  id: string
  title: string
  description?: string
  content?: React.ReactNode
}

export interface KanbanColumn {
  id: string
  title: string
  items: KanbanItem[]
}

export interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: KanbanColumn[]
  onMove: (itemId: string, sourceColumnId: string, targetColumnId: string) => void
  onReorder?: (columnId: string, items: KanbanItem[]) => void
}

function KanbanBoard({
  columns,
  onMove,
  onReorder,
  className,
  ...props
}: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeColumnId, setActiveColumnId] = React.useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    // Find which column this item belongs to
    for (const column of columns) {
      if (column.items.some(item => item.id === active.id)) {
        setActiveColumnId(column.id)
        break
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveColumnId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and target columns
    const sourceColumn = columns.find(col =>
      col.items.some(item => item.id === activeId)
    )
    const targetColumn = columns.find(col =>
      col.id === overId || col.items.some(item => item.id === overId)
    )

    if (!sourceColumn || !targetColumn) return

    // Moving to a different column
    if (sourceColumn.id !== targetColumn.id) {
      onMove(activeId, sourceColumn.id, targetColumn.id)
      return
    }

    // Reordering within the same column
    if (onReorder && sourceColumn.id === targetColumn.id) {
      const oldIndex = sourceColumn.items.findIndex(item => item.id === activeId)
      const newIndex = sourceColumn.items.findIndex(item => item.id === overId)

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const newItems = [...sourceColumn.items]
        const [removed] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, removed)
        onReorder(sourceColumn.id, newItems)
      }
    }
  }

  const activeItem = activeId && activeColumnId
    ? columns
        .find(col => col.id === activeColumnId)
        ?.items.find(item => item.id === activeId)
    : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn("flex gap-4 overflow-x-auto pb-4", className)}
        {...props}
      >
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            items={column.items}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <KanbanCard item={activeItem} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface KanbanColumnProps {
  id: string
  title: string
  items: KanbanItem[]
}

function KanbanColumn({ id, title, items }: KanbanColumnProps) {
  return (
    <div className="flex min-w-[300px] flex-col rounded-lg border bg-muted/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {items.length}
        </span>
      </div>
      <SortableContext
        id={id}
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {items.map(item => (
            <KanbanCard key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

interface KanbanCardProps {
  item: KanbanItem
  isDragging?: boolean
}

function KanbanCard({ item, isDragging }: KanbanCardProps) {
  return (
    <Card
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <GripVertical className="h-4 w-4 text-muted-foreground mt-1" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{item.title}</h4>
          {item.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          {item.content}
        </div>
      </div>
    </Card>
  )
}

export { KanbanBoard }
