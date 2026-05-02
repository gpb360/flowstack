import * as React from "react"

import { cn } from "@/lib/utils"
import { Badge } from "./badge"
import type { BadgeProps } from "./badge"

export interface Badge {
  id: string
  label: string
  variant?: BadgeProps["variant"]
  onRemove?: () => void
}

export interface BadgeListProps extends React.HTMLAttributes<HTMLDivElement> {
  badges: Badge[]
  maxVisible?: number
  onBadgeClick?: (badge: Badge) => void
}

function BadgeList({
  badges,
  maxVisible,
  onBadgeClick,
  className,
  ...props
}: BadgeListProps) {
  const visibleBadges = maxVisible ? badges.slice(0, maxVisible) : badges
  const hiddenCount = maxVisible ? badges.length - maxVisible : 0

  return (
    <div className={cn("flex flex-wrap gap-2", className)} {...props}>
      {visibleBadges.map((badge) => (
        <Badge
          key={badge.id}
          variant={badge.variant}
          className={cn(
            "cursor-pointer transition-colors",
            onBadgeClick && "hover:opacity-80"
          )}
          onClick={() => onBadgeClick?.(badge)}
        >
          {badge.label}
          {badge.onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                badge.onRemove?.()
              }}
              className="ml-1 hover:bg-accent rounded-sm"
              aria-label={`Remove ${badge.label}`}
            >
              ×
            </button>
          )}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Badge variant="outline" className="cursor-default">
          +{hiddenCount} more
        </Badge>
      )}
    </div>
  )
}

export { BadgeList }
