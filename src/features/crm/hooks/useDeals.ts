import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import {
  fetchDeals,
  fetchDealById,
  fetchPipelineWithStages,
  fetchPipelines,
  fetchDealHistory,
  createDeal,
  updateDeal,
  deleteDeal,
  moveDealToStage,
  updateDealStatus,
} from '../lib/supabase';
import type { Database } from '@/types/database.types';

type Deal = Database['public']['Tables']['deals']['Row'] & Record<string, any>;
type DealInsert = Database['public']['Tables']['deals']['Insert'];
type DealUpdate = Database['public']['Tables']['deals']['Update'];
type Stage = Database['public']['Tables']['stages']['Row'] & Record<string, any>;
type Pipeline = Database['public']['Tables']['pipelines']['Row'] & Record<string, any>;

export interface UseDealsParams {
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  status?: Deal['status'];
  search?: string;
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching deals with filtering and pagination
 */
export function useDeals(params: UseDealsParams = {}) {
  const { currentOrganization } = useAuth();
  const {
    pipelineId,
    stageId,
    contactId,
    companyId,
    status,
    search,
    page = 1,
    pageSize = 50,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: [
      'deals',
      currentOrganization?.id,
      pipelineId,
      stageId,
      contactId,
      companyId,
      status,
      search,
      page,
      pageSize,
    ],
    queryFn: () =>
      fetchDeals({
        organizationId: currentOrganization!.id,
        pipelineId,
        stageId,
        contactId,
        companyId,
        status,
        search,
        page,
        pageSize,
      }),
    enabled: enabled && !!currentOrganization,
  });
}

/**
 * Hook for fetching a single deal by ID
 */
export function useDeal(dealId: string) {
  return useQuery({
    queryKey: ['deal', dealId],
    queryFn: () => fetchDealById(dealId),
    enabled: !!dealId,
  });
}

/**
 * Hook for fetching deal history
 */
export function useDealHistory(dealId: string) {
  return useQuery({
    queryKey: ['deal-history', dealId],
    queryFn: () => fetchDealHistory(dealId),
    enabled: !!dealId,
  });
}

/**
 * Hook for fetching pipeline with stages and deals
 */
export function usePipeline(pipelineId: string) {
  return useQuery({
    queryKey: ['pipeline', pipelineId],
    queryFn: () => fetchPipelineWithStages(pipelineId),
    enabled: !!pipelineId,
  });
}

/**
 * Hook for fetching all pipelines
 */
export function usePipelines() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['pipelines', currentOrganization?.id],
    queryFn: () => fetchPipelines(currentOrganization!.id),
    enabled: !!currentOrganization,
  });
}

/**
 * Hook for creating a deal
 */
export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (deal: Omit<DealInsert, 'organization_id'>) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      return createDeal({
        ...deal,
        organization_id: currentOrganization.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      addToast({ title: 'Deal created', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to create deal', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}

/**
 * Hook for updating a deal
 */
export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ dealId, updates }: { dealId: string; updates: DealUpdate }) => {
      return updateDeal(dealId, updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      addToast({ title: 'Deal updated', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to update deal', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}

/**
 * Hook for moving a deal to a different stage
 */
export function useMoveDeal() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      dealId: string;
      fromStageId: string | null;
      toStageId: string;
      userId?: string;
      notes?: string;
    }) => {
      return moveDealToStage(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['deal-history', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      addToast({ title: 'Deal moved', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to move deal', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}

/**
 * Hook for updating deal status
 */
export function useUpdateDealStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      dealId: string;
      status: Deal['status'];
      userId?: string;
      notes?: string;
    }) => {
      return updateDealStatus(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] });
      queryClient.invalidateQueries({ queryKey: ['deal-history', variables.dealId] });
    },
  });
}

/**
 * Hook for deleting a deal
 */
export function useDeleteDeal() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (dealId: string) => {
      return deleteDeal(dealId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline'] });
      addToast({ title: 'Deal deleted', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to delete deal', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}
