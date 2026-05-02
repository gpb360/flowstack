/**
 * scan-project — Supabase Edge Function
 *
 * POST /
 * Body: { "projectPath": "/path/to/project", "maxDepth": 8, "scanMode": "snapshot" }
 * Returns: ScanResult as JSON
 *
 * Runs on Deno (Supabase Edge Functions runtime).
 * Local filesystem scanning is disabled unless explicitly enabled and scoped.
 */

const SKIP_DIRS = new Set([
  'node_modules', '.git', '__pycache__', '.venv', 'venv',
  'dist', 'build', '.next', '.cache', '.turbo', '.svelte-kit',
  'vendor', 'target', 'bin', 'obj', '.pnpm-store', '.yarn',
]);

const SKIP_FILES = new Set([
  '.DS_Store', 'Thumbs.db', '.gitignore', '.gitattributes',
]);

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json() as {
      projectPath?: string;
      maxDepth?: number;
      scanMode?: 'snapshot' | 'deep';
    };

    if (!body.projectPath || typeof body.projectPath !== 'string') {
      return Response.json(
        { error: 'projectPath (string) is required' },
        { status: 400 }
      );
    }

    const approvedProjectPath = await resolveApprovedProjectPath(body.projectPath);
    const result = await scanProject(approvedProjectPath, {
      maxDepth: body.maxDepth ?? 8,
      scanMode: body.scanMode ?? 'snapshot',
    });

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = err instanceof HttpError ? err.status : 500;
    console.error('[scan-project] Error:', message);
    return Response.json({ error: message }, { status });
  }
});

// ─── Scanner ─────────────────────────────────────────────────────────────────

interface DetectedTool {
  type: string;
  path: string;
  label: string;
  version?: string;
  configFiles: string[];
  metadata: Record<string, unknown>;
}

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

interface ScanResult {
  projectPath: string;
  rootEntries: string[];
  hiddenRootEntries: string[];
  structureSnapshot: StructureSnapshot;
  detectedTools: DetectedTool[];
  languages: string[];
  externalServices: string[];
  existingDocs: string[];
  warnings: string[];
  suggestedAssistanceLevel: 'full' | 'light' | 'minimal';
  unknownTools: string[];
}

async function resolveApprovedProjectPath(projectPath: string): Promise<string> {
  if (Deno.env.get('FLOWSTACK_ENABLE_LOCAL_SCAN') !== 'true') {
    throw new HttpError(
      403,
      'Local structure scanning is disabled. Enable FLOWSTACK_ENABLE_LOCAL_SCAN only for approved local/self-hosted scan environments.',
    );
  }

  const allowedRoots = await getAllowedScanRoots();
  if (allowedRoots.length === 0) {
    throw new HttpError(
      403,
      'Local structure scanning requires FLOWSTACK_SCAN_ROOTS to define approved workspace boundaries.',
    );
  }

  let realProjectPath: string;
  try {
    realProjectPath = await Deno.realPath(projectPath);
  } catch {
    throw new HttpError(400, 'projectPath could not be resolved inside the local scan environment.');
  }

  const normalizedProjectPath = normalizeFullPath(realProjectPath);
  const isAllowed = allowedRoots.some(root =>
    normalizedProjectPath === root || normalizedProjectPath.startsWith(`${root}/`)
  );

  if (!isAllowed) {
    throw new HttpError(403, 'projectPath is outside the approved FlowStack scan roots.');
  }

  return normalizedProjectPath;
}

async function getAllowedScanRoots(): Promise<string[]> {
  const rawRoots = Deno.env.get('FLOWSTACK_SCAN_ROOTS') ?? '';
  const roots = rawRoots
    .split(/[;,\n]/)
    .map(root => root.trim())
    .filter(Boolean);

  const approvedRoots: string[] = [];
  for (const root of roots) {
    try {
      approvedRoots.push(normalizeFullPath(await Deno.realPath(root)));
    } catch {
      // Ignore invalid configured roots so one stale path does not expose a wider scan boundary.
    }
  }

  return Array.from(new Set(approvedRoots)).sort();
}

async function scanProject(
  projectPath: string,
  options: { maxDepth: number; scanMode: SnapshotMode },
): Promise<ScanResult> {
  const { maxDepth } = options;
  const allFiles: string[] = [];
  const warnings: string[] = [];

  // ─── Collect files ──────────────────────────────────────────────────────

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    let entries: string[];
    try {
      entries = await readDirNames(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry) || SKIP_FILES.has(entry)) continue;

      const fullPath = joinPath(dir, entry);
      try {
        const s = await Deno.stat(fullPath);
        if (s.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else {
          const relPath = getRelativeScanPath(projectPath, fullPath);
          allFiles.push(relPath);
        }
      } catch {
        // skip
      }
    }
  }

  let rootEntries: string[] = [];
  try {
    rootEntries = await readDirNames(projectPath);
  } catch {
    rootEntries = [];
  }

  await walk(projectPath, 0);

  const visibleRootEntries = rootEntries.filter(e => !e.startsWith('.') && !SKIP_DIRS.has(e));
  const hiddenRootEntries = rootEntries.filter(e => e.startsWith('.') && !SKIP_DIRS.has(e));
  const structureSnapshot = buildStructureSnapshot({
    rootEntries: rootEntries.filter(e => !SKIP_DIRS.has(e)),
    filePaths: allFiles,
    mode: options.scanMode,
  });

  // ─── Read key files ──────────────────────────────────────────────────────

  const KEY_FILES = [
    'package.json',
    'pyproject.toml',
    'requirements.txt',
    'docker-compose.yml',
    'docker-compose.prod.yml',
    '.claude/settings.json',
    '.gsd/VERSION',
  ];

  const fileContents = new Map<string, string>();
  for (const file of KEY_FILES) {
    const content = await readIfExists(projectPath, file);
    if (content !== null) fileContents.set(file, content);
  }

  // ─── Detect ──────────────────────────────────────────────────────────────

  const detectedTools = detectTools(allFiles, fileContents);
  const languages = detectLanguages(allFiles);
  const externalServices = detectServices(allFiles, fileContents);
  const existingDocs = detectDocs(allFiles);

  // ─── Warnings ──────────────────────────────────────────────────────────

  if (
    detectedTools.some(t => t.type === 'archon') &&
    !allFiles.some(f => f.includes('.archon/workflows'))
  ) {
    warnings.push('Archon detected but .archon/workflows/ not found. Is it initialized?');
  }

  if (detectedTools.some(t => t.type === 'deerflow')) {
    const hasServer = allFiles.some(
      f => f.includes('server.py') || f.includes('main.py') || f.includes('run.py')
    );
    if (!hasServer) {
      warnings.push('DeerFlow detected but no server entry point (server.py/main.py) found.');
    }
  }

  const suggestedAssistanceLevel = suggestAssistanceLevel(detectedTools);

  return {
    projectPath: getDisplayProjectPath(projectPath),
    rootEntries: visibleRootEntries,
    hiddenRootEntries,
    structureSnapshot,
    detectedTools,
    languages,
    externalServices,
    existingDocs,
    warnings,
    suggestedAssistanceLevel,
    unknownTools: [],
  };
}

// ─── Detection Patterns ────────────────────────────────────────────────────────

const PATTERNS: Array<{
  type: string;
  label: string;
  signatures: string[];
  primarySignals: string[];
  configSignals: string[];
  versionSignals: Array<{ file: string; fieldPath?: string; contains?: string }>;
  impliesLanguage?: string;
}> = [
  {
    type: 'archon',
    label: 'Archon Harness',
    signatures: ['.archon', '.archon/workflows', '.archon/commands'],
    primarySignals: ['.archon/workflows', '.archon/commands'],
    configSignals: ['.archon/package.json'],
    versionSignals: [
      { file: 'package.json', fieldPath: 'dependencies."@archon/workflows"' },
      { file: 'package.json', fieldPath: 'version' },
    ],
    impliesLanguage: 'typescript',
  },
  {
    type: 'deerflow',
    label: 'DeerFlow',
    signatures: ['deer-flow', 'agent-harness', 'deerflow'],
    primarySignals: ['deer-flow/server.py', 'deer-flow/main.py', 'agent-harness'],
    configSignals: ['deer-flow/config.yaml'],
    versionSignals: [
      { file: 'requirements.txt', contains: 'deer-flow' },
      { file: 'pyproject.toml', contains: 'deerflow' },
    ],
    impliesLanguage: 'python',
  },
  {
    type: 'gsd',
    label: 'GSD Framework',
    signatures: ['.gsd'],
    primarySignals: ['.gsd/PROJECT.md', '.gsd/DECISIONS.md', '.gsd/roadmap'],
    configSignals: ['.gsd/PLAN.md', '.gsd/CONTEXT.md'],
    versionSignals: [{ file: '.gsd/VERSION' }],
  },
  {
    type: 'claude-code',
    label: 'Claude Code CLI',
    signatures: ['.claude'],
    primarySignals: ['.claude/settings.json', '.claude/projects'],
    configSignals: ['CLAUDE.md'],
    versionSignals: [{ file: '.claude/settings.json', fieldPath: 'version' }],
  },
  {
    type: 'opencode',
    label: 'OpenCode',
    signatures: ['.opencode', '.opencode/config'],
    primarySignals: ['.opencode/config.yaml', '.opencode/agents'],
    configSignals: [],
    versionSignals: [],
  },
  {
    type: 'goose',
    label: 'Goose',
    signatures: ['.goose'],
    primarySignals: ['.goose/config.toml'],
    configSignals: [],
    versionSignals: [],
  },
  {
    type: 'aider',
    label: 'Aider',
    signatures: ['.aider', '.aider.conf.yml'],
    primarySignals: ['.aider.conf.yml'],
    configSignals: ['.aider.history'],
    versionSignals: [],
    impliesLanguage: 'python',
  },
  {
    type: 'payload',
    label: 'Payload CMS',
    signatures: ['payload.config.ts', 'src/cartridges'],
    primarySignals: ['payload.config.ts'],
    configSignals: ['payload-types.ts'],
    versionSignals: [
      { file: 'package.json', fieldPath: 'dependencies.payload' },
      { file: 'package.json', fieldPath: 'dependencies."@payloadcms/next"' },
    ],
    impliesLanguage: 'typescript',
  },
  {
    type: 'n8n',
    label: 'n8n',
    signatures: ['n8n'],
    primarySignals: ['n8n/workflows.json', 'n8n/n8n.config.ts'],
    configSignals: [],
    versionSignals: [],
  },
  {
    type: 'windmill',
    label: 'Windmill',
    signatures: ['windmill', 'wm.yml'],
    primarySignals: ['wm.yml', 'windmill/scripts'],
    configSignals: [],
    versionSignals: [],
  },
  {
    type: 'supabase',
    label: 'Supabase',
    signatures: ['supabase', '.supabase'],
    primarySignals: ['supabase/config.toml', '.supabase/config.toml'],
    configSignals: ['supabase/migrations'],
    versionSignals: [],
  },
  {
    type: 'vercel',
    label: 'Vercel',
    signatures: ['vercel.json', '.vercel'],
    primarySignals: ['vercel.json'],
    configSignals: ['.vercel/output'],
    versionSignals: [],
  },
  {
    type: 'netlify',
    label: 'Netlify',
    signatures: ['netlify.toml'],
    primarySignals: ['netlify.toml'],
    configSignals: ['.netlify'],
    versionSignals: [],
  },
  {
    type: 'fly',
    label: 'Fly.io',
    signatures: ['fly.toml', '.fly'],
    primarySignals: ['fly.toml'],
    configSignals: [],
    versionSignals: [],
  },
  {
    type: 'langchain',
    label: 'LangChain',
    signatures: [],
    primarySignals: [],
    configSignals: [],
    versionSignals: [
      { file: 'requirements.txt', contains: 'langchain' },
      { file: 'pyproject.toml', contains: 'langchain' },
    ],
    impliesLanguage: 'python',
  },
  {
    type: 'llamaindex',
    label: 'LlamaIndex',
    signatures: [],
    primarySignals: [],
    configSignals: [],
    versionSignals: [
      { file: 'requirements.txt', contains: 'llamaindex' },
      { file: 'pyproject.toml', contains: 'llamaindex' },
    ],
    impliesLanguage: 'python',
  },
  {
    type: 'anthropic-sdk',
    label: 'Anthropic SDK',
    signatures: [],
    primarySignals: [],
    configSignals: [],
    versionSignals: [
      { file: 'package.json', contains: '@anthropic-ai' },
      { file: 'requirements.txt', contains: 'anthropic' },
    ],
  },
  {
    type: 'openai-sdk',
    label: 'OpenAI SDK',
    signatures: [],
    primarySignals: [],
    configSignals: [],
    versionSignals: [
      { file: 'package.json', contains: '"openai"' },
      { file: 'requirements.txt', contains: 'openai' },
    ],
  },
];

function detectTools(
  filePaths: string[],
  fileContents: Map<string, string>,
): DetectedTool[] {
  const results: DetectedTool[] = [];

  for (const pattern of PATTERNS) {
    const match = matchPattern(pattern, filePaths, fileContents);
    if (match) results.push(match);
  }

  return results;
}

function matchPattern(
  pattern: (typeof PATTERNS)[number],
  filePaths: string[],
  fileContents: Map<string, string>,
): DetectedTool | null {
  const matched = pattern.signatures.filter(
    sig => filePaths.some(f => f === sig || f.startsWith(sig + '/'))
  );

  let matchedPrimarySignal = false;
  if (matched.length === 0 && pattern.primarySignals.length > 0) {
    matchedPrimarySignal = pattern.primarySignals.some(sig =>
      filePaths.some(f => f === sig || f.startsWith(sig + '/'))
    );
    if (!matchedPrimarySignal) return null;
  }

  let version: string | undefined;
  let matchedVersionSignal = false;

  for (const signal of pattern.versionSignals) {
    const content = fileContents.get(signal.file);
    if (!content) continue;

    if (signal.contains) {
      if (content.toLowerCase().includes(signal.contains.toLowerCase())) {
        matchedVersionSignal = true;
        version = extractVersion(content, signal.contains);
        break;
      }
    }

    if (signal.fieldPath && signal.file === 'package.json') {
      try {
        const pkg = JSON.parse(content) as Record<string, unknown>;
        const val = getNestedField(pkg, signal.fieldPath);
        if (typeof val === 'string') {
          matchedVersionSignal = true;
          version = val.replace(/[\^~>=<]/g, '');
          break;
        }
      } catch {
        // ignore
      }
    }
  }

  const configFiles = pattern.configSignals.filter(sig =>
    filePaths.some(f => f === sig || f.startsWith(sig + '/'))
  );

  const hasPatternEvidence =
    matched.length > 0 ||
    matchedPrimarySignal ||
    matchedVersionSignal ||
    configFiles.length > 0;

  if (!hasPatternEvidence) return null;

  const primaryPath = matched[0] ?? pattern.signatures[0] ?? '';

  return {
    type: pattern.type,
    path: primaryPath,
    label: pattern.label,
    version,
    configFiles,
    metadata: { matchedSignatures: matched, impliesLanguage: pattern.impliesLanguage },
  };
}

function getNestedField(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((curr, key) => {
    if (typeof curr !== 'object' || curr === null) return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
}

function extractVersion(content: string, keyword: string): string | undefined {
  for (const line of content.split('\n')) {
    if (line.toLowerCase().includes(keyword.toLowerCase())) {
      const match = line.match(/[\^~>=<]*([\d.]+)/);
      if (match) return match[1];
    }
  }
  return undefined;
}

const LANG_EXT: Record<string, string> = {
  '.js': 'javascript', '.jsx': 'javascript',
  '.py': 'python', '.ts': 'typescript', '.tsx': 'typescript',
  '.rs': 'rust', '.go': 'go', '.java': 'java', '.cs': 'csharp',
};
const LANG_FILES: Record<string, string> = {
  pyproject: 'python', requirements: 'python', 'package.json': 'javascript',
  'Cargo.toml': 'rust', 'go.mod': 'go',
};

function detectLanguages(filePaths: string[]): string[] {
  const languages = new Set<string>();

  for (const file of filePaths) {
    const lastDot = file.lastIndexOf('.');
    if (lastDot >= 0) {
      const lang = LANG_EXT[file.slice(lastDot)];
      if (lang) languages.add(lang);
    }
  }

  const rootFiles = new Set(filePaths.filter(f => !f.includes('/')));
  for (const file of rootFiles) {
    const lang = LANG_FILES[file];
    if (lang) languages.add(lang);
  }

  return Array.from(languages).sort();
}

const SERVICE_MAP: Record<string, string> = {
  postgres: 'postgresql', postgresql: 'postgresql', redis: 'redis',
  mongo: 'mongodb', mongodb: 'mongodb', mysql: 'mysql',
  elasticsearch: 'elasticsearch', rabbitmq: 'rabbitmq',
};

function detectServices(filePaths: string[], fileContents: Map<string, string>): string[] {
  const services = new Set<string>();

  const docker =
    fileContents.get('docker-compose.yml') ??
    fileContents.get('docker-compose.prod.yml') ??
    null;

  if (docker) {
    const lower = docker.toLowerCase();
    for (const [keyword, service] of Object.entries(SERVICE_MAP)) {
      if (lower.includes(keyword)) services.add(service);
    }
  }

  for (const file of filePaths) {
    const lower = file.toLowerCase();
    if (lower.includes('postgres')) services.add('postgresql');
    if (lower.includes('redis')) services.add('redis');
    if (lower.includes('mongo')) services.add('mongodb');
  }

  return Array.from(services).sort();
}

const DOC_SIGS = [
  'README.md', 'README', 'AGENTS.md', 'AGENT.md', 'CONTRIBUTING.md',
  'ARCHITECTURE.md', 'DECISIONS.md', 'CHANGELOG.md', 'TODO.md', 'NOTES.md', 'DESIGN.md',
];

function detectDocs(filePaths: string[]): string[] {
  return filePaths.filter(f =>
    DOC_SIGS.some(d => f === d || f.endsWith(`/${d}`))
  );
}

function suggestAssistanceLevel(detectedTools: DetectedTool[]): 'full' | 'light' | 'minimal' {
  const hasAgent = detectedTools.some(t =>
    ['archon', 'deerflow', 'claude-code', 'opencode', 'goose', 'aider'].includes(t.type)
  );
  const hasWorkflow = detectedTools.some(t =>
    ['n8n', 'windmill', 'supabase'].includes(t.type)
  );
  const count = detectedTools.length;

  if (hasAgent && hasWorkflow) return 'full';
  if (hasAgent || count >= 3) return 'full';
  if (count >= 2) return 'light';
  return 'minimal';
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function buildStructureSnapshot(input: {
  rootEntries: string[];
  filePaths: string[];
  mode: SnapshotMode;
}): StructureSnapshot {
  const normalizedFiles = Array.from(new Set(input.filePaths.map(normalizeScanPath))).filter(Boolean);
  const rootEntries = Array.from(new Set(input.rootEntries.map(normalizeScanPath)))
    .filter(Boolean)
    .map(path => createStructureEntry(path, inferRootEntryKind(path, normalizedFiles)))
    .sort((a, b) => a.path.localeCompare(b.path));

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
  if (filePaths.includes(normalized)) return 'file';
  if (filePaths.some(file => file.startsWith(`${normalized}/`))) return 'folder';
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

async function readDirNames(dir: string): Promise<string[]> {
  const entries: string[] = [];
  for await (const entry of Deno.readDir(dir)) {
    entries.push(entry.name);
  }
  return entries;
}

function joinPath(basePath: string, childPath: string): string {
  const base = trimTrailingSeparators(normalizeFullPath(basePath));
  const child = normalizeScanPath(childPath);
  if (!base) return `/${child}`;
  return `${base}/${child}`;
}

function getRelativeScanPath(rootPath: string, childPath: string): string {
  const root = trimTrailingSeparators(normalizeFullPath(rootPath));
  const child = normalizeFullPath(childPath);
  if (child === root) return '';
  if (child.startsWith(`${root}/`)) {
    return child.slice(root.length + 1);
  }
  return basename(child);
}

function getDisplayProjectPath(projectPath: string): string {
  return basename(projectPath) || 'approved-workspace';
}

function normalizeFullPath(path: string): string {
  return trimTrailingSeparators(path.replace(/\\/g, '/'));
}

function trimTrailingSeparators(path: string): string {
  if (path === '/') return '';
  if (/^[A-Za-z]:\/?$/.test(path)) return path.replace(/\/$/, '');
  return path.replace(/\/+$/, '');
}

async function readIfExists(basePath: string, file: string): Promise<string | null> {
  try {
    return await Deno.readTextFile(joinPath(basePath, file));
  } catch {
    return null;
  }
}
