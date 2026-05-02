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
