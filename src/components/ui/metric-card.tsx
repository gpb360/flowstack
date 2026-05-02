import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  sparklineData?: number[];
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  sparklineData,
  className,
}) => {
  const sparklineChartData = sparklineData?.map((val, idx) => ({
    idx,
    value: val,
  }));

  return (
    <div className={cn(
      'bg-surface border border-border rounded-lg p-4 hover:border-border-hover transition-colors',
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm text-text-secondary">{title}</p>
          <p className="text-2xl font-semibold text-text-primary mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="p-2 bg-surface-hover rounded-lg">
            <Icon className="w-4 h-4 text-text-muted" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4">
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            change >= 0 ? 'text-success' : 'text-error'
          )}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
            <span className="text-text-muted text-xs font-normal ml-1">vs last month</span>
          </div>
        )}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineChartData}>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#fafafa',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
