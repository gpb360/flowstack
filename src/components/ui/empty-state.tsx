import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "@/types/icons"

import { cn } from "@/lib/utils"
import { Button } from "./button"

const emptyStateVariants = cva("", {
  variants: {
    size: {
      default: "py-12",
      sm: "py-8",
      lg: "py-16",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: "default" | "outline" | "ghost" | "destructive"
  }
  size?: "default" | "sm" | "lg"
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        emptyStateVariants({ size }),
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button
          variant={action.variant || "default"}
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export { EmptyState, emptyStateVariants }
