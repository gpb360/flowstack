// @ts-nocheck
/**
 * useFormSubmissions Hook
 * Manages form submissions data fetching and operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface SubmissionFilters {
  formId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export function useFormSubmissions(organizationId: string | undefined) {
  const queryClient = useQueryClient();

  // Fetch submissions
  const {
    data: submissions = [],
    isLoading: isLoadingSubmissions,
    error: submissionsError,
  } = useQuery({
    queryKey: ['form-submissions', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('form_submissions')
        .select(`
          *,
          forms:form_id (
            name
          ),
          contacts:contact_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('organization_id', organizationId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });

  // Fetch single submission
  const useSubmission = (submissionId: string) => {
    return useQuery({
      queryKey: ['form-submission', submissionId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('form_submissions')
          .select('*')
          .eq('id', submissionId)
          .single();

        if (error) throw error;
        return data;
      },
      enabled: !!submissionId,
    });
  };

  // Update submission status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      submissionId,
      status,
    }: {
      submissionId: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from('form_submissions')
        .update({ status })
        .eq('id', submissionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-submissions'] });
    },
  });

  // Delete submission
  const deleteMutation = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-submissions'] });
    },
  });

  // Export submissions
  const exportSubmissions = async (formId: string) => {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', formId);

    if (error) throw error;

    // Convert to CSV
    const csv = convertToCSV(data || []);
    downloadCSV(csv, `submissions-${formId}.csv`);
  };

  return {
    submissions,
    isLoadingSubmissions,
    submissionsError,
    useSubmission,
    updateStatus: (submissionId: string, status: string) =>
      updateStatusMutation.mutate({ submissionId, status }),
    deleteSubmission: (submissionId: string) => deleteMutation.mutate(submissionId),
    exportSubmissions,
  };
}

// Helper: Convert to CSV
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

// Helper: Download CSV
function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
