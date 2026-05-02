/**
 * React Query hooks for review source management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getReviewSources,
  getReviewSource,
  createReviewSource,
  updateReviewSource,
  deleteReviewSource,
} from '../lib/aggregators';
import { useAuth } from '@/context/AuthContext';

export function useReviewSources() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['review-sources', currentOrganization?.id],
    queryFn: () => getReviewSources(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });
}

export function useReviewSource(sourceId: string) {
  return useQuery({
    queryKey: ['review-source', sourceId],
    queryFn: () => getReviewSource(sourceId),
    enabled: !!sourceId,
  });
}

export function useCreateReviewSource() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: (source: Omit<Parameters<typeof createReviewSource>[1], 'organizationId'>) =>
      createReviewSource(currentOrganization!.id, source),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-sources'] });
    },
  });
}

export function useUpdateReviewSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourceId, updates }: { sourceId: string; updates: Parameters<typeof updateReviewSource>[1] }) =>
      updateReviewSource(sourceId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-sources'] });
      queryClient.invalidateQueries({ queryKey: ['review-source'] });
    },
  });
}

export function useDeleteReviewSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => deleteReviewSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-sources'] });
    },
  });
}
