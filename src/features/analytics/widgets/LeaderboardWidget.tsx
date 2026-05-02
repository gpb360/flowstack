import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { CardUntitled } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { LeaderboardWidgetConfig } from '../types';
import type { LucideIcon } from '@/types/icons';

interface LeaderboardWidgetProps {
  title: string;
  items: Array<{
    id: string;
    label: string;
    value: number;
    change?: number;
    icon?: LucideIcon;
    color?: string;
  }>;
  config?: LeaderboardWidgetConfig;
  className?: string;
}

export function LeaderboardWidget({
  title,
  items,
  config,
  className,
}: LeaderboardWidgetProps) {
  const {
    showRank = true,
    showValue = true,
    showChange = true,
    maxItems = 10,
    orientation = 'vertical',
  } = config || {};

  const displayItems = items.slice(0, maxItems);

  const getChangeIcon = (change?: number) => {
    if (change === undefined) return null;
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getChangeColor = (change?: number) => {
    if (change === undefined) return 'text-muted-foreground';
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (orientation === 'horizontal') {
    return (
      <CardUntitled title={title} className={className}>
        <div>
          <div className="flex items-end gap-2">
            {displayItems.map((item, index) => {
              const Icon = item.icon;
              const maxValue = Math.max(...displayItems.map((i) => i.value));
              const heightPercent = (item.value / maxValue) * 100;

              return (
                <div key={item.id} className="flex-1 flex flex-col items-center gap-2">
                  {showValue && (
                    <span className="text-xs font-medium">{item.value.toLocaleString()}</span>
                  )}
                  <div
                    className="w-full rounded-t-md transition-all hover:opacity-80"
                    style={{
                      height: `${Math.max(heightPercent, 5)}%`,
                      backgroundColor: item.color || '#3b82f6',
                      minHeight: '40px',
                    }}
                  />
                  <div className="flex items-center gap-1 text-xs">
                    {showRank && <span className="text-muted-foreground">#{index + 1}</span>}
                    {Icon && <Icon className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardUntitled>
    );
  }

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <div className="space-y-3">
          {displayItems.map((item, index) => {
            const Icon = item.icon;
            const ChangeIcon = getChangeIcon(item.change);
            const maxValue = Math.max(...displayItems.map((i) => i.value));

            return (
              <div key={item.id} className="flex items-center gap-3">
                {showRank && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </div>
                )}
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {showValue && (
                      <span className="text-sm font-semibold">{item.value.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || '#3b82f6',
                      }}
                    />
                  </div>
                </div>
                {showChange && ChangeIcon && (
                  <div className={cn('flex items-center text-xs', getChangeColor(item.change))}>
                    <ChangeIcon className="h-3 w-3" />
                    {Math.abs(item.change || 0).toFixed(1)}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CardUntitled>
  );
}
