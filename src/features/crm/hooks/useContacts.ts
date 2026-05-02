import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/toast';
import {
  fetchContacts,
  fetchContactById,
  createContact,
  updateContact,
  deleteContact,
  fetchContactTags,
  addTagToContact,
  removeTagFromContact,
  upsertLeadScore,
} from '../lib/supabase';
import { calculateLeadScore } from '../lib/lead-scoring';
import type { Database } from '@/types/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'] & Record<string, any>;
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export interface UseContactsParams {
  search?: string;
  companyId?: string;
  ownerId?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'first_name' | 'last_name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

/**
 * Hook for fetching contacts with filtering and pagination
 */
export function useContacts(params: UseContactsParams = {}) {
  const { currentOrganization } = useAuth();
  const {
    search,
    companyId,
    ownerId,
    tags,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 50,
    enabled = true,
  } = params;

  return useQuery({
    queryKey: ['contacts', currentOrganization?.id, search, companyId, ownerId, tags, sortBy, sortOrder, page, pageSize],
    queryFn: () =>
      fetchContacts({
        organizationId: currentOrganization!.id,
        search,
        companyId,
        ownerId,
        tags,
        sortBy,
        sortOrder,
        page,
        pageSize,
      }),
    enabled: enabled && !!currentOrganization,
  });
}

/**
 * Hook for fetching a single contact by ID
 */
export function useContact(contactId: string) {
  return useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchContactById(contactId),
    enabled: !!contactId,
  });
}

/**
 * Hook for creating a contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (contact: Omit<ContactInsert, 'organization_id'>) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');
      return createContact({
        ...contact,
        organization_id: currentOrganization.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast({ title: 'Contact created', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to create contact', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}

/**
 * Hook for updating a contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string; updates: ContactUpdate }) => {
      return updateContact(contactId, updates);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', variables.contactId] });
      addToast({ title: 'Contact updated', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to update contact', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}

/**
 * Hook for deleting a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (contactId: string) => {
      return deleteContact(contactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      addToast({ title: 'Contact deleted', variant: 'success', duration: 3000 });
    },
    onError: (error) => {
      addToast({ title: 'Failed to delete contact', description: error.message, variant: 'destructive', duration: 5000 });
    },
  });
}

/**
 * Hook for fetching contact tags
 */
export function useContactTags(contactId: string) {
  return useQuery({
    queryKey: ['contact-tags', contactId],
    queryFn: () => fetchContactTags(contactId),
    enabled: !!contactId,
  });
}

/**
 * Hook for adding a tag to a contact
 */
export function useAddTagToContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
      return addTagToContact({ contactId, tagId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags', variables.contactId] });
    },
  });
}

/**
 * Hook for removing a tag from a contact
 */
export function useRemoveTagFromContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
      return removeTagFromContact({ contactId, tagId });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact-tags', variables.contactId] });
    },
  });
}

/**
 * Hook for calculating and storing lead score
 */
export function useCalculateLeadScore() {
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      contact: Contact;
      company?: Database['public']['Tables']['companies']['Row'] & Record<string, any>;
      activities: Database['public']['Tables']['activities']['Row'][];
      deals: Database['public']['Tables']['deals']['Row'][];
    }) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      // Calculate score
      const scoreResult = calculateLeadScore(input);

      // Store in database
      await upsertLeadScore({
        organizationId: currentOrganization.id,
        contactId: input.contact.id,
        score: scoreResult.score,
        grade: scoreResult.grade,
        factors: scoreResult.factors,
      });

      return scoreResult;
    },
  });
}

/**
 * Hook for importing contacts from CSV
 */
export function useImportContacts() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();

  return useMutation({
    mutationFn: async (contacts: Omit<ContactInsert, 'organization_id'>[]) => {
      if (!currentOrganization?.id) throw new Error('No organization selected');

      const contactsWithOrg = contacts.map((contact) => ({
        ...contact,
        organization_id: currentOrganization.id,
      }));

      // Batch create contacts
      const results = await Promise.all(
        contactsWithOrg.map((contact) => createContact(contact))
      );

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}


// useTags is exported from useActivities.ts
