import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { SocialPlatform } from '../lib/platforms';

export interface SocialAccount {
  id: string;
  organization_id: string;
  platform: SocialPlatform;
  account_name: string;
  account_id: string | null;
  username: string | null;
  profile_url: string | null;
  profile_image_url: string | null;
  status: 'active' | 'expired' | 'error' | 'disconnected';
  last_synced_at: string | null;
  error_message: string | null;
  can_post: boolean;
  can_schedule: boolean;
  can_analytics: boolean;
  auto_post: boolean;
  default_hashtags: string[] | null;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export function useSocialAccounts() {
  const { organizationId } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: accounts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['social', 'accounts', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('connected_at', { ascending: false });

      if (error) throw error;
      return data as SocialAccount[];
    },
    enabled: !!organizationId,
  });

  // Connect account mutation
  const connectAccount = useMutation({
    mutationFn: async ({
      platform,
      authData,
    }: {
      platform: SocialPlatform;
      authData: {
        access_token: string;
        refresh_token?: string;
        account_id?: string;
        account_name: string;
        username?: string;
        profile_url?: string;
        profile_image_url?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .insert({
          organization_id: organizationId,
          platform,
          account_name: authData.account_name,
          account_id: authData.account_id,
          username: authData.username,
          profile_url: authData.profile_url,
          profile_image_url: authData.profile_image_url,
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
          status: 'active',
          can_post: true,
          can_schedule: true,
          can_analytics: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'accounts'] });
    },
  });

  // Disconnect account mutation
  const disconnectAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'accounts'] });
    },
  });

  // Update account settings mutation
  const updateAccount = useMutation({
    mutationFn: async ({
      accountId,
      updates,
    }: {
      accountId: string;
      updates: Partial<SocialAccount>;
    }) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .update({
          auto_post: updates.auto_post,
          default_hashtags: updates.default_hashtags,
        })
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'accounts'] });
    },
  });

  // Sync account mutation
  const syncAccount = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .update({
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'accounts'] });
    },
  });

  return {
    accounts,
    isLoading,
    error,
    connectAccount: connectAccount.mutateAsync,
    disconnectAccount: disconnectAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    syncAccount: syncAccount.mutateAsync,
    isConnecting: connectAccount.isPending,
    isDisconnecting: disconnectAccount.isPending,
    isUpdating: updateAccount.isPending,
    isSyncing: syncAccount.isPending,
  };
}

export function useSocialAccount(accountId: string) {
  const { organizationId } = useAuth();

  return useQuery({
    queryKey: ['social', 'accounts', accountId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('organization_id', organizationId)
        .single();

      if (error) throw error;
      return data as SocialAccount;
    },
    enabled: !!accountId && !!organizationId,
  });
}
