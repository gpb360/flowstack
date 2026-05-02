#!/bin/bash

# Ralph Loop Validation Script
# This script validates that all changes pass compilation, import verification, and runtime checks
# Usage: ./scripts/ralph-loop-validate.sh <checkpoint-name>

set -e  # Exit on error

CHECKPOINT_NAME=${1:-"checkpoint"}
LOG_FILE=".ralph-loop/validation-${CHECKPOINT_NAME}.log"
VITE_OUTPUT_FILE=".ralph-loop/vite-output.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create logs directory
mkdir -p .ralph-loop

echo "========================================" | tee -a "$LOG_FILE"
echo "RALPH LOOP VALIDATION: $CHECKPOINT_NAME" | tee -a "$LOG_FILE"
echo "Time: $(date)" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# Counter for errors
ERRORS=0
WARNINGS=0

# Function to log and print errors
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}" | tee -a "$LOG_FILE"
    ERRORS=$((ERRORS + 1))
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}" | tee -a "$LOG_FILE"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================================================
# CHECK 1: TypeScript Compilation
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "📋 CHECK 1: TypeScript Compilation" | tee -a "$LOG_FILE"
echo "------------------------------------" | tee -a "$LOG_FILE"

if npx tsc --noEmit 2>&1 | tee -a "$LOG_FILE"; then
    log_success "TypeScript compilation passed"
else
    log_error "TypeScript compilation failed"
    echo "Run 'npx tsc --noEmit' to see full errors" | tee -a "$LOG_FILE"
fi

# ============================================================================
# CHECK 2: Import Verification
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "📋 CHECK 2: Import Verification" | tee -a "$LOG_FILE"
echo "------------------------------------" | tee -a "$LOG_FILE"

# Check for potentially problematic imports
PROBLEMATIC_IMPORTS=$(grep -r "import.*from.*lucide-react" src/ 2>/dev/null | grep -v "LucideProps\|Icon\|from 'lucide-react'" || true)

if [ -n "$PROBLEMATIC_IMPORTS" ]; then
    log_warning "Found lucide-react imports that may not exist:"
    echo "$PROBLEMATIC_IMPORTS" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"
    echo "Valid lucide-react exports: Icon, LucideProps, and individual icon components" | tee -a "$LOG_FILE"
    echo "Invalid: LucideIcon (use LucideProps or React.ComponentType<LucideProps>)" | tee -a "$LOG_FILE"
else
    log_success "All lucide-react imports appear valid"
fi

# Check for Radix imports that might not exist
RADIX_IMPORTS=$(grep -r "from '@radix-ui" src/ 2>/dev/null | grep -o "@radix-ui/[a-z-]*" | sort -u)

for pkg in $RADIX_IMPORTS; do
    if [ -d "node_modules/$pkg" ]; then
        echo "  ✓ $pkg installed" >> "$LOG_FILE"
    else
        log_error "Package $pkg imported but not installed"
    fi
done

# ============================================================================
# CHECK 3: ESLint
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "📋 CHECK 3: ESLint" | tee -a "$LOG_FILE"
echo "------------------------------------" | tee -a "$LOG_FILE"

if npm run lint 2>&1 | tee -a "$LOG_FILE"; then
    log_success "ESLint passed"
else
    log_warning "ESLint found issues (non-blocking)"
fi

# ============================================================================
# CHECK 4: Vite Dev Server Bundle Test
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "📋 CHECK 4: Vite Bundle Test" | tee -a "$LOG_FILE"
echo "------------------------------------" | tee -a "$LOG_FILE"

# Kill any existing dev servers
pkill -f "vite" || true
sleep 2

# Start dev server in background
echo "Starting Vite dev server..." | tee -a "$LOG_FILE"
npm run dev > "$VITE_OUTPUT_FILE" 2>&1 &
VITE_PID=$!

# Wait for server to start (up to 30 seconds)
echo "Waiting for Vite to bundle..." | tee -a "$LOG_FILE"
for i in {1..30}; do
    if grep -q "ready in" "$VITE_OUTPUT_FILE" 2>/dev/null; then
        log_success "Vite bundled successfully"

        # Check for any errors in the output
        if grep -qi "error\|failed\|does not provide" "$VITE_OUTPUT_FILE" 2>/dev/null; then
            log_error "Vite output contains errors:"
            grep -i "error\|failed\|does not provide" "$VITE_OUTPUT_FILE" | tee -a "$LOG_FILE"
        else
            log_success "No errors in Vite output"
        fi

        break
    fi

    if [ $i -eq 30 ]; then
        log_error "Vite failed to start within 30 seconds"
        echo "Last 20 lines of output:" | tee -a "$LOG_FILE"
        tail -20 "$VITE_OUTPUT_FILE" | tee -a "$LOG_FILE"
    fi

    sleep 1
done

# Kill the dev server
kill $VITE_PID 2>/dev/null || true
pkill -f "vite" || true

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "VALIDATION SUMMARY" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "Errors:   $ERRORS" | tee -a "$LOG_FILE"
echo "Warnings: $WARNINGS" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ $ERRORS -gt 0 ]; then
    log_error "CHECKPOINT FAILED - Fix errors and retry"
    echo "Full log: $LOG_FILE" | tee -a "$LOG_FILE"
    echo "Vite output: $VITE_OUTPUT_FILE" | tee -a "$LOG_FILE"
    exit 1
else
    log_success "CHECKPOINT PASSED ✅"
    echo "Full log: $LOG_FILE" | tee -a "$LOG_FILE"
    exit 0
fi
