/**
 * Workflow Builder Page
 * Container for the workflow canvas with database integration
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkflowCanvas } from './canvas';
import { useWorkflowStore } from './useWorkflowStore';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';

export const WorkflowBuilderPage = () => {
  const { workflowId } = useParams<{ workflowId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { loadWorkflow, resetWorkflow, exportWorkflow } = useWorkflowStore();
  const { currentOrganization } = useAuth();
  const { addToast } = useToast();

  // Load workflow if editing
  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: async () => {
      if (!workflowId || workflowId === 'new') return null;

      const { data, error } = await (supabase
        .from('workflows') as any)
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!workflowId && workflowId !== 'new',
  });

  useEffect(() => {
    if (workflow) {
      loadWorkflow(workflow);
    } else if (workflowId === 'new') {
      resetWorkflow();
    }

    return () => {
      if (!workflowId || workflowId === 'new') {
        resetWorkflow();
      }
    };
  }, [workflow, workflowId, loadWorkflow, resetWorkflow]);

  const saveWorkflow = useMutation({
    mutationFn: async ({ nodes, edges, status }: { nodes: any[]; edges: any[]; status?: string }) => {
      const workflowData = exportWorkflow(currentOrganization?.id);
      workflowData.nodes = nodes;
      workflowData.edges = edges;

      if (status) {
        workflowData.status = status as any;
      }

      if (workflowId && workflowId !== 'new') {
        const { error } = await (supabase
          .from('workflows') as any)
          .update({
            name: workflowData.name,
            description: workflowData.description,
            trigger_definitions: workflowData.trigger_definitions,
            nodes: workflowData.nodes,
            edges: workflowData.edges,
            status: workflowData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workflowId);

        if (error) throw error;
        return workflowData;
      } else {
        const { data, error } = await (supabase
          .from('workflows') as any)
          .insert({
            name: workflowData.name,
            description: workflowData.description,
            trigger_definitions: workflowData.trigger_definitions,
            nodes: workflowData.nodes,
            edges: workflowData.edges,
            organization_id: currentOrganization?.id,
            status: workflowData.status,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_data, variables) => {
      const isPublish = variables.status === 'active';
      addToast({
        title: isPublish ? 'Workflow published' : 'Workflow saved',
        description: isPublish
          ? 'Your workflow is now active.'
          : 'Changes saved successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      if (!workflowId || workflowId === 'new') {
        navigate(`/workflows/${_data.id}`);
      }
    },
    onError: (error: any) => {
      addToast({
        title: 'Failed to save workflow',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = async (nodes: any[], edges: any[]) => {
    saveWorkflow.mutate({ nodes, edges });
  };

  const handlePublish = async (nodes: any[], edges: any[]) => {
    saveWorkflow.mutate({ nodes, edges, status: 'active' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading workflow...</div>
      </div>
    );
  }

  return (
    <WorkflowCanvas
      workflowId={workflowId}
      initialNodes={workflow?.nodes || []}
      initialEdges={workflow?.edges || []}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
};
