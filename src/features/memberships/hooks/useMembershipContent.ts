/**
 * React Query hooks for membership content management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { buildContentTree, searchContent, duplicateContent } from '../lib/content';

/**
 * Get all content for an organization
 */
export function useMembershipContent(
  organizationId?: string,
  filters?: {
    content_type?: string;
    access_tier?: string;
    is_published?: boolean;
    parent_content_id?: string | null;
  }
) {
  return useQuery({
    queryKey: ['membership-content', organizationId, filters],
    queryFn: async () => {
      if (!organizationId) return [];

      let query = supabase
        .from('membership_content')
        .select('*')
        .eq('organization_id', organizationId)
        .order('order_index', { ascending: true });

      if (filters?.content_type) {
        query = query.eq('content_type', filters.content_type);
      }
      if (filters?.access_tier) {
        query = query.eq('access_tier', filters.access_tier);
      }
      if (filters?.is_published !== undefined) {
        query = query.eq('is_published', filters.is_published);
      }
      if (filters?.parent_content_id !== undefined) {
        query = query.is('parent_content_id', filters.parent_content_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

/**
 * Get content as tree structure
 */
export function useContentTree(organizationId?: string) {
  return useQuery({
    queryKey: ['content-tree', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('membership_content')
        .select('*')
        .eq('organization_id', organizationId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return buildContentTree(data || []);
    },
    enabled: !!organizationId,
  });
}

/**
 * Get a single content item
 */
export function useContent(contentId?: string) {
  return useQuery({
    queryKey: ['content', contentId],
    queryFn: async () => {
      if (!contentId) return null;

      const { data, error } = await supabase
        .from('membership_content')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contentId,
  });
}

/**
 * Get content with children (for courses)
 */
export function useContentWithChildren(contentId?: string) {
  return useQuery({
    queryKey: ['content-with-children', contentId],
    queryFn: async () => {
      if (!contentId) return null;

      const { data, error } = await supabase
        .from('membership_content')
        .select(`
          *,
          children:membership_content(*)
        `)
        .eq('id', contentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!contentId,
  });
}

/**
 * Search content
 */
export function useContentSearch(
  organizationId?: string,
  query?: string,
  filters?: {
    content_type?: string;
    access_tier?: string;
  }
) {
  return useQuery({
    queryKey: ['content-search', organizationId, query, filters],
    queryFn: async () => {
      if (!organizationId || !query) return [];
      return await searchContent(organizationId, query, filters);
    },
    enabled: !!organizationId && !!query && query.length >= 2,
  });
}

/**
 * Create or update content
 */
export function useSaveContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      content,
    }: {
      organizationId: string;
      content: any;
    }) => {
      const contentData = {
        organization_id: organizationId,
        ...content,
      };

      // If updating, don't change organization_id
      if (content.id) {
        delete contentData.organization_id;
      }

      const { data, error } = await supabase
        .from('membership_content')
        .upsert(contentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['membership-content', variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['content-tree', variables.organizationId],
      });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: ['content', data.id],
        });
      }
    },
  });
}

/**
 * Delete content
 */
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, organizationId }: { contentId: string; organizationId: string }) => {
      const { error } = await supabase
        .from('membership_content')
        .delete()
        .eq('id', contentId)
        .eq('organization_id', organizationId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['membership-content', variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['content-tree', variables.organizationId],
      });
    },
  });
}

/**
 * Duplicate content
 */
export function useDuplicateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, organizationId }: { contentId: string; organizationId: string }) => {
      const duplicated = await duplicateContent(contentId, organizationId);
      if (!duplicated) throw new Error('Failed to duplicate content');
      return duplicated;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['membership-content', variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['content-tree', variables.organizationId],
      });
    },
  });
}

/**
 * Update content order
 */
export function useUpdateContentOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      updates,
    }: {
      organizationId: string;
      updates: { id: string; order_index: number }[];
    }) => {
      const promises = updates.map((update) =>
        supabase
          .from('membership_content')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('organization_id', organizationId)
      );

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        throw new Error('Failed to update content order');
      }

      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['membership-content', variables.organizationId],
      });
      queryClient.invalidateQueries({
        queryKey: ['content-tree', variables.organizationId],
      });
    },
  });
}

/**
 * Publish/unpublish content
 */
export function usePublishContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      isPublished,
    }: {
      contentId: string;
      isPublished: boolean;
    }) => {
      const { data, error } = await supabase
        .from('membership_content')
        .update({
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        })
        .eq('id', contentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['membership-content'],
      });
      queryClient.invalidateQueries({
        queryKey: ['content-tree'],
      });
      queryClient.invalidateQueries({
        queryKey: ['content'],
      });
    },
  });
}

/**
 * Get content statistics
 */
export function useContentStats(organizationId?: string) {
  return useQuery({
    queryKey: ['content-stats', organizationId],
    queryFn: async () => {
      if (!organizationId) return null;

      const { data, error } = await supabase
        .from('membership_content')
        .select('content_type, is_published, views, likes')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const total = data.length;
      const published = data.filter((c) => c.is_published).length;
      const drafts = data.filter((c) => !c.is_published).length;
      const totalViews = data.reduce((sum, c) => sum + (c.views || 0), 0);
      const totalLikes = data.reduce((sum, c) => sum + (c.likes || 0), 0);

      const byType = data.reduce((acc, c) => {
        acc[c.content_type] = (acc[c.content_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        published,
        drafts,
        totalViews,
        totalLikes,
        byType,
      };
    },
    enabled: !!organizationId,
  });
}

/**
 * Get popular content
 */
export function usePopularContent(organizationId?: string, limit: number = 10) {
  return useQuery({
    queryKey: ['popular-content', organizationId, limit],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('membership_content')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_published', true)
        .order('views', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}

/**
 * Get certificates for a subscription
 */
export function useCertificates(subscriptionId?: string) {
  return useQuery({
    queryKey: ['certificates', subscriptionId],
    queryFn: async () => {
      if (!subscriptionId) return [];

      const { data, error } = await supabase
        .from('membership_certificates')
        .select(`
          *,
          content:membership_content(title)
        `)
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!subscriptionId,
  });
}

/**
 * Verify certificate
 */
export function useVerifyCertificate(token?: string) {
  return useQuery({
    queryKey: ['verify-certificate', token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('membership_certificates')
        .select('*')
        .eq('verification_token', token)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
}

/**
 * Issue certificate
 */
export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscriptionId,
      contentId,
      userId,
      organizationId,
    }: {
      subscriptionId: string;
      contentId: string;
      userId: string;
      organizationId: string;
    }) => {
      // Get content and user details
      const [content, user] = await Promise.all([
        supabase.from('membership_content').select('title').eq('id', contentId).single(),
        supabase.from('user_profiles').select('full_name').eq('id', userId).single(),
      ]);

      if (!content.data || !user.data) {
        throw new Error('Content or user not found');
      }

      // Generate certificate number and token
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const verificationToken = Math.random().toString(36).substr(2, 20);

      const { data, error } = await supabase
        .from('membership_certificates')
        .insert({
          organization_id: organizationId,
          subscription_id: subscriptionId,
          content_id: contentId,
          user_id: userId,
          certificate_number: certificateNumber,
          recipient_name: user.data.full_name || 'Student',
          course_name: content.data.title,
          completed_at: new Date().toISOString(),
          verification_token: verificationToken,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['certificates', variables.subscriptionId],
      });
    },
  });
}
