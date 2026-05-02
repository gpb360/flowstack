import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

export interface DashboardStats {
  contacts: number;
  companies: number;
  activeWorkflows: number;
  completedCampaigns: number;
}

export const useStatsQuery = () => {
  const { currentOrganization } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', currentOrganization?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!currentOrganization) {
        return { contacts: 0, companies: 0, activeWorkflows: 0, completedCampaigns: 0 };
      }

      // Parallelize fetches for performance
      const [
        { count: contactsCount },
        { count: companiesCount },
        { count: workflowsCount },
        { count: campaignsCount }
      ] = await Promise.all([
        supabase
          .from('contacts')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id),
        supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id),
        supabase
          .from('workflows')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .eq('status', 'active'),
        supabase
          .from('marketing_campaigns')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
          .eq('status', 'completed')
      ]);

      return {
        contacts: contactsCount || 0,
        companies: companiesCount || 0,
        activeWorkflows: workflowsCount || 0,
        completedCampaigns: campaignsCount || 0,
      };
    },
    enabled: !!currentOrganization,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
