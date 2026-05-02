import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  agent_type: 'orchestrator' | 'crm' | 'marketing' | 'analytics' | 'builder' | 'workflow' | 'custom';
  capabilities: string[];
  config: Record<string, unknown>;
  system_prompt: string | null;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentCreateInput {
  name: string;
  description?: string;
  agent_type?: Agent['agent_type'];
  capabilities?: string[];
  config?: Record<string, unknown>;
  system_prompt?: string;
  icon?: string;
  color?: string;
}

export interface AgentUpdateInput extends Partial<AgentCreateInput> {
  is_active?: boolean;
}

export function useAgents() {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['agents', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) return [];

      const { data, error } = await (supabase
        .from('agents') as any)
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Agent[];
    },
    enabled: !!currentOrganization?.id,
  });
}

export function useAgent(agentId: string | undefined) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) return null;

      const { data, error } = await (supabase
        .from('agents') as any)
        .select('*')
        .eq('id', agentId)
        .single();

      if (error) throw error;
      return data as Agent;
    },
    enabled: !!agentId,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (input: AgentCreateInput) => {
      const { data, error } = await (supabase
        .from('agents') as any)
        .insert({
          organization_id: currentOrganization?.id,
          name: input.name,
          description: input.description || null,
          agent_type: input.agent_type || 'custom',
          capabilities: input.capabilities || [],
          config: input.config || {},
          system_prompt: input.system_prompt || null,
          icon: input.icon || 'Bot',
          color: input.color || '#6366f1',
        })
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: AgentUpdateInput & { id: string }) => {
      const { data, error } = await (supabase
        .from('agents') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', variables.id] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      const { error } = await (supabase
        .from('agents') as any)
        .delete()
        .eq('id', agentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

// Available capability vocabulary
export const AGENT_CAPABILITIES: Record<string, { label: string; description: string; agentTypes: string[] }> = {
  'crm:read_contacts': { label: 'Read Contacts', description: 'View and search contacts', agentTypes: ['crm', 'orchestrator'] },
  'crm:read_companies': { label: 'Read Companies', description: 'View and search companies', agentTypes: ['crm', 'orchestrator'] },
  'crm:create_contact': { label: 'Create Contacts', description: 'Create new contacts', agentTypes: ['crm'] },
  'crm:update_contact': { label: 'Update Contacts', description: 'Edit existing contacts', agentTypes: ['crm'] },
  'workflow:trigger': { label: 'Trigger Workflows', description: 'Start workflow executions', agentTypes: ['workflow', 'orchestrator'] },
  'workflow:read_status': { label: 'Read Workflow Status', description: 'View workflow execution status', agentTypes: ['workflow', 'orchestrator'] },
  'email:send': { label: 'Send Emails', description: 'Send emails via Resend', agentTypes: ['marketing', 'orchestrator'] },
  'email:read': { label: 'Read Email History', description: 'View sent/received emails', agentTypes: ['marketing'] },
  'marketing:read_campaigns': { label: 'Read Campaigns', description: 'View marketing campaigns', agentTypes: ['marketing'] },
  'marketing:create_campaign': { label: 'Create Campaigns', description: 'Create marketing campaigns', agentTypes: ['marketing'] },
  'analytics:read': { label: 'Read Analytics', description: 'View analytics data', agentTypes: ['analytics', 'orchestrator'] },
  'analytics:report': { label: 'Generate Reports', description: 'Create analytics reports', agentTypes: ['analytics'] },
  'builder:read_pages': { label: 'Read Pages', description: 'View site pages', agentTypes: ['builder'] },
  'builder:edit_pages': { label: 'Edit Pages', description: 'Modify page content', agentTypes: ['builder'] },
  'github:read_repos': { label: 'Read Repositories', description: 'View GitHub repositories', agentTypes: ['orchestrator', 'custom'] },
  'chat:respond': { label: 'Chat Responses', description: 'Generate chat responses', agentTypes: ['crm', 'orchestrator', 'custom'] },
};

// Default capabilities per agent type
export const DEFAULT_CAPABILITIES: Record<string, string[]> = {
  orchestrator: ['workflow:trigger', 'workflow:read_status', 'crm:read_contacts', 'analytics:read', 'chat:respond'],
  crm: ['crm:read_contacts', 'crm:read_companies', 'crm:create_contact', 'crm:update_contact', 'chat:respond'],
  marketing: ['email:send', 'email:read', 'marketing:read_campaigns', 'marketing:create_campaign'],
  analytics: ['analytics:read', 'analytics:report'],
  builder: ['builder:read_pages', 'builder:edit_pages'],
  workflow: ['workflow:trigger', 'workflow:read_status'],
  custom: [],
};
