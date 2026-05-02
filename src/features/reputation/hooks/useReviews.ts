/**
 * React Query hooks for review management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getReviews,
  getReviewDetail,
  updateReviewStatus,
  assignReview,
  tagReview,
  getReviewSummary,
  getRatingDistribution,
  getReviewsTrend,
  bulkUpdateReviewStatus,
  bulkAssignReviews,
  syncReviewsFromSource,
} from '../lib/aggregators';
import { useAuth } from '@/context/AuthContext';

export function useReviews(filters?: {
  sourceId?: string;
  rating?: number;
  status?: string;
  sentiment?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['reviews', currentOrganization?.id, filters],
    queryFn: () =>
      getReviews(currentOrganization!.id, filters).then((res) => res.reviews),
    enabled: !!currentOrganization?.id,
  });
}

export function useReviewsCount(filters?: {
  sourceId?: string;
  rating?: number;
  status?: string;
  sentiment?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['reviews-count', currentOrganization?.id, filters],
    queryFn: () =>
      getReviews(currentOrganization!.id, filters).then((res) => res.count),
    enabled: !!currentOrganization?.id,
  });
}

export function useReviewDetail(reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => getReviewDetail(reviewId),
    enabled: !!reviewId,
  });
}

export function useReviewSummary(sourceId?: string, days: number = 30) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['review-summary', currentOrganization?.id, sourceId, days],
    queryFn: () => getReviewSummary(currentOrganization!.id, sourceId, days),
    enabled: !!currentOrganization?.id,
  });
}

export function useRatingDistribution(sourceId?: string, days: number = 30) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['rating-distribution', currentOrganization?.id, sourceId, days],
    queryFn: () => getRatingDistribution(currentOrganization!.id, sourceId, days),
    enabled: !!currentOrganization?.id,
  });
}

export function useReviewsTrend(sourceId?: string, days: number = 90) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['reviews-trend', currentOrganization?.id, sourceId, days],
    queryFn: () => getReviewsTrend(currentOrganization!.id, sourceId, days),
    enabled: !!currentOrganization?.id,
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, status }: { reviewId: string; status: 'new' | 'read' | 'flagged' | 'hidden' }) =>
      updateReviewStatus(reviewId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useAssignReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, userId }: { reviewId: string; userId: string | null }) =>
      assignReview(reviewId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useTagReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, tags }: { reviewId: string; tags: string[] }) =>
      tagReview(reviewId, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useBulkUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewIds, status }: { reviewIds: string[]; status: 'new' | 'read' | 'flagged' | 'hidden' }) =>
      bulkUpdateReviewStatus(reviewIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useBulkAssignReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewIds, userId }: { reviewIds: string[]; userId: string | null }) =>
      bulkAssignReviews(reviewIds, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useSyncReviews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => syncReviewsFromSource(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-sources'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
