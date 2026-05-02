import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Mail, Calendar, Filter, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { PageHeader } from '@/components/ui/page-header';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row'] & Record<string, any>;
type CampaignStatus = Campaign['status'];

export const EmailCampaignsList: React.FC = () => {
  const { organizationId } = useAuth();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['marketing-campaigns', 'email', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('type', 'email')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  // Filter campaigns
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Status badge variants
  const getStatusVariant = (status: CampaignStatus) => {
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
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Table columns
  const columns: ColumnDef<Campaign>[] = [
    {
      id: 'name',
      header: 'Campaign Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <Link
            to={`/marketing/email/${row.original.id}`}
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
      cell: ({ row }) => (
        <BadgeUntitled variant={getStatusVariant(row.original.status)}>
          {row.original.status}
        </BadgeUntitled>
      ),
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
        <span className="text-sm">
          {row.original.sent_count.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'failed_count',
      header: 'Failed',
      cell: ({ row }) => (
        <span className="text-sm text-destructive">
          {row.original.failed_count.toLocaleString()}
        </span>
      ),
    },
  ];

  // Quick stats
  const stats = {
    total: campaigns.length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    active: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Campaigns"
        description="Create and manage your email marketing campaigns"
        actions={
          <Link to="/marketing/email/new">
            <ButtonUntitled variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </ButtonUntitled>
          </Link>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Draft</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.draft}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active</p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <InputUntitled
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <ButtonUntitled
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'draft' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Draft
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'sending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('sending')}
          >
            Sending
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </ButtonUntitled>
        </div>
      </div>

      {/* Campaigns Table */}
      <DataTable
        data={filteredCampaigns}
        columns={columns}
        filterable={false}
        sortable={false}
        onRowClick={(row) => (window.location.href = `/marketing/email/${row.id}`)}
        emptyMessage={isLoading ? 'Loading campaigns...' : 'No campaigns found'}
        actions={(row) => [
          {
            label: 'View',
            onClick: () => (window.location.href = `/marketing/email/${row.id}`),
          },
          {
            label: 'Duplicate',
            onClick: () => console.log('Duplicate', row.id),
          },
          {
            label: 'Delete',
            onClick: () => console.log('Delete', row.id),
            variant: 'destructive',
          },
        ]}
      />
    </div>
  );
};

export default EmailCampaignsList;
