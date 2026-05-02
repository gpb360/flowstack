import type { TimeSeriesData, TimeGranularity, TimeRange } from '../types';
import { getDateRange } from './calculations';

// =====================================================
// Time Series Data Generation
// =====================================================

export async function getTimeSeriesData(
  data: any[],
  dateField: string,
  valueField: string,
  timeRange: TimeRange,
  granularity: TimeGranularity = 'day'
): Promise<TimeSeriesData[]> {
  const { start, end } = timeRange.preset
    ? getDateRange(timeRange.preset)
    : { start: timeRange.start!, end: timeRange.end! };

  // Group data by time period
  const grouped = groupDataByTime(data, dateField, valueField, granularity);

  // Fill missing periods with zeros
  const filled = fillMissingPeriods(grouped, start, end, granularity);

  return filled;
}

function groupDataByTime(
  data: any[],
  dateField: string,
  valueField: string,
  granularity: TimeGranularity
): Map<string, number> {
  const grouped = new Map<string, number>();

  data.forEach((item) => {
    const date = new Date(item[dateField]);
    const key = getTimeKey(date, granularity);
    const value = Number(item[valueField]) || 0;

    grouped.set(key, (grouped.get(key) || 0) + value);
  });

  return grouped;
}

function getTimeKey(date: Date, granularity: TimeGranularity): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();

  switch (granularity) {
    case 'hour':
      return `${year}-${month}-${day}-${hour}`;
    case 'day':
      return `${year}-${month}-${day}`;
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-${weekStart.getMonth()}-${weekStart.getDate()}`;
    case 'month':
      return `${year}-${month}`;
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3);
      return `${year}-Q${quarter + 1}`;
    case 'year':
      return `${year}`;
  }
}

function fillMissingPeriods(
  grouped: Map<string, number>,
  start: Date,
  end: Date,
  granularity: TimeGranularity
): TimeSeriesData[] {
  const result: TimeSeriesData[] = [];
  let current = new Date(start);

  while (current <= end) {
    const key = getTimeKey(current, granularity);
    const value = grouped.get(key) || 0;

    result.push({
      date: new Date(current),
      value,
    });

    current = incrementTime(current, granularity);
  }

  return result;
}

function incrementTime(date: Date, granularity: TimeGranularity): Date {
  const newDate = new Date(date);

  switch (granularity) {
    case 'hour':
      newDate.setHours(newDate.getHours() + 1);
      break;
    case 'day':
      newDate.setDate(newDate.getDate() + 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
    case 'quarter':
      newDate.setMonth(newDate.getMonth() + 3);
      break;
    case 'year':
      newDate.setFullYear(newDate.getFullYear() + 1);
      break;
  }

  return newDate;
}

// =====================================================
// Time Series Analysis
// =====================================================

export function calculateMovingAverageForTimeSeries(
  data: TimeSeriesData[],
  window: number
): TimeSeriesData[] {
  if (data.length < window) return [];

  return data.map((item, index) => {
    if (index < window - 1) {
      return { ...item, value: 0 };
    }

    const slice = data.slice(index - window + 1, index + 1);
    const avg = slice.reduce((acc, val) => acc + val.value, 0) / window;

    return {
      ...item,
      value: Number(avg.toFixed(2)),
    };
  });
}

export function calculatePeriodOverPeriod(
  current: TimeSeriesData[],
  previous: TimeSeriesData[]
): Array<{
  date: Date;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}> {
  const result: Array<{
    date: Date;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
  }> = [];

  const maxLength = Math.max(current.length, previous.length);

  for (let i = 0; i < maxLength; i++) {
    const currentItem = current[i];
    const previousItem = previous[i];

    if (!currentItem || !previousItem) continue;

    const change = currentItem.value - previousItem.value;
    const changePercent =
      previousItem.value !== 0
        ? (change / previousItem.value) * 100
        : 0;

    result.push({
      date: currentItem.date,
      current: currentItem.value,
      previous: previousItem.value,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
    });
  }

  return result;
}

export function smoothTimeSeries(
  data: TimeSeriesData[],
  method: 'simple' | 'exponential' = 'simple',
  alpha = 0.3
): TimeSeriesData[] {
  if (data.length === 0) return [];

  if (method === 'simple') {
    return data.map((item, index) => {
      if (index === 0) return item;

      const smoothedValue = (item.value + data[index - 1].value) / 2;
      return { ...item, value: Number(smoothedValue.toFixed(2)) };
    });
  } else {
    // Exponential smoothing
    const smoothed: TimeSeriesData[] = [];
    smoothed.push({ ...data[0] });

    for (let i = 1; i < data.length; i++) {
      const smoothedValue =
        alpha * data[i].value + (1 - alpha) * smoothed[i - 1].value;
      smoothed.push({
        ...data[i],
        value: Number(smoothedValue.toFixed(2)),
      });
    }

    return smoothed;
  }
}

export function detectTrend(data: TimeSeriesData[]): {
  direction: 'increasing' | 'decreasing' | 'stable';
  strength: 'weak' | 'moderate' | 'strong';
  slope: number;
} {
  if (data.length < 2) {
    return { direction: 'stable', strength: 'weak', slope: 0 };
  }

  // Calculate linear regression
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  data.forEach((item, index) => {
    sumX += index;
    sumY += item.value;
    sumXY += index * item.value;
    sumX2 += index * index;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const avgValue = sumY / n;

  // Determine direction
  let direction: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(slope) < avgValue * 0.01) {
    direction = 'stable';
  } else if (slope > 0) {
    direction = 'increasing';
  } else {
    direction = 'decreasing';
  }

  // Determine strength based on slope relative to average
  const relativeSlope = Math.abs(slope / avgValue);
  let strength: 'weak' | 'moderate' | 'strong';
  if (relativeSlope < 0.05) {
    strength = 'weak';
  } else if (relativeSlope < 0.15) {
    strength = 'moderate';
  } else {
    strength = 'strong';
  }

  return { direction, strength, slope: Number(slope.toFixed(4)) };
}

export function forecastTimeSeries(
  data: TimeSeriesData[],
  periods: number,
  method: 'linear' | 'moving_average' = 'linear'
): TimeSeriesData[] {
  if (data.length < 2) return [];

  const lastDate = new Date(data[data.length - 1].date);
  const forecast: TimeSeriesData[] = [];

  if (method === 'linear') {
    // Simple linear regression
    const trend = detectTrend(data);
    const lastValue = data[data.length - 1].value;

    for (let i = 1; i <= periods; i++) {
      const forecastValue = lastValue + trend.slope * i;
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      forecast.push({
        date: forecastDate,
        value: Number(forecastValue.toFixed(2)),
      });
    }
  } else {
    // Moving average based
    const window = Math.min(7, data.length);
    const recentValues = data.slice(-window).map((d) => d.value);
    const avg = recentValues.reduce((acc, val) => acc + val, 0) / window;

    for (let i = 1; i <= periods; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      forecast.push({
        date: forecastDate,
        value: Number(avg.toFixed(2)),
      });
    }
  }

  return forecast;
}

// =====================================================
// Time Series Aggregation
// =====================================================

export function aggregateTimeSeries(
  data: TimeSeriesData[],
  targetGranularity: TimeGranularity
): TimeSeriesData[] {
  if (data.length === 0) return [];

  const grouped = new Map<string, TimeSeriesData[]>();

  // Group by target granularity
  data.forEach((item) => {
    const key = getTimeKey(item.date, targetGranularity);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  // Aggregate values
  return Array.from(grouped.entries()).map(([_key, items]) => {
    const aggregatedValue = items.reduce((acc, item) => acc + item.value, 0);
    const representativeDate = items[0].date;

    return {
      date: representativeDate,
      value: Number(aggregatedValue.toFixed(2)),
    };
  });
}

// =====================================================
// Comparison
// =====================================================

export function compareTimeSeries(
  series1: TimeSeriesData[],
  series2: TimeSeriesData[],
  _label1 = 'Series 1',
  _label2 = 'Series 2'
): {
  correlation: number;
  meanDifference: number;
  maxDifference: number;
  periods: number;
} {
  const minLength = Math.min(series1.length, series2.length);

  if (minLength === 0) {
    return { correlation: 0, meanDifference: 0, maxDifference: 0, periods: 0 };
  }

  let sum1 = 0;
  let sum2 = 0;
  let sum1Sq = 0;
  let sum2Sq = 0;
  let sumProduct = 0;
  let totalDifference = 0;
  let maxDifference = 0;

  for (let i = 0; i < minLength; i++) {
    const val1 = series1[i].value;
    const val2 = series2[i].value;

    sum1 += val1;
    sum2 += val2;
    sum1Sq += val1 * val1;
    sum2Sq += val2 * val2;
    sumProduct += val1 * val2;

    const difference = Math.abs(val1 - val2);
    totalDifference += difference;
    maxDifference = Math.max(maxDifference, difference);
  }

  // Pearson correlation coefficient
  const numerator = minLength * sumProduct - sum1 * sum2;
  const denominator = Math.sqrt(
    (minLength * sum1Sq - sum1 * sum1) * (minLength * sum2Sq - sum2 * sum2)
  );
  const correlation =
    denominator !== 0 ? Number((numerator / denominator).toFixed(4)) : 0;

  return {
    correlation,
    meanDifference: Number((totalDifference / minLength).toFixed(2)),
    maxDifference: Number(maxDifference.toFixed(2)),
    periods: minLength,
  };
}

// =====================================================
// Anomalies
// =====================================================

export function detectAnomalies(
  data: TimeSeriesData[],
  threshold = 2 // Number of standard deviations
): Array<{ index: number; date: Date; value: number; zScore: number }> {
  if (data.length < 3) return [];

  const values = data.map((d) => d.value);
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const anomalies: Array<{
    index: number;
    date: Date;
    value: number;
    zScore: number;
  }> = [];

  data.forEach((item, index) => {
    const zScore = (item.value - mean) / stdDev;

    if (Math.abs(zScore) > threshold) {
      anomalies.push({
        index,
        date: item.date,
        value: item.value,
        zScore: Number(zScore.toFixed(2)),
      });
    }
  });

  return anomalies;
}
