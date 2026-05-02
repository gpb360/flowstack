// @ts-nocheck
import {
  FunnelChart as RechartsFunnelChart,
  Funnel,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { CardUntitled } from '@/components/ui';
import type { ChartWidgetConfig } from '../types';

interface FunnelChartWidgetProps {
  title: string;
  data: Array<{ name: string; value: number; [key: string]: any }>;
  config?: ChartWidgetConfig;
  className?: string;
}

export function FunnelChartWidget({
  title,
  data,
  config,
  className,
}: FunnelChartWidgetProps) {
  const {
    showLegend = true,
    showTooltip: _showTooltip = true,
    colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#22c55e'],
  } = config || {};

  // Calculate conversion rates for each step
  const dataWithRates = data.map((item, index) => {
    if (index === 0) return { ...item, rate: 100 };
    const previousValue = data[index - 1].value;
    const rate = previousValue > 0 ? (item.value / previousValue) * 100 : 0;
    return { ...item, rate: rate.toFixed(1) };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">Value: {data.value.toLocaleString()}</p>
        {data.rate !== undefined && (
          <p className="text-sm text-muted-foreground">
            Conversion Rate: {data.rate}%
          </p>
        )}
      </div>
    );
  };

  return (
    <CardUntitled title={title} className={className}>
      <div>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsFunnelChart data={dataWithRates}>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Funnel
              dataKey="value"
              isAnimationActive
              lastShapeType="rectangle"
            >
              <LabelList
                dataKey="name"
                position="center"
                fill="#fff"
                fontSize={14}
                fontWeight={600}
              />
              {dataWithRates.map((entry, index) => (
                <div key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Funnel>
          </RechartsFunnelChart>
        </ResponsiveContainer>
      </div>
    </CardUntitled>
  );
}
