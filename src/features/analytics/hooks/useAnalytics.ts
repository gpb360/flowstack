import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { executeQuery, preBuiltQueries } from '../lib/queries';
import type {
  AnalyticsQuery,
  TimeRange,
  Filter,
} from '../types';

// =====================================================
// Main Analytics Hook
// =====================================================

export function useAnalytics(
  query: AnalyticsQuery,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();

  const result = useQuery({
    queryKey: ['analytics', organizationId, query],
    queryFn: () => executeQuery(query, organizationId!),
    enabled: options?.enabled !== false && !!organizationId,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime || 60000, // 1 minute default
  });

  // Invalidate and refetch
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['analytics', organizationId] });
  };

  return {
    ...result,
    refetch,
  };
}

// =====================================================
// Pre-built Query Hooks
// =====================================================

export function useTotalContacts(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'totalContacts', organizationId, timeRange],
    queryFn: () => preBuiltQueries.totalContacts(organizationId!),
    enabled: !!organizationId,
    staleTime: 300000, // 5 minutes
  });
}

export function useNewContactsTrend(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'newContactsTrend', organizationId, timeRange],
    queryFn: () => preBuiltQueries.newContactsTrend(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useDealsByStage() {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'dealsByStage', organizationId],
    queryFn: () => preBuiltQueries.dealsByStage(organizationId!),
    enabled: !!organizationId,
    staleTime: 300000,
  });
}

export function usePipelineValue() {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'pipelineValue', organizationId],
    queryFn: () => preBuiltQueries.pipelineValue(organizationId!),
    enabled: !!organizationId,
    staleTime: 300000,
  });
}

export function useCampaignsSent(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'campaignsSent', organizationId, timeRange],
    queryFn: () => preBuiltQueries.campaignsSent(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useEmailPerformance(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'emailPerformance', organizationId, timeRange],
    queryFn: () => preBuiltQueries.emailPerformance(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useTopTemplates(limit = 10) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'topTemplates', organizationId, limit],
    queryFn: () => preBuiltQueries.topTemplates(organizationId!, limit),
    enabled: !!organizationId,
    staleTime: 300000,
  });
}

export function useFormSubmissions(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'formSubmissions', organizationId, timeRange],
    queryFn: () => preBuiltQueries.formSubmissions(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useFormConversionRate(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'formConversionRate', organizationId, timeRange],
    queryFn: () => preBuiltQueries.formConversionRate(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useWorkflowExecutions(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'workflowExecutions', organizationId, timeRange],
    queryFn: () => preBuiltQueries.workflowExecutions(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useWorkflowSuccessRate(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'workflowSuccessRate', organizationId, timeRange],
    queryFn: () => preBuiltQueries.workflowSuccessRate(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

export function useMonthlyRevenue(timeRange?: TimeRange) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['analytics', 'monthlyRevenue', organizationId, timeRange],
    queryFn: () => preBuiltQueries.monthlyRevenue(organizationId!, timeRange),
    enabled: !!organizationId && !!timeRange,
    staleTime: 300000,
  });
}

// =====================================================
// Custom Query Hook
// =====================================================

export function useCustomQuery(
  dataSource: string,
  metrics: any[],
  options?: {
    dimensions?: string[];
    filters?: Filter[];
    groupBy?: string[];
    timeRange?: TimeRange;
    limit?: number;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const { organizationId } = useAuth();

  const query: AnalyticsQuery = {
    dataSource,
    metrics,
    dimensions: options?.dimensions,
    filters: options?.filters,
    groupBy: options?.groupBy,
    timeRange: options?.timeRange,
    limit: options?.limit,
    orderBy: options?.orderBy,
  };

  return useAnalytics(query, {
    enabled: options?.enabled !== false && !!organizationId,
    refetchInterval: options?.refetchInterval,
  });
}

// =====================================================
// Real-time Subscription Hook
// =====================================================

export function useRealtimeMetric(
  tableName: string,
  metric: string,
  options?: {
    enabled?: boolean;
    callback?: (value: number) => void;
  }
) {
  const { organizationId } = useAuth();
  const [value, setValue] = React.useState<number>(0);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!organizationId || options?.enabled === false) return;

    const channel = supabase
      .channel(`realtime-metric-${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `organization_id=eq.${organizationId}`,
        },
        (payload) => {
          console.log('Realtime update:', payload);
          // In a real implementation, you would recalculate the metric here
          // For now, we just trigger a refetch
          setValue((prev) => prev + 1);
          options?.callback?.(value);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, tableName, metric, options?.enabled]);

  return { value, isConnected };
}
