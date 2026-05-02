import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "@/types/icons"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

const dataCardVariants = cva("", {
  variants: {
    size: {
      default: "",
      compact: "p-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface DataCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>,
    VariantProps<typeof dataCardVariants> {
  title: string
  value?: string | number | React.ReactNode
  content?: React.ReactNode
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    label?: string
  }
  description?: string
  size?: "default" | "compact"
}

function DataCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  content,
  size,
  className,
  ...props
}: DataCardProps) {
  const trendValue = trend?.value ?? 0;
  const TrendIcon = trendValue > 0 ? TrendingUp : trendValue < 0 ? TrendingDown : Minus
  const trendColor = trendValue > 0 ? "text-green-600" : trendValue < 0 ? "text-red-600" : "text-muted-foreground"

  return (
    <Card className={cn(dataCardVariants({ size }), className)} {...props}>
      <CardHeader className={size === "compact" ? "pb-2" : "flex flex-row items-center justify-between space-y-0 pb-2"}>
        <div className="flex items-center gap-2">
          {Icon && (React.isValidElement(Icon) ? Icon : typeof Icon === 'function' ? <Icon className="h-4 w-4" /> : null)}
          <CardTitle className={size === "compact" ? "text-sm font-medium" : "text-sm font-medium"}>
            {title}
          </CardTitle>
        </div>
        {trend && (
          <div className={cn("flex items-center text-xs font-medium", trendColor)}>
            <TrendIcon className="mr-1 h-3 w-3" />
            {Math.abs(trend.value)}%
            {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={size === "compact" ? "text-xl font-bold" : "text-2xl font-bold"}>
          {value}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { DataCard, dataCardVariants }
