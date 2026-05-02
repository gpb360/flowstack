# Analytics Module

Comprehensive analytics, reporting, and dashboard system for FlowStack.

## Overview

The Analytics module provides powerful data visualization and reporting capabilities across all FlowStack modules (CRM, Marketing, Forms, Workflows). It features a flexible widget-based dashboard system, pre-built templates, and customizable reports.

## Features

### 1. Widget Library (15+ Widget Types)

#### Metric Widgets
- **NumberWidget** - Single KPI with trend indicator
- **StatCard** - Metric card with icon, sparkline, and description
- **ProgressWidget** - Progress bar toward goal
- **GaugeWidget** - Gauge/meter chart with thresholds

#### Chart Widgets
- **LineChartWidget** - Time series trends
- **BarChartWidget** - Bar/column charts (supports stacking)
- **PieChartWidget** - Pie and donut charts
- **AreaChartWidget** - Filled area charts
- **FunnelChartWidget** - Conversion funnels

#### Table Widgets
- **TableWidget** - Data table with sorting/filtering
- **LeaderboardWidget** - Top/bottom items ranking
- **HeatmapWidget** - 2D data heatmap

#### Special Widgets
- **CohortWidget** - Cohort analysis grid
- **GeoMapWidget** - Geographic data visualization
- **RealtimeWidget** - Live updating metrics

### 2. Dashboard System

#### Pre-built Templates
- **CRM Dashboard** - Contacts, deals, pipeline overview
- **Marketing Dashboard** - Campaigns, templates, performance
- **Forms Dashboard** - Submissions, conversion rates
- **Revenue Dashboard** - MRR, ARR, churn analysis
- **Workflow Dashboard** - Executions, success rates, errors

#### Dashboard Features
- Grid-based layout with drag-drop widgets
- Customizable time range filters
- Widget configuration panel
- Export to PDF
- Fullscreen mode
- Real-time data refresh

### 3. Data Query System

#### Query Types
```typescript
interface AnalyticsQuery {
  dataSource: string;           // Table name
  metrics: Metric[];             // Aggregations (count, sum, avg, etc.)
  dimensions?: string[];         // Grouping fields
  filters?: Filter[];            // Where clauses
  groupBy?: string[];            // SQL GROUP BY
  timeRange?: TimeRange;         // Date filtering
  limit?: number;                // Result limiting
  orderBy?: { field, direction }; // Sorting
}
```

#### Filter Operators
- `equals`, `not_equals`
- `contains`, `not_contains`
- `starts_with`, `ends_with`
- `gt`, `lt`, `gte`, `lte`
- `in`, `not_in`
- `is_null`, `is_not_null`
- `between`, `date_between`

### 4. Pre-built Queries

The module includes pre-built queries for common metrics:

**CRM Metrics:**
- `totalContacts()` - Total contact count
- `newContactsTrend(timeRange)` - New contacts over time
- `dealsByStage()` - Deals grouped by pipeline stage
- `pipelineValue()` - Total open pipeline value

**Marketing Metrics:**
- `campaignsSent(timeRange)` - Campaign statistics
- `emailPerformance(timeRange)` - Email open/click rates
- `topTemplates(limit)` - Best performing templates

**Form Metrics:**
- `formSubmissions(timeRange)` - Form submission count
- `formConversionRate(timeRange)` - Conversion percentage

**Workflow Metrics:**
- `workflowExecutions(timeRange)` - Execution count
- `workflowSuccessRate(timeRange)` - Success/failure rates

### 5. Hooks

```typescript
// General analytics hook
const { data, isLoading, error } = useAnalytics(query, options);

// Pre-built hooks
const { data: contacts } = useTotalContacts(timeRange);
const { data: trend } = useNewContactsTrend(timeRange);
const { data: deals } = useDealsByStage();
const { data: pipeline } = usePipelineValue();

// Custom query hook
const { data } = useCustomQuery(
  'contacts',
  [{ field: 'id', aggregation: 'count' }],
  { filters: [...], timeRange: ... }
);
```

### 6. Export Functions

```typescript
// Export dashboard as PDF
const blob = await exportDashboardAsPDF(dashboard, options);
downloadBlob(blob, 'dashboard.pdf');

// Export widget data
const blob = await exportWidgetData(widget, data, {
  format: 'csv' | 'json' | 'excel'
});

// Print dashboard
printDashboard(dashboard);
```

## Architecture

### Directory Structure
```
src/features/analytics/
├── lib/
│   ├── queries.ts        # Data query execution
│   ├── calculations.ts   # Metric calculations
│   ├── timeSeries.ts     # Time-based data analysis
│   └── exports.ts        # Export functionality
├── hooks/
│   └── useAnalytics.ts   # React Query hooks
├── widgets/              # Widget components
│   ├── NumberWidget.tsx
│   ├── StatCard.tsx
│   ├── ProgressWidget.tsx
│   ├── GaugeWidget.tsx
│   ├── LineChartWidget.tsx
│   ├── BarChartWidget.tsx
│   ├── PieChartWidget.tsx
│   ├── AreaChartWidget.tsx
│   ├── FunnelChartWidget.tsx
│   ├── TableWidget.tsx
│   ├── LeaderboardWidget.tsx
│   ├── HeatmapWidget.tsx
│   ├── CohortWidget.tsx
│   ├── GeoMapWidget.tsx
│   ├── RealtimeWidget.tsx
│   └── index.ts
├── dashboards/
│   ├── templates/        # Pre-built dashboards
│   │   ├── crmDashboard.ts
│   │   ├── marketingDashboard.ts
│   │   ├── formsDashboard.ts
│   │   ├── revenueDashboard.ts
│   │   ├── workflowDashboard.ts
│   │   └── index.ts
│   ├── AnalyticsDashboard.tsx
│   ├── DashboardList.tsx
│   └── DashboardBuilder.tsx (planned)
├── reports/
│   ├── ReportBuilder.tsx (planned)
│   ├── ReportList.tsx
│   └── ReportScheduler.tsx (planned)
├── AnalyticsLayout.tsx
├── types.ts
└── index.ts
```

### Data Flow

1. **Query Building** → User configures data source
2. **Query Execution** → `executeQuery()` runs SQL via Supabase
3. **Data Processing** → Metrics calculated, data grouped
4. **Widget Rendering** → Component displays formatted data
5. **Real-time Updates** → Optional Supabase Realtime subscriptions

## Usage Examples

### Creating a Custom Dashboard

```typescript
import { DashboardWidget } from '@/features/analytics';

const customWidget: DashboardWidget = {
  id: 'my-metric',
  type: 'number',
  title: 'My Custom Metric',
  position: { x: 0, y: 0, w: 3, h: 2 },
  dataSource: {
    type: 'query',
    table: 'contacts',
    metric: 'id',
    aggregation: 'count',
    filters: [
      { id: 'filter1', field: 'status', operator: 'equals', value: 'active' }
    ]
  },
  config: {
    format: { type: 'number' },
    showTrend: true,
    trendPeriod: 'last_30_days'
  }
};
```

### Using Widgets

```typescript
import { NumberWidget, LineChartWidget } from '@/features/analytics';

<NumberWidget
  title="Total Revenue"
  value={125000}
  previousValue={100000}
  config={{
    format: { type: 'currency', currency: 'USD' },
    showTrend: true
  }}
/>

<LineChartWidget
  title="Revenue Trend"
  data={revenueData}
  xAxis="month"
  yAxis="revenue"
  config={{
    smoothLine: true,
    showGrid: true,
    colors: ['#3b82f6', '#8b5cf6']
  }}
/>
```

### Custom Queries

```typescript
const { data } = useCustomQuery(
  'deals',
  [
    { field: 'value', aggregation: 'sum', alias: 'total_value' },
    { field: 'id', aggregation: 'count', alias: 'count' }
  ],
  {
    groupBy: ['stage_id'],
    filters: [
      { id: 'open', field: 'status', operator: 'equals', value: 'open' }
    ],
    timeRange: { preset: 'last_30_days' },
    orderBy: { field: 'total_value', direction: 'desc' }
  }
);
```

## Time Range Presets

- `today` - Current day from midnight
- `yesterday` - Previous day
- `last_7_days` - Last 7 days
- `last_30_days` - Last 30 days
- `this_week` - Current week
- `last_week` - Previous week
- `this_month` - Current month
- `last_month` - Previous month
- `this_quarter` - Current quarter
- `last_quarter` - Previous quarter
- `this_year` - Current year
- `last_year` - Previous year
- `custom` - Custom date range

## Calculation Functions

```typescript
import {
  calculateTrend,
  calculateConversionRate,
  calculateChurnRate,
  formatMetric,
  getDateRange
} from '@/features/analytics';

// Calculate trend
const trend = calculateTrend(currentValue, previousValue);
// Returns: { value: 25.5, direction: 'up' | 'down' | 'neutral' }

// Conversion rate
const rate = calculateConversionRate(conversions, total);
// Returns: 12.5 (percentage)

// Churn rate
const churn = calculateChurnRate(lostCustomers, totalCustomers);
// Returns: 5.2 (percentage)

// Format metrics
formatMetric(1250.50, { type: 'currency', currency: 'USD' });
// Returns: "$1,250.50"
```

## Time Series Analysis

```typescript
import {
  getTimeSeriesData,
  detectTrend,
  detectAnomalies,
  forecastTimeSeries
} from '@/features/analytics';

// Get time series data
const seriesData = await getTimeSeriesData(
  data,
  'created_at',
  'value',
  { preset: 'last_30_days' },
  'day'
);

// Detect trend
const trend = detectTrend(seriesData);
// Returns: { direction, strength, slope }

// Detect anomalies
const anomalies = detectAnomalies(seriesData, 2);
// Returns: Array of anomalous data points

// Forecast
const forecast = forecastTimeSeries(seriesData, 7, 'linear');
// Returns: 7 days of forecasted data
```

## Integration with Other Modules

### CRM Integration
```typescript
import { useDealsByStage, usePipelineValue } from '@/features/analytics';

// Use CRM data in analytics
const { data: deals } = useDealsByStage();
const { data: pipelineValue } = usePipelineValue();
```

### Marketing Integration
```typescript
import { useCampaignsSent, useEmailPerformance } from '@/features/analytics';

// Track marketing performance
const { data: campaigns } = useCampaignsSent({ preset: 'last_30_days' });
const { data: performance } = useEmailPerformance({ preset: 'last_30_days' });
```

### Workflow Integration
```typescript
import { useWorkflowExecutions, useWorkflowSuccessRate } from '@/features/analytics';

// Monitor workflow performance
const { data: executions } = useWorkflowExecutions({ preset: 'last_7_days' });
const { data: successRate } = useWorkflowSuccessRate({ preset: 'last_7_days' });
```

## Performance Considerations

1. **Query Caching**: React Query caches results for 1 minute by default
2. **Data Pagination**: Use `limit` parameter for large datasets
3. **Time Range**: Smaller time ranges = faster queries
4. **Widget Updates**: Set appropriate `refreshInterval` for real-time widgets
5. **Export**: Large exports may take time - consider async processing

## Routes

- `/analytics` - Default dashboard overview
- `/analytics/dashboards` - Dashboard list and templates
- `/analytics/dashboards/new` - Create custom dashboard (planned)
- `/analytics/reports` - Report management
- `/analytics/reports/new` - Create custom report (planned)

## Module Registration

The analytics module is registered in `src/lib/registry.ts`:

```typescript
analytics: {
  id: 'analytics',
  name: 'Analytics Suite',
  description: 'Comprehensive reporting and custom dashboards',
  category: 'analytics',
  icon: BarChart3,
}
```

Access is controlled via `FeatureGuard` component.

## Dependencies

- **recharts** - Chart visualization library
- **@tanstack/react-query** - Server state management
- **lucide-react** - Icons
- **Radix UI** - UI primitives
- **Tailwind CSS** - Styling

## Future Enhancements

1. **Dashboard Builder** - Drag-drop dashboard creation UI
2. **Report Builder** - Visual report builder
3. **Report Scheduler** - Automated report delivery
4. **Advanced Charts** - Scatter plots, box plots, histograms
5. **Drill-down** - Click widgets to view detailed data
6. **Dashboards Sharing** - Public/private dashboard links
7. **Alerts** - Metric threshold alerts via email/slack
8. **Cohort Analysis** - Advanced cohort retention
9. **Funnel Analysis** - Multi-step conversion tracking
10. **SQL Editor** - Advanced query builder

## Contributing

When adding new widgets:

1. Create widget component in `widgets/`
2. Export from `widgets/index.ts`
3. Add to `widgetComponents` registry
4. Update widget types in `types.ts`
5. Add example to dashboard template

When adding new queries:

1. Add to `preBuiltQueries` in `lib/queries.ts`
2. Create corresponding hook in `hooks/useAnalytics.ts`
3. Export from main `index.ts`
4. Update documentation

## Support

For issues or questions about the Analytics module, refer to:
- Main documentation: `docs/ANALYTICS_MODULE.md`
- Type definitions: `src/features/analytics/types.ts`
- Widget examples: `src/features/analytics/widgets/`
- Query examples: `src/features/analytics/lib/queries.ts`
