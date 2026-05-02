import type { DashboardTemplate } from '../../types';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

export const revenueDashboardTemplate: DashboardTemplate = {
  id: 'revenue-dashboard',
  name: 'Revenue Overview',
  description: 'Monitor MRR, ARR, churn, and revenue trends',
  category: 'Revenue',
  icon: DollarSign,
  tags: ['revenue', 'mrr', 'arr', 'churn'],
  layout: {
    type: 'grid',
    columns: 12,
    rowHeight: 100,
    margin: [16, 16],
  },
  widgets: [
    // MRR - Stat Card
    {
      id: 'mrr',
      type: 'stat_card',
      title: 'Monthly Recurring Revenue',
      position: { x: 0, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        
        filters: [
          { id: 'won', field: 'status', operator: 'equals', value: 'won' },
          { id: 'recurring', field: 'type', operator: 'equals', value: 'recurring' },
        ],
      },
      config: {
        format: { type: 'currency', currency: 'USD' },
        showTrend: true,
        icon: DollarSign,
      },
    },
    // ARR - Stat Card
    {
      id: 'arr',
      type: 'stat_card',
      title: 'Annual Recurring Revenue',
      position: { x: 3, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'metric',
        metric: 'arr',
      },
      config: {
        format: { type: 'currency', currency: 'USD' },
        showTrend: true,
        icon: TrendingUp,
      },
    },
    // Churn Rate - Gauge Widget
    {
      id: 'churn-rate',
      type: 'gauge',
      title: 'Churn Rate',
      position: { x: 6, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'metric',
        metric: 'churn_rate',
      },
      config: {
        min: 0,
        max: 20,
        thresholds: [
          { value: 5, label: 'Excellent', color: '#22c55e' },
          { value: 10, label: 'Good', color: '#eab308' },
          { value: 20, label: 'Poor', color: '#ef4444' },
        ],
        showValue: true,
        colorScheme: 'green',
      },
    },
    // LTV - Stat Card
    {
      id: 'ltv',
      type: 'stat_card',
      title: 'Customer Lifetime Value',
      position: { x: 9, y: 0, w: 3, h: 2 },
      dataSource: {
        type: 'metric',
        metric: 'ltv',
      },
      config: {
        format: { type: 'currency', currency: 'USD' },
        showTrend: true,
        icon: BarChart3,
      },
    },
    // Revenue Trend - Area Chart
    {
      id: 'revenue-trend',
      type: 'area_chart',
      title: 'Revenue Trend',
      position: { x: 0, y: 2, w: 8, h: 3 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        
        dimensions: ['created_at'],
        groupBy: ['created_at'],
        filters: [
          { id: 'won', field: 'status', operator: 'equals', value: 'won' },
        ],
        timeRange: { preset: 'last_year' },
      },
      config: {
        xAxis: 'created_at',
        yAxis: 'value',
        smoothLine: true,
        fillArea: true,
        showGrid: true,
      },
    },
    // Revenue by Source - Pie Chart
    {
      id: 'revenue-by-source',
      type: 'pie_chart',
      title: 'Revenue by Source',
      position: { x: 8, y: 2, w: 4, h: 3 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        
        dimensions: ['source'],
        groupBy: ['source'],
        filters: [
          { id: 'won', field: 'status', operator: 'equals', value: 'won' },
        ],
      },
      config: {
        donut: true,
      },
    },
    // Churn Analysis - Line Chart
    {
      id: 'churn-analysis',
      type: 'line_chart',
      title: 'Churn Over Time',
      position: { x: 0, y: 5, w: 8, h: 2 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'id',
        
        dimensions: ['updated_at'],
        groupBy: ['updated_at'],
        filters: [
          { id: 'lost', field: 'status', operator: 'equals', value: 'lost' },
        ],
        timeRange: { preset: 'last_year' },
      },
      config: {
        xAxis: 'updated_at',
        yAxis: 'count',
        smoothLine: true,
        showGrid: true,
      },
    },
    // At-Risk Revenue - Number Widget
    {
      id: 'at-risk-revenue',
      type: 'number',
      title: 'At-Risk Revenue',
      position: { x: 8, y: 5, w: 4, h: 2 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        
        filters: [
          { id: 'open_stalled', field: 'status', operator: 'equals', value: 'open' },
          { id: 'no_activity', field: 'last_activity', operator: 'lt', value: '30_days_ago' },
        ],
      },
      config: {
        format: { type: 'currency', currency: 'USD' },
        showTrend: true,
      },
    },
    // Revenue by Plan - Bar Chart
    {
      id: 'revenue-by-plan',
      type: 'bar_chart',
      title: 'Revenue by Pricing Plan',
      position: { x: 0, y: 7, w: 6, h: 3 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        
        dimensions: ['plan'],
        groupBy: ['plan'],
        filters: [
          { id: 'won', field: 'status', operator: 'equals', value: 'won' },
        ],
      },
      config: {
        xAxis: 'plan',
        yAxis: 'value',
        showLegend: false,
      },
    },
    // Top Deals - Leaderboard
    {
      id: 'top-deals',
      type: 'leaderboard',
      title: 'Top Deals This Month',
      position: { x: 6, y: 7, w: 6, h: 3 },
      dataSource: {
        type: 'query',
        table: 'deals',
        metric: 'value',
        groupBy: ['title', 'contact_id'],
        orderBy: { field: 'value', direction: 'desc' },
        limit: 10,
        filters: [
          { id: 'won', field: 'status', operator: 'equals', value: 'won' },
          { id: 'this_month', field: 'created_at', operator: 'date_between', value: ['this_month_start', 'this_month_end'] },
        ],
      },
      config: {
        items: [],
        showRank: true,
        showValue: true,
        maxItems: 10,
        orientation: 'vertical',
      },
    },
  ],
};
