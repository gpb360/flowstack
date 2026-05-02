export type AuditFocus =
  | 'getting_started'
  | 'ai_dev_workflow'
  | 'saas_spend'
  | 'crm_funnel'
  | 'marketing_flow'
  | 'local_projects'
  | 'team_flow_map'
  | 'agent_tool_chaos'
  | 'owned_software';

export type AuditBusinessType =
  | 'creator_solo'
  | 'agency_marketing'
  | 'saas_software'
  | 'local_service'
  | 'corporate_internal'
  | 'consulting_services'
  | 'other';

export type AuditTeamSizeRange =
  | 'unknown'
  | 'solo'
  | '2_10'
  | '11_50'
  | '51_200'
  | '201_1000'
  | '1000_plus';

export type AuditMonthlyToolSpendRange =
  | 'unknown'
  | 'under_500'
  | '500_2000'
  | '2000_10000'
  | '10000_plus';

export type AuditUrgency = 'exploring' | 'this_month' | 'this_week' | 'urgent';

export type AuditStatus = 'submitted' | 'reviewing' | 'brief_ready' | 'sprint_proposed' | 'closed';

export type AuditToolCategory =
  | 'community'
  | 'crm'
  | 'ai_agent'
  | 'coding_agent'
  | 'workflow'
  | 'issue_tracking'
  | 'hosting'
  | 'database'
  | 'marketing'
  | 'payments'
  | 'voice'
  | 'other';

export interface AuditToolOption {
  id: string;
  label: string;
  category: AuditToolCategory;
}

export interface AuditSelectOption<T extends string = string> {
  id: T;
  label: string;
  description: string;
}

export interface AuditIntakeDraft {
  focus: AuditFocus[];
  businessType: AuditBusinessType | '';
  teamSizeRange: AuditTeamSizeRange;
  monthlyToolSpendRange: AuditMonthlyToolSpendRange;
  urgency: AuditUrgency;
  businessName: string;
  websiteUrl: string;
  currentPain: string;
  tools: string[];
  projectSignals: string[];
  desiredOutcome: string;
  contactEmail: string;
  consentToContact: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlowBriefPreviewItem {
  title: string;
  description: string;
  severity: 'info' | 'opportunity' | 'risk';
}

export interface FlowBriefClassification {
  primaryLens: string;
  businessType: string;
  urgency: string;
}

export interface FlowBriefEvidenceCompleteness {
  score: number;
  label: string;
  details: string[];
}

export interface FlowBriefPreview {
  summary: string;
  classification: FlowBriefClassification;
  evidenceCompleteness: FlowBriefEvidenceCompleteness;
  likelyFlowGaps: FlowBriefPreviewItem[];
  recommendedNextSteps: FlowBriefPreviewItem[];
  ownedSliceCandidates: FlowBriefPreviewItem[];
  disclaimer: string;
}

export type AuditQuoteReadiness = 'needs_context' | 'directional_range' | 'reviewed_quote';

export interface AuditQuoteRange {
  low: number;
  high: number;
  currency: 'USD';
}

export interface AuditClarificationQuestion {
  id: string;
  question: string;
  why: string;
  answer?: string;
}

export interface AuditQuoteDraft {
  readiness: AuditQuoteReadiness;
  range: AuditQuoteRange;
  confidence: number;
  assumptions: string[];
  includedScope: string[];
  excludedScope: string[];
  requiredClarifications: AuditClarificationQuestion[];
  nextStep: string;
  disclaimer: string;
}

export interface AuditRequestMetadata {
  tools?: string[];
  projectSignals?: string[];
  consentToContact?: boolean;
  businessType?: AuditBusinessType;
  teamSizeRange?: AuditTeamSizeRange;
  monthlyToolSpendRange?: AuditMonthlyToolSpendRange;
  urgency?: AuditUrgency;
  intakeVersion?: string;
  priorityAuditRequestedAt?: string;
  priorityAuditRequestedBy?: string;
  internalNotes?: string;
  [key: string]: unknown;
}

export interface AuditRequestRecord {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  contact_email: string | null;
  business_name: string | null;
  website_url: string | null;
  focus: AuditFocus[];
  current_pain: string | null;
  desired_outcome: string | null;
  status: AuditStatus;
  source: string;
  flow_brief: Record<string, unknown>;
  metadata: AuditRequestMetadata;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}
