# FlowStack Integration Checkpoints

**Document Version**: 1.0
**Last Updated**: 2026-01-26
**Maintainer**: Orchestrator Agent

## Phase Completion Verification

This document defines the integration checkpoints for each build phase. All checkpoints must be verified and signed off by the relevant agents before proceeding to the next phase.

---

## Phase 0: Infrastructure Setup

**Goal**: Complete foundation for all agents to begin work
**Duration**: 1 week
**Dependencies**: None

### Checklist

#### Database Schema Agent (A1)

- [ ] All 7 schema files reviewed and validated
- [ ] Schema consistency verified (naming conventions, data types)
- [ ] RLS policies tested on all tables
- [ ] Indexes optimized for common query patterns
- [ ] Helper functions tested (`log_agent_execution`, `get_agent_execution_stats`)
- [ ] Migration script created and tested
- [ ] Database documented in `data-model.md`

**Ralph Loop Validation**:
- [ ] SQL syntax is valid (no syntax errors)
- [ ] RLS policies defined for all tables
- [ ] Foreign key constraints are correct
- [ ] Indexes defined for performance
- [ ] Schema matches `data-model.md` specification
- [ ] Migration files are reversible
- [ ] Default values are appropriate
- [ ] Column types match TypeScript types

**Deliverables**:
- Clean, validated SQL schemas in `E:\FlowStack\db\`
- Migration script in `E:\FlowStack\db\migrate.sql`
- Updated `data-model.md` with any changes

---

#### TypeScript Types Agent (A2)

- [ ] Complete TypeScript types generated for all 23 tables
- [ ] `src/types/database.types.ts` includes Row/Insert/Update for all tables
- [ ] JSONB column types properly defined
- [ ] Enum types extracted (status, role, agent_type, etc.)
- [ ] `src/types/index.ts` created for clean imports
- [ ] Type exports validated with `tsc --noEmit`
- [ ] Helper types added (common query patterns)

**Ralph Loop Validation**:
- [ ] TypeScript compiles without errors
- [ ] All types exported properly
- [ ] Types match database schema
- [ ] Generic types used appropriately
- [ ] No `any` types (unless explicitly justified)
- [ ] Null/undefined handled correctly
- [ ] Type definitions include JSDoc comments
- [ ] Enums match database enums

**Deliverables**:
- Complete `src/types/database.types.ts`
- New `src/types/index.ts` with barrel exports
- Type validation passing

---

#### Workflow Engine Agent (A3)

- [ ] Workflow execution architecture designed
- [ ] Action registration interface defined
- [ ] Trigger system designed
- [ ] Integration points with Supabase Edge Functions planned
- [ ] Error handling strategy defined
- [ ] Workflow state management designed
- [ ] Testing strategy documented

**Ralph Loop Validation**:
- [ ] Workflow engine architecture documented
- [ ] Node interface definitions complete
- [ ] Execution engine interface defined
- [ ] Event system specifications complete
- [ ] Integration points with AI module clear
- [ ] Performance requirements documented
- [ ] Error handling strategy defined
- [ ] Test strategy documented

**Deliverables**:
- Architecture document in `src/lib/workflows/README.md`
- Interface definitions in `src/lib/workflows/types.ts`
- Registration scaffold in `src/lib/workflows/registry.ts`

---

#### AI Integration Agent (A4)

- [ ] Claude API client architecture designed
- [ ] Function registry system designed
- [ ] Agent-to-agent communication protocol defined
- [ ] Authentication strategy (API key management) documented
- [ ] Cost monitoring strategy defined
- [ ] Error handling and retry logic designed
- [ ] Integration with workflow engine planned

**Ralph Loop Validation**:
- [ ] Claude API client implementation complete
- [ ] Function registry defined
- [ ] Tool calling interface documented
- [ ] Event integration with workflow engine clear
- [ ] Error handling for API failures
- [ ] Rate limiting strategy defined
- [ ] Prompt template system documented
- [ ] Context management strategy clear

**Deliverables**:
- Architecture document in `src/lib/ai/README.md`
- Client scaffold in `src/lib/ai/client.ts`
- Function registry in `src/lib/ai/functions/registry.ts`

---

### Phase 0 Integration Tests

- [ ] All agents can import and use shared types
- [ ] Database schemas can be applied via migration script
- [ ] Workflow engine interfaces are defined for feature agents
- [ ] AI function registry is ready for feature agent registration
- [ ] No circular dependencies between infrastructure components

**Sign-off Required**:
- [ ] A1 (Schema Agent)
- [ ] A2 (Types Agent)
- [ ] A3 (Workflow Agent)
- [ ] A4 (AI Agent)
- [ ] Orchestrator

---

## Phase 1: Foundation Features

**Goal**: Complete core modules (dashboard, CRM, analytics, builder)
**Duration**: 6-8 weeks
**Dependencies**: Phase 0 complete

### Checklist

#### Dashboard Agent (A5)

- [ ] Widget library implemented (stats, charts, activity feeds)
- [ ] Dashboard layout system complete
- [ ] Widget drag-and-drop arrangement
- [ ] Real-time data refresh with React Query
- [ ] Widget configuration UI
- [ ] Dashboard templates (pre-built layouts)
- [ ] Integration with CRM data
- [ ] Integration with Analytics data
- [ ] Responsive design tested
- [ ] Performance optimized (lazy loading, caching)

**Deliverables**:
- `src/features/dashboard/widgets/` with widget library
- `src/features/dashboard/DashboardPage.tsx` with full functionality
- Widget components tested and documented

---

#### CRM Agent (A6)

- [ ] Contact list view with search and filter
- [ ] Contact detail view with activity timeline
- [ ] Contact create/edit forms with validation
- [ ] Company list view with search and filter
- [ ] Company detail view with contact list
- [ ] Company create/edit forms
- [ ] Bulk operations (import, export, delete)
- [ ] Advanced filtering (tags, custom fields)
- [ ] Activity logging (notes, emails, calls)
- [ ] Integration with workflows (triggers)
- [ ] Integration with marketing (campaign targeting)
- [ ] RLS tested (users see only their org's data)

**Deliverables**:
- Complete `src/features/crm/` module
- Contact and company CRUD operations
- Activity tracking system
- Integration with workflow triggers

---

#### Analytics Agent (A10)

- [ ] Reporting engine implemented
- [ ] Chart library integration (Recharts/Chart.js)
- [ ] Data aggregation queries optimized
- [ ] Custom report builder
- [ ] Pre-built report templates
- [ ] Export functionality (PDF, CSV)
- [ ] Real-time dashboard widgets
- [ ] Date range filtering
- [ ] Drill-down capabilities
- [ ] Performance optimization (query caching)

**Deliverables**:
- `src/features/analytics/` module with reporting engine
- Chart components library
- Pre-built report templates
- Integration with dashboard widgets

---

#### Builder Agent (A7)

- [ ] Drag-and-drop canvas with @dnd-kit
- [ ] Block library (hero, sections, forms, etc.)
- [ ] Block property editor panels
- [ ] Page creation and editing
- [ ] Page publishing flow
- [ ] Preview mode
- [ ] Version history (undo/redo with Zustand)
- [ ] Site management (create, configure)
- [ ] Funnel step linking
- [ ] SEO settings
- [ ] Responsive preview
- [ ] Custom domain configuration

**Deliverables**:
- Complete `src/features/builder/` module
- Block library with 10+ block types
- Page publishing system
- Integration with Supabase Storage for assets

---

### Phase 1 Integration Tests

#### Cross-Module Integration

- [ ] Dashboard displays CRM data (contact stats, company counts)
- [ ] Dashboard displays Analytics data (charts, reports)
- [ ] CRM triggers workflows on contact create/update
- [ ] CRM data available for Analytics reports
- [ ] Builder pages can embed CRM forms
- [ ] Builder pages can include Analytics tracking

#### Data Flow Verification

- [ ] Contact created in CRM appears in dashboard widget
- [ ] Analytics report includes CRM data
- [ ] Workflow triggered by CRM action executes
- [ ] Builder form submission creates CRM contact
- [ ] All modules respect organization scoping (RLS)

#### Performance Tests

- [ ] Dashboard loads in < 2 seconds
- [ ] Contact list handles 1000+ records
- [ ] Analytics queries complete in < 3 seconds
- [ ] Builder canvas remains responsive with 50+ blocks

**Sign-off Required**:
- [ ] A5 (Dashboard Agent)
- [ ] A6 (CRM Agent)
- [ ] A7 (Builder Agent)
- [ ] A10 (Analytics Agent)
- [ ] A3 (Workflow Agent - integration verification)
- [ ] Orchestrator

---

## Phase 2: Automation Engine

**Goal**: Complete workflow automation and AI agents
**Duration**: 6-7 weeks
**Dependencies**: Phase 1 complete

### Checklist

#### Workflow Engine Agent (A3)

- [ ] Visual workflow builder with @xyflow/react
- [ ] Node library (triggers, actions, conditions)
- [ ] Node configuration panels
- [ ] Trigger configuration UI
- [ ] Workflow execution engine
- [ ] Workflow testing/debugging mode
- [ ] Execution history view
- [ ] Workflow templates
- [ ] Error handling and retry logic
- [ ] Scheduled workflow execution
- [ ] Webhook trigger handling
- [ ] Integration with Supabase Edge Functions

**Deliverables**:
- Complete `src/features/workflows/` module
- Execution engine in `src/lib/workflows/engine.ts`
- Trigger system in `src/lib/workflows/triggers/`
- Action registry with 20+ actions

---

#### AI Integration Agent (A4)

- [ ] Claude API client implementation
- [ ] Function registration system
- [ ] Agent execution framework
- [ ] Orchestrator agent implementation
- [ ] Specialized agents (CRM, Marketing, Analytics, Builder)
- [ ] Agent-to-agent communication
- [ ] Cost tracking and monitoring
- [ ] Error handling and retry logic
- [ ] Integration with workflow engine
- [ ] Agent execution logging to database
- [ ] API key management (organization-scoped)

**Deliverables**:
- Complete `src/lib/ai/` module
- AI agents in `src/lib/ai/agents/`
- Function registry with 30+ functions
- Integration with workflow execution engine
- Execution tracking in database

---

#### Workflows Agent (A8)

- [ ] Workflow list view with filtering
- [ ] Workflow detail view
- [ ] Workflow create/edit flows
- [ ] Workflow template library
- [ ] Workflow testing interface
- [ ] Execution history view
- [ ] Workflow import/export
- [ ] Integration with all feature modules
- [ ] Workflow permissions (owner/admin only)

**Deliverables**:
- Complete `src/features/workflows/` UI
- Workflow template library (10+ templates)
- Integration with all Phase 1 modules

---

### Phase 2 Integration Tests

#### Workflow Engine Integration

- [ ] CRM triggers fire workflows correctly
- [ ] Workflow actions create/update CRM records
- [ ] Scheduled workflows execute on time
- [ ] Webhook triggers receive external events
- [ ] Workflow execution logged to database
- [ ] Error workflows handled gracefully

#### AI Agent Integration

- [ ] AI agents callable from workflows
- [ ] AI agents can access CRM data
- [ ] AI agents can trigger marketing campaigns
- [ ] AI agents can generate analytics reports
- [ ] AI agents can build pages (basic)
- [ ] Agent execution logged to database
- [ ] Agent costs tracked per organization

#### Cross-Module Automation

- [ ] Contact created → AI agent enriches data
- [ ] Deal stage changed → AI agent sends follow-up
- [ ] Campaign sent → AI agent analyzes results
- [ ] Page published → AI agent suggests SEO
- [ ] Analytics threshold → AI agent creates task

#### Performance Tests

- [ ] Workflow execution completes in < 5 seconds
- [ ] AI agent response time < 10 seconds
- [ ] 100 concurrent workflow executions handled
- [ ] Workflow execution history queries < 1 second

**Sign-off Required**:
- [ ] A3 (Workflow Engine Agent)
- [ ] A4 (AI Integration Agent)
- [ ] A8 (Workflows Agent)
- [ ] A6 (CRM Agent - integration verification)
- [ ] A9 (Marketing Agent - integration verification)
- [ ] Orchestrator

---

## Phase 3: Marketing Features

**Goal**: Complete email/SMS marketing and chat widget
**Duration**: 4-5 weeks
**Dependencies**: Phase 2 complete

### Checklist

#### Marketing Agent (A9)

- [ ] Email campaign builder
- [ ] Email template editor with rich text
- [ ] Campaign scheduling
- [ ] Audience builder (segmentation)
- [ ] Campaign execution engine
- [ ] Delivery tracking (Resend integration)
- [ ] Open/click tracking
- [ ] A/B testing
- [ ] SMS campaign builder
- [ ] SMS template editor
- [ ] Two-way messaging (Twilio integration)
- [ ] SMS delivery tracking
- [ ] Automation triggers (from workflows)
- [ ] Campaign analytics and reporting

**Deliverables**:
- Complete `src/features/marketing/` module
- Email delivery integration (Resend)
- SMS delivery integration (Twilio)
- Integration with workflow triggers
- Campaign analytics dashboard

---

#### Chat Widget Agent (A11)

- [ ] Chat widget UI component
- [ ] AI chatbot integration
- [ ] Widget configuration panel
- [ ] Embed code generator
- [ ] Chat history logging
- [ ] Agent handoff (human takeover)
- [ ] Integration with CRM (contact linking)
- [ ] Customization options (colors, branding)
- [ ] Multi-language support

**Deliverables**:
- Chat widget component library
- Admin panel in `src/features/chat-widget/`
- Integration with AI agents
- Embed script for external sites

---

### Phase 3 Integration Tests

#### Marketing Integration

- [ ] Campaigns target CRM contacts
- [ ] Campaign triggers from workflows
- [ ] Campaign results logged to CRM
- [ ] AI agents generate campaign content
- [ ] Analytics track campaign performance
- [ ] Chat widget captures leads to CRM

#### Automation Scenarios

- [ ] New contact → Welcome email sequence
- [ ] Abandoned cart → Recovery SMS
- [ ] Form submission → AI chatbot follow-up
- [ ] Campaign sent → AI analyzes performance
- [ ] Chat conversation → Creates CRM contact

#### Performance Tests

- [ ] Campaign sends to 10,000 contacts in < 5 minutes
- [ ] Chat widget responds in < 2 seconds
- [ ] Campaign analytics queries < 1 second

**Sign-off Required**:
- [ ] A9 (Marketing Agent)
- [ ] A11 (Chat Widget Agent)
- [ ] A4 (AI Agent - integration verification)
- [ ] A6 (CRM Agent - integration verification)
- [ ] Orchestrator

---

## Phase 4: Extended Features

**Goal**: Complete remaining modules (invoicing, appointments, phone, memberships, reputation, social)
**Duration**: 6-8 weeks
**Dependencies**: Phase 3 complete

### Checklist (Per Module)

Each module should complete:

- [ ] CRUD operations implemented
- [ ] List/detail views
- [ ] Search and filtering
- [ ] Integration with dependencies
- [ ] Workflow triggers defined
- [ ] AI agent functions registered
- [ ] Analytics tracking
- [ ] RLS tested
- [ ] Performance optimized
- [ ] Documentation complete

### Modules

#### Invoicing Agent
- [ ] Invoice creation and management
- [ ] Payment processing (Stripe)
- [ ] Invoice templates
- [ ] Payment reminders
- [ ] Integration with CRM (contacts/companies)
- [ ] Integration with workflows

#### Appointments Agent
- [ ] Calendar booking interface
- [ ] Availability management
- [ ] Appointment reminders
- [ ] Calendar sync (Google/Outlook)
- [ ] Integration with CRM (contacts)
- [ ] Integration with workflows

#### Phone System Agent
- [ ] VoIP calling interface
- [ ] Call recording
- [ ] Call tracking
- [ ] Integration with CRM (contact linking)
- [ ] Call analytics

#### Membership Agent
- [ ] Gated content access
- [ ] Course delivery
- [ ] Member area pages
- [ ] Subscription management
- [ ] Integration with builder
- [ ] Integration with invoicing

#### Reputation Agent
- [ ] Review aggregation
- [ ] Review requests
- [ ] Rating display
- [ ] Integration with CRM

#### Social Planner Agent
- [ ] Social media scheduling
- [ ] Content calendar
- [ ] Post templates
- [ ] Multi-platform posting
- [ ] Analytics integration

---

### Phase 4 Integration Tests

- [ ] All modules integrate with CRM
- [ ] All modules trigger workflows
- [ ] All modules have AI agent functions
- [ ] All modules track analytics
- [ ] All modules respect RLS
- [ ] Full platform smoke test (user journey)

**Sign-off Required**:
- [ ] All Phase 4 agents
- [ ] A3 (Workflow Agent)
- [ ] A4 (AI Agent)
- [ ] A6 (CRM Agent)
- [ ] A10 (Analytics Agent)
- [ ] Orchestrator

---

## Final Integration Checkpoint

**Goal**: Full platform verification
**Duration**: 1 week

### Complete Platform Testing

#### User Journey Tests

- [ ] New user signup flow
- [ ] Organization creation
- [ ] First contact added
- [ ] First campaign sent
- [ ] First workflow created
- [ ] First AI agent interaction
- [ ] First page built
- [ ] First invoice created
- [ ] First appointment booked
- [ ] Full multi-module scenario

#### Performance Tests

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms (p95)
- [ ] Database query time < 100ms (p95)
- [ ] Workflow execution < 5 seconds
- [ ] AI agent response < 10 seconds
- [ ] Support for 100 concurrent users

#### Security Tests

- [ ] RLS policies tested on all tables
- [ ] No cross-organization data leakage
- [ ] API keys properly scoped
- [ ] Authentication flow secure
- [ ] XSS vulnerabilities tested
- [ ] CSRF protection tested

#### Documentation Tests

- [ ] All modules documented
- [ ] API documentation complete
- [ ] Workflow templates documented
- [ ] AI agent functions documented
- [ ] Integration guides complete

---

## Sign-off Process

### Phase Completion Criteria

1. **All checklist items completed**
2. **Integration tests passing**
3. **Performance benchmarks met**
4. **Security tests passed**
5. **Documentation updated**
6. **Code reviewed by peers**
7. **Orchestrator approval**

### Sign-off Template

```markdown
## Phase X Sign-off

**Phase**: X
**Date**: YYYY-MM-DD
**Agents Involved**: [List]

### Completed
- [x] All checklist items
- [x] Integration tests passing
- [x] Performance benchmarks met
- [x] Security tests passed

### Issues Found
1. [Description]
2. [Description]

### Resolutions
1. [How resolved]
2. [How resolved]

### Next Steps
- [ ] Proceed to Phase X+1
- [ ] Address remaining issues

### Agent Signatures
- [ ] Agent A1: _________
- [ ] Agent A2: _________
- [ ] Orchestrator: _________
```

---

## Ralph Loop Validation

All phases must pass Ralph Loop validation before sign-off. The Ralph Loop is a two-layer validation pattern that ensures all agent work is error-free.

### Per-Agent Ralph Loop (Inner Loop)

Each agent must validate their own work before marking complete:

- [ ] Inner Ralph loop: Self-validated work
- [ ] Code quality: No syntax errors
- [ ] Linting: ESLint passes with no errors
- [ ] TypeScript: Compiles successfully (if applicable)
- [ ] SQL: Valid syntax (for A1)
- [ ] Documentation: MD files updated
- [ ] Checklists: All items completed
- [ ] Integration points: Validated

**Validation Command**:
```bash
./.orchestrator/scripts/validate-agent.sh <AGENT_ID>
```

### Checkpoint Ralph Loop (Outer Loop)

The orchestrator validates the entire phase before sign-off:

- [ ] All agents in phase passed inner Ralph loop
- [ ] Code reviewer approved all agent work
- [ ] Integration tests passing
- [ ] Performance benchmarks met
- [ ] Documentation complete and consistent
- [ ] No unresolved errors
- [ ] Max 5 retries not exceeded

**Validation Command**:
```bash
./.orchestrator/scripts/validate-checkpoint.sh <PHASE> "<AGENTS>"
```

### Ralph Loop Validation Items for Each Phase

#### Phase 0: Infrastructure Setup

**Agents**: A1, A2, A3, A4

```bash
./.orchestrator/scripts/validate-checkpoint.sh 0 "A1 A2 A3 A4"
```

- [ ] A1 (Database Schema): SQL syntax valid, RLS policies complete, indexes optimized
- [ ] A2 (TypeScript Types): Types compile, match schema, exports correct
- [ ] A3 (Workflow Engine): Architecture complete, interfaces defined, integration planned
- [ ] A4 (AI Integration): Architecture complete, registry designed, protocol defined
- [ ] Database can be created from schema files
- [ ] TypeScript types can be generated from schema
- [ ] Integration contracts defined

#### Phase 1: Foundation Features

**Agents**: A5, A6, A10, A7

```bash
./.orchestrator/scripts/validate-checkpoint.sh 1 "A5 A6 A10 A7"
```

- [ ] A5 (Dashboard): Layout working, widgets functional, performance optimized
- [ ] A6 (CRM): Contact/company management complete, pipeline working, search functional
- [ ] A10 (Analytics): Metrics correct, visualizations working, aggregation efficient
- [ ] A7 (Builder): Design complete, components planned, version control designed
- [ ] Cross-feature integration working
- [ ] No regressions in existing functionality
- [ ] All tests passing

#### Phase 2: Automation Engine

**Agents**: A8, A4, A7

```bash
./.orchestrator/scripts/validate-checkpoint.sh 2 "A8 A4 A7"
```

- [ ] A8 (Workflows): Visual editor working, execution engine functional, triggers/actions complete
- [ ] A4 (AI Integration): API client working, function registry complete, integration functional
- [ ] A7 (Builder): Implementation complete, drag-drop working, version control functional
- [ ] Workflow automation end-to-end working
- [ ] AI agents responding correctly
- [ ] Error handling comprehensive
- [ ] Performance benchmarks met

#### Phase 3: Marketing Features

**Agents**: A9

```bash
./.orchestrator/scripts/validate-checkpoint.sh 3 "A9"
```

- [ ] A9 (Marketing): Email/SMS campaigns working, templates functional, segmentation working
- [ ] Campaigns can be triggered by workflows
- [ ] Compliance checks in place
- [ ] Analytics tracking working
- [ ] Unsubscribe handling working
- [ ] Performance benchmarks met

#### Phase 4: Extended Features

**Agents**: (TBD based on implementation)

```bash
./.orchestrator/scripts/validate-checkpoint.sh 4 "<AGENTS>"
```

- [ ] All extended features working
- [ ] Integration with core features working
- [ ] No regressions
- [ ] Performance benchmarks met
- [ ] All tests passing

### Ralph Loop Exit Criteria

A Ralph Loop validation passes when:

1. **No Errors**: Zero validation errors
2. **Warnings Accepted**: All warnings reviewed and either fixed or accepted
3. **Tests Pass**: All relevant tests pass
4. **Integration Verified**: All integration points verified
5. **Documentation Complete**: All documentation updated
6. **Performance Met**: Performance benchmarks met

### Ralph Loop Failure Handling

1. **Log Failure**: Record failure in validation history
2. **Provide Feedback**: Specific error messages and suggestions
3. **Increment Retry**: Increase attempt counter
4. **Check Limit**: If under max retries (5), schedule retry
5. **Escalate**: If at limit, mark as failed and require manual intervention

### References

- [Ralph Loop Configuration](./ralph-loop.md) - Full configuration and rules
- [Code Reviewer Agent](./agents/CodeReviewerAgent.md) - Validation agent specification

---

## Continuous Integration

### Automated Checks (Recommended)

- [ ] ESLint passes on all commits
- [ ] TypeScript compilation passes
- [ ] Unit tests pass (Jest/Vitest)
- [ ] Integration tests pass (Playwright)
- [ ] Database migrations tested
- [ ] RLS policies tested
- [ ] Performance benchmarks checked

### Pre-commit Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit

npm run lint
npm run type-check
npm run test:unit
npm run migration-check
```

---

## Summary

### Critical Checkpoints

1. **Phase 0**: Infrastructure foundation (types, schemas, engines)
2. **Phase 1**: Core features (dashboard, CRM, analytics, builder)
3. **Phase 2**: Automation (workflows, AI agents)
4. **Phase 3**: Marketing (email, SMS, chat)
5. **Phase 4**: Extended features (invoicing, appointments, etc.)
6. **Final**: Full platform verification

### Success Metrics

- All integration tests passing
- Performance benchmarks met
- Security validated
- Documentation complete
- All agents signed off

### Risk Mitigation

- Each phase has clear exit criteria
- Integration tests catch issues early
- Performance tests prevent regression
- Sign-off process ensures quality
- Rollback plan for each phase

---

**Document Maintainer**: Orchestrator Agent
**Last Updated**: 2026-01-26
**Next Review**: After each phase completion
