#!/bin/bash
# validate-agent.sh
#
# Validate agent work before marking complete
# This script is part of the Ralph Loop validation system for the .orchestrator
#
# Usage: ./validate-agent.sh <AGENT_ID> [WORK_DIR]
#
# Example:
#   ./validate-agent.sh A1 ./db
#   ./validate-agent.sh A2 ./src/types
#   ./validate-agent.sh A5 ./src/features/dashboard

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if agent ID is provided
if [ -z "$1" ]; then
    print_error "Agent ID is required"
    echo "Usage: $0 <AGENT_ID> [WORK_DIR]"
    echo ""
    echo "Valid Agent IDs:"
    echo "  A0 - Code Reviewer Agent"
    echo "  A1 - Database Schema Agent"
    echo "  A2 - TypeScript Types Agent"
    echo "  A3 - Workflow Engine Agent"
    echo "  A4 - AI Integration Agent"
    echo "  A5 - Dashboard Feature Agent"
    echo "  A6 - CRM Feature Agent"
    echo "  A7 - Builder Feature Agent"
    echo "  A8 - Workflows Feature Agent"
    echo "  A9 - Marketing Feature Agent"
    echo "  A10 - Analytics Feature Agent"
    exit 1
fi

AGENT_ID="$1"
WORK_DIR="${2:-.}"

print_info "Validating $AGENT_ID work in $WORK_DIR"

# Validate Agent ID
case "$AGENT_ID"
    A0|A1|A2|A3|A4|A5|A6|A7|A8|A9|A10)
        # Valid agent ID
        ;;
    *)
        print_error "Invalid Agent ID: $AGENT_ID"
        exit 1
        ;;
esac

# Track validation errors
ERRORS=0
WARNINGS=0

# Common validation checks
print_info "Running common validation checks..."

# Check for TypeScript errors
if [ -f "tsconfig.json" ]; then
    print_info "Checking TypeScript compilation..."
    if npx tsc --noEmit --quiet 2>&1; then
        print_success "TypeScript compilation passed"
    else
        print_error "TypeScript compilation failed"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check for ESLint errors
if [ -f "eslint.config.js" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
    print_info "Running ESLint..."
    if npm run lint -- --quiet "$WORK_DIR" 2>&1; then
        print_success "ESLint passed"
    else
        print_error "ESLint found errors"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Agent-specific validation
print_info "Running $AGENT_ID-specific validation..."

case "$AGENT_ID" in
    A1)
        # Database Schema Agent
        print_info "Validating SQL schemas..."

        # Check SQL syntax
        for sql_file in db/*.sql; do
            if [ -f "$sql_file" ]; then
                print_info "Checking $sql_file..."
                if psql -f "$sql_file" --echo-errors --set ON_ERROR_STOP=1 2>&1 | grep -q "ERROR"; then
                    print_error "SQL syntax error in $sql_file"
                    ERRORS=$((ERRORS + 1))
                else
                    print_success "$sql_file is valid"
                fi
            fi
        done

        # Check for RLS policies
        print_info "Checking for Row Level Security policies..."
        # This would connect to the database and check
        # For now, just warn
        print_warning "RLS policy check requires database connection"
        ;;

    A2)
        # TypeScript Types Agent
        print_info "Validating TypeScript types..."

        # Check for 'any' types
        print_info "Checking for 'any' types..."
        ANY_COUNT=$(grep -r ":\s*any" "$WORK_DIR" 2>/dev/null | grep -v "// any-ok" | wc -l)
        if [ "$ANY_COUNT" -gt 0 ]; then
            print_warning "Found $ANY_COUNT occurrences of 'any' type"
            WARNINGS=$((WARNINGS + 1))
        fi

        # Check type exports
        print_info "Checking type exports..."
        EXPORT_COUNT=$(grep -E "^export (type|interface|enum)" "$WORK_DIR"/*.ts 2>/dev/null | wc -l)
        if [ "$EXPORT_COUNT" -eq 0 ]; then
            print_warning "No type exports found in $WORK_DIR"
            WARNINGS=$((WARNINGS + 1))
        else
            print_success "Found $EXPORT_COUNT type exports"
        fi
        ;;

    A3)
        # Workflow Engine Agent
        print_info "Validating workflow engine..."

        # Check for interface definitions
        print_info "Checking for workflow interfaces..."
        if grep -q "export interface.*Workflow" "$WORK_DIR"/types.ts 2>/dev/null; then
            print_success "Workflow interfaces found"
        else
            print_warning "Workflow interfaces not found"
            WARNINGS=$((WARNINGS + 1))
        fi

        # Check for execution engine
        print_info "Checking for execution engine..."
        if [ -f "$WORK_DIR/execution.ts" ] || [ -f "$WORK_DIR/engine.ts" ]; then
            print_success "Execution engine found"
        else
            print_warning "Execution engine not found"
            WARNINGS=$((WARNINGS + 1))
        fi
        ;;

    A4)
        # AI Integration Agent
        print_info "Validating AI integration..."

        # Check for error handling
        print_info "Checking for error handling..."
        TRY_CATCH_COUNT=$(grep -r "try.*catch" "$WORK_DIR" 2>/dev/null | wc -l)
        if [ "$TRY_CATCH_COUNT" -eq 0 ]; then
            print_warning "No error handling found"
            WARNINGS=$((WARNINGS + 1))
        else
            print_success "Found error handling in $TRY_CATCH_COUNT locations"
        fi

        # Check for rate limiting
        print_info "Checking for rate limiting..."
        if grep -r "rate.*limit\|throttle" "$WORK_DIR" 2>/dev/null | grep -q .; then
            print_success "Rate limiting found"
        else
            print_warning "No rate limiting found"
            WARNINGS=$((WARNINGS + 1))
        fi
        ;;

    A5|A6|A7|A8|A9|A10)
        # Feature Agents (A5-A10)
        print_info "Validating feature implementation..."

        # Check for components
        print_info "Checking for React components..."
        COMPONENT_COUNT=$(find "$WORK_DIR" -name "*.tsx" -o -name "*.jsx" 2>/dev/null | wc -l)
        if [ "$COMPONENT_COUNT" -eq 0 ]; then
            print_warning "No React components found"
            WARNINGS=$((WARNINGS + 1))
        else
            print_success "Found $COMPONENT_COUNT React components"
        fi

        # Check for tests
        print_info "Checking for test files..."
        TEST_COUNT=$(find "$WORK_DIR" -name "*.test.ts*" -o -name "*.spec.ts*" 2>/dev/null | wc -l)
        if [ "$TEST_COUNT" -eq 0 ]; then
            print_warning "No test files found"
            WARNINGS=$((WARNINGS + 1))
        else
            print_success "Found $TEST_COUNT test files"
        fi

        # Check for error boundaries
        print_info "Checking for error boundaries..."
        if grep -r "ErrorBoundary" "$WORK_DIR" 2>/dev/null | grep -q .; then
            print_success "Error boundaries found"
        else
            print_warning "No error boundaries found"
            WARNINGS=$((WARNINGS + 1))
        fi
        ;;

    *)
        print_warning "No specific validation rules for $AGENT_ID"
        ;;
esac

# Documentation validation
print_info "Checking documentation completeness..."

# Check for README
if [ -f "$WORK_DIR/README.md" ]; then
    print_success "README.md found"
else
    print_warning "No README.md found"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for TODO/FIXME comments
print_info "Checking for TODO/FIXME comments..."
TODO_COUNT=$(grep -r "TODO\|FIXME" "$WORK_DIR" 2>/dev/null | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    print_warning "Found $TODO_COUNT TODO/FIXME comments"
    WARNINGS=$((WARNINGS + 1))
fi

# Print summary
echo ""
echo "===================="
echo "Validation Summary"
echo "===================="
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    print_success "Validation passed for $AGENT_ID"
    exit 0
else
    print_error "Validation failed for $AGENT_ID"
    exit 1
fi
