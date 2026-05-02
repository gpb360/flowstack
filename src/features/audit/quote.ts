import { auditFocusOptions, monthlyToolSpendRangeOptions, teamSizeRangeOptions } from './auditQuestions';
import { DIRECTIONAL_ESTIMATE_DISCLAIMER, auditLabels } from './preview';
import type {
  AuditClarificationQuestion,
  AuditIntakeDraft,
  AuditQuoteDraft,
  AuditQuoteRange,
  AuditQuoteReadiness,
  FlowBriefPreview,
} from './types';

const DEFAULT_PRIORITY_RANGE: AuditQuoteRange = {
  low: 2000,
  high: 5000,
  currency: 'USD',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const asStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : fallback;

const focusLabels = (draft: AuditIntakeDraft) =>
  draft.focus
    .map(focus => auditFocusOptions.find(option => option.id === focus)?.label)
    .filter((label): label is string => Boolean(label));

const toolSet = (draft: AuditIntakeDraft) => new Set(draft.tools);

const hasAnyTool = (draft: AuditIntakeDraft, tools: string[]) => {
  const selectedTools = toolSet(draft);
  return tools.some(tool => selectedTools.has(tool));
};

const getQuoteRange = (draft: AuditIntakeDraft): AuditQuoteRange => {
  const hasEnterpriseShape =
    draft.businessType === 'corporate_internal' ||
    draft.teamSizeRange === '201_1000' ||
    draft.teamSizeRange === '1000_plus' ||
    draft.monthlyToolSpendRange === '10000_plus';

  if (hasEnterpriseShape) {
    return { low: 5000, high: 15000, currency: 'USD' };
  }

  const hasComplexDeliveryShape =
    draft.businessType === 'saas_software' ||
    draft.teamSizeRange === '51_200' ||
    draft.monthlyToolSpendRange === '2000_10000' ||
    draft.focus.includes('team_flow_map') ||
    draft.focus.includes('agent_tool_chaos');

  if (hasComplexDeliveryShape) {
    return { low: 3000, high: 8000, currency: 'USD' };
  }

  if (
    draft.businessType === 'creator_solo' &&
    (draft.monthlyToolSpendRange === 'under_500' || draft.focus.includes('getting_started'))
  ) {
    return { low: 1500, high: 3000, currency: 'USD' };
  }

  return DEFAULT_PRIORITY_RANGE;
};

const buildClarifications = (draft: AuditIntakeDraft, preview: FlowBriefPreview): AuditClarificationQuestion[] => {
  const questions: AuditClarificationQuestion[] = [];

  if (!draft.websiteUrl.trim()) {
    questions.push({
      id: 'public-surface',
      question: 'What public surface should we use as the first reference point?',
      why: 'A website, funnel, community page, or product URL helps connect the stated flow to something customers actually see.',
    });
  }

  if (draft.tools.length === 0) {
    questions.push({
      id: 'current-tools',
      question: 'Which tools are actually part of this flow today?',
      why: 'The quote gets tighter when FlowStack can see the tools, people, and handoffs that need to be mapped.',
    });
  }

  if (draft.monthlyToolSpendRange === 'unknown') {
    questions.push({
      id: 'tool-spend',
      question: 'What rough monthly tool spend should we use for the first pass?',
      why: 'Even a range helps us avoid overstating savings or ownership opportunities.',
    });
  }

  if (!draft.desiredOutcome.trim()) {
    questions.push({
      id: 'desired-outcome',
      question: 'What would make this audit feel useful within the first review?',
      why: 'A quote should attach to a real outcome: clarity, a migration path, a sprint, a cost review, or an owned-slice plan.',
    });
  }

  if (preview.evidenceCompleteness.score < 60) {
    questions.push({
      id: 'slowest-handoff',
      question: 'Where does the flow currently slow down: marketing, sales, dev, support, approvals, or reporting?',
      why: 'This keeps the review from becoming a generic tool audit.',
    });
  }

  if (draft.focus.includes('owned_software') || draft.focus.includes('saas_spend')) {
    questions.push({
      id: 'owned-slice',
      question: 'Which rented capability are you most curious about owning?',
      why: 'FlowStack should compare one narrow owned slice before recommending any larger build.',
    });
  }

  if (draft.focus.includes('ai_dev_workflow') || draft.businessType === 'saas_software') {
    questions.push({
      id: 'delivery-flow',
      question: 'Where does code or project delivery start, get reviewed, and go live?',
      why: 'For dev and AI-agent flows, the quote depends on source control, review, deployment, and who is allowed to change what.',
    });
  }

  return questions.slice(0, 5);
};

const getIncludedScope = (draft: AuditIntakeDraft, preview: FlowBriefPreview) => {
  const scope = [
    'Human review of the submitted flow context, selected tools, business type, urgency, and desired outcome.',
    'A first-pass flow map that separates what to keep, connect, improve, replace, or consider owning.',
    'A short opportunity list with evidence, assumptions, and the next practical move.',
  ];

  if (draft.focus.includes('marketing_flow') || hasAnyTool(draft, ['hubspot', 'gohighlevel', 'wix', 'webflow'])) {
    scope.push('Marketing, web, CRM, content, lead capture, and follow-up lane review.');
  }

  if (draft.focus.includes('ai_dev_workflow') || hasAnyTool(draft, ['codex', 'claude', 'cursor', 'github', 'gsd', 'beads'])) {
    scope.push('AI/dev workflow review across planning, coding agents, Git flow, and repeated handoff friction.');
  }

  if (draft.focus.includes('owned_software') || preview.ownedSliceCandidates.length > 0) {
    scope.push('One owned-slice candidate scoped far enough to decide whether a custom build is worth discussing.');
  }

  return scope;
};

const getExcludedScope = () => [
  'No file upload, local folder scan, repo inspection, SaaS login, or connector access is included in this MVP quote.',
  'No implementation work, production changes, migrations, or payment collection happen until a separate scope is approved.',
  'No exact ROI, savings guarantee, compliance conclusion, or technical certainty is claimed from form-only intake.',
];

const getAssumptions = (draft: AuditIntakeDraft) => {
  const assumptions = [
    'The first quote is based on form-only information and a human review call if needed.',
    `Team size is treated as ${teamSizeRangeOptions.find(option => option.id === draft.teamSizeRange)?.label ?? 'not sure'}.`,
    `Monthly tool spend is treated as ${monthlyToolSpendRangeOptions.find(option => option.id === draft.monthlyToolSpendRange)?.label ?? 'not sure'}.`,
  ];

  const labels = focusLabels(draft);
  if (labels.length > 0) {
    assumptions.push(`Primary focus areas are ${labels.join(', ')}.`);
  }

  return assumptions;
};

export const buildAuditQuoteDraft = (draft: AuditIntakeDraft, preview: FlowBriefPreview): AuditQuoteDraft => {
  const requiredClarifications = buildClarifications(draft, preview);
  const range = getQuoteRange(draft);
  const evidenceScore = preview.evidenceCompleteness.score;
  const confidence = Math.max(20, Math.min(85, evidenceScore - requiredClarifications.length * 5 + (draft.desiredOutcome.trim() ? 5 : 0)));
  const readiness: AuditQuoteReadiness = evidenceScore >= 70 && requiredClarifications.length <= 2 ? 'directional_range' : 'needs_context';

  return {
    readiness,
    range,
    confidence,
    assumptions: getAssumptions(draft),
    includedScope: getIncludedScope(draft, preview),
    excludedScope: getExcludedScope(),
    requiredClarifications,
    nextStep:
      readiness === 'directional_range'
        ? 'Request a Priority Flow Audit or book a free review so FlowStack can confirm the range before invoicing.'
        : 'Answer the clarifying questions or book a free review before treating this as a quote.',
    disclaimer: DIRECTIONAL_ESTIMATE_DISCLAIMER,
  };
};

export const normalizeAuditQuote = (value: unknown, fallback: AuditQuoteDraft): AuditQuoteDraft => {
  if (!isRecord(value)) return fallback;

  const range = isRecord(value.range) ? value.range : {};
  const readiness = value.readiness;

  return {
    readiness:
      readiness === 'needs_context' || readiness === 'directional_range' || readiness === 'reviewed_quote'
        ? readiness
        : fallback.readiness,
    range: {
      low: typeof range.low === 'number' ? range.low : fallback.range.low,
      high: typeof range.high === 'number' ? range.high : fallback.range.high,
      currency: range.currency === 'USD' ? 'USD' : fallback.range.currency,
    },
    confidence: typeof value.confidence === 'number' ? Math.max(0, Math.min(100, value.confidence)) : fallback.confidence,
    assumptions: asStringArray(value.assumptions, fallback.assumptions),
    includedScope: asStringArray(value.includedScope, fallback.includedScope),
    excludedScope: asStringArray(value.excludedScope, fallback.excludedScope),
    requiredClarifications: Array.isArray(value.requiredClarifications)
      ? value.requiredClarifications.filter((item): item is AuditClarificationQuestion => {
          if (!isRecord(item)) return false;
          return typeof item.id === 'string' && typeof item.question === 'string' && typeof item.why === 'string';
        })
      : fallback.requiredClarifications,
    nextStep: typeof value.nextStep === 'string' ? value.nextStep : fallback.nextStep,
    disclaimer: typeof value.disclaimer === 'string' ? value.disclaimer : fallback.disclaimer,
  };
};

export const formatQuoteRange = (quote: AuditQuoteDraft) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: quote.range.currency,
    maximumFractionDigits: 0,
  });

  return `${formatter.format(quote.range.low)}-${formatter.format(quote.range.high)}`;
};

export const quoteReadinessLabel = (readiness: AuditQuoteReadiness) => {
  if (readiness === 'reviewed_quote') return 'Reviewed quote';
  if (readiness === 'directional_range') return 'Directional range';
  return 'Needs context';
};

export const quoteBusinessContextLabel = (draft: AuditIntakeDraft) =>
  `${auditLabels.businessType(draft.businessType)} / ${auditLabels.teamSizeRange(draft.teamSizeRange)} / ${auditLabels.monthlyToolSpendRange(draft.monthlyToolSpendRange)}`;
