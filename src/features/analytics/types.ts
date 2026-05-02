import type { LucideIcon } from '@/types/icons';

// =====================================================
// Widget Types
// =====================================================

export type WidgetType =
  | 'number'
  | 'stat_card'
  | 'progress'
  | 'gauge'
  | 'line_chart'
  | 'bar_chart'
  | 'pie_chart'
  | 'area_chart'
  | 'scatter'
  | 'funnel'
  | 'table'
  | 'leaderboard'
  | 'heatmap'
  | 'cohort'
  | 'geo_map'
  | 'realtime';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  dataSource: DataSource;
  config: WidgetConfig;
  refreshInterval?: number; // in seconds
  style?: WidgetStyle;
}

export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

export interface WidgetStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  height?: string | number;
}

// =====================================================
// Data Source
// =====================================================

export interface DataSource {
  type: 'query' | 'metric' | 'custom';
  table?: string;
  metric?: string | string[]; // Single metric or array for multi-metric widgets
  dimensions?: string[];
  filters?: Filter[];
  groupBy?: string[];
  timeRange?: TimeRange;
  limit?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
}

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
  label?: string;
}

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in'
  | 'not_in'
  | 'is_null'
  | 'is_not_null'
  | 'between'
  | 'date_between';

// =====================================================
// Time Range
// =====================================================

export interface TimeRange {
  preset?: TimePreset;
  start?: Date;
  end?: Date;
  timezone?: string;
}

export type TimePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom';

// =====================================================
// Metrics
// =====================================================

export interface Metric {
  field: string;
  aggregation: AggregationType;
  alias?: string;
  format?: MetricFormat;
}

export type AggregationType =
  | 'count'
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'median'
  | 'stddev'
  | 'variance'
  | 'count_distinct';

export interface MetricFormat {
  type: 'number' | 'currency' | 'percentage' | 'duration' | 'bytes';
  currency?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

// =====================================================
// Widget Config
// =====================================================

export type WidgetConfig =
  | NumberWidgetConfig
  | StatCardConfig
  | ProgressWidgetConfig
  | GaugeWidgetConfig
  | ChartWidgetConfig
  | TableWidgetConfig
  | LeaderboardWidgetConfig
  | HeatmapWidgetConfig
  | CohortWidgetConfig
  | GeoMapWidgetConfig
  | RealtimeWidgetConfig;

export interface BaseWidgetConfig {
  showTitle?: boolean;
  showBorder?: boolean;
  showLegend?: boolean;
  animation?: boolean;
}

export interface NumberWidgetConfig extends BaseWidgetConfig {
  format?: MetricFormat;
  showTrend?: boolean;
  trendPeriod?: TimePreset;
  comparison?: 'previous' | 'last_year' | 'custom';
}

export interface StatCardConfig extends NumberWidgetConfig {
  showSparkline?: boolean;
  sparklineColor?: string;
  icon?: LucideIcon;
  description?: string;
}

export interface ProgressWidgetConfig extends BaseWidgetConfig {
  goal: number;
  current: number;
  showPercentage?: boolean;
  showLabel?: boolean;
  color?: string;
}

export interface GaugeWidgetConfig extends BaseWidgetConfig {
  min: number;
  max: number;
  thresholds?: GaugeThreshold[];
  showValue?: boolean;
  colorScheme?: 'green' | 'blue' | 'red' | 'orange';
}

export interface GaugeThreshold {
  value: number;
  label: string;
  color: string;
}

export interface ChartWidgetConfig extends BaseWidgetConfig {
  xAxis?: string;
  yAxis?: string | string[];
  colors?: string[];
  stacked?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showDataLabels?: boolean;
  smoothLine?: boolean;
  fillArea?: boolean;
  donut?: boolean; // for pie charts
  innerRadius?: number; // for donut charts
}

export interface TableWidgetConfig extends BaseWidgetConfig {
  columns: TableColumn[];
  sortable?: boolean;
  filterable?: boolean;
  pageSize?: number;
  showIndex?: boolean;
}

export interface TableColumn {
  id: string;
  header: string;
  accessorKey: string;
  cell?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export interface LeaderboardWidgetConfig extends BaseWidgetConfig {
  items: LeaderboardItem[];
  showRank?: boolean;
  showValue?: boolean;
  showChange?: boolean;
  maxItems?: number;
  orientation?: 'horizontal' | 'vertical';
}

export interface LeaderboardItem {
  id: string;
  label: string;
  value: number;
  change?: number;
  icon?: LucideIcon;
  color?: string;
}

export interface HeatmapWidgetConfig extends BaseWidgetConfig {
  xAxis: string;
  yAxis: string;
  valueAxis: string;
  colorScale?: 'sequential' | 'diverging' | 'categorical';
  colorScheme?: string[];
  showLabels?: boolean;
}

export interface CohortWidgetConfig extends BaseWidgetConfig {
  cohortType: 'acquisition' | 'behavior' | 'custom';
  metric: string;
  timeUnit: 'day' | 'week' | 'month';
  colorScale?: string[];
  showPercentage?: boolean;
}

export interface GeoMapWidgetConfig extends BaseWidgetConfig {
  mapType: 'world' | 'country' | 'region';
  countryCode?: string; // for country/region maps
  colorScale?: string[];
  showLabels?: boolean;
  interactive?: boolean;
}

export interface RealtimeWidgetConfig extends BaseWidgetConfig {
  updateInterval?: number; // milliseconds
  showHistory?: boolean;
  historyLength?: number;
  alertThresholds?: AlertThreshold[];
}

export interface AlertThreshold {
  value: number;
  condition: 'gt' | 'lt' | 'eq';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

// =====================================================
// Dashboard
// =====================================================

export interface Dashboard {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  layout: DashboardLayout;
  createdBy: string;
  isDefault?: boolean;
  isPublic?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  type: 'grid' | 'free';
  columns: number;
  rowHeight: number;
  margin: [number, number];
  padding?: number;
  breakpoints?: {
    lg?: number;
    md?: number;
    sm?: number;
    xs?: number;
    xxs?: number;
  };
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: LucideIcon;
  widgets: Partial<DashboardWidget>[];
  layout: DashboardLayout;
  screenshot?: string;
  tags?: string[];
}

// =====================================================
// Query & Result
// =====================================================

export interface AnalyticsQuery {
  dataSource: string;
  metrics: Metric[];
  dimensions?: string[];
  filters?: Filter[];
  groupBy?: string[];
  timeRange?: TimeRange;
  limit?: number;
  orderBy?: { field: string; direction: 'asc' | 'desc' };
}

export interface AnalyticsResult {
  data: Record<string, unknown>[];
  metadata: ResultMetadata;
}

export interface ResultMetadata {
  rowCount: number;
  executionTime: number;
  cached: boolean;
  timestamp: Date;
}

// =====================================================
// Time Series
// =====================================================

export interface TimeSeriesData {
  date: Date;
  value: number;
  dimensions?: Record<string, string>;
}

export type TimeGranularity = 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

// =====================================================
// Reports
// =====================================================

export interface Report {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  dataSource: DataSource;
  schedule?: ReportSchedule;
  format: 'csv' | 'pdf' | 'excel' | 'json';
  recipients?: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time?: string; // HH:mm format
  timezone?: string;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  fileUrl?: string;
  error?: string;
  executedAt: Date;
  completedAt?: Date;
}

// =====================================================
// Export
// =====================================================

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf' | 'png';

export interface ExportOptions {
  format: ExportFormat;
  includeTitle?: boolean;
  includeTimestamp?: boolean;
  includeMetadata?: boolean;
  filename?: string;
}
