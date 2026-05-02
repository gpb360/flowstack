import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  IntegrationConnection,
  WebhookSubscription,
  WebhookEvent,
  SyncLog,
  SyncConfig,
} from './types';
import type { IntegrationDefinition } from './registry';

// =====================================================
// Connections Queries
// =====================================================

/**
 * Fetch all connections for an organization
 */
export function useConnections(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['integrations', 'connections', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IntegrationConnection[];
    },
    enabled: !!organizationId,
  });
}

/**
 * Fetch a single connection
 */
export function useConnection(connectionId: string | undefined) {
  return useQuery({
    queryKey: ['integrations', 'connections', connectionId],
    queryFn: async () => {
      if (!connectionId) return null;

      const { data, error } = await supabase
        .from('integration_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

      if (error) throw error;
      return data as IntegrationConnection;
    },
    enabled: !!connectionId,
  });
}

/**
 * Create a new connection mutation
 */
export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connection: {
      organization_id: string;
      integration_id: string;
      name: string;
      credentials: Record<string, unknown>;
      config?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from('integration_connections')
        .insert({
          ...connection,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as IntegrationConnection;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['integrations', 'connections', variables.organization_id],
      });
    },
  });
}

/**
 * Update connection mutation
 */
export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      connectionId,
      updates,
    }: {
      connectionId: string;
      updates: Partial<IntegrationConnection>;
    }) => {
      const { data, error } = await supabase
        .from('integration_connections')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return data as IntegrationConnection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['integrations', 'connections', data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['integrations', 'connections', data.organization_id],
      });
    },
  });
}

/**
 * Delete connection mutation
 */
export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ connectionId, organizationId }: { connectionId: string; organizationId: string }) => {
      const { error } = await supabase
        .from('integration_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      return connectionId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['integrations', 'connections', variables.organizationId],
      });
    },
  });
}

// =====================================================
// Webhooks Queries
// =====================================================

/**
 * Fetch webhooks for a connection
 */
export function useWebhooks(connectionId: string | undefined) {
  return useQuery({
    queryKey: ['integrations', 'webhooks', connectionId],
    queryFn: async () => {
      if (!connectionId) return [];

      const { data, error } = await supabase
        .from('integration_webhooks')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WebhookSubscription[];
    },
    enabled: !!connectionId,
  });
}

/**
 * Fetch webhook events
 */
export function useWebhookEvents(
  webhookId: string | undefined,
  limit = 50
) {
  return useQuery({
    queryKey: ['integrations', 'webhook-events', webhookId, limit],
    queryFn: async () => {
      if (!webhookId) return [];

      const { data, error } = await supabase
        .from('integration_webhook_events')
        .select('*')
        .eq('webhook_id', webhookId)
        .order('received_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as WebhookEvent[];
    },
    enabled: !!webhookId,
  });
}

/**
 * Create webhook subscription mutation
 */
export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (webhook: {
      organization_id: string;
      connection_id?: string;
      integration_id: string;
      event_type: string;
      endpoint_url: string;
      secret?: string;
    }) => {
      const { data, error } = await supabase
        .from('integration_webhooks')
        .insert({
          ...webhook,
          active: true,
          status: 'active',
          total_received: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as WebhookSubscription;
    },
    onSuccess: (_, variables) => {
      if (variables.connection_id) {
        queryClient.invalidateQueries({
          queryKey: ['integrations', 'webhooks', variables.connection_id],
        });
      }
    },
  });
}

/**
 * Update webhook mutation
 */
export function useUpdateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      webhookId,
      updates,
    }: {
      webhookId: string;
      updates: Partial<WebhookSubscription>;
    }) => {
      const { data, error } = await supabase
        .from('integration_webhooks')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', webhookId)
        .select()
        .single();

      if (error) throw error;
      return data as WebhookSubscription;
    },
    onSuccess: (data) => {
      if (data.connection_id) {
        queryClient.invalidateQueries({
          queryKey: ['integrations', 'webhooks', data.connection_id],
        });
      }
    },
  });
}

/**
 * Delete webhook mutation
 */
export function useDeleteWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ webhookId, connectionId }: { webhookId: string; connectionId?: string }) => {
      const { error } = await supabase
        .from('integration_webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
      return webhookId;
    },
    onSuccess: (_, variables) => {
      if (variables.connectionId) {
        queryClient.invalidateQueries({
          queryKey: ['integrations', 'webhooks', variables.connectionId],
        });
      }
    },
  });
}

// =====================================================
// Sync Queries
// =====================================================

/**
 * Fetch sync logs for a connection
 */
export function useSyncLogs(connectionId: string | undefined, limit = 20) {
  return useQuery({
    queryKey: ['integrations', 'sync-logs', connectionId, limit],
    queryFn: async () => {
      if (!connectionId) return [];

      const { data, error } = await supabase
        .from('integration_sync_logs')
        .select('*')
        .eq('connection_id', connectionId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SyncLog[];
    },
    enabled: !!connectionId,
  });
}

/**
 * Trigger sync mutation
 */
export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sync: {
      connectionId: string;
      syncType: string;
      config: SyncConfig;
    }) => {
      // This would call the sync function via Edge Function
      const { data, error } = await supabase.functions.invoke('integration-sync', {
        body: sync,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['integrations', 'sync-logs', variables.connectionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['integrations', 'connections', variables.connectionId],
      });
    },
  });
}

// =====================================================
// Integration Registry Queries
// =====================================================

/**
 * Fetch all available integrations (from registry, not database)
 */
export function useAvailableIntegrations() {
  return useQuery({
    queryKey: ['integrations', 'registry'],
    queryFn: async () => {
      // This imports from the local registry
      const { getAllIntegrations } = await import('./registry');
      return getAllIntegrations();
    },
    staleTime: Infinity, // Registry doesn't change
  });
}

/**
 * Fetch integration by ID
 */
export function useIntegration(integrationId: string | undefined) {
  return useQuery({
    queryKey: ['integrations', 'registry', integrationId],
    queryFn: async () => {
      if (!integrationId) return null;

      const { getIntegration } = await import('./registry');
      return getIntegration(integrationId) || null;
    },
    enabled: !!integrationId,
    staleTime: Infinity,
  });
}

/**
 * Fetch integrations by category
 */
export function useIntegrationsByCategory(category: string | undefined) {
  return useQuery({
    queryKey: ['integrations', 'registry', 'category', category],
    queryFn: async () => {
      if (!category) return [];

      const { getIntegrationsByCategory } = await import('./registry');
      return getIntegrationsByCategory(category as any);
    },
    enabled: !!category,
    staleTime: Infinity,
  });
}

// =====================================================
// Utility Queries
// =====================================================

/**
 * Check if integration is connected
 */
export function useIsIntegrationConnected(
  organizationId: string | undefined,
  integrationId: string | undefined
) {
  const { data: connections } = useConnections(organizationId);

  return {
    isConnected: connections?.some(
      (c) => c.integration_id === integrationId && c.status === 'active'
    ) ?? false,
    connection: connections?.find(
      (c) => c.integration_id === integrationId && c.status === 'active'
    ),
  };
}
