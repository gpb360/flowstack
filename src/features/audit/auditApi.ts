import { supabase } from '@/lib/supabase';
import type { AuditRequestRecord, AuditStatus } from './types';

export interface RequestPriorityAuditResult {
  auditRequestId: string;
  requestedAt: string;
  notification?: {
    sent: boolean;
    provider?: string;
    id?: string | null;
    skippedReason?: string;
    error?: string;
  };
}

export interface AdminAuditUpdateInput {
  auditRequestId: string;
  status: AuditStatus;
  internalNotes: string;
  flowBrief: Record<string, unknown>;
}

export const fetchCustomerAudits = async (organizationId?: string | null): Promise<AuditRequestRecord[]> => {
  let query = supabase
    .from('audit_requests')
    .select('*')
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (organizationId) {
    query = query.eq('organization_id', organizationId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as AuditRequestRecord[];
};

export const fetchCustomerAudit = async (auditRequestId: string): Promise<AuditRequestRecord> => {
  const { data, error } = await supabase
    .from('audit_requests')
    .select('*')
    .eq('id', auditRequestId)
    .single();

  if (error) throw error;
  return data as AuditRequestRecord;
};

export const requestPriorityAudit = async (auditRequestId: string): Promise<RequestPriorityAuditResult> => {
  const { data, error } = await supabase.functions.invoke<RequestPriorityAuditResult>('audit-priority-request', {
    body: { auditRequestId },
  });

  if (error) throw new Error(error.message || 'Unable to request priority audit');
  if (!data?.auditRequestId) throw new Error('Priority audit request was not recorded');

  return data;
};

export const fetchAdminAudits = async (): Promise<AuditRequestRecord[]> => {
  const { data, error } = await supabase.functions.invoke<{ audits: AuditRequestRecord[] }>('audit-admin-list');

  if (error) throw new Error(error.message || 'Unable to load audit operations');
  return data?.audits ?? [];
};

export const updateAdminAudit = async (input: AdminAuditUpdateInput): Promise<AuditRequestRecord> => {
  const { data, error } = await supabase.functions.invoke<{ audit: AuditRequestRecord }>('audit-admin-update', {
    body: input,
  });

  if (error) throw new Error(error.message || 'Unable to update audit');
  if (!data?.audit) throw new Error('Audit update did not return a record');

  return data.audit;
};
