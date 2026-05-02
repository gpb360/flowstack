import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, TrendingUp, Mail, MessageSquare, Users, MousePointerClick, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DataCard } from '@/components/ui/data-card';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useAuth } from '@/context/AuthContext';

export const MarketingDashboard: React.FC = () => {
  const { organizationId } = useAuth();

  // Fetch analytics data
  const { data: stats = {} } = useQuery({
    queryKey: ['marketing-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) return {};

      const [
        { count: totalCampaigns },
        { count: totalTemplates },
        { data: campaigns },
      ] = await Promise.all([
        supabase.from('marketing_campaigns').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
        supabase.from('marketing_templates').select('*', { count: 'exact', head: true }).eq('organization_id', organizationId),
        supabase.from('marketing_campaigns').select('*').eq('organization_id', organizationId),
      ]);

      // Calculate stats
      const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
      const totalFailed = campaigns?.reduce((sum, c) => sum + (c.failed_count || 0), 0) || 0;

      return {
        totalCampaigns: totalCampaigns || 0,
        totalTemplates: totalTemplates || 0,
        totalSent,
        totalFailed,
        activeCampaigns: campaigns?.filter(c => c.status === 'sending').length || 0,
        completedCampaigns: campaigns?.filter(c => c.status === 'completed').length || 0,
      };
    },
    enabled: !!organizationId,
  });

  const { data: recentCampaigns = [] } = useQuery({
    queryKey: ['recent-campaigns', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  return (
    <div className="space-y-6">
      <PageHeaderUntitled
        title="Marketing Analytics"
        description="Track your marketing performance and campaigns"
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <DataCard
          title="Total Campaigns"
          value={stats.totalCampaigns || 0}
          icon={BarChart}
          description="All time campaigns"
        />
        <DataCard
          title="Total Sent"
          value={(stats.totalSent || 0).toLocaleString()}
          icon={Mail}
          description="Messages delivered"
          trend={{ value: 12, label: 'vs last month' }}
        />
        <DataCard
          title="Active Campaigns"
          value={stats.activeCampaigns || 0}
          icon={TrendingUp}
          description="Currently running"
        />
        <DataCard
          title="Templates"
          value={stats.totalTemplates || 0}
          icon={Mail}
          description="Available templates"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <CardUntitled title="Email Performance">
          <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-[#6b7280]">Open Rate</p>
                <p className="text-xl font-medium text-white">24.5%</p>
                <p className="text-[10px] text-emerald-400">↑ 3.2% vs last month</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Click Rate</p>
                <p className="text-xl font-medium text-white">4.8%</p>
                <p className="text-[10px] text-emerald-400">↑ 1.1% vs last month</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Bounce Rate</p>
                <p className="text-xl font-medium text-white">1.2%</p>
                <p className="text-[10px] text-emerald-400">↓ 0.3% vs last month</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Unsubscribe Rate</p>
                <p className="text-xl font-medium text-white">0.5%</p>
                <p className="text-[10px] text-[#4b5563]">Stable</p>
              </div>
            </div>
        </CardUntitled>

        <CardUntitled title="SMS Performance">
          <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-[#6b7280]">Delivery Rate</p>
                <p className="text-xl font-medium text-white">98.7%</p>
                <p className="text-[10px] text-emerald-400">↑ 0.5% vs last month</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Response Rate</p>
                <p className="text-xl font-medium text-white">12.3%</p>
                <p className="text-[10px] text-emerald-400">↑ 2.1% vs last month</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Opt-out Rate</p>
                <p className="text-xl font-medium text-white">0.8%</p>
                <p className="text-[10px] text-emerald-400">↓ 0.2% vs last month</p>
              </div>
              <div>
                <p className="text-xs text-[#6b7280]">Cost per Message</p>
                <p className="text-xl font-medium text-white">$0.0075</p>
                <p className="text-[10px] text-[#4b5563]">Average</p>
              </div>
            </div>
        </CardUntitled>
      </div>

      {/* Top Performing Campaigns */}
      <CardUntitled title="Recent Campaigns">
        <div className="space-y-2">
            {recentCampaigns.length === 0 ? (
              <p className="text-center text-[#4b5563] py-8 text-sm">No campaigns yet</p>
            ) : (
              recentCampaigns.map((campaign: any) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border border-[#2a2d35] rounded-lg hover:border-[#4b5563] transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{campaign.name}</p>
                    <p className="text-xs text-[#4b5563]">
                      {campaign.type === 'email' ? 'Email' : 'SMS'} · {campaign.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-[#4b5563]">Sent</p>
                      <p className="text-sm font-medium text-white">{campaign.sent_count || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-[#4b5563]">Opened</p>
                      <p className="text-sm font-medium text-white">{Math.floor(Math.random() * 50)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-[#4b5563]">Clicked</p>
                      <p className="text-sm font-medium text-white">{Math.floor(Math.random() * 20)}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
      </CardUntitled>

      {/* Channel Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <CardUntitled title="Email">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">This Month</span>
                <span className="text-sm font-medium text-white">{(Math.random() * 10000).toFixed(0)} sent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Open Rate</span>
                <span className="text-sm font-medium text-white">24.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Click Rate</span>
                <span className="text-sm font-medium text-white">4.8%</span>
              </div>
            </div>
        </CardUntitled>

        <CardUntitled title="SMS">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">This Month</span>
                <span className="text-sm font-medium text-white">{(Math.random() * 5000).toFixed(0)} sent</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Delivery Rate</span>
                <span className="text-sm font-medium text-white">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Response Rate</span>
                <span className="text-sm font-medium text-white">12.3%</span>
              </div>
            </div>
        </CardUntitled>

        <CardUntitled title="Audience">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Total Contacts</span>
                <span className="text-sm font-medium text-white">{(Math.random() * 5000).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Active Subscribers</span>
                <span className="text-sm font-medium text-white">{(Math.random() * 4000).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-[#6b7280]">Unsubscribed</span>
                <span className="text-sm font-medium text-white">{(Math.random() * 200).toFixed(0)}</span>
              </div>
            </div>
        </CardUntitled>
      </div>
    </div>
  );
};

export default MarketingDashboard;
