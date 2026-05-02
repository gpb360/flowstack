# Ralph Loop Web Validation System

## Overview

The Ralph Loop is the current web-app validation system for FlowStack's React/Vite shell. It ensures web code changes pass compilation, import verification, and runtime checks before being marked complete. It prevents errors like missing imports, invalid exports, and bundle failures from reaching production.

This is not the universal FlowStack audit layer. It is one project-specific validation flow for the current web application.

## What It Checks

1. **TypeScript Compilation** - Catches type errors and syntax issues
2. **Import Verification** - Detects invalid imports (like `LucideIcon` from lucide-react)
3. **ESLint** - Finds code quality issues
4. **Vite Bundle Test** - Actually starts the web dev server and verifies it bundles successfully

## How to Use

### Run Manually

```bash
# Run the web validation flow with default checkpoint name
npm run web:validate

# Run with custom checkpoint name
npm run web:validate -- my-feature

# Compatibility aliases still work
npm run validate
npm run validate:checkpoint -- my-feature
```

### Automatic Git Hook (Optional)

To enable automatic validation before every commit:

```bash
# Copy the hook to .git/hooks
cp scripts/githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Now every `git commit` will automatically run validation and block the commit if there are errors.

## Exit Codes

- **0** = All checks passed ✅
- **1** = One or more checks failed ❌

## Log Files

Validation logs are saved to `.ralph-loop/` directory:
- `validation-<checkpoint-name>.log` - Full validation output
- `vite-output.txt` - Vite dev server output from last run

## What Would Have Been Caught

### Example: The `LucideIcon` Error

**What I did wrong:**
```typescript
import { LucideIcon } from 'lucide-react'; // ❌ This export doesn't exist
```

**What Ralph Loop detected:**
```
⚠️  WARNING: Found 'LucideIcon' import in src\components\ui\metric-card.tsx
  → This export does not exist in lucide-react
  → Use "LucideProps" or "React.ComponentType<LucideProps>" instead
```

**The fix:**
```typescript
import { LucideProps } from 'lucide-react';
// Then use: React.ComponentType<LucideProps>
```

## Integration with Development Workflow

### After Making Changes

```bash
# 1. Make your changes
vim src/components/my-component.tsx

# 2. Run Ralph Loop web validation
npm run web:validate -- feature-x

# 3. If it passes, commit
git add .
git commit -m "feat: add feature x"
```

### If Validation Fails

1. Read the error messages
2. Fix the issues
3. Run validation again
4. Only commit when it passes

## Why TypeScript Alone Isn't Enough

TypeScript doesn't validate that named exports actually exist from modules:

```typescript
// This compiles fine with TypeScript but breaks at runtime:
import { NonExistentExport } from 'some-package';
```

Ralph Loop catches this by:
1. Scanning all imports in your code
2. Checking against known invalid patterns
3. Actually building the bundle to verify

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/pr.yml
- name: Ralph Loop Validation
  run: npm run validate
```

This ensures every PR passes validation before merging.

## Troubleshooting

### "Vite failed to start within 30 seconds"

- Check if another process is using port 5173
- Run `taskkill /F /IM node.exe` (Windows) or `pkill -f vite` (Mac/Linux)
- Try validation again

### False Positives

If you get warnings for valid imports:

1. Check the package documentation
2. Verify the export exists in `node_modules/package/dist`
3. Report it if it's a real bug in the validation script

## Customization

Edit `scripts/ralph-loop-validate.js` to:

- Add more import checks
- Customize error messages
- Add additional validation steps
- Change timeout values
