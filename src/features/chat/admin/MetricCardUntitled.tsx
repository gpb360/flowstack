/**
 * Metric Card Untitled Component
 * Display a single metric with optional change indicator
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { CardUntitled } from '@/components/ui/card-untitled';
import { cn } from '@/lib/utils';

interface MetricCardUntitledProps {
  title: string;
  value: number;
  change?: number;
  format?: 'number' | 'duration' | 'percentage';
}

export function MetricCardUntitled({ title, value, change, format = 'number' }: MetricCardUntitledProps) {
  const formatValue = () => {
    switch (format) {
      case 'duration':
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}m ${seconds}s`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <CardUntitled>
      <CardUntitled.Content className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatValue()}</p>
            {change !== undefined && (
              <div className={cn(
                'mt-2 flex items-center text-sm',
                isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
              )}>
                {isPositive ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : isNegative ? (
                  <TrendingDown className="mr-1 h-4 w-4" />
                ) : null}
                <span>{Math.abs(change)}% from previous period</span>
              </div>
            )}
          </div>
        </div>
      </CardUntitled.Content>
    </CardUntitled>
  );
}
