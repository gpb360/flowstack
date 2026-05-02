import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tabBarVariants = cva(
  "inline-flex items-center justify-start border-b",
  {
    variants: {
      variant: {
        default: "border-border",
        underline: "border-transparent",
        pills: "border-none bg-muted p-1 rounded-lg",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface Tab {
  id: string
  label: string
  content?: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabBarVariants> {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: "default" | "underline" | "pills"
  size?: "default" | "sm" | "lg"
}

function TabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  size = "default",
  className,
  ...props
}: TabBarProps) {
  return (
    <div className={cn(tabBarVariants({ variant, size }), className)} {...props}>
      <div className="flex" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              className={cn(
                "relative inline-flex items-center gap-2 px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variant === "default" && [
                  isActive
                    ? "text-foreground border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted",
                ],
                variant === "underline" && [
                  isActive
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground",
                ],
                variant === "pills" && [
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                ]
              )}
            >
              {tab.icon && (
                <span className="flex-shrink-0">{tab.icon}</span>
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { TabBar, tabBarVariants }
