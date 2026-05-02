import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from '../lib/supabase';
import type { Database } from '@/types/database.types';

type Activity = Database['public']['Tables']['activities']['Row'] & Record<string, any>;
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
type Tag = Database['public']['Tables']['tags']['Row'] & Record<string, any>;

export interface UseActivitiesParams {
  contactId?: string;
  companyId?: string;
  dealId?: string;
  type?: Activity['type'];
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching activities with filtering
 */
export function useActivities(params: UseActivitiesParams = {}) {
  const { currentOrganization } = useAuth();
  const { contactId, companyId, dealId, type, limit = 50, offset = 0, enabled = true } = params;

  return useQuery({
    queryKey: ['activities', currentOrganization?.id, contactId, companyId, dealId, type, limit, offset],
    queryFn: () =>
      fetchActivities({
        organizationId: currentOrganization!.id,
        contactId,
        companyId,
        dealId,
        type,
        limit,
        offset,
      }),
    enabled: enabled && !!currentOrganization,
  });
}

/**
 * Hook for creating an activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (activity: Omit<ActivityInsert, 'organization_id'>) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      return createActivity({
        ...activity,
        organization_id: currentOrganization.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

/**
 * Hook for updating an activity
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, updates }: { activityId: string; updates: Partial<ActivityInsert> }) => {
      return updateActivity(activityId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

/**
 * Hook for deleting an activity
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      return deleteActivity(activityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

/**
 * Hook for fetching tags
 */
export function useTags() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['tags', currentOrganization?.id],
    queryFn: () => fetchTags(currentOrganization!.id),
    enabled: !!currentOrganization,
  });
}

/**
 * Hook for creating a tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (params: { name: string; color?: string }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      return createTag({
        organizationId: currentOrganization.id,
        ...params,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * Hook for updating a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tagId, updates }: { tagId: string; updates: Partial<{ name: string; color: string }> }) => {
      return updateTag(tagId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * Hook for deleting a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      return deleteTag(tagId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

/**
 * Hook for logging a quick note activity
 */
export function useLogNote() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: async (params: {
      contactId?: string;
      companyId?: string;
      dealId?: string;
      title: string;
      description?: string;
      userId?: string;
    }) => {
      return createActivityMutation.mutateAsync({
        ...params,
        type: 'note',
        status: 'completed',
      });
    },
  });
}

/**
 * Hook for logging a call activity
 */
export function useLogCall() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: async (params: {
      contactId?: string;
      companyId?: string;
      dealId?: string;
      title: string;
      description?: string;
      durationMinutes?: number;
      userId?: string;
    }) => {
      return createActivityMutation.mutateAsync({
        ...params,
        type: 'call',
        duration_minutes: params.durationMinutes,
        status: 'completed',
      });
    },
  });
}

/**
 * Hook for logging a meeting activity
 */
export function useLogMeeting() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: async (params: {
      contactId?: string;
      companyId?: string;
      dealId?: string;
      title: string;
      description?: string;
      durationMinutes?: number;
      dueDate?: string;
      userId?: string;
    }) => {
      return createActivityMutation.mutateAsync({
        ...params,
        type: 'meeting',
        duration_minutes: params.durationMinutes,
        due_date: params.dueDate,
        status: params.dueDate ? 'pending' : 'completed',
      });
    },
  });
}

/**
 * Hook for logging an email activity
 */
export function useLogEmail() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: async (params: {
      contactId?: string;
      companyId?: string;
      dealId?: string;
      title: string;
      description?: string;
      direction: 'sent' | 'received';
      userId?: string;
    }) => {
      return createActivityMutation.mutateAsync({
        ...params,
        type: params.direction === 'sent' ? 'email_sent' : 'email_received',
        status: 'completed',
      });
    },
  });
}

/**
 * Hook for logging a task activity
 */
export function useLogTask() {
  const createActivityMutation = useCreateActivity();

  return useMutation({
    mutationFn: async (params: {
      contactId?: string;
      companyId?: string;
      dealId?: string;
      title: string;
      description?: string;
      dueDate?: string;
      userId?: string;
    }) => {
      return createActivityMutation.mutateAsync({
        ...params,
        type: 'task',
        due_date: params.dueDate,
        status: params.dueDate ? 'pending' : 'completed',
      });
    },
  });
}
