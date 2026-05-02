import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import {
  fetchCompanies,
  fetchCompanyById,
  fetchCompanyContacts,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../lib/supabase';
import type { Database } from '@/types/database.types';

type Company = Database['public']['Tables']['companies']['Row'] & Record<string, any>;
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export interface UseCompaniesParams {
  search?: string;
  ownerId?: string;
  sortBy?: 'created_at' | 'updated_at' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching companies with filtering and pagination
 */
export function useCompanies(params: UseCompaniesParams = {}) {
  const { currentOrganization } = useAuth();
  const {
    search,
    ownerId,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 50,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: ['companies', currentOrganization?.id, search, ownerId, sortBy, sortOrder, page, pageSize],
    queryFn: () =>
      fetchCompanies({
        organizationId: currentOrganization!.id,
        search,
        ownerId,
        sortBy,
        sortOrder,
        page,
        pageSize,
      }),
    enabled: enabled && !!currentOrganization,
  });
}

/**
 * Hook for fetching a single company by ID
 */
export function useCompany(companyId: string) {
  return useQuery({
    queryKey: ['company', companyId],
    queryFn: () => fetchCompanyById(companyId),
    enabled: !!companyId,
  });
}

/**
 * Hook for fetching contacts for a company
 */
export function useCompanyContacts(companyId: string) {
  return useQuery({
    queryKey: ['company-contacts', companyId],
    queryFn: () => fetchCompanyContacts(companyId),
    enabled: !!companyId,
  });
}

/**
 * Hook for creating a company
 */
export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (company: Omit<CompanyInsert, 'organization_id'>) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      return createCompany({
        ...company,
        organization_id: currentOrganization.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}

/**
 * Hook for updating a company
 */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, updates }: { companyId: string; updates: CompanyUpdate }) => {
      return updateCompany(companyId, updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId] });
    },
  });
}

/**
 * Hook for deleting a company
 */
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      return deleteCompany(companyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });
}
