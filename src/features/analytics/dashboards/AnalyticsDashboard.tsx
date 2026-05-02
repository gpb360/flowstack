import { useOutletContext } from 'react-router-dom';
import {
  NumberWidget,
  StatCard,
  LineChartWidget,
  BarChartWidget,
} from '../widgets';
import { useTotalContacts, usePipelineValue, useNewContactsTrend, useDealsByStage } from '../hooks/useAnalytics';
import type { TimePreset } from '../types';

export function AnalyticsDashboard() {
  const { timeRange } = useOutletContext<{ timeRange: TimePreset }>();

  // Fetch data
  const { data: totalContacts } = useTotalContacts({ preset: timeRange as TimePreset });
  const { data: pipelineValue } = usePipelineValue();
  const { data: contactsTrend } = useNewContactsTrend({ preset: timeRange as TimePreset });
  const { data: dealsByStage } = useDealsByStage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <p className="text-muted-foreground">
          Track your key metrics and performance across all modules
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NumberWidget
          title="Total Contacts"
          value={(totalContacts?.data as any)?.[0]?.total ?? 0}
          config={{ format: { type: 'number' }, showTrend: true }}
        />
        <StatCard
          title="Pipeline Value"
          value={(pipelineValue?.data as any)?.[0]?.pipeline_value ?? 0}
          icon={undefined}
          config={{ format: { type: 'currency', currency: 'USD' }, showTrend: true }}
        />
        <NumberWidget
          title="Active Deals"
          value={(dealsByStage?.data as any[])?.reduce((sum: number, d: any) => sum + (d.count || 0), 0) ?? 0}
          config={{ format: { type: 'number' } }}
        />
        <NumberWidget
          title="Conversion Rate"
          value={24.5}
          config={{ format: { type: 'percentage' }, showTrend: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contactsTrend?.data && (
          <LineChartWidget
            title="New Contacts Trend"
            data={contactsTrend.data}
            xAxis="created_at"
            yAxis="count"
            config={{ smoothLine: true, showGrid: true }}
          />
        )}
        {dealsByStage?.data && (
          <BarChartWidget
            title="Deals by Stage"
            data={dealsByStage.data}
            xAxis="stage_id"
            yAxis="count"
            config={{ showLegend: false }}
          />
        )}
      </div>
    </div>
  );
}
