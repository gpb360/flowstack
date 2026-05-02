import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { MediaFile } from '../lib/composer';

export interface SocialMedia {
  id: string;
  organization_id: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'gif';
  file_size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  folder: string;
  tags: string[] | null;
  alt_text: string | null;
  usage_count: number;
  last_used_at: string | null;
  uploaded_at: string;
  created_at: string;
}

export function useSocialMedia(filters?: {
  folder?: string;
  type?: 'image' | 'video' | 'gif';
  tags?: string[];
  search?: string;
}) {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: media = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['social', 'media', organizationId, filters],
    queryFn: async () => {
      let query = supabase
        .from('social_media_library')
        .select('*')
        .eq('organization_id', organizationId);

      if (filters?.folder) {
        query = query.eq('folder', filters.folder);
      }

      if (filters?.type) {
        query = query.eq('file_type', filters.type);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.ilike('file_name', `%${filters.search}%`);
      }

      const { data, error } = await query.order('uploaded_at', { ascending: false });

      if (error) throw error;
      return data as SocialMedia[];
    },
    enabled: !!organizationId,
  });

  // Upload media mutation
  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${organizationId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('social-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('social-media')
        .getPublicUrl(filePath);

      // Create database record
      const { data, error } = await supabase
        .from('social_media_library')
        .insert({
          organization_id: organizationId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type.startsWith('image/') ? 'image' : 'video',
          file_size_bytes: file.size,
          folder: 'uncategorized',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'media'] });
    },
  });

  // Update media mutation
  const updateMedia = useMutation({
    mutationFn: async ({
      mediaId,
      updates,
    }: {
      mediaId: string;
      updates: Partial<SocialMedia>;
    }) => {
      const { data, error } = await supabase
        .from('social_media_library')
        .update({
          folder: updates.folder,
          tags: updates.tags,
          alt_text: updates.alt_text,
        })
        .eq('id', mediaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'media'] });
    },
  });

  // Delete media mutation
  const deleteMedia = useMutation({
    mutationFn: async (mediaId: string) => {
      // First get the file to delete from storage
      const { data: media } = await supabase
        .from('social_media_library')
        .select('file_url')
        .eq('id', mediaId)
        .single();

      if (media) {
        // Extract file path from URL
        const urlParts = media.file_url.split('/');
        const filePath = urlParts.slice(-2).join('/');

        // Delete from storage
        await supabase.storage
          .from('social-media')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('social_media_library')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'media'] });
    },
  });

  // Organize media mutation (bulk update folder/tags)
  const organizeMedia = useMutation({
    mutationFn: async ({
      mediaIds,
      updates,
    }: {
      mediaIds: string[];
      updates: { folder?: string; tags?: string[] };
    }) => {
      const { data, error } = await supabase
        .from('social_media_library')
        .update(updates)
        .in('id', mediaIds)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'media'] });
    },
  });

  return {
    media,
    isLoading,
    error,
    uploadMedia: uploadMedia.mutateAsync,
    updateMedia: updateMedia.mutateAsync,
    deleteMedia: deleteMedia.mutateAsync,
    organizeMedia: organizeMedia.mutateAsync,
    isUploading: uploadMedia.isPending,
    isUpdating: updateMedia.isPending,
    isDeleting: deleteMedia.isPending,
    isOrganizing: organizeMedia.isPending,
  };
}

export function useSocialAnalytics(accountId?: string, days: number = 30) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['social', 'analytics', organizationId, accountId, days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_social_analytics_summary', {
        p_organization_id: organizationId,
        p_account_id: accountId || null,
        p_days: days,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });
}
