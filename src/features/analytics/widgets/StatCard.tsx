import React from 'react';
import { MetricCardUntitled } from '@/components/ui';
import type { StatCardConfig } from '../types';
import type { LucideIcon } from '@/types/icons';

interface StatCardProps {
  title: string;
  value: number;
  previousValue?: number;
  description?: string;
  icon?: LucideIcon;
  config?: StatCardConfig;
  className?: string;
}

export function StatCard({
  title,
  value,
  previousValue,
  description,
  icon: Icon,
  config,
  className,
}: StatCardProps) {
  const {
    format = { type: 'number' },
    showTrend = true,
    showSparkline = false,
    sparklineColor: _sparklineColor = '#3b82f6',
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

  // Generate sparkline data (placeholder - in production, this would be real data)
  const sparklineData = React.useMemo(() => {
    if (!showSparkline) return undefined;
    // Generate placeholder sparkline data based on value and previous value
    const points = 20;
    return Array.from({ length: points }, () => {
      const variance = value * 0.1;
      return Math.max(0, value + (Math.random() - 0.5) * variance * 2);
    });
  }, [showSparkline, value]);

  return (
    <MetricCardUntitled
      title={title}
      value={formattedValue}
      subtitle={description}
      icon={Icon}
      trend={trend ? `${trend.value.toFixed(1)}%` : undefined}
      trendUp={trend?.direction === 'up'}
      trendNeutral={trend?.direction === 'neutral'}
      sparkline={sparklineData}
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
