# FlowStack Orchestration Center

This directory contains the central coordination documentation for the FlowStack multi-agent build system. All agents should reference these documents before starting work.

## Documents

### 1. [coordination.md](./coordination.md) - Master Orchestration Document
**Primary reference for all agents**

Contains:
- Current architecture state
- Agent assignment matrix (who owns what)
- Module dependency graph
- Integration contract between agents
- Data model summary
- Feature gap analysis
- Development workflow
- Next steps for each agent

**Read first**: This is your starting point

---

### 2. [data-model.md](./data-model.md) - Complete Database Schema Documentation
**Maintainer**: Database Schema Agent (A1)

Contains:
- All 23 tables across 7 schemas documented
- Column definitions with types and constraints
- RLS policies for each table
- Relationship mappings
- JSONB structure definitions
- Index strategy
- Helper functions
- Type generation requirements

**Read when**: You need to understand database structure or plan queries

---

### 3. [dependencies.md](./dependencies.md) - Module Dependencies and Build Order
**Maintainer**: Orchestrator Agent

Contains:
- Visual dependency graph (Mermaid)
- Core vs extended modules
- Direct and transitive dependencies
- Build order recommendations (4 phases)
- Parallel development opportunities
- Critical path analysis
- Risk assessment
- Module enable/disable logic

**Read when**: You need to understand what you can work on in parallel

---

### 4. [integration-checkpoints.md](./integration-checkpoints.md) - Phase End Verification
**Maintainer**: Orchestrator Agent

Contains:
- Phase 0-4 completion checklists
- Integration tests for each phase
- Sign-off process
- Performance benchmarks
- Security tests
- Continuous integration setup

**Read when**: Approaching a phase milestone

---

### 5. [ralph-loop.md](./ralph-loop.md) - Ralph Loop Validation Configuration
**Maintainer**: Code Reviewer Agent (A0)

Contains:
- Two-layer validation pattern (inner/outer loops)
- Per-agent validation rules
- Checkpoint validation rules
- Validation coverage (code quality, documentation, integration)
- Configuration and retry behavior
- Exit criteria and failure handling

**Read when**: Validating agent work or phase checkpoints

**Related**:
- [agents/CodeReviewerAgent.md](./agents/CodeReviewerAgent.md) - Code reviewer agent specification
- [types/ralph-loop.ts](./types/ralph-loop.ts) - TypeScript type definitions
- [executors/RalphLoopExecutor.ts](./executors/RalphLoopExecutor.ts) - Executor implementation
- [scripts/validate-agent.sh](./scripts/validate-agent.sh) - Per-agent validation script
- [scripts/validate-checkpoint.sh](./scripts/validate-checkpoint.sh) - Checkpoint validation script

---

## Quick Reference

### Agent Assignments

| Agent | Focus | Key Docs |
|-------|-------|----------|
| **A1** | Database Schema | data-model.md |
| **A2** | TypeScript Types | data-model.md, coordination.md |
| **A3** | Workflow Engine | coordination.md, integration-checkpoints.md |
| **A4** | AI Integration | coordination.md, integration-checkpoints.md |
| **A5** | Dashboard | dependencies.md, integration-checkpoints.md |
| **A6** | CRM | data-model.md, dependencies.md |
| **A7** | Builder | dependencies.md, integration-checkpoints.md |
| **A8** | Workflows | dependencies.md, integration-checkpoints.md |
| **A9** | Marketing | data-model.md, dependencies.md |
| **A10** | Analytics | dependencies.md, integration-checkpoints.md |

### Build Phases

**Phase 0** (1 week): Infrastructure setup
- A1: Validate schemas
- A2: Generate all types
- A3: Design workflow engine
- A4: Design AI integration

**Phase 1** (6-8 weeks): Foundation
- A5: Dashboard
- A6: CRM
- A7: Site Builder
- A10: Analytics

**Phase 2** (6-7 weeks): Automation
- A3, A8: Workflow engine
- A4: AI agents

**Phase 3** (4-5 weeks): Marketing
- A9: Email/SMS marketing
- A11: Chat widget

**Phase 4** (6-8 weeks): Extended features
- Invoicing, appointments, phone, memberships, reputation, social

### Critical Path

```
dashboard (2w) → crm (3w) → workflows (4w) → ai_agents (3w)
    Total: 12 weeks minimum
```

### Communication Protocol

1. **Daily**: Update status in coordination.md
2. **Blockers**: Highlight in red, notify dependent agents
3. **Phase completion**: All agents sign off in integration-checkpoints.md
4. **Documentation**: Keep all docs current

---

## Getting Started

### For New Agents

1. Read `coordination.md` completely
2. Review `dependencies.md` for your module
3. Check `data-model.md` for database structure
4. Review `integration-checkpoints.md` for your phase
5. Claim your tasks in the relevant documents
6. Start work!

### For Existing Agents

1. Check `coordination.md` for latest status
2. Review `integration-checkpoints.md` for phase progress
3. Update your task status in `coordination.md`
4. Notify dependent agents of blockers
5. Keep documentation current

---

## File Structure

```
.orchestrator/
├── README.md                    # This file
├── coordination.md              # Master coordination doc
├── data-model.md                # Complete database docs
├── dependencies.md              # Module dependencies
├── integration-checkpoints.md   # Phase verification
├── ralph-loop.md                # Ralph Loop validation configuration
├── agents/
│   └── CodeReviewerAgent.md     # Code reviewer agent specification
├── types/
│   └── ralph-loop.ts            # Ralph Loop TypeScript types
├── executors/
│   └── RalphLoopExecutor.ts     # Ralph Loop executor implementation
└── scripts/
    ├── validate-agent.sh        # Per-agent validation script
    └── validate-checkpoint.sh   # Checkpoint validation script
```

---

## Updates

All agents should:
- Keep documentation current
- Update status changes
- Document breaking changes
- Notify team of dependencies

**Last Updated**: 2026-01-26
**Orchestrator**: Infrastructure Coordination Agent
