import React from 'react';
import { MetricCardUntitled } from '@/components/ui';
import type { NumberWidgetConfig } from '../types';

interface NumberWidgetProps {
  title: string;
  value: number;
  previousValue?: number;
  config?: NumberWidgetConfig;
  className?: string;
}

export function NumberWidget({
  title,
  value,
  previousValue,
  config,
  className,
}: NumberWidgetProps) {
  const {
    format = { type: 'number' },
    showTrend = true,
  } = config || {};

  // Calculate trend
  const trend = React.useMemo(() => {
    if (!showTrend || previousValue === undefined) return null;

    if (previousValue === 0) {
      return value > 0 ? { value: 100, direction: 'up' as const } : null;
    }

    const change = ((value - previousValue) / previousValue) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

    return { value: Math.abs(change), direction };
  }, [value, previousValue, showTrend]);

  // Format value
  const formattedValue = React.useMemo(() => {
    return formatValue(value, format);
  }, [value, format]);

  return (
    <MetricCardUntitled
      title={title}
      value={formattedValue}
      trend={trend ? `${trend.value.toFixed(1)}%` : undefined}
      trendUp={trend?.direction === 'up'}
      trendNeutral={trend?.direction === 'neutral'}
      className={className}
    />
  );
}

function formatValue(value: number, format: any): string {
  switch (format.type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: format.currency || 'USD',
        minimumFractionDigits: format.decimals || 0,
        maximumFractionDigits: format.decimals || 0,
      }).format(value);

    case 'percentage':
      return `${value.toFixed(format.decimals || 1)}%`;

    case 'number':
    default:
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: format.decimals || 0,
        maximumFractionDigits: format.decimals || 0,
      }).format(value);
  }
}
