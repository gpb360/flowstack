# FlowStack Structure-First Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move FlowStack's audit/scanner layer from framework-first detection to structure-first flow intelligence, where dot folders, manifests, context files, and project roots are first-class signals and languages/frameworks are secondary implementation details.

**Architecture:** Keep the sellable MVP form-only, but prepare the future permissioned snapshot layer as a pure, browser-safe scanner contract. Add a `StructureSnapshot` model beside the existing scanner types, preserve backwards compatibility, and update the Supabase scanner so dot folders are visible instead of filtered away.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Supabase Edge Functions, browser-safe TypeScript scanner helpers, PowerShell validation on Windows.

---

## Scope Boundaries

This plan must not add a public CLI, file upload flow, SaaS connector, Stripe checkout, automatic deep audit report, or automatic file-content reading in the public audit MVP.

The future scanner may read a file list and approved lightweight marker files only. Any content-read behavior must be explicitly named as `deep` mode and remain separate from the default `snapshot` mode.

Do not delete stale files in this plan. Produce a cleanup inventory first so Gary can approve what leaves the repo.

## File Structure

- Modify `src/lib/scanner/types.ts`
  - Owns scanner result contracts.
  - Adds structure-first types while preserving the existing `ScanResult` shape.

- Create `src/lib/scanner/structure.ts`
  - Pure, browser-safe helpers for turning file paths/root entries into a `StructureSnapshot`.
  - No filesystem I/O.
  - No React imports.

- Modify `src/lib/scanner/patterns.ts`
  - Keeps existing tool/language/service detection.
  - Clarifies language detection as secondary implementation signals.
  - Fixes package detection so `package.json` means JavaScript/Node ecosystem, not automatically TypeScript.

- Modify `src/lib/scanner/index.ts`
  - Exports the new structure helpers and types.

- Modify `supabase/functions/scan-project/index.ts`
  - Returns dot folders and `structureSnapshot`.
  - Stops filtering dot folders out of the root summary.
  - Adds `scanMode`, defaulting to `snapshot`.
  - Keeps existing fields for compatibility.

- Create `scripts/scanner-structure-smoke.mjs`
  - Minimal Node smoke script with assertions for dot-folder-first behavior.
  - Used because the repo does not currently have a dedicated test framework.

- Modify `package.json`
  - Adds `scanner:smoke`.

- Modify `docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md`
  - Adds a structure-first scanner section.

- Modify `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`
  - Clarifies public audit is form-only and future snapshot is permissioned.

- Create `docs/FLOWSTACK_REPO_CLEANUP_INVENTORY.md`
  - Lists stale/legacy artifacts with recommended action.
  - No deletions in this plan.

---

## Parallel Agent Ownership

Use this split if multiple agents run overnight:

- **Worker A: Scanner Contract**
  - Owns `src/lib/scanner/types.ts`, `src/lib/scanner/structure.ts`, `src/lib/scanner/index.ts`, and `scripts/scanner-structure-smoke.mjs`.

- **Worker B: Supabase Snapshot Function**
  - Owns `supabase/functions/scan-project/index.ts`.
  - Must not modify frontend files except if Worker A requests type alignment.

- **Worker C: Product Docs**
  - Owns `docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md` and `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`.

- **Worker D: Cleanup Inventory**
  - Owns `docs/FLOWSTACK_REPO_CLEANUP_INVENTORY.md`.
  - Must not delete files.

Workers are not alone in the repo. Do not revert or overwrite unrelated edits. If a file has user changes, preserve them and make the smallest compatible patch.

---

### Task 1: Create The Structure-First Scanner Contract

**Files:**
- Modify: `src/lib/scanner/types.ts`

- [ ] **Step 1: Replace `src/lib/scanner/types.ts` with the expanded contract**

Use this complete file content:

```ts
/**
 * Scanner Types
 *
 * Pure TypeScript types. No I/O.
 *
 * FlowStack treats workspace structure as the primary audit signal.
 * Languages, frameworks, and services are secondary implementation details.
 */

export type AssistanceLevel = 'full' | 'light' | 'minimal';

export type SnapshotMode = 'snapshot' | 'deep';

export type SignalConfidence = 'high' | 'medium' | 'low';

export type StructureEntryKind = 'folder' | 'file' | 'unknown';

export type StructureSignalKind =
  | 'dot_folder'
  | 'manifest'
  | 'context'
  | 'deployment'
  | 'package_manager'
  | 'documentation'
  | 'implementation';

export interface StructureEntry {
  name: string;
  path: string;
  kind: StructureEntryKind;
  isDotEntry: boolean;
  depth: number;
}

export interface StructureSignal {
  kind: StructureSignalKind;
  path: string;
  label: string;
  confidence: SignalConfidence;
  reason: string;
}

export interface DotFolderSignal extends StructureSignal {
  kind: 'dot_folder';
  toolHint?: string;
}

export interface ManifestSignal extends StructureSignal {
  kind: 'manifest';
  ecosystemHint?: string;
}

export interface StructureSnapshot {
  mode: SnapshotMode;
  rootEntries: StructureEntry[];
  dotFolders: DotFolderSignal[];
  manifests: ManifestSignal[];
  contextFiles: StructureSignal[];
  deploymentSignals: StructureSignal[];
  packageManagerSignals: StructureSignal[];
  documentationSignals: StructureSignal[];
  implementationSignals: StructureSignal[];
  evidenceCompleteness: 'thin' | 'usable' | 'strong';
  summary: string;
  warnings: string[];
}

export interface DetectedTool {
  type: string;
  path: string;
  label: string;
  version?: string;
  configFiles: string[];
  metadata: Record<string, unknown>;
}

export interface ScanResult {
  projectPath: string;
  rootEntries: string[];
  hiddenRootEntries: string[];
  structureSnapshot: StructureSnapshot;
  detectedTools: DetectedTool[];
  languages: string[];
  externalServices: string[];
  existingDocs: string[];
  warnings: string[];
  suggestedAssistanceLevel: AssistanceLevel;
  unknownTools: string[];
}
```

- [ ] **Step 2: Run TypeScript to expose downstream type errors**

Run:

```powershell
npm run web:build
```

Expected: build may fail because `ScanResult` now requires `hiddenRootEntries` and `structureSnapshot`. Capture the exact TypeScript errors and continue to Task 2.

- [ ] **Step 3: Commit the type contract once downstream errors are understood**

Run:

```powershell
git add src/lib/scanner/types.ts
git commit -m "feat(scanner): add structure-first scan contract"
```

Expected: commit succeeds. If the worktree has unrelated staged files, unstage them first with `git restore --staged <path>` for those unrelated paths only.

---

### Task 2: Add Pure Structure Snapshot Helpers

**Files:**
- Create: `src/lib/scanner/structure.ts`
- Modify: `src/lib/scanner/index.ts`

- [ ] **Step 1: Create `src/lib/scanner/structure.ts`**

Use this complete file content:

```ts
import type {
  DotFolderSignal,
  ManifestSignal,
  SnapshotMode,
  StructureEntry,
  StructureEntryKind,
  StructureSignal,
  StructureSnapshot,
} from './types';

const DOT_FOLDER_HINTS: Record<string, string> = {
  '.archon': 'Archon workspace or agent harness',
  '.claude': 'Claude Code workspace context',
  '.codex': 'Codex/OpenAI local context',
  '.cursor': 'Cursor editor context',
  '.git': 'Git repository',
  '.github': 'GitHub workflows and repository automation',
  '.goose': 'Goose agent context',
  '.gsd': 'GSD local project system',
  '.netlify': 'Netlify deployment state',
  '.opencode': 'OpenCode agent context',
  '.orchestrator': 'Local orchestration context',
  '.playwright-mcp': 'Playwright MCP/browser automation context',
  '.ralph-loop': 'Ralph Loop validation output',
  '.supabase': 'Supabase local project state',
  '.vercel': 'Vercel deployment state',
};

const MANIFEST_HINTS: Record<string, string> = {
  'AGENTS.md': 'Agent instructions',
  'CLAUDE.md': 'Claude Code instructions',
  'GEMINI.md': 'Gemini instructions',
  'README.md': 'Project overview',
  'components.json': 'Component system manifest',
  'deno.json': 'Deno project manifest',
  'docker-compose.yml': 'Container/service manifest',
  'eslint.config.js': 'Linting configuration',
  'go.mod': 'Go module manifest',
  'package.json': 'Node/package manifest',
  'pnpm-workspace.yaml': 'PNPM workspace manifest',
  'pyproject.toml': 'Python project manifest',
  'requirements.txt': 'Python dependency manifest',
  'tsconfig.json': 'TypeScript compiler manifest',
  'turbo.json': 'Turborepo manifest',
  'vite.config.ts': 'Vite web app manifest',
};

const CONTEXT_FILES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  'README.md',
  'CONTRIBUTING.md',
  'ARCHITECTURE.md',
  'DECISIONS.md',
]);

const DEPLOYMENT_FILES = new Set([
  'netlify.toml',
  'vercel.json',
  'fly.toml',
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.prod.yml',
]);

const PACKAGE_MANAGER_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb',
]);

export function normalizeScanPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

export function getPathDepth(path: string): number {
  const normalized = normalizeScanPath(path);
  if (!normalized) return 0;
  return normalized.split('/').length - 1;
}

export function createStructureEntry(path: string, kind: StructureEntryKind = 'unknown'): StructureEntry {
  const normalized = normalizeScanPath(path);
  const parts = normalized.split('/');
  const name = parts[parts.length - 1] ?? normalized;

  return {
    name,
    path: normalized,
    kind,
    isDotEntry: name.startsWith('.'),
    depth: getPathDepth(normalized),
  };
}

export function buildStructureSnapshot(input: {
  rootEntries: string[];
  filePaths: string[];
  mode?: SnapshotMode;
}): StructureSnapshot {
  const mode = input.mode ?? 'snapshot';
  const normalizedRoots = Array.from(new Set(input.rootEntries.map(normalizeScanPath))).filter(Boolean);
  const normalizedFiles = Array.from(new Set(input.filePaths.map(normalizeScanPath))).filter(Boolean);

  const rootEntries = normalizedRoots
    .map(path => createStructureEntry(path, inferRootEntryKind(path, normalizedFiles)))
    .sort((a, b) => a.path.localeCompare(b.path));

  const dotFolders = detectDotFolders(rootEntries, normalizedFiles);
  const manifests = detectManifests(normalizedFiles);
  const contextFiles = detectContextFiles(normalizedFiles);
  const deploymentSignals = detectDeploymentSignals(normalizedFiles, rootEntries);
  const packageManagerSignals = detectPackageManagerSignals(normalizedFiles);
  const documentationSignals = detectDocumentationSignals(normalizedFiles);
  const implementationSignals = detectImplementationSignals(normalizedFiles);
  const evidenceCompleteness = getEvidenceCompleteness({
    dotFolderCount: dotFolders.length,
    manifestCount: manifests.length,
    contextCount: contextFiles.length,
    fileCount: normalizedFiles.length,
  });

  const warnings: string[] = [];
  if (normalizedFiles.length === 0 && normalizedRoots.length > 0) {
    warnings.push('Only root entries were available. FlowStack can give stronger guidance with a shallow file-list snapshot.');
  }
  if (dotFolders.length === 0) {
    warnings.push('No dot-folder signals were visible in the approved structure snapshot.');
  }

  return {
    mode,
    rootEntries,
    dotFolders,
    manifests,
    contextFiles,
    deploymentSignals,
    packageManagerSignals,
    documentationSignals,
    implementationSignals,
    evidenceCompleteness,
    summary: summarizeSnapshot(dotFolders.length, manifests.length, contextFiles.length, evidenceCompleteness),
    warnings,
  };
}

function inferRootEntryKind(path: string, filePaths: string[]): StructureEntryKind {
  const normalized = normalizeScanPath(path);
  if (filePaths.includes(normalized)) return 'file';
  if (filePaths.some(file => file.startsWith(`${normalized}/`))) return 'folder';
  return 'unknown';
}

function detectDotFolders(rootEntries: StructureEntry[], filePaths: string[]): DotFolderSignal[] {
  const rootDotFolders = rootEntries
    .filter(entry => entry.isDotEntry && entry.kind !== 'file')
    .map(entry => entry.path);

  const nestedDotFolders = filePaths
    .flatMap(path => {
      const parts = path.split('/');
      return parts
        .filter(part => part.startsWith('.') && part.length > 1)
        .map(part => {
          const index = parts.indexOf(part);
          return parts.slice(0, index + 1).join('/');
        });
    });

  return Array.from(new Set([...rootDotFolders, ...nestedDotFolders]))
    .sort()
    .map(path => {
      const name = path.split('/').pop() ?? path;
      const toolHint = DOT_FOLDER_HINTS[name];

      return {
        kind: 'dot_folder',
        path,
        label: toolHint ?? `${name} workspace signal`,
        confidence: toolHint ? 'high' : 'medium',
        reason: toolHint
          ? `${name} is a known FlowStack structure signal.`
          : `${name} is a hidden workspace folder that may describe local workflow or tool state.`,
        toolHint,
      };
    });
}

function detectManifests(filePaths: string[]): ManifestSignal[] {
  return filePaths
    .filter(path => MANIFEST_HINTS[path.split('/').pop() ?? path])
    .sort()
    .map(path => {
      const name = path.split('/').pop() ?? path;
      return {
        kind: 'manifest',
        path,
        label: MANIFEST_HINTS[name],
        confidence: 'high',
        reason: `${name} declares project structure, tooling, instructions, or runtime behavior.`,
        ecosystemHint: getManifestEcosystemHint(name),
      };
    });
}

function detectContextFiles(filePaths: string[]): StructureSignal[] {
  return filePaths
    .filter(path => CONTEXT_FILES.has(path.split('/').pop() ?? path))
    .sort()
    .map(path => ({
      kind: 'context',
      path,
      label: `${path.split('/').pop()} context`,
      confidence: 'high',
      reason: 'Context files tell humans and agents how work should happen in this project.',
    }));
}

function detectDeploymentSignals(filePaths: string[], rootEntries: StructureEntry[]): StructureSignal[] {
  const deploymentPaths = filePaths.filter(path => DEPLOYMENT_FILES.has(path.split('/').pop() ?? path));
  const deploymentFolders = rootEntries
    .filter(entry => ['.vercel', '.netlify', '.supabase'].includes(entry.name))
    .map(entry => entry.path);

  return Array.from(new Set([...deploymentPaths, ...deploymentFolders]))
    .sort()
    .map(path => ({
      kind: 'deployment',
      path,
      label: `${path.split('/').pop()} deployment signal`,
      confidence: 'high',
      reason: 'Deployment signals show where this project may already publish, host, or connect runtime infrastructure.',
    }));
}

function detectPackageManagerSignals(filePaths: string[]): StructureSignal[] {
  return filePaths
    .filter(path => PACKAGE_MANAGER_FILES.has(path.split('/').pop() ?? path))
    .sort()
    .map(path => ({
      kind: 'package_manager',
      path,
      label: `${path.split('/').pop()} package manager signal`,
      confidence: 'high',
      reason: 'Lockfiles reveal package manager adoption without requiring source-code inspection.',
    }));
}

function detectDocumentationSignals(filePaths: string[]): StructureSignal[] {
  return filePaths
    .filter(path => {
      const name = path.split('/').pop() ?? path;
      return name.endsWith('.md') || name.endsWith('.mdx');
    })
    .sort()
    .map(path => ({
      kind: 'documentation',
      path,
      label: `${path.split('/').pop()} documentation`,
      confidence: 'medium',
      reason: 'Documentation files show where the project explains decisions, operations, or handoff context.',
    }));
}

function detectImplementationSignals(filePaths: string[]): StructureSignal[] {
  const implementationFiles = filePaths.filter(path => {
    const lower = path.toLowerCase();
    return (
      lower.endsWith('.ts') ||
      lower.endsWith('.tsx') ||
      lower.endsWith('.js') ||
      lower.endsWith('.jsx') ||
      lower.endsWith('.py') ||
      lower.endsWith('.go') ||
      lower.endsWith('.rs') ||
      lower.endsWith('.java') ||
      lower.endsWith('.cs')
    );
  });

  const extensions = Array.from(new Set(implementationFiles.map(path => path.slice(path.lastIndexOf('.'))).filter(Boolean)));

  return extensions.sort().map(ext => ({
    kind: 'implementation',
    path: `*${ext}`,
    label: `${ext} implementation files`,
    confidence: 'low',
    reason: 'Implementation files are useful context, but FlowStack treats them as secondary to structure and flow signals.',
  }));
}

function getManifestEcosystemHint(name: string): string | undefined {
  if (['package.json', 'pnpm-workspace.yaml', 'vite.config.ts', 'components.json'].includes(name)) return 'node';
  if (['pyproject.toml', 'requirements.txt'].includes(name)) return 'python';
  if (name === 'go.mod') return 'go';
  if (name === 'deno.json') return 'deno';
  if (name === 'docker-compose.yml') return 'containers';
  return undefined;
}

function getEvidenceCompleteness(input: {
  dotFolderCount: number;
  manifestCount: number;
  contextCount: number;
  fileCount: number;
}): StructureSnapshot['evidenceCompleteness'] {
  const score =
    input.dotFolderCount * 2 +
    input.manifestCount * 2 +
    input.contextCount +
    Math.min(input.fileCount / 50, 4);

  if (score >= 8) return 'strong';
  if (score >= 4) return 'usable';
  return 'thin';
}

function summarizeSnapshot(
  dotFolderCount: number,
  manifestCount: number,
  contextCount: number,
  evidenceCompleteness: StructureSnapshot['evidenceCompleteness'],
): string {
  return `FlowStack found ${dotFolderCount} dot-folder signal${dotFolderCount === 1 ? '' : 's'}, ${manifestCount} manifest signal${manifestCount === 1 ? '' : 's'}, and ${contextCount} context file${contextCount === 1 ? '' : 's'}. Evidence is ${evidenceCompleteness} and should be treated as directional until reviewed.`;
}
```

- [ ] **Step 2: Export the new structure helpers**

In `src/lib/scanner/index.ts`, replace the export block with:

```ts
export type {
  AssistanceLevel,
  DetectedTool,
  DotFolderSignal,
  ManifestSignal,
  ScanResult,
  SignalConfidence,
  SnapshotMode,
  StructureEntry,
  StructureEntryKind,
  StructureSignal,
  StructureSignalKind,
  StructureSnapshot,
} from './types';

export { DETECTION_PATTERNS } from './patterns';
export {
  detectTools,
  detectLanguages,
  detectServices,
  detectDocs,
  suggestAssistanceLevel,
} from './patterns';
export {
  buildStructureSnapshot,
  createStructureEntry,
  getPathDepth,
  normalizeScanPath,
} from './structure';
export type { DetectionPatternDef, VersionSignal } from './patterns';
```

- [ ] **Step 3: Run TypeScript**

Run:

```powershell
npm run web:build
```

Expected: Any failures should be real type integration issues, not syntax errors in the new helper.

- [ ] **Step 4: Commit**

Run:

```powershell
git add src/lib/scanner/structure.ts src/lib/scanner/index.ts
git commit -m "feat(scanner): derive structure snapshots from file lists"
```

---

### Task 3: Add A Scanner Smoke Test Without Introducing A Test Framework

**Files:**
- Create: `scripts/scanner-structure-smoke.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/scanner-structure-smoke.mjs`**

Use this complete file content:

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const structureSource = readFileSync(new URL('../src/lib/scanner/structure.ts', import.meta.url), 'utf8');

assert.match(structureSource, /buildStructureSnapshot/, 'buildStructureSnapshot must exist');
assert.match(structureSource, /dotFolders/, 'structure snapshot must expose dotFolders');
assert.match(structureSource, /Implementation files are useful context, but FlowStack treats them as secondary/, 'implementation signals must be explicitly secondary');
assert.match(structureSource, /\\.gsd/, 'known dot-folder hints must include .gsd');
assert.match(structureSource, /\\.claude/, 'known dot-folder hints must include .claude');
assert.match(structureSource, /\\.codex/, 'known dot-folder hints must include .codex');

console.log('scanner structure smoke checks passed');
```

- [ ] **Step 2: Add the script to `package.json`**

Add this under `scripts` after `web:validate:build`:

```json
"scanner:smoke": "node scripts/scanner-structure-smoke.mjs",
```

Keep commas valid.

- [ ] **Step 3: Run smoke test**

Run:

```powershell
npm run scanner:smoke
```

Expected:

```text
scanner structure smoke checks passed
```

- [ ] **Step 4: Commit**

Run:

```powershell
git add package.json scripts/scanner-structure-smoke.mjs
git commit -m "test(scanner): add structure snapshot smoke check"
```

---

### Task 4: Make Language Detection Secondary

**Files:**
- Modify: `src/lib/scanner/patterns.ts`

- [ ] **Step 1: Update the language comment**

Find:

```ts
/**
 * Detect programming languages from file list
 */
```

Replace with:

```ts
/**
 * Detect secondary implementation signals from a file list.
 *
 * FlowStack uses these as supporting context only. The primary audit lens is
 * workspace structure: dot folders, manifests, context files, and project roots.
 */
```

- [ ] **Step 2: Fix `package.json` language inference**

In `LANG_FILES`, replace:

```ts
'package.json': 'typescript',
```

with:

```ts
'package.json': 'javascript',
```

- [ ] **Step 3: Add JavaScript extension support**

In `LANG_EXTENSIONS`, add:

```ts
'.js': 'javascript',
'.jsx': 'javascript',
```

Keep the existing `.ts` and `.tsx` entries.

- [ ] **Step 4: Run validation**

Run:

```powershell
npm run web:build
npm run scanner:smoke
```

Expected: both commands pass.

- [ ] **Step 5: Commit**

Run:

```powershell
git add src/lib/scanner/patterns.ts
git commit -m "refactor(scanner): treat languages as secondary signals"
```

---

### Task 5: Update Supabase Scan Function To Preserve Dot Folders

**Files:**
- Modify: `supabase/functions/scan-project/index.ts`

- [ ] **Step 1: Add scan mode to the request body**

Replace:

```ts
const body = await req.json() as { projectPath?: string; maxDepth?: number };
```

with:

```ts
const body = await req.json() as {
  projectPath?: string;
  maxDepth?: number;
  scanMode?: 'snapshot' | 'deep';
};
```

- [ ] **Step 2: Pass scan mode into `scanProject`**

Replace:

```ts
const result = await scanProject(body.projectPath, {
  maxDepth: body.maxDepth ?? 8,
});
```

with:

```ts
const result = await scanProject(body.projectPath, {
  maxDepth: body.maxDepth ?? 8,
  scanMode: body.scanMode ?? 'snapshot',
});
```

- [ ] **Step 3: Extend the local `ScanResult` interface**

Add these local interfaces above `interface ScanResult`:

```ts
type SnapshotMode = 'snapshot' | 'deep';
type StructureEntryKind = 'folder' | 'file' | 'unknown';
type SignalConfidence = 'high' | 'medium' | 'low';

interface StructureEntry {
  name: string;
  path: string;
  kind: StructureEntryKind;
  isDotEntry: boolean;
  depth: number;
}

interface StructureSignal {
  kind:
    | 'dot_folder'
    | 'manifest'
    | 'context'
    | 'deployment'
    | 'package_manager'
    | 'documentation'
    | 'implementation';
  path: string;
  label: string;
  confidence: SignalConfidence;
  reason: string;
  toolHint?: string;
  ecosystemHint?: string;
}

interface StructureSnapshot {
  mode: SnapshotMode;
  rootEntries: StructureEntry[];
  dotFolders: StructureSignal[];
  manifests: StructureSignal[];
  contextFiles: StructureSignal[];
  deploymentSignals: StructureSignal[];
  packageManagerSignals: StructureSignal[];
  documentationSignals: StructureSignal[];
  implementationSignals: StructureSignal[];
  evidenceCompleteness: 'thin' | 'usable' | 'strong';
  summary: string;
  warnings: string[];
}
```

Then add these fields to `interface ScanResult`:

```ts
hiddenRootEntries: string[];
structureSnapshot: StructureSnapshot;
```

- [ ] **Step 4: Extend `scanProject` options**

Replace:

```ts
options: { maxDepth: number },
```

with:

```ts
options: { maxDepth: number; scanMode: SnapshotMode },
```

- [ ] **Step 5: Compute visible and hidden root entries**

After `await walk(projectPath, 0);`, add:

```ts
const visibleRootEntries = rootEntries.filter(e => !e.startsWith('.') && !SKIP_DIRS.has(e));
const hiddenRootEntries = rootEntries.filter(e => e.startsWith('.') && !SKIP_DIRS.has(e));
const structureSnapshot = buildStructureSnapshot({
  rootEntries: rootEntries.filter(e => !SKIP_DIRS.has(e)),
  filePaths: allFiles,
  mode: options.scanMode,
});
```

- [ ] **Step 6: Replace the returned root fields**

Replace:

```ts
rootEntries: rootEntries.filter(e => !e.startsWith('.') && !SKIP_DIRS.has(e)),
detectedTools,
```

with:

```ts
rootEntries: visibleRootEntries,
hiddenRootEntries,
structureSnapshot,
detectedTools,
```

- [ ] **Step 7: Add local structure helper functions**

Append these functions before `async function readIfExists`:

```ts
function buildStructureSnapshot(input: {
  rootEntries: string[];
  filePaths: string[];
  mode: SnapshotMode;
}): StructureSnapshot {
  const rootEntries = Array.from(new Set(input.rootEntries.map(normalizeScanPath)))
    .filter(Boolean)
    .map(path => createStructureEntry(path, inferRootEntryKind(path, input.filePaths)))
    .sort((a, b) => a.path.localeCompare(b.path));

  const normalizedFiles = Array.from(new Set(input.filePaths.map(normalizeScanPath))).filter(Boolean);
  const dotFolders = detectDotFolderSignals(rootEntries, normalizedFiles);
  const manifests = detectManifestSignals(normalizedFiles);
  const contextFiles = detectNamedSignals(normalizedFiles, ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'README.md'], 'context');
  const deploymentSignals = detectNamedSignals(normalizedFiles, ['vercel.json', 'netlify.toml', 'fly.toml', 'docker-compose.yml'], 'deployment');
  const packageManagerSignals = detectNamedSignals(normalizedFiles, ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'], 'package_manager');
  const documentationSignals = normalizedFiles
    .filter(path => path.endsWith('.md') || path.endsWith('.mdx'))
    .map(path => makeSignal('documentation', path, `${basename(path)} documentation`, 'medium', 'Documentation files show project explanation, operations, or handoff context.'));
  const implementationSignals = detectImplementationSignals(normalizedFiles);
  const evidenceCompleteness = getEvidenceCompleteness(dotFolders.length, manifests.length, contextFiles.length, normalizedFiles.length);

  return {
    mode: input.mode,
    rootEntries,
    dotFolders,
    manifests,
    contextFiles,
    deploymentSignals,
    packageManagerSignals,
    documentationSignals,
    implementationSignals,
    evidenceCompleteness,
    summary: `FlowStack found ${dotFolders.length} dot-folder signal${dotFolders.length === 1 ? '' : 's'}, ${manifests.length} manifest signal${manifests.length === 1 ? '' : 's'}, and ${contextFiles.length} context file${contextFiles.length === 1 ? '' : 's'}. Evidence is ${evidenceCompleteness} and should be treated as directional until reviewed.`,
    warnings: dotFolders.length === 0 ? ['No dot-folder signals were visible in the approved structure snapshot.'] : [],
  };
}

function normalizeScanPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '');
}

function basename(path: string): string {
  const parts = normalizeScanPath(path).split('/');
  return parts[parts.length - 1] ?? path;
}

function createStructureEntry(path: string, kind: StructureEntryKind): StructureEntry {
  const normalized = normalizeScanPath(path);
  return {
    name: basename(normalized),
    path: normalized,
    kind,
    isDotEntry: basename(normalized).startsWith('.'),
    depth: normalized ? normalized.split('/').length - 1 : 0,
  };
}

function inferRootEntryKind(path: string, filePaths: string[]): StructureEntryKind {
  const normalized = normalizeScanPath(path);
  const normalizedFiles = filePaths.map(normalizeScanPath);
  if (normalizedFiles.includes(normalized)) return 'file';
  if (normalizedFiles.some(file => file.startsWith(`${normalized}/`))) return 'folder';
  return 'unknown';
}

function detectDotFolderSignals(rootEntries: StructureEntry[], filePaths: string[]): StructureSignal[] {
  const dotPaths = new Set<string>();

  for (const entry of rootEntries) {
    if (entry.isDotEntry && entry.kind !== 'file') dotPaths.add(entry.path);
  }

  for (const path of filePaths) {
    const parts = normalizeScanPath(path).split('/');
    for (let index = 0; index < parts.length; index += 1) {
      const part = parts[index];
      if (part.startsWith('.') && part.length > 1) {
        dotPaths.add(parts.slice(0, index + 1).join('/'));
      }
    }
  }

  return Array.from(dotPaths)
    .sort()
    .map(path => makeSignal('dot_folder', path, `${basename(path)} workspace signal`, 'high', `${basename(path)} is a hidden workspace structure signal.`));
}

function detectManifestSignals(filePaths: string[]): StructureSignal[] {
  const manifestNames = new Set([
    'AGENTS.md',
    'CLAUDE.md',
    'GEMINI.md',
    'README.md',
    'components.json',
    'deno.json',
    'docker-compose.yml',
    'eslint.config.js',
    'go.mod',
    'package.json',
    'pnpm-workspace.yaml',
    'pyproject.toml',
    'requirements.txt',
    'tsconfig.json',
    'turbo.json',
    'vite.config.ts',
  ]);

  return filePaths
    .filter(path => manifestNames.has(basename(path)))
    .sort()
    .map(path => makeSignal('manifest', path, `${basename(path)} manifest`, 'high', `${basename(path)} declares project structure, tooling, instructions, or runtime behavior.`));
}

function detectNamedSignals(filePaths: string[], names: string[], kind: StructureSignal['kind']): StructureSignal[] {
  const nameSet = new Set(names);
  return filePaths
    .filter(path => nameSet.has(basename(path)))
    .sort()
    .map(path => makeSignal(kind, path, `${basename(path)} ${kind.replace('_', ' ')} signal`, 'high', `${basename(path)} is a ${kind.replace('_', ' ')} signal in the approved file list.`));
}

function detectImplementationSignals(filePaths: string[]): StructureSignal[] {
  const extensions = new Set<string>();
  for (const path of filePaths) {
    const lower = path.toLowerCase();
    const dotIndex = lower.lastIndexOf('.');
    if (dotIndex < 0) continue;
    const ext = lower.slice(dotIndex);
    if (['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.cs'].includes(ext)) {
      extensions.add(ext);
    }
  }

  return Array.from(extensions)
    .sort()
    .map(ext => makeSignal('implementation', `*${ext}`, `${ext} implementation files`, 'low', 'Implementation files are useful context, but FlowStack treats them as secondary to structure and flow signals.'));
}

function makeSignal(
  kind: StructureSignal['kind'],
  path: string,
  label: string,
  confidence: SignalConfidence,
  reason: string,
): StructureSignal {
  return { kind, path, label, confidence, reason };
}

function getEvidenceCompleteness(
  dotFolderCount: number,
  manifestCount: number,
  contextCount: number,
  fileCount: number,
): StructureSnapshot['evidenceCompleteness'] {
  const score = dotFolderCount * 2 + manifestCount * 2 + contextCount + Math.min(fileCount / 50, 4);
  if (score >= 8) return 'strong';
  if (score >= 4) return 'usable';
  return 'thin';
}
```

- [ ] **Step 8: Run TypeScript syntax validation for the function**

Run:

```powershell
npx tsc --noEmit --allowImportingTsExtensions false --skipLibCheck supabase/functions/scan-project/index.ts
```

Expected: TypeScript syntax passes or only reports environment/runtime type issues tied to Deno/Node imports. If it reports syntax errors, fix them.

- [ ] **Step 9: Commit**

Run:

```powershell
git add supabase/functions/scan-project/index.ts
git commit -m "feat(scanner): expose dot folders in project snapshots"
```

---

### Task 6: Document The New Agnostic Audit Layer

**Files:**
- Modify: `docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md`
- Modify: `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`

- [ ] **Step 1: Add this PRD section**

Append this section near the scanner/audit capability section in `docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md`:

```md
## Structure-First Audit Layer

FlowStack's agnostic layer is structure-first, not framework-first.

The first technical signal is an approved view of the customer's flow structure: project roots, dot folders, manifests, context files, deployment markers, package manager markers, and documentation markers. Frameworks and languages are useful, but they are secondary implementation signals.

This matters because a business can change from React to Next.js, from Claude to Codex, from GoHighLevel to HubSpot, or from Vercel to Netlify. The flow problem remains the same: which branches exist, which branches communicate, which branches are stale, which branches are duplicated, and which branches are not adopted.

MVP rule:
- Public audit intake remains form-only.
- Optional structure snapshots are post-MVP and must be permissioned.
- Default snapshot mode reads file lists and marker names, not source contents.
- Deep mode may inspect approved lightweight marker files only after explicit permission.
- FlowStack must describe snapshot findings as directional until human review.
```

- [ ] **Step 2: Add this fulfillment playbook section**

Append this section near the intake/review guidance in `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`:

```md
## Preview vs. Structure Snapshot

The launch audit preview is based only on submitted form answers. It should never imply that FlowStack inspected code, SaaS accounts, folders, or local files.

Future structure snapshots are optional and permissioned. The customer approves the folder or workspace boundary first. The default snapshot reads structure signals: file paths, dot folders, manifests, context files, deployment markers, and documentation markers. It does not read source code by default.

Reviewer language:
- Say "approved workspace structure" instead of "dot folders" in customer-facing reports.
- Say "structure signals" instead of "hidden sauce."
- Say "directional estimate" instead of "guaranteed savings."
- Say "not flowing" or "disconnected" instead of "broken."
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md
git commit -m "docs(audit): define structure-first FlowStack layer"
```

---

### Task 7: Produce Cleanup Inventory, No Deletions

**Files:**
- Create: `docs/FLOWSTACK_REPO_CLEANUP_INVENTORY.md`

- [ ] **Step 1: Create the inventory document**

Use this complete file content:

```md
# FlowStack Repo Cleanup Inventory

Created: 2026-05-02

Purpose: identify stale or legacy artifacts before removal. This document is an approval checklist, not a deletion script.

## Cleanup Rules

- Do not delete files without explicit approval.
- Do not remove user work in progress.
- Do not remove generated folders that are required to run the local app.
- Prefer moving useful historical notes into `docs/archive/` before deletion.
- Keep product docs that describe the current audit-first FlowStack direction.

## Likely Generated Runtime Artifacts

| Path | Why It Looks Generated | Recommended Action |
|---|---|---|
| `.ralph-loop/vite-output.txt` | Validation output file | Ignore in git or regenerate only during validation |
| `dist/` | Vite build output | Do not commit; safe to regenerate |
| `node_modules/` | Package install output | Do not commit; keep locally |
| `build_output.txt` | Old captured build output | Archive or delete after approval |

## Likely Legacy Reports

| Path | Current Risk | Recommended Action |
|---|---|---|
| `AUDIT_REPORT.md` | May describe old audit meaning | Review, then archive if stale |
| `DATABASE_COMPLETION_REPORT.md` | Historical implementation report | Move to `docs/archive/` if still useful |
| `REPUTATION_MODULE_IMPLEMENTATION_REPORT.md` | Historical module report | Move to `docs/archive/` if still useful |
| `UNTITLED_UI_INTEGRATION_REPORT.md` | Historical UI integration report | Move to `docs/archive/` if still useful |
| `WORKFLOW_ARCHITECTURE.md` | May still contain useful architecture | Review before moving |
| `WORKFLOW_IMPLEMENTATION_REPORT.md` | Historical implementation report | Move to `docs/archive/` if stale |
| `WORKFLOW_QUICK_REFERENCE.md` | Could still be useful | Review before moving |
| `WORKFLOW_SYSTEM.md` | Could still be useful | Review before moving |
| `WORKFLOWS_EDITOR_REPORT.md` | Historical implementation report | Move to `docs/archive/` if stale |

## Likely Temporary Source Imports

| Path | Current Risk | Recommended Action |
|---|---|---|
| `temp-untitledui-starter/` | Large copied starter may pollute lint/build context | Confirm no imports depend on it, then delete after approval |

## Scanner Cleanup Candidates

| Path | Current Risk | Recommended Action |
|---|---|---|
| `src/lib/scanner/patterns.ts` | Tool/language-first naming leaks old positioning | Keep, but make secondary to structure snapshot |
| `supabase/functions/scan-project/index.ts` | Duplicates scanner pattern logic and hides dot folders from root summary | Refactor, then later dedupe pattern definitions |

## Approval Checklist

- [ ] Confirm which legacy reports remain useful.
- [ ] Confirm whether `temp-untitledui-starter/` is still needed.
- [ ] Confirm whether root-level reports should move to `docs/archive/`.
- [ ] Add `.ralph-loop/vite-output.txt`, `build_output.txt`, `dist/`, and temp folders to `.gitignore` if they are not intentionally tracked.
- [ ] Run `npm run web:build` after any deletion or archive move.
```

- [ ] **Step 2: Commit**

Run:

```powershell
git add docs/FLOWSTACK_REPO_CLEANUP_INVENTORY.md
git commit -m "docs: inventory FlowStack cleanup candidates"
```

---

### Task 8: Final Validation

**Files:**
- Read-only validation across changed files.

- [ ] **Step 1: Run scanner smoke test**

Run:

```powershell
npm run scanner:smoke
```

Expected:

```text
scanner structure smoke checks passed
```

- [ ] **Step 2: Run targeted lint**

Run:

```powershell
npx eslint src/lib/scanner src/features/audit src/pages/AuditIntakePage.tsx src/pages/AuthPage.tsx src/pages/OnboardingWizard.tsx src/components/layout/AppLayout.tsx src/App.tsx
```

Expected: no lint errors in targeted files.

- [ ] **Step 3: Run build**

Run:

```powershell
npm run web:build
```

Expected: TypeScript compile and Vite build pass.

- [ ] **Step 4: Capture known global lint limitation**

Run:

```powershell
npm run lint
```

Expected: may fail because existing unrelated files under `.gsd/worktrees` and `temp-untitledui-starter` already produce broad lint noise. If it fails only there, document that in the handoff. Do not fix unrelated lint in this plan.

- [ ] **Step 5: Final commit**

If validation fixes were needed, run:

```powershell
git add src/lib/scanner supabase/functions/scan-project scripts/scanner-structure-smoke.mjs package.json docs/PRD_FLOWSTACK_BUSINESS_FLOW_INTELLIGENCE.md docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md docs/FLOWSTACK_REPO_CLEANUP_INVENTORY.md
git commit -m "chore(scanner): validate structure-first audit layer"
```

If there are no extra changes after prior commits, skip this commit.

---

## Acceptance Criteria

- Dot folders are first-class scanner output through `StructureSnapshot.dotFolders`.
- `scan-project` returns `hiddenRootEntries` and no longer silently hides all dot folders.
- Language/framework detection remains available but is described and modeled as secondary context.
- `package.json` no longer implies TypeScript by itself.
- A smoke check verifies that the structure-first helper exists and includes known dot-folder signals.
- Docs clearly state that public audit MVP is form-only.
- Docs clearly state that future structure snapshots are optional, permissioned, and directional.
- Cleanup candidates are inventoried without deletion.
- `npm run web:build` passes.
- Targeted lint passes for changed scanner/audit files.

## Handoff Summary Template

Use this summary when the overnight run is complete:

```md
## Structure-First Audit Handoff

Completed:
- Added `StructureSnapshot` scanner contract.
- Added pure structure snapshot helper.
- Preserved dot folders in scan results.
- Made language/framework detection secondary.
- Documented the structure-first audit layer.
- Created cleanup inventory without deleting files.

Validation:
- `npm run scanner:smoke`: PASS/FAIL
- `npx eslint ...targeted files...`: PASS/FAIL
- `npm run web:build`: PASS/FAIL
- `npm run lint`: PASS/FAIL with notes

Important notes:
- Public audit remains form-only.
- Future snapshot is permissioned and file-list-first.
- No stale files were deleted.
```
