import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, FilePlus2, RefreshCw, Save } from 'lucide-react';
import { BadgeUntitled, ButtonUntitled, CardUntitled, PageHeaderUntitled } from '@/components/ui';
import { fetchAdminAudits, updateAdminAudit } from './auditApi';
import { DIRECTIONAL_ESTIMATE_DISCLAIMER, auditDraftFromRecord, auditLabels, buildAuditPreview } from './preview';
import { buildAuditQuoteDraft, formatQuoteRange, normalizeAuditQuote, quoteReadinessLabel } from './quote';
import type { AuditQuoteDraft, AuditRequestRecord, AuditStatus } from './types';

const statusOptions: Array<{ id: AuditStatus; label: string }> = [
  { id: 'submitted', label: 'Submitted' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'brief_ready', label: 'Brief ready' },
  { id: 'sprint_proposed', label: 'Sprint proposed' },
  { id: 'closed', label: 'Closed' },
];

const statusVariant: Record<AuditStatus, 'info' | 'warning' | 'success' | 'secondary' | 'primary'> = {
  submitted: 'info',
  reviewing: 'warning',
  brief_ready: 'success',
  sprint_proposed: 'primary',
  closed: 'secondary',
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not submitted';

export const AuditOpsPage = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<AuditStatus>('submitted');
  const [internalNotes, setInternalNotes] = useState('');
  const [flowBriefJson, setFlowBriefJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const auditsQuery = useQuery({
    queryKey: ['audit-admin-list'],
    queryFn: fetchAdminAudits,
    retry: false,
  });

  const audits = useMemo(() => auditsQuery.data ?? [], [auditsQuery.data]);
  const selectedAudit = useMemo(
    () => audits.find(audit => audit.id === selectedId) ?? audits[0] ?? null,
    [audits, selectedId]
  );

  useEffect(() => {
    if (!selectedId && audits[0]) setSelectedId(audits[0].id);
  }, [audits, selectedId]);

  useEffect(() => {
    if (!selectedAudit) return;

    setStatus(selectedAudit.status);
    setInternalNotes(typeof selectedAudit.metadata?.internalNotes === 'string' ? selectedAudit.metadata.internalNotes : '');
    setFlowBriefJson(JSON.stringify(storedFlowBrief(selectedAudit), null, 2));
    setJsonError(null);
  }, [selectedAudit]);

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedAudit) throw new Error('Select an audit first');

      let parsedBrief: Record<string, unknown>;
      try {
        const parsed = JSON.parse(flowBriefJson);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error('Flow Brief must be a JSON object');
        }
        parsedBrief = parsed as Record<string, unknown>;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Flow Brief JSON is invalid';
        setJsonError(message);
        throw new Error(message);
      }

      if ((status === 'brief_ready' || status === 'sprint_proposed') && Object.keys(parsedBrief).length === 0) {
        const message = 'Add a human-reviewed Flow Brief before moving this audit to brief ready or sprint proposed.';
        setJsonError(message);
        throw new Error(message);
      }

      setJsonError(null);

      return updateAdminAudit({
        auditRequestId: selectedAudit.id,
        status,
        internalNotes,
        flowBrief: parsedBrief,
      });
    },
    onSuccess: audit => {
      queryClient.setQueryData<AuditRequestRecord[]>(['audit-admin-list'], current =>
        (current ?? []).map(item => item.id === audit.id ? audit : item)
      );
    },
  });

  return (
    <div className="flex h-screen flex-col">
      <PageHeaderUntitled
        title="Audit Ops"
        description="Internal FlowStack workbench for submitted audits and human-reviewed Flow Briefs."
        icon={ClipboardCheck}
        actions={
          <ButtonUntitled
            variant="secondary"
            size="sm"
            onClick={() => auditsQuery.refetch()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Refresh
          </ButtonUntitled>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-[360px_1fr] overflow-hidden">
        <aside className="overflow-y-auto border-r border-border bg-background p-4">
          {auditsQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(item => <div key={item} className="h-28 animate-pulse rounded-xl bg-surface" />)}
            </div>
          ) : auditsQuery.error ? (
            <CardUntitled variant="outline">
              <p className="text-sm font-semibold text-error">Audit ops unavailable</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {auditsQuery.error instanceof Error ? auditsQuery.error.message : 'FlowStack admin access is required.'}
              </p>
            </CardUntitled>
          ) : audits.length === 0 ? (
            <CardUntitled title="No audits yet" description="Submitted audits will appear here." />
          ) : (
            <div className="space-y-3">
              {audits.map(audit => {
                const selected = selectedAudit?.id === audit.id;
                const priorityRequested = typeof audit.metadata?.priorityAuditRequestedAt === 'string';

                return (
                  <button
                    key={audit.id}
                    type="button"
                    onClick={() => setSelectedId(audit.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selected ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/40'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{audit.business_name || 'Untitled audit'}</p>
                        <p className="mt-1 text-xs text-text-muted">{formatDate(audit.submitted_at ?? audit.created_at)}</p>
                      </div>
                      <BadgeUntitled variant={statusVariant[audit.status]}>{audit.status}</BadgeUntitled>
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-text-secondary">{audit.current_pain}</p>
                    {priorityRequested && (
                      <BadgeUntitled className="mt-3" variant="gold">Priority requested</BadgeUntitled>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <main className="overflow-y-auto p-6">
          {!selectedAudit ? (
            <CardUntitled title="Select an audit" description="Choose a submitted audit to review." />
          ) : (
            <AuditEditor
              audit={selectedAudit}
              status={status}
              internalNotes={internalNotes}
              flowBriefJson={flowBriefJson}
              jsonError={jsonError}
              isSaving={updateMutation.isPending}
              saveError={updateMutation.error}
              onStatusChange={setStatus}
              onInternalNotesChange={setInternalNotes}
              onFlowBriefJsonChange={setFlowBriefJson}
              onSave={() => updateMutation.mutate()}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const AuditEditor = ({
  audit,
  status,
  internalNotes,
  flowBriefJson,
  jsonError,
  isSaving,
  saveError,
  onStatusChange,
  onInternalNotesChange,
  onFlowBriefJsonChange,
  onSave,
}: {
  audit: AuditRequestRecord;
  status: AuditStatus;
  internalNotes: string;
  flowBriefJson: string;
  jsonError: string | null;
  isSaving: boolean;
  saveError: Error | null;
  onStatusChange: (status: AuditStatus) => void;
  onInternalNotesChange: (value: string) => void;
  onFlowBriefJsonChange: (value: string) => void;
  onSave: () => void;
}) => {
  const draft = auditDraftFromRecord(audit);
  const preview = buildAuditPreview(draft);
  const generatedQuote = buildAuditQuoteDraft(draft, preview);
  const quote = normalizeAuditQuote(audit.flow_brief?.quote, generatedQuote);
  const hasStoredBrief = Object.keys(storedFlowBrief(audit)).length > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <CardUntitled title="Submitted audit" description="Customer-provided evidence for this first pass.">
          <div className="grid gap-3 text-sm text-text-secondary">
            <p><span className="text-text-muted">Business:</span> {audit.business_name || 'Not provided'}</p>
            <p><span className="text-text-muted">Contact:</span> {audit.contact_email || 'Not provided'}</p>
            <p><span className="text-text-muted">Website:</span> {audit.website_url || 'Not provided'}</p>
            <p><span className="text-text-muted">Type:</span> {auditLabels.businessType(draft.businessType)}</p>
            <p><span className="text-text-muted">Team:</span> {auditLabels.teamSizeRange(draft.teamSizeRange)}</p>
            <p><span className="text-text-muted">Spend:</span> {auditLabels.monthlyToolSpendRange(draft.monthlyToolSpendRange)}</p>
            <p><span className="text-text-muted">Urgency:</span> {auditLabels.urgency(draft.urgency)}</p>
          </div>
          <div className="mt-5 rounded-lg border border-border bg-background p-4 text-sm leading-6 text-text-secondary">
            {audit.current_pain}
          </div>
        </CardUntitled>

        <CardUntitled title="Directional preview" description="Use this as a starting point, not the final brief.">
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <Metric label="Lens" value={preview.classification.primaryLens} />
            <Metric label="Evidence" value={`${preview.evidenceCompleteness.score}%`} />
            <Metric label="Urgency" value={preview.classification.urgency} />
          </div>
          <p className="text-sm leading-6 text-text-secondary">{preview.summary}</p>
          <p className="mt-4 text-xs leading-5 text-text-muted">{preview.disclaimer}</p>
        </CardUntitled>

        <QuoteStarterCard quote={quote} />
      </div>

      <div className="space-y-6">
        <CardUntitled title="Review controls" description="Move the audit through the simple MVP status path.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-text-primary">Status</span>
              <select
                value={status}
                onChange={event => onStatusChange(event.target.value as AuditStatus)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-text-primary"
              >
                {statusOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-text-primary">Internal notes</span>
            <textarea
              value={internalNotes}
              onChange={event => onInternalNotesChange(event.target.value)}
              className="min-h-28 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 text-text-primary"
              placeholder="Review notes, quote context, manual invoice status, or call notes..."
            />
          </label>
        </CardUntitled>

        <CardUntitled
          title="Human-reviewed Flow Brief"
          description="Empty JSON keeps the final brief unpublished. Insert the starter only when you are ready to review and edit it."
        >
          {!hasStoredBrief && (
            <div className="mb-4 rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold text-text-primary">Review starter is available</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                This generated starter is not saved automatically and is not customer-visible until you save a reviewed brief.
              </p>
              <ButtonUntitled
                className="mt-3"
                variant="secondary"
                size="sm"
                onClick={() => onFlowBriefJsonChange(JSON.stringify(seedFlowBrief(audit), null, 2))}
                leftIcon={<FilePlus2 className="h-4 w-4" />}
              >
                Insert review starter
              </ButtonUntitled>
            </div>
          )}
          <textarea
            value={flowBriefJson}
            onChange={event => onFlowBriefJsonChange(event.target.value)}
            className="min-h-[520px] w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs leading-6 text-text-primary"
            spellCheck={false}
          />
          {(jsonError || saveError) && (
            <p className="mt-3 text-sm text-error">
              {jsonError || saveError?.message}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <ButtonUntitled isLoading={isSaving} onClick={onSave} leftIcon={<Save className="h-4 w-4" />}>
              Save review
            </ButtonUntitled>
          </div>
        </CardUntitled>
      </div>
    </div>
  );
};

const QuoteStarterCard = ({ quote }: { quote: AuditQuoteDraft }) => (
  <CardUntitled title="Quote starter" description="Use this to shape the manual quote before changing status or sending an invoice.">
    <div className="mb-4 grid gap-3 md:grid-cols-3">
      <Metric label="Readiness" value={quoteReadinessLabel(quote.readiness)} />
      <Metric label="Range" value={formatQuoteRange(quote)} />
      <Metric label="Confidence" value={`${quote.confidence}%`} />
    </div>

    {quote.requiredClarifications.length > 0 ? (
      <div className="space-y-3">
        {quote.requiredClarifications.map(question => (
          <div key={question.id} className="rounded-lg border border-border bg-background p-3">
            <p className="text-sm font-semibold text-text-primary">{question.question}</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">{question.why}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm leading-6 text-text-secondary">Enough context exists for a directional range. Confirm assumptions before invoicing.</p>
    )}
  </CardUntitled>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-background p-3">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</p>
    <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
  </div>
);

const storedFlowBrief = (audit: AuditRequestRecord) =>
  audit.flow_brief && Object.keys(audit.flow_brief).length > 0 ? audit.flow_brief : {};

const seedFlowBrief = (audit: AuditRequestRecord) => {
  if (audit.flow_brief && Object.keys(audit.flow_brief).length > 0) return audit.flow_brief;

  const draft = auditDraftFromRecord(audit);
  const preview = buildAuditPreview(draft);
  const quote = buildAuditQuoteDraft(draft, preview);

  return {
    executiveSummary: preview.summary,
    currentStackSignals: {
      businessType: preview.classification.businessType,
      primaryLens: preview.classification.primaryLens,
      urgency: preview.classification.urgency,
      tools: draft.tools,
      projectSignals: draft.projectSignals,
    },
    likelyHelpPoints: preview.likelyFlowGaps.map(item => ({
      title: item.title,
      evidence: 'Based on submitted intake only.',
      businessImpact: item.description,
      recommendedNextAction: 'Confirm during human review before quoting.',
    })),
    keepConnectImproveReplaceOwn: {
      keep: [],
      connect: [],
      improve: preview.recommendedNextSteps.map(item => item.title),
      replace: [],
      own: preview.ownedSliceCandidates.map(item => item.title),
    },
    firstImplementationSprint: '',
    quote,
    quoteReviewChecklist: [
      'Confirm the selected flow lens and desired outcome with the customer.',
      'Answer or remove any required clarifications before moving to reviewed_quote.',
      'Adjust the range only after human review and manual fit confirmation.',
      'Keep implementation scope separate from the audit quote until a sprint is proposed.',
    ],
    disclaimer: DIRECTIONAL_ESTIMATE_DISCLAIMER,
  };
};
