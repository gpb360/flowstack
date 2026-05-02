#!/usr/bin/env node

/**
 * Ralph Loop Validation Script
 * Cross-platform validation that catches import errors, TypeScript issues, and Vite bundle problems
 *
 * Usage: node scripts/ralph-loop-validate.js <checkpoint-name>
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKPOINT_NAME = process.argv[2] || 'checkpoint';
const LOG_DIR = '.ralph-loop';
const LOG_FILE = path.join(LOG_DIR, `validation-${CHECKPOINT_NAME}.log`);
const VITE_OUTPUT_FILE = path.join(LOG_DIR, 'vite-output.txt');

// ANSI colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m',
};

let errors = 0;
let warnings = 0;
const logEntries = [];

function log(message) {
  console.log(message);
  logEntries.push(message);
}

function logError(message) {
  log(`${colors.red}❌ ERROR: ${message}${colors.reset}`);
  errors++;
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  WARNING: ${message}${colors.reset}`);
  warnings++;
}

function writeLog() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  fs.writeFileSync(LOG_FILE, logEntries.join('\n'));
}

function execCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

async function checkTypeScript() {
  log('\n📋 CHECK 1: TypeScript Compilation');
  log('------------------------------------');

  const result = execCommand('npx tsc --noEmit');

  if (result.success) {
    logSuccess('TypeScript compilation passed');
  } else {
    logError('TypeScript compilation failed');
    if (result.output) {
      log('Output:\n' + result.output);
    }
  }
}

function checkImports() {
  log('\n📋 CHECK 2: Import Verification');
  log('------------------------------------');

  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    logError('src directory not found');
    return;
  }

  let hasLucideIssues = false;
  let hasRadixIssues = false;

  function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for lucide-react imports
    const lucideImports = content.match(/import\s*{[^}]*}\s*from\s*['"]lucide-react['"]/g);
    if (lucideImports) {
      lucideImports.forEach((imp) => {
        const names = imp.match(/{([^}]*)}/)?.[1] || '';
        const imports = names.split(',').map((s) => s.trim().split(' ')[0]);

        // Valid exports from lucide-react
        // Individual icon components are too many to list, so we check for invalid ones
        const invalidTypes = ['LucideIcon', 'LucideProps', 'IconProps', 'LucideIconProps'];
        const validUtilityExports = ['Icon', 'createLucideIcon', 'default'];

        imports.forEach((importName) => {
          // Skip type-only imports (they cause runtime errors)
          if (invalidTypes.includes(importName)) {
            logWarning(`Found '${importName}' import in ${path.relative(process.cwd(), filePath)}`);
            log('  → This is defined but NOT exported from lucide-react');
            log('  → Use "React.ComponentType<React.SVGProps<SVGSVGElement>>" instead');
            hasLucideIssues = true;
          }
        });
      });
    }

    // Check for Radix imports
    const radixImports = content.match(/from\s*['"]@radix-ui\/[^'"]+['"]/g);
    if (radixImports) {
      radixImports.forEach((imp) => {
        const pkg = imp.match(/@radix-ui\/[^'"]+/)?.[0];
        if (pkg) {
          const pkgPath = path.join('node_modules', pkg);
          if (!fs.existsSync(pkgPath)) {
            logError(`Package ${pkg} imported in ${path.relative(process.cwd(), filePath)} but not installed`);
            hasRadixIssues = true;
          }
        }
      });
    }
  }

  function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDirectory(filePath);
      } else if (/\.(tsx?|jsx?)$/.test(file)) {
        checkFile(filePath);
      }
    });
  }

  try {
    walkDirectory(srcDir);
  } catch (e) {
    logError(`Error walking directory: ${e.message}`);
  }

  if (!hasLucideIssues && !hasRadixIssues) {
    logSuccess('All imports verified');
  }
}

function checkESLint() {
  log('\n📋 CHECK 3: ESLint');
  log('------------------------------------');

  const result = execCommand('npm run lint');

  if (result.success) {
    logSuccess('ESLint passed');
  } else {
    logWarning('ESLint found issues (non-blocking)');
    if (result.output) {
      log('Output:\n' + result.output.substring(0, 500));
    }
  }
}

async function checkViteBundle() {
  log('\n📋 CHECK 4: Vite Bundle Test');
  log('------------------------------------');

  // Kill any existing vite processes
  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul', { stdio: 'ignore' });
    } else {
      execSync('pkill -f "vite" || true', { stdio: 'ignore' });
    }
  } catch (_e) {
    // Ignore errors
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Start Vite and capture output
  log('Starting Vite dev server...');

  const vite = spawn('npm', ['run', 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  let output = '';
  let hasStarted = false;
  let resolved = false;

  vite.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;

    if (text.includes('ready in') && !hasStarted) {
      hasStarted = true;

      // Check for errors in the output
      const lowerOutput = output.toLowerCase();
      if (lowerOutput.includes('error') ||
          lowerOutput.includes('does not provide') ||
          lowerOutput.includes('failed')) {
        logError('Vite output contains errors:');
        const errorLines = output.split('\n').filter((line) =>
          line.toLowerCase().includes('error') ||
          line.toLowerCase().includes('does not provide') ||
          line.toLowerCase().includes('failed')
        );
        errorLines.forEach((line) => log('  ' + line.trim()));
      } else {
        logSuccess('Vite bundled successfully');
      }

      // Kill the server
      vite.kill();
      resolved = true;
    }
  });

  vite.stderr.on('data', (data) => {
    output += data.toString();
  });

  // Timeout after 30 seconds
  setTimeout(() => {
    if (!resolved) {
      if (!hasStarted) {
        logError('Vite failed to start within 30 seconds');
        log('Last output:\n' + output.substring(-500));
      }
      vite.kill();
      resolved = true;
    }
  }, 30000);

  await new Promise((resolve) => {
    vite.on('exit', resolve);
    vite.on('error', resolve);
  });

  // Save Vite output for debugging
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
  fs.writeFileSync(VITE_OUTPUT_FILE, output);
}

async function checkProductionBuild() {
  log('\n📋 CHECK 5: Production Build');
  log('------------------------------------');

  log('Running production build...');
  const result = execCommand('npm run build');

  if (result.success) {
    const distPath = path.join(process.cwd(), 'dist');
    const distExists = fs.existsSync(distPath);
    const indexHtml = fs.existsSync(path.join(distPath, 'index.html'));

    if (distExists && indexHtml) {
      logSuccess('Production build successful');
      log(`  → dist/ directory created`);
      log(`  → index.html present`);
    } else {
      logError('Build completed but dist/ or index.html missing');
    }
  } else {
    logError('Production build failed');
    if (result.output) {
      log('Output:\n' + result.output.substring(0, 500));
    }
  }
}

async function main() {
  log('========================================');
  log(`RALPH LOOP VALIDATION: ${CHECKPOINT_NAME}`);
  log(`Time: ${new Date().toISOString()}`);
  log('========================================');

  await checkTypeScript();
  checkImports();
  checkESLint();
  await checkViteBundle();
  await checkProductionBuild();

  // Summary
  log('\n========================================');
  log('VALIDATION SUMMARY');
  log('========================================');
  log(`Errors:   ${errors}`);
  log(`Warnings: ${warnings}`);
  log('');

  if (errors > 0) {
    logError('CHECKPOINT FAILED - Fix errors and retry');
    log(`Full log: ${LOG_FILE}`);
    log(`Vite output: ${VITE_OUTPUT_FILE}`);
    writeLog();
    process.exit(1);
  } else {
    logSuccess('CHECKPOINT PASSED ✅');
    log(`Full log: ${LOG_FILE}`);
    writeLog();
    process.exit(0);
  }
}

main().catch((error) => {
  logError(`Validation script error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
