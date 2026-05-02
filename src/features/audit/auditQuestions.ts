import type {
  AuditBusinessType,
  AuditFocus,
  AuditMonthlyToolSpendRange,
  AuditSelectOption,
  AuditTeamSizeRange,
  AuditToolOption,
  AuditUrgency,
} from './types';

export const businessTypeOptions: Array<AuditSelectOption<AuditBusinessType>> = [
  {
    id: 'creator_solo',
    label: 'Creator or solo operator',
    description: 'You sell expertise, community, content, services, or a small offer.',
  },
  {
    id: 'agency_marketing',
    label: 'Agency or marketing team',
    description: 'Campaigns, creative, clients, designers, developers, content, and reporting.',
  },
  {
    id: 'saas_software',
    label: 'SaaS or software company',
    description: 'Product, repos, releases, support, infrastructure, and technical delivery.',
  },
  {
    id: 'local_service',
    label: 'Local service business',
    description: 'Leads, calls, booking, follow-up, reviews, payments, and simple operations.',
  },
  {
    id: 'corporate_internal',
    label: 'Corporate or internal team',
    description: 'Teams, policies, adoption, legacy systems, migration paths, and governance.',
  },
  {
    id: 'consulting_services',
    label: 'Consulting or services firm',
    description: 'Client delivery, proposals, knowledge work, reporting, and reusable systems.',
  },
  {
    id: 'other',
    label: 'Something else',
    description: 'Your flow does not fit the normal categories yet.',
  },
];

export const teamSizeRangeOptions: Array<AuditSelectOption<AuditTeamSizeRange>> = [
  { id: 'unknown', label: 'Not sure', description: 'We will keep the preview broad.' },
  { id: 'solo', label: 'Just me', description: 'A founder, operator, or creator-led flow.' },
  { id: '2_10', label: '2-10', description: 'A small team where handoffs are starting to matter.' },
  { id: '11_50', label: '11-50', description: 'A growing team with multiple working lanes.' },
  { id: '51_200', label: '51-200', description: 'A larger business where adoption visibility matters.' },
  { id: '201_1000', label: '201-1,000', description: 'A multi-team organization with process drift risk.' },
  { id: '1000_plus', label: '1,000+', description: 'An enterprise-scale flow with governance and adoption questions.' },
];

export const monthlyToolSpendRangeOptions: Array<AuditSelectOption<AuditMonthlyToolSpendRange>> = [
  { id: 'unknown', label: 'Not sure', description: 'You do not need exact numbers for the first pass.' },
  { id: 'under_500', label: 'Under $500', description: 'Mostly starter tools or a lean operating stack.' },
  { id: '500_2000', label: '$500-$2,000', description: 'Enough recurring spend to check duplication and fit.' },
  { id: '2000_10000', label: '$2,000-$10,000', description: 'Likely room for keep/connect/own recommendations.' },
  { id: '10000_plus', label: '$10,000+', description: 'A stronger case for workflow, ownership, and adoption review.' },
];

export const urgencyOptions: Array<AuditSelectOption<AuditUrgency>> = [
  { id: 'exploring', label: 'Exploring', description: 'You want clarity before making more changes.' },
  { id: 'this_month', label: 'This month', description: 'You want a practical path soon.' },
  { id: 'this_week', label: 'This week', description: 'You need the review prioritized.' },
  { id: 'urgent', label: 'Urgent', description: 'Something important needs attention now.' },
];

export const auditFocusOptions: Array<{ id: AuditFocus; label: string; description: string }> = [
  {
    id: 'getting_started',
    label: 'Just getting started',
    description:
      'You are using AI here and there, but need a plain business flow before picking more tools.',
  },
  {
    id: 'ai_dev_workflow',
    label: 'AI/dev workflow',
    description: 'Codex, Claude, Cursor, GSD, Beads, repos, worktrees, and local agent flow.',
  },
  {
    id: 'saas_spend',
    label: 'SaaS spend',
    description: 'Tools you pay for, duplicated subscriptions, and rented features you may not need.',
  },
  {
    id: 'crm_funnel',
    label: 'CRM/funnel',
    description: 'GHL, HubSpot, forms, calls, lead follow-up, and funnel opportunities.',
  },
  {
    id: 'marketing_flow',
    label: 'Marketing flow',
    description: 'HubSpot, Wix, design, web, SEO, social content, approvals, and publishing.',
  },
  {
    id: 'local_projects',
    label: 'Local projects',
    description: 'Folders, repos, prototypes, reusable code, stale projects, and stack drift.',
  },
  {
    id: 'team_flow_map',
    label: 'Team flow map',
    description:
      'A future organization view of approved work devices, tool adoption, empty lanes, and unused spend.',
  },
  {
    id: 'agent_tool_chaos',
    label: 'Agent/tool chaos',
    description: 'Multiple AI tools creating context, token, handoff, shell, and provider problems.',
  },
  {
    id: 'owned_software',
    label: 'Owned software',
    description: 'Places where a small owned slice may beat a large rented platform.',
  },
];

export const auditToolOptions: AuditToolOption[] = [
  { id: 'skool', label: 'Skool', category: 'community' },
  { id: 'facebook', label: 'Facebook / Meta', category: 'marketing' },
  { id: 'canva', label: 'Canva', category: 'marketing' },
  { id: 'chatgpt', label: 'ChatGPT', category: 'ai_agent' },
  { id: 'stripe', label: 'Stripe', category: 'payments' },
  { id: 'calendly', label: 'Calendly', category: 'workflow' },
  { id: 'google_docs', label: 'Google Docs / Sheets', category: 'workflow' },
  { id: 'gohighlevel', label: 'GoHighLevel', category: 'crm' },
  { id: 'hubspot', label: 'HubSpot', category: 'crm' },
  { id: 'vapi', label: 'Vapi', category: 'voice' },
  { id: 'replit', label: 'Replit', category: 'coding_agent' },
  { id: 'codex', label: 'Codex', category: 'coding_agent' },
  { id: 'claude', label: 'Claude / Claude Code', category: 'coding_agent' },
  { id: 'cursor', label: 'Cursor', category: 'coding_agent' },
  { id: 'gsd', label: 'GSD', category: 'workflow' },
  { id: 'beads', label: 'Beads', category: 'issue_tracking' },
  { id: 'github', label: 'GitHub', category: 'issue_tracking' },
  { id: 'linear', label: 'Linear', category: 'issue_tracking' },
  { id: 'jira', label: 'Jira', category: 'issue_tracking' },
  { id: 'n8n', label: 'n8n', category: 'workflow' },
  { id: 'zapier', label: 'Zapier', category: 'workflow' },
  { id: 'supabase', label: 'Supabase', category: 'database' },
  { id: 'vercel', label: 'Vercel', category: 'hosting' },
  { id: 'railway', label: 'Railway', category: 'hosting' },
  { id: 'netlify', label: 'Netlify', category: 'hosting' },
  { id: 'webflow', label: 'Webflow', category: 'marketing' },
  { id: 'wix', label: 'Wix', category: 'marketing' },
  { id: 'other', label: 'Other tools', category: 'other' },
];

export const projectSignalOptions = [
  'I am still figuring out what tools I need',
  'I have an offer but no simple website or landing page',
  'I post in a community or social channel but do not capture leads cleanly',
  'My marketing, design, web, and sales work live in separate tools',
  'I have many local project folders',
  'I have multiple GitHub repos',
  'I want to understand which tools the team actually uses',
  'I need a privacy-conscious view across approved work devices',
  'I use more than one coding agent',
  'I have stale or abandoned projects',
  'I repeat the same build patterns across projects',
  'I have tools installed that do not connect cleanly',
  'I am unsure what should be owned vs rented',
  'I want a clear implementation quote after the audit',
];
