import type { DashboardTemplate, LeaderboardWidgetConfig } from '../../types';
import { Mail, TrendingUp } from 'lucide-react';

export const marketingDashboardTemplate: DashboardTemplate = {
  id: 'marketing-dashboard',
  name: 'Marketing Overview',
  description: 'Monitor your email campaigns, templates, and performance',
  category: 'Marketing',
  icon: Mail,
  tags: ['marketing', 'email', 'campaigns', 'templates'],
  layout: {
    type: 'grid',
    columns: 12,
    rowHeight: 100,
    margin: [16, 16],
  },
  widgets: [
    // Campaigns Sent - Number Widget
    {
      id: 'campaigns-sent',
      type: 'number',
      title: 'Campaigns Sent',
      position: { x: 0, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'marketing_campaigns',
        metric: 'id',
        
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'number' },
        showTrend: true,
        trendPeriod: 'last_30_days',
      },
    },
    // Total Recipients - Stat Card
    {
      id: 'total-recipients',
      type: 'stat_card',
      title: 'Total Recipients',
      position: { x: 3, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'marketing_campaigns',
        metric: 'total_recipients',
        
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'number' },
        showTrend: true,
        icon: TrendingUp,
      },
    },
    // Open Rate - Number Widget
    {
      id: 'open-rate',
      type: 'number',
      title: 'Open Rate',
      position: { x: 6, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'marketing_logs',
        metric: 'status',
        
        filters: [
          { id: 'opened', field: 'status', operator: 'equals', value: 'opened' },
        ],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'percentage' },
        showTrend: true,
      },
    },
    // Click Rate - Number Widget
    {
      id: 'click-rate',
      type: 'number',
      title: 'Click Rate',
      position: { x: 9, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'marketing_logs',
        metric: 'status',
        
        filters: [
          { id: 'clicked', field: 'status', operator: 'equals', value: 'clicked' },
        ],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        format: { type: 'percentage' },
        showTrend: true,
      },
    },
    // Email Performance Trend - Area Chart
    {
      id: 'email-performance-trend',
      type: 'area_chart',
      title: 'Email Performance Trend',
      position: { x: 0, y: 2, w: 8, h: 3 },
      dataSource: {
        type: 'query',
        table: 'marketing_logs',
        metric: 'id',
        
        dimensions: ['created_at', 'status'],
        groupBy: ['created_at', 'status'],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        xAxis: 'created_at',
        yAxis: ['opened', 'clicked', 'delivered'],
        smoothLine: true,
        showLegend: true,
      },
    },
    // Campaign Status - Pie Chart
    {
      id: 'campaign-status',
      type: 'pie_chart',
      title: 'Campaigns by Status',
      position: { x: 8, y: 2, w: 4, h: 3 },
      dataSource: {
        type: 'query',
        table: 'marketing_campaigns',
        metric: 'id',
        
        dimensions: ['status'],
        groupBy: ['status'],
      },
      config: {
        donut: true,
      },
    },
    // Top Templates - Leaderboard
    {
      id: 'top-templates',
      type: 'leaderboard',
      title: 'Top Performing Templates',
      position: { x: 0, y: 5, w: 6, h: 2 },
      dataSource: {
        type: 'query',
        table: 'marketing_campaigns',
        metric: 'sent_count',
        
        groupBy: ['template_id'],
        orderBy: { field: 'sent_count', direction: 'desc' },
        limit: 5,
      },
      config: {} as LeaderboardWidgetConfig,
    },
    // Unsubscribe Trend - Line Chart
    {
      id: 'unsubscribe-trend',
      type: 'line_chart',
      title: 'Unsubscribe Trend',
      position: { x: 6, y: 5, w: 6, h: 2 },
      dataSource: {
        type: 'query',
        table: 'marketing_logs',
        metric: 'id',
        
        dimensions: ['created_at'],
        groupBy: ['created_at'],
        filters: [
          { id: 'failed', field: 'status', operator: 'equals', value: 'failed' },
        ],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        xAxis: 'created_at',
        yAxis: 'count',
        showGrid: true,
      },
    },
    // Campaign List - Table
    {
      id: 'campaign-list',
      type: 'table',
      title: 'Recent Campaigns',
      position: { x: 0, y: 7, w: 12, h: 3 },
      dataSource: {
        type: 'query',
        table: 'marketing_campaigns',
        orderBy: { field: 'created_at', direction: 'desc' },
        limit: 10,
      },
      config: {
        columns: [
          { id: 'name', header: 'Name', accessorKey: 'name' },
          { id: 'status', header: 'Status', accessorKey: 'status' },
          { id: 'type', header: 'Type', accessorKey: 'type' },
          { id: 'total_recipients', header: 'Recipients', accessorKey: 'total_recipients' },
          { id: 'sent_count', header: 'Sent', accessorKey: 'sent_count' },
          { id: 'created_at', header: 'Created', accessorKey: 'created_at' },
        ],
        pageSize: 10,
        sortable: true,
      },
    },
  ],
};
