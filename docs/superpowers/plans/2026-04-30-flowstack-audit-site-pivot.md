# FlowStack Audit Site Pivot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing FlowStack marketing site into an audit-first intake funnel without rebuilding the whole application.

**Architecture:** Keep the current React/Vite marketing shell, auth flow, dashboard shell, and component styling. Replace the landing-page conversion story, add a public audit intake route, persist the intake as an audit request, and produce a first-pass Flow Brief that can be fulfilled manually at first and automated later.

**Tech Stack:** React 19, TypeScript, React Router v7, Supabase, Tailwind CSS v4, existing marketing components, existing auth/onboarding providers.

---

## Product Direction

Current site message:

> "FlowStack is an all-in-one CRM, marketing automation, AI agents, site builder, and workflow platform."

New site message:

> "Stop trying to keep up with every AI tool. Own the flow they all depend on."

Primary offer:

> "Get a FlowStack Audit."

Primary user journey:

1. User lands on the homepage.
2. Homepage explains FlowStack as the business flow intelligence layer.
3. User clicks "Get a FlowStack Audit."
4. User answers a short audit intake.
5. FlowStack generates a first-pass Flow Brief preview.
6. User creates an account or signs in to save/continue the audit.
7. Symbiotic / FlowStack team reviews the request and delivers a deeper audit.

## File Structure

### Files to Create

- `src/content/flowstackAudit.ts`
  - Owns public marketing copy for the audit-first landing page.
  - Keeps copy out of `LandingPage.tsx` so future marketing changes are small.

- `src/features/audit/types.ts`
  - Defines audit intake types, answer shapes, and Flow Brief types.

- `src/features/audit/auditQuestions.ts`
  - Defines the intake questions and option lists.

- `src/features/audit/auditStorage.ts`
  - Handles local draft persistence before signup.

- `src/features/audit/FlowBriefPreview.tsx`
  - Renders the first-pass "what we can already see" result from intake answers.

- `src/pages/AuditIntakePage.tsx`
  - Public route for the audit intake.

- `db/audit_schema.sql`
  - Defines `audit_requests` and `audit_answers` for Supabase persistence.

### Files to Modify

- `src/pages/LandingPage.tsx`
  - Replace CRM-first hero, features, pricing, stats, comparison, and CTAs with audit-first content.
  - Keep the existing visual shell and animations.

- `src/components/marketing/MarketingHeader.tsx`
  - Update nav labels to match the audit-first page sections.
  - Change primary CTA text to "Get Audit."

- `src/App.tsx`
  - Add public `/audit` route.
  - Add protected `/dashboard/audit` route only if the first implementation includes an authenticated review screen.

- `src/pages/AuthPage.tsx`
  - Preserve `?intent=audit` and redirect back to `/audit?continue=1` after login/signup when appropriate.

- `src/pages/OnboardingWizard.tsx`
  - If user signs up from audit, return them to the audit flow after organization creation.

### Files to Leave Alone in First Slice

- Existing dashboard modules.
- Existing CRM, marketing, workflow, phone, forms, and builder modules.
- Existing Supabase auth implementation, except redirect intent handling.
- Existing styling system.

---

## Task 1: Add Audit-First Marketing Content

**Files:**

- Create: `src/content/flowstackAudit.ts`
- Modify later: `src/pages/LandingPage.tsx`

- [ ] **Step 1: Create the content directory if missing**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'E:\FlowStack\src\content'
```

Expected: directory exists at `src/content`.

- [ ] **Step 2: Create `src/content/flowstackAudit.ts`**

Add:

```typescript
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
  WalletCards,
  Workflow,
} from 'lucide-react';

export const flowstackAuditHero = {
  eyebrow: 'FlowStack Audit',
  trustText: 'For businesses using AI, SaaS, agents, repos, and local tools',
  headlinePrimary: 'Own your flow',
  headlineSecondary: 'while the stack changes.',
  subhead:
    'FlowStack maps your tools, agents, repos, SaaS, workflows, and projects, then shows what to keep, fix, connect, replace, or own.',
  primaryCta: 'Get a FlowStack Audit',
  secondaryCta: 'See example flow map',
  trustStrip: 'Read-only intake · Human-reviewed recommendations · No forced migration',
};

export const flowstackAuditFeatures = [
  {
    icon: ScanSearch,
    title: 'Stack & SaaS Map',
    description:
      'See the tools, subscriptions, platforms, repos, and services your business is actually running on.',
  },
  {
    icon: Bot,
    title: 'AI Toolprint Scan',
    description:
      'Identify which AI assistants, agents, harnesses, memory tools, and local workflows are present.',
  },
  {
    icon: LifeBuoy,
    title: 'Flow Repair Memory',
    description:
      'Spot repeated shell, CLI, hook, worktree, Git, and agent failures so they stop wasting time.',
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
    title: 'Bridge Recommendations',
    description:
      'Show where GitHub, GSD, Beads, Jira, Linear, HubSpot, GHL, Vapi, and agents need to connect.',
  },
  {
    icon: ShieldCheck,
    title: 'Provider & Model Risk Map',
    description:
      'Understand where one vendor, model, API, or workflow failure could interrupt the business.',
  },
];

export const flowstackAuditStages = [
  {
    name: 'Flow Scan',
    price: 'Starter audit',
    description: 'A fast intake that maps the visible shape of your stack.',
    features: [
      'Business and tool questionnaire',
      'Approved project/repo list',
      'SaaS and AI tool inventory',
      'Initial friction and risk notes',
      'Recommended next audit path',
    ],
    ctaText: 'Start Flow Scan',
    isPopular: false,
  },
  {
    name: 'FlowStack Audit',
    price: 'Human-reviewed',
    description: 'A deeper assessment of where the business flow breaks or leaks value.',
    features: [
      'Stack map and flow brief',
      'Agent/tool workflow review',
      'Cost and lock-in findings',
      'Repair recommendations',
      'Owned software opportunities',
      'Prioritized implementation roadmap',
    ],
    ctaText: 'Book Audit',
    isPopular: true,
  },
  {
    name: 'Implementation Sprint',
    price: 'Scoped build',
    description: 'Fix one valuable flow or build one owned slice.',
    features: [
      'One approved flow repair',
      'Connector or bridge implementation',
      'Owned feature-slice plan',
      'Agent-assisted build support',
      'Before/after measurement',
    ],
    ctaText: 'Plan Sprint',
    isPopular: false,
  },
];

export const flowstackAuditProofPoints = [
  { value: '10 min', label: 'to map the visible toolprint' },
  { value: '3 wins', label: 'prioritized from the first audit' },
  { value: '0', label: 'forced platform migrations' },
  { value: '1 flow', label: 'fixed before expanding scope' },
];

export const flowstackAuditComparison = [
  { feature: 'Existing tools', flowstack: 'Mapped and improved', alternative: 'Often replaced' },
  { feature: 'AI tool changes', flowstack: 'Absorbed into the flow', alternative: 'Create new chaos' },
  { feature: 'Local projects', flowstack: 'Inventoried with consent', alternative: 'Invisible' },
  { feature: 'Repeated errors', flowstack: 'Remembered and repaired', alternative: 'Rediscovered' },
  { feature: 'Ownership', flowstack: 'Recommended when useful', alternative: 'Usually locked in' },
  { feature: 'Recommendations', flowstack: 'Fit-based', alternative: 'Vendor-biased' },
];

export const flowstackAuditSteps = [
  {
    icon: Puzzle,
    title: 'Tell FlowStack what you use',
    description:
      'List the tools, SaaS platforms, AI agents, repos, websites, CRMs, and workflow systems already in play.',
  },
  {
    icon: Workflow,
    title: 'Map the flow',
    description:
      'FlowStack turns those inputs into a readable map of how work moves and where handoffs break.',
  },
  {
    icon: BrainCircuit,
    title: 'Get the first Flow Brief',
    description:
      'You receive practical recommendations: keep, connect, repair, replace, or own the right pieces.',
  },
  {
    icon: Sparkles,
    title: 'Fix one valuable flow',
    description:
      'Start with one repair or owned slice before expanding into ongoing monitoring and implementation.',
  },
];
```

- [ ] **Step 3: Type-check the new content file**

Run:

```powershell
npm run build
```

Expected: build fails only if imports or icon names are wrong. Fix any invalid icon import by choosing a valid `lucide-react` icon already installed in the project.

---

## Task 2: Pivot the Landing Page Copy Without Rebuilding the Design

**Files:**

- Modify: `src/pages/LandingPage.tsx`
- Modify: `src/components/marketing/MarketingHeader.tsx`

- [ ] **Step 1: Update landing page imports**

In `src/pages/LandingPage.tsx`, remove unused direct content arrays after importing the new content:

```typescript
import {
  flowstackAuditComparison,
  flowstackAuditFeatures,
  flowstackAuditHero,
  flowstackAuditProofPoints,
  flowstackAuditStages,
  flowstackAuditSteps,
} from '@/content/flowstackAudit';
```

- [ ] **Step 2: Change CTA navigation**

Update `handleStartTrial` so the primary CTA opens the audit intake:

```typescript
const handleStartTrial = useCallback(() => {
  trackCTAClick('flowstack_audit', 'hero_section');
  navigate('/audit');
}, [navigate]);
```

Update `handlePricingClick` so pricing/stage CTAs also open audit:

```typescript
const handlePricingClick = useCallback((tier: string, price: number | null) => {
  trackPricingClick(tier, price);
  navigate(`/audit?stage=${encodeURIComponent(tier.toLowerCase())}`);
}, [navigate]);
```

- [ ] **Step 3: Replace hero text**

Use:

```tsx
<span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#d4af37]">
  {flowstackAuditHero.eyebrow}
</span>
```

Replace the trust text with:

```tsx
<span className="text-xs text-[#6b7280] tracking-wide">
  {flowstackAuditHero.trustText}
</span>
```

Replace the two hero headings with:

```tsx
{flowstackAuditHero.headlinePrimary}
```

and:

```tsx
{flowstackAuditHero.headlineSecondary}
```

Replace the subhead with:

```tsx
{flowstackAuditHero.subhead}
```

Replace CTA labels with:

```tsx
{flowstackAuditHero.primaryCta}
{flowstackAuditHero.secondaryCta}
```

- [ ] **Step 4: Replace feature, stage, proof, and comparison arrays**

Set the existing arrays to the imported content:

```typescript
const features = flowstackAuditFeatures;
const pricingTiers = flowstackAuditStages.map(stage => ({
  ...stage,
  price: null,
}));
const comparisonData = flowstackAuditComparison.map(row => ({
  feature: row.feature,
  flowstack: row.flowstack,
  ghl: row.alternative,
}));
const stats = flowstackAuditProofPoints;
```

If the existing `PricingCard` requires numeric prices, update `PricingCard` in a later step to accept `string | number | null`; otherwise render stage pricing text directly in the landing page.

- [ ] **Step 5: Update `MarketingHeader` nav labels**

Replace:

```typescript
const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];
```

with:

```typescript
const navItems = [
  { label: 'Audit', href: '#features' },
  { label: 'How it works', href: '#process' },
  { label: 'Stages', href: '#pricing' },
];
```

Replace "Get Started" with "Get Audit" in desktop and mobile CTA buttons.

- [ ] **Step 6: Verify the landing page still renders**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build pass.

---

## Task 3: Add Audit Intake Types and Questions

**Files:**

- Create: `src/features/audit/types.ts`
- Create: `src/features/audit/auditQuestions.ts`
- Create: `src/features/audit/auditStorage.ts`

- [ ] **Step 1: Create audit feature directory**

Run:

```powershell
New-Item -ItemType Directory -Force -Path 'E:\FlowStack\src\features\audit'
```

- [ ] **Step 2: Create `src/features/audit/types.ts`**

Add:

```typescript
export type AuditFocus =
  | 'ai_dev_workflow'
  | 'saas_spend'
  | 'crm_funnel'
  | 'marketing_flow'
  | 'local_projects'
  | 'agent_tool_chaos'
  | 'owned_software';

export type AuditToolCategory =
  | 'crm'
  | 'ai_agent'
  | 'coding_agent'
  | 'workflow'
  | 'issue_tracking'
  | 'hosting'
  | 'database'
  | 'marketing'
  | 'voice'
  | 'other';

export interface AuditToolOption {
  id: string;
  label: string;
  category: AuditToolCategory;
}

export interface AuditIntakeDraft {
  focus: AuditFocus[];
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

export interface FlowBriefPreview {
  summary: string;
  likelyFlowGaps: FlowBriefPreviewItem[];
  recommendedNextSteps: FlowBriefPreviewItem[];
}
```

- [ ] **Step 3: Create `src/features/audit/auditQuestions.ts`**

Add:

```typescript
import type { AuditFocus, AuditToolOption } from './types';

export const auditFocusOptions: Array<{ id: AuditFocus; label: string; description: string }> = [
  {
    id: 'ai_dev_workflow',
    label: 'AI/dev workflow',
    description: 'Codex, Claude, Cursor, Archon, GSD, Beads, repos, worktrees, and local agent flow.',
  },
  {
    id: 'saas_spend',
    label: 'SaaS spend',
    description: 'Tools you pay for, duplicated subscriptions, and rented features you may not need.',
  },
  {
    id: 'crm_funnel',
    label: 'CRM/funnel',
    description: 'GHL, HubSpot, forms, calls, lead follow-up, and funnel failures.',
  },
  {
    id: 'marketing_flow',
    label: 'Marketing flow',
    description: 'Website, SEO, blog cadence, social content, approvals, and publishing.',
  },
  {
    id: 'local_projects',
    label: 'Local projects',
    description: 'Folders, repos, prototypes, reusable code, stale projects, and stack drift.',
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
  { id: 'gohighlevel', label: 'GoHighLevel', category: 'crm' },
  { id: 'hubspot', label: 'HubSpot', category: 'crm' },
  { id: 'vapi', label: 'Vapi', category: 'voice' },
  { id: 'replit', label: 'Replit', category: 'coding_agent' },
  { id: 'codex', label: 'Codex', category: 'coding_agent' },
  { id: 'claude', label: 'Claude / Claude Code', category: 'coding_agent' },
  { id: 'cursor', label: 'Cursor', category: 'coding_agent' },
  { id: 'archon', label: 'Archon', category: 'ai_agent' },
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
  'I have many local project folders',
  'I have multiple GitHub repos',
  'I use more than one coding agent',
  'I have stale or abandoned projects',
  'I repeat the same build patterns across projects',
  'I have tools installed that do not connect cleanly',
  'I am unsure what should be owned vs rented',
];
```

- [ ] **Step 4: Create `src/features/audit/auditStorage.ts`**

Add:

```typescript
import type { AuditIntakeDraft } from './types';

const STORAGE_KEY = 'flowstack:audit-intake-draft';

export const createEmptyAuditDraft = (): AuditIntakeDraft => {
  const now = new Date().toISOString();

  return {
    focus: [],
    businessName: '',
    websiteUrl: '',
    currentPain: '',
    tools: [],
    projectSignals: [],
    desiredOutcome: '',
    contactEmail: '',
    consentToContact: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const loadAuditDraft = (): AuditIntakeDraft => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyAuditDraft();
    return { ...createEmptyAuditDraft(), ...JSON.parse(raw) };
  } catch {
    return createEmptyAuditDraft();
  }
};

export const saveAuditDraft = (draft: AuditIntakeDraft) => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...draft, updatedAt: new Date().toISOString() })
  );
};

export const clearAuditDraft = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
```

- [ ] **Step 5: Verify TypeScript**

Run:

```powershell
npm run build
```

Expected: build passes.

---

## Task 4: Add Public Audit Intake Page

**Files:**

- Create: `src/pages/AuditIntakePage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/pages/AuditIntakePage.tsx`**

Add a first version that stores answers locally and shows a preview:

```tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { auditFocusOptions, auditToolOptions, projectSignalOptions } from '@/features/audit/auditQuestions';
import { createEmptyAuditDraft, loadAuditDraft, saveAuditDraft } from '@/features/audit/auditStorage';
import { FlowBriefPreview } from '@/features/audit/FlowBriefPreview';
import type { AuditIntakeDraft } from '@/features/audit/types';
import { cn } from '@/lib/utils';

const toggleValue = (values: string[], value: string) =>
  values.includes(value) ? values.filter(item => item !== value) : [...values, value];

export const AuditIntakePage = () => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<AuditIntakeDraft>(() => {
    if (typeof window === 'undefined') return createEmptyAuditDraft();
    return loadAuditDraft();
  });

  useEffect(() => {
    saveAuditDraft(draft);
  }, [draft]);

  const canContinue = useMemo(
    () => draft.focus.length > 0 && draft.currentPain.trim().length > 10,
    [draft.focus.length, draft.currentPain]
  );

  const updateDraft = (next: Partial<AuditIntakeDraft>) => {
    setDraft(prev => ({ ...prev, ...next, updatedAt: new Date().toISOString() }));
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

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">
              FlowStack Audit
            </p>
            <h1 className="mb-5 text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Show us the flow. We will show you where it breaks.
            </h1>
            <p className="mb-8 max-w-2xl text-base leading-7 text-[#8a8f9a]">
              This intake creates a first-pass map of your tools, agents, SaaS, repos, workflows,
              and ownership gaps. It starts manual and read-only. No forced migration.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="mb-4 text-lg font-semibold">What do you want FlowStack to understand?</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {auditFocusOptions.map(option => {
                    const active = draft.focus.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateDraft({ focus: toggleValue(draft.focus, option.id) as AuditIntakeDraft['focus'] })}
                        className={cn(
                          'border p-4 text-left transition-colors',
                          active ? 'border-[#d4af37] bg-[#d4af37]/10' : 'border-[#24272f] bg-[#0d0f12] hover:border-[#d4af37]/40'
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
                  <span className="text-sm font-medium text-white">What feels broken or expensive right now?</span>
                  <textarea
                    value={draft.currentPain}
                    onChange={event => updateDraft({ currentPain: event.target.value })}
                    className="min-h-32 w-full border border-[#24272f] bg-[#0d0f12] px-4 py-3 text-sm text-white outline-none focus:border-[#d4af37]"
                    placeholder="Example: We use GHL, HubSpot, Codex, Claude, GitHub, and local agent tools, but leads still fall through and agents repeat the same setup errors."
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
                          active ? 'border-[#d4af37] bg-[#d4af37]/10 text-white' : 'border-[#24272f] text-[#8a8f9a] hover:text-white'
                        )}
                      >
                        {tool.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-lg font-semibold">What project signals apply?</h2>
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
                    placeholder="Fix one flow, reduce spend, map agents..."
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

              <button
                type="button"
                disabled={!canContinue}
                onClick={() => navigate('/auth?mode=signup&intent=audit')}
                className="flex items-center gap-3 bg-[#d4af37] px-6 py-4 text-sm font-semibold text-[#08090a] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save audit and continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <FlowBriefPreview draft={draft} />
        </section>
      </main>
    </div>
  );
};
```

- [ ] **Step 2: Add public route in `src/App.tsx`**

Add lazy import near other public pages:

```typescript
const AuditIntakePage = React.lazy(() => import('./pages/AuditIntakePage').then(m => ({ default: m.AuditIntakePage })));
```

Add route after `/auth` or before legal pages:

```tsx
<Route path="/audit" element={
  <Suspense fallback={<PageLoader />}>
    <AuditIntakePage />
  </Suspense>
} />
```

- [ ] **Step 3: Verify route compiles**

Run:

```powershell
npm run build
```

Expected: build passes or reports only missing `FlowBriefPreview`, which Task 5 creates.

---

## Task 5: Add First-Pass Flow Brief Preview

**Files:**

- Create: `src/features/audit/FlowBriefPreview.tsx`

- [ ] **Step 1: Create Flow Brief preview component**

Add:

```tsx
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from 'lucide-react';
import type { AuditIntakeDraft, FlowBriefPreview as FlowBriefPreviewModel } from './types';

const buildPreview = (draft: AuditIntakeDraft): FlowBriefPreviewModel => {
  const likelyFlowGaps = [];
  const recommendedNextSteps = [];

  if (draft.tools.length >= 5) {
    likelyFlowGaps.push({
      title: 'Tool sprawl is likely part of the flow problem',
      description: 'You selected several tools. FlowStack should map which ones own context, tasks, leads, and execution.',
      severity: 'risk' as const,
    });
  }

  if (draft.tools.some(tool => ['gsd', 'beads', 'github', 'linear', 'jira'].includes(tool))) {
    likelyFlowGaps.push({
      title: 'Issue and planning state may be split',
      description: 'Local planning tools and external issue systems need a bridge or a clear source of truth.',
      severity: 'opportunity' as const,
    });
  }

  if (draft.focus.includes('local_projects')) {
    recommendedNextSteps.push({
      title: 'Start with shallow project inventory',
      description: 'Approve parent folders, then summarize READMEs, manifests, stack signals, and recent activity.',
      severity: 'info' as const,
    });
  }

  if (draft.focus.includes('agent_tool_chaos') || draft.focus.includes('ai_dev_workflow')) {
    recommendedNextSteps.push({
      title: 'Map the local AI toolprint',
      description: 'Identify Codex, Claude, Archon, GSD, Beads, memory tools, MCP gateways, and repeated repair needs.',
      severity: 'info' as const,
    });
  }

  if (draft.focus.includes('owned_software') || draft.focus.includes('saas_spend')) {
    recommendedNextSteps.push({
      title: 'Find owned-slice opportunities',
      description: 'Look for tools being rented for one narrow capability that could be built into your owned stack.',
      severity: 'opportunity' as const,
    });
  }

  return {
    summary:
      draft.currentPain.trim().length > 0
        ? 'FlowStack can already see enough to create a first-pass audit path.'
        : 'Answer the intake questions to generate a first-pass audit path.',
    likelyFlowGaps,
    recommendedNextSteps,
  };
};

const iconForSeverity = {
  info: Info,
  opportunity: Lightbulb,
  risk: AlertTriangle,
};

export const FlowBriefPreview = ({ draft }: { draft: AuditIntakeDraft }) => {
  const preview = buildPreview(draft);

  return (
    <aside className="border border-[#24272f] bg-[#0d0f12] p-6 lg:sticky lg:top-8 lg:self-start">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">
        First Flow Brief
      </p>
      <h2 className="mb-3 text-2xl font-semibold text-white">What FlowStack can infer so far</h2>
      <p className="mb-6 text-sm leading-6 text-[#8a8f9a]">{preview.summary}</p>

      <div className="mb-6 space-y-3">
        <h3 className="text-sm font-semibold text-white">Likely flow gaps</h3>
        {preview.likelyFlowGaps.length === 0 ? (
          <p className="text-sm text-[#6b7280]">Select tools and focus areas to reveal likely gaps.</p>
        ) : (
          preview.likelyFlowGaps.map(item => {
            const Icon = iconForSeverity[item.severity];
            return (
              <div key={item.title} className="border border-[#24272f] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                  <Icon className="h-4 w-4 text-[#d4af37]" />
                  {item.title}
                </div>
                <p className="text-sm leading-6 text-[#8a8f9a]">{item.description}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-3">
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
    </aside>
  );
};
```

- [ ] **Step 2: Verify preview builds**

Run:

```powershell
npm run build
```

Expected: build passes.

---

## Task 6: Preserve Audit Intent Through Auth

**Files:**

- Modify: `src/pages/AuthPage.tsx`
- Modify: `src/pages/OnboardingWizard.tsx`

- [ ] **Step 1: Read intent param in `AuthPage`**

Add:

```typescript
const intent = searchParams.get('intent');
```

Update the authenticated redirect effect:

```typescript
useEffect(() => {
  if (session && !isLoading) {
    if (!hasCompletedOnboarding) {
      navigate(intent === 'audit' ? '/onboarding?intent=audit' : '/onboarding', { replace: true });
    } else {
      navigate(intent === 'audit' ? '/audit?continue=1' : '/dashboard', { replace: true });
    }
  }
}, [session, isLoading, navigate, hasCompletedOnboarding, intent]);
```

- [ ] **Step 2: Preserve intent in `OnboardingWizard`**

Import `useSearchParams`:

```typescript
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
```

Add inside the component:

```typescript
const [searchParams] = useSearchParams();
const intent = searchParams.get('intent');
```

Update final navigation after organization creation:

```typescript
navigate(intent === 'audit' ? '/audit?continue=1' : '/dashboard', { replace: true });
```

- [ ] **Step 3: Verify auth intent compiles**

Run:

```powershell
npm run build
```

Expected: build passes.

---

## Task 7: Add Audit Persistence Schema

**Files:**

- Create: `db/audit_schema.sql`
- Modify later: `src/types/database.types.ts` after local Supabase generation is available.

- [ ] **Step 1: Create `db/audit_schema.sql`**

Add:

```sql
-- FlowStack Audit intake and fulfillment

create table if not exists audit_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  business_name text,
  website_url text,
  focus text[] not null default '{}',
  current_pain text,
  desired_outcome text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'reviewing', 'brief_ready', 'sprint_proposed', 'closed')),
  source text not null default 'public_audit_intake',
  flow_brief jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_answers (
  id uuid primary key default gen_random_uuid(),
  audit_request_id uuid not null references audit_requests(id) on delete cascade,
  question_key text not null,
  answer jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table audit_requests enable row level security;
alter table audit_answers enable row level security;

create policy "Users can read their own audit requests"
  on audit_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert their own audit requests"
  on audit_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can update draft audit requests"
  on audit_requests for update
  using (auth.uid() = user_id and status in ('draft', 'submitted'))
  with check (auth.uid() = user_id);

create policy "Users can read answers for their audit requests"
  on audit_answers for select
  using (
    exists (
      select 1 from audit_requests
      where audit_requests.id = audit_answers.audit_request_id
      and audit_requests.user_id = auth.uid()
    )
  );

create policy "Users can insert answers for their audit requests"
  on audit_answers for insert
  with check (
    exists (
      select 1 from audit_requests
      where audit_requests.id = audit_answers.audit_request_id
      and audit_requests.user_id = auth.uid()
    )
  );
```

- [ ] **Step 2: Apply schema through the repo's migration process**

Run when Supabase local tooling is available:

```powershell
npm run db:push
```

Expected: Supabase applies `audit_requests` and `audit_answers`.

- [ ] **Step 3: Regenerate database types**

Run:

```powershell
npm run db:generate
```

Expected: `src/types/database.types.ts` includes `audit_requests` and `audit_answers`.

---

## Task 8: Submit Audit Drafts to Supabase After Login

**Files:**

- Create: `src/features/audit/useSubmitAuditRequest.ts`
- Modify: `src/pages/AuditIntakePage.tsx`

- [ ] **Step 1: Create submission hook**

Add:

```typescript
import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { AuditIntakeDraft } from './types';

export const useSubmitAuditRequest = () => {
  const { user, currentOrganization } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitAuditRequest = useCallback(async (draft: AuditIntakeDraft) => {
    if (!user) {
      return { data: null, error: new Error('Sign in to submit your audit request.') };
    }

    setIsSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('audit_requests')
      .insert({
        organization_id: currentOrganization?.id ?? null,
        user_id: user.id,
        contact_email: draft.contactEmail,
        business_name: draft.businessName,
        website_url: draft.websiteUrl,
        focus: draft.focus,
        current_pain: draft.currentPain,
        desired_outcome: draft.desiredOutcome,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        metadata: {
          tools: draft.tools,
          projectSignals: draft.projectSignals,
          consentToContact: draft.consentToContact,
          draftCreatedAt: draft.createdAt,
        },
      })
      .select()
      .single();

    setIsSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return { data: null, error: insertError };
    }

    return { data, error: null };
  }, [currentOrganization?.id, user]);

  return { submitAuditRequest, isSubmitting, error };
};
```

- [ ] **Step 2: Wire submission into `AuditIntakePage`**

Import:

```typescript
import { useAuth } from '@/context/AuthContext';
import { useSubmitAuditRequest } from '@/features/audit/useSubmitAuditRequest';
import { clearAuditDraft } from '@/features/audit/auditStorage';
```

Inside component:

```typescript
const { user } = useAuth();
const { submitAuditRequest, isSubmitting, error: submitError } = useSubmitAuditRequest();
```

Replace button `onClick`:

```typescript
onClick={async () => {
  if (!user) {
    navigate('/auth?mode=signup&intent=audit');
    return;
  }

  const result = await submitAuditRequest(draft);
  if (!result.error) {
    clearAuditDraft();
    navigate('/dashboard');
  }
}}
```

Update button label:

```tsx
{user ? (isSubmitting ? 'Submitting audit...' : 'Submit audit request') : 'Save audit and continue'}
```

Render submission errors near the button:

```tsx
{submitError && <p className="text-sm text-red-400">{submitError}</p>}
```

- [ ] **Step 3: Verify submission types**

Run:

```powershell
npm run build
```

Expected: build passes after `src/types/database.types.ts` includes audit tables. If types have not been regenerated, temporarily type the insert payload through `as never` only inside this hook and remove that cast after type generation.

---

## Task 9: Add Manual Fulfillment Workflow

**Files:**

- Create: `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`

- [ ] **Step 1: Create fulfillment playbook**

Add:

```markdown
# FlowStack Audit Fulfillment Playbook

## Intake Review

1. Read the submitted audit request.
2. Identify primary focus areas.
3. Identify tools, SaaS, agent systems, repos, and project signals.
4. Classify the request as one of:
   - AI/dev workflow
   - SaaS spend and ownership
   - CRM/funnel flow
   - Marketing flow
   - Local project/toolprint
   - Agent/tool repair

## First Flow Brief Format

### Executive Summary

Summarize what the business appears to be trying to do and where the flow is likely breaking.

### Current Stack Signals

List tools, repos, SaaS, agents, workflows, and hosting/data layers mentioned or discovered.

### Likely Flow Breaks

List 3-7 observed or likely breaks. Each item must include:

- evidence
- business impact
- recommended next action

### Keep / Connect / Repair / Replace / Own

Classify recommendations:

- Keep: tools that fit the current flow.
- Connect: tools that need a bridge.
- Repair: repeated environment, agent, workflow, or handoff failures.
- Replace: tools that no longer fit.
- Own: small feature slices worth building into the customer's stack.

### First Implementation Sprint

Recommend one focused sprint that can create value quickly.

## Delivery Rule

The audit must not shame the customer's current tools or team. The output should focus on the flow, the missing bridge, and the practical next step.
```

- [ ] **Step 2: Link the playbook from the PRD**

Modify `docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md` under "Public Messaging Direction" and add:

```markdown
Fulfillment reference: `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`
```

- [ ] **Step 3: Verify docs only**

Run:

```powershell
git diff -- docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md
```

Expected: only documentation changes appear.

---

## Task 10: Final QA and Launch Checklist

**Files:**

- Modify only files touched by previous tasks.

- [ ] **Step 1: Run lint**

Run:

```powershell
npm run lint
```

Expected: no new lint errors from audit files.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm run build
```

Expected: TypeScript compile and Vite build pass.

- [ ] **Step 3: Start dev server**

Run:

```powershell
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 4: Manual browser QA**

Open the dev URL and verify:

- `/` loads.
- Hero says "Own your flow while the stack changes."
- Primary CTA opens `/audit`.
- `/audit` loads without auth.
- Audit answers persist after page refresh.
- Flow Brief preview changes when tools/focus areas are selected.
- "Save audit and continue" routes unauthenticated users to `/auth?mode=signup&intent=audit`.
- Authenticated users can return to `/audit?continue=1`.
- Mobile layout has no overlapping text.

- [ ] **Step 5: Commit first slice**

After build and QA pass:

```powershell
git status --short
git add src/content/flowstackAudit.ts src/features/audit src/pages/AuditIntakePage.tsx src/pages/LandingPage.tsx src/components/marketing/MarketingHeader.tsx src/App.tsx docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md docs/superpowers/plans/2026-04-30-flowstack-audit-site-pivot.md
git commit -m "feat: pivot landing page to FlowStack audit intake"
```

Expected: commit succeeds on the current feature branch.

---

## Execution Order

Recommended execution order:

1. Task 1: content config
2. Task 2: landing page pivot
3. Task 3: intake types/questions/storage
4. Task 5: Flow Brief preview
5. Task 4: public audit page and route
6. Task 6: auth intent preservation
7. Task 9: manual fulfillment playbook
8. Task 10: QA
9. Task 7 and Task 8 after Supabase schema/type generation is ready

This order gives the fastest visible win while avoiding a backend blocker.

## Self-Review

Spec coverage:

- Landing page pivot is covered by Tasks 1 and 2.
- Audit intake path is covered by Tasks 3, 4, and 5.
- Auth handoff is covered by Task 6.
- Persistence is covered by Tasks 7 and 8.
- Human-assisted audit delivery is covered by Task 9.
- Verification is covered by Task 10.

Placeholder scan:

- No task uses undefined placeholder filenames.
- Backend persistence is intentionally sequenced after a frontend-first launch path.

Type consistency:

- `AuditIntakeDraft`, `FlowBriefPreview`, and option IDs are defined before use.
- Route names are consistent: `/audit`, `/auth?mode=signup&intent=audit`, `/onboarding?intent=audit`.

