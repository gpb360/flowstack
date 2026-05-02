import { supabase } from '@/lib/supabase';
import type { AuditIntakeDraft } from './types';

export interface SubmitAuditRequestInput {
  draft: AuditIntakeDraft;
  organizationId?: string | null;
}

export interface SubmitAuditRequestResult {
  auditRequestId: string;
  notification?: {
    internal?: AuditNotificationResult;
    customer?: AuditNotificationResult;
  };
}

export interface AuditNotificationResult {
  sent: boolean;
  provider?: string;
  id?: string | null;
  skippedReason?: string;
  error?: string;
}

export const submitAuditRequest = async ({
  draft,
  organizationId,
}: SubmitAuditRequestInput): Promise<SubmitAuditRequestResult> => {
  const { data, error } = await supabase.functions.invoke<SubmitAuditRequestResult>('audit-submit', {
    body: {
      draft,
      organizationId: organizationId ?? null,
    },
  });

  if (error) {
    throw new Error(error.message || 'Unable to submit audit request');
  }

  if (!data?.auditRequestId) {
    throw new Error('Audit request was not created');
  }

  return data;
};
