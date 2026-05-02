import { supabase } from '@/lib/supabase';
import type {
  AnalyticsQuery,
  AnalyticsResult,
  Filter,
} from '../types';

// =====================================================
// Query Builder
// =====================================================

export async function executeQuery(
  query: AnalyticsQuery,
  organizationId: string
): Promise<AnalyticsResult> {
  const startTime = performance.now();

  try {
    let dbQuery = supabase
      .from(query.dataSource)
      .select('*')
      .eq('organization_id', organizationId);

    // Apply time range filter
    if (query.timeRange) {
      const timeFilter = buildTimeRangeFilter(query.timeRange);
      dbQuery = applyFilterToQuery(dbQuery, timeFilter);
    }

    // Apply custom filters
    if (query.filters) {
      for (const filter of query.filters) {
        dbQuery = applyFilterToQuery(dbQuery, filter);
      }
    }

    // Apply ordering
    if (query.orderBy) {
      dbQuery = dbQuery.order(query.orderBy.field, {
        ascending: query.orderBy.direction === 'asc',
      });
    }

    // Apply limit
    if (query.limit) {
      dbQuery = dbQuery.limit(query.limit);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;

    // Process metrics and aggregations
    const processedData = processMetrics(data || [], query.metrics);

    // Group by dimensions if specified
    const groupedData = query.groupBy
      ? groupData(processedData, query.groupBy)
      : processedData;

    const executionTime = performance.now() - startTime;

    return {
      data: groupedData,
      metadata: {
        rowCount: groupedData.length,
        executionTime,
        cached: false,
        timestamp: new Date(),
      },
    };
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

function applyFilterToQuery(query: any, filter: Filter): any {
  const { field, operator, value } = filter;

  switch (operator) {
    case 'equals':
      return query.eq(field, value);
    case 'not_equals':
      return query.neq(field, value);
    case 'contains':
      return query.like(field, `%${value}%`);
    case 'not_contains':
      return query.notLike(field, `%${value}%`);
    case 'starts_with':
      return query.like(field, `${value}%`);
    case 'ends_with':
      return query.like(field, `%${value}`);
    case 'gt':
      return query.gt(field, value);
    case 'lt':
      return query.lt(field, value);
    case 'gte':
      return query.gte(field, value);
    case 'lte':
      return query.lte(field, value);
    case 'in':
      return query.in(field, value);
    case 'not_in':
      return query.not(field, value);
    case 'is_null':
      return query.is(field, null);
    case 'is_not_null':
      return query.not(field, null);
    case 'between':
      return query.gte(field, (value as any[])[0]).lte(field, (value as any[])[1]);
    case 'date_between':
      return query.gte(field, (value as any[])[0]).lte(field, (value as any[])[1]);
    default:
      return query;
  }
}

function buildTimeRangeFilter(timeRange: any): Filter {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  if (timeRange.start && timeRange.end) {
    return {
      id: 'custom_time_range',
      field: 'created_at',
      operator: 'date_between',
      value: [timeRange.start, timeRange.end],
    };
  }

  switch (timeRange.preset) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      end = new Date(now);
      end.setHours(0, 0, 0, 0);
      start = new Date(end);
      start.setDate(start.getDate() - 1);
      break;
    case 'last_7_days':
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case 'last_30_days':
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    case 'this_week':
      start = new Date(now);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'last_week':
      end = new Date(now);
      end.setDate(end.getDate() - end.getDay());
      end.setHours(0, 0, 0, 0);
      start = new Date(end);
      start.setDate(start.getDate() - 7);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'this_quarter':
      start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      break;
    case 'last_quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
      end = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last_year':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now);
      start.setDate(start.getDate() - 30);
  }

  return {
    id: 'time_range_filter',
    field: 'created_at',
    operator: 'date_between',
    value: [start.toISOString(), end.toISOString()],
  };
}

function processMetrics(data: any[], metrics: any[]): any[] {
  if (!metrics || metrics.length === 0) return data;

  return data.map((row) => {
    const processedRow = { ...row };

    metrics.forEach((metric) => {
      const { field, aggregation, alias } = metric;
      const outputKey = alias || `${aggregation}_${field}`;

      if (aggregation === 'count') {
        processedRow[outputKey] = data.length;
      } else if (row[field] !== undefined && row[field] !== null) {
        const value = Number(row[field]) || 0;

        switch (aggregation) {
          case 'sum':
            processedRow[outputKey] = data.reduce(
              (acc, r) => acc + (Number(r[field]) || 0),
              0
            );
            break;
          case 'avg':
            processedRow[outputKey] =
              data.reduce((acc, r) => acc + (Number(r[field]) || 0), 0) /
              data.length;
            break;
          case 'min':
            processedRow[outputKey] = Math.min(
              ...data.map((r) => Number(r[field]) || 0)
            );
            break;
          case 'max':
            processedRow[outputKey] = Math.max(
              ...data.map((r) => Number(r[field]) || 0)
            );
            break;
          default:
            processedRow[outputKey] = value;
        }
      }
    });

    return processedRow;
  });
}

function groupData(data: any[], groupBy: string[]): any[] {
  if (!groupBy || groupBy.length === 0) return data;

  const groups = new Map<string, any[]>();

  data.forEach((row) => {
    const key = groupBy.map((field) => row[field]).join('|');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  });

  return Array.from(groups.entries()).map(([key, rows]) => {
    const keys = key.split('|');
    const groupedRow: any = {};

    groupBy.forEach((field, index) => {
      groupedRow[field] = keys[index];
    });

    // Aggregate numeric fields
    const firstRow = rows[0];
    Object.keys(firstRow).forEach((field) => {
      if (!groupBy.includes(field)) {
        const value = Number(firstRow[field]);
        if (!isNaN(value)) {
          groupedRow[field] = rows.reduce(
            (sum, row) => sum + (Number(row[field]) || 0),
            0
          );
        } else {
          groupedRow[field] = firstRow[field];
        }
      }
    });

    groupedRow._count = rows.length;

    return groupedRow;
  });
}

// =====================================================
// Pre-built Queries
// =====================================================

export const preBuiltQueries = {
  // CRM Queries
  totalContacts: (orgId: string) =>
    executeQuery(
      {
        dataSource: 'contacts',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'total' }],
      },
      orgId
    ),

  newContactsTrend: (orgId: string, timeRange: any) =>
    executeQuery(
      {
        dataSource: 'contacts',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'count' }],
        dimensions: ['created_at'],
        groupBy: ['created_at'],
        timeRange,
      },
      orgId
    ),

  dealsByStage: (orgId: string) =>
    executeQuery(
      {
        dataSource: 'deals',
        metrics: [
          { field: 'value', aggregation: 'sum', alias: 'total_value' },
          { field: 'id', aggregation: 'count', alias: 'count' },
        ],
        groupBy: ['stage_id'],
      },
      orgId
    ),

  pipelineValue: (orgId: string) =>
    executeQuery(
      {
        dataSource: 'deals',
        metrics: [
          { field: 'value', aggregation: 'sum', alias: 'pipeline_value' }
        ],
        filters: [
          { id: 'open_deals', field: 'status', operator: 'equals', value: 'open' }
        ],
      },
      orgId
    ),

  // Marketing Queries
  campaignsSent: (orgId: string, timeRange: any) =>
    executeQuery(
      {
        dataSource: 'marketing_campaigns',
        metrics: [
          { field: 'total_recipients', aggregation: 'sum', alias: 'total' },
          { field: 'sent_count', aggregation: 'sum', alias: 'sent' }
        ],
        timeRange,
      },
      orgId
    ),

  emailPerformance: (orgId: string, timeRange: any) =>
    executeQuery(
      {
        dataSource: 'marketing_logs',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'count' }],
        groupBy: ['status'],
        timeRange,
      },
      orgId
    ),

  topTemplates: (orgId: string, limit = 10) =>
    executeQuery(
      {
        dataSource: 'marketing_campaigns',
        metrics: [
          { field: 'sent_count', aggregation: 'sum', alias: 'total_sent' }
        ],
        groupBy: ['template_id'],
        orderBy: { field: 'sent_count', direction: 'desc' },
        limit,
      },
      orgId
    ),

  // Forms Queries
  formSubmissions: (orgId: string, timeRange: any) =>
    executeQuery(
      {
        dataSource: 'form_submissions',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'total' }],
        timeRange,
      },
      orgId
    ),

  formConversionRate: async (orgId: string, timeRange: any) => {
    const views = await executeQuery(
      {
        dataSource: 'pages',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'views' }],
        timeRange,
      },
      orgId
    );

    const submissions = await executeQuery(
      {
        dataSource: 'form_submissions',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'submissions' }],
        timeRange,
      },
      orgId
    );

    const viewsCount = (views.data[0]?.views as number) || 0;
    const submissionsCount = (submissions.data[0]?.submissions as number) || 0;

    return {
      data: [{
        views: viewsCount,
        submissions: submissionsCount,
        conversion_rate: viewsCount > 0 ? (submissionsCount / viewsCount) * 100 : 0
      }],
      metadata: submissions.metadata
    };
  },

  // Workflow Queries
  workflowExecutions: (orgId: string, timeRange: any) =>
    executeQuery(
      {
        dataSource: 'workflow_executions',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'total' }],
        timeRange,
      },
      orgId
    ),

  workflowSuccessRate: async (orgId: string, timeRange: any) => {
    const result = await executeQuery(
      {
        dataSource: 'workflow_executions',
        metrics: [{ field: 'id', aggregation: 'count', alias: 'count' }],
        groupBy: ['status'],
        timeRange,
      },
      orgId
    );

    const completed = (result.data.find((d: any) => d.status === 'completed')?.count as number) || 0;
    const failed = (result.data.find((d: any) => d.status === 'failed')?.count as number) || 0;
    const total = completed + failed;

    return {
      data: [{
        completed,
        failed,
        total,
        success_rate: total > 0 ? (completed / total) * 100 : 0
      }],
      metadata: result.metadata
    };
  },

  // Revenue Queries (placeholder - would need actual revenue table)
  monthlyRevenue: (orgId: string, timeRange: any) =>
    executeQuery(
      {
        dataSource: 'deals',
        metrics: [
          { field: 'value', aggregation: 'sum', alias: 'revenue' }
        ],
        dimensions: ['created_at'],
        groupBy: ['created_at'],
        filters: [
          { id: 'won_deals', field: 'status', operator: 'equals', value: 'won' }
        ],
        timeRange,
      },
      orgId
    ),
};
