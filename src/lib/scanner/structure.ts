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

  const nestedDotFolders = filePaths.flatMap(path => {
    const parts = path.split('/');
    return parts
      .map((part, index) => ({ part, index }))
      .filter(({ part }) => part.startsWith('.') && part.length > 1)
      .map(({ index }) => parts.slice(0, index + 1).join('/'));
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
