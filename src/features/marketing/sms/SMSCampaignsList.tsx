import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, MessageSquare, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { PageHeader } from '@/components/ui/page-header';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row'] & Record<string, any>;

export const SMSCampaignsList: React.FC = () => {
  const { organizationId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['marketing-campaigns', 'sms', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('type', 'sms')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Campaign>[] = [
    {
      id: 'name',
      header: 'Campaign Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <Link
            to={`/marketing/sms/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Date(row.original.created_at).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <BadgeUntitled variant="outline">{row.original.status}</BadgeUntitled>,
    },
    {
      id: 'scheduled_at',
      header: 'Scheduled',
      accessorKey: 'scheduled_at',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.scheduled_at
            ? new Date(row.original.scheduled_at).toLocaleString()
            : '-'}
        </span>
      ),
    },
    {
      id: 'recipients',
      header: 'Recipients',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.total_recipients.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'sent_count',
      header: 'Sent',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.sent_count.toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SMS Campaigns"
        description="Create and manage your SMS marketing campaigns"
        actions={
          <Link to="/marketing/sms/new">
            <ButtonUntitled variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              New SMS Campaign
            </ButtonUntitled>
          </Link>
        }
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <InputUntitled
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        data={filteredCampaigns}
        columns={columns}
        filterable={false}
        emptyMessage={isLoading ? 'Loading campaigns...' : 'No campaigns found'}
        onRowClick={(row) => (window.location.href = `/marketing/sms/${row.id}`)}
      />
    </div>
  );
};

export default SMSCampaignsList;
