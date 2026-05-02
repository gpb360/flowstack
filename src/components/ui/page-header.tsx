import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pageHeaderVariants = cva("space-y-4", {
  variants: {
    size: {
      default: "py-6",
      sm: "py-4",
      lg: "py-8",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface PageHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageHeaderVariants> {
  title: string
  description?: string
  subtitle?: string
  actions?: React.ReactNode
  breadcrumbs?: React.ReactNode
  size?: "default" | "sm" | "lg"
}

function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  size = "default",
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ size }), className)} {...props}>
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-lg text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export { PageHeader, pageHeaderVariants }
