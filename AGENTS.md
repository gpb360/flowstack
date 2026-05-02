# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

FlowStack is an AI-native business platform (alternative to GoHighLevel) built as a React 19 SPA with Supabase backend. It features a modular architecture where features can be enabled/disabled per organization, with workflow automation as the connective tissue between all modules.

## Development Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9 (strict mode), Vite 7
- **Routing**: React Router DOM v7 with lazy-loaded routes
- **State**: Zustand (client state with undo/redo), TanStack React Query v5 (server state)
- **UI**: Tailwind CSS v4, Radix UI primitives, shadcn/ui components, Lucide icons
- **Drag & Drop**: @dnd-kit (builder), @xyflow/react (workflow canvas)
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Path Alias**: `@/` maps to `./src/`

## Architecture

### Feature Module System

The core architectural pattern - every capability is a self-contained module defined in `src/lib/registry.ts`:

```typescript
// Module registration with dependencies
MODULES: Record<ModuleId, ModuleDefinition>
// ModuleDefinition includes: id, name, category, icon, dependencies[], isCore
```

Core modules (cannot be disabled): `dashboard`, `crm`, `workflows`

Routes are protected by `<FeatureGuard moduleId="...">` and `<RoleGuard allowedRoles={[...]}>` components.

### Directory Structure

```
src/
├── components/
│   ├── FeatureGuard.tsx    # Module access enforcement
│   ├── RoleGuard.tsx       # RBAC enforcement
│   ├── layout/AppLayout.tsx
│   └── ui/                 # shadcn components
├── context/
│   ├── AuthContext.tsx     # Auth + multi-org management
│   └── FeatureContext.tsx  # Module registry state
├── features/               # Feature modules (self-contained)
│   ├── dashboard/
│   ├── crm/
│   ├── builder/           # Page builder with Zustand store
│   ├── workflows/         # Visual workflow editor (XyFlow)
│   └── marketing/
├── lib/
│   ├── supabase.ts        # Supabase client
│   ├── registry.ts        # Module definitions
│   └── utils.ts           # cn() helper
└── types/
    └── database.types.ts  # Auto-generated Supabase types
```

### State Management Patterns

1. **Auth/Feature Context** - Global providers at app root
2. **Zustand stores** - Feature-specific client state (see `features/builder/useBuilderStore.ts` for undo/redo pattern)
3. **React Query** - Server data fetching and caching

### Database Schema (Multi-Tenant)

All tables are organization-scoped with RLS policies. Schema files in `db/`:

- `init.sql` - Core: `user_profiles`, `organizations`, `memberships` (roles: owner/admin/member)
- `crm_schema.sql` - `contacts`, `companies`, `activities`
- `deals_schema.sql` - `deals`, `deal_stages`, `deal_history`
- `marketing_schema.sql` - `marketing_templates`, `marketing_campaigns`, `marketing_logs`
- `builder_schema.sql` - `sites`, `pages`, `site_versions`
- `workflow_schema.sql` - `workflows`, `workflow_nodes`, `workflow_executions`

### Environment Variables

```
VITE_SUPABASE_URL=<project-url>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Key Patterns

### Adding a New Feature Module

1. Add module definition to `src/lib/registry.ts`
2. Create feature directory under `src/features/<module>/`
3. Add lazy-loaded routes in `App.tsx` wrapped with `<FeatureGuard>`
4. Create corresponding database schema in `db/`

### Component Styling

Uses Tailwind CSS v4 with CSS variables for theming. Component variants via `class-variance-authority`. Utility function `cn()` from `src/lib/utils.ts` for className merging.

### Protected Routes

```tsx
<FeatureGuard moduleId="crm" redirectTo="/">
  <RoleGuard allowedRoles={['owner', 'admin']}>
    <Component />
  </RoleGuard>
</FeatureGuard>
```

## Current Status

The codebase is a Vite-based React SPA. The vision document (`flowstack-build-prompt.md`) describes a more complete Next.js full-stack architecture as the target state - current implementation covers the foundational UI and module structure.

**Implemented**: Dashboard, CRM (contacts/companies), Workflows (visual builder scaffold), Marketing (campaigns/templates), Site Builder (block editor with drag-drop)

**Not yet configured**: Testing framework, CI/CD pipeline, database migrations tooling


<claude-mem-context>
# Memory Context

# [FlowStack] recent context, 2026-05-02 2:12pm EDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (17,295t read) | 2,497,888t work | 99% savings

### Apr 30, 2026
98 2:57p 🔵 FlowStack already has project scanning infrastructure
99 " 🔵 Agent runtime supports multiple backends including DeerFlow pattern
108 2:58p 🟣 PRD created for FlowStack Business Flow Intelligence
109 " 🟣 FlowStack Verified Provider Network added to PRD
110 " 🔵 Paperclip and Agent Town identified as FlowStack integration references
111 3:10p 🔵 Gary's Pattern Recognition History
112 " 🟣 FlowStack User Empowerment Layer
113 " 🔵 Webflow Cost Analysis Finding
114 " ⚖️ FlowStack vs. Existing Tools Positioning
115 3:21p 🔵 Wix + AI: Rapid HTML page generation capability discovered
116 " 🟣 Flowstack optimization flow comparison system
117 " ⚖️ Simple wins strategy: target percentage savings over feature breadth
125 " 🔵 Storytellers Project Has Video Editor Component
126 " ⚖️ Multi-Provider AI Strategy Over Single Provider Dependency
127 " ⚖️ E Drive Metaphor - Abstraction Over Implementation
118 4:23p 🔵 DeerFlow and Continuity Dashboard validate FlowStack's parent-layer role
119 " 🔵 Cardoor app validates owned-editor ownership wedge pattern
120 " 🟣 PRD expanded with 6 new principles (9–18) and 10 new features (F015–F024)
121 " 🟣 F014 Parent Workspace Discovery: approved parent scope scanning with explicit folder selection
128 4:31p 🔵 User's workflow toolchain research priorities identified
129 " 🔵 Beads is an issue abstraction layer outside GitHub
130 " 🔵 User frustrated with AI coding assistants creating unnecessary restrictions
131 " ⚖️ User values tools that reduce noise over features
132 " 🔵 User inventorying all agent/workflow hidden folders across their filesystem
S2 Research workflow tools (GSD, Beads, CloudFlow, Archon) and PRD enhancement for FlowStack portfolio capability and scanner transparency (Apr 30, 4:45 PM)
133 4:47p ⚖️ AI-powered workflow analysis validates FlowStack's core thesis
134 4:53p 🟣 Flowstack self-healing flow intelligence design
135 " 🔵 Archon competitor analysis: architecture and failure patterns
137 " 🔵 FlowStack design differentiator: cross-tool flow intelligence
144 " 🔵 New user persona: AI beginners without flow understanding
145 4:54p ⚖️ Landing page copy and audit assessment structure approved for FlowStack
136 " 🟣 Flow Repair Memory specification added to PRD
146 5:06p 🟣 FlowStack audit-first intake funnel fully wired with local persistence and intent-aware auth
138 5:07p 🟣 Flow Repair Memory data model and MVP scope additions
179 7:58p ✅ Softened audit site copy: removed blame language
180 " 🔴 Photo links on terms page are non-functional
149 " 🟣 FlowStack audit-first intake funnel fully implemented across 14 files with clean build and lint
181 10:08p 🔵 Flowstack: Business Tech Stack Audit Platform Concept
189 " 🟣 FlowAuditExperience component approved by user
182 10:10p ✅ Audit Page Reframed to "Give Us What You Have" with Quote Output
183 " 🟣 Tether Added as Provider Path in Audit Tool Options
184 " 🟣 Marketing/Web/CRM Siloed Tool Detection Added to Flow Brief Preview
185 " 🟣 Quote-Readiness Added to Flow Scan Tier and Implementation Sprint
186 " ✅ Audit Build Verified Clean
### May 2, 2026
287 1:54a 🔵 Scanner code quality review initiated
291 " 🔵 Structure-first scanner implementation duplicated across browser and Edge runtimes
295 " 🔵 Scanner code quality review completed with cross-platform compatibility findings
296 " ✅ Created FlowStack repo cleanup inventory document
298 2:03a 🔵 FlowStack Scanner Re-review Initiated
299 2:04a 🔴 FlowStack Scanner Re-review: Mixed Fix Results
436 2:10p 🔴 FlowStack MVP contract compliance verified

Access 2498k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>