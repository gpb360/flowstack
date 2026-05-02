import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { PageHeader } from '@/components/ui/page-header';
import type { Database } from '@/types/database.types';
import { useAuth } from '@/context/AuthContext';

type Template = Database['public']['Tables']['marketing_templates']['Row'] & Record<string, any>;

export const TemplatesList: React.FC = () => {
  const { organizationId } = useAuth();
  const [typeFilter, setTypeFilter] = useState<'all' | 'email' | 'sms'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['marketing-templates', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_templates')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Table columns
  const columns: ColumnDef<Template>[] = [
    {
      id: 'name',
      header: 'Template Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <Link
            to={`/marketing/templates/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.subject && (
            <p className="text-sm text-muted-foreground">{row.original.subject}</p>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => (
        <BadgeUntitled variant={row.original.type === 'email' ? 'primary' : 'secondary'}>
          {row.original.type === 'email' ? (
            <>
              <Mail className="mr-1 h-3 w-3" />
              Email
            </>
          ) : (
            <>
              <MessageSquare className="mr-1 h-3 w-3" />
              SMS
            </>
          )}
        </BadgeUntitled>
      ),
    },
    {
      id: 'created_at',
      header: 'Created',
      accessorKey: 'created_at',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'variables',
      header: 'Variables',
      cell: ({ row }) => {
        const variables = row.original.variables as any[];
        return (
          <div className="flex gap-1 flex-wrap">
            {variables?.slice(0, 3).map((v: any, i: number) => (
              <BadgeUntitled key={i} variant="outline" className="text-xs">
                {v.name}
              </BadgeUntitled>
            ))}
            {variables?.length > 3 && (
              <BadgeUntitled variant="outline" className="text-xs">
                +{variables.length - 3}
              </BadgeUntitled>
            )}
          </div>
        );
      },
    },
  ];

  const stats = {
    total: templates.length,
    email: templates.filter(t => t.type === 'email').length,
    sms: templates.filter(t => t.type === 'sms').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Manage your email and SMS templates"
        actions={
          <Link to="/marketing/templates/new">
            <ButtonUntitled variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </ButtonUntitled>
          </Link>
        }
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.email}</p>
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">SMS</p>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.sms}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <InputUntitled
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <ButtonUntitled
            variant={typeFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('all')}
          >
            All
          </ButtonUntitled>
          <ButtonUntitled
            variant={typeFilter === 'email' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('email')}
          >
            Email
          </ButtonUntitled>
          <ButtonUntitled
            variant={typeFilter === 'sms' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTypeFilter('sms')}
          >
            SMS
          </ButtonUntitled>
        </div>
      </div>

      {/* Templates Table */}
      <DataTable
        data={filteredTemplates}
        columns={columns}
        filterable={false}
        sortable={false}
        onRowClick={(row) => (window.location.href = `/marketing/templates/${row.id}`)}
        emptyMessage={isLoading ? 'Loading templates...' : 'No templates found'}
        actions={(row) => [
          {
            label: 'Edit',
            onClick: () => (window.location.href = `/marketing/templates/${row.id}`),
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

export default TemplatesList;
