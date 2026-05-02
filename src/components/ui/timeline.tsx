import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "@/types/icons"

import { cn } from "@/lib/utils"

const timelineVariants = cva("space-y-8", {
  variants: {
    variant: {
      default: "",
      alternate: "",
      compact: "space-y-4",
    },
    align: {
      left: "",
      right: "",
      center: "",
    },
  },
  defaultVariants: {
    variant: "default",
    align: "left",
  },
})

export interface TimelineItem {
  id: string
  title: string
  description?: string | null
  date?: string
  timestamp?: Date
  icon?: React.ReactNode | React.ComponentType<{ className?: string }> | string
  type?: string
  status?: "default" | "success" | "warning" | "error"
  content?: React.ReactNode
}

export interface TimelineProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof timelineVariants> {
  items: TimelineItem[]
  variant?: "default" | "alternate" | "compact"
  align?: "left" | "right" | "center"
}

function Timeline({
  items,
  variant = "default",
  align = "left",
  className,
  ...props
}: TimelineProps) {
  const statusColors = {
    default: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-destructive",
  }

  if (variant === "compact") {
    return (
      <div className={cn(timelineVariants({ variant, align }), className)} {...props}>
        {items.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 border-background",
                    statusColors[item.status || "default"]
                  )}
                >
                  {Icon ? (React.isValidElement(Icon) ? Icon : typeof Icon === 'function' ? <Icon className="h-4 h-4 text-white" /> : null) : null}
                </div>
                {index < items.length - 1 && (
                  <div className="h-full w-0.5 bg-border" />
                )}
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{item.title}</h4>
                  {item.date && (
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.content}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn(timelineVariants({ variant, align }), className)} {...props}>
      {items.map((item, index) => {
        const Icon = item.icon
        const isEven = index % 2 === 0

        return (
          <div
            key={item.id}
            className={cn(
              "relative flex items-start gap-6",
              variant === "alternate" &&
                (isEven ? "md:flex-row-reverse" : "md:flex-row")
            )}
          >
            {/* Timeline line */}
            {index < items.length - 1 && (
              <div
                className={cn(
                  "absolute top-8 h-full w-0.5 bg-border",
                  variant === "alternate" && "left-1/2 -translate-x-1/2 md:left-auto md:-translate-x-0",
                  align === "center" && "left-1/2 -translate-x-1/2",
                  align === "right" && "right-8"
                )}
              />
            )}

            {/* Timeline dot */}
            <div
              className={cn(
                "relative z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-4 border-background",
                statusColors[item.status || "default"],
                variant === "alternate" && "mx-auto",
                align === "center" && "mx-auto"
              )}
            >
              {Icon ? (React.isValidElement(Icon) ? Icon : typeof Icon === 'function' ? <Icon className="h-6 w-6 text-white" /> : null) : null}
            </div>

            {/* Timeline content */}
            <div
              className={cn(
                "flex-1 pb-8",
                variant === "alternate" && "md:text-left",
                align === "right" && "text-right"
              )}
            >
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{item.title}</h3>
              </div>
              {item.date && (
                <p className="mt-1 text-sm text-muted-foreground">{item.date}</p>
              )}
              {item.description && (
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              )}
              {item.content}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Timeline }
