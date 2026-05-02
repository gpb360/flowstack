import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const structureSource = readFileSync(new URL('../src/lib/scanner/structure.ts', import.meta.url), 'utf8');
const patternsSource = readFileSync(new URL('../src/lib/scanner/patterns.ts', import.meta.url), 'utf8');
const edgeScanSource = readFileSync(new URL('../supabase/functions/scan-project/index.ts', import.meta.url), 'utf8');

assert.match(structureSource, /buildStructureSnapshot/, 'buildStructureSnapshot must exist');
assert.match(structureSource, /dotFolders/, 'structure snapshot must expose dotFolders');
assert.match(structureSource, /\.gsd/, 'structure helper must include .gsd hints');
assert.match(structureSource, /\.claude/, 'structure helper must include .claude hints');
assert.match(structureSource, /\.codex/, 'structure helper must include .codex hints');
assert.match(
  structureSource,
  /Implementation files are useful context, but FlowStack treats them as secondary/,
  'implementation files must be described as secondary',
);

assert.match(patternsSource, /hasPatternEvidence/, 'empty tool patterns must require evidence before matching');
assert.doesNotMatch(
  patternsSource,
  /deps\.typescript|deps\['ts-node'\]/,
  'browser scanner must not infer TypeScript from package.json dependencies alone',
);
assert.doesNotMatch(
  edgeScanSource,
  /from ['"]fs\/promises['"]|from ['"]path['"]/,
  'edge scanner must not import Node fs/path bare specifiers',
);
assert.doesNotMatch(
  edgeScanSource,
  /'package\.json': 'typescript'/,
  'edge scanner must not infer TypeScript from package.json alone',
);
assert.match(edgeScanSource, /FLOWSTACK_SCAN_ROOTS/, 'edge scanner must require approved scan roots');
assert.match(edgeScanSource, /getRelativeScanPath/, 'edge scanner must normalize relative paths');
assert.match(edgeScanSource, /hasPatternEvidence/, 'edge scanner tool patterns must require evidence before matching');
assert.doesNotMatch(
  edgeScanSource,
  /deps\.typescript|deps\['ts-node'\]/,
  'edge scanner must not infer TypeScript from package.json dependencies alone',
);

console.log('scanner structure smoke checks passed');
