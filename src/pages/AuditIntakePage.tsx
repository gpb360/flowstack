import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
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
import { FlowAuditExperience } from '@/features/audit/FlowAuditExperience';
import { FlowBriefPreview } from '@/features/audit/FlowBriefPreview';
import type { AuditFocus, AuditIntakeDraft } from '@/features/audit/types';
import { cn } from '@/lib/utils';

const toggleValue = <T extends string>(values: T[], value: T) =>
  values.includes(value) ? values.filter(item => item !== value) : [...values, value];

export const AuditIntakePage = () => {
  const navigate = useNavigate();
  const { session, user, organizationId, isLoading: isAuthLoading } = useAuth();
  const [draft, setDraft] = useState<AuditIntakeDraft>(() => {
    if (typeof window === 'undefined') return createEmptyAuditDraft();
    return loadAuditDraft();
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedAuditId, setSubmittedAuditId] = useState<string | null>(null);

  useEffect(() => {
    saveAuditDraft(draft);
  }, [draft]);

  const canContinue = useMemo(
    () => Boolean(draft.businessType) && draft.focus.length > 0 && draft.currentPain.trim().length > 10,
    [draft.businessType, draft.currentPain, draft.focus.length]
  );

  const updateDraft = (next: Partial<AuditIntakeDraft>) => {
    setSubmittedAuditId(null);
    setSubmitError(null);
    setDraft(prev => ({ ...prev, ...next, updatedAt: new Date().toISOString() }));
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
      <main className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-10 flex items-center gap-2 text-sm text-[#8a8f9a] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to FlowStack
        </button>

        <section className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">
            FlowStack Audit
          </p>
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Give us what you have. We will turn it into a flow.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#8a8f9a]">
            This intake creates a first-pass map of your tools, agents, SaaS, websites, teams, repos,
            workflows, approved workspaces, and ownership gaps. The output is a Flow Brief, an
            implementation path, and a quote. It starts manual and read-only. No forced migration.
          </p>
        </section>

        <FlowAuditExperience />

        {(submittedAuditId || submitError) && (
          <div
            className={cn(
              'mb-8 border p-4 text-sm',
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

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
              <section>
                <h2 className="mb-4 text-lg font-semibold">What kind of flow are we looking at?</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {businessTypeOptions.map(option => {
                    const active = draft.businessType === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateDraft({ businessType: option.id })}
                        className={cn(
                          'border p-4 text-left transition-colors',
                          active
                            ? 'border-[#d4af37] bg-[#d4af37]/10'
                            : 'border-[#24272f] bg-[#0d0f12] hover:border-[#d4af37]/40'
                        )}
                      >
                        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                          {active && <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />}
                          {option.label}
                        </span>
                        <span className="block text-sm leading-6 text-[#8a8f9a]">{option.description}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-white">Team size</span>
                    <select
                      value={draft.teamSizeRange}
                      onChange={event => updateDraft({ teamSizeRange: event.target.value as typeof draft.teamSizeRange })}
                      className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    >
                      {teamSizeRangeOptions.map(option => (
                        <option key={option.id} value={option.id} className="bg-[#0d0f12]">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-white">Monthly tool spend</span>
                    <select
                      value={draft.monthlyToolSpendRange}
                      onChange={event =>
                        updateDraft({ monthlyToolSpendRange: event.target.value as typeof draft.monthlyToolSpendRange })
                      }
                      className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    >
                      {monthlyToolSpendRangeOptions.map(option => (
                        <option key={option.id} value={option.id} className="bg-[#0d0f12]">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-white">Urgency</span>
                    <select
                      value={draft.urgency}
                      onChange={event => updateDraft({ urgency: event.target.value as typeof draft.urgency })}
                      className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    >
                      {urgencyOptions.map(option => (
                        <option key={option.id} value={option.id} className="bg-[#0d0f12]">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">What do you want FlowStack to understand?</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {auditFocusOptions.map(option => {
                    const active = draft.focus.includes(option.id);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateDraft({ focus: toggleValue<AuditFocus>(draft.focus, option.id) })}
                        className={cn(
                          'border p-4 text-left transition-colors',
                          active
                            ? 'border-[#d4af37] bg-[#d4af37]/10'
                            : 'border-[#24272f] bg-[#0d0f12] hover:border-[#d4af37]/40'
                        )}
                      >
                        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                          {active && <CheckCircle2 className="h-4 w-4 text-[#d4af37]" />}
                          {option.label}
                        </span>
                        <span className="block text-sm leading-6 text-[#8a8f9a]">{option.description}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">Business name</span>
                  <input
                    value={draft.businessName}
                    onChange={event => updateDraft({ businessName: event.target.value })}
                    className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="Symbiotic Solutions"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">Website or main URL</span>
                  <input
                    value={draft.websiteUrl}
                    onChange={event => updateDraft({ websiteUrl: event.target.value })}
                    className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="https://example.com"
                  />
                </label>
              </section>

              <section>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">
                    What feels unclear, slow, or expensive right now?
                  </span>
                  <textarea
                    value={draft.currentPain}
                    onChange={event => updateDraft({ currentPain: event.target.value })}
                    className="min-h-32 w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="Example: I use HubSpot for marketing, Wix for the website, designers for page updates, and AI tools for content, but the flow from campaign to page to lead follow-up is not clear."
                  />
                </label>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">Which tools are in the flow?</h2>
                <div className="flex flex-wrap gap-2">
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

              <section>
                <h2 className="mb-4 text-lg font-semibold">What project or business signals apply?</h2>
                <div className="space-y-2">
                  {projectSignalOptions.map(signal => (
                    <label key={signal} className="flex items-center gap-3 text-sm text-[#c4c7cf]">
                      <input
                        type="checkbox"
                        checked={draft.projectSignals.includes(signal)}
                        onChange={() => updateDraft({ projectSignals: toggleValue(draft.projectSignals, signal) })}
                      />
                      {signal}
                    </label>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">Desired outcome</span>
                  <input
                    value={draft.desiredOutcome}
                    onChange={event => updateDraft({ desiredOutcome: event.target.value })}
                    className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="Flow Brief, implementation quote, provider option..."
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-white">Email</span>
                  <input
                    value={draft.contactEmail}
                    onChange={event => updateDraft({ contactEmail: event.target.value })}
                    className="w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="you@company.com"
                  />
                </label>
              </section>

              <label className="flex items-start gap-3 text-sm text-[#8a8f9a]">
                <input
                  type="checkbox"
                  checked={draft.consentToContact}
                  onChange={event => updateDraft({ consentToContact: event.target.checked })}
                  className="mt-1"
                />
                FlowStack can contact me about this audit request.
              </label>

              <button
                type="button"
                disabled={!canContinue || isSubmitting || isAuthLoading || Boolean(submittedAuditId)}
                onClick={handleSubmitAudit}
                className="flex items-center gap-3 bg-[#d4af37] px-6 py-4 text-sm font-semibold text-[#08090a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving audit flow...
                  </>
                ) : submittedAuditId ? (
                  <>
                    Audit logged in FlowStack
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : session ? (
                  <>
                    Log audit and get quote path
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Save audit and create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
          </div>

          <FlowBriefPreview draft={draft} />
        </section>
      </main>
    </div>
  );
};
