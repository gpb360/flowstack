// @ts-nocheck
/**
 * React Query hooks for reputation alert and response management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationSettings,
  getAllNotificationSettings,
  upsertNotificationSettings,
  deleteNotificationSettings,
  getReviewFlags,
  flagReview,
  resolveFlag,
  getReputationAlerts,
  markAlertRead,
  dismissAlert,
  markAllAlertsRead,
  getAlertStats,
  createReputationAlert,
  getReviewFlagsForReview,
} from '../lib/alerts';
import {
  getReviewResponses,
  createResponse,
  updateResponse,
  deleteResponse,
  postResponseToPlatform,
  getResponseTemplates,
  getResponseTemplate,
  createResponseTemplate,
  updateResponseTemplate,
  deleteResponseTemplate,
  applyTemplate,
  getSuggestedTemplates,
  bulkCreateResponses,
  bulkPostResponses,
  getResponseStats,
} from '../lib/responders';
import { useAuth } from '@/context/AuthContext';

// Notification Settings
export function useNotificationSettings(sourceId: string) {
  return useQuery({
    queryKey: ['notification-settings', sourceId],
    queryFn: () => getNotificationSettings(sourceId),
    enabled: !!sourceId,
  });
}

export function useAllNotificationSettings() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['all-notification-settings', currentOrganization?.id],
    queryFn: () => getAllNotificationSettings(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });
}

export function useUpsertNotificationSettings() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: ({ sourceId, settings }: { sourceId: string; settings: Parameters<typeof upsertNotificationSettings>[2] }) =>
      upsertNotificationSettings(currentOrganization!.id, sourceId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      queryClient.invalidateQueries({ queryKey: ['all-notification-settings'] });
    },
  });
}

export function useDeleteNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sourceId: string) => deleteNotificationSettings(sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
    },
  });
}

// Review Flags
export function useReviewFilters(filters?: { resolved?: boolean; flag_reason?: string }) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['review-flags', currentOrganization?.id, filters],
    queryFn: () => getReviewFilters(currentOrganization!.id, filters),
    enabled: !!currentOrganization?.id,
  });
}

export function useReviewFlagsForReview(reviewId: string) {
  return useQuery({
    queryKey: ['review-flags', reviewId],
    queryFn: () => getReviewFlagsForReview(reviewId),
    enabled: !!reviewId,
  });
}

export function useFlagReview() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: ({ reviewId, flag }: { reviewId: string; flag: Omit<Parameters<typeof flagReview>[2], 'organizationId'> }) =>
      flagReview(currentOrganization!.id, reviewId, flag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-flags'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useResolveFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, resolvedBy, resolutionNotes, actionTaken }: {
      flagId: string;
      resolvedBy: string;
      resolutionNotes?: string;
      actionTaken?: 'none' | 'hidden' | 'reported' | 'removed';
    }) => resolveFlag(flagId, resolvedBy, resolutionNotes, actionTaken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-flags'] });
    },
  });
}

// Reputation Alerts
export function useReputationAlerts(filters?: { read?: boolean; dismissed?: boolean; severity?: string; limit?: number }) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['reputation-alerts', currentOrganization?.id, filters],
    queryFn: () => getReputationAlerts(currentOrganization!.id, filters),
    enabled: !!currentOrganization?.id,
  });
}

export function useAlertStats() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['alert-stats', currentOrganization?.id],
    queryFn: () => getAlertStats(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => markAlertRead(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reputation-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => dismissAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reputation-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });
}

export function useMarkAllAlertsRead() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: () => markAllAlertsRead(currentOrganization!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reputation-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-stats'] });
    },
  });
}

export function useCreateReputationAlert() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: (alert: Omit<Parameters<typeof createReputationAlert>[1], 'organizationId'>) =>
      createReputationAlert(currentOrganization!.id, alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reputation-alerts'] });
    },
  });
}

// Review Responses
export function useReviewResponses(reviewId: string) {
  return useQuery({
    queryKey: ['review-responses', reviewId],
    queryFn: () => getReviewResponses(reviewId),
    enabled: !!reviewId,
  });
}

export function useCreateResponse() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: ({ reviewId, response }: { reviewId: string; response: Omit<Parameters<typeof createResponse>[2], 'organizationId'> }) =>
      createResponse(currentOrganization!.id, reviewId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

export function useUpdateResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ responseId, updates }: { responseId: string; updates: Parameters<typeof updateResponse>[1] }) =>
      updateResponse(responseId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses'] });
    },
  });
}

export function useDeleteResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => deleteResponse(responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses'] });
    },
  });
}

export function usePostResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseId: string) => postResponseToPlatform(responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['review'] });
    },
  });
}

// Response Templates
export function useResponseTemplates() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['response-templates', currentOrganization?.id],
    queryFn: () => getResponseTemplates(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
  });
}

export function useResponseTemplate(templateId: string) {
  return useQuery({
    queryKey: ['response-template', templateId],
    queryFn: () => getResponseTemplate(templateId),
    enabled: !!templateId,
  });
}

export function useCreateResponseTemplate() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: (template: Omit<Parameters<typeof createResponseTemplate>[1], 'organizationId'>) =>
      createResponseTemplate(currentOrganization!.id, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['response-templates'] });
    },
  });
}

export function useUpdateResponseTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: Parameters<typeof updateResponseTemplate>[1] }) =>
      updateResponseTemplate(templateId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['response-templates'] });
    },
  });
}

export function useDeleteResponseTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteResponseTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['response-templates'] });
    },
  });
}

export function useSuggestedTemplates(rating: number, sentiment?: string) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['suggested-templates', currentOrganization?.id, rating, sentiment],
    queryFn: () => getSuggestedTemplates(currentOrganization!.id, rating, sentiment),
    enabled: !!currentOrganization?.id,
  });
}

export function useBulkCreateResponses() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: (responses: Parameters<typeof bulkCreateResponses>[1]) =>
      bulkCreateResponses(currentOrganization!.id, responses),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useBulkPostResponses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (responseIds: string[]) => bulkPostResponses(responseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-responses'] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useResponseStats(days: number = 30) {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['response-stats', currentOrganization?.id, days],
    queryFn: () => getResponseStats(currentOrganization!.id, days),
    enabled: !!currentOrganization?.id,
  });
}
