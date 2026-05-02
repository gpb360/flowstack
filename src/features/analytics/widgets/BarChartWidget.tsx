import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CardUntitled } from '@/components/ui';
import type { ChartWidgetConfig } from '../types';

interface BarChartWidgetProps {
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string | string[];
  config?: ChartWidgetConfig;
  className?: string;
}

export function BarChartWidget({
  title,
  data,
  xAxis,
  yAxis,
  config,
  className,
}: BarChartWidgetProps) {
  const {
    showLegend = true,
    showGrid = true,
    showTooltip = true,
    stacked = false,
    colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'],
  } = config || {};

  const yAxes = Array.isArray(yAxis) ? yAxis : [yAxis];

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />}
            <XAxis dataKey={xAxis} className="text-xs" />
            <YAxis className="text-xs" />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            )}
            {showLegend && <Legend />}
            {yAxes.map((axis, index) => (
              <Bar
                key={axis}
                dataKey={axis}
                fill={colors[index % colors.length]}
                stackId={stacked ? 'stack' : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </CardUntitled>
  );
}
