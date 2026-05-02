import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ClipboardList, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BadgeUntitled, ButtonUntitled, CardUntitled, PageHeaderUntitled } from '@/components/ui';
import { fetchCustomerAudits } from './auditApi';
import { auditDraftFromRecord, auditLabels, buildAuditPreview } from './preview';
import type { AuditRequestRecord, AuditStatus } from './types';

const statusVariant: Record<AuditStatus, 'info' | 'warning' | 'success' | 'secondary' | 'primary'> = {
  submitted: 'info',
  reviewing: 'warning',
  brief_ready: 'success',
  sprint_proposed: 'primary',
  closed: 'secondary',
};

const statusLabel: Record<AuditStatus, string> = {
  submitted: 'Submitted',
  reviewing: 'Reviewing',
  brief_ready: 'Brief ready',
  sprint_proposed: 'Sprint proposed',
  closed: 'Closed',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not submitted';

export const AuditListPage = () => {
  const { organizationId } = useAuth();
  const auditsQuery = useQuery({
    queryKey: ['customer-audits', organizationId],
    queryFn: () => fetchCustomerAudits(organizationId),
    enabled: Boolean(organizationId),
  });

  const audits = auditsQuery.data ?? [];

  return (
    <div className="flex h-screen flex-col">
      <PageHeaderUntitled
        title="Flow Audits"
        description="Saved FlowStack audits, directional previews, and review paths."
        icon={ClipboardList}
        actions={
          <Link to="/audit">
            <ButtonUntitled size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              New audit
            </ButtonUntitled>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        {auditsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(item => (
              <div key={item} className="h-56 animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        ) : audits.length === 0 ? (
          <CardUntitled className="max-w-2xl" title="No audits yet" description="Start with a form-only audit. No files, CLI, or connectors are required for the MVP path.">
            <Link to="/audit">
              <ButtonUntitled rightIcon={<ArrowRight className="h-4 w-4" />}>Start first audit</ButtonUntitled>
            </Link>
          </CardUntitled>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {audits.map(audit => (
              <AuditCard key={audit.id} audit={audit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AuditCard = ({ audit }: { audit: AuditRequestRecord }) => {
  const draft = auditDraftFromRecord(audit);
  const preview = buildAuditPreview(draft);

  return (
    <Link to={`/dashboard/audits/${audit.id}`} className="block">
      <CardUntitled interactive className="h-full">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
              {formatDate(audit.submitted_at ?? audit.created_at)}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-text-primary">
              {audit.business_name || 'Untitled flow audit'}
            </h2>
          </div>
          <BadgeUntitled variant={statusVariant[audit.status] ?? 'info'}>
            {statusLabel[audit.status] ?? audit.status}
          </BadgeUntitled>
        </div>

        <div className="mb-4 grid gap-2 text-sm text-text-secondary">
          <p>
            <span className="text-text-muted">Business:</span> {auditLabels.businessType(draft.businessType)}
          </p>
          <p>
            <span className="text-text-muted">Lens:</span> {preview.classification.primaryLens}
          </p>
          <p>
            <span className="text-text-muted">Evidence:</span> {preview.evidenceCompleteness.score}%
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-text-secondary">
          {audit.current_pain || 'No flow context provided.'}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary">
          View audit
          <ArrowRight className="h-4 w-4" />
        </div>
      </CardUntitled>
    </Link>
  );
};
