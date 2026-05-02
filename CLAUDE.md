# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
