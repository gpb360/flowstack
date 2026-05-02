/**
 * Workflows List Component
 * Displays all workflows with filtering and actions
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreVertical, Play, Pause, Trash2, Copy, Edit } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { supabase } from '@/lib/supabase';
import { triggerManualExecution } from '@/lib/workflows/triggers';
import { useToast } from '@/components/ui/toast';

export const WorkflowsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [deleteDialog, setDeleteDialog] = React.useState<string | null>(null);
  const [runningWorkflowId, setRunningWorkflowId] = React.useState<string | null>(null);
  const { addToast } = useToast();

  const { data: workflows, isLoading, refetch } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (workflowId: string) => {
    const { error } = await (supabase
      .from('workflows') as any)
      .delete()
      .eq('id', workflowId);

    if (error) {
      console.error('Failed to delete workflow:', error);
    } else {
      setDeleteDialog(null);
      refetch();
    }
  };

  const handleDuplicate = async (workflow: any) => {
    const { error } = await (supabase
      .from('workflows') as any)
      .insert({
        name: `${workflow.name} (Copy)`,
        description: workflow.description,
        status: 'draft',
        nodes: workflow.nodes,
        edges: workflow.edges,
        organization_id: workflow.organization_id,
      });

    if (error) {
      console.error('Failed to duplicate workflow:', error);
    } else {
      refetch();
    }
  };

  const handleToggleStatus = async (workflow: any) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    const { error } = await (supabase
      .from('workflows') as any)
      .update({ status: newStatus })
      .eq('id', workflow.id);

    if (error) {
      console.error('Failed to update workflow status:', error);
      addToast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      refetch();
    }
  };

  const handleRunWorkflow = async (workflowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRunningWorkflowId(workflowId);
    try {
      await triggerManualExecution(workflowId);
      addToast({
        title: 'Workflow triggered',
        description: 'Execution started. Check the logs for results.',
        variant: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Failed to trigger workflow',
        description: err.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setRunningWorkflowId(null);
    }
  };

  // Filter workflows
  const filteredWorkflows = workflows?.filter((workflow: any) => {
    const matchesSearch =
      searchQuery === '' ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (workflow.description && workflow.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
          <p className="text-sm text-gray-500 mt-1">
            Automate your business processes with visual workflows
          </p>
        </div>
        <ButtonUntitled variant="primary" onClick={() => navigate('/workflows/new')}>
          <Plus size={16} className="mr-2" />
          New Workflow
        </ButtonUntitled>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <InputUntitled
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant={statusFilter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({workflows?.length || 0})
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'active' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'paused' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('paused')}
          >
            Paused
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'draft' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('draft')}
          >
            Draft
          </ButtonUntitled>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <EmptyStateUntitled
          title="No workflows found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Get started by creating your first workflow'
          }
          action={
            !searchQuery && statusFilter === 'all' ? (
              <ButtonUntitled variant="primary" onClick={() => navigate('/workflows/new')}>
                <Plus size={16} className="mr-2" />
                Create Workflow
              </ButtonUntitled>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow: any) => (
            <div
              key={workflow.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/workflows/${workflow.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {workflow.name}
                  </h3>
                  {workflow.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {workflow.description}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors">
                      <MoreVertical size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/workflows/${workflow.id}`); }}>
                      <Edit size={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    {workflow.status === 'active' && (
                      <DropdownMenuItem
                        onClick={(e) => handleRunWorkflow(workflow.id, e)}
                        disabled={runningWorkflowId === workflow.id}
                      >
                        <Play size={14} className="mr-2" />
                        {runningWorkflowId === workflow.id ? 'Running...' : 'Run Now'}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleStatus(workflow); }}>
                      {workflow.status === 'active' ? (
                        <>
                          <Pause size={14} className="mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={14} className="mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(workflow); }}>
                      <Copy size={14} className="mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); setDeleteDialog(workflow.id); }}
                      className="text-red-600"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between">
                <BadgeUntitled
                  variant={
                    workflow.status === 'active'
                      ? 'success'
                      : workflow.status === 'paused'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {workflow.status}
                </BadgeUntitled>

                <div className="text-xs text-gray-500">
                  {workflow.nodes?.length || 0} nodes
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                Last updated: {new Date(workflow.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workflow?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workflow? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
