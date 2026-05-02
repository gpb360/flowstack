// @ts-nocheck
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CardUntitled } from '@/components/ui';
import type { ChartWidgetConfig } from '../types';

interface LineChartWidgetProps {
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string | string[];
  config?: ChartWidgetConfig;
  className?: string;
}

export function LineChartWidget({
  title,
  data,
  xAxis,
  yAxis,
  config,
  className,
}: LineChartWidgetProps) {
  const {
    showLegend = true,
    showGrid = true,
    showTooltip = true,
    smoothLine = false,
    fillArea = false,
    colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'],
  } = config || {};

  const yAxes = Array.isArray(yAxis) ? yAxis : [yAxis];

  // Format date for display
  const formatXAxisLabel = (label: string) => {
    const date = new Date(label);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return label;
  };

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis
              dataKey={xAxis}
              tickFormatter={formatXAxisLabel}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelFormatter={formatXAxisLabel}
              />
            )}
            {showLegend && <Legend />}
            {yAxes.map((axis, index) => (
              <Line
                key={axis}
                type={smoothLine ? 'monotone' : 'linear'}
                dataKey={axis}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                fill={fillArea ? colors[index % colors.length] : undefined}
                fillOpacity={fillArea ? 0.1 : undefined}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </CardUntitled>
  );
}
