import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const source = resolve('scripts/githooks/pre-commit');
const target = resolve('.git/hooks/pre-commit');

if (!existsSync(source) || existsSync(target)) {
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
