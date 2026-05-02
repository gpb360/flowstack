import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sectionVariants = cva("space-y-4", {
  variants: {
    variant: {
      default: "",
      card: "rounded-lg border bg-card p-6",
      muted: "rounded-lg bg-muted/50 p-6",
    },
    size: {
      default: "py-6",
      sm: "py-4",
      lg: "py-8",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {
  title?: string
  description?: string
  as?: "section" | "div" | "article" | "aside"
  variant?: "default" | "card" | "muted"
  size?: "default" | "sm" | "lg"
}

function Section({
  title,
  description,
  as: Component = "section",
  variant = "default",
  size = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Component
      className={cn(sectionVariants({ variant, size }), className)}
      {...props}
    >
      {title && (
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </Component>
  )
}

export { Section, sectionVariants }
