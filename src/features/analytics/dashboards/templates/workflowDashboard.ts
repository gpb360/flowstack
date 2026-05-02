import type { DashboardTemplate } from '../../types';
import { Workflow, AlertCircle, Activity } from 'lucide-react';

export const workflowDashboardTemplate: DashboardTemplate = {
  id: 'workflow-dashboard',
  name: 'Workflow Overview',
  description: 'Monitor workflow executions, success rates, and errors',
  category: 'Automation',
  icon: Workflow,
  tags: ['workflows', 'automation', 'executions', 'errors'],
  layout: {
    type: 'grid',
    columns: 12,
    rowHeight: 100,
    margin: [16, 16],
  },
  widgets: [
    // Total Executions - Number Widget
    {
      id: 'total-executions',
      type: 'number',
      title: 'Total Executions',
      position: { x: 0, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'number' },
        showTrend: true,
        trendPeriod: 'last_30_days',
      },
    },
    // Success Rate - Gauge Widget
    {
      id: 'success-rate',
      type: 'gauge',
      title: 'Success Rate',
      position: { x: 3, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        min: 0,
        max: 100,
        thresholds: [
          { value: 70, label: 'Poor', color: '#ef4444' },
          { value: 90, label: 'Good', color: '#eab308' },
          { value: 100, label: 'Excellent', color: '#22c55e' },
        ],
        showValue: true,
        colorScheme: 'green',
      },
    },
    // Failed Executions - Stat Card
    {
      id: 'failed-executions',
      type: 'stat_card',
      title: 'Failed Executions',
      position: { x: 6, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        
        filters: [
          { id: 'failed', field: 'status', operator: 'equals', value: 'failed' },
        ],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'number' },
        showTrend: true,
        icon: AlertCircle,
        description: 'Needs attention',
      },
    },
    // Avg Execution Time - Stat Card
    {
      id: 'avg-execution-time',
      type: 'stat_card',
      title: 'Avg Execution Time',
      position: { x: 9, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'duration_ms',
        
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'duration' },
        showTrend: true,
        icon: Activity,
      },
    },
    // Execution Trend - Area Chart
    {
      id: 'execution-trend',
      type: 'area_chart',
      title: 'Executions Over Time',
      position: { x: 0, y: 2, w: 8, h: 3 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        
        dimensions: ['started_at', 'status'],
        groupBy: ['started_at', 'status'],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        xAxis: 'started_at',
        yAxis: ['completed', 'failed', 'running'],
        smoothLine: true,
        fillArea: true,
        showLegend: true,
      },
    },
    // Status Distribution - Pie Chart
    {
      id: 'status-distribution',
      type: 'pie_chart',
      title: 'Execution Status Distribution',
      position: { x: 8, y: 2, w: 4, h: 3 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        
        dimensions: ['status'],
        groupBy: ['status'],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        donut: true,
      },
    },
    // Errors by Type - Bar Chart
    {
      id: 'errors-by-type',
      type: 'bar_chart',
      title: 'Errors by Type',
      position: { x: 0, y: 5, w: 6, h: 3 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        
        dimensions: ['error'],
        groupBy: ['error'],
        filters: [
          { id: 'failed', field: 'status', operator: 'equals', value: 'failed' },
        ],
        timeRange: { preset: 'last_30_days' },
        limit: 10,
      },
      config: {
        xAxis: 'error',
        yAxis: 'count',
        showLegend: false,
      },
    },
    // Top Workflows - Leaderboard
    {
      id: 'top-workflows',
      type: 'leaderboard',
      title: 'Most Active Workflows',
      position: { x: 6, y: 5, w: 6, h: 3 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        metric: 'id',
        
        dimensions: ['workflow_id'],
        groupBy: ['workflow_id'],
        orderBy: { field: 'count', direction: 'desc' },
        limit: 5,
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        items: [],
        showRank: true,
        showValue: true,
        maxItems: 5,
        orientation: 'vertical',
      },
    },
    // Recent Executions - Table
    {
      id: 'recent-executions',
      type: 'table',
      title: 'Recent Executions',
      position: { x: 0, y: 8, w: 12, h: 3 },
      dataSource: {
        type: 'query',
        table: 'workflow_executions',
        orderBy: { field: 'started_at', direction: 'desc' },
        limit: 15,
      },
      config: {
        columns: [
          { id: 'workflow_id', header: 'Workflow', accessorKey: 'workflow_id' },
          { id: 'status', header: 'Status', accessorKey: 'status' },
          { id: 'started_at', header: 'Started', accessorKey: 'started_at' },
          { id: 'completed_at', header: 'Completed', accessorKey: 'completed_at' },
          { id: 'duration_ms', header: 'Duration', accessorKey: 'duration_ms' },
          { id: 'error', header: 'Error', accessorKey: 'error' },
        ],
        pageSize: 15,
        sortable: true,
        filterable: true,
      },
    },
  ],
};
