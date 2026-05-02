import { CardUntitled } from '@/components/ui';
import type { ProgressWidgetConfig } from '../types';

interface ProgressWidgetProps {
  title: string;
  value: number;
  goal: number;
  config?: ProgressWidgetConfig;
  className?: string;
}

export function ProgressWidget({
  title,
  value,
  goal,
  config,
  className,
}: ProgressWidgetProps) {
  const {
    showPercentage = true,
    showLabel = true,
    color = '#3b82f6',
  } = config || {};

  const percentage = Math.min(100, Math.max(0, (value / goal) * 100));
  const displayPercentage = percentage.toFixed(1);

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <div className="space-y-2">
          {/* Progress bar */}
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full transition-all duration-500 ease-in-out"
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
              }}
            />
          </div>

          {/* Label and percentage */}
          <div className="flex items-center justify-between text-sm">
            {showLabel && (
              <span className="text-muted-foreground">
                {value.toLocaleString()} / {goal.toLocaleString()}
              </span>
            )}
            {showPercentage && (
              <span className="font-semibold">{displayPercentage}%</span>
            )}
          </div>
        </div>
      </div>
    </CardUntitled>
  );
}
