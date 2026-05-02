/**
 * Detection Patterns
 *
 * Pure functions for tool detection — no I/O.
 * Safe to import in browser code.
 */

import type { DetectedTool } from './types';

export interface DetectionPatternDef {
  type: string;
  label: string;
  signatures: string[];
  primarySignals: string[];
  configSignals: string[];
  versionSignals: VersionSignal[];
  impliesLanguage?: string;
}

export interface VersionSignal {
  file: string;
  fieldPath?: string;
  contains?: string;
}

const LANG_EXTENSIONS: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.rs': 'rust',
  '.go': 'go',
  '.java': 'java',
  '.cs': 'csharp',
};

const LANG_FILES: Record<string, string> = {
  pyproject: 'python',
  requirements: 'python',
  'package.json': 'javascript',
  'Cargo.toml': 'rust',
  'go.mod': 'go',
  'pom.xml': 'java',
  'build.gradle': 'kotlin',
  '.csproj': 'csharp',
};

const SERVICE_PATTERNS: Record<string, string> = {
  postgres: 'postgresql',
  postgresql: 'postgresql',
  redis: 'redis',
  mongo: 'mongodb',
  mongodb: 'mongodb',
  mysql: 'mysql',
  elasticsearch: 'elasticsearch',
  rabbitmq: 'rabbitmq',
};

export const DETECTION_PATTERNS: DetectionPatternDef[] = [
  {
    type: 'archon',
    label: 'Archon Harness',
    signatures: ['.archon', '.archon/workflows', '.archon/commands'],
    primarySignals: ['.archon/workflows', '.archon/commands', '.archon/workflows.yaml'],
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
    primarySignals: [
      'deer-flow/server.py',
      'deer-flow/main.py',
      'agent-harness',
      'deer-flow/pyproject.toml',
    ],
    configSignals: ['deer-flow/config.yaml', 'deer-flow/.env.example'],
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
    configSignals: ['CLAUDE.md', '.claude/commands.md'],
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
    type: 'payload-headless',
    label: 'Payload Headless CMS',
    signatures: ['payload.headless.config.ts'],
    primarySignals: ['payload.headless.config.ts'],
    configSignals: [],
    versionSignals: [],
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

/**
 * Run pattern detection on a flat list of relative file paths.
 * Pure function — no I/O.
 */
export function detectTools(
  patterns: DetectionPatternDef[],
  filePaths: string[],
  fileContents: Map<string, string>,
): DetectedTool[] {
  return patterns
    .map(p => matchPattern(p, filePaths, fileContents))
    .filter((t): t is DetectedTool => t !== null);
}

function matchPattern(
  pattern: DetectionPatternDef,
  filePaths: string[],
  fileContents: Map<string, string>,
): DetectedTool | null {
  const matchedSignatures = pattern.signatures.filter(sig =>
    filePaths.some(f => f === sig || f.startsWith(sig + '/'))
  );

  let matchedPrimarySignal = false;
  if (matchedSignatures.length === 0 && pattern.primarySignals.length > 0) {
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
    matchedSignatures.length > 0 ||
    matchedPrimarySignal ||
    matchedVersionSignal ||
    configFiles.length > 0;

  if (!hasPatternEvidence) return null;

  const primaryPath = matchedSignatures[0] ?? pattern.signatures[0] ?? '';

  return {
    type: pattern.type,
    path: primaryPath,
    label: pattern.label,
    version,
    configFiles,
    metadata: {
      matchedSignatures,
      impliesLanguage: pattern.impliesLanguage,
    },
  };
}

function getNestedField(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((curr, key) => {
    if (typeof curr !== 'object' || curr === null) return undefined;
    return (curr as Record<string, unknown>)[key];
  }, obj);
}

function extractVersion(content: string, keyword: string): string | undefined {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes(keyword.toLowerCase())) {
      const match = line.match(/[\^~>=<]*([\d.]+)/);
      if (match) return match[1];
    }
  }
  return undefined;
}

/**
 * Detect secondary implementation signals from a file list.
 *
 * FlowStack uses these as supporting context only. The primary audit lens is
 * workspace structure: dot folders, manifests, context files, and project roots.
 */
export function detectLanguages(filePaths: string[]): string[] {
  const languages = new Set<string>();

  // From extensions
  for (const file of filePaths) {
    const lastDot = file.lastIndexOf('.');
    if (lastDot >= 0) {
      const ext = file.slice(lastDot);
      const lang = LANG_EXTENSIONS[ext];
      if (lang) languages.add(lang);
    }
  }

  // From root-level config files
  const rootFiles = new Set(filePaths.filter(f => !f.includes('/')));
  for (const file of rootFiles) {
    const lang = LANG_FILES[file];
    if (lang) languages.add(lang);
  }

  return Array.from(languages).sort();
}

/**
 * Detect external services from docker-compose and .env filenames
 */
export function detectServices(filePaths: string[], fileContents: Map<string, string>): string[] {
  const services = new Set<string>();

  const dockerContent =
    fileContents.get('docker-compose.yml') ??
    fileContents.get('docker-compose.prod.yml') ??
    null;

  if (dockerContent) {
    const lower = dockerContent.toLowerCase();
    for (const [keyword, service] of Object.entries(SERVICE_PATTERNS)) {
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

/**
 * Suggest assistance level based on detected tools
 */
export function suggestAssistanceLevel(detectedTools: DetectedTool[]): 'full' | 'light' | 'minimal' {
  const hasAgentHarness = detectedTools.some(t =>
    ['archon', 'deerflow', 'claude-code', 'opencode', 'goose', 'aider'].includes(t.type)
  );
  const hasWorkflowEngine = detectedTools.some(t =>
    ['n8n', 'windmill', 'supabase'].includes(t.type)
  );
  const toolCount = detectedTools.length;

  if (hasAgentHarness && hasWorkflowEngine) return 'full';
  if (hasAgentHarness || toolCount >= 3) return 'full';
  if (toolCount >= 2) return 'light';
  return 'minimal';
}

const DOC_SIGNATURES = [
  'README.md', 'README', 'AGENTS.md', 'AGENT.md',
  'CONTRIBUTING.md', 'ARCHITECTURE.md', 'DECISIONS.md',
  'CHANGELOG.md', 'TODO.md', 'NOTES.md', 'DESIGN.md',
];

export function detectDocs(filePaths: string[]): string[] {
  return filePaths.filter(f =>
    DOC_SIGNATURES.some(d => f === d || f.endsWith(`/${d}`))
  );
}
