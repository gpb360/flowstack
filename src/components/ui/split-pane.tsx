import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

const splitPaneVariants = cva("flex overflow-hidden", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: {
    direction: "horizontal",
  },
})

export interface SplitPaneProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof splitPaneVariants> {
  first: React.ReactNode
  second: React.ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  direction?: "horizontal" | "vertical"
  onSizeChange?: (size: number) => void
}

function SplitPane({
  first,
  second,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  direction = "horizontal",
  onSizeChange,
  className,
  ...props
}: SplitPaneProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = React.useState(false)
  const [size, setSize] = React.useState(defaultSize)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()

      let newSize: number

      if (direction === "horizontal") {
        const containerWidth = containerRect.width
        const offset = e.clientX - containerRect.left
        newSize = (offset / containerWidth) * 100
      } else {
        const containerHeight = containerRect.height
        const offset = e.clientY - containerRect.top
        newSize = (offset / containerHeight) * 100
      }

      // Clamp size between min and max
      newSize = Math.max(minSize, Math.min(maxSize, newSize))
      setSize(newSize)
      onSizeChange?.(newSize)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, direction, minSize, maxSize, onSizeChange])

  return (
    <div
      ref={containerRef}
      className={cn(splitPaneVariants({ direction }), className)}
      {...props}
    >
      <div
        style={{
          [direction === "horizontal" ? "width" : "height"]: `${size}%`,
          flexShrink: 0,
        }}
      >
        {first}
      </div>

      <div
        className={cn(
          "flex items-center justify-center bg-border hover:bg-primary/50 transition-colors",
          direction === "horizontal" ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize"
        )}
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0 min-h-0">
        {second}
      </div>
    </div>
  )
}

export { SplitPane, splitPaneVariants }
