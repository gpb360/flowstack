# Ralph Loop Configuration

## Overview

The Ralph Loop is a two-layer validation pattern that ensures all agent work is error-free before marking tasks complete. It provides comprehensive validation coverage across code quality, documentation completeness, and integration points.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              TOP-LEVEL ORCHESTRATOR (.orchestrator/)           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │              OUTER RALPH LOOP (Checkpoint Level)           ││
│  │                                                              ││
│  │  Phase Checkpoint → Validate All Agents → Sign-off         ││
│  │  (max 5 retries, comprehensive validation)                 ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │              INNER RALPH LOOPS (Per-Agent)                 ││
│  │                                                              ││
│  │  A1 ───► validate_schema() ───► code_reviewer             ││
│  │  A2 ───► validate_types() ───► code_reviewer              ││
│  │  A3 ───► validate_engine() ───► code_reviewer             ││
│  │  ...                                                            ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Configuration

### Global Settings

```yaml
ralph_loop:
  enabled: true
  max_retries: 5
  retry_delay: 1000  # milliseconds
  validation_agent: "code_reviewer"
  on_validation_failure: "retry"  # stop | retry | continue
```

### Retry Behavior

1. **First Retry**: Immediate feedback with specific errors
2. **Second Retry**: Provide code examples for fixes
3. **Third Retry**: Suggest architectural changes if needed
4. **Fourth Retry**: Escalate to orchestrator for guidance
5. **Fifth Retry**: Final attempt with comprehensive guidance
6. **Beyond 5**: Mark as failed, require manual intervention

## Validation Coverage

### 1. Code Quality

- **Syntax Validation**: No syntax errors in deliverables
- **Linting**: Passes ESLint with no errors
- **TypeScript**: Compiles successfully (if applicable)
- **SQL**: Valid SQL syntax for schemas
- **JSON**: Valid JSON structure for configurations

### 2. Documentation Completeness

- **MD Files Updated**: All documentation files updated
- **Checklists Completed**: All checklist items marked complete
- **API Docs**: API documentation for all public interfaces
- **Comments**: Inline comments for complex logic
- **Examples**: Usage examples where appropriate

### 3. Integration Points

- **Type Matching**: Types match database schemas
- **Module Contracts**: Integration contracts satisfied
- **RLS Policies**: Row Level Security policies defined
- **API Endpoints**: Endpoints match frontend expectations
- **Event Flows**: Event workflows properly connected

## Automated Build Confirmation

After each agent task completes, the Ralph Loop now automatically:

1. **Runs Validation Script** (`npm run validate`)
   - TypeScript compilation check
   - Import verification
   - ESLint validation
   - Vite dev bundle test
   - **Production build verification** (`npm run build`)

2. **Production Build Verification**
   - Verifies production bundle builds successfully
   - Confirms `dist/` directory created
   - Validates `index.html` present

3. **Only Then Marks Task Complete**
   - Task marked "COMPLETED" only if both validation AND build pass
   - On failure: task marked "FAILED" with error details
   - Orchestrator loop returns to main queue to pick next task

### Integration Points

- **RalphLoopExecutor**: Automatically calls validation after task execution
  - Falls back to script-based validation if `code_reviewer` agent unavailable
- **CI/CD**: GitHub Actions validates on every push/PR (free tier optimized)
  - Concurrency enabled to cancel in-progress runs and save minutes
- **Git Hooks**: Pre-commit hook prevents broken commits locally
- **Manual**: `npm run validate:build` for full validation + build

### Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR LOOP                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Pick Next Task      │
                └───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Execute Task        │
                └───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────┐
        │           RALPH LOOP                   │
        └───────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   ┌─────────┐      ┌──────────┐      ┌─────────────┐
   │ Validate │      │  Build   │      │  Confirm    │
   │  Script  │      │ Bundle   │      │   Running   │
   └─────────┘      └──────────┘      └─────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   ALL PASS?   │
                    └───────────────┘
                       │         │
                  Yes  │         │ No
                       ▼         ▼
              ┌──────────┐  ┌──────────┐
              │ COMPLETED │  │  FAILED  │
              │ (return  │  │ (retry   │
              │ to loop) │  │  or stop)│
              └──────────┘  └──────────┘
```

## Per-Agent Validation Rules

### A1: Database Schema Agent

**Validate**:
- [ ] SQL syntax is valid
- [ ] RLS policies defined for all tables
- [ ] Foreign key constraints are correct
- [ ] Indexes defined for performance
- [ ] Schema matches `data-model.md` specification
- [ ] Migration files are reversible
- [ ] Default values are appropriate
- [ ] Column types match TypeScript types

**Common Errors**:
- Missing RLS policies
- Incorrect foreign key references
- Missing indexes on foreign keys
- Inconsistent column naming

### A2: TypeScript Types Agent

**Validate**:
- [ ] TypeScript compiles without errors
- [ ] All types exported properly
- [ ] Types match database schema
- [ ] Generic types used appropriately
- [ ] No `any` types (unless explicitly justified)
- [ ] Null/undefined handled correctly
- [ ] Type definitions include JSDoc comments
- [ ] Enums match database enums

**Common Errors**:
- Missing type exports
- Mismatched types between DB and TS
- Incorrect use of `any`
- Missing null checks

### A3: Workflow Engine Agent

**Validate**:
- [ ] Workflow engine architecture documented
- [ ] Node interface definitions complete
- [ ] Execution engine interface defined
- [ ] Event system specifications complete
- [ ] Integration points with AI module clear
- [ ] Performance requirements documented
- [ ] Error handling strategy defined
- [ ] Test strategy documented

**Common Errors**:
- Missing interface definitions
- Unclear integration points
- Incomplete error handling
- Missing performance considerations

### A4: AI Integration Agent

**Validate**:
- [ ] Claude API client implementation complete
- [ ] Function registry defined
- [ ] Tool calling interface documented
- [ ] Event integration with workflow engine clear
- [ ] Error handling for API failures
- [ ] Rate limiting strategy defined
- [ ] Prompt template system documented
- [ ] Context management strategy clear

**Common Errors**:
- Missing error handling for API failures
- No rate limiting
- Unclear context management
- Missing function registry

### A5: Dashboard Feature Agent

**Validate**:
- [ ] Dashboard layout implementation complete
- [ ] Widget system implemented
- [ ] Data fetching via React Query
- [ ] Performance optimized (memoization, lazy loading)
- [ ] Responsive design implemented
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Integration with analytics module
- [ ] User preferences persistence

**Common Errors**:
- Missing performance optimization
- No responsive breakpoints
- Inaccessible widgets
- Missing error boundaries

### A6: CRM Feature Agent

**Validate**:
- [ ] Contact management complete
- [ ] Company management complete
- [ ] Activity tracking implemented
- [ ] Pipeline visualization functional
- [ ] Search/filter working
- [ ] Bulk operations implemented
- [ ] Integration with workflows
- [ ] Data export functionality

**Common Errors**:
- Missing RLS policies
- Incomplete validation
- No search optimization
- Missing integration hooks

### A7: Builder Feature Agent

**Validate**:
- [ ] Block editor working
- [ ] Drag-and-drop functional
- [ ] Component library complete
- [ ] Version control implemented
- [ ] Preview mode working
- [ ] Responsive breakpoints defined
- [ ] SEO metadata handling
- [ ] Custom code injection safe

**Common Errors**:
- Drag-and-drop conflicts
- Missing version history
- XSS vulnerabilities in custom code
- Breakpoint issues

### A8: Workflows Feature Agent

**Validate**:
- [ ] Visual editor (XyFlow) working
- [ ] Node palette complete
- [ ] Connection logic working
- [ ] Test execution functional
- [ ] Trigger system working
- [ ] Action library complete
- [ ] Integration with AI module
- [ ] Execution history tracking

**Common Errors**:
- Missing node types
- Connection validation missing
- No test mode
- Missing execution logs

### A9: Marketing Feature Agent

**Validate**:
- [ ] Email campaigns working
- [ ] SMS campaigns working
- [ ] Template builder complete
- [ ] Contact segmentation working
- [ ] A/B testing implemented
- [ ] Analytics integration
- [ ] Unsubscribe handling
- [ ] Compliance (CAN-SPAM, GDPR)

**Common Errors**:
- Missing unsubscribe links
- No compliance checks
- Segmentation bugs
- Missing analytics

### A10: Analytics Feature Agent

**Validate**:
- [ ] Metrics calculation correct
- [ ] Data visualization working
- [ ] Custom reports functional
- [ ] Real-time updates working
- [ ] Data aggregation efficient
- [ ] Export functionality working
- [ ] Dashboard integration
- [ ] Data retention policies

**Common Errors**:
- Incorrect aggregations
- Performance issues
- Missing timezone handling
- No data caching

## Checkpoint Validation Rules

### Phase 0: Infrastructure Setup

**Validate**:
- [ ] Database schema (A1) is complete and valid
- [ ] TypeScript types (A2) match schema
- [ ] Workflow engine design (A3) is complete
- [ ] AI integration design (A4) is complete
- [ ] All schemas compile without errors
- [ ] All TypeScript compiles without errors
- [ ] Integration contracts defined
- [ ] Documentation complete and consistent

**Integration Tests**:
- Database can be created from schema files
- TypeScript types can be generated from schema
- Workflow engine interfaces are compatible with AI module

**Performance Benchmarks**:
- Database schema creation: < 10 seconds
- TypeScript compilation: < 30 seconds
- Type generation: < 5 seconds

### Phase 1: Foundation Features

**Validate**:
- [ ] Dashboard (A5) is complete and functional
- [ ] CRM (A6) is complete and functional
- [ ] Analytics (A10) is complete and functional
- [ ] Builder (A7) design is complete
- [ ] All features integrate correctly
- [ ] No regressions in existing functionality
- [ ] All tests passing
- [ ] Documentation updated

**Integration Tests**:
- Dashboard widgets can display CRM data
- Analytics can track CRM activities
- Builder can reference CRM data
- Cross-feature navigation working

**Performance Benchmarks**:
- Dashboard load time: < 2 seconds
- CRM list view: < 1 second
- Analytics reports: < 3 seconds

### Phase 2: Automation Engine

**Validate**:
- [ ] Workflows feature (A8) is complete and functional
- [ ] AI Agents feature (from A4) is complete and functional
- [ ] Builder implementation (A7) is complete
- [ ] Workflow engine execution is working
- [ ] AI integration is functional
- [ ] All triggers and actions working
- [ ] Error handling comprehensive
- [ ] Documentation updated

**Integration Tests**:
- Workflows can automate CRM operations
- AI agents can be triggered by workflows
- Builder pages can use workflow data
- End-to-end automation scenarios working

**Performance Benchmarks**:
- Workflow execution latency: < 500ms
- AI response time: < 3 seconds
- Builder page load: < 2 seconds

### Phase 3: Marketing Features

**Validate**:
- [ ] Email campaigns working end-to-end
- [ ] SMS campaigns working end-to-end
- [ ] Template builder functional
- [ ] Segmentation working correctly
- [ ] A/B testing functional
- [ ] Compliance checks in place
- [ ] Analytics tracking working
- [ ] Documentation updated

**Integration Tests**:
- Campaigns can be triggered by workflows
- Analytics tracks campaign performance
- CRM data available for segmentation
- Unsubscribe handling working

**Performance Benchmarks**:
- Campaign send rate: > 1000/minute
- Segmentation query: < 2 seconds
- Template rendering: < 500ms

### Phase 4: Extended Features

**Validate**:
- [ ] Invoicing complete and functional
- [ ] Appointments complete and functional
- [ ] Chat widget complete and functional
- [ ] Membership module complete
- [ ] Reputation module complete
- [ ] All integrations working
- [ ] All tests passing
- [ ] Documentation updated

**Integration Tests**:
- Invoices can be generated from workflows
- Appointments integrate with CRM
- Chat history tracked in CRM
- Memberships affect feature access

**Performance Benchmarks**:
- Invoice generation: < 1 second
- Appointment booking: < 2 seconds
- Chat message latency: < 500ms

## Exit Criteria

A Ralph Loop validation passes when:

1. **No Errors**: Zero validation errors
2. **Warnings Accepted**: All warnings reviewed and either fixed or accepted
3. **Tests Pass**: All relevant tests pass
4. **Integration Verified**: All integration points verified
5. **Documentation Complete**: All documentation updated
6. **Performance Met**: Performance benchmarks met

## Failure Handling

### On Validation Failure

1. **Log Failure**: Record failure in validation history
2. **Provide Feedback**: Specific error messages and suggestions
3. **Increment Retry**: Increase attempt counter
4. **Check Limit**: If under max retries, schedule retry
5. **Escalate**: If at limit, mark as failed and notify

### Retry Strategies

- **Immediate**: For syntax errors (quick fix)
- **With Guidance**: For logic errors (provide examples)
- **With Redesign**: For architectural issues (suggest changes)
- **Manual**: For repeated failures (require human intervention)

## References

- [Coordination Guide](./coordination.md) - Agent coordination protocol
- [Integration Checkpoints](./integration-checkpoints.md) - Phase verification
- [Data Model](./data-model.md) - Database schema specification
- [Dependencies](./dependencies.md) - Module dependencies and build order
