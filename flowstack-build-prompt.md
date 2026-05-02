# FlowStack: AI-Native Business Platform — Complete Build Prompt

You are building FlowStack, a modern alternative to GoHighLevel that reimagines what a business operating system should be. This is not a feature-for-feature clone—it's a ground-up rethinking with AI woven into every interaction, modular architecture that lets users enable only what they need, and workflow automation that can be triggered from anywhere in the application rather than living in a siloed automation section.

## Core Vision

The platform serves agencies, small businesses, and entrepreneurs who need CRM, marketing automation, website/funnel building, and client management in one place. What makes FlowStack different: every feature has an AI co-pilot that can build, configure, and optimize on the user's behalf. A user should be able to say "set up my real estate agency with a lead capture funnel, automated follow-up sequence, and appointment booking" and watch the AI configure everything in minutes rather than days.

## Technical Foundation

Build this as a Next.js 14+ application using the App Router. Use TypeScript throughout with strict type checking. For state management, combine Zustand for global client state with React Query (TanStack Query) for all server state, caching, and synchronization. Style everything with Tailwind CSS using a custom design system, and use Radix UI primitives for accessible interactive components. The backend runs through Next.js API routes with tRPC for end-to-end type safety. Use PostgreSQL through Prisma ORM with a multi-tenant architecture where every piece of data is scoped to an organization. Redis handles caching, session management, and serves as the queue backend for BullMQ which powers the workflow execution engine. File storage goes to S3-compatible storage like Cloudflare R2. For AI, integrate Anthropic's Claude API as the primary LLM with function calling for structured actions, use OpenAI's embedding models for semantic search stored in pgvector, and optionally integrate ElevenLabs and Deepgram for voice features. Authentication should support multi-tenant access with organization switching, role-based permissions, and granular feature-level access control using Clerk or NextAuth.

## The Modular Feature System

This is the architectural heart of FlowStack. Every capability is a self-contained module that can be enabled or disabled per organization. When disabled, a module's routes don't load, its sidebar items disappear, its dashboard widgets hide, and its workflow triggers and actions become unavailable. This isn't just UI hiding—the code itself should be structured so disabled modules have zero runtime cost.

Create a feature registry that defines each module with its unique identifier, display name, description, category (crm, marketing, automation, builder, analytics, or ai), dependency list of other module IDs it requires, pricing tier, route definitions, sidebar navigation items, dashboard widget definitions, workflow triggers it provides, workflow actions it provides, AI capabilities it exposes, and lifecycle hooks for enable, disable, and install events.

The core modules to build are: Core Dashboard (customizable widget-based dashboard builder), Core CRM (contacts, companies, deals pipeline, activities, tasks), Site Builder (drag-drop page and funnel builder with hosting), Form Builder (multi-step forms with conditional logic and embedding), Email Marketing (campaigns, sequences, templates, analytics), SMS Marketing (text campaigns and automation), Calendar Booking (appointment scheduling with availability management), Workflow Automation (the n8n-style visual workflow engine), AI Assistant (platform-wide AI co-pilot and command bar), Analytics Suite (reporting, dashboards, custom reports), Reputation Manager (review requests and monitoring), Social Planner (social media scheduling), Membership Sites (courses and gated content), Invoicing (payments, invoices, subscriptions), Phone System (VoIP, call tracking, recordings), and Chat Widget (website chat with AI chatbot mode).

Each module should expose its capabilities to other modules through a clean internal API. For example, the Form Builder module exposes a function to embed forms anywhere, the CRM module exposes contact lookup and creation, and the Workflow module exposes trigger registration and action execution.

## Database Architecture

Design the schema for multi-tenancy from day one. The Organization model holds the tenant ID that scopes everything, stores which feature module IDs are enabled as an array, contains organization-wide settings as JSON, and relates to all tenant-specific data. The User model connects to an organization with a role and granular permissions array. 

The CRM models include Contact with fields for email, phone, name, company, tags array, custom fields JSON, lead score, pipeline stage, source, assigned user, plus AI-generated fields for summary and suggested next action. The Company model groups contacts. The Deal model tracks opportunities through pipeline stages with value, probability, expected close date, and associated contacts. The Activity model logs all interactions including emails, calls, meetings, notes, and tasks with polymorphic association to contacts, deals, or companies.

For the Site Builder, the Site model contains pages, has a published status, custom domain configuration, and global styles. The Page model stores the block tree as JSON, has SEO metadata, and tracks published versus draft versions. Forms have their own model with field definitions JSON, settings for notifications and redirects, and styling configuration.

The Workflow models include Workflow with name, description, status (active, paused, draft), the full workflow definition as JSON containing triggers, nodes, and connections, plus execution settings. WorkflowExecution logs every run with status, started and completed timestamps, trigger data, node execution logs, and any error information. WorkflowQueue handles pending executions with priority and scheduled time.

For communication, EmailTemplate stores reusable templates, EmailCampaign tracks mass sends, EmailSequence defines automated drip sequences with steps, and EmailSend logs individual sends with open, click, and reply tracking. Mirror these patterns for SMS.

## The Workflow Engine Deep Dive

This is where FlowStack diverges most significantly from competitors. Instead of workflows being a separate feature you navigate to, workflow triggers and actions are embedded throughout the entire application. When a user creates a form, they see a "When submitted, trigger workflow" option right there. When viewing a contact, they see "Start workflow for this contact." When building a page, any button can have "Trigger workflow on click." The workflow system is the nervous system connecting everything.

The trigger system supports these categories: CRM triggers fire on contact created, updated, deleted, tag added, tag removed, field changed, score threshold reached, stage changed, or assigned user changed. Deal triggers fire on created, stage changed, won, lost, value changed, or stalled for X days. Form triggers fire on any submission, submission matching conditions, or specific field values. Site triggers fire on page view, button click, element visibility, scroll depth, exit intent, or time on page threshold. Email triggers fire on sent, delivered, opened, clicked specific link, replied, bounced, or unsubscribed. Calendar triggers fire on appointment booked, rescheduled, cancelled, reminder due, or no-show detected. Schedule triggers fire on cron expressions, specific dates, recurring patterns, or relative to contact dates like birthdays or renewal dates. Webhook triggers accept external HTTP calls. Integration triggers fire on events from connected apps like Stripe payment received or Shopify order placed. AI triggers fire when sentiment analysis detects thresholds, patterns are detected in behavior, anomalies appear in data, or AI determines a natural language condition is met.

Every trigger supports conditions that filter when it actually fires. Conditions can check any field on the triggering entity, use comparison operators including equals, not equals, contains, greater than, less than, is empty, is not empty, matches regex, and is in list. Conditions can be grouped with AND/OR logic and can reference data from related entities.

The action nodes available in workflows span all modules. CRM actions include create contact, update contact, delete contact, add tag, remove tag, set field, change pipeline stage, assign to user, create task, add note, merge contacts, and calculate lead score. Communication actions include send email (template or dynamic), send email sequence, stop sequence, send SMS, send internal notification, and create task for user. Site actions include show popup, redirect page, personalize content block, and track conversion. Data actions include HTTP request to external API, transform data with mapping, lookup records in database, create record, update record, aggregate data from multiple sources, and set workflow variable. Flow control actions include conditional branching, switch with multiple branches, delay for duration, wait until specific time, wait for event to occur, loop over array, run branches in parallel, call sub-workflow, stop workflow, and go to node. AI actions are crucial differentiators: generate content from prompt with context, analyze text for sentiment or intent or summary, classify and score lead, make decision given options and criteria, extract structured data from unstructured text, generate personalized recommendations, and detect anomalies in data.

The visual workflow builder should feel like a modern node-based editor similar to n8n but more polished. Use a canvas with zoom and pan, nodes that can be dragged from a sidebar palette, connections made by dragging from output to input handles, a properties panel that shows configuration for selected nodes, real-time validation showing errors and warnings, execution visualization showing data flowing through when testing, and version history with the ability to restore previous versions.

Build AI deeply into the workflow builder itself. The AI can suggest the next logical node based on what's already built. It can explain what a workflow does in plain English. It can generate an entire workflow from a natural language description like "when a lead fills out the pricing form, wait 10 minutes, send them the pricing PDF, wait 2 days, if they haven't booked a call then send a follow-up email." It can optimize workflows by identifying redundant steps or suggesting parallelization. It can debug failed executions by analyzing the error and suggesting fixes.

## The Site and Funnel Builder

Build a block-based page editor that combines the ease of Notion with the design power of Webflow. Users drag blocks from a categorized sidebar onto the canvas. The canvas shows a live preview that updates instantly as properties change. A right panel shows styling controls for the selected block with visual controls for spacing, colors, typography, borders, shadows, and effects rather than raw CSS inputs, though advanced users can access CSS when needed.

Block categories include Layout (section, container, grid, columns, divider, spacer), Content (heading, paragraph, rich text, image, video, icon, button, link), Forms (input, textarea, select, checkbox, radio, file upload, date picker, phone input, form container), Commerce (pricing table, pricing card, feature list, FAQ accordion, checkout embed, order bump), Social Proof (testimonial, testimonial slider, review stars, client logos, social feed, counter/stats), Navigation (header, footer, navbar, menu, breadcrumbs, back to top), Media (image gallery, slider carousel, lightbox, before/after comparison, video gallery), Interactive (accordion, tabs, modal trigger, tooltip, progress bar, countdown timer), AI Blocks (dynamic personalized content, smart recommendations, AI chatbot embed, dynamic FAQ that answers from knowledge base), and Integration (calendar embed, Google Maps, embedded app iframe, social share buttons).

Every block stores responsive styles separately for desktop, tablet, and mobile breakpoints. Users switch between breakpoints in the editor and adjust styles per breakpoint. The editor should show device frames when previewing different breakpoints.

Here's what makes the builder special: any interactive element can trigger a workflow. A button click can trigger a workflow. Form submission triggers a workflow. Scroll to a section triggers a workflow. Exit intent triggers a workflow. This means users can build sophisticated interactive experiences without writing code—the workflow system handles all the logic.

The AI in the site builder can generate entire pages from descriptions like "create a landing page for my yoga studio with hero section, class schedule, instructor bios, testimonials, and contact form." It can rewrite copy in different tones. It can suggest design improvements. It can generate image alt text and SEO metadata. It can create variations for A/B testing. It can personalize content blocks based on visitor data from the CRM.

Pages support dynamic content from the CRM using a template syntax. A thank you page can show "Thanks, {{contact.firstName}}!" by pulling from the contact record of whoever submitted the form. This personalization is configured visually, not through code.

## Forms That Connect Everything

The form builder creates multi-step forms with conditional logic, calculation fields, file uploads, payments, and deep CRM integration. When defining a form, users add fields from a palette, configure each field's properties, validation rules, and conditional visibility, arrange fields into steps for multi-step forms, configure what happens on submission (create contact, update contact, trigger workflow, show message, redirect, send notification), style the form to match their brand, and get embed code or direct link.

Conditional logic lets fields show or hide based on other field values. Calculation fields compute values from other fields, useful for quotes or assessments. Payment fields integrate with Stripe to collect payments or deposits on submission.

The key integration: forms create or update CRM contacts automatically. Field mapping lets users connect form fields to contact fields, custom fields, and tags. On submission, the contact is created or updated, tags are applied, workflows trigger, and the user sees their configured success state.

Form analytics show submission counts, conversion rates, drop-off points in multi-step forms, field-level analytics showing which fields cause abandonment, and A/B test results when testing variations.

The AI can generate forms from descriptions like "create a home valuation request form that collects address, bedrooms, bathrooms, square footage, condition, and contact info, then calculates an estimated range." It can suggest fields based on form purpose. It can optimize forms based on analytics by suggesting which fields to remove or reorder.

## AI Integration Layer Architecture

AI is not a feature—it's a layer that enhances every feature. Build a unified AI service that maintains context and can take actions across the platform.

The AI context object that travels with every AI request includes the organization ID and settings, user ID and permissions, current module the user is in, conversation history for multi-turn interactions, and relevant data dynamically loaded based on context like recent contacts, active workflows, or site pages.

The AI service exposes methods that all modules can call. The processCommand method takes natural language input and context, interprets intent, and routes to the appropriate handler. Module-specific methods include buildWorkflow taking a description and returning a complete workflow definition, generatePage taking a description and optional style preferences and returning a page structure, writeEmail taking a brief and tone and returning subject and body, analyzeContacts taking a query and returning filtered contacts with insights, suggestAutomations taking context and returning automation ideas based on usage patterns, and configureIntegration taking a service name and guiding through setup.

The AI command bar is accessible everywhere via Cmd+K or Ctrl+K. Users can type natural language commands that the AI interprets and executes. Examples: "show me contacts who haven't been contacted in 30 days" filters the CRM, "create a welcome email sequence for new leads" opens workflow builder with a pre-built sequence, "build a landing page for my webinar" opens site builder with generated page, "schedule a campaign to all contacts tagged VIP" opens email campaign with segment pre-selected, "what happened with lead John Smith" pulls up contact with AI summary of all interactions.

The AI proactively offers suggestions based on context. When viewing a contact with no recent activity, it suggests follow-up actions. When a workflow has errors, it suggests fixes. When analytics show a page with high bounce rate, it suggests improvements. These suggestions appear in a non-intrusive suggestions panel, never as blocking modals.

## The AI Setup Wizard

New user onboarding is entirely AI-driven. Instead of a traditional wizard with static steps, the AI has a conversation with the user to understand their business, then configures everything automatically.

The conversation flow starts with the AI asking about business type, industry, and what they sell or offer. It asks about current tools they're using and want to replace or integrate. It asks about their main goals—more leads, better follow-up, client management, online presence, or automation. It asks about team size and who will use the platform. It asks about existing assets like contact lists, email templates, or website content to import.

Based on this conversation, the AI recommends which modules to enable, suggests a pricing tier based on needs, creates a customized onboarding checklist, and offers to auto-configure the platform.

Auto-configuration includes creating pipeline stages appropriate for their business type (real estate gets stages like New Lead, Contacted, Showing Scheduled, Offer Made, Under Contract, Closed; SaaS gets Trial, Demo Scheduled, Proposal Sent, Negotiation, Closed Won, Closed Lost). It creates email templates for common scenarios in their industry. It builds a starter automation for lead follow-up. It creates a dashboard layout with relevant widgets. It generates a simple landing page matching their business. It configures forms for their main use case like contact form, booking request, or quote request.

The AI can also import from other platforms. It guides users through exporting from GoHighLevel, HubSpot, Salesforce, or other tools, maps fields intelligently, imports contacts, templates, and automations, and notes what couldn't be imported and offers to recreate it.

## Dashboard Builder

The dashboard is fully customizable through a widget-based system. Users can add, remove, resize, and rearrange widgets. Each enabled module contributes available widgets.

Widget types include Stat Card showing a single metric with comparison to previous period, Line Chart showing trends over time, Bar Chart comparing categories, Pie Chart showing distribution, Table showing recent records with quick actions, Pipeline View showing deal stages visually, Activity Feed showing recent activities across the organization, Task List showing upcoming and overdue tasks, Calendar showing scheduled appointments, Leaderboard comparing team member performance, Funnel Visualization showing conversion through stages, and AI Insights showing AI-generated observations and recommendations.

Users can create multiple dashboard pages for different purposes—an overview dashboard, a sales dashboard, a marketing dashboard. Dashboards can be shared across the organization or kept private.

The AI can generate dashboards from descriptions like "create a sales manager dashboard showing team performance, deal pipeline, revenue forecast, and activity metrics." It can suggest widgets based on which modules are enabled and what data exists.

## Integration Architecture

Build a generic integration framework that connects external apps without custom code for each integration.

The integration registry defines available integrations with authentication type (OAuth2, API key, webhook), available triggers (events that can start workflows), available actions (things the workflow can do in the external app), and field mappings for data transformation.

Priority integrations to build include Stripe for payments (triggers: payment succeeded, subscription created, invoice paid; actions: create customer, create payment link, create subscription), Google services including Calendar for two-way sync and Gmail for sending through user's account, Slack for notifications (actions: send message, create channel; triggers: slash commands), Zoom for meeting creation and join links, Shopify for e-commerce (triggers: order created, customer created; actions: create discount, update inventory), QuickBooks for accounting sync, Twilio for SMS and voice underlying the phone system module, Make and Zapier for connecting anything else, and WordPress for publishing and syncing content.

Each integration uses an OAuth flow where possible, stores credentials securely encrypted per organization, and handles token refresh automatically. When credentials expire or fail, the system notifies users and pauses affected workflows.

## Real-Time Features

Build real-time capabilities using WebSocket connections through a service like Pusher, Ably, or self-hosted Socket.io.

Real-time updates needed include contact activity appearing instantly when emails are opened or links clicked, workflow execution progress showing live in the builder, dashboard widgets updating without refresh, team collaboration features showing who's viewing the same record, chat widget messages appearing instantly, and notification delivery without polling.

Presence features show which team members are online and what they're viewing, enabling coordination and preventing conflicts when multiple people might edit the same record.

## API and Developer Access

Expose a comprehensive API for custom integrations and automation. Build a REST API with standard CRUD endpoints for all major entities. Build a GraphQL API for flexible querying when clients need specific data shapes. Build a webhook system where users can subscribe to events and receive HTTP callbacks.

The API should support authentication via API keys with scoped permissions, rate limiting with clear headers showing limits and remaining quota, pagination with cursor-based navigation, filtering with a query syntax for complex conditions, and expansion to include related records in a single request.

Developer documentation should be automatically generated from the API definitions and include interactive examples where users can test endpoints.

## Mobile Considerations

While the primary experience is web-based, ensure the application is fully responsive and usable on tablets and phones. Consider a future native mobile app by keeping the API comprehensive enough to power native clients.

Critical mobile functionality includes viewing and managing contacts, responding to leads quickly, checking dashboard metrics, managing appointments and calendar, receiving and acting on notifications, and basic workflow monitoring.

## Performance and Scale

Design for performance from the start. Database queries should use proper indexes, avoid N+1 problems with eager loading, and paginate all list views. Use React Query's caching aggressively to minimize refetching. Implement optimistic updates for common actions so the UI feels instant. Use edge caching for public pages built in the site builder. Background jobs should handle anything slow like sending emails, processing imports, running AI analysis, and executing workflows. Monitor performance with proper instrumentation and alerting.

For scale targets, the system should handle organizations with hundreds of thousands of contacts, pages that receive substantial traffic, workflow executions numbering in millions per month across all tenants, and concurrent users editing in the same organization.

## Security Requirements

Security is non-negotiable for a platform handling business data. Implement organization isolation ensuring queries never leak data across tenants, enforce at the database query level not just the application level. Use role-based access control where organization admins manage roles, roles define permission sets, and permissions are checked on every API endpoint. Encrypt sensitive data at rest, particularly API keys, credentials, and PII. Implement comprehensive audit logging tracking who did what when for compliance. Support two-factor authentication and ideally SSO for enterprise customers. In the workflow engine, sandbox code execution and validate all inputs to prevent injection attacks.

## Testing Strategy

Build comprehensive tests at multiple levels. Unit tests cover utility functions, data transformations, and business logic. Integration tests cover API endpoints, database operations, and service interactions. End-to-end tests cover critical user journeys like signup, creating first contact, building first workflow, and publishing first page. Workflow tests specifically test trigger conditions, action execution, error handling, and complex flow control.

The AI features should have evaluation tests that measure response quality, accuracy of generated workflows and pages, and appropriate handling of edge cases and ambiguous requests.

## Deployment and Operations

Deploy with a modern cloud-native approach. Use Vercel for the Next.js application with preview deployments for pull requests. Run workers and background jobs on Railway or Render. Use managed database services like Supabase, Neon, or PlanetScale for PostgreSQL. Use Upstash for serverless Redis. Set up monitoring with Sentry for error tracking and PostHog or Mixpanel for product analytics. Implement proper staging and production environment separation with database seeding for staging.

The deployment pipeline should run tests before deploying, deploy database migrations safely with rollback capability, and support feature flags for gradual rollout of new functionality.

## Development Phases

Phase one over roughly two months builds the foundation: authentication, organization management, the feature toggle system, basic CRM with contacts and companies, and the dashboard framework with a few widgets. This proves the architecture works.

Phase two over roughly two months adds the workflow engine with visual builder, core triggers and actions, and the AI integration layer with the command bar. This is the differentiating functionality.

Phase three over roughly two months builds the site builder with blocks, styling, publishing, and form builder with CRM integration. This covers the marketing site needs.

Phase four over roughly two months adds email and SMS marketing with sequences, campaigns, and analytics. This completes core marketing automation.

Phase five over roughly two months adds remaining modules based on priority: calendar booking, chat widget, phone system, and membership sites. It also adds the AI setup wizard and migration tools.

Throughout all phases, continuously improve AI capabilities based on usage patterns and feedback.

## Success Metrics

Track metrics that indicate the platform is delivering value. User engagement metrics include daily and weekly active users, feature adoption rates per module, workflow executions per organization, and pages published and traffic received. Business metrics include organizations created, conversion from free to paid tiers, revenue per organization, and churn rate with reasons. AI metrics include AI command usage and success rate, AI-generated workflows actually used, setup wizard completion rate and time, and user feedback on AI suggestions. Technical metrics include API response times, error rates, workflow execution success rate, and page load times for published sites.

This prompt defines a complete, production-ready platform. The key differentiators are the true AI-native experience where AI can do anything the user can do, the modular architecture that respects that different businesses need different tools, and the pervasive workflow system that turns automation from a feature into the connective tissue of the entire platform. Build this and you'll have created something genuinely better than GoHighLevel, not just a clone.
