import type { DashboardTemplate } from '../../types';
import { FileText, Target } from 'lucide-react';

export const formsDashboardTemplate: DashboardTemplate = {
  id: 'forms-dashboard',
  name: 'Forms Overview',
  description: 'Track form submissions, conversion rates, and field completion',
  category: 'Forms',
  icon: FileText,
  tags: ['forms', 'submissions', 'conversion'],
  layout: {
    type: 'grid',
    columns: 12,
    rowHeight: 100,
    margin: [16, 16],
  },
  widgets: [
    // Total Submissions - Number Widget
    {
      id: 'total-submissions',
      type: 'number',
      title: 'Total Submissions',
      position: { x: 0, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'form_submissions',
        metric: 'id',
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'number' },
        showTrend: true,
        trendPeriod: 'last_30_days',
      },
    },
    // Conversion Rate - Stat Card
    {
      id: 'conversion-rate',
      type: 'stat_card',
      title: 'Conversion Rate',
      position: { x: 3, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'metric',
        metric: 'conversion_rate',
      },
      config: {
        format: { type: 'percentage' },
        showTrend: true,
        icon: Target,
        description: 'Visitors who submitted',
      },
    },
    // Active Forms - Number Widget
    {
      id: 'active-forms',
      type: 'number',
      title: 'Active Forms',
      position: { x: 6, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'forms',
        metric: 'id',
        filters: [
          { id: 'active', field: 'status', operator: 'equals', value: 'active' },
        ],
      },
      config: {
        format: { type: 'number' },
      },
    },
    // Completion Rate - Gauge Widget
    {
      id: 'completion-rate',
      type: 'gauge',
      title: 'Form Completion Rate',
      position: { x: 9, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'metric',
        metric: 'completion_rate',
      },
      config: {
        min: 0,
        max: 100,
        thresholds: [
          { value: 50, label: 'Low', color: '#ef4444' },
          { value: 75, label: 'Medium', color: '#f97316' },
          { value: 100, label: 'High', color: '#22c55e' },
        ],
        showValue: true,
      },
    },
    // Submission Trend - Line Chart
    {
      id: 'submission-trend',
      type: 'line_chart',
      title: 'Submissions Over Time',
      position: { x: 0, y: 2, w: 8, h: 3 },
      dataSource: {
        type: 'query',
        table: 'form_submissions',
        metric: 'id',
        dimensions: ['submitted_at'],
        groupBy: ['submitted_at'],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        xAxis: 'submitted_at',
        yAxis: 'count',
        smoothLine: true,
        showGrid: true,
      },
    },
    // Form Performance - Bar Chart
    {
      id: 'form-performance',
      type: 'bar_chart',
      title: 'Form Performance',
      position: { x: 8, y: 2, w: 4, h: 3 },
      dataSource: {
        type: 'query',
        table: 'form_submissions',
        metric: 'id',
        dimensions: ['form_id'],
        groupBy: ['form_id'],
        orderBy: { field: 'count', direction: 'desc' },
        limit: 5,
      },
      config: {
        xAxis: 'form_id',
        yAxis: 'count',
        showLegend: false,
      },
    },
    // Field Completion Heatmap
    {
      id: 'field-completion',
      type: 'heatmap',
      title: 'Field Completion Rate',
      position: { x: 0, y: 5, w: 6, h: 3 },
      dataSource: {
        type: 'query',
        table: 'form_fields',
        metric: 'id',
        dimensions: ['label', 'form_id'],
      },
      config: {
        xAxis: 'form_id',
        yAxis: 'label',
        valueAxis: 'completion_rate',
        showLabels: true,
      },
    },
    // Lead Quality Distribution - Pie Chart
    {
      id: 'lead-quality',
      type: 'pie_chart',
      title: 'Lead Quality Distribution',
      position: { x: 6, y: 5, w: 6, h: 3 },
      dataSource: {
        type: 'query',
        table: 'form_submissions',
        metric: 'id',
        dimensions: ['status'],
        groupBy: ['status'],
      },
      config: {
        donut: true,
      },
    },
    // Recent Submissions - Table
    {
      id: 'recent-submissions',
      type: 'table',
      title: 'Recent Submissions',
      position: { x: 0, y: 8, w: 12, h: 3 },
      dataSource: {
        type: 'query',
        table: 'form_submissions',
        orderBy: { field: 'submitted_at', direction: 'desc' },
        limit: 10,
      },
      config: {
        columns: [
          { id: 'form_id', header: 'Form', accessorKey: 'form_id' },
          { id: 'email', header: 'Email', accessorKey: 'email' },
          { id: 'status', header: 'Status', accessorKey: 'status' },
          { id: 'submitted_at', header: 'Submitted', accessorKey: 'submitted_at' },
          { id: 'utm_source', header: 'Source', accessorKey: 'utm_source' },
        ],
        pageSize: 10,
        sortable: true,
        filterable: true,
      },
    },
  ],
};
