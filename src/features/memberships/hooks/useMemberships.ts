// @ts-nocheck
/**
 * React Query hooks for membership plans and subscriptions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { checkContentAccess, getAccessibleContent } from '../lib/access';
import { getCourseWithProgress, buildContentTree, calculateCourseProgress } from '../lib/content';

/**
 * Get all membership plans for an organization
 */
export function useMembershipPlans(organizationId?: string) {
  return useQuery({
    queryKey: ['membership-plans', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('organization_id', organizationId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

/**
 * Get a single membership plan
 */
export function useMembershipPlan(planId?: string) {
  return useQuery({
    queryKey: ['membership-plan', planId],
    queryFn: async () => {
      if (!planId) return null;

      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!planId,
  });
}

/**
 * Get public plans (for pricing page)
 */
export function usePublicPlans(organizationId?: string) {
  return useQuery({
    queryKey: ['public-plans', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('public', true)
        .eq('status', 'active')
        .order('price', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

/**
 * Get user's subscription for an organization
 */
export function useUserSubscription(userId?: string, organizationId?: string) {
  return useQuery({
    queryKey: ['user-subscription', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return null;

      const { data, error } = await supabase
        .from('membership_subscriptions')
        .select(`
          *,
          plan:membership_plans(*)
        `)
        .eq('user_id', userId)
        .eq('organization_id', organizationId)
        .in('status', ['trialing', 'active', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!organizationId,
  });
}

/**
 * Get all subscriptions for an organization (admin)
 */
export function useSubscriptions(organizationId?: string, status?: string) {
  return useQuery({
    queryKey: ['subscriptions', organizationId, status],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from('membership_subscriptions')
        .select(`
          *,
          plan:membership_plans(*),
          user:user_profiles(id, full_name, email, avatar_url),
          contact:contacts(id, first_name, last_name, email)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

/**
 * Create or update a membership plan
 */
export function useSavePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      plan,
    }: {
      organizationId: string;
      plan: any;
    }) => {
      const planData = {
        organization_id: organizationId,
        ...plan,
      };

      const { data, error } = await supabase
        .from('membership_plans')
        .upsert(planData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['membership-plans', variables.organizationId],
      });
    },
  });
}

/**
 * Delete a membership plan
 */
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, organizationId }: { planId: string; organizationId: string }) => {
      const { error } = await supabase
        .from('membership_plans')
        .update({ status: 'archived' })
        .eq('id', planId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['membership-plans', variables.organizationId],
      });
    },
  });
}

/**
 * Update subscription plan
 */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      updates,
    }: {
      subscriptionId: string;
      updates: any;
    }) => {
      const { data, error } = await supabase
        .from('membership_subscriptions')
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-subscription'],
      });
    },
  });
}

/**
 * Cancel subscription
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data, error } = await supabase
        .from('membership_subscriptions')
        .update({
          cancel_at_period_end: true,
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['subscriptions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-subscription'],
      });
    },
  });
}

/**
 * Get subscription statistics
 */
export function useSubscriptionStats(organizationId?: string) {
  return useQuery({
    queryKey: ['subscription-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from('membership_subscriptions')
        .select('status, plan_id, price')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const total = data.length;
      const active = data.filter((s) => s.status === 'active').length;
      const trialing = data.filter((s) => s.status === 'trialing').length;
      const cancelled = data.filter((s) => s.status === 'cancelled').length;
      const mrr = data
        .filter((s) => s.status === 'active' && s.billing_interval === 'monthly')
        .reduce((sum, s) => sum + (s.price || 0), 0);
      const arr = data
        .filter((s) => s.status === 'active' && s.billing_interval === 'yearly')
        .reduce((sum, s) => sum + (s.price || 0), 0) / 12;

      return {
        total,
        active,
        trialing,
        cancelled,
        mrr,
        arr,
        totalRevenue: mrr + arr,
      };
    },
    enabled: !!organizationId,
  });
}

/**
 * Get member progress for content
 */
export function useMemberProgress(subscriptionId?: string, contentId?: string) {
  return useQuery({
    queryKey: ['member-progress', subscriptionId, contentId],
    queryFn: async () => {
      if (!subscriptionId || !contentId) return null;

      const { data, error } = await supabase
        .from('membership_access')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('content_id', contentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId && !!contentId,
  });
}

/**
 * Update member progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accessId,
      progressPercent,
      isCompleted,
    }: {
      accessId: string;
      progressPercent: number;
      isCompleted: boolean;
    }) => {
      const { data, error } = await supabase
        .from('membership_access')
        .update({
          progress_percent: progressPercent,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', accessId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['member-progress'],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-subscription'],
      });
    },
  });
}

/**
 * Get course with progress for a subscription
 */
export function useCourseWithProgress(courseId?: string, subscriptionId?: string) {
  return useQuery({
    queryKey: ['course-progress', courseId, subscriptionId],
    queryFn: async () => {
      if (!courseId || !subscriptionId) return null;
      return await getCourseWithProgress(courseId, subscriptionId);
    },
    enabled: !!courseId && !!subscriptionId,
  });
}

/**
 * Get all content with access status
 */
export function useContentWithAccess(userId?: string, organizationId?: string) {
  return useQuery({
    queryKey: ['content-with-access', userId, organizationId],
    queryFn: async () => {
      if (!userId || !organizationId) return [];

      const content = await getAccessibleContent(userId, organizationId);
      return content;
    },
    enabled: !!userId && !!organizationId,
  });
}
