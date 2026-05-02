import {
  auditFocusOptions,
  businessTypeOptions,
  monthlyToolSpendRangeOptions,
  teamSizeRangeOptions,
  urgencyOptions,
} from './auditQuestions';
import { createEmptyAuditDraft } from './auditStorage';
import type {
  AuditBusinessType,
  AuditFocus,
  AuditIntakeDraft,
  AuditMonthlyToolSpendRange,
  AuditRequestRecord,
  AuditTeamSizeRange,
  AuditUrgency,
  FlowBriefPreview,
  FlowBriefPreviewItem,
} from './types';

export const DIRECTIONAL_ESTIMATE_DISCLAIMER =
  'Estimates are directional, not guaranteed. They are based only on the information provided. More complete access, exports, screenshots, or approved snapshots may materially change the findings.';

const labelFrom = <T extends string>(options: Array<{ id: T; label: string }>, value?: T | '') =>
  options.find(option => option.id === value)?.label ?? 'Not specified';

const primaryLens = (focus: AuditFocus[]) => {
  const first = focus[0];
  return auditFocusOptions.find(option => option.id === first)?.label ?? 'Flow clarity';
};

const evidenceCompleteness = (draft: AuditIntakeDraft): FlowBriefPreview['evidenceCompleteness'] => {
  const details: string[] = [];
  let score = 0;

  if (draft.businessType) {
    score += 15;
    details.push('Business type selected');
  }

  if (draft.focus.length > 0) {
    score += 20;
    details.push('Flow focus selected');
  }

  if (draft.currentPain.trim().length >= 60) {
    score += 20;
    details.push('Flow context has useful detail');
  } else if (draft.currentPain.trim().length >= 10) {
    score += 10;
    details.push('Flow context started');
  }

  if (draft.tools.length > 0) {
    score += Math.min(20, draft.tools.length * 4);
    details.push('Tools selected');
  }

  if (draft.projectSignals.length > 0) {
    score += Math.min(15, draft.projectSignals.length * 3);
    details.push('Business signals selected');
  }

  if (draft.websiteUrl.trim() || draft.desiredOutcome.trim()) {
    score += 10;
    details.push('Outcome or URL provided');
  }

  const boundedScore = Math.min(100, score);

  return {
    score: boundedScore,
    label: boundedScore >= 70 ? 'Strong first-pass evidence' : boundedScore >= 40 ? 'Useful first-pass evidence' : 'Light first-pass evidence',
    details: details.length > 0 ? details : ['Add context to improve the preview'],
  };
};

export const buildAuditPreview = (draft: AuditIntakeDraft): FlowBriefPreview => {
  const likelyFlowGaps: FlowBriefPreviewItem[] = [];
  const recommendedNextSteps: FlowBriefPreviewItem[] = [];
  const ownedSliceCandidates: FlowBriefPreviewItem[] = [];

  if (draft.focus.includes('getting_started')) {
    likelyFlowGaps.push({
      title: 'The first opportunity may be flow clarity, not tool choice',
      description:
        'You may not need another AI tool yet. FlowStack should map the offer, audience, channels, lead capture, checkout, and follow-up first.',
      severity: 'opportunity',
    });
    recommendedNextSteps.push({
      title: 'Create a starter flow map',
      description:
        'Start with where people find you, how they talk to you, how they pay, and what should happen after they show interest.',
      severity: 'info',
    });
  }

  if (draft.businessType === 'agency_marketing') {
    likelyFlowGaps.push({
      title: 'Marketing, creative, development, and reporting may need one flow map',
      description:
        'Agency and marketing flows often spread across campaign planning, design, landing pages, approvals, analytics, and client reporting.',
      severity: 'opportunity',
    });
  }

  if (draft.businessType === 'saas_software') {
    likelyFlowGaps.push({
      title: 'Product delivery may need stability before more agent work',
      description:
        'FlowStack should look at repos, Git flow, component structure, deployment, support, and where AI-generated work enters the system.',
      severity: 'risk',
    });
  }

  if (draft.businessType === 'corporate_internal' || draft.focus.includes('team_flow_map')) {
    recommendedNextSteps.push({
      title: 'Map adoption before forcing another system',
      description:
        'A first pass should show whether teams, tools, and declared processes are actually moving together.',
      severity: 'opportunity',
    });
  }

  if (draft.tools.length >= 5) {
    likelyFlowGaps.push({
      title: 'Tool sprawl is likely part of the flow problem',
      description:
        'You selected several tools. FlowStack should map which ones own context, tasks, leads, and execution.',
      severity: 'risk',
    });
  }

  if (draft.tools.some(tool => ['skool', 'facebook', 'canva', 'chatgpt', 'stripe', 'calendly'].includes(tool))) {
    recommendedNextSteps.push({
      title: 'Turn the creator/tool stack into a simple business system',
      description:
        'Map content, community, lead capture, payment, delivery, and follow-up before adding more automation.',
      severity: 'opportunity',
    });
  }

  if (draft.tools.some(tool => ['hubspot', 'gohighlevel', 'wix', 'webflow'].includes(tool))) {
    likelyFlowGaps.push({
      title: 'Marketing, web, and CRM may be operating as separate lanes',
      description:
        'FlowStack should map how design, website updates, lead capture, sales follow-up, and reporting move between tools and people.',
      severity: 'opportunity',
    });
  }

  if (draft.tools.some(tool => ['gsd', 'beads', 'github', 'linear', 'jira'].includes(tool))) {
    likelyFlowGaps.push({
      title: 'Issue and planning state may be split',
      description:
        'Local planning tools and external issue systems need a bridge or a clear source of truth.',
      severity: 'opportunity',
    });
  }

  if (draft.focus.includes('local_projects')) {
    recommendedNextSteps.push({
      title: 'Start with shallow project inventory later',
      description:
        'For MVP, this audit stays form-only. A future approved snapshot can summarize READMEs, manifests, stack signals, and recent activity.',
      severity: 'info',
    });
  }

  if (draft.focus.includes('agent_tool_chaos') || draft.focus.includes('ai_dev_workflow')) {
    recommendedNextSteps.push({
      title: 'Map the local AI toolprint',
      description:
        'Identify coding agents, workflow tools, memory tools, MCP gateways, and repeated support needs before adding another layer.',
      severity: 'info',
    });
  }

  if (draft.focus.includes('owned_software') || draft.focus.includes('saas_spend')) {
    recommendedNextSteps.push({
      title: 'Find owned-slice opportunities',
      description:
        'Look for tools being rented for one narrow capability that could be built into your owned stack.',
      severity: 'opportunity',
    });
    ownedSliceCandidates.push({
      title: 'Rented narrow capability',
      description:
        'If one platform is mainly used for a small editing, routing, reporting, or follow-up slice, FlowStack can scope whether owning that slice makes sense.',
      severity: 'opportunity',
    });
  }

  if (draft.tools.some(tool => ['wix', 'webflow'].includes(tool))) {
    ownedSliceCandidates.push({
      title: 'Owned web or page-editing slice',
      description:
        'If the business only needs controlled page edits, forms, approvals, or publishing, a smaller owned layer may be worth comparing.',
      severity: 'opportunity',
    });
  }

  if (draft.tools.some(tool => ['gohighlevel', 'hubspot', 'vapi', 'zapier', 'n8n'].includes(tool))) {
    ownedSliceCandidates.push({
      title: 'Lead handoff or automation bridge',
      description:
        'A focused bridge may connect calls, forms, follow-up, and reporting without replacing the tools that already fit.',
      severity: 'info',
    });
  }

  return {
    summary:
      draft.currentPain.trim().length > 0
        ? 'FlowStack can create a first-pass Flow Brief preview from the context provided.'
        : 'Answer the intake questions to generate a first-pass Flow Brief preview.',
    classification: {
      primaryLens: primaryLens(draft.focus),
      businessType: labelFrom<AuditBusinessType>(businessTypeOptions, draft.businessType),
      urgency: labelFrom<AuditUrgency>(urgencyOptions, draft.urgency),
    },
    evidenceCompleteness: evidenceCompleteness(draft),
    likelyFlowGaps,
    recommendedNextSteps,
    ownedSliceCandidates,
    disclaimer: DIRECTIONAL_ESTIMATE_DISCLAIMER,
  };
};

export const auditDraftFromRecord = (record: AuditRequestRecord): AuditIntakeDraft => {
  const metadata = record.metadata ?? {};
  const draft = createEmptyAuditDraft();

  return {
    ...draft,
    focus: record.focus ?? [],
    businessType: metadata.businessType ?? '',
    teamSizeRange: metadata.teamSizeRange ?? 'unknown',
    monthlyToolSpendRange: metadata.monthlyToolSpendRange ?? 'unknown',
    urgency: metadata.urgency ?? 'exploring',
    businessName: record.business_name ?? '',
    websiteUrl: record.website_url ?? '',
    currentPain: record.current_pain ?? '',
    tools: Array.isArray(metadata.tools) ? metadata.tools.filter((tool): tool is string => typeof tool === 'string') : [],
    projectSignals: Array.isArray(metadata.projectSignals)
      ? metadata.projectSignals.filter((signal): signal is string => typeof signal === 'string')
      : [],
    desiredOutcome: record.desired_outcome ?? '',
    contactEmail: record.contact_email ?? '',
    consentToContact: Boolean(metadata.consentToContact),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
};

export const auditLabels = {
  businessType: (value?: AuditBusinessType | '') => labelFrom<AuditBusinessType>(businessTypeOptions, value),
  teamSizeRange: (value?: AuditTeamSizeRange) => labelFrom<AuditTeamSizeRange>(teamSizeRangeOptions, value ?? 'unknown'),
  monthlyToolSpendRange: (value?: AuditMonthlyToolSpendRange) =>
    labelFrom<AuditMonthlyToolSpendRange>(monthlyToolSpendRangeOptions, value ?? 'unknown'),
  urgency: (value?: AuditUrgency) => labelFrom<AuditUrgency>(urgencyOptions, value ?? 'exploring'),
};
