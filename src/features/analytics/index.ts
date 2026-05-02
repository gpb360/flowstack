// Export layout
export { AnalyticsLayout } from './AnalyticsLayout';

// Export types
export type {
  WidgetType,
  DashboardWidget,
  DataSource,
  Filter,
  FilterOperator,
  TimeRange,
  TimePreset,
  Metric,
  MetricFormat,
  AggregationType,
  WidgetConfig,
  Dashboard,
  DashboardLayout,
  DashboardTemplate,
  AnalyticsQuery,
  AnalyticsResult,
  TimeSeriesData,
  TimeGranularity,
  Report,
  ReportSchedule,
  ReportExecution,
  ExportFormat,
  ExportOptions,
} from './types';

// Export widgets
export {
  NumberWidget,
  StatCard,
  ProgressWidget,
  GaugeWidget,
  LineChartWidget,
  BarChartWidget,
  PieChartWidget,
  AreaChartWidget,
  FunnelChartWidget,
  TableWidget,
  LeaderboardWidget,
  HeatmapWidget,
  CohortWidget,
  GeoMapWidget,
  RealtimeWidget,
  widgetComponents,
} from './widgets';

// Export templates
export {
  dashboardTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByTag,
} from './dashboards/templates';

// Export hooks
export {
  useAnalytics,
  useTotalContacts,
  useNewContactsTrend,
  useDealsByStage,
  usePipelineValue,
  useCampaignsSent,
  useEmailPerformance,
  useTopTemplates,
  useFormSubmissions,
  useFormConversionRate,
  useWorkflowExecutions,
  useWorkflowSuccessRate,
  useMonthlyRevenue,
  useCustomQuery,
  useRealtimeMetric,
} from './hooks/useAnalytics';

// Export library functions
export {
  executeQuery,
  preBuiltQueries,
} from './lib/queries';

export {
  calculateMetric,
  calculateMedian,
  calculateStdDev,
  calculateVariance,
  calculatePercentage,
  calculateTrend,
  calculateGrowthRate,
  calculateMovingAverage,
  calculateConversionRate,
  calculateRevenue,
  calculatePipelineValue,
  calculateDealVelocity,
  calculateChurnRate,
  calculateRetentionRate,
  calculateCustomerLifetimeValue,
  calculateCohortRetention,
  calculateFunnel,
  formatMetric,
  formatDuration,
  formatBytes,
  formatNumberCompact,
  calculatePercentile,
  calculateQuartiles,
  getDateRange,
} from './lib/calculations';

export {
  getTimeSeriesData,
  calculateMovingAverageForTimeSeries,
  calculatePeriodOverPeriod,
  smoothTimeSeries,
  detectTrend,
  forecastTimeSeries,
  aggregateTimeSeries,
  compareTimeSeries,
  detectAnomalies,
} from './lib/timeSeries';

export {
  exportDashboardAsPDF,
  exportWidgetData,
  exportReportData,
  downloadBlob,
  printDashboard,
  generateShareableLink,
  copyToClipboard,
} from './lib/exports';
