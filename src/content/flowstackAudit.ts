import {
  Bot,
  BrainCircuit,
  Cable,
  GitBranch,
  Layers,
  LifeBuoy,
  Puzzle,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Workflow,
} from 'lucide-react';

export const flowstackAuditHero = {
  eyebrow: 'FlowStack Audit',
  trustText: 'For businesses using AI, SaaS, agents, repos, and local tools',
  headlinePrimary: 'Own your flow',
  headlineSecondary: 'while the stack changes.',
  subhead:
    'Give FlowStack what you have. We map approved tools, teams, agents, SaaS, websites, repos, workspaces, and workflows into a logical business flow, then return a practical path and quote.',
  primaryCta: 'Get a FlowStack Audit',
  secondaryCta: 'See example flow map',
  trustStrip: 'Approved inputs only - Flow Brief and quote - No forced migration',
};

export const flowstackAuditFeatures = [
  {
    icon: ScanSearch,
    title: 'What-You-Have Map',
    description:
      'Turn scattered tools, subscriptions, websites, teams, repos, and services into one understandable flow.',
  },
  {
    icon: Bot,
    title: 'AI Toolprint Scan',
    description:
      'Identify which AI assistants, agents, harnesses, memory tools, and local workflows are present.',
  },
  {
    icon: LifeBuoy,
    title: 'Flow Support Memory',
    description:
      'Spot repeated shell, CLI, hook, worktree, Git, and agent friction so teams stop wasting time.',
  },
  {
    icon: Users,
    title: 'Team Adoption Map',
    description:
      'For future organization rollouts, compare paid tools against approved workspace signals across work devices.',
  },
  {
    icon: GitBranch,
    title: 'Repo & Project Inventory',
    description:
      'Summarize approved projects from READMEs, manifests, configs, activity, and stack signals.',
  },
  {
    icon: WalletCards,
    title: 'Cost & Lock-In Review',
    description:
      'Find tools used for one narrow feature, duplicated spend, brittle handoffs, and migration risk.',
  },
  {
    icon: Layers,
    title: 'Owned Software Opportunities',
    description:
      'Identify the small pieces you should own instead of renting an oversized platform forever.',
  },
  {
    icon: Cable,
    title: 'Bridge & Partner Recommendations',
    description:
      'Show where CRM, web, repo, planning, voice, automation, and agent tools should connect or be replaced.',
  },
  {
    icon: ShieldCheck,
    title: 'Provider & Model Risk Map',
    description:
      'Understand where one vendor, model, API, or workflow risk could interrupt the business.',
  },
];

export const flowstackAuditStages = [
  {
    name: 'Flow Scan',
    price: 'Starter audit',
    description: 'A fast intake that turns what you already have into the first visible flow.',
    features: [
      'Business and tool questionnaire',
      'Approved project/repo list',
      'SaaS and AI tool inventory',
      'Initial friction and risk notes',
      'Recommended next audit path',
      'Quote-readiness check',
    ],
    ctaText: 'Start Flow Scan',
    isPopular: false,
  },
  {
    name: 'FlowStack Audit',
    price: 'Flow Brief + quote',
    description: 'A deeper assessment of where the business flow needs help or leaks value.',
    features: [
      'Stack map and flow brief',
      'Agent/tool workflow review',
      'Cost and lock-in findings',
      'Improvement recommendations',
      'Provider and partner options',
      'Implementation quote',
      'Owned software opportunities',
      'Prioritized implementation roadmap',
    ],
    ctaText: 'Book Audit',
    isPopular: true,
  },
  {
    name: 'Implementation Sprint',
    price: 'Scoped build',
    description: 'Improve one valuable flow or build one owned slice.',
    features: [
      'One approved flow improvement',
      'Connector or bridge implementation',
      'Owned feature-slice plan',
      'FlowStack or partner-assisted build support',
      'Before/after measurement',
    ],
    ctaText: 'Plan Sprint',
    isPopular: false,
  },
];

export const flowstackAuditProofPoints = [
  { value: '10 min', label: 'to map visible tool sprawl' },
  { value: '3 wins', label: 'prioritized from the first audit' },
  { value: '0', label: 'forced platform migrations' },
  { value: '1 quote', label: 'attached to a real flow' },
];

export const flowstackAuditComparison = [
  { feature: 'Existing tools', flowstack: 'Mapped and improved', alternative: 'Often replaced' },
  { feature: 'AI tool changes', flowstack: 'Absorbed into the flow', alternative: 'Create new chaos' },
  { feature: 'Local projects', flowstack: 'Inventoried with consent', alternative: 'Invisible' },
  { feature: 'Team adoption', flowstack: 'Visible from approved workspaces', alternative: 'Assumed from licenses' },
  { feature: 'Repeated friction', flowstack: 'Remembered and improved', alternative: 'Rediscovered' },
  { feature: 'Providers', flowstack: 'Recommended when they fit', alternative: 'Usually vendor-led' },
  { feature: 'Ownership', flowstack: 'Recommended when useful', alternative: 'Usually locked in' },
  { feature: 'Recommendations', flowstack: 'Fit-based', alternative: 'Vendor-biased' },
];

export const flowstackAuditSteps = [
  {
    icon: Puzzle,
    title: 'Give FlowStack what you have',
    description:
      'List the tools, SaaS platforms, AI agents, websites, teams, repos, CRMs, and workflow systems already in play.',
  },
  {
    icon: Workflow,
    title: 'Put it into a logical system',
    description:
      'FlowStack turns those inputs into a readable map of how marketing, design, web, sales, support, and delivery actually move.',
  },
  {
    icon: BrainCircuit,
    title: 'Get the Flow Brief and quote',
    description:
      'You receive practical recommendations, provider options, and a scoped quote for the next useful implementation.',
  },
  {
    icon: Sparkles,
    title: 'Choose the implementation path',
    description:
      'FlowStack can build the owned slice, connect the bridge, or route the work to a fit-based partner when that is the better answer.',
  },
];
