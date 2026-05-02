/**
 * React Query hooks for member access control
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { checkContentAccess, grantContentAccess } from '../lib/access';
import { useAuth } from '@/context/AuthContext';

/**
 * Check if current user has access to content
 */
export function useContentAccess(contentId?: string, organizationId?: string) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['content-access', userId, contentId, organizationId],
    queryFn: async () => {
      if (!userId || !contentId || !organizationId) {
        return { hasAccess: false, accessType: 'none' as const, reason: 'Missing required parameters' };
      }

      return await checkContentAccess(userId, contentId, organizationId);
    },
    enabled: !!userId && !!contentId && !!organizationId,
  });
}

/**
 * Get access records for a subscription
 */
export function useAccessRecords(subscriptionId?: string) {
  return useQuery({
    queryKey: ['access-records', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];

      const { data, error } = await supabase
        .from('membership_access')
        .select(`
          *,
          content:membership_content(id, title, content_type, thumbnail_url)
        `)
        .eq('subscription_id', subscriptionId)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId,
  });
}

/**
 * Grant access to content
 */
export function useGrantAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      contentId,
      accessType,
    }: {
      subscriptionId: string;
      contentId: string;
      accessType?: 'full' | 'preview';
    }) => {
      const result = await grantContentAccess(subscriptionId, contentId, accessType);
      if (!result) throw new Error('Failed to grant access');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['access-records', variables.subscriptionId],
      });
    },
  });
}

/**
 * Revoke access to content
 */
export function useRevokeAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accessId: string) => {
      const { error } = await supabase
        .from('membership_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['access-records'],
      });
    },
  });
}

/**
 * Update access type
 */
export function useUpdateAccessType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ accessId, accessType }: { accessId: string; accessType: 'full' | 'preview' | 'none' }) => {
      const { data, error } = await supabase
        .from('membership_access')
        .update({ access_type: accessType })
        .eq('id', accessId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['access-records'],
      });
    },
  });
}

/**
 * Get detailed progress for a content item
 */
export function useContentProgress(accessId?: string) {
  return useQuery({
    queryKey: ['content-progress', accessId],
    queryFn: async () => {
      if (!accessId) return null;

      const { data, error } = await supabase
        .from('membership_progress')
        .select('*')
        .eq('access_id', accessId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!accessId,
  });
}

/**
 * Update lesson progress
 */
export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accessId,
      lessonId,
      status,
      lastPositionSeconds,
      timeSpentSeconds,
    }: {
      accessId: string;
      lessonId: string;
      status: 'not_started' | 'in_progress' | 'completed';
      lastPositionSeconds?: number;
      timeSpentSeconds?: number;
    }) => {
      const { data, error } = await supabase
        .from('membership_progress')
        .upsert({
          access_id: accessId,
          lesson_id: lessonId,
          status,
          last_position_seconds: lastPositionSeconds || 0,
          time_spent_seconds: timeSpentSeconds || 0,
          started_at: status !== 'not_started' ? new Date().toISOString() : null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['content-progress'],
      });
    },
  });
}

/**
 * Bookmark content
 */
export function useBookmarkContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accessId,
      bookmarked,
    }: {
      accessId: string;
      bookmarked: boolean;
    }) => {
      const { data, error } = await supabase
        .from('membership_access')
        .update({
          bookmarked_at: bookmarked ? new Date().toISOString() : null,
        })
        .eq('id', accessId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['access-records'],
      });
    },
  });
}

/**
 * Add notes to content
 */
export function useUpdateContentNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accessId,
      notes,
    }: {
      accessId: string;
      notes: string;
    }) => {
      const { data, error } = await supabase
        .from('membership_access')
        .update({ notes })
        .eq('id', accessId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['access-records'],
      });
    },
  });
}

/**
 * Get bookmarked content
 */
export function useBookmarkedContent(subscriptionId?: string) {
  return useQuery({
    queryKey: ['bookmarked-content', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];

      const { data, error } = await supabase
        .from('membership_access')
        .select(`
          *,
          content:membership_content(*)
        `)
        .eq('subscription_id', subscriptionId)
        .not('bookmarked_at', 'is', null)
        .order('bookmarked_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId,
  });
}

/**
 * Get completed content
 */
export function useCompletedContent(subscriptionId?: string) {
  return useQuery({
    queryKey: ['completed-content', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];

      const { data, error } = await supabase
        .from('membership_access')
        .select(`
          *,
          content:membership_content(*)
        `)
        .eq('subscription_id', subscriptionId)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId,
  });
}

/**
 * Get in-progress content
 */
export function useInProgressContent(subscriptionId?: string) {
  return useQuery({
    queryKey: ['in-progress-content', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];

      const { data, error } = await supabase
        .from('membership_access')
        .select(`
          *,
          content:membership_content(*)
        `)
        .eq('subscription_id', subscriptionId)
        .gt('progress_percent', 0)
        .lt('progress_percent', 100)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId,
  });
}

/**
 * Bulk grant access to multiple content items
 */
export function useBulkGrantAccess() {
  const queryClient = useQueryClient();
  const grantMutation = useGrantAccess();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      contentIds,
      accessType,
    }: {
      subscriptionId: string;
      contentIds: string[];
      accessType?: 'full' | 'preview';
    }) => {
      const promises = contentIds.map((contentId) =>
        grantMutation.mutateAsync({ subscriptionId, contentId, accessType })
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r === null);

      if (errors.length > 0) {
        throw new Error(`Failed to grant access to ${errors.length} items`);
      }

      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['access-records', variables.subscriptionId],
      });
    },
  });
}

/**
 * Get access summary for a subscription
 */
export function useAccessSummary(subscriptionId?: string) {
  return useQuery({
    queryKey: ['access-summary', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return null;

      const { data, error } = await supabase
        .from('membership_access')
        .select('progress_percent, is_completed, total_time_spent_seconds')
        .eq('subscription_id', subscriptionId);

      if (error) throw error;

      const total = data.length;
      const completed = data.filter((a) => a.is_completed).length;
      const inProgress = data.filter((a) => a.progress_percent > 0 && !a.is_completed).length;
      const notStarted = data.filter((a) => a.progress_percent === 0).length;
      const totalTimeSpent = data.reduce((sum, a) => sum + (a.total_time_spent_seconds || 0), 0);
      const avgProgress = data.length > 0
        ? data.reduce((sum, a) => sum + a.progress_percent, 0) / data.length
        : 0;

      return {
        total,
        completed,
        inProgress,
        notStarted,
        totalTimeSpent,
        totalTimeSpentHours: Math.round(totalTimeSpent / 3600),
        avgProgress: Math.round(avgProgress),
      };
    },
    enabled: !!subscriptionId,
  });
}


// Stub hooks for portal (to be implemented)
export function useContent(contentId: string) {
  return { data: null as any, isLoading: false };
}

export function useMemberProgress(contentId: string) {
  return { data: null as any, isLoading: false };
}

export function useUpdateProgress() {
  return { mutate: (() => {}) as any, isPending: false };
}

export function useCourseWithProgress(courseId: string) {
  return { data: null as any, isLoading: false };
}
