/**
 * Scanner - Browser-Safe Exports
 *
 * Only imports from here in browser/React code.
 * Contains: types, patterns, pure detection functions.
 *
 * For server-side scanning, use the Supabase Edge Function:
 *   supabase/functions/scan-project/index.ts
 *
 * @example
 * import { DETECTION_PATTERNS, detectTools } from '@/lib/scanner';
 * // Pure function - no side effects, no I/O
 */

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
