import type { MetricFormat, AggregationType } from '../types';

// =====================================================
// Metric Calculations
// =====================================================

export function calculateMetric(
  data: number[],
  aggregation: AggregationType
): number {
  if (!data || data.length === 0) return 0;

  const validData = data.filter((n) => !isNaN(n) && n !== null);

  switch (aggregation) {
    case 'count':
      return validData.length;
    case 'sum':
      return validData.reduce((acc, val) => acc + val, 0);
    case 'avg':
      return validData.reduce((acc, val) => acc + val, 0) / validData.length;
    case 'min':
      return Math.min(...validData);
    case 'max':
      return Math.max(...validData);
    case 'median':
      return calculateMedian(validData);
    case 'stddev':
      return calculateStdDev(validData);
    case 'variance':
      return calculateVariance(validData);
    case 'count_distinct':
      return new Set(validData).size;
    default:
      return 0;
  }
}

export function calculateMedian(data: number[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateStdDev(data: number[]): number {
  const variance = calculateVariance(data);
  return Math.sqrt(variance);
}

export function calculateVariance(data: number[]): number {
  if (data.length === 0) return 0;

  const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
  const squaredDiffs = data.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((acc, val) => acc + val, 0) / data.length;
}

export function calculatePercentage(
  numerator: number,
  denominator: number,
  decimals = 1
): number {
  if (denominator === 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(decimals));
}

export function calculateTrend(
  current: number,
  previous: number
): { value: number; direction: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { value: 0, direction: 'neutral' };
  }

  const value = ((current - previous) / previous) * 100;
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'neutral';

  return { value: Number(value.toFixed(1)), direction };
}

export function calculateGrowthRate(
  values: number[],
  _period: 'daily' | 'weekly' | 'monthly' = 'monthly'
): number {
  if (values.length < 2) return 0;

  const startValue = values[0];
  const endValue = values[values.length - 1];

  if (startValue === 0) return 0;

  const periods = values.length - 1;
  const growthRate = Math.pow(endValue / startValue, 1 / periods) - 1;

  return Number((growthRate * 100).toFixed(2));
}

export function calculateMovingAverage(
  data: number[],
  window: number
): number[] {
  if (data.length < window) return [];

  const result: number[] = [];

  for (let i = window - 1; i < data.length; i++) {
    const slice = data.slice(i - window + 1, i + 1);
    const avg = slice.reduce((acc, val) => acc + val, 0) / window;
    result.push(Number(avg.toFixed(2)));
  }

  return result;
}

// =====================================================
// Conversions & Revenue
// =====================================================

export function calculateConversionRate(
  conversions: number,
  total: number
): number {
  if (total === 0) return 0;
  return Number(((conversions / total) * 100).toFixed(2));
}

export function calculateRevenue(
  deals: Array<{ value: number | null; status: string }>,
  status?: string
): number {
  const filteredDeals = status
    ? deals.filter((d) => d.status === status)
    : deals;

  return filteredDeals.reduce((acc, deal) => acc + (deal.value || 0), 0);
}

export function calculatePipelineValue(
  deals: Array<{ value: number | null; stage_id: string }>,
  stageWeights: Record<string, number> = {}
): number {
  return deals.reduce((acc, deal) => {
    const value = deal.value || 0;
    const weight = stageWeights[deal.stage_id] || 1;
    return acc + value * weight;
  }, 0);
}

export function calculateDealVelocity(
  deals: Array<{ created_at: string; completed_at?: string | null }>
): number {
  const completedDeals = deals.filter((d) => d.completed_at);

  if (completedDeals.length === 0) return 0;

  const durations = completedDeals.map((deal) => {
    const created = new Date(deal.created_at).getTime();
    const completed = new Date(deal.completed_at!).getTime();
    return completed - created;
  });

  const avgDuration = durations.reduce((acc, val) => acc + val, 0) / durations.length;
  return Math.round(avgDuration / (1000 * 60 * 60 * 24)); // Convert to days
}

// =====================================================
// Churn & Retention
// =====================================================

export function calculateChurnRate(
  lostCustomers: number,
  totalCustomers: number
): number {
  if (totalCustomers === 0) return 0;
  return Number(((lostCustomers / totalCustomers) * 100).toFixed(2));
}

export function calculateRetentionRate(
  retainedCustomers: number,
  totalCustomers: number
): number {
  if (totalCustomers === 0) return 0;
  return Number(((retainedCustomers / totalCustomers) * 100).toFixed(2));
}

export function calculateCustomerLifetimeValue(
  avgRevenuePerCustomer: number,
  avgCustomerLifespan: number // in months
): number {
  return avgRevenuePerCustomer * avgCustomerLifespan;
}

// =====================================================
// Cohort Analysis
// =====================================================

export function calculateCohortRetention(
  cohortData: Array<{
    cohort: string;
    period: number;
    users: number;
    active: number;
  }>
): Array<{
  cohort: string;
  period: number;
  retention_rate: number;
}> {
  const cohortSizes = new Map<string, number>();

  // Calculate cohort sizes (period 0)
  cohortData.forEach((data) => {
    if (data.period === 0 && !cohortSizes.has(data.cohort)) {
      cohortSizes.set(data.cohort, data.users);
    }
  });

  // Calculate retention rates
  return cohortData.map((data) => {
    const cohortSize = cohortSizes.get(data.cohort) || 1;
    const retentionRate = calculatePercentage(data.active, cohortSize);

    return {
      cohort: data.cohort,
      period: data.period,
      retention_rate: retentionRate,
    };
  });
}

// =====================================================
// Funnel Analysis
// =====================================================

export interface FunnelStep {
  name: string;
  count: number;
  conversion_rate?: number;
  dropoff_rate?: number;
}

export function calculateFunnel(
  steps: Array<{ name: string; count: number }>
): FunnelStep[] {
  if (steps.length === 0) return [];

  const result: FunnelStep[] = [];
  const totalCount = steps[0].count;

  steps.forEach((step, index) => {
    const funnelStep: FunnelStep = {
      name: step.name,
      count: step.count,
    };

    if (index > 0) {
      funnelStep.conversion_rate = calculatePercentage(
        step.count,
        totalCount
      );
      funnelStep.dropoff_rate = calculatePercentage(
        steps[index - 1].count - step.count,
        steps[index - 1].count
      );
    } else {
      funnelStep.conversion_rate = 100;
      funnelStep.dropoff_rate = 0;
    }

    result.push(funnelStep);
  });

  return result;
}

// =====================================================
// Formatting
// =====================================================

export function formatMetric(
  value: number,
  format: MetricFormat
): string {
  const {
    type,
    currency = 'USD',
    decimals = 0,
    prefix = '',
    suffix = '',
  } = format;

  let formatted: string;

  switch (type) {
    case 'number':
      formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      break;

    case 'currency':
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      break;

    case 'percentage':
      formatted = `${value.toFixed(decimals)}%`;
      break;

    case 'duration':
      formatted = formatDuration(value);
      break;

    case 'bytes':
      formatted = formatBytes(value);
      break;

    default:
      formatted = value.toString();
  }

  return `${prefix}${formatted}${suffix}`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function formatNumberCompact(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

// =====================================================
// Percentiles
// =====================================================

export function calculatePercentile(
  data: number[],
  percentile: number
): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) return sorted[sorted.length - 1];

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function calculateQuartiles(data: number[]): {
  q1: number;
  q2: number;
  q3: number;
} {
  return {
    q1: calculatePercentile(data, 25),
    q2: calculatePercentile(data, 50),
    q3: calculatePercentile(data, 75),
  };
}

// =====================================================
// Date Calculations
// =====================================================

export function getDateRange(
  preset: string,
  _timezone = 'UTC'
): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  const start = new Date(now);

  switch (preset) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'last_7_days':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_30_days':
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case 'this_week':
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_week':
      start.setDate(start.getDate() - start.getDay() - 7);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - end.getDay());
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_month':
      start.setMonth(start.getMonth() - 1, 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_quarter':
      start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_quarter':
      const quarter = Math.floor(start.getMonth() / 3);
      start.setMonth((quarter - 1) * 3, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(quarter * 3, 1);
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'this_year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_year':
      start.setFullYear(start.getFullYear() - 1, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setFullYear(end.getFullYear(), 0, 1);
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}
