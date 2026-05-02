import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { PostData, ScheduledPost } from '../lib/composer';

export function useSocialPosts(filters?: {
  status?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();

  // Fetch posts
  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['social', 'posts', organizationId, filters],
    queryFn: async () => {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          social_scheduled_posts (
            id,
            account_id,
            scheduled_for,
            status,
            social_accounts (
              id,
              account_name,
              platform
            )
          )
        `)
        .eq('organization_id', organizationId);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (postData: PostData) => {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          organization_id: organizationId,
          content: postData.content,
          media_urls: postData.media.map(m => m.url),
          media_type: postData.media.length > 0
            ? postData.media[0].type === 'image' ? 'image' : 'video'
            : 'text',
          link_url: postData.linkUrl,
          link_title: postData.linkTitle,
          link_description: postData.linkDescription,
          link_image_url: postData.linkImageUrl,
          post_type: postData.postType,
          campaign_id: postData.campaignId,
          internal_notes: postData.internalNotes,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'posts'] });
    },
  });

  // Update post mutation
  const updatePost = useMutation({
    mutationFn: async ({ postId, updates }: { postId: string; updates: Partial<PostData> }) => {
      const { data, error } = await supabase
        .from('social_posts')
        .update({
          content: updates.content,
          media_urls: updates.media?.map(m => m.url),
          link_url: updates.linkUrl,
          link_title: updates.linkTitle,
          link_description: updates.linkDescription,
          link_image_url: updates.linkImageUrl,
          internal_notes: updates.internalNotes,
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'posts'] });
    },
  });

  // Delete post mutation
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'posts'] });
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost: createPost.mutateAsync,
    updatePost: updatePost.mutateAsync,
    deletePost: deletePost.mutateAsync,
    isCreating: createPost.isPending,
    isUpdating: updatePost.isPending,
    isDeleting: deletePost.isPending,
  };
}

export function useSocialPost(postId: string) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['social', 'posts', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          social_scheduled_posts (
            id,
            account_id,
            scheduled_for,
            status,
            social_accounts (
              id,
              account_name,
              platform
            )
          )
        `)
        .eq('id', postId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!postId && !!organizationId,
  });
}

export function useScheduledPosts(startDate: Date, endDate: Date) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['social', 'scheduled', organizationId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_scheduled_posts')
        .select(`
          *,
          social_posts (
            id,
            content,
            media_urls
          ),
          social_accounts (
            id,
            account_name,
            platform
          )
        `)
        .eq('organization_id', organizationId)
        .gte('scheduled_for', startDate.toISOString())
        .lte('scheduled_for', endDate.toISOString())
        .in('status', ['pending', 'processing'])
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}
