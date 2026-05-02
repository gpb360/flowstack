# Code Reviewer Agent

## Purpose

The Code Reviewer Agent is the designated validation agent for the Ralph Loop system. It validates all agent work for errors, bugs, and best practices before tasks are marked complete.

## Agent Profile

- **Agent ID**: A0
- **Name**: Code Reviewer Agent
- **Type**: Validation
- **Status**: Always Available
- **Capabilities**: `code_review`, `validation`, `syntax_check`, `best_practices`, `integration_check`

## Validation Types

### 1. Code Quality Validation

- **Syntax Validation**: Ensures code is syntactically correct
  - TypeScript/JavaScript: ESLint validation
  - SQL: SQL syntax validation
  - JSON: JSON structure validation
  - YAML: YAML structure validation

- **Linting**: Project-specific linting rules
  - ESLint configuration
  - Prettier formatting
  - Import ordering
  - Naming conventions

- **Type Safety**: TypeScript correctness
  - No implicit any
  - Correct type annotations
  - Generic type usage
  - Null/undefined handling

### 2. Documentation Validation

- **Completeness**: All required documentation present
  - README files updated
  - API documentation complete
  - Code comments present
  - Usage examples included

- **Accuracy**: Documentation matches implementation
  - API docs match signatures
  - Examples actually work
  - Comments explain why, not what
  - Diagrams are current

- **Checklists**: All checklist items complete
  - Integration checkpoint items
  - Ralph loop validation items
  - Testing requirements
  - Performance benchmarks

### 3. Integration Validation

- **Type Matching**: Types match across boundaries
  - Database schema ↔ TypeScript types
  - API contracts ↔ Implementation
  - Event payloads ↔ Handlers
  - Component props ↔ Usage

- **Module Contracts**: Integration contracts satisfied
  - API endpoints defined
  - Event handlers registered
  - Dependencies resolved
  - Export/import consistency

- **RLS Policies**: Row Level Security complete
  - All tables have policies
  - Policies are correct
  - No security gaps
  - Test users defined

## Per-Agent Validation Rules

### A1: Database Schema Agent

**Validation Checklist**:

```sql
-- Schema Validation Rules
-- 1. All tables have RLS policies
SELECT tablename FROM pg_tables WHERE schemaname = 'public'
EXCEPT
SELECT tablename FROM pg_policies WHERE schemaname = 'public';

-- 2. All foreign keys have indexes
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
    AND indexdef LIKE '%' || kcu.column_name || '%'
);

-- 3. All required columns present
-- Compare schema specification with actual table definitions
```

**Common Errors to Catch**:
- Missing RLS policies (security issue)
- Unindexed foreign keys (performance issue)
- Missing required columns
- Incorrect data types
- Missing default values
- Circular dependencies

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a1-schema.sh

echo "Validating A1 (Database Schema Agent) work..."

# Check SQL syntax
for file in db/*.sql; do
    echo "Checking $file..."
    psql -f "$file" --echo-errors --set ON_ERROR_STOP=1
done

# Check RLS policies
psql -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' EXCEPT SELECT tablename FROM pg_policies WHERE schemaname = 'public';"

# Check foreign key indexes
psql -c "
SELECT
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
    AND indexdef LIKE '%' || kcu.column_name || '%'
);"

# Generate TypeScript types and compare
npm run generate:types
diff <(npm run generate:types) src/types/database.types.ts

echo "A1 validation complete!"
```

### A2: TypeScript Types Agent

**Validation Checklist**:

```typescript
// Type Validation Rules
// 1. All types exported
// 2. No implicit any
// 3. Correct null handling
// 4. Proper generic usage

// Validate type exports
const typeExports = [
  'Database',
  'Tables',
  'Enums',
  'Relationships',
];

// Validate against schema
function validateTypesAgainstSchema() {
  // Check each table has corresponding type
  // Check each column has correct type
  // Check relationships defined
}
```

**Common Errors to Catch**:
- Missing type exports
- `any` types without justification
- Incorrect null handling
- Mismatched types between schema and code
- Missing generics
- Incorrect enum values

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a2-types.sh

echo "Validating A2 (TypeScript Types Agent) work..."

# TypeScript compilation check
npx tsc --noEmit

# Check for any types
grep -r ":\s*any" src/types/ | grep -v "// any-ok"

# Check type exports
grep -E "^export (type|interface|enum)" src/types/database.types.ts | wc -l

# Validate types match schema
npm run validate:types

echo "A2 validation complete!"
```

### A3: Workflow Engine Agent

**Validation Checklist**:

- **Architecture Documentation**:
  - [ ] Engine architecture documented
  - [ ] Node interface specifications
  - [ ] Execution engine flow
  - [ ] Error handling strategy
  - [ ] Performance considerations

- **Interface Definitions**:
  - [ ] WorkflowNode interface
  - [ ] Connection interface
  - [ ] ExecutionContext interface
  - [ ] Trigger interface
  - [ ] Action interface

**Common Errors to Catch**:
- Missing interface definitions
- Unclear execution flow
- No error handling strategy
- Missing performance requirements
- Unclear integration points

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a3-workflow.sh

echo "Validating A3 (Workflow Engine Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/lib/workflows/*.ts

# Check documentation completeness
grep -E "^export (interface|type|class)" src/lib/workflows/types.ts

# Check integration with AI module
grep -r "import.*ai" src/lib/workflows/

# Check test coverage
npm run test -- --coverage src/lib/workflows

echo "A3 validation complete!"
```

### A4: AI Integration Agent

**Validation Checklist**:

- **API Client Implementation**:
  - [ ] Claude client configured
  - [ ] Error handling for API failures
  - [ ] Rate limiting implemented
  - [ ] Retry logic for failures
  - [ ] Timeout handling

- **Function Registry**:
  - [ ] All tools registered
  - [ ] Tool signatures correct
  - [ ] Parameter validation
  - [ ] Return type validation

**Common Errors to Catch**:
- Missing error handling for API failures
- No rate limiting
- Missing tool definitions
- Incorrect parameter types
- No retry logic

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a4-ai.sh

echo "Validating A4 (AI Integration Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/lib/ai/*.ts

# Check for error handling
grep -r "try.*catch" src/lib/ai/

# Check for rate limiting
grep -r "rate.*limit\|throttle" src/lib/ai/

# Check function registry
grep -E "export.*function" src/lib/ai/functions.ts

# Validate tool signatures
npm run validate:ai-tools

echo "A4 validation complete!"
```

### A5: Dashboard Feature Agent

**Validation Checklist**:

- **Component Implementation**:
  - [ ] Dashboard layout component
  - [ ] Widget components
  - [ ] Data fetching via React Query
  - [ ] Error boundaries
  - [ ] Loading states

- **Performance**:
  - [ ] Memoization used
  - [ ] Lazy loading implemented
  - [ ] Virtualization for large lists
  - [ ] Image optimization

**Common Errors to Catch**:
- Missing error boundaries
- No loading states
- Unnecessary re-renders
- No responsive design
- Accessibility issues

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a5-dashboard.sh

echo "Validating A5 (Dashboard Feature Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/features/dashboard/**/*.ts*

# Check for error boundaries
grep -r "ErrorBoundary" src/features/dashboard/

# Check for React Query
grep -r "useQuery\|useInfiniteQuery" src/features/dashboard/

# Check for accessibility
npm run test:a11y src/features/dashboard

echo "A5 validation complete!"
```

### A6: CRM Feature Agent

**Validation Checklist**:

- **Data Management**:
  - [ ] Contact CRUD operations
  - [ ] Company CRUD operations
  - [ ] Activity tracking
  - [ ] Pipeline visualization
  - [ ] Search and filter

- **Integration**:
  - [ ] Workflow triggers
  - [ ] Analytics events
  - [ ] Data export
  - [ ] Bulk operations

**Common Errors to Catch**:
- Missing RLS policies
- Incomplete validation
- No search optimization
- Missing integration hooks
- No data export

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a6-crm.sh

echo "Validating A6 (CRM Feature Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/features/crm/**/*.ts*

# Check RLS policies
psql -c "SELECT policyname FROM pg_policies WHERE tablename LIKE 'contact%' OR tablename LIKE 'company%';"

# Check for search
grep -r "search\|filter" src/features/crm/

# Check integration with workflows
grep -r "workflow\|trigger" src/features/crm/

echo "A6 validation complete!"
```

### A7: Builder Feature Agent

**Validation Checklist**:

- **Block Editor**:
  - [ ] Drag-and-drop working
  - [ ] Block components complete
  - [ ] Version control
  - [ ] Preview mode
  - [ ] Responsive breakpoints

- **Security**:
  - [ ] XSS protection
  - [ ] CSP headers
  - [ ] Safe custom code injection
  - [ ] Content sanitization

**Common Errors to Catch**:
- Drag-and-drop conflicts
- Missing version history
- XSS vulnerabilities
- Breakpoint issues
- No CSP headers

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a7-builder.sh

echo "Validating A7 (Builder Feature Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/features/builder/**/*.ts*

# Check for drag-and-drop
grep -r "@dnd-kit\|useDraggable\|useDroppable" src/features/builder/

# Check for XSS protection
grep -r "sanitize\|DOMPurify" src/features/builder/

# Check version history
grep -r "version\|history" src/features/builder/

echo "A7 validation complete!"
```

### A8: Workflows Feature Agent

**Validation Checklist**:

- **Visual Editor**:
  - [ ] XyFlow canvas working
  - [ ] Node palette
  - [ ] Connection logic
  - [ ] Test execution
  - [ ] Execution history

- **Execution**:
  - [ ] Triggers working
  - [ ] Actions working
  - [ ] AI integration
  - [ ] Error handling
  - [ ] Logging

**Common Errors to Catch**:
- Missing node types
- Connection validation missing
- No test mode
- Missing execution logs
- No error handling

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a8-workflows.sh

echo "Validating A8 (Workflows Feature Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/features/workflows/**/*.ts*

# Check for XyFlow
grep -r "@xyflow\|ReactFlow" src/features/workflows/

# Check for execution
grep -r "execute\|runWorkflow" src/features/workflows/

# Check for logging
grep -r "log\|history" src/features/workflows/

echo "A8 validation complete!"
```

### A9: Marketing Feature Agent

**Validation Checklist**:

- **Campaigns**:
  - [ ] Email campaigns working
  - [ ] SMS campaigns working
  - [ ] Template builder
  - [ ] Segmentation
  - [ ] A/B testing

- **Compliance**:
  - [ ] Unsubscribe handling
  - [ ] CAN-SPAM compliance
  - [ ] GDPR compliance
  - [ ] Privacy policy links

**Common Errors to Catch**:
- Missing unsubscribe links
- No compliance checks
- Segmentation bugs
- Missing analytics
- No privacy policy

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a9-marketing.sh

echo "Validating A9 (Marketing Feature Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/features/marketing/**/*.ts*

# Check for unsubscribe
grep -r "unsubscribe\|opt.*out" src/features/marketing/

# Check for compliance
grep -r "CAN-SPAM\|GDPR\|privacy" src/features/marketing/

# Check for segmentation
grep -r "segment\|target" src/features/marketing/

echo "A9 validation complete!"
```

### A10: Analytics Feature Agent

**Validation Checklist**:

- **Metrics**:
  - [ ] Calculation correct
  - [ ] Data visualization
  - [ ] Custom reports
  - [ ] Real-time updates
  - [ ] Data export

- **Performance**:
  - [ ] Efficient aggregation
  - [ ] Data caching
  - [ ] Timezone handling
  - [ ] Retention policies

**Common Errors to Catch**:
- Incorrect aggregations
- Performance issues
- Missing timezone handling
- No data caching
- No retention policy

**Validation Script**:
```bash
#!/bin/bash
# .orchestrator/scripts/validate-a10-analytics.sh

echo "Validating A10 (Analytics Feature Agent) work..."

# Check TypeScript compilation
npx tsc --noEmit src/features/analytics/**/*.ts*

# Check for aggregation
grep -r "aggregate\|sum\|avg\|count" src/features/analytics/

# Check for caching
grep -r "cache\|staleTime\|gcTime" src/features/analytics/

# Check for timezone handling
grep -r "timezone\|tz\|utc" src/features/analytics/

echo "A10 validation complete!"
```

## Checkpoint Validation Rules

### Phase 0: Infrastructure Setup

**Validation Scope**:
- Database schema (A1)
- TypeScript types (A2)
- Workflow engine design (A3)
- AI integration design (A4)

**Integration Tests**:
```bash
# Test database schema creation
psql -f db/init.sql
psql -f db/crm_schema.sql
psql -f db/workflow_schema.sql

# Test TypeScript generation
npm run generate:types
npx tsc --noEmit

# Test type matching
npm run test:types-match-schema
```

**Success Criteria**:
- All schemas compile without errors
- All TypeScript compiles without errors
- Types can be generated from schema
- Integration contracts defined

### Phase 1: Foundation Features

**Validation Scope**:
- Dashboard (A5)
- CRM (A6)
- Analytics (A10)
- Builder design (A7)

**Integration Tests**:
```bash
# Test cross-feature integration
npm run test:integration -- --grep "dashboard.*crm"
npm run test:integration -- --grep "crm.*analytics"
npm run test:integration -- --grep "builder.*crm"
```

**Success Criteria**:
- All features work independently
- Cross-feature navigation working
- Data sharing between features working
- No regressions in existing functionality

### Phase 2: Automation Engine

**Validation Scope**:
- Workflows (A8)
- AI Agents (A4)
- Builder implementation (A7)

**Integration Tests**:
```bash
# Test workflow automation
npm run test:integration -- --grep "workflow.*crm"
npm run test:integration -- --grep "workflow.*ai"
npm run test:integration -- --grep "ai.*builder"
```

**Success Criteria**:
- Workflows can automate operations
- AI agents respond correctly
- Builder pages use workflow data
- End-to-end automation working

### Phase 3: Marketing Features

**Validation Scope**:
- Email campaigns
- SMS campaigns
- Template builder
- Segmentation

**Integration Tests**:
```bash
# Test marketing integration
npm run test:integration -- --grep "marketing.*workflow"
npm run test:integration -- --grep "marketing.*crm"
npm run test:integration -- --grep "marketing.*analytics"
```

**Success Criteria**:
- Campaigns can be triggered by workflows
- CRM data available for segmentation
- Analytics tracks campaign performance
- Compliance checks working

### Phase 4: Extended Features

**Validation Scope**:
- Invoicing
- Appointments
- Chat widget
- Memberships
- Reputation

**Integration Tests**:
```bash
# Test extended features
npm run test:integration -- --grep "invoice.*workflow"
npm run test:integration -- --grep "appointment.*crm"
npm run test:integration -- --grep "chat.*crm"
```

**Success Criteria**:
- All extended features working
- Integration with core features working
- No regressions
- Performance benchmarks met

## Validation Result Structure

```typescript
interface CodeReviewResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  agent: string;
  timestamp: number;
  attemptNumber: number;
}
```

### Example Valid Response

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Consider adding index to contacts.email for performance"
  ],
  "suggestions": [
    "Add JSDoc comments to exported functions",
    "Consider using React.memo for ContactList component"
  ],
  "agent": "A6",
  "timestamp": 1737873600000,
  "attemptNumber": 1
}
```

### Example Invalid Response

```json
{
  "valid": false,
  "errors": [
    "Missing RLS policy on contacts table",
    "Type mismatch: contacts.company_id is string but should be number",
    "No error handling in createContact function"
  ],
  "warnings": [
    "No search optimization on contacts.name"
  ],
  "suggestions": [
    "Add try-catch around database operations",
    "Add loading states to forms"
  ],
  "agent": "A6",
  "timestamp": 1737873600000,
  "attemptNumber": 1
}
```

## References

- [Ralph Loop Configuration](../ralph-loop.md) - Ralph loop settings and rules
- [Coordination Guide](../coordination.md) - Agent coordination protocol
- [Integration Checkpoints](../integration-checkpoints.md) - Phase verification
