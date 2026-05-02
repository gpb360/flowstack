// @ts-nocheck
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

export function CampaignsList() {
  // Mock data - replace with actual hook
  const campaigns = [
    {
      id: '1',
      name: 'Summer Sale',
      description: 'Promote summer discounts across all platforms',
      status: 'active',
      posts_count: 15,
      scheduled_count: 10,
      published_count: 5,
      created_at: new Date('2024-06-01'),
    },
    {
      id: '2',
      name: 'Product Launch',
      description: 'Tease and launch new product',
      status: 'draft',
      posts_count: 8,
      scheduled_count: 0,
      published_count: 0,
      created_at: new Date('2024-06-15'),
    },
  ];

  const columns = [
    {
      id: 'name',
      header: 'Campaign',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-text-secondary">{row.description}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: any) => {
        const statusColors: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          draft: 'bg-gray-100 text-gray-800',
          paused: 'bg-yellow-100 text-yellow-800',
          completed: 'bg-[#D4AF37]/10 text-[#D4AF37]',
        };

        return (
          <Badge className={statusColors[row.status] || 'bg-gray-100'}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      id: 'posts',
      header: 'Posts',
      cell: (row: any) => (
        <div className="text-sm">
          <div>Total: {row.posts_count}</div>
          <div className="text-text-secondary">
            {row.scheduled_count} scheduled, {row.published_count} published
          </div>
        </div>
      ),
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: (row: any) => format(new Date(row.created_at), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Campaigns"
        description="Organize and track your social media campaigns"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {campaigns.length === 0 ? (
              <EmptyState
                icon={Plus}
                title="No campaigns yet"
                description="Create campaigns to organize your social media content"
                action={{
                  label: 'Create Campaign',
                  onClick: () => {},
                }}
              />
            ) : (
              <DataTable
                columns={columns}
                data={campaigns}
                pagination
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
