import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    color: {
      default: "text-primary",
      muted: "text-muted-foreground",
      foreground: "text-foreground",
    },
  },
  defaultVariants: {
    size: "default",
    color: "default",
  },
})

export type LoadingSpinnerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof spinnerVariants> & {
    label?: string
    fullscreen?: boolean
  }

function LoadingSpinner({
  size = "default",
  color = "default",
  label,
  fullscreen = false,
  className,
  ...props
}: LoadingSpinnerProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        fullscreen && "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <Loader2 className={cn(spinnerVariants({ size, color }))} />
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  )

  return content
}

export { LoadingSpinner, spinnerVariants }

// Skeleton loading component
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

function Skeleton({
  variant = "rectangular",
  width,
  height,
  className,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-md",
  }

  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  )
}

Skeleton.displayName = "Skeleton"

// Skeleton card component
export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean
  lines?: number
}

function SkeletonCard({
  showAvatar = false,
  lines = 3,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn("space-y-3 p-4", className)} {...props}>
      <div className="flex items-center gap-4">
        {showAvatar && (
          <Skeleton variant="circular" width={40} height={40} />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            className={i === lines - 1 ? "w-2/3" : "w-full"}
          />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard }
