#!/bin/bash

# =====================================================
# FlowStack Database Migration Script
# Applies all schema files to Supabase in dependency order
# =====================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$SCRIPT_DIR/../db"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Please install it first: npm install -g supabase"
    exit 1
fi

# Check if user is logged in to Supabase
echo "Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}Warning: Not logged in to Supabase${NC}"
    echo "Please run: supabase login"
    exit 1
fi

# Function to apply a single schema file
apply_schema() {
    local file=$1
    local filename=$(basename "$file")

    echo -e "${GREEN}Applying ${filename}...${NC}"

    if supabase db push --file "$file" --db-url "$DATABASE_URL"; then
        echo -e "${GREEN}✓ Successfully applied ${filename}${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to apply ${filename}${NC}"
        return 1
    fi
}

# Function to wait for user confirmation
confirm() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# =====================================================
# Migration Order (following dependencies)
# =====================================================

SCHEMAS=(
    "init.sql"
    "crm_schema.sql"
    "workflow_schema.sql"
    "builder_schema.sql"
    "marketing_schema.sql"
    "deals_schema.sql"
    "agents_schema.sql"
    "forms_schema.sql"
    "calendar_schema.sql"
    "phone_schema.sql"
    "membership_schema.sql"
    "social_schema.sql"
    "reputation_schema.sql"
)

# =====================================================
# Main Execution
# =====================================================

echo "===================================================="
echo "FlowStack Database Migration"
echo "===================================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it before running this script:"
    echo "  export DATABASE_URL='postgresql://[user]:[password]@[host]:[port]/[database]'"
    exit 1
fi

echo "Database URL: ${DATABASE_URL:0:20}..."
echo ""

# Show which schemas will be applied
echo "The following schemas will be applied in order:"
for schema in "${SCHEMAS[@]}"; do
    echo "  - $schema"
done
echo ""

# Ask for confirmation
if ! confirm "Do you want to proceed?"; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Starting migration..."
echo ""

# Track success/failure
SUCCESS=0
FAILED=0

# Apply each schema file
for schema in "${SCHEMAS[@]}"; do
    FILE="$DB_DIR/$schema"

    if [ ! -f "$FILE" ]; then
        echo -e "${RED}✗ Schema file not found: $schema${NC}"
        ((FAILED++))
        continue
    fi

    if apply_schema "$FILE"; then
        ((SUCCESS++))
    else
        ((FAILED++))

        # Ask if we should continue or stop
        if ! confirm "A schema failed to apply. Continue with remaining schemas?"; then
            echo "Migration stopped by user."
            break
        fi
    fi

    echo ""
done

# =====================================================
# Summary
# =====================================================

echo "===================================================="
echo "Migration Summary"
echo "===================================================="
echo -e "${GREEN}Successful: $SUCCESS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All schemas applied successfully!${NC}"
    exit 0
else
    echo -e "${RED}Some schemas failed to apply. Please review the errors above.${NC}"
    exit 1
fi
