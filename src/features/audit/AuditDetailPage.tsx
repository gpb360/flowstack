import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BadgeDollarSign, CalendarClock, CheckCircle2, ClipboardList, HelpCircle, Mail, MessageSquareText, Sparkles, WalletCards } from 'lucide-react';
import { BadgeUntitled, ButtonUntitled, CardUntitled, PageHeaderUntitled } from '@/components/ui';
import { auditFocusOptions, auditToolOptions } from './auditQuestions';
import { fetchCustomerAudit, requestPriorityAudit } from './auditApi';
import { auditDraftFromRecord, auditLabels, buildAuditPreview } from './preview';
import { buildAuditQuoteDraft, formatQuoteRange, normalizeAuditQuote, quoteBusinessContextLabel, quoteReadinessLabel } from './quote';
import type { AuditClarificationQuestion, AuditQuoteDraft, AuditRequestRecord, AuditStatus, FlowBriefPreviewItem } from './types';

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
  value ? new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Not available';

export const AuditDetailPage = () => {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const auditQuery = useQuery({
    queryKey: ['customer-audit', auditId],
    queryFn: () => fetchCustomerAudit(auditId ?? ''),
    enabled: Boolean(auditId),
  });

  const priorityMutation = useMutation({
    mutationFn: () => requestPriorityAudit(auditId ?? ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-audit', auditId] });
      queryClient.invalidateQueries({ queryKey: ['customer-audits'] });
    },
  });

  const audit = auditQuery.data;

  if (auditQuery.isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <PageHeaderUntitled title="Flow Audit" description="Loading saved audit..." icon={ClipboardList} />
        <div className="flex-1 p-6">
          <div className="h-96 animate-pulse rounded-xl border border-border bg-surface" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="flex h-screen flex-col">
        <PageHeaderUntitled title="Flow Audit" description="This audit could not be loaded." icon={ClipboardList} />
        <div className="flex-1 p-6">
          <ButtonUntitled variant="secondary" onClick={() => navigate('/dashboard/audits')} leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to audits
          </ButtonUntitled>
        </div>
      </div>
    );
  }

  return <AuditDetail audit={audit} isRequestingPriority={priorityMutation.isPending} onRequestPriority={() => priorityMutation.mutate()} priorityError={priorityMutation.error} />;
};

const AuditDetail = ({
  audit,
  isRequestingPriority,
  onRequestPriority,
  priorityError,
}: {
  audit: AuditRequestRecord;
  isRequestingPriority: boolean;
  onRequestPriority: () => void;
  priorityError: Error | null;
}) => {
  const draft = auditDraftFromRecord(audit);
  const preview = buildAuditPreview(draft);
  const hasFinalBrief = audit.flow_brief && Object.keys(audit.flow_brief).length > 0;
  const generatedQuote = buildAuditQuoteDraft(draft, preview);
  const storedQuote = normalizeAuditQuote(audit.flow_brief?.quote, generatedQuote);
  const canShowHumanReviewedBrief =
    hasFinalBrief &&
    (audit.status === 'brief_ready' || audit.status === 'sprint_proposed' || storedQuote.readiness === 'reviewed_quote');
  const quote = canShowHumanReviewedBrief ? storedQuote : generatedQuote;
  const priorityRequestedAt = typeof audit.metadata?.priorityAuditRequestedAt === 'string'
    ? audit.metadata.priorityAuditRequestedAt
    : '';
  const priorityDescription =
    quote.readiness === 'needs_context'
      ? 'Request a manual priority review. FlowStack will confirm range after context, fit, and assumptions are checked.'
      : `Request the paid ${formatQuoteRange(quote)} human-reviewed path. Payment is handled manually after fit is confirmed.`;
  const reviewEmailSubject = encodeURIComponent(`FlowStack review call for audit ${audit.id}`);
  const reviewEmailBody = encodeURIComponent(
    [
      `Audit ID: ${audit.id}`,
      `Business: ${audit.business_name || 'Not provided'}`,
      `Contact: ${audit.contact_email || 'Not provided'}`,
      `Quote readiness: ${quoteReadinessLabel(quote.readiness)}`,
      '',
      'I would like to review this FlowStack audit.',
    ].join('\n')
  );

  return (
    <div className="flex h-screen flex-col">
      <PageHeaderUntitled
        title={audit.business_name || 'Flow Audit'}
        description="Your saved audit preview, status, and review path."
        icon={ClipboardList}
        actions={
          <Link to="/dashboard/audits">
            <ButtonUntitled variant="secondary" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              All audits
            </ButtonUntitled>
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 xl:grid-cols-[1fr_0.74fr]">
          <div className="space-y-6">
            <CardUntitled>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Audit status</p>
                  <h2 className="mt-2 text-xl font-semibold text-text-primary">{statusLabel[audit.status]}</h2>
                </div>
                <BadgeUntitled variant={statusVariant[audit.status] ?? 'info'}>
                  {statusLabel[audit.status] ?? audit.status}
                </BadgeUntitled>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-text-secondary md:grid-cols-2">
                <p><span className="text-text-muted">Submitted:</span> {formatDate(audit.submitted_at ?? audit.created_at)}</p>
                <p><span className="text-text-muted">Business type:</span> {auditLabels.businessType(draft.businessType)}</p>
                <p><span className="text-text-muted">Team size:</span> {auditLabels.teamSizeRange(draft.teamSizeRange)}</p>
                <p><span className="text-text-muted">Tool spend:</span> {auditLabels.monthlyToolSpendRange(draft.monthlyToolSpendRange)}</p>
                <p><span className="text-text-muted">Urgency:</span> {auditLabels.urgency(draft.urgency)}</p>
                <p><span className="text-text-muted">Website:</span> {audit.website_url || 'Not provided'}</p>
              </div>
            </CardUntitled>

            <CardUntitled title="Submitted flow context" description="This is the raw material FlowStack is using for the first pass.">
              <div className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-text-secondary">
                {audit.current_pain}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <ChipGroup title="Focus areas" items={focusLabels(draft.focus)} />
                <ChipGroup title="Tools" items={toolLabels(draft.tools)} empty="No tools selected" />
                <ChipGroup title="Signals" items={draft.projectSignals} empty="No signals selected" />
                <div>
                  <p className="mb-2 text-sm font-semibold text-text-primary">Desired outcome</p>
                  <p className="text-sm leading-6 text-text-secondary">{audit.desired_outcome || 'Not provided yet.'}</p>
                </div>
              </div>
            </CardUntitled>

            <CardUntitled title="Directional FlowStack preview" description="This is not the final human-reviewed Flow Brief.">
              <div className="mb-5 grid gap-4 md:grid-cols-3">
                <Metric label="Primary lens" value={preview.classification.primaryLens} />
                <Metric label="Evidence" value={`${preview.evidenceCompleteness.score}%`} />
                <Metric label="Readiness" value={preview.evidenceCompleteness.label} />
              </div>

              <PreviewSection title="Likely flow gaps" items={preview.likelyFlowGaps} empty="No likely gaps yet. Add more context to improve the preview." />
              <PreviewSection title="Recommended next steps" items={preview.recommendedNextSteps} empty="FlowStack will suggest next steps after more context." />
              <PreviewSection title="Owned-slice candidates" items={preview.ownedSliceCandidates} empty="No ownership candidate is visible from the submitted evidence yet." />

              <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-text-muted">{preview.disclaimer}</p>
            </CardUntitled>

            <QuoteReadinessCard quote={quote} businessContext={quoteBusinessContextLabel(draft)} />

            {canShowHumanReviewedBrief && (
              <CardUntitled title="Human-reviewed Flow Brief" description="This section is added by FlowStack after review.">
                <HumanReviewedBrief flowBrief={audit.flow_brief} quote={quote} />
                <p className="mt-4 text-xs leading-5 text-text-muted">{preview.disclaimer}</p>
              </CardUntitled>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <CardUntitled variant="gold" title="Book a free review" description="Talk through the flow before committing to paid analysis.">
              <ButtonUntitled
                href={`mailto:hello@flowstack.com?subject=${reviewEmailSubject}&body=${reviewEmailBody}`}
                fullWidth
                leftIcon={<CalendarClock className="h-4 w-4" />}
              >
                Book free review
              </ButtonUntitled>
            </CardUntitled>

            <CardUntitled title="Priority Flow Audit" description={priorityDescription}>
              {priorityRequestedAt ? (
                <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-text-primary">
                  Priority audit requested on {formatDate(priorityRequestedAt)}.
                </div>
              ) : (
                <ButtonUntitled
                  fullWidth
                  variant="secondary"
                  isLoading={isRequestingPriority}
                  onClick={onRequestPriority}
                  leftIcon={<WalletCards className="h-4 w-4" />}
                >
                  {quote.readiness === 'needs_context' ? 'Request Priority Review' : 'Request Priority Flow Audit'}
                </ButtonUntitled>
              )}
              {priorityError && <p className="mt-3 text-sm text-error">{priorityError.message}</p>}
            </CardUntitled>

            <CardUntitled title="What happens next" description="FlowStack keeps this simple.">
              <div className="space-y-3 text-sm leading-6 text-text-secondary">
                <p className="flex gap-2"><Sparkles className="mt-1 h-4 w-4 text-primary" /> We review the submitted flow.</p>
                <p className="flex gap-2"><Mail className="mt-1 h-4 w-4 text-primary" /> You get a call path or a priority audit follow-up.</p>
                <p className="flex gap-2"><WalletCards className="mt-1 h-4 w-4 text-primary" /> Any paid work is scoped before invoicing.</p>
              </div>
            </CardUntitled>
          </aside>
        </div>
      </div>
    </div>
  );
};

const QuoteReadinessCard = ({ quote, businessContext }: { quote: AuditQuoteDraft; businessContext: string }) => (
  <CardUntitled
    title="Quote readiness"
    description="A useful quote needs enough context to price the review without pretending we know what we have not seen."
  >
    <div className="mb-5 grid gap-4 md:grid-cols-3">
      <Metric label="Readiness" value={quoteReadinessLabel(quote.readiness)} />
      <Metric label="Range" value={quote.readiness === 'needs_context' ? 'Pending context' : formatQuoteRange(quote)} />
      <Metric label="Confidence" value={`${quote.confidence}%`} />
    </div>

    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <BadgeDollarSign className="mt-0.5 h-5 w-5 text-primary" />
        <div>
          <p className="text-sm font-semibold text-text-primary">Current pricing context</p>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{businessContext}</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{quote.nextStep}</p>
        </div>
      </div>
    </div>

    {quote.requiredClarifications.length > 0 && (
      <div className="mt-5">
        <h3 className="mb-3 text-sm font-semibold text-text-primary">What we need to quote honestly</h3>
        <div className="grid gap-3">
          {quote.requiredClarifications.map(question => (
            <ClarificationItem key={question.id} question={question} />
          ))}
        </div>
      </div>
    )}

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <ListPanel title="Included in this quote path" icon="check" items={quote.includedScope} />
      <ListPanel title="Not included yet" icon="help" items={quote.excludedScope} />
    </div>

    <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-text-muted">{quote.disclaimer}</p>
  </CardUntitled>
);

const ClarificationItem = ({ question }: { question: AuditClarificationQuestion }) => (
  <div className="rounded-lg border border-border bg-background p-4">
    <div className="flex items-start gap-3">
      <MessageSquareText className="mt-0.5 h-4 w-4 text-primary" />
      <div>
        <p className="text-sm font-semibold text-text-primary">{question.question}</p>
        <p className="mt-1 text-sm leading-6 text-text-secondary">{question.why}</p>
      </div>
    </div>
  </div>
);

const ListPanel = ({ title, icon, items }: { title: string; icon: 'check' | 'help'; items: string[] }) => {
  const Icon = icon === 'check' ? CheckCircle2 : HelpCircle;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
      <div className="space-y-3">
        {items.map(item => (
          <p key={item} className="flex gap-2 text-sm leading-6 text-text-secondary">
            <Icon className="mt-1 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

const HumanReviewedBrief = ({ flowBrief, quote }: { flowBrief: Record<string, unknown>; quote: AuditQuoteDraft }) => {
  const executiveSummary = typeof flowBrief.executiveSummary === 'string' ? flowBrief.executiveSummary : '';
  const firstImplementationSprint = typeof flowBrief.firstImplementationSprint === 'string' ? flowBrief.firstImplementationSprint : '';
  const likelyHelpPoints = extractHelpPointTitles(flowBrief.likelyHelpPoints);
  const keepConnectImproveReplaceOwn = isRecord(flowBrief.keepConnectImproveReplaceOwn) ? flowBrief.keepConnectImproveReplaceOwn : {};

  return (
    <div className="space-y-5">
      {executiveSummary && (
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-semibold text-text-primary">Executive summary</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{executiveSummary}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Reviewed range" value={formatQuoteRange(quote)} />
        <Metric label="Readiness" value={quoteReadinessLabel(quote.readiness)} />
        <Metric label="Confidence" value={`${quote.confidence}%`} />
      </div>

      <SimpleList title="Likely help points" items={likelyHelpPoints} empty="No help points were saved yet." />
      <SimpleList title="Keep" items={stringListFrom(keepConnectImproveReplaceOwn.keep)} empty="No keep items saved yet." />
      <SimpleList title="Connect" items={stringListFrom(keepConnectImproveReplaceOwn.connect)} empty="No connect items saved yet." />
      <SimpleList title="Improve" items={stringListFrom(keepConnectImproveReplaceOwn.improve)} empty="No improve items saved yet." />
      <SimpleList title="Replace" items={stringListFrom(keepConnectImproveReplaceOwn.replace)} empty="No replace items saved yet." />
      <SimpleList title="Own" items={stringListFrom(keepConnectImproveReplaceOwn.own)} empty="No owned-slice items saved yet." />

      {firstImplementationSprint && (
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-semibold text-text-primary">First implementation sprint</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{firstImplementationSprint}</p>
        </div>
      )}
    </div>
  );
};

const ChipGroup = ({ title, items, empty = 'None selected' }: { title: string; items: string[]; empty?: string }) => (
  <div>
    <p className="mb-2 text-sm font-semibold text-text-primary">{title}</p>
    {items.length === 0 ? (
      <p className="text-sm text-text-muted">{empty}</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {items.map(item => <BadgeUntitled key={item} variant="outline">{item}</BadgeUntitled>)}
      </div>
    )}
  </div>
);

const focusLabels = (items: string[]) =>
  items.map(item => auditFocusOptions.find(option => option.id === item)?.label ?? item);

const toolLabels = (items: string[]) =>
  items.map(item => auditToolOptions.find(option => option.id === item)?.label ?? item);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-background p-4">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</p>
    <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
  </div>
);

const PreviewSection = ({ title, items, empty }: { title: string; items: FlowBriefPreviewItem[]; empty: string }) => (
  <div className="mt-5">
    <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
    {items.length === 0 ? (
      <p className="text-sm text-text-muted">{empty}</p>
    ) : (
      <div className="grid gap-3">
        {items.map(item => (
          <div key={item.title} className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm font-semibold text-text-primary">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SimpleList = ({ title, items, empty }: { title: string; items: string[]; empty: string }) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold text-text-primary">{title}</h3>
    {items.length === 0 ? (
      <p className="text-sm text-text-muted">{empty}</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {items.map(item => <BadgeUntitled key={item} variant="outline">{item}</BadgeUntitled>)}
      </div>
    )}
  </div>
);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const stringListFrom = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const extractHelpPointTitles = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value
    .map(item => {
      if (typeof item === 'string') return item;
      if (isRecord(item) && typeof item.title === 'string') return item.title;
      return '';
    })
    .filter(Boolean);
};
