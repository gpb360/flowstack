import React from 'react';
import { Plus, Search, Filter, Mail, MessageSquare, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';

// Mock data for now
const CAMPAIGNS = [
  { id: '1', name: 'Welcome Series', type: 'email', status: 'active', sent: 1240, openRate: '45%' },
  { id: '2', name: 'Black Friday Blast', type: 'sms', status: 'completed', sent: 5000, openRate: 'N/A' },
  { id: '3', name: 'Newsletter - Jan', type: 'email', status: 'draft', sent: 0, openRate: '-' },
];

export const CampaignList: React.FC = () => {
  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }: { row: any }) => (
        <div>
          <div className="font-medium text-text-primary">{row.name}</div>
          <div className="text-xs text-text-muted">ID: {row.id}</div>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row }: { row: any }) => (
        <BadgeUntitled
          variant={row.type === 'email' ? 'primary' : 'success'}
          icon={row.type === 'email' ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
        >
          {row.type}
        </BadgeUntitled>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const statusConfig: Record<string, { variant: any; label: string }> = {
          active: { variant: 'success', label: 'Active' },
          draft: { variant: 'default', label: 'Draft' },
          completed: { variant: 'outline', label: 'Completed' },
        };
        const config = statusConfig[row.status] || { variant: 'default', label: row.status };
        return <BadgeUntitled variant={config.variant}>{config.label}</BadgeUntitled>;
      },
    },
    {
      id: 'sent',
      header: 'Sent',
      cell: ({ row }: { row: any }) => <span className="text-text-secondary">{row.sent.toLocaleString()}</span>,
    },
    {
      id: 'performance',
      header: 'Performance',
      cell: ({ row }: { row: any }) => <span className="text-text-secondary">{row.openRate}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <ButtonUntitled
          variant="tertiary"
          size="sm"
          onClick={() => console.log('Edit campaign:', row.id)}
        >
          Edit
        </ButtonUntitled>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Page Header */}
      <PageHeaderUntitled
        title="Campaigns"
        description="Manage your email and SMS campaigns"
        icon={Send}
        actions={
          <Link to="new">
            <ButtonUntitled variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              New Campaign
            </ButtonUntitled>
          </Link>
        }
      />

      {/* Actions Bar */}
      <div className="flex items-center gap-4">
        <InputUntitled
          type="text"
          placeholder="Search campaigns..."
          leftIcon={<Search className="w-4 h-4" />}
          className="max-w-sm"
        />

        <ButtonUntitled
          variant="secondary"
          size="md"
          leftIcon={<Filter className="w-4 h-4" />}
        >
          Filter
        </ButtonUntitled>
      </div>

      {/* Campaign Table */}
      <div className="flex-1">
        <DataTableUntitled
          columns={columns}
          data={CAMPAIGNS}
          getRowId={(campaign) => campaign.id}
        />
      </div>
    </div>
  );
};
