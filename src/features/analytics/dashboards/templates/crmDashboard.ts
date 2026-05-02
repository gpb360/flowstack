import type { DashboardTemplate } from '../../types';
import { Users, DollarSign } from 'lucide-react';

export const crmDashboardTemplate: DashboardTemplate = {
  id: 'crm-dashboard',
  name: 'CRM Overview',
  description: 'Track your contacts, deals, and pipeline performance',
  category: 'CRM',
  icon: Users,
  tags: ['crm', 'sales', 'contacts', 'deals'],
  layout: {
    type: 'grid',
    columns: 12,
    rowHeight: 100,
    margin: [16, 16],
  },
  widgets: [
    // Total Contacts - Number Widget
    {
      id: 'total-contacts',
      type: 'number',
      title: 'Total Contacts',
      position: { x: 0, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'contacts',
        metric: 'id',
      },
      config: {
        showTrend: true,
        trendPeriod: 'last_30_days',
        format: { type: 'number' },
      },
    },
    // New Contacts Trend - Line Chart
    {
      id: 'new-contacts-trend',
      type: 'line_chart',
      title: 'New Contacts (Last 30 Days)',
      position: { x: 3, y: 0, w: 6, h: 2 },
      dataSource: {
        type: 'query',
        table: 'contacts',
        metric: 'id',
        dimensions: ['created_at'],
        groupBy: ['created_at'],
        timeRange: { preset: 'last_30_days' },
      },
      config: {
        xAxis: 'created_at',
        yAxis: 'count',
        smoothLine: true,
        showGrid: true,
      },
    },
    // Pipeline Value - Stat Card
    {
      id: 'pipeline-value',
      type: 'stat_card',
      title: 'Pipeline Value',
      position: { x: 9, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        filters: [
          { id: 'open', field: 'status', operator: 'equals', value: 'open' },
        ],
      },
      config: {
        format: { type: 'currency', currency: 'USD' },
        showTrend: true,
        icon: DollarSign,
      },
    },
    // Deals by Stage - Funnel Chart
    {
      id: 'deals-by-stage',
      type: 'funnel',
      title: 'Deals by Stage',
      position: { x: 0, y: 2, w: 4, h: 3 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        groupBy: ['stage_id'],
      },
      config: {
        showLegend: true,
      },
    },
    // Recent Activities - Table
    {
      id: 'recent-activities',
      type: 'table',
      title: 'Recent Activities',
      position: { x: 4, y: 2, w: 8, h: 3 },
      dataSource: {
        type: 'query',
        table: 'activities',
        limit: 10,
        orderBy: { field: 'created_at', direction: 'desc' },
      },
      config: {
        columns: [
          { id: 'type', header: 'Type', accessorKey: 'type' },
          { id: 'description', header: 'Description', accessorKey: 'description' },
          { id: 'created_at', header: 'Date', accessorKey: 'created_at' },
          { id: 'contact_id', header: 'Contact', accessorKey: 'contact_id' },
        ],
        pageSize: 10,
        sortable: true,
      },
    },
    // Conversion Rate - Progress Widget
    {
      id: 'conversion-rate',
      type: 'progress',
      title: 'Lead to Customer Conversion',
      position: { x: 0, y: 5, w: 6, h: 2 },
      dataSource: {
        type: 'metric',
        metric: 'conversion_rate',
      },
      config: {
        goal: 25,
        current: 18,
        showPercentage: true,
        showLabel: true,
        color: '#22c55e',
      },
    },
    // Top Opportunities - Leaderboard
    {
      id: 'top-opportunities',
      type: 'leaderboard',
      title: 'Top Opportunities',
      position: { x: 6, y: 5, w: 6, h: 2 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        groupBy: ['title'],
        orderBy: { field: 'value', direction: 'desc' },
        limit: 5,
        filters: [
          { id: 'open', field: 'status', operator: 'equals', value: 'open' },
        ],
      },
    },
  ],
};
