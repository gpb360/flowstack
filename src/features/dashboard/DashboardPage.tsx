import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchCRMMetrics } from '@/features/crm/lib/supabase';
import {
  Users,
  Building2,
  TrendingUp,
  Activity,
  Workflow,
  Download,
  Plus,
  ArrowRight,
  DollarSign,
  Clock,
} from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled, MetricCardUntitled, MetricGrid } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// ============================================================================
// Data Hooks
// ============================================================================

function useDashboardMetrics() {
  const { currentOrganization } = useAuth();
  return useQuery({
    queryKey: ['dashboard-metrics', currentOrganization?.id],
    queryFn: () => {
      if (!currentOrganization?.id) return null;
      return fetchCRMMetrics(currentOrganization.id);
    },
    enabled: !!currentOrganization?.id,
    staleTime: 30 * 1000,
  });
}

function useRecentActivities(limit = 10) {
  const { currentOrganization } = useAuth();
  return useQuery({
    queryKey: ['dashboard-activities', currentOrganization?.id, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      const { data, error } = await (supabase
        .from('activities')
        .select('*, user_profiles(full_name, avatar_url)')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit) as any);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 15 * 1000,
  });
}

function useActiveWorkflows() {
  const { currentOrganization } = useAuth();
  return useQuery({
    queryKey: ['dashboard-workflows', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      const { data, error } = await (supabase
        .from('workflows')
        .select('id, name, status, created_at, updated_at')
        .eq('organization_id', currentOrganization.id)
        .order('updated_at', { ascending: false })
        .limit(5) as any);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 30 * 1000,
  });
}

function useRecentDeals(limit = 5) {
  const { currentOrganization } = useAuth();
  return useQuery({
    queryKey: ['dashboard-recent-deals', currentOrganization?.id, limit],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];
      const { data, error } = await (supabase
        .from('deals')
        .select('id, name, value, status, created_at, contacts(first_name, last_name)')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(limit) as any);
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
    staleTime: 15 * 1000,
  });
}

// ============================================================================
// Formatting Helpers
// ============================================================================

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'note': return Activity;
    case 'call': return Clock;
    case 'email': return DollarSign;
    case 'deal_created': return TrendingUp;
    case 'contact_created': return Users;
    default: return Activity;
  }
}

function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' {
  switch (status) {
    case 'won': return 'success';
    case 'lost': return 'error';
    case 'open': return 'info';
    case 'negotiation': return 'warning';
    default: return 'info';
  }
}

function getWorkflowStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' {
  switch (status) {
    case 'active': return 'success';
    case 'paused': return 'warning';
    case 'draft': return 'info';
    default: return 'info';
  }
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="h-8 w-48 bg-surface-hover rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-surface border border-border rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-surface border border-border rounded-lg animate-pulse" />
            <div className="h-80 bg-surface border border-border rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Dashboard Page
// ============================================================================

export const DashboardPage = () => {
  const { metrics, activities: activitiesData, workflows, recentDeals } = {
    metrics: useDashboardMetrics(),
    activities: useRecentActivities(10),
    workflows: useActiveWorkflows(),
    recentDeals: useRecentDeals(5),
  };

  const isLoading = metrics.isLoading || activitiesData.isLoading;

  if (isLoading) return <DashboardSkeleton />;

  const m = metrics.data;
  const activities = activitiesData.data || [];
  const wfList = workflows.data || [];
  const deals = recentDeals.data || [];

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <PageHeaderUntitled
            title="Dashboard"
            description="Welcome back! Here's what's happening with your business today."
            icon={Activity}
            actions={
              <div className="flex items-center gap-2">
                <ButtonUntitled variant="secondary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Export
                </ButtonUntitled>
              </div>
            }
          />

          {/* Metric Cards */}
          <MetricGrid cols={4} gap="md">
            <MetricCardUntitled
              title="Total Contacts"
              value={formatNumber(m?.totalContacts || 0)}
              icon={Users}
              color="primary"
            />
            <MetricCardUntitled
              title="Total Companies"
              value={formatNumber(m?.totalCompanies || 0)}
              icon={Building2}
              color="success"
            />
            <MetricCardUntitled
              title="Open Deals"
              value={formatNumber(m?.openDeals || 0)}
              subtitle={m?.totalValue ? `Pipeline: ${formatCurrency(m.totalValue)}` : undefined}
              icon={TrendingUp}
              color="warning"
            />
            <MetricCardUntitled
              title="Active Workflows"
              value={wfList.filter(w => w.status === 'active').length.toString()}
              subtitle={`${wfList.length} total`}
              icon={Workflow}
              color="info"
            />
          </MetricGrid>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Deals */}
            <CardUntitled
              title="Recent Deals"
              description="Latest deals in your pipeline"
              footer={
                <Link to="/dashboard/crm/deals">
                  <ButtonUntitled variant="tertiary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All Deals
                  </ButtonUntitled>
                </Link>
              }
            >
              {deals.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-text-muted">No deals yet</p>
                  <Link to="/dashboard/crm/deals">
                    <ButtonUntitled variant="primary" size="sm" className="mt-2">
                      Create First Deal
                    </ButtonUntitled>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal: any) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 hover:bg-surface-hover rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{deal.name}</p>
                        <p className="text-xs text-text-muted">
                          {deal.contacts?.first_name} {deal.contacts?.last_name} · {timeAgo(deal.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-text-primary">
                          {formatCurrency(deal.value || 0)}
                        </span>
                        <BadgeUntitled variant={getStatusVariant(deal.status)}>
                          {deal.status || 'open'}
                        </BadgeUntitled>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardUntitled>

            {/* Active Workflows */}
            <CardUntitled
              title="Workflows"
              description="Your automation workflows"
              footer={
                <Link to="/dashboard/workflows">
                  <ButtonUntitled variant="tertiary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View All Workflows
                  </ButtonUntitled>
                </Link>
              }
            >
              {wfList.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-text-muted">No workflows yet</p>
                  <Link to="/dashboard/workflows/new">
                    <ButtonUntitled variant="primary" size="sm" className="mt-2" leftIcon={<Plus className="w-4 h-4" />}>
                      Create Workflow
                    </ButtonUntitled>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {wfList.map((wf: any) => (
                    <div key={wf.id} className="flex items-center justify-between p-3 hover:bg-surface-hover rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{wf.name}</p>
                        <p className="text-xs text-text-muted">
                          Updated {timeAgo(wf.updated_at)}
                        </p>
                      </div>
                      <BadgeUntitled variant={getWorkflowStatusVariant(wf.status)}>
                        {wf.status || 'draft'}
                      </BadgeUntitled>
                    </div>
                  ))}
                </div>
              )}
            </CardUntitled>
          </div>

          {/* Recent Activity */}
          <CardUntitled
            title="Recent Activity"
            description={`Last 30 days: ${m?.recentActivities || 0} activities`}
            footer={
              <Link to="/dashboard/crm/activities">
                <ButtonUntitled variant="tertiary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Activity
                </ButtonUntitled>
              </Link>
            }
          >
            {activities.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-text-muted">No recent activity</p>
                <p className="text-xs text-text-muted mt-1">Activity will appear as you create contacts, deals, and notes</p>
              </div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity: any) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-surface-active text-text-muted">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary">
                          {activity.title || activity.description || activity.type}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-text-muted">{timeAgo(activity.created_at)}</p>
                          {activity.user_profiles?.full_name && (
                            <span className="text-xs text-text-muted">
                              · {activity.user_profiles.full_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardUntitled>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/dashboard/crm/contacts">
              <ButtonUntitled variant="secondary" size="md" className="w-full justify-start gap-3" leftIcon={<Users className="w-4 h-4" />}>
                Add Contact
              </ButtonUntitled>
            </Link>
            <Link to="/dashboard/crm/deals">
              <ButtonUntitled variant="secondary" size="md" className="w-full justify-start gap-3" leftIcon={<TrendingUp className="w-4 h-4" />}>
                New Deal
              </ButtonUntitled>
            </Link>
            <Link to="/dashboard/workflows/new">
              <ButtonUntitled variant="secondary" size="md" className="w-full justify-start gap-3" leftIcon={<Workflow className="w-4 h-4" />}>
                Create Workflow
              </ButtonUntitled>
            </Link>
            <Link to="/dashboard/sites">
              <ButtonUntitled variant="secondary" size="md" className="w-full justify-start gap-3" leftIcon={<Plus className="w-4 h-4" />}>
                Build Page
              </ButtonUntitled>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
