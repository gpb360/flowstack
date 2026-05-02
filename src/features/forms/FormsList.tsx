/**
 * FormsList Component
 * List all forms with actions
 */

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react';

export function FormsList() {
  const navigate = useNavigate();

  const { data: forms = [], isLoading } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value: string) => (
        <BadgeUntitled
          variant={
            value === 'active'
              ? 'success'
              : value === 'draft'
              ? 'warning'
              : 'secondary'
          }
        >
          {value}
        </BadgeUntitled>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_: string, row: any) => (
        <div className="flex gap-2">
          <ButtonUntitled
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/forms/${row.id}`)}
          >
            <Edit className="h-4 w-4" />
          </ButtonUntitled>
          <ButtonUntitled
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/forms/${row.id}/submissions`)}
          >
            <BarChart3 className="h-4 w-4" />
          </ButtonUntitled>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">All Forms</h2>
        <p className="text-text-secondary">
          Create and manage your forms
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-text-secondary mb-4">No forms created yet</p>
          <ButtonUntitled onClick={() => navigate('/forms/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Form
          </ButtonUntitled>
        </div>
      ) : (
        <DataTableUntitled columns={columns} data={forms} />
      )}
    </div>
  );
}
