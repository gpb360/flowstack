import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const stepperVariants = cva("", {
  variants: {
    variant: {
      default: "",
      alternative: "flex-row items-center justify-between",
    },
    size: {
      default: "",
      sm: "text-sm",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface Step {
  id: string
  title: string
  description?: string
  status?: "complete" | "current" | "pending"
}

export interface ProgressStepperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stepperVariants> {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  variant?: "default" | "alternative"
  size?: "default" | "sm" | "lg"
}

function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  variant = "default",
  size = "default",
  className,
  ...props
}: ProgressStepperProps) {
  const isClickable = !!onStepClick

  const getStepStatus = (index: number): Step["status"] => {
    if (index < currentStep) return "complete"
    if (index === currentStep) return "current"
    return "pending"
  }

  return (
    <div
      className={cn("w-full", stepperVariants({ variant, size }), className)}
      {...props}
    >
      {variant === "alternative" ? (
        <div className="flex w-full items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const isComplete = status === "complete"
            const isCurrent = status === "current"

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => isClickable && onStepClick?.(index)}
                    disabled={!isClickable || index > currentStep}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors",
                      isComplete && "border-primary bg-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary",
                      status === "pending" && "border-muted-foreground/30 text-muted-foreground",
                      isClickable && index <= currentStep && "cursor-pointer hover:border-primary/80",
                      !isClickable && "cursor-default"
                    )}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                  <div className={cn("text-center", size === "sm" && "text-xs")}>
                    <div
                      className={cn(
                        "font-medium",
                        (isCurrent || isComplete) && "text-foreground",
                        status === "pending" && "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div
                        className={cn(
                          "mt-1 text-xs",
                          status === "pending" && "text-muted-foreground"
                        )}
                      >
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-full max-w-[100px]",
                      isComplete ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index)
            const isComplete = status === "complete"
            const isCurrent = status === "current"

            return (
              <div key={step.id} className="flex items-start gap-4">
                <button
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable || index > currentStep}
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    status === "pending" && "border-muted-foreground/30 text-muted-foreground",
                    isClickable && index <= currentStep && "cursor-pointer hover:border-primary/80",
                    !isClickable && "cursor-default"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : index + 1}
                </button>
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium",
                      (isCurrent || isComplete) && "text-foreground",
                      status === "pending" && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        "mt-1 text-sm",
                        status === "pending" && "text-muted-foreground"
                      )}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { ProgressStepper, stepperVariants }
