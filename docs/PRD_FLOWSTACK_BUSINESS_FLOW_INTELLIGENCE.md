# PRD: FlowStack Business Flow Intelligence Layer

## Status

Draft for product direction and technical alignment.

## One-Line Positioning

FlowStack turns a business flow into intelligible, improvable, and ownable software.

## Product Thesis

Businesses are no longer operating inside one application. They are spread across SaaS tools, local projects, cloud projects, AI coding agents, workflow engines, CRMs, LLM subscriptions, browser-based builders, connector platforms, and custom scripts. The problem is not that any one of those tools is bad. The problem is that nobody can see how the whole business stack behaves, where work needs help, where money leaks, where agents are wasting effort, or where the company should build and own the small piece of software it actually needs.

FlowStack is the authorized abstraction and intelligence layer above that stack.

It observes what a customer explicitly connects, scans, wraps, or permits. It builds a living registry of tools, projects, agents, workflows, customer touchpoints, events, costs, and dependencies. It detects business gaps. Then it recommends the best next action: keep the tool, improve the tool, connect it differently, add an agent, build a fallback, or create owned software in the customer's repo/cloud/account.

FlowStack does not ask the business to rebuild around a new operating system. It adds knowledge, continuity, and translation over the existing stack so the business can keep moving while the AI/tooling market changes underneath it.

In local mode, FlowStack can start at the parent workspace level: a drive, company folder, Git organization, cloud account, or approved project root. From there it can see when a business is being run inside Paperclip, when the same repo is being changed through VS Code or another agent outside Paperclip, and when sibling company folders or projects exist but have not been registered into any operating layer.

FlowStack is not replacement-first. It is elevation-first.

FlowStack should also carry a calm market message: stop trying to personally keep up with every AI tool. The AI market will keep changing, and something new will always look faster, cheaper, or smarter. The business should not be forced to rebuild its operating reality every time the tool market moves.

FlowStack helps the customer own the flow while the stack changes.

The analogy is the first business computer and every upgrade after it. Companies did not buy computers because they wanted to chase hardware forever. They bought them because the computer became the durable place where work could be organized, extended, and upgraded. FlowStack should play that role for the AI-native business stack: the stable abstraction layer that understands what is changing, what matters, and what should be modularized before the business gets trapped again.

The stack will always change. FlowStack should flow with the customer, not against them.

## Problem

Companies are entering a hybrid operations world:

- Teams use many SaaS tools but only need a small fraction of each.
- AI agents are being used by employees without a clear operating picture.
- Developers are moving from single-task coding to managing teams of agents.
- Local machines contain many projects, experiments, repos, agent harnesses, and half-finished systems.
- Each orchestrator only sees its own world. Paperclip may know one autonomous company, Archon may know one workflow, VS Code may know one repo, and a SaaS may know one funnel, while the actual business spans all of them.
- Operators create new folders, repos, businesses, and experiments faster than they register them. Work starts outside the official flow, then causes duplicated effort, stale Git state, unclear ownership, and conflicting agent activity.
- Businesses are being asked to choose an agentic OS, harness, orchestration layer, builder, or workflow platform before they understand the switching cost.
- When a company moves from one harness or stack to another, the old context, decisions, agent work, deployment patterns, and integration knowledge often stay trapped in the previous tool.
- Hosting and publishing stacks split across GitHub, Netlify, Vercel, Railway, Supabase, GoHighLevel, HubSpot, and other systems often cannot communicate cleanly without manual glue.
- SaaS funnels, forms, and integrations can lose signal silently until revenue or trust is already affected.
- LLM and agent usage creates cost, token, context, and rate-limit problems that managers cannot see.
- Businesses want ownership, but they do not know what should be owned, rented, improved, or removed.

Existing tools solve slices:

- SaaS management tools discover SaaS spend and shadow apps.
- Agent observability tools track model calls, cost, traces, and sessions.
- Internal developer portals catalog services, ownership, and dependencies.
- Process mining tools analyze enterprise workflows.
- AI app builders generate software from prompts.
- Connector platforms authenticate agents into external tools.
- Memory tools preserve a developer's local AI context.

FlowStack combines the missing business loop:

1. Understand the actual business stack.
2. Detect the operational gap.
3. Recommend a practical fix.
4. Act through the tools already present.
5. Build owned software only when ownership is the better answer.

## Target Users

### Primary

AI-forward business owners, agencies, consultants, operators, and small-to-mid-market companies that already use multiple SaaS tools and AI systems.

They are not asking for another generic CRM. They are asking:

- What do we own?
- What are we paying for?
- Where are leads, calls, or workflows falling through?
- Which AI tools and agents are being used?
- Which pieces should stay in SaaS?
- Which pieces should we build ourselves?
- Can someone use AI to build the 5 percent we actually need?

### Secondary

Senior developers, technical founders, AI operators, and internal platform leads moving from hands-on component work to agent-team management.

Their workflow is shifting from:

> "I need to program this component."

to:

> "I need to define the feature, assemble the right agent team, provide context, monitor execution, review outputs, and ship the complete slice."

FlowStack should support that operating model.

## Product Principles

### 1. Authorized Observation Only

FlowStack only observes what the customer connects, wraps, scans, imports, or explicitly permits. Read-only should be the default posture.

### 2. Elevate Before Replacing

FlowStack should first improve the existing stack. If a customer uses Replit, Zapier, Composio, HubSpot, GoHighLevel, Vapi, n8n, Archon, or Claude Code, FlowStack should leverage that tool rather than assume replacement.

### 2A. Own the Flow, Not the Hype Cycle

FlowStack should not promise that a customer can keep up with every AI launch, framework, harness, agent OS, model, or workflow trend. They cannot, and they should not have to.

The promise is different:

- own the business
- own the context
- own the flow
- keep useful tools
- swap tools when they stop fitting
- modularize the parts that matter
- build owned slices when renting becomes wasteful or restrictive

FlowStack uses AI to keep ahead of AI, but the customer-facing value is stability, choice, and continuity.

### 3. Ownership When It Matters

When a SaaS is expensive, fragile, blocked, or overbuilt for the customer's actual need, FlowStack can propose and build a smaller owned replacement.

### 4. Human-in-the-Layer

Agents may analyze, recommend, configure, and build, but consequential writes require approval. The user should see what FlowStack noticed, why it matters, and what it plans to do.

### 5. Business Gaps Beat Technical Logs

The main output should not be raw traces. The main output should be business meaning:

- "This funnel failed for 19 leads."
- "These calls were not answered."
- "This provider limit is causing failed follow-up."
- "This component pattern is being rewritten across 4 projects."
- "This subscription is used for one feature that can be owned."

### 6. Agnostic by Design

FlowStack should not care whether the customer uses cloud SaaS, local tools, agent harnesses, hosted app builders, code repos, or manual workflows. It should normalize all of them into one business-flow registry.

## Structure-First Audit Layer

FlowStack's agnostic layer is structure-first, not framework-first. The first audit question is how the approved workspace structure is organized and where the flow appears not flowing or disconnected, not whether the customer chose a specific framework or language.

Primary structure signals come from approved workspace structure: project roots, dot folders, manifests, context files, deployment markers, package manager markers, and documentation markers. These signals help FlowStack form a directional estimate of what exists, how work is grouped, and where handoffs may be unclear.

Frameworks and languages are secondary implementation signals. They can help explain how a project is built, but they should not drive the audit posture or imply that FlowStack prefers one stack over another.

For the public MVP, audit intake remains form-only. Optional structure snapshots are post-MVP, permissioned, file-list/marker-name first, and directional until human review. FlowStack must not claim to read customer files, repos, or local workspaces in the public MVP unless that access has been explicitly granted in a later product path.

### 7. Verified Does Not Mean Bought

FlowStack may support a provider network, but recommendation trust is sacred. A provider can pay to be verified, listed, integrated, or supported more deeply, but cannot buy a recommendation that does not fit the customer's flow.

FlowStack recommendations must remain based on:

- fit to the customer's current stack
- cost impact
- implementation friction
- reliability
- freshness
- AI-readiness
- portability
- ownership impact
- outcome evidence

If a provider becomes stale, adds hidden cost, stops shipping, breaks compatibility, or no longer fits the customer's flow, FlowStack should be willing to recommend a different provider quickly and clearly.

### 8. Parent Layer, Not Child Tool

FlowStack should not only live inside another orchestration layer. It should be able to sit above approved workspace roots and understand the difference between:

- what exists on the machine or cloud account
- what exists inside Paperclip, Archon, Replit, GitHub, GHL, HubSpot, or another tool
- what has changed outside the expected flow
- what should be registered, ignored, archived, merged, or elevated

If a user has two Paperclip instances, three agent harnesses, five active repos, and ten company folders, FlowStack's job is to show the parent map and ask useful questions:

> I can see these new projects are active but not part of the current flow. Should they be added, ignored, connected to Paperclip, or treated as separate businesses?

### 9. Communication Fabric Over Framework Choice

FlowStack should not be defined by whether a customer uses React, Next.js, TypeScript, Go, Rust, Python, Supabase, Vercel, Tauri, LangGraph, GHL, HubSpot, Paperclip, DeerFlow, Archon, or something else.

Those are implementation layers. FlowStack's durable role is the communication layer above them.

The system should be able to:

- discover what was dropped into the stack
- identify what type of thing it is
- learn the safe ways to communicate with it
- register its events, commands, state, capabilities, and boundaries
- translate between tools when the customer approves it
- explain the business meaning of that communication

The product posture is:

> Put the system in FlowStack. FlowStack figures out what it is, how it talks, what it affects, and what business flow it belongs to.

This does not mean FlowStack can magically control everything on day one. It means every integration, scanner, connector, agent, and workflow should fit a common communication model instead of becoming a one-off silo.

### 10. Decompose Before Buying

Many SaaS products sell a large platform when the customer only needs a narrow capability.

FlowStack should help customers decompose a platform into:

- the 5 percent they actually use
- the parts that are worth keeping
- the parts that are rented abstraction over common primitives
- the parts that should be replaced with a small owned slice
- the parts where a specialist provider is still the better answer

The goal is not to insult tools or teams. The goal is to reveal the economic and operational truth:

> Are we paying for a platform because we need it, or because nobody has decomposed the problem yet?

FlowStack can only do this well when it has enough context. The product promise is not magic generation from nothing. The product promise is context-aware decomposition: if FlowStack knows the customer's stack, constraints, tools, data model, team workflow, and business goal, it can propose or build a smaller solution that fits.

FlowStack should be willing to say:

- keep the SaaS because it fits
- use a verified provider because the specialist path is faster
- build the owned slice because the customer only needs a narrow capability
- stop spending weeks on a process that can be turned into an editable owned workflow

### 11. Capability-Level Ownership

The better word is not always "agnostic." The sharper idea is capability-level ownership.

A business should not be forced to buy, rent, or stay inside an entire platform because one small capability is trapped there.

The capability may be as small as:

- a button
- a form
- a bidding widget
- a booking flow
- a lead handoff
- a calculator
- a voice-agent trigger
- a page editor
- an analytics event
- a CRM field update

FlowStack should treat each capability as open to evaluation:

- Should this stay in the current SaaS?
- Should this be embedded as a portable widget?
- Should this be rebuilt as owned code?
- Should this be powered by an open-source library?
- Should this be routed through a verified provider?
- Should this become a reusable FlowStack playbook?

The goal is not to attack successful platforms. The goal is to stop businesses from paying enterprise rent for one simple feature when a smaller, portable, owned capability would serve them better.

FlowStack should leverage open-source communities and existing open standards wherever practical. If the durable value comes from knowing the customer's flow, composing the right capability, and giving ownership back to the customer, then FlowStack should not hide simple value behind artificial lock-in.

This is also an education problem. Customers often do not know what they do not know. FlowStack should reveal the abstraction layers slowly and transparently:

- what they are paying for
- which features they actually use
- what those features depend on
- what could be owned
- what should remain rented
- what would break if they moved
- what they would save or gain by changing

FlowStack should never manipulate the user into a decision. It should make the invisible visible until the user can make a better decision.

### 12. Not an OS

FlowStack should not position itself as an operating system.

The market is already filling with agentic OSes, harnesses, orchestration layers, workflow engines, coding agents, builders, and runtimes. FlowStack's role is not to force a business into one more operating layer.

FlowStack is a business abstraction, continuity, and translation layer.

Everything a business adopts has a shape: folders, settings, configs, YAML files, credentials, routes, prompts, workflows, APIs, and permissions. Many new AI tools feel different at the surface, but underneath they still define how work is structured, remembered, and executed. If a business buys deeply into one layer without understanding that shape, it risks getting trapped by the layer instead of helped by it.

FlowStack adds knowledge over the stack rather than forcing a rebuild of the stack. The posture is closer to adding RAM to the machine than replacing the machine: more usable capacity, context, speed, and flexibility without requiring the business to change everything first.

It helps a company understand:

- what they are already using
- what each layer knows
- what each layer cannot see
- what would be lost if they moved
- what must be preserved during a migration
- what should be routed through the current tool
- what should be owned outside the tool

The promise is:

> You do not need to change everything you are doing. Use FlowStack so you can change later without losing your business memory, operational context, or ability to move.

Businesses can add another SaaS, harness, hosting layer, CRM, or agent tool if they want. FlowStack's role is to understand what changed, improve the flow around it, and preserve the option to move again later.

### 13. Contextual Agent Routing

FlowStack may have access to many agents, but it should not use every agent for every situation.

The system should analyze the customer request, stack context, risk, permissions, and desired outcome, then route work to the smallest useful set of agents.

Example agent categories:

- discovery
- stack mapping
- connector analysis
- migration planning
- implementation
- verification
- marketing operations
- support operations
- security review
- cost analysis
- provider comparison

The agent layer should feel like an expert bench, not a noisy swarm.

FlowStack should choose agents because the situation needs them, not because the product is trying to show off that they exist.

### 14. Stack-to-Stack Translation

FlowStack should help businesses communicate across stacks without forcing all content, data, and operations into the newest tool.

Example:

- Stack A uses GitHub, Netlify, and Railway.
- Stack B uses GitHub, Vercel, and Railway.
- A GoHighLevel site sits outside both stacks.
- Railway production services already exist, but the GHL site cannot cleanly attach to those services.

FlowStack should map the actual interfaces:

- domains
- routes
- deployment targets
- forms
- webhooks
- APIs
- env-key dependencies
- CRM objects
- events
- content surfaces
- agent/tool access

Then it should recommend the cleanest bridge:

- keep GHL but connect it through an approved webhook/API bridge
- move a specific feature slice out of GHL
- create an owned embed/widget that talks to Railway
- route content updates through FlowStack-owned publishing
- build a fallback surface in Netlify or Vercel
- document the migration path if the customer wants to leave later

This prevents the backwards pattern where businesses keep feeding more content and process into isolated tools just because those tools own one page, form, or workflow.

### 15. Composable Structure Over Library Choice

The same principle applies inside a codebase.

Many teams do not have a real component layer. They have buttons, cards, layouts, forms, modals, tables, and composed product sections scattered across feature folders. The chosen library may be MUI, shadcn/ui, Radix, Chakra, custom CSS, Tailwind, or something else, but the structural problem is the same: reusable primitives and composed components are not organized in a way the business can maintain.

FlowStack should treat the UI library as an implementation detail and the composable structure as the durable business asset.

FlowStack can:

- scan a repo for repeated UI patterns
- identify scattered primitives and composed components
- propose a component-layer structure
- generate components using the team's current library
- create migration plans from the current library to a new one
- replace pieces incrementally instead of forcing a full rewrite
- track which product surfaces depend on each component
- help the customer own their design system instead of being trapped by a library decision

The goal is not to standardize every customer on one UI stack. The goal is to give them a stable component architecture that can survive library changes.

### 16. Improve Unclear Handoffs Without Blame

Many difficult flows are not caused by bad people. They are caused by missing structure between tools.

Example:

- A company uses Wix for the current site.
- Designers work in Figma.
- Figma files contain useful visual designs, but not a clean component system.
- Developers are expected to turn those designs into an application layer.
- There is no AI-connected design-to-code pipeline.
- The handoff needs help because the design layer is not composed in a way the code layer can consume.

FlowStack should not blame the design team. FlowStack should say:

> The design-to-development flow is missing a composition layer. We can create that layer from what you already have, then connect it to your stack.

FlowStack can:

- inspect the current design/source structure
- identify repeated visual patterns
- propose Figma component composition
- propose code component composition
- map design elements to code primitives
- create a bridge between design tokens, components, and implementation
- recommend whether to keep Wix, migrate a slice, or build an owned surface
- give designers a better system without forcing them to restart from scratch

This keeps the product posture constructive: FlowStack finds the flow that needs help, explains the missing layer, and proposes the practical next step.

### 17. Marketing Composition Layer

Business and marketing also need composition layers.

Many companies have a website, social accounts, brand assets, product knowledge, and customer stories, but the marketing flow is still blocked by manual research, manual article planning, manual image generation, manual approvals, and inconsistent publishing. The result is predictable: the last blog post is three months old, social posting is irregular, SEO opportunities are missed, and marketing work depends on whoever was not pulled into a meeting that week.

FlowStack should help turn marketing from scattered effort into a composed flow.

FlowStack can:

- analyze the website and current content
- identify keyword, SEO, and topic opportunities
- map existing products, services, offers, and customer segments
- propose a content calendar
- generate article briefs, drafts, social posts, and image prompts
- create human approval steps
- publish or schedule through approved tools
- track which content actually ships
- measure impact through traffic, clicks, leads, conversions, and rankings where connected

The goal is not to remove marketing judgment. The goal is to remove avoidable blockers.

FlowStack should make the default path:

> Research, draft, image, approve, publish, measure, repeat.

If a customer wants full human review at first, FlowStack should support that. The system can still do the research, drafting, structuring, and scheduling work so the human edits and approves instead of starting from zero.

### 18. Optimization Flow Memory

FlowStack should remember not only what it recommended, but what happened after the recommendation.

Many business opportunities are simple:

- revive an old page
- update an old blog post
- add missing SEO metadata
- connect a form to a follow-up workflow
- publish the article already drafted
- generate social variants from existing content
- add a lightweight landing page
- replace a slow manual handoff
- connect a hosted page to an owned API or service

The hard part is not always the work. The hard part is noticing the gap, proving the value, getting approval, shipping the change, and measuring whether it helped.

FlowStack should track:

- what it saw
- what it recommended
- whether the customer accepted, deferred, or rejected the recommendation
- what alternative path the customer chose
- what changed later
- whether the flow improved
- what value was recovered or protected

This creates a learning loop:

> FlowStack recommended a smaller owned content workflow. The customer deferred and kept using the existing SaaS. The blog remained stale for 90 days. FlowStack can show the missed cadence and propose the lower-friction path again with better evidence.

When a change is approved, FlowStack should measure before and after:

- traffic
- conversion rate
- response time
- publishing cadence
- lead follow-up rate
- missed calls
- form failures
- content output
- cost avoided
- revenue protected

The simple wins matter. A 3 percent improvement for a business doing $1M/year is $30,000/year. A 3 percent improvement for a business doing $10M/year is $300,000/year. If FlowStack can identify and help ship the process change that protects that value, the recommendation is worth far more than the tool cost.

### 19. Portfolio Capability Memory

FlowStack should know what has already been built across the approved workspace portfolio.

This is not only about the current project. A founder, agency, or business may have years of prior work across drives, repos, experiments, client builds, prototypes, worktrees, and agent runs. Hidden inside that history may be reusable capabilities:

- video editors
- bidding widgets
- page builders
- social/content workflows
- payment flows
- Supabase/Railway/Vercel bridges
- media generation pipelines
- component libraries
- agent adapters
- pricing/model registries
- workflow runners

If FlowStack knows the portfolio, it can say:

> You already built most of this in another project. We can wrap it, extract it, adapt it, or turn it into a reusable playbook instead of rebuilding from zero.

This can save real money. A reused capability may avoid weeks of work, third-party SaaS cost, or a new agency build. FlowStack should treat prior work as a business asset, not a forgotten folder.

### 19A. Shallow-First Portfolio Scan

FlowStack does not need to deeply inspect every file to create value.

The first scan can be shallow:

- list approved parent-root folders
- detect obvious project directories
- detect recent activity
- detect Git repos
- detect package manifests
- read high-signal project files such as `README.md`, `package.json`, and workspace manifests
- detect stack markers
- detect agent/workflow folders
- detect deployment config
- detect naming patterns that look like clients, products, experiments, or worktrees

Then FlowStack can ask:

> I found these likely projects and active workspaces. Which ones belong to your current business flow, which are archived, and which should I ignore?

This creates a low-friction entry point. The customer does not need to connect every SaaS or explain every project up front. FlowStack can begin by making the visible filesystem visible as business context.

The next layer is README and manifest harvesting. FlowStack can summarize the declared purpose of each project from README files, then compare that against package manifests, deployment config, and repo structure. This gives the customer a useful briefing in minutes:

- what each project claims to be
- what stack each project appears to use
- which projects share the same business purpose
- which projects appear to be active, dormant, duplicated, or abandoned
- which older projects use stack choices that no longer match the customer's current preferences
- which projects may already contain reusable code, agents, media pipelines, widgets, integrations, or playbooks

This is one of the major AI advantages. A human would need to open dozens of repos and mentally reconstruct years of context. FlowStack can do the first-pass abstraction quickly, then ask the owner for classification instead of pretending it fully knows the business.

Example:

> Your current stack preference appears to be React 19, Vite, Supabase, and agent-assisted local development. I found four older projects using older React/Next patterns and separate deployment assumptions. Should we mark them as archived, leave them as-is, or create a modernization plan?

The point is not to force modernization. The point is to reveal stack drift the owner may already feel but has not had time to organize.

Only after the user confirms relevance should FlowStack perform deeper scans, capability extraction, dependency analysis, or recommendations.

### 19B. AI-Native Installer Intake

The scanning layer is similar to what old software installers and setup wizards used to do: inspect the environment, detect what exists, and configure the next step.

The difference is that AI makes the intake much more useful.

FlowStack can run transparent, read-only discovery commands, inspect approved files, summarize high-signal artifacts, and create a business-level briefing far faster than a human could. It does not need to understand every line of code to create value. It needs to quickly identify the visible shape of the environment:

- what projects exist
- what stacks they use
- what tools are installed
- what deployment paths appear active
- what agent systems or AI workflows are present
- what old choices may now be slowing the business down
- what deserves a deeper, user-approved scan

This should feel like a modern installer for business context, not spyware and not an uncontrolled agent. The user approves the root, sees what FlowStack will inspect, and can review what was found.

MVP scanner behavior should be:

- read-only by default
- shallow-first
- transparent about commands and files inspected
- allowlisted by file type and path rules
- secret-aware without reading or storing secret values
- resumable and auditable
- capable of asking for classification before going deeper

The unlock is speed. FlowStack can do the boring inventory and abstraction work thousands of times faster than a person, then let the person decide what matters.

### 19C. Human Toolprint Mapping

A developer or operator's local profile already contains a human abstraction layer.

Dot folders such as `.claude`, `.codex`, `.gsd`, `.beads`, `.archon`, `.paperclip`, `.gstack`, `.n8n`, `.docker`, `.supabase`, `.aws`, `.azure`, `.dolt`, `.cursor`, `.gemini`, and `.vscode` are not random clutter. They are evidence of how the person actually works:

- which AI assistants they use
- which workflow systems they trust
- which local issue trackers or planning tools exist
- which cloud providers or deployment paths are configured
- which agent harnesses, memory systems, and MCP surfaces are present
- which tools may depend on other tools that are missing from the current execution context

This is not about spying on the user. It is about turning visible local tool state into an understandable flow map.

Example:

> Dolt config exists locally, but the `dolt` CLI is unavailable in this execution context. Beads may depend on Dolt here. Do you want to fix PATH, install Dolt, or sync issues through another route?

This is the FlowStack abstraction layer in a small, concrete form. FlowStack does not need to replace GSD, Beads, Codex, GitHub, Linear, Jira, Archon, or Claude Flow. It needs to explain how work moves between them, where it stops, and which small correction would restore flow.

The first useful output is not a dashboard full of metrics. It is a short human-readable map:

- "You use these planning layers."
- "You use these agent layers."
- "You use these repo and issue layers."
- "These layers do not currently connect cleanly."
- "This one missing CLI, path, token, sync rule, or bridge is probably why the workflow feels broken."

### 19D. Flow Repair Memory

Adopting a tool should not mean rediscovering the same environment problem forever.

Many agent and workflow systems are powerful, but their agents are often bounded by the tool's local assumptions. A workflow can fail repeatedly because:

- it was designed around macOS/Linux but runs on Windows
- it assumes Bash when the current shell is PowerShell
- it expects `rg`, `fd`, `jq`, `dolt`, `gh`, Docker, Bun, or another CLI to exist
- a config folder exists but the executable is not on PATH
- a hook command is unavailable
- a local issue store exists but is not bridged to GitHub, Linear, Jira, or another external issue layer
- worktree, symlink, permission, or Git lock behavior differs by environment
- a package is one version behind and keeps producing the same warning or failed hook

This is not primarily a tool problem. It is a flow problem.

FlowStack should remember repeated breakpoints across sessions, agents, and tools. If a user or agent fixed the same issue yesterday, FlowStack should not make the next agent rediscover it from zero.

Example:

> This Archon workflow has failed three times on worktree/symlink setup, and this Codex shell cannot execute the bundled `rg`. The likely fix is to normalize the Windows execution profile, install or route around missing CLIs, and record the repair as a project-level flow rule.

Flow repair memory should classify recurring errors into reusable fixes:

- install or expose a missing CLI
- update PATH or shell profile
- switch command strategy for Windows/PowerShell
- replace `rg` with a safe fallback when the bundled binary cannot run
- update a package or hook version
- disable or replace a noisy hook
- connect local issue state to external issue state
- create a project-specific execution profile

FlowStack should not silently mutate the environment. The MVP should recommend repairs and, when appropriate, offer an approved "fix this" action with a clear before/after.

### 20. Multi-Provider Resilience

FlowStack should not assume one model, vendor, agent runtime, or provider will stay best forever.

The AI market changes quickly. A provider can become popular, change terms, restrict usage, raise prices, lose quality, hit limits, or stop fitting the customer's flow. A business should not lose its process just because one provider or harness changed.

FlowStack should support provider plurality:

- Claude
- Gemini
- GPT/OpenAI
- GLM/z.ai
- MiniMax
- KIE.ai
- Vapi
- local models
- hosted app builders
- agent harnesses
- specialist APIs

The goal is not to use every provider at once. The goal is to preserve choice, cost control, and fallback paths.

FlowStack should track:

- which providers are used where
- which capabilities depend on them
- what fallback options exist
- what each provider costs
- what each provider is good at
- what restrictions or risks apply
- whether a provider change would break a business flow

This matches how a real business hires people. The business owns the goal; specialists can come and go. FlowStack should help the business add, swap, or route specialists without losing the company memory.

## Competitive and Reference Landscape

This PRD treats these projects as references and integration candidates, not enemies.

### Claude-Mem

Claude-Mem captures Claude Code session activity, compresses it into structured memory, stores it locally, and injects relevant context into future sessions. It validates a real pain: single-agent sessions forget too much, and developers want persistent local memory.

FlowStack should learn from the pattern, but move up a level:

- Claude-Mem focuses on one assistant's memory.
- FlowStack needs multi-agent, multi-project, multi-tool, and business-level memory.
- Claude-Mem is useful inside a developer workflow.
- FlowStack should know when Claude-Mem, Claude Code, Codex, OpenCode, or another tool is being used and how it affects the business stack.

Reference: https://github.com/thedotmack/claude-mem

### Archon

Archon positions itself as a command center for AI coding assistants with project knowledge, task management, RAG, and MCP access for tools like Claude Code, Cursor, Windsurf, and others. Archon also demonstrates per-node MCP attachment for giving workflow nodes exactly the tools they need.

FlowStack should learn from:

- Shared knowledge/task context for AI coding assistants.
- MCP as a tool access boundary.
- Agent workflows where different tools are attached to different task nodes.

FlowStack's higher-level role:

- Detect where Archon exists.
- Understand which projects and workflows depend on it.
- Route work into Archon when it is already the right harness.
- Observe outcomes and relate them to business impact.

References:

- https://github.com/public-space/Archon-OS
- https://archon.diy/guides/mcp-servers/

### Paperclip and Agent Town

Paperclip validates the "agentic company" pattern: companies, goals, org charts, budgets, heartbeats, tasks, approvals, and governance for teams of agents. It is a useful lower-layer operating system for autonomous work.

Agent Town validates a different surface: visual/spatial management of agents as workers in an office-like environment, with live task assignment and execution visibility.

FlowStack should learn from both, but sit above them:

- Detect Paperclip instances and the companies/projects they know about.
- Detect Agent Town or similar visual agent workspaces as active agent surfaces.
- Compare what those tools know against the parent workspace reality.
- Notice when the same repo is edited through VS Code, Codex, Claude Code, Cursor, or another tool outside the Paperclip/Agent Town flow.
- Recommend whether an unregistered project should be added to Paperclip, managed directly in FlowStack, kept separate, or archived.

Local references:

- `E:\paperclip-1`
- `E:\paperclip-tuari`

### DeerFlow and Continuity Dashboard

The local DeerFlow work shows another path this thinking already explored: a super-agent harness plus a local continuity dashboard.

DeerFlow itself is a LangGraph-based super-agent harness with subagents, persistent memory, sandbox execution, MCP servers, extensible skills, and messaging channels. It is trying to make one powerful agent runtime that can research, execute, browse, manage files, delegate, and retain context.

The local `agent-dashboard` experiment adds the visibility layer around that style of work:

- discovers running and recent agent sessions across providers such as Claude Code, Codex, z.ai, MiniMax, manual, and local
- tracks workspace sessions, agent runs, context snapshots, continuation packets, and flow events in a local continuity ledger
- compiles context from `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, `.gsd`, and superpowers planning files
- tracks Git readiness, worktrees, uncommitted changes, local commits, push state, and conflicts
- supports manager/developer views, handoffs, queue state, and resume decisions

This validates the FlowStack redirect.

The lesson is not that FlowStack should become DeerFlow or another continuity dashboard. The lesson is that operators need a parent intelligence layer that can see DeerFlow, Paperclip, Archon, Claude Code, Codex, VS Code, Git state, folders, repos, and business tools together.

FlowStack's role should be to discover and interpret these lower-layer systems, then connect their activity to business context:

- Which workspace is this agent activity attached to?
- Which business does this repo belong to?
- Is the work inside or outside the expected operating flow?
- Is Git ready, stale, conflicting, or drifting?
- Should this be resumed, reviewed, registered, routed into a harness, or elevated into an owned build plan?

Local references:

- `E:\dearflow\deer-flow`
- `E:\dearflow\agent-dashboard`

### Owned Web/Editor Slice Pattern

This pattern should not be named after the client/project folder where it was discovered. The local build is an independent proof-of-pattern artifact, not a delivered client solution, not something the client paid for, and not something the client owns.

The underlying FlowStack pattern is:

> A customer is about to rent an expensive platform or retainer for a narrow editing/publishing capability. FlowStack decomposes the need, builds the owned slice, and the customer keeps the value in their own stack.

The local reference shows what can happen when FlowStack understands a company's actual application structure, constraints, and working style. There is no magic: the system uses known context about the business stack to generate a narrow implementation that fits that stack.

In this artifact, the prototype shows a complete marketing-site direction with static assets, full-page content, motion notes, and a launchable landing experience. The app version then turns that into an owner-controlled Next.js/Payload/Puck stack with:

- Payload collections for pages, variants, events, and users
- a Puck visual editor using native React components
- import routes for design sources and Figma-style flows
- an AI-assisted design translator that maps external design sources into editable builder blocks
- draft/publish state
- page variants and event tracking for impressions/conversions
- SEO analysis tied to editable page blocks
- block-level fields for marketers to adjust copy, color, media, layout, and CTAs without owning the whole codebase

This matters because the visual-editor market already exists. Webflow, Builder.io, Plasmic, Payload, Puck, WordPress/Gutenberg, and other builders all solve parts of this problem. This local build is not proof that nobody has a visual editor.

It is proof of the FlowStack ownership wedge:

- A business may not need a full external website platform.
- A marketer may still need safe editing controls.
- A developer or agent team can generate the owned slice quickly.
- A future FlowStack customer can pay once for the narrow capability instead of carrying a larger recurring platform cost.
- A rejected, stalled, or abandoned opportunity can become a reusable FlowStack playbook that future customers can buy and own.
- FlowStack can recommend whether to use Webflow/Builder/Plasmic, use a verified provider, or build the smaller owned editor layer.
- FlowStack can also keep watching the resulting owned surface through events, variants, SEO signals, and publishing activity.

Local reference artifact:

- `E:\Cardoor`
- `E:\Cardoor\cardoor-app`

### Storytellers and Reusable Capability Memory

The local Storytellers project shows why FlowStack needs portfolio-level memory.

Storytellers is an AI video storytelling application with a full pipeline:

- story breakdown
- scene prompt generation
- image generation
- image-to-video generation
- video stitching/editor/export
- audio/music support
- Supabase persistence/storage
- Stripe payments
- model/provider registry and pricing references
- Remotion and FFmpeg-based rendering/stitching
- specialist agents for video generation and KIE.ai integration

The lesson is not only that the project exists. The lesson is that a later project may need one of these capabilities without realizing it already exists elsewhere.

FlowStack should be able to detect:

- reusable modules in old projects
- provider/model registries that can inform new work
- media pipelines that can be wrapped behind a new API
- specialist agent instructions that can be reused
- previous pricing/cost research
- worktrees or agent runs that contain useful implementation context

Local reference:

- `E:\s7s-projects\storytellers`

### T3

T3 is useful as a reference for modular, type-safe app creation. Create T3 App is intentionally not an all-inclusive template. It chooses a proven stack and lets developers select only the pieces they need.

FlowStack should use the same product philosophy at the business layer:

- Do not force the full platform when the customer needs one slice.
- Generate or recommend only the tools, modules, and code paths required for the desired outcome.
- Favor type-safe, owned code when FlowStack builds software for the customer.

Reference: https://create.t3.gg/

### Replit, Bolt, Lovable, v0, and Similar App Builders

These tools validate the "software on demand" trend. FlowStack should not replace them by default. It should be able to:

- Detect projects built with them.
- Import or inspect their outputs where permitted.
- Recommend when to continue using them.
- Trigger or coordinate builds through them when they are the right execution layer.
- Move owned outputs into the customer's repo/cloud/account when appropriate.

### SaaS Management and Shadow AI Tools

Tools like Auvik, Torii, BetterCloud, AppOmni, and Flexera validate the need for SaaS and shadow AI visibility. FlowStack should not compete head-on as a pure IT/security product. It should translate discovery into business and build recommendations.

### Agent Observability Tools

Tools like LangSmith, Langfuse, Coralogix, and AI Code Usage validate the need to monitor agent calls, sessions, cost, traces, and usage. FlowStack should ingest or integrate with these signals where useful, but its output should be action-oriented and business-aware.

### Internal Developer Portals

Backstage, Spotify Portal, Atlassian Compass, Port, Cortex, and OpsLevel validate the need for software catalogs, ownership, scorecards, and self-service. FlowStack should borrow the catalog/ownership idea, but extend it to SaaS tools, agents, local folders, business workflows, customer touchpoints, and owned software opportunities.

### Process Mining

Celonis validates the enterprise category of understanding how a business really runs from event data. FlowStack's wedge is smaller, more operator/developer/AI-native, local-and-cloud aware, and tied to owned software delivery.

## FlowStack Verified Provider Network

FlowStack can become a trusted middle layer between customers and the vendors, agencies, tools, and builders that best fit their current business flow.

This is not an affiliate directory. It is a fit-based provider network.

### Purpose

FlowStack should recommend external solutions when they are the best answer:

- Keep using the current SaaS because it is working.
- Switch to a cheaper or more fitting SaaS.
- Add a provider that specializes in the customer's current stack.
- Use an existing builder such as Replit, Bolt, Lovable, v0, or another app platform.
- Use a specialist agency for GHL, HubSpot, Vapi, n8n, Zapier, Composio, Supabase, Vercel, or other stack layers.
- Build an owned replacement only when ownership is the better outcome.

### FlowStack Verified

A FlowStack Verified provider is one that has been reviewed against the standards FlowStack needs to trust in recommendations.

Verification signals:

- Active product or service, not stale or abandoned
- Clear pricing and no unexpected uplift for being recommended through FlowStack
- Demonstrated AI-native or AI-compatible workflows where relevant
- Integration path with FlowStack's registry, event, or connector model
- Clear support expectations
- Evidence that the provider can improve cost, time, reliability, or ownership for the right customer
- Willingness to be re-evaluated as products, pricing, and customer needs change

FlowStack Verified does not mean FlowStack always recommends the provider. It means the provider is eligible to be recommended when the customer context supports it.

### Recommendation Neutrality

FlowStack must not become a bought solution.

Paid provider relationships may improve:

- profile completeness
- support readiness
- integration depth
- onboarding speed
- verification cadence
- co-marketing visibility

Paid provider relationships must not override fit.

If FlowStack recommends a provider, the recommendation should explain:

- why this provider fits
- what the customer is likely to save or improve
- what tradeoffs exist
- whether FlowStack has a provider relationship
- what happens if the customer stays with the current tool
- what happens if the customer builds an owned slice instead

### Dynamic Provider Switching

FlowStack should reserve the right to change recommendations quickly when the market changes.

If a vendor changes pricing, degrades service, drops useful features, stops shipping, mishandles AI functionality, creates lock-in, or becomes less suitable for a customer's current flow, FlowStack can say:

> This used to be the best fit. Based on your current FlowStack and the provider's recent changes, we recommend moving to this alternative or building the owned slice instead.

This is part of the product promise, not something to apologize for.

## Current FlowStack Implementation Fit

The current codebase already contains pieces that can support this direction.

### Module Registry

Current file: `src/lib/registry.ts`

Existing role:

- Defines product modules such as CRM, workflows, site builder, forms, analytics, AI agents, integrations, phone, chat, and reputation.

Future role:

- Evolve from a feature-module registry into a layered business-stack registry.
- Keep feature modules, but add entity registries for projects, tools, connectors, agents, workflows, surfaces, signals, recommendations, and owned builds.

### Scanner

Current files:

- `src/lib/scanner/*`
- `supabase/functions/scan-project/index.ts`

Existing role:

- Detects local/project tools such as Archon, DeerFlow, GSD, Claude Code, OpenCode, Goose, Aider, n8n, Supabase, Vercel, Netlify, LangChain, LlamaIndex, Anthropic SDK, OpenAI SDK, etc.

Future role:

- Become the read-only local/cloud discovery layer.
- Detect active projects, agent harnesses, deployment targets, env-key names, frameworks, SaaS SDKs, and workflow engines.
- Scan approved parent roots such as a drive folder, business folder, Git organization, or cloud account and discover child projects, company folders, control planes, and unmanaged workspaces.
- Compare discovered projects against registered FlowStack entities and lower-layer tool registries so FlowStack can flag projects that exist outside the expected flow.
- Produce a normalized `StackScanResult` tied to an organization and workspace.

### AI Agents

Current files:

- `src/features/ai-agents/*`
- `src/lib/ai/*`
- `src/lib/agent-runtime/*`
- `src/context/AgentContext.tsx`

Existing role:

- Agent creation UI, capabilities, chat, tool events, and early runtime abstractions.

Future role:

- Move from "individual agent CRUD" to "feature team management."
- Users should define a desired outcome, and FlowStack should assemble a scoped team: investigator, architect, implementer, verifier, migration agent, support agent, or operator agent.
- Agents should act through explicit permissions and approval gates.

### Workflows

Current files:

- `src/features/workflows/*`
- `src/lib/workflows/*`

Existing role:

- Visual workflow builder and execution scaffolding.

Future role:

- Represent business-flow automations and FlowStack recommendations.
- Trigger from observed gaps: missed calls, funnel failure, stale follow-up, provider outage, high agent spend, repeated component work.
- Store recommendation-to-action provenance.

### Integrations

Current files:

- `src/features/integrations/*`
- `db/integrations_schema.sql`

Existing role:

- Integration registry, OAuth/callback surfaces, webhooks, connection UI.

Future role:

- Become the connector and permission layer for external SaaS, app builders, agent tools, CRMs, workflow engines, AI providers, and deployment platforms.

### Builder and Published Surfaces

Current files:

- `src/features/builder/*`
- `supabase/functions/cloudflare-publish/*`

Existing role:

- Page/site builder, blocks, publishing.

Future role:

- Any FlowStack-owned page, funnel, component, or embed should emit normalized events.
- FlowStack can detect visitor behavior, click failures, conversion issues, form abandonment, and fallback needs.

## Product Model

### Core Loop

1. Customer connects, scans, wraps, or imports approved surfaces.
2. FlowStack builds a registry of the business stack.
3. FlowStack observes events and health signals.
4. FlowStack detects gaps and opportunities.
5. FlowStack presents recommendations with business impact.
6. User approves a plan.
7. FlowStack acts through existing tools or creates owned software.
8. FlowStack monitors the outcome and learns the business flow.

### Example: GoHighLevel Funnel Failure

Inputs:

- Customer gives FlowStack a GoHighLevel funnel URL, webhook, or event stream.
- FlowStack monitors page health, form submits, event delivery, complaints, and CRM follow-up.

Detection:

- Visitors reach the funnel.
- Form submission errors spike.
- Leads do not arrive in CRM.
- Support or call complaints increase.

Recommendation:

> Your GoHighLevel funnel started failing at 2:14 PM. 37 visitors reached the form, 19 failed before submit, and 6 later contacted support. I can create a fallback landing page, preserve lead capture, and route submissions to your existing CRM until the funnel recovers.

Action:

- Keep GHL as primary.
- Deploy a FlowStack-owned fallback page.
- Route captured leads to the customer's CRM or workflow engine.
- Alert the owner and preserve audit logs.

### Example: HubSpot plus Missed Calls plus Vapi

Inputs:

- Customer connects HubSpot.
- Customer connects call tracking or phone logs.
- FlowStack detects Vapi is already in the stack.

Detection:

- Form leads are created in HubSpot.
- Calls are coming in but not answered.
- No follow-up happens within the expected window.

Recommendation:

> Calls from new leads are going unanswered after 5 PM, and 14 leads had no response within 24 hours. You already have Vapi connected. I can set up a Vapi intake agent that answers missed calls, qualifies the lead, writes the summary to HubSpot, and triggers a callback workflow.

Action:

- Configure or generate the Vapi agent.
- Create HubSpot note/update automation.
- Add a workflow trigger.
- Monitor answer rate and conversion.

### Example: Repeated Component Refactors

Inputs:

- Customer scans local projects and GitHub repos.
- FlowStack detects repeated imports from Vercel/v0/shadcn or similar UI sources.
- FlowStack sees repeated manual edits across projects.

Detection:

- Similar component patterns are rewritten in multiple repos.
- Time spent refactoring repeated UI components is high.

Recommendation:

> You are repeatedly modifying the same downloaded component patterns across four projects. I can create a FlowStack-owned component library for your business and migrate these screens to it.

Action:

- Generate a design-system/component-library repo or package.
- Create migration PRs per project.
- Track adoption and regressions.

### Example: Agent Team Development

Inputs:

- User defines a feature goal.
- FlowStack scans existing repo context, docs, tasks, and dependencies.
- FlowStack detects available agent tools: Claude Code, Codex, Archon, GSD, DeerFlow, etc.

Detection:

- The feature requires design, data model, implementation, tests, and docs.
- A single agent/component-level task is too narrow.

Recommendation:

> This is a feature-team task, not a single component task. I can run an agent team with separate ownership for discovery, architecture, implementation, verification, and release notes.

Action:

- Create a feature brief.
- Assign agent roles.
- Gate write permissions.
- Track agent outputs.
- Review and consolidate work.

### Example: Paperclip plus External Project Drift

Scenario:

- A user runs Paperclip for one business.
- The same repo is later edited through VS Code, Codex, Claude Code, Cursor, or another local agent outside Paperclip.
- Two sibling company folders appear beside the Paperclip workspace.
- Those folders are active, but they are not registered in Paperclip, Archon, FlowStack, GitHub project metadata, or any explicit business registry.

FlowStack notices:

- approved parent root contains new or recently active child projects
- one repo has activity from multiple tools
- Paperclip's company registry does not include the sibling businesses
- the user is likely splitting work across multiple control planes without a parent map

FlowStack says:

> I can see two active projects outside the Paperclip flow. One appears to share skills, agent configs, or dependencies with the current business. Should I add it to FlowStack, connect it to Paperclip, keep it separate, or ignore it?

Possible actions:

- Add the folder as a FlowStack workspace.
- Link it to the existing business or create a new business record.
- Register it as a Paperclip company if Paperclip is the right lower layer.
- Create a guardrail that warns when agents edit the same repo outside the approved flow.
- Recommend a cleanup, merge, archive, or owned-build plan.

### Example: Marketing Site Platform Decomposition

Scenario:

- A business needs a marketing site or landing page live quickly.
- The marketing team wants editing control and may prefer Webflow or another visual platform.
- The technical reality is that the business only needs a small set of editable sections, publishing, SEO controls, analytics events, and maybe variants.
- A full platform or agency retainer may add cost, lock-in, reverse-proxy complexity, or weeks of coordination.

FlowStack notices:

- existing Next.js or owned app infrastructure
- design assets or AI-generated page designs are already available
- the required editing surface is narrow
- the customer needs safe controls, not a whole external platform
- event tracking and publishing can be owned inside the customer's repo

FlowStack says:

> You can keep using the external website platform, but your current need is a small editable web slice: pages, blocks, publish, SEO, variants, and events. We can build this into your owned stack and keep watching it through FlowStack.

Possible actions:

- Recommend Webflow, Builder, Plasmic, Payload, Puck, or another tool if it is the right fit.
- Build an owned editor layer on the customer's stack.
- Import a Figma/Stitch/AI-generated design into editable blocks.
- Add event tracking so FlowStack can see impressions, conversions, publish events, and SEO improvement opportunities.
- Escalate only the parts that need human marketing approval.

## Functional Requirements

### F001 - Stack Registry

FlowStack must maintain a normalized registry of business-stack entities.

Entities:

- Organization
- Workspace
- Project
- Repository
- Local folder
- SaaS tool
- Connector
- Credential reference
- Agent runtime
- Agent team
- Workflow
- Web surface
- Event source
- Recommendation
- Owned build
- Incident
- Cost signal
- Dependency

### F002 - Read-Only Discovery

FlowStack must support read-only scanning of approved local or remote project contexts.

Required detections:

- Frameworks and package managers
- Agent harnesses
- AI coding tools
- Workflow engines
- Deployment targets
- Database/storage services
- AI SDKs
- Existing docs and instructions
- Env-key names without leaking values

### F003 - Connector Inventory

FlowStack must track connected SaaS tools, OAuth/API authorization state, scopes, last successful sync, failure state, and permission boundaries.

### F004 - Business Event Ingestion

FlowStack must ingest normalized business events.

Examples:

- Page loaded
- Button clicked
- Form submitted
- Form failed
- Call received
- Call missed
- Message sent
- Message unanswered
- Workflow started
- Workflow failed
- Agent session started
- Agent tool called
- Agent cost recorded
- Deployment completed
- SaaS outage detected

### F005 - Gap Detection

FlowStack must detect business gaps from observed events.

Initial detectors:

- Funnel error spike
- Form abandonment or submit failure
- Missed call with no follow-up
- Lead created but no response
- Workflow failure or delayed webhook
- AI provider rate-limit or cost spike
- Duplicate tools with low usage
- Repeated component refactor pattern
- Project appears active but unregistered
- Credential dependency appears across multiple projects

### F006 - Recommendation Engine

FlowStack must convert detections into recommendations.

Each recommendation must include:

- What happened
- Why it matters
- Evidence
- Business impact estimate
- Confidence
- Proposed action
- Required permissions
- Risk level
- Rollback/fallback plan

### F007 - Action Approval

FlowStack must require approval before writes to external systems, code repositories, deployments, CRM records, workflows, or customer-facing surfaces.

### F008 - Agent Team Management

FlowStack must support feature teams of agents, not only individual agent chat.

Minimum roles:

- Investigator
- Architect
- Implementer
- Verifier
- Migration planner
- Operator/support agent

Each role must have:

- Scope
- Allowed tools
- Denied tools
- Write boundaries
- Expected output
- Review status

### F009 - Owned Software Build Path

FlowStack must support a path from recommendation to owned software.

Examples:

- Fallback landing page
- CRM slice
- Vapi intake agent
- Internal dashboard
- Component library
- Workflow runner
- Connector bridge

Owned output should be created in the customer's chosen repo/cloud/account where feasible.

### F010 - Integration-First Action Path

Before building owned software, FlowStack must consider improving the existing stack:

- Configure existing SaaS
- Create Zapier/n8n workflow
- Add Composio-style connector auth
- Trigger Replit/Bolt/Lovable/v0 build
- Add a Vapi/Twilio/HubSpot/GHL workflow
- Create a patch or PR in an existing repo

### F011 - Audit Log

FlowStack must log observations, recommendations, approvals, agent actions, tool calls, writes, and resulting outcomes.

### F012 - Provider Registry

FlowStack must maintain a provider registry for tools, SaaS products, agencies, builders, consultants, and implementation partners.

Each provider record should include:

- provider type
- supported use cases
- supported tools
- industries
- pricing model
- implementation model
- integration status
- verification status
- last verified date
- stale-risk score
- AI-readiness notes
- ownership impact
- support expectations
- relationship disclosure

### F013 - Fit-Based Provider Recommendations

FlowStack must recommend providers based on customer context and explain the recommendation.

Signals:

- current stack
- budget
- existing tools
- urgency
- implementation complexity
- required ownership level
- customer technical maturity
- cost savings estimate
- migration risk
- provider verification status
- provider outcome history

Paid provider status may be shown as disclosure, but must not be the ranking reason.

### F014 - Parent Workspace Discovery

FlowStack must support discovery from an approved parent workspace, not only from a single project.

Supported parent scopes:

- local drive folder
- company folder
- GitHub/GitLab organization
- monorepo
- cloud account
- manually curated portfolio

FlowStack should compare the parent workspace against known lower-layer registries.

Examples:

- Paperclip knows Company A, but the parent folder also contains Company B and Company C.
- Archon is configured for one repo, but sibling repos use the same agent skills or credentials.
- A repo is being edited by VS Code, Codex, Claude Code, Cursor, and a Paperclip agent without a shared registry.
- A new local project was created recently and appears business-relevant but is not registered anywhere.
- A stale Git remote, missing branch, or conflicting local clone creates business risk.

FlowStack must let the user resolve each discovery:

- add to FlowStack
- link to an existing business
- register into a lower-layer tool such as Paperclip or Archon
- mark as personal/experimental
- ignore
- archive
- create a recommendation or agent-team plan

FlowStack should use shallow-first discovery by default.

Initial shallow signals:

- folder name
- last modified date
- presence of `.git`
- README and documentation files such as `README.md`, `docs/`, `AGENTS.md`, and `CLAUDE.md`
- package manifests such as `package.json`, `pnpm-workspace.yaml`, `pyproject.toml`, `go.mod`, `Cargo.toml`
- app config such as `vite.config`, `next.config`, `vercel.json`, `netlify.toml`, `docker-compose.yml`
- planning/instruction files such as `AGENTS.md`, `CLAUDE.md`, `.gsd`, `.planning`, `.beads`
- agent/tool folders such as `.claude`, `.codex`, `.archon`, `.gstack`, `.superpowers`
- obvious build/output folders, with ignore rules

For approved shallow files, FlowStack should create project summaries before deeper inspection.

Each summary should include:

- declared project purpose from README/docs
- likely framework, runtime, language, and package manager
- likely deployment or hosting target
- likely database/backend/service dependencies
- AI or agent tooling signals
- whether the stack appears current, stale, experimental, or unknown
- whether the project resembles another project in the same portfolio
- what follow-up question FlowStack should ask the owner

The shallow scan should produce a portfolio briefing before deeper inspection.

The briefing should answer:

- what projects appear active
- what projects appear stale
- what projects may be duplicates/worktrees
- what stacks appear repeatedly
- what stack preferences appear to be current across the portfolio
- what projects appear to have stack drift from that current preference
- what folders look like client work, products, experiments, or tooling
- what projects may already contain reusable capabilities
- what items need user classification

Deeper scans should be opt-in per project or workspace.

Scanner execution must be transparent. A user should be able to see:

- which root was approved
- what scan depth was used
- which file patterns were included
- which paths were ignored
- which read-only commands or filesystem operations were executed
- which files were summarized
- which secret-like files or values were skipped
- what follow-up access FlowStack is requesting, if any

FlowStack should treat this as installer-style intake: inspect the environment, explain what exists, ask for classification, and only then recommend deeper work.

FlowStack should also support user-profile toolprint discovery as a shallow scan mode.

For local installations, FlowStack may inspect approved dot-folder names and safe metadata under the user's profile to infer installed workflow layers. This should start with folder names and timestamps, not file contents.

Initial toolprint categories:

- AI assistants and coding agents
- workflow/planning systems
- local issue trackers
- agent orchestration systems
- memory/context systems
- MCP/tool gateways
- source control and issue sync layers
- cloud/deployment providers
- local runtimes and package managers

Toolprint discovery should produce flow questions, not assumptions.

Examples:

- "You appear to use GSD and Beads. Should FlowStack treat Beads as local issue state, GitHub as external issue state, or both?"
- "You appear to use Codex, Claude, Claude-Mem, and Claude Flow. Which one should be treated as the current active coding layer for this project?"
- "A tool's config folder exists, but its CLI is unavailable in this shell. Should FlowStack help repair the execution context?"

### F015 - Communication Fabric

FlowStack must normalize connected tools, projects, folders, agents, SaaS products, and runtimes into a common communication model.

Every registered entity should be able to expose zero or more communication interfaces.

Interface types:

- event source
- command target
- state snapshot
- API
- webhook
- MCP server
- CLI
- file/folder
- database
- browser surface
- agent session
- deployment target

Each interface should describe:

- what events it emits
- what commands it accepts
- what state can be read
- what writes require approval
- what credentials or scopes are required
- what rate limits or costs apply
- what business entity it belongs to
- what other interfaces it depends on

FlowStack should use this model to translate between layers.

Examples:

- A missed call event from Vapi can become a HubSpot task, a GHL note, a FlowStack recommendation, or an owned CRM workflow.
- A Codex session touching a repo can become a Git readiness signal, a project activity event, and a feature-team update.
- A GHL form failure can become a funnel incident, a support alert, a provider recommendation, or an owned fallback page plan.
- A local folder with `AGENTS.md`, `package.json`, and `.env.example` can become a project entity with detected capabilities and dependency risks.
- A Paperclip company can be treated as a lower-layer control plane with agents, tasks, budgets, and activity FlowStack can observe or route into.

FlowStack does not need to own every interface directly. It must know what interface exists, what it means, how trustworthy it is, and whether the customer has authorized FlowStack to observe, recommend, or act through it.

### F016 - SaaS Capability Decomposition

FlowStack must be able to analyze a SaaS/tool/process and identify the narrow capabilities the customer actually uses.

For each candidate tool or process, FlowStack should estimate:

- active capabilities used
- unused or low-value capabilities
- recurring cost
- implementation friction
- lock-in risk
- data ownership impact
- integration complexity
- staff/process dependency
- equivalent owned-slice complexity
- recommended path: keep, configure, switch, use provider, or build owned slice

Initial decomposition targets:

- website/page builder
- CRM/funnel
- forms and lead capture
- call intake/follow-up
- social/content workflow
- analytics/event tracking
- simple internal dashboard
- component library or design system

FlowStack must not assume owned software is always better. It should recommend an owned slice only when the capability is narrow enough, the customer has enough ownership need, and the long-term cost/friction/risk makes the build path reasonable.

### F017 - Portable Feature Slices

FlowStack must support recommendations and build plans at the feature-slice level, not only at the app or platform level.

A feature slice is a narrow, business-useful capability that can be understood, embedded, owned, or replaced independently.

Examples:

- bid/auction widget
- lead capture form
- payment link
- appointment scheduler
- quote calculator
- chatbot or voice-agent trigger
- review request button
- gated download form
- marketing page section
- CRM sync action
- analytics event capture
- webhook bridge

Each feature-slice recommendation should include:

- current platform/location
- business purpose
- active users or workflows affected
- dependencies
- data read/write needs
- integration interfaces
- embedding requirements
- ownership model
- portability constraints
- estimated build effort
- estimated recurring cost avoided
- recommended path: leave in place, wrap, embed, rebuild, replace, or retire

FlowStack should be able to say:

> This does not need to be a whole platform decision. This is a portable capability decision.

When FlowStack builds a feature slice, the output should be designed for reuse where reasonable:

- as an embeddable widget
- as a React/Next.js component
- as a server route/API
- as a workflow node
- as a webhook handler
- as a package or module
- as a FlowStack playbook future customers can adapt and own

### F018 - Stack Exit Memory and Migration Mapping

FlowStack must preserve enough context for a business to move between tools, stacks, harnesses, or platforms without starting from scratch.

For each important tool or stack layer, FlowStack should track:

- why it was adopted
- what business capabilities depend on it
- what data it owns
- what events it emits
- what commands or APIs it accepts
- what secrets/scopes are required
- what agents or humans use it
- what costs are attached to it
- what known issues, limits, or outages exist
- what replacement or bridge options exist
- what would be lost if the customer left it

Migration mapping should support:

- GitHub to GitHub with changed deployment targets
- Netlify to Vercel or Vercel to Netlify
- Railway service connection changes
- GHL/HubSpot form or funnel bridges
- workflow platform changes such as Zapier, n8n, Make, or custom webhooks
- agent harness changes such as Paperclip, DeerFlow, Archon, Claude Code, Codex, or other runtimes

FlowStack should be able to answer:

> If we leave or bypass this layer, what breaks, what do we keep, and what is the cleanest path forward?

### F019 - Contextual Agent Routing

FlowStack must route work to agents based on the task and stack context, not based on a fixed one-agent or all-agents model.

Each agent should have:

- capability profile
- preferred input context
- allowed tools
- denied tools
- risk level
- cost profile
- expected output types
- verification needs
- stack/tool familiarity

For each user request or recommendation, FlowStack should create an agent routing plan that includes:

- selected agents
- why each agent is needed
- context provided to each agent
- permissions granted
- expected output
- approval gates
- stop conditions

FlowStack should support "no agent needed" as a valid routing outcome.

### F020 - Cross-Stack Bridge Recommendations

FlowStack must detect when business flow is split across multiple hosting, CRM, builder, or automation stacks and recommend safe bridges.

Initial bridge categories:

- form to webhook
- website to Railway service
- GHL page to owned API
- HubSpot/GHL CRM object to owned workflow
- Netlify/Vercel front-end to shared backend
- agent harness to repo/worktree
- workflow engine to event bus
- content editor to owned publishing surface

Each bridge recommendation should include:

- source system
- target system
- business capability being bridged
- interface required
- auth/scopes required
- data contract
- failure mode
- rollback plan
- ownership impact
- migration path if the bridge becomes permanent

FlowStack must prefer simple, observable, reversible bridges before proposing broad rewrites.

### F021 - Component Layer Intelligence

FlowStack must be able to analyze a codebase for component structure, reuse, duplication, and migration risk.

FlowStack should detect:

- repeated UI primitives
- repeated composed sections
- component logic duplicated across feature folders
- inconsistent design tokens
- multiple UI libraries in use
- scattered form patterns
- scattered table/list patterns
- one-off modals, buttons, cards, and navigation elements
- hard-coded styling that should be promoted into a shared component or token
- pages/features that would be affected by a component migration

FlowStack should recommend:

- a target component-layer structure
- primitive components
- composed components
- feature-specific components that should remain local
- design tokens
- migration order
- compatibility wrappers
- tests or visual checks needed for each migration phase

FlowStack should support library-specific generation without being library-bound.

Examples:

- create the component layer using shadcn/ui
- create the component layer using MUI
- create the component layer using Radix primitives
- create the component layer using custom Tailwind components
- migrate from one library to another through wrappers and incremental replacement

FlowStack should frame this as stress reduction, not a rewrite:

> You do not need to move the whole app at once. We can create the component layer, point new work at it, and replace old surfaces piece by piece.

### F022 - Design-to-Code Handoff Intelligence

FlowStack must be able to analyze design-to-development flows and detect when the missing layer is design composition, code composition, or the bridge between them.

FlowStack should detect:

- Figma files with repeated visual patterns but weak component structure
- design tokens missing, inconsistent, or not mapped to code
- design components that do not match code components
- code components that do not exist for common design patterns
- Wix/Webflow/website-builder pages that do not map cleanly to owned app components
- AI-generated designs that need translation into editable, reusable blocks
- developer handoffs that depend on manual interpretation instead of reusable structure

FlowStack should recommend:

- Figma component creation
- design token extraction
- code component creation
- mapping between Figma components and code components
- migration from builder-only pages to owned surfaces or feature slices
- keeping the current site builder while extracting specific owned capabilities
- a staged handoff repair plan

FlowStack should avoid blame language. The output should focus on the flow that needs help and the missing layer:

> The design assets are useful, but they are not composed for implementation yet. We can create the composition layer and connect it to the component layer.

### F023 - Marketing Flow Intelligence

FlowStack must be able to analyze marketing operations as a business flow, not only as isolated content tasks.

FlowStack should detect:

- stale blog or news sections
- inconsistent social posting cadence
- missing keyword/topic strategy
- content ideas with no article output
- articles drafted but not approved
- approved content not published
- published content not distributed
- website pages with SEO gaps
- offers without supporting content
- social channels not connected to website goals
- manual approval bottlenecks

FlowStack should recommend:

- keyword and topic clusters
- content calendars
- article briefs
- article drafts
- social post variations
- image generation prompts
- approval workflows
- publishing/scheduling routes
- measurement plans
- owned content surfaces when a SaaS/blog platform is overkill

FlowStack should support human-in-the-loop marketing:

- draft-only mode
- approval-required mode
- scheduled publishing mode
- post-publish measurement mode

FlowStack should make cadence visible:

> Your last blog post was 93 days ago. Based on your services, search opportunities, and connected social channels, we recommend a 3-post-per-week flow with one weekly article and reusable social variants.

### F024 - Optimization Flow Tracking

FlowStack must track recommendations as optimization flows with measurable before/after outcomes.

An optimization flow should include:

- observed gap
- baseline metric
- recommendation
- proposed action
- estimated value
- customer decision: accepted, deferred, rejected, replaced_by_other_path
- implementation path
- shipped change
- measurement window
- actual outcome
- follow-up recommendation

Initial optimization categories:

- stale content revival
- SEO metadata improvement
- article-to-social distribution
- form conversion improvement
- missed lead/call follow-up
- page speed or UX improvement
- publishing cadence improvement
- SaaS cost reduction
- owned feature-slice replacement
- cross-stack bridge improvement

FlowStack should support comparisons:

- before vs after
- recommended path vs chosen path
- current SaaS path vs owned slice path
- manual workflow vs composed flow
- old content state vs revived content state

FlowStack should be able to say:

> We recommended this change, you deferred it, and the gap is still present.

or:

> You approved this change, it shipped, and the measured result improved by X over the baseline.

FlowStack should never overclaim attribution. It should show evidence, confidence, and assumptions.

### F025 - Portfolio Capability Registry

FlowStack must discover and catalog reusable capabilities across approved local and cloud workspaces.

Capabilities may come from:

- old projects
- client prototypes
- internal tools
- worktrees
- agent runs
- package folders
- service modules
- UI components
- edge functions
- scripts
- design systems
- pricing/model registries
- documented playbooks

Each detected capability should include:

- source workspace
- source path/repo
- capability type
- business purpose
- implementation stack
- dependencies
- APIs/interfaces
- portability level
- extraction difficulty
- ownership status
- known tests/docs
- reuse recommendation

FlowStack should support these recommendation outcomes:

- reuse as-is
- wrap behind an API
- extract into a package
- convert into a widget
- turn into a FlowStack playbook
- leave as reference only
- ignore

FlowStack should be able to say:

> Before we build this, you already have a similar capability in another workspace.

### F026 - Provider and Model Resilience

FlowStack must track provider/model dependencies and support fallback recommendations.

For AI/model/media/provider usage, FlowStack should track:

- provider name
- model/API used
- capability served
- cost profile
- rate limits
- quality notes
- restrictions/terms risk
- fallback providers
- last verified date
- known failures
- affected stack entities

FlowStack should recommend:

- keep current provider
- add fallback provider
- route certain tasks to a cheaper provider
- route certain tasks to a higher-quality provider
- avoid a provider for a specific use case
- update model registry/pricing
- create a provider abstraction layer

FlowStack should make lock-in visible:

> This workflow depends on one provider. If that provider changes terms, rate limits, or pricing, these business capabilities are affected.

### F027 - Flow Repair Memory

FlowStack must detect recurring tool, shell, hook, dependency, and bridge failures across approved scan runs, agent sessions, logs, and local toolprints.

FlowStack should track:

- repeated error text or failure signatures
- affected tool or workflow layer
- affected project/workspace
- execution context: OS, shell, PATH, package manager, runtime, container, agent harness
- first seen and last seen timestamps
- frequency and affected agents
- suspected root cause
- known workaround or previous fix
- whether the fix was applied, deferred, ignored, or superseded

Initial repair categories:

- missing CLI
- CLI configured but unavailable in current shell
- shell mismatch
- Windows/macOS/Linux command mismatch
- missing hook target
- noisy or stale hook
- package version drift
- worktree/symlink/permission failure
- Git lock/upstream configuration failure
- local issue tracker not bridged to external issue tracker
- local agent memory exists but is not being used by the active agent layer

FlowStack should generate recommendations such as:

- install missing tool
- update PATH
- create a project execution profile
- switch command fallback for the current OS/shell
- update a package or hook
- disable or replace a broken hook
- bridge local issues to GitHub, Linear, Jira, or another chosen issue layer
- record a permanent flow rule so future agents do not repeat the same mistake

FlowStack should be able to say:

> This exact failure has happened six times across two agent tools. The fix is known. Do you want FlowStack to apply it or record it as a project rule?

## Public Messaging Direction

The marketing site should stop leading with "all-in-one CRM" language.

FlowStack's public message should be:

> Stop trying to keep up with every AI tool. Own the flow they all depend on.

Supporting copy:

> Your stack will change. Your business should not have to start over every time it does. FlowStack maps your tools, agents, repos, workflows, SaaS, and local projects so you can see what is working, where we can help, what should stay rented, and what should become owned software.

Hero direction:

- Headline: "Own your flow while the stack changes."
- Subhead: "FlowStack maps your business stack, finds where we can help, and helps you keep, connect, improve, replace, or own the right pieces."
- Primary CTA: "Get a FlowStack Audit"
- Secondary CTA: "See an Example Flow Map"

Tone:

- calm, direct, and practical
- anti-hype without being anti-AI
- ownership-first
- tool-agnostic
- "we flow with you, not against you"

Avoid:

- claiming FlowStack is an OS
- presenting FlowStack as only a CRM alternative
- pretending the customer can keep up with every AI launch
- forcing replacement as the default answer
- attacking tools customers already use

The current site can evolve without a full rebuild. Keep the existing visual shell, authentication path, dashboard shell, and module cards, but rewrite the page around the FlowStack Audit wedge. The first conversion should be an assessment, not a generic free trial.

Fulfillment reference: `docs/FLOWSTACK_AUDIT_FULFILLMENT_PLAYBOOK.md`

## Non-Functional Requirements

### Security

- Read-only by default.
- Secrets must be stored server-side or in customer-owned secret stores.
- Browser-exposed API keys must not be used for production agent execution.
- OAuth scopes must be visible and revocable.
- Every agent action must be tied to organization, user, agent, tool, and permission.

### Privacy

- FlowStack must explain what is observed and why.
- Customers must be able to disable sources.
- Sensitive raw payload storage should be minimized.
- Env values should not be collected during scanning unless explicitly permitted.

### Reliability

- Observers must degrade gracefully.
- Connector failures should produce health signals, not break the app.
- Recommendations should cite evidence.

### Portability

- Owned outputs should be exportable.
- Generated code should be committed to customer-owned repositories where possible.
- FlowStack should not create hidden lock-in around generated assets.

### Recommendation Trust

- FlowStack must separate provider fit from provider monetization.
- Sponsored or paid provider relationships must be disclosed when relevant.
- Customers should understand why a recommendation was made.
- FlowStack should be able to recommend "do nothing," "keep current tool," or "build owned software" even when a paid provider exists.

## Suggested Data Model Additions

### `stack_workspaces`

Represents a connected local or cloud workspace.

Fields:

- id
- organization_id
- name
- workspace_type: local, github_org, cloud_account, manual
- workspace_role: parent_root, business, project, tool_instance
- parent_workspace_id
- root_reference
- discovery_scope: exact, immediate_children, recursive
- registered_in_entity_id
- status
- last_scanned_at
- created_at
- updated_at

### `workspace_scan_runs`

Represents an approved scanner execution against a local root, repo, cloud workspace, or imported scan result.

Fields:

- id
- organization_id
- workspace_id
- scan_target_ref
- scan_mode: shallow, summary, deep, imported
- approved_by_user_id
- approved_at
- include_patterns jsonb
- ignore_patterns jsonb
- commands_executed jsonb
- files_considered jsonb
- files_summarized jsonb
- skipped_secret_refs jsonb
- scanner_version
- started_at
- completed_at
- status: queued, running, completed, failed, cancelled
- error_summary
- result_summary jsonb
- audit_ref
- created_at

### `local_toolprints`

Represents shallow, consent-scoped local tool evidence discovered from profile folders, project folders, and execution context.

Fields:

- id
- organization_id
- workspace_id
- scan_run_id
- tool_name
- tool_category: ai_assistant, coding_agent, workflow_planning, issue_tracker, orchestration, memory_context, mcp_gateway, source_control, cloud_provider, deployment, runtime, package_manager, other
- observed_ref
- observed_kind: dot_folder, project_folder, config_file, cli_available, cli_missing, env_marker, app_data, other
- last_modified_at
- inferred_role
- execution_context_status: available, configured_but_unavailable, present_but_unknown, unavailable
- related_entity_id
- flow_question
- evidence jsonb
- confidence
- status: discovered, confirmed, linked, ignored, archived
- created_at
- updated_at

### `stack_entities`

Generic registry entity.

Fields:

- id
- organization_id
- workspace_id
- entity_type
- name
- source
- external_id
- path_or_url
- metadata jsonb
- status
- created_at
- updated_at

### `stack_relationships`

Relationships between registry entities.

Fields:

- id
- organization_id
- from_entity_id
- to_entity_id
- relationship_type
- confidence
- evidence jsonb
- created_at

### `stack_interfaces`

Represents the safe communication surfaces exposed by a stack entity.

Fields:

- id
- organization_id
- entity_id
- interface_type: event_source, command_target, state_snapshot, api, webhook, mcp, cli, file_folder, database, browser_surface, agent_session, deployment_target
- name
- protocol
- capabilities jsonb
- emitted_events jsonb
- accepted_commands jsonb
- readable_state jsonb
- write_permissions jsonb
- credential_reference_id
- scopes jsonb
- cost_model jsonb
- rate_limits jsonb
- trust_level
- approval_required boolean
- status
- last_verified_at
- metadata jsonb
- created_at
- updated_at

### `workspace_observations`

Records discoveries made while comparing a parent workspace with the known FlowStack registry and lower-layer tool registries.

Fields:

- id
- organization_id
- workspace_id
- observed_path_or_ref
- observation_type: new_project, unregistered_project, duplicate_project, duplicate_control_plane, external_write, stale_git_state, shared_dependency, stack_drift, reusable_capability_candidate, ignored_path
- related_entity_id
- confidence
- evidence jsonb
- resolution_status: open, linked, registered, ignored, archived, converted_to_recommendation
- first_observed_at
- last_observed_at
- created_at

### `workspace_project_summaries`

Represents first-pass project understanding created from approved shallow files.

Fields:

- id
- organization_id
- workspace_id
- observed_path_or_ref
- readme_refs jsonb
- manifest_refs jsonb
- declared_purpose
- inferred_business_purpose
- stack_summary jsonb
- package_manager
- framework_signals jsonb
- deployment_signals jsonb
- data_service_signals jsonb
- agent_tool_signals jsonb
- activity_summary jsonb
- similarity_refs jsonb
- stack_status: current, stale, experimental, unknown
- drift_rationale
- recommended_question
- confidence
- created_at
- updated_at

### `flow_events`

Normalized event stream.

Fields:

- id
- organization_id
- source_entity_id
- event_type
- occurred_at
- actor_type
- actor_id
- subject_type
- subject_id
- properties jsonb
- raw_ref

### `flow_recommendations`

Detected gaps and proposed actions.

Fields:

- id
- organization_id
- recommendation_type
- title
- summary
- evidence jsonb
- impact jsonb
- confidence
- status: open, approved, dismissed, executing, completed, failed
- proposed_actions jsonb
- created_at
- updated_at

### `agent_teams`

Feature-team level orchestration.

Fields:

- id
- organization_id
- name
- objective
- status
- owner_user_id
- context jsonb
- created_at
- updated_at

### `agent_team_members`

Agent role assignments.

Fields:

- id
- team_id
- agent_id
- role
- scope
- allowed_tools jsonb
- denied_tools jsonb
- write_boundaries jsonb
- status

### `owned_builds`

Customer-owned generated software artifacts.

Fields:

- id
- organization_id
- recommendation_id
- build_type
- repo_url
- deployment_url
- status
- ownership_model
- metadata jsonb
- created_at
- updated_at

### `feature_slices`

Represents narrow capabilities that may live inside a SaaS, owned app, widget, component, workflow, or provider integration.

Fields:

- id
- organization_id
- source_entity_id
- name
- business_purpose
- slice_type: widget, component, form, workflow_action, api_route, webhook, page_section, integration, data_sync, automation
- current_location
- dependencies jsonb
- interfaces jsonb
- data_reads jsonb
- data_writes jsonb
- embedding_targets jsonb
- ownership_model: rented, customer_owned, provider_managed, unknown
- portability_status: portable, partially_portable, locked_in, unknown
- replacement_complexity
- recurring_cost_estimate jsonb
- owned_build_estimate jsonb
- recommendation_id
- status
- metadata jsonb
- created_at
- updated_at

### `stack_exit_maps`

Represents the memory needed to leave, bypass, bridge, or replace a stack layer later.

Fields:

- id
- organization_id
- source_entity_id
- layer_name
- adoption_reason
- dependent_capabilities jsonb
- owned_data jsonb
- emitted_events jsonb
- accepted_commands jsonb
- credentials_required jsonb
- human_users jsonb
- agent_users jsonb
- cost_profile jsonb
- known_limits jsonb
- replacement_options jsonb
- bridge_options jsonb
- migration_risks jsonb
- exit_readiness: unknown, low, medium, high
- last_reviewed_at
- metadata jsonb
- created_at
- updated_at

### `agent_capabilities`

Represents the agent bench FlowStack can route to when a customer request or recommendation needs agent work.

Fields:

- id
- organization_id
- agent_id
- name
- capability_type
- preferred_inputs jsonb
- allowed_tools jsonb
- denied_tools jsonb
- risk_level
- cost_profile jsonb
- output_types jsonb
- verification_requirements jsonb
- stack_familiarity jsonb
- status
- metadata jsonb
- created_at
- updated_at

### `stack_bridges`

Represents a proposed or active bridge between two systems.

Fields:

- id
- organization_id
- source_entity_id
- target_entity_id
- bridge_type
- business_capability
- interface_contract jsonb
- auth_requirements jsonb
- data_contract jsonb
- failure_modes jsonb
- rollback_plan jsonb
- ownership_impact
- status: proposed, approved, active, paused, retired, failed
- recommendation_id
- created_at
- updated_at

### `component_layers`

Represents a discovered or proposed reusable component architecture inside a codebase.

Fields:

- id
- organization_id
- workspace_id
- repo_entity_id
- name
- current_library_stack jsonb
- target_library_stack jsonb
- component_root
- token_strategy
- migration_strategy
- status: discovered, proposed, approved, in_progress, active, retired
- recommendation_id
- metadata jsonb
- created_at
- updated_at

### `component_inventory`

Represents component candidates, duplicates, and dependencies discovered inside a project.

Fields:

- id
- organization_id
- component_layer_id
- source_path
- component_name
- component_type: primitive, composed, feature_local, layout, form, table, modal, navigation, unknown
- current_library
- recommended_home
- duplicate_group_id
- dependencies jsonb
- used_by jsonb
- migration_status: untouched, wrapper_created, migrated, deprecated, removed
- risk_level
- metadata jsonb
- created_at
- updated_at

### `design_handoffs`

Represents the relationship between design sources, builder surfaces, and implementation components.

Fields:

- id
- organization_id
- workspace_id
- design_source_entity_id
- code_entity_id
- builder_entity_id
- handoff_type: figma_to_code, builder_to_code, ai_design_to_code, manual_design_to_code
- design_component_health: unknown, weak, partial, strong
- token_health: unknown, missing, inconsistent, mapped
- code_component_health: unknown, missing, partial, strong
- repeated_patterns jsonb
- proposed_design_components jsonb
- proposed_code_components jsonb
- token_mapping jsonb
- bridge_plan jsonb
- status: discovered, proposed, approved, in_progress, repaired, ignored
- recommendation_id
- metadata jsonb
- created_at
- updated_at

### `marketing_flows`

Represents a composed marketing operation across website, SEO, content, social, approvals, and publishing.

Fields:

- id
- organization_id
- workspace_id
- name
- website_entity_id
- target_audience jsonb
- offers jsonb
- keyword_clusters jsonb
- content_pillars jsonb
- cadence jsonb
- channels jsonb
- approval_policy
- publishing_targets jsonb
- measurement_plan jsonb
- status: discovered, proposed, approved, active, paused, retired
- recommendation_id
- metadata jsonb
- created_at
- updated_at

### `content_items`

Represents articles, posts, image assets, briefs, and campaign units in a marketing flow.

Fields:

- id
- organization_id
- marketing_flow_id
- content_type: article, blog_post, social_post, image_prompt, image_asset, email, landing_page_section, brief
- title
- target_keyword
- topic_cluster
- source_url
- draft_ref
- asset_refs jsonb
- approval_status: idea, briefed, drafted, needs_review, approved, scheduled, published, rejected, archived
- channel_targets jsonb
- scheduled_at
- published_at
- metrics jsonb
- metadata jsonb
- created_at
- updated_at

### `optimization_flows`

Represents a recommendation tracked from observed gap through decision, implementation, and measured outcome.

Fields:

- id
- organization_id
- recommendation_id
- flow_type: content_revival, seo_improvement, conversion_improvement, lead_followup, cadence_improvement, cost_reduction, owned_slice, bridge_improvement, other
- title
- observed_gap
- baseline_metric jsonb
- estimated_value jsonb
- proposed_action jsonb
- decision_status: open, accepted, deferred, rejected, replaced_by_other_path
- decision_reason
- chosen_path jsonb
- implementation_ref
- shipped_at
- measurement_window jsonb
- actual_outcome jsonb
- attribution_confidence
- assumptions jsonb
- follow_up_recommendation_id
- status: observing, recommended, approved, implementing, measuring, completed, closed
- metadata jsonb
- created_at
- updated_at

### `flow_breakpoints`

Represents recurring failures that interrupt a business, development, or agent workflow.

Fields:

- id
- organization_id
- workspace_id
- source_entity_id
- scan_run_id
- breakpoint_type: missing_cli, cli_unavailable, shell_mismatch, os_command_mismatch, missing_hook, noisy_hook, package_version_drift, worktree_failure, symlink_failure, permission_failure, git_lock_failure, issue_bridge_gap, memory_bridge_gap, provider_failure, other
- signature
- normalized_error
- raw_refs jsonb
- execution_context jsonb
- affected_tools jsonb
- affected_agents jsonb
- first_seen_at
- last_seen_at
- occurrence_count
- suspected_root_cause
- known_workaround
- recommended_repair_id
- severity
- confidence
- status: open, acknowledged, repair_proposed, repair_approved, repaired, ignored, superseded
- metadata jsonb
- created_at
- updated_at

### `flow_repairs`

Represents proposed or approved fixes for recurring workflow breakpoints.

Fields:

- id
- organization_id
- workspace_id
- breakpoint_id
- repair_type: install_tool, update_path, create_execution_profile, command_fallback, update_package, update_hook, disable_hook, issue_bridge, memory_bridge, provider_fallback, document_rule, other
- title
- rationale
- proposed_change jsonb
- approval_required boolean
- approved_by_user_id
- approved_at
- applied_at
- verification_result jsonb
- rollback_plan jsonb
- status: proposed, approved, applied, verified, failed, rejected, archived
- metadata jsonb
- created_at
- updated_at

### `content_snapshots`

Represents periodic snapshots of website/content/social state for before/after comparison.

Fields:

- id
- organization_id
- source_entity_id
- snapshot_type: website_page, blog_index, article, social_profile, campaign, seo_scan
- url
- title
- published_at
- last_modified_at
- extracted_text_ref
- seo_metrics jsonb
- traffic_metrics jsonb
- engagement_metrics jsonb
- conversion_metrics jsonb
- freshness_score
- created_at

### `capability_assets`

Represents reusable capabilities discovered across approved workspaces.

Fields:

- id
- organization_id
- workspace_id
- source_entity_id
- name
- capability_type: ui_component, widget, service_module, api_route, edge_function, media_pipeline, content_flow, design_system, agent_playbook, provider_registry, script, workflow, other
- business_purpose
- source_path
- implementation_stack jsonb
- dependencies jsonb
- interfaces jsonb
- tests_refs jsonb
- docs_refs jsonb
- ownership_status: customer_owned, internal_owned, client_owned, third_party, unknown
- portability_level: reusable_as_is, wrap_needed, extract_needed, reference_only, not_reusable
- extraction_difficulty
- estimated_reuse_value jsonb
- status: discovered, proposed, approved, extracted, wrapped, ignored, retired
- metadata jsonb
- created_at
- updated_at

### `provider_dependencies`

Represents provider/model/runtime dependencies used by stack entities and capability assets.

Fields:

- id
- organization_id
- source_entity_id
- capability_asset_id
- provider_name
- model_or_api
- capability_served
- cost_profile jsonb
- rate_limits jsonb
- restrictions jsonb
- quality_notes
- fallback_options jsonb
- last_verified_at
- risk_level
- status: active, fallback, deprecated, blocked, unknown
- metadata jsonb
- created_at
- updated_at

### `verified_providers`

Represents tools, SaaS vendors, agencies, consultants, implementation partners, and builders eligible for fit-based recommendation.

Fields:

- id
- name
- provider_type
- website_url
- supported_tools jsonb
- supported_use_cases jsonb
- industries jsonb
- pricing_model
- implementation_model
- verification_status
- last_verified_at
- stale_risk_score
- ai_readiness_notes
- ownership_impact
- support_expectations
- relationship_type
- relationship_disclosure
- metadata jsonb
- created_at
- updated_at

### `provider_recommendations`

Links a recommendation to eligible providers and records the fit rationale.

Fields:

- id
- organization_id
- recommendation_id
- provider_id
- fit_score
- rationale
- expected_savings jsonb
- tradeoffs jsonb
- relationship_disclosed boolean
- status
- created_at

## MVP Scope

### MVP Goal

Deliver a read-mostly FlowStack intelligence loop that proves the thesis:

> FlowStack can inspect approved business/project/tool context, detect real gaps, and recommend whether to improve an existing tool or build an owned slice.

### MVP Features

1. Stack Workspace setup
2. Parent workspace and project scanner UI backed by existing scanner
3. Transparent scanner run history and audit view
4. Local user-profile toolprint scan for approved dot-folder metadata
5. Stack Registry dashboard
6. Tool and project detection for current scanner patterns
7. Manual connector records for GHL, HubSpot, Vapi, Replit, Zapier, Composio, Archon, Paperclip, Agent Town, DeerFlow, local continuity dashboards, Claude-Mem, Claude Code, Codex
8. Business event ingestion API
9. Recommendation list
10. Initial detectors:
   - project/tool inventory
   - local human toolprint inventory
   - README/manifest portfolio summaries
   - unregistered active projects
   - parent workspace contains active child project not registered to a business
   - duplicate or overlapping control planes
   - same repo appears to be touched by multiple agent runtimes or editors
   - config folder exists but corresponding CLI is unavailable in the current execution context
   - local issue/planning layer is present but not bridged to GitHub, Linear, Jira, or the customer's chosen external issue system
   - same tool/hook/shell/worktree error appears across repeated agent or workflow runs
   - known environment repair exists but has not been applied to the active project
   - repeated stack preferences across projects
   - older projects that appear to have stack drift from the customer's current direction
   - detected communication interfaces without registered ownership or permission boundaries
   - SaaS/process appears to be used for only a narrow replaceable capability
   - feature slice is trapped inside a platform but could be embedded or owned
   - stack layer has no exit map or migration memory
   - business flow is split across hosting/CRM/builder systems without a bridge
   - agent request needs a specialized subset of the agent bench
   - repeated agent/tool presence
   - missing docs/instructions
   - repeated component library signals
   - component layer is missing or scattered across feature folders
   - design-to-code handoff is missing a composition layer
   - marketing cadence is stale or blocked before publishing
   - content exists but is not mapped to SEO/social distribution
   - old content has strength but needs revival/optimization
   - recommendation was deferred and the same gap is still present
   - approved optimization has no before/after measurement
   - requested capability already exists in another approved workspace
   - workflow depends on one provider/model with no fallback
   - missed-call/no-follow-up imported events
   - funnel failure imported events
11. Flow breakpoint and repair recommendation list
12. Agent team planning UI
13. Approval workflow for recommendations
14. Manual FlowStack Verified provider records
15. Fit-based provider recommendation disclosure

### MVP Non-Goals

- Fully autonomous remediation
- Broad SaaS connector marketplace
- Replacing CRMs
- Replacing Replit/Bolt/Lovable/v0
- Browser activity capture without explicit installation/consent
- Secret value scanning
- Enterprise DLP
- Paid recommendation ranking

## Development Slices

### Slice 1 - PRD and Vocabulary Alignment

- Add this PRD.
- Update product language away from "GoHighLevel alternative" as the primary category.
- Define registry terms in docs.

### Slice 2 - Stack Registry Schema

- Add database schema for workspaces, stack entities, stack interfaces, relationships, events, recommendations, agent teams, and owned builds.
- Add RLS policies scoped by organization.

### Slice 3 - Scanner Product Surface

- Add UI for scanning a project or importing a scan result.
- Add UI for scanning approved parent roots and reviewing discovered child projects.
- Add transparent scanner run history showing approved root, scan depth, include/ignore rules, commands executed, files summarized, and skipped secret-like refs.
- Add local user-profile toolprint scanning for approved dot-folder metadata and execution-context gaps.
- Add README and manifest harvesting for first-pass project summaries.
- Store scan result into stack registry.
- Map existing scanner detections to stack entities.
- Store unresolved parent-root discoveries as workspace observations.
- Detect unbridged planning/issue layers such as GSD, Beads, GitHub, Linear, or Jira.
- Detect recurring flow breakpoints such as missing CLIs, shell mismatches, broken hooks, worktree failures, Git lock failures, and issue-sync gaps.
- Generate repair recommendations that can become approved environment fixes or project flow rules.
- Detect repeated stack preferences and stack drift across approved projects.
- Detect reusable capability assets across approved workspaces.

### Slice 4 - Business Events API

- Add a normalized event ingestion endpoint.
- Create event source types for web surface, CRM, call, workflow, agent, and manual import.
- Map event sources and command targets into stack interfaces so FlowStack can explain how systems communicate.

### Slice 5 - Recommendation Engine v1

- Implement rule-based detectors first.
- Store recommendations with evidence.
- Build list/detail UI.

### Slice 6 - Agent Team Planning

- Add agent team concept to AI Agents module.
- Generate a feature-team plan from a recommendation.
- Keep execution gated and mostly manual at first.
- Add contextual agent routing so FlowStack can select only the agents needed for the request.

### Slice 7 - Owned Build Bridge

- Add "Create owned build plan" action.
- Generate repo/app specification from recommendation.
- Route to existing builder, GitHub, Replit, or local agent runtime based on customer settings.
- Add SaaS capability decomposition to justify why the owned slice is worth building.
- Add portable feature-slice plans for widgets, components, workflow actions, and embeddable capabilities.

### Slice 7B - Component Layer Audit

- Add repo scan for component inventory, duplicate UI patterns, and library usage.
- Generate a proposed component-layer structure.
- Create an incremental migration plan.
- Connect component findings to owned-build and feature-slice recommendations.

### Slice 7C - Design Handoff Repair

- Add manual design-source records for Figma, Wix, Webflow, AI-generated designs, and static prototypes.
- Detect repeated design patterns and missing component/token structure.
- Generate a design-to-code bridge plan.
- Connect design handoff findings to component-layer and owned web/editor slice recommendations.

### Slice 7D - Marketing Flow Audit

- Add marketing-flow records for website, social channels, SEO targets, content cadence, and approval policy.
- Detect stale content cadence and missing SEO/social distribution.
- Generate article, social, image, approval, and publishing recommendations.
- Keep execution human-approved in MVP.

### Slice 7E - Optimization Flow Measurement

- Add optimization-flow records connected to recommendations.
- Store baseline snapshots for content, SEO, cadence, conversion, or cost gaps.
- Track customer decision and chosen path.
- Add simple before/after measurement summaries.
- Surface deferred recommendations when the gap remains unresolved.

### Slice 7F - Portfolio Capability Reuse

- Add capability-asset records for reusable components, widgets, services, media pipelines, scripts, and playbooks.
- Add provider-dependency records for model/API/runtime usage.
- Recommend reuse before new build when a matching capability exists.
- Add fallback/provider-risk recommendations for critical AI/media workflows.

### Slice 8 - Continuous Monitoring

- Add scheduled scans and connector health checks.
- Add alerts for changed risk/gap states.
- Add exit-map freshness checks for critical stack layers.
- Add bridge health checks for active cross-stack bridges.

### Slice 9 - Verified Provider Network

- Add provider registry schema and admin UI.
- Add verification metadata and stale-risk status.
- Add provider fit scoring to recommendations.
- Add relationship disclosure to recommendation detail pages.
- Keep ranking fit-based, not paid-placement based.

## Success Metrics

### Product Value

- Number of connected workspaces per organization
- Number of parent workspaces scanned
- Number of active child projects discovered
- Number of unregistered projects resolved
- Number of duplicate or overlapping control planes detected
- Number of detected stack entities
- Number of recommendations created
- Recommendation approval rate
- Recommendations that result in improved existing tools
- Recommendations that result in owned builds
- Measured recovered leads, reduced response time, avoided downtime, or reduced wasted spend

### Agent Operations

- Agent team plans created
- Agent team tasks completed
- Human review acceptance rate
- Tool-call failure rate
- Cost per completed outcome

### Ownership

- Owned builds created
- Owned builds deployed
- Owned builds still active after 30/60/90 days
- SaaS features replaced or reduced because an owned slice exists

### Provider Network

- Verified providers listed
- Provider recommendations accepted
- Estimated customer savings from provider switches
- Customer-reported provider outcome quality
- Provider stale-risk changes caught before customer harm
- Recommendations where FlowStack correctly said "keep current provider"

## Open Questions

1. What is the first paid wedge: local developer stack audit, agency/business SaaS audit, or funnel/call monitoring?
2. Which connectors matter first: HubSpot, GoHighLevel, Vapi, GitHub, Replit, Zapier, Composio, Vercel, Supabase?
3. Should local FlowStack run as a desktop app, CLI daemon, browser extension, or all three over time?
4. How much event capture should FlowStack-owned web components perform by default?
5. What is the approval UX for moving from recommendation to agent team execution?
6. How should FlowStack price the generic observer tier versus custom development/owned build tier?
7. Which agent runtimes should FlowStack orchestrate directly, and which should remain external integrations?
8. What criteria make a provider FlowStack Verified?
9. How should FlowStack disclose paid provider relationships without turning recommendations into ads?
10. Should stale or risky providers be hidden, demoted, or shown with warnings?
11. What is the safest first parent-workspace scan scope: one selected folder, immediate children only, or full recursive scan with exclusions?
12. How should FlowStack distinguish personal experiments from business-relevant unregistered projects?
13. Should FlowStack write registration data into lower-layer tools like Paperclip, or only recommend the change until an explicit connector exists?

## Risks

### Category Confusion

FlowStack can sound like CRM, SaaS management, observability, process mining, AI app builder, or agent runtime. The product must keep returning to the core loop: observe, understand, recommend, act, own.

### Trust

Customers will not grant broad access without clear boundaries. Read-only defaults, visible scopes, and human approvals are required.

### Too Many Connectors

Trying to support every SaaS at once will slow the product. Start with manual/CSV/webhook/event ingestion and a few high-leverage integrations.

### Over-Automation

Enterprise customers may not trust fully autonomous writes. FlowStack should build confidence through evidence, proposed plans, approvals, and audit trails.

### Competing With Partners

FlowStack should not frame Replit, Archon, Composio, Zapier, or Vapi as enemies. It should route work through them when they are already present and useful.

### Provider Trust Erosion

If providers can buy placement, FlowStack loses its core trust. Provider monetization must be separate from fit-based recommendation ranking.

### Local Workspace Overreach

Parent-root scanning can feel invasive if it is too broad. FlowStack should start with explicit folder selection, clear scope, secret-safe scanning, ignore rules, and visible explanations for why a project was flagged.

## Summary

FlowStack is bigger than a CRM or automation app. It is the agnostic intelligence layer above a business stack. It watches authorized signals, learns how the business operates, finds gaps, and helps the user decide what to keep, improve, connect, replace, or own.

The key shift is from building isolated software components to managing business outcomes through agent teams, existing SaaS, workflows, and owned software delivery.

FlowStack should make a customer's stack:

- visible
- understandable
- improvable
- recoverable
- and, when it matters, ownable
