import { AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import { buildAuditPreview } from './preview';
import type { AuditIntakeDraft, FlowBriefPreviewItem } from './types';

const iconForSeverity = {
  info: Info,
  opportunity: Lightbulb,
  risk: AlertTriangle,
};

const PreviewCard = ({ item }: { item: FlowBriefPreviewItem }) => {
  const Icon = iconForSeverity[item.severity];

  return (
    <div className="border border-[#24272f] p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className="h-4 w-4 text-[#d4af37]" />
        {item.title}
      </div>
      <p className="text-sm leading-6 text-[#8a8f9a]">{item.description}</p>
    </div>
  );
};

export const FlowBriefPreview = ({ draft }: { draft: AuditIntakeDraft }) => {
  const preview = buildAuditPreview(draft);

  return (
    <aside className="border border-[#24272f] bg-[#0d0f12] p-6 lg:sticky lg:top-8 lg:self-start">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">
        First Flow Brief
      </p>
      <h2 className="mb-3 text-2xl font-semibold text-white">What FlowStack can infer so far</h2>
      <p className="mb-6 text-sm leading-6 text-[#8a8f9a]">{preview.summary}</p>

      <div className="mb-6 grid gap-3">
        <div className="border border-[#24272f] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b7280]">Classification</p>
          <div className="mt-3 grid gap-2 text-sm">
            <p className="text-[#c4c7cf]">
              <span className="text-[#6b7280]">Lens:</span> {preview.classification.primaryLens}
            </p>
            <p className="text-[#c4c7cf]">
              <span className="text-[#6b7280]">Business:</span> {preview.classification.businessType}
            </p>
            <p className="text-[#c4c7cf]">
              <span className="text-[#6b7280]">Urgency:</span> {preview.classification.urgency}
            </p>
          </div>
        </div>

        <div className="border border-[#24272f] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6b7280]">
              Evidence completeness
            </p>
            <span className="text-sm font-semibold text-[#d4af37]">{preview.evidenceCompleteness.score}%</span>
          </div>
          <div className="h-2 overflow-hidden bg-[#1a1c20]">
            <div className="h-full bg-[#d4af37]" style={{ width: `${preview.evidenceCompleteness.score}%` }} />
          </div>
          <p className="mt-3 text-sm font-semibold text-white">{preview.evidenceCompleteness.label}</p>
          <p className="mt-1 text-xs leading-5 text-[#8a8f9a]">
            {preview.evidenceCompleteness.details.join(' · ')}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-white">Likely flow gaps</h3>
        {preview.likelyFlowGaps.length === 0 ? (
          <p className="text-sm text-[#6b7280]">Select tools and focus areas to reveal likely gaps.</p>
        ) : (
          preview.likelyFlowGaps.map(item => <PreviewCard key={item.title} item={item} />)
        )}
      </div>

      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-white">Recommended next steps</h3>
        {preview.recommendedNextSteps.length === 0 ? (
          <p className="text-sm text-[#6b7280]">FlowStack will suggest the first audit path after intake.</p>
        ) : (
          preview.recommendedNextSteps.map(item => (
            <div key={item.title} className="flex gap-3 border border-[#24272f] p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#d4af37]" />
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-[#8a8f9a]">{item.description}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-white">Owned-slice candidates</h3>
        {preview.ownedSliceCandidates.length === 0 ? (
          <p className="text-sm text-[#6b7280]">FlowStack will only suggest ownership when the evidence supports it.</p>
        ) : (
          preview.ownedSliceCandidates.map(item => <PreviewCard key={item.title} item={item} />)
        )}
      </div>

      <p className="border-t border-[#24272f] pt-4 text-xs leading-5 text-[#6b7280]">
        {preview.disclaimer}
      </p>
    </aside>
  );
};
