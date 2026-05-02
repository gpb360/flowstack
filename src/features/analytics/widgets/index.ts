// Metric Widgets
export { NumberWidget } from './NumberWidget';
export { StatCard } from './StatCard';
export { ProgressWidget } from './ProgressWidget';
export { GaugeWidget } from './GaugeWidget';

// Chart Widgets
export { LineChartWidget } from './LineChartWidget';
export { BarChartWidget } from './BarChartWidget';
export { PieChartWidget } from './PieChartWidget';
export { AreaChartWidget } from './AreaChartWidget';
export { FunnelChartWidget } from './FunnelChartWidget';

// Table Widgets
export { TableWidget } from './TableWidget';
export { LeaderboardWidget } from './LeaderboardWidget';
export { HeatmapWidget } from './HeatmapWidget';

// Special Widgets
export { CohortWidget } from './CohortWidget';
export { GeoMapWidget } from './GeoMapWidget';
export { RealtimeWidget } from './RealtimeWidget';

// Widget registry for rendering
import { NumberWidget } from './NumberWidget';
import { StatCard } from './StatCard';
import { ProgressWidget } from './ProgressWidget';
import { GaugeWidget } from './GaugeWidget';
import { LineChartWidget } from './LineChartWidget';
import { BarChartWidget } from './BarChartWidget';
import { PieChartWidget } from './PieChartWidget';
import { AreaChartWidget } from './AreaChartWidget';
import { FunnelChartWidget } from './FunnelChartWidget';
import { TableWidget } from './TableWidget';
import { LeaderboardWidget } from './LeaderboardWidget';
import { HeatmapWidget } from './HeatmapWidget';
import { CohortWidget } from './CohortWidget';
import { GeoMapWidget } from './GeoMapWidget';
import { RealtimeWidget } from './RealtimeWidget';

import type { WidgetType } from '../types';

export const widgetComponents: Record<WidgetType, React.ComponentType<any>> = {
  // Metric Widgets
  number: NumberWidget,
  stat_card: StatCard,
  progress: ProgressWidget,
  gauge: GaugeWidget,

  // Chart Widgets
  line_chart: LineChartWidget,
  bar_chart: BarChartWidget,
  pie_chart: PieChartWidget,
  area_chart: AreaChartWidget,
  scatter: BarChartWidget, // Reuse bar chart for scatter
  funnel: FunnelChartWidget,

  // Table Widgets
  table: TableWidget,
  leaderboard: LeaderboardWidget,
  heatmap: HeatmapWidget,

  // Special Widgets
  cohort: CohortWidget,
  geo_map: GeoMapWidget,
  realtime: RealtimeWidget,
};
