import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, MousePointerClick, Eye, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { DataCard } from '@/components/ui/data-card';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row'] & Record<string, any>;
type Log = Database['public']['Tables']['marketing_logs']['Row'] & Record<string, any>;

export const EmailCampaignDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { organizationId } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'recipients' | 'analytics'>('overview');

  // Fetch campaign
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['marketing-campaign', id, organizationId],
    queryFn: async () => {
      if (!id) throw new Error('Campaign ID is required');
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('id', id)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!organizationId,
  });

  // Fetch logs
  const { data: logs = [] } = useQuery({
    queryKey: ['marketing-logs', id, organizationId],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('marketing_logs')
        .select('*, contacts(*)')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!organizationId,
  });

  // Calculate stats
  const stats = {
    sent: logs.filter(l => l.status === 'sent').length,
    delivered: logs.filter(l => l.status === 'delivered').length,
    opened: logs.filter(l => l.status === 'opened').length,
    clicked: logs.filter(l => l.status === 'clicked').length,
    failed: logs.filter(l => l.status === 'failed').length,
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
  const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : '0';
  const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : '0';

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      case 'sending':
        return 'primary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const logColumns: ColumnDef<Log>[] = [
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const contact = row.original as any;
        return (
          <div>
            <p className="font-medium">{contact.contacts?.email || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">
              {contact.contacts?.first_name} {contact.contacts?.last_name}
            </p>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <BadgeUntitled variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </BadgeUntitled>
      ),
    },
    {
      id: 'sent_at',
      header: 'Sent At',
      accessorKey: 'sent_at',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.sent_at
            ? new Date(row.original.sent_at).toLocaleString()
            : '-'}
        </span>
      ),
    },
    {
      id: 'error',
      header: 'Error',
      accessorKey: 'error_message',
      cell: ({ row }) => (
        row.original.error_message ? (
          <span className="text-sm text-destructive">
            {row.original.error_message}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ButtonUntitled
            variant="ghost"
            size="icon"
            onClick={() => navigate('/marketing/email')}
          >
            <ArrowLeft className="h-4 w-4" />
          </ButtonUntitled>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-sm text-muted-foreground">
              Email Campaign • <BadgeUntitled variant={getStatusVariant(campaign.status)}>{campaign.status}</BadgeUntitled>
            </p>
          </div>
        </div>
      </div>

      <TabsWithContent
        activeTab={activeTab}
        onTabChange={(v) => setActiveTab(v as any)}
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                  <DataCard
                    title="Sent"
                    value={stats.sent.toLocaleString()}
                    icon={Mail}
                    description="Emails sent"
                  />
                  <DataCard
                    title="Delivered"
                    value={stats.delivered.toLocaleString()}
                    icon={Mail}
                    trend={{ value: parseFloat(deliveryRate), label: 'delivery rate' }}
                    description={deliveryRate + '% delivery rate'}
                  />
                  <DataCard
                    title="Opened"
                    value={stats.opened.toLocaleString()}
                    icon={Eye}
                    trend={{ value: parseFloat(openRate), label: 'open rate' }}
                    description={openRate + '% open rate'}
                  />
                  <DataCard
                    title="Clicked"
                    value={stats.clicked.toLocaleString()}
                    icon={MousePointerClick}
                    trend={{ value: parseFloat(clickRate), label: 'click rate' }}
                    description={clickRate + '% click rate'}
                  />
                  <DataCard
                    title="Failed"
                    value={stats.failed.toLocaleString()}
                    icon={AlertCircle}
                    description="Failed deliveries"
                  />
                </div>

                {/* Campaign Info */}
                <CardUntitled>
                  <CardHeader>
                    <CardTitle>Campaign Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">
                          {new Date(campaign.created_at).toLocaleString()}
                        </p>
                      </div>
                      {campaign.scheduled_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Scheduled</p>
                          <p className="font-medium">
                            {new Date(campaign.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {campaign.started_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Started</p>
                          <p className="font-medium">
                            {new Date(campaign.started_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {campaign.completed_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">Completed</p>
                          <p className="font-medium">
                            {new Date(campaign.completed_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </CardUntitled>
              </div>
            ),
          },
          {
            id: 'recipients',
            label: 'Recipients',
            content: (
              <DataTable
                data={logs}
                columns={logColumns}
                filterable={true}
                emptyMessage="No recipients found"
              />
            ),
          },
          {
            id: 'analytics',
            label: 'Analytics',
            content: (
              <div className="space-y-6">
                <CardUntitled>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Delivery Rate</span>
                          <span className="text-sm">{deliveryRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: deliveryRate + '%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Open Rate</span>
                          <span className="text-sm">{openRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: openRate + '%' }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Click Rate</span>
                          <span className="text-sm">{clickRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: clickRate + '%' }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CardUntitled>

                <CardUntitled>
                  <CardHeader>
                    <CardTitle>Delivery Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Successfully delivered</span>
                        <span className="text-sm font-medium text-green-600">
                          {stats.delivered.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pending</span>
                        <span className="text-sm font-medium text-yellow-600">
                          {(stats.sent - stats.delivered - stats.failed).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Failed</span>
                        <span className="text-sm font-medium text-red-600">
                          {stats.failed.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </CardUntitled>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default EmailCampaignDetail;
