import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  auditFocusOptions,
  auditToolOptions,
  businessTypeOptions,
  monthlyToolSpendRangeOptions,
  projectSignalOptions,
  teamSizeRangeOptions,
  urgencyOptions,
} from '@/features/audit/auditQuestions';
import { createEmptyAuditDraft, clearAuditDraft, loadAuditDraft, saveAuditDraft } from '@/features/audit/auditStorage';
import { submitAuditRequest } from '@/features/audit/auditSubmit';
import { buildAuditPreview } from '@/features/audit/preview';
import type { AuditFocus, AuditIntakeDraft } from '@/features/audit/types';
import { cn } from '@/lib/utils';

type StepId = 'context' | 'focus' | 'flow' | 'review';

const steps: Array<{ id: StepId; label: string; eyebrow: string; title: string; description: string }> = [
  {
    id: 'context',
    label: 'Context',
    eyebrow: 'Step 1',
    title: 'Tell us what kind of business flow this is.',
    description: 'This keeps the audit grounded before FlowStack looks at tools or implementation options.',
  },
  {
    id: 'focus',
    label: 'Focus',
    eyebrow: 'Step 2',
    title: 'Choose the parts of the flow that need attention.',
    description: 'Pick the main lenses and any tools already in the mix. You can keep this broad for now.',
  },
  {
    id: 'flow',
    label: 'Current flow',
    eyebrow: 'Step 3',
    title: 'Describe what feels unclear, slow, expensive, or disconnected.',
    description: 'A few plain sentences are enough. FlowStack starts with the reality you already have.',
  },
  {
    id: 'review',
    label: 'Review',
    eyebrow: 'Step 4',
    title: 'Review the saved audit preview.',
    description: 'This is directional only. The final Flow Brief stays human-reviewed.',
  },
];

const toggleValue = <T extends string>(values: T[], value: T) =>
  values.includes(value) ? values.filter(item => item !== value) : [...values, value];

const optionLabel = (options: Array<{ id: string; label: string }>, id: string) =>
  options.find(option => option.id === id)?.label ?? 'Not selected';

export const AuditIntakePage = () => {
  const navigate = useNavigate();
  const { session, user, organizationId, isLoading: isAuthLoading } = useAuth();
  const [draft, setDraft] = useState<AuditIntakeDraft>(() => {
    if (typeof window === 'undefined') return createEmptyAuditDraft();
    return loadAuditDraft();
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAuditId, setSubmittedAuditId] = useState<string | null>(null);

  useEffect(() => {
    saveAuditDraft(draft);
  }, [draft]);

  const preview = useMemo(() => buildAuditPreview(draft), [draft]);

  const canContinue = useMemo(
    () => Boolean(draft.businessType) && draft.focus.length > 0 && draft.currentPain.trim().length > 10,
    [draft.businessType, draft.currentPain, draft.focus.length]
  );

  const stepCompletion = useMemo<Record<StepId, boolean>>(
    () => ({
      context: Boolean(draft.businessType),
      focus: draft.focus.length > 0,
      flow: draft.currentPain.trim().length > 10,
      review: canContinue,
    }),
    [canContinue, draft.businessType, draft.currentPain, draft.focus.length]
  );

  const maxAccessibleStepIndex = useMemo(() => {
    let index = 0;
    if (stepCompletion.context) index = 1;
    if (stepCompletion.context && stepCompletion.focus) index = 2;
    if (stepCompletion.context && stepCompletion.focus && stepCompletion.flow) index = 3;
    return index;
  }, [stepCompletion]);

  const currentStep = steps[currentStepIndex];
  const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const updateDraft = (next: Partial<AuditIntakeDraft>) => {
    setSubmittedAuditId(null);
    setSubmitError(null);
    setDraft(prev => ({ ...prev, ...next, updatedAt: new Date().toISOString() }));
  };

  const goToStep = (index: number) => {
    if (index <= maxAccessibleStepIndex) {
      setCurrentStepIndex(index);
    }
  };

  const goNext = () => {
    if (!stepCompletion[currentStep.id]) return;
    setCurrentStepIndex(index => Math.min(index + 1, steps.length - 1));
  };

  const goBack = () => {
    setCurrentStepIndex(index => Math.max(index - 1, 0));
  };

  const handleSubmitAudit = async () => {
    if (!canContinue || isSubmitting) return;

    if (!session) {
      navigate('/auth?intent=audit');
      return;
    }

    if (!organizationId) {
      navigate('/onboarding?intent=audit');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitAuditRequest({
        draft: {
          ...draft,
          contactEmail: draft.contactEmail.trim() || user?.email || '',
        },
        organizationId,
      });

      setSubmittedAuditId(result.auditRequestId);
      clearAuditDraft();
      navigate(`/dashboard/audits/${result.auditRequestId}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to submit audit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#8a8f9a] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FlowStack
        </button>

        <section className="mb-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase text-[#d4af37]">FlowStack Audit</p>
            <h1 className="max-w-3xl text-3xl font-semibold text-white md:text-5xl">
              Show us your flow. We will help you find the gap.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#8a8f9a] md:text-base">
              Four focused steps. No files, uploads, CLI access, or SaaS credentials. Just enough
              context to save an audit, show a directional preview, and start a real review path.
            </p>
          </div>

          <div className="border border-[#24272f] bg-[#0d0f12] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-white">Audit progress</span>
              <span className="text-[#d4af37]">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden bg-[#1a1c20]">
              <div className="h-full bg-[#d4af37] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-[#8a8f9a]">
              <ShieldCheck className="h-4 w-4 text-[#d4af37]" />
              Read-only intake. Human-reviewed brief.
            </div>
          </div>
        </section>

        {(submittedAuditId || submitError) && (
          <div
            className={cn(
              'mb-6 border p-4 text-sm',
              submittedAuditId
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                : 'border-red-500/30 bg-red-500/10 text-red-100'
            )}
          >
            {submittedAuditId ? (
              <div>
                <p className="font-semibold text-white">Audit logged in FlowStack.</p>
                <p className="mt-1 text-emerald-100/80">
                  This is now saved as your first audit flow. Reference ID: {submittedAuditId}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-white">Audit could not be saved yet.</p>
                <p className="mt-1 text-red-100/80">{submitError}</p>
              </div>
            )}
          </div>
        )}

        <section className="border border-[#1a1c20] bg-[#0a0b0d]">
          <div className="grid lg:grid-cols-[280px_1fr]">
            <aside className="border-b border-[#1a1c20] p-4 lg:border-b-0 lg:border-r lg:p-5">
              <div className="grid gap-2">
                {steps.map((step, index) => {
                  const active = index === currentStepIndex;
                  const complete = stepCompletion[step.id];
                  const accessible = index <= maxAccessibleStepIndex;
                  const Icon = complete ? CheckCircle2 : Circle;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={!accessible}
                      onClick={() => goToStep(index)}
                      className={cn(
                        'flex min-h-16 items-center gap-3 border p-3 text-left transition-colors',
                        active
                          ? 'border-[#d4af37] bg-[#d4af37]/10'
                          : 'border-[#24272f] bg-[#0d0f12] hover:border-[#d4af37]/40',
                        !accessible && 'cursor-not-allowed opacity-45 hover:border-[#24272f]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center border',
                          complete ? 'border-[#d4af37] bg-[#d4af37] text-[#08090a]' : 'border-[#3a3d46] text-[#6b7280]'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-xs text-[#6b7280]">{step.eyebrow}</span>
                        <span className="block text-sm font-semibold text-white">{step.label}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-[#1a1c20] pt-5 text-xs leading-5 text-[#8a8f9a]">
                Your draft saves locally as you move through the stepper, so signup or onboarding can
                return you to the same audit.
              </div>
            </aside>

            <div className="p-4 sm:p-6 lg:p-8">
              <div className="mb-8 max-w-3xl">
                <p className="mb-2 text-xs font-bold uppercase text-[#d4af37]">{currentStep.eyebrow}</p>
                <h2 className="text-2xl font-semibold text-white md:text-3xl">{currentStep.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[#8a8f9a]">{currentStep.description}</p>
              </div>

              {currentStep.id === 'context' && (
                <ContextStep draft={draft} updateDraft={updateDraft} />
              )}

              {currentStep.id === 'focus' && (
                <FocusStep draft={draft} updateDraft={updateDraft} />
              )}

              {currentStep.id === 'flow' && (
                <FlowStep draft={draft} updateDraft={updateDraft} />
              )}

              {currentStep.id === 'review' && (
                <ReviewStep draft={draft} preview={preview} updateDraft={updateDraft} />
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#1a1c20] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={currentStepIndex === 0}
                  className="inline-flex items-center justify-center gap-2 border border-[#24272f] px-4 py-3 text-sm font-semibold text-[#c4c7cf] transition-colors hover:border-[#d4af37]/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>

                {currentStep.id === 'review' ? (
                  <button
                    type="button"
                    disabled={!canContinue || isSubmitting || isAuthLoading || Boolean(submittedAuditId)}
                    onClick={handleSubmitAudit}
                    className="inline-flex items-center justify-center gap-3 bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#08090a] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving audit flow...
                      </>
                    ) : submittedAuditId ? (
                      <>
                        Audit logged
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    ) : session ? (
                      <>
                        Log audit and open dashboard
                        <ArrowRight className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Save audit and create account
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!stepCompletion[currentStep.id]}
                    className="inline-flex items-center justify-center gap-3 bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#08090a] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const ContextStep = ({
  draft,
  updateDraft,
}: {
  draft: AuditIntakeDraft;
  updateDraft: (next: Partial<AuditIntakeDraft>) => void;
}) => {
  const selectedBusiness = businessTypeOptions.find(option => option.id === draft.businessType);

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-white">Business type</span>
          <select
            value={draft.businessType}
            onChange={event => updateDraft({ businessType: event.target.value as typeof draft.businessType })}
            className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#d4af37]"
          >
            <option value="" className="bg-[#0d0f12]">
              Select one
            </option>
            {businessTypeOptions.map(option => (
              <option key={option.id} value={option.id} className="bg-[#0d0f12]">
                {option.label}
              </option>
            ))}
          </select>
          <span className="block min-h-10 text-xs leading-5 text-[#8a8f9a]">
            {selectedBusiness?.description ?? 'This is the only required field on this step.'}
          </span>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-white">Urgency</span>
          <select
            value={draft.urgency}
            onChange={event => updateDraft({ urgency: event.target.value as typeof draft.urgency })}
            className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#d4af37]"
          >
            {urgencyOptions.map(option => (
              <option key={option.id} value={option.id} className="bg-[#0d0f12]">
                {option.label}
              </option>
            ))}
          </select>
          <span className="block min-h-10 text-xs leading-5 text-[#8a8f9a]">
            {urgencyOptions.find(option => option.id === draft.urgency)?.description}
          </span>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Team size"
          value={draft.teamSizeRange}
          options={teamSizeRangeOptions}
          onChange={value => updateDraft({ teamSizeRange: value as typeof draft.teamSizeRange })}
        />
        <SelectField
          label="Monthly tool spend"
          value={draft.monthlyToolSpendRange}
          options={monthlyToolSpendRangeOptions}
          onChange={value => updateDraft({ monthlyToolSpendRange: value as typeof draft.monthlyToolSpendRange })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Business name"
          value={draft.businessName}
          placeholder="Symbiotic Solutions"
          onChange={value => updateDraft({ businessName: value })}
        />
        <TextField
          label="Website or main URL"
          value={draft.websiteUrl}
          placeholder="https://example.com"
          onChange={value => updateDraft({ websiteUrl: value })}
        />
      </div>
    </div>
  );
};

const FocusStep = ({
  draft,
  updateDraft,
}: {
  draft: AuditIntakeDraft;
  updateDraft: (next: Partial<AuditIntakeDraft>) => void;
}) => (
  <div className="grid gap-7">
    <section>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-base font-semibold text-white">Audit lenses</h3>
        <p className="text-xs text-[#8a8f9a]">{draft.focus.length} selected</p>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {auditFocusOptions.map(option => {
          const active = draft.focus.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => updateDraft({ focus: toggleValue<AuditFocus>(draft.focus, option.id) })}
              className={cn(
                'flex min-h-20 items-start gap-3 border p-3 text-left transition-colors',
                active
                  ? 'border-[#d4af37] bg-[#d4af37]/10'
                  : 'border-[#24272f] bg-[#0d0f12] hover:border-[#d4af37]/40'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border',
                  active ? 'border-[#d4af37] bg-[#d4af37] text-[#08090a]' : 'border-[#3a3d46] text-[#6b7280]'
                )}
              >
                {active && <Check className="h-4 w-4" />}
              </span>
              <span>
                <span className="block text-sm font-semibold text-white">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[#8a8f9a]">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>

    <section>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-base font-semibold text-white">Tools in the flow</h3>
        <p className="text-xs text-[#8a8f9a]">Optional, but useful</p>
      </div>
      <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto border border-[#1a1c20] bg-[#08090a] p-3">
        {auditToolOptions.map(tool => {
          const active = draft.tools.includes(tool.id);

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => updateDraft({ tools: toggleValue(draft.tools, tool.id) })}
              className={cn(
                'border px-3 py-2 text-sm transition-colors',
                active
                  ? 'border-[#d4af37] bg-[#d4af37]/10 text-white'
                  : 'border-[#24272f] text-[#8a8f9a] hover:text-white'
              )}
            >
              {tool.label}
            </button>
          );
        })}
      </div>
    </section>
  </div>
);

const FlowStep = ({
  draft,
  updateDraft,
}: {
  draft: AuditIntakeDraft;
  updateDraft: (next: Partial<AuditIntakeDraft>) => void;
}) => (
  <div className="grid gap-6">
    <label className="space-y-2">
      <span className="text-sm font-semibold text-white">Current flow context</span>
      <textarea
        value={draft.currentPain}
        onChange={event => updateDraft({ currentPain: event.target.value })}
        className="min-h-36 w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors focus:border-[#d4af37]"
        placeholder="Example: I use HubSpot for marketing, Wix for the website, designers for page updates, and AI tools for content, but campaign to page to lead follow-up is not clear."
      />
      <span className="block text-xs text-[#8a8f9a]">
        Minimum 10 characters. More context gives the preview better signal.
      </span>
    </label>

    <section>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h3 className="text-base font-semibold text-white">Signals that apply</h3>
        <p className="text-xs text-[#8a8f9a]">{draft.projectSignals.length} selected</p>
      </div>
      <div className="grid max-h-72 gap-2 overflow-y-auto border border-[#1a1c20] bg-[#08090a] p-3 md:grid-cols-2">
        {projectSignalOptions.map(signal => (
          <label
            key={signal}
            className="flex min-h-12 items-start gap-3 border border-[#24272f] bg-[#0d0f12] p-3 text-sm leading-5 text-[#c4c7cf]"
          >
            <input
              type="checkbox"
              checked={draft.projectSignals.includes(signal)}
              onChange={() => updateDraft({ projectSignals: toggleValue(draft.projectSignals, signal) })}
              className="mt-1"
            />
            {signal}
          </label>
        ))}
      </div>
    </section>

    <div className="grid gap-4 md:grid-cols-2">
      <TextField
        label="Desired outcome"
        value={draft.desiredOutcome}
        placeholder="Flow Brief, implementation quote, provider option..."
        onChange={value => updateDraft({ desiredOutcome: value })}
      />
      <TextField
        label="Email"
        value={draft.contactEmail}
        placeholder="you@company.com"
        onChange={value => updateDraft({ contactEmail: value })}
      />
    </div>

    <label className="flex items-start gap-3 border border-[#24272f] bg-[#0d0f12] p-3 text-sm text-[#8a8f9a]">
      <input
        type="checkbox"
        checked={draft.consentToContact}
        onChange={event => updateDraft({ consentToContact: event.target.checked })}
        className="mt-1"
      />
      FlowStack can contact me about this audit request.
    </label>
  </div>
);

const ReviewStep = ({
  draft,
  preview,
  updateDraft,
}: {
  draft: AuditIntakeDraft;
  preview: ReturnType<typeof buildAuditPreview>;
  updateDraft: (next: Partial<AuditIntakeDraft>) => void;
}) => {
  const selectedFocus = draft.focus
    .map(id => optionLabel(auditFocusOptions, id))
    .filter(Boolean);
  const selectedTools = draft.tools
    .map(id => optionLabel(auditToolOptions, id))
    .filter(Boolean);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-4">
        <ReviewBlock
          title="Business context"
          rows={[
            ['Business type', optionLabel(businessTypeOptions, draft.businessType)],
            ['Team size', optionLabel(teamSizeRangeOptions, draft.teamSizeRange)],
            ['Tool spend', optionLabel(monthlyToolSpendRangeOptions, draft.monthlyToolSpendRange)],
            ['Urgency', optionLabel(urgencyOptions, draft.urgency)],
          ]}
        />

        <ReviewBlock
          title="Selected focus"
          rows={[
            ['Focus areas', selectedFocus.length ? selectedFocus.join(', ') : 'None selected'],
            ['Tools', selectedTools.length ? selectedTools.join(', ') : 'No tools selected yet'],
          ]}
        />

        <div className="border border-[#24272f] bg-[#0d0f12] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <button
              type="button"
              onClick={() => updateDraft({ consentToContact: !draft.consentToContact })}
              className="text-xs text-[#d4af37] hover:text-white"
            >
              {draft.consentToContact ? 'Consent on' : 'Consent off'}
            </button>
          </div>
          <p className="text-sm text-[#c4c7cf]">{draft.contactEmail || 'Email will use your signed-in account if available.'}</p>
          <p className="mt-2 text-xs leading-5 text-[#8a8f9a]">
            After submit, FlowStack saves the audit and takes you to the customer dashboard preview.
          </p>
        </div>
      </section>

      <section className="border border-[#24272f] bg-[#0d0f12] p-5">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#d4af37]/40 bg-[#d4af37]/10">
            <Search className="h-5 w-5 text-[#d4af37]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-[#d4af37]">Directional preview</p>
            <h3 className="mt-1 text-xl font-semibold text-white">What FlowStack can infer so far</h3>
          </div>
        </div>

        <p className="text-sm leading-6 text-[#8a8f9a]">{preview.summary}</p>

        <div className="my-5 grid gap-3 sm:grid-cols-3">
          <PreviewMetric label="Lens" value={preview.classification.primaryLens} />
          <PreviewMetric label="Business" value={preview.classification.businessType} />
          <PreviewMetric label="Evidence" value={`${preview.evidenceCompleteness.score}%`} />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Likely first findings</h4>
          {preview.likelyFlowGaps.length === 0 ? (
            <p className="text-sm text-[#6b7280]">Add tools or signals to reveal likely flow gaps.</p>
          ) : (
            preview.likelyFlowGaps.slice(0, 3).map(item => (
              <div key={item.title} className="border border-[#24272f] p-3">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#8a8f9a]">{item.description}</p>
              </div>
            ))
          )}
        </div>

        <p className="mt-5 border-t border-[#24272f] pt-4 text-xs leading-5 text-[#6b7280]">
          {preview.disclaimer}
        </p>
      </section>
    </div>
  );
};

const TextField = ({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => (
  <label className="space-y-2">
    <span className="text-sm font-semibold text-white">{label}</span>
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
      className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#d4af37]"
      placeholder={placeholder}
    />
  </label>
);

const SelectField = <T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ id: T; label: string; description: string }>;
  onChange: (value: T) => void;
}) => {
  const description = options.find(option => option.id === value)?.description;

  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-white">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value as T)}
        className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#d4af37]"
      >
        {options.map(option => (
          <option key={option.id} value={option.id} className="bg-[#0d0f12]">
            {option.label}
          </option>
        ))}
      </select>
      <span className="block min-h-10 text-xs leading-5 text-[#8a8f9a]">{description}</span>
    </label>
  );
};

const ReviewBlock = ({ title, rows }: { title: string; rows: Array<[string, string]> }) => (
  <div className="border border-[#24272f] bg-[#0d0f12] p-4">
    <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
    <div className="grid gap-3">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-t border-[#1a1c20] pt-3 first:border-t-0 first:pt-0">
          <span className="text-xs text-[#6b7280]">{label}</span>
          <span className="text-sm leading-5 text-[#c4c7cf]">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const PreviewMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="border border-[#24272f] bg-[#08090a] p-3">
    <p className="text-xs text-[#6b7280]">{label}</p>
    <p className="mt-1 text-sm font-semibold text-white">{value}</p>
  </div>
);
