# FlowStack Audit Fulfillment Playbook

## Intake Review

1. Read the submitted audit request.
2. Identify primary focus areas.
3. Identify tools, SaaS, agent systems, repos, project signals, and beginner flow signals.
4. Classify the request as one of:
   - getting started with AI
   - AI/dev workflow
   - SaaS spend and ownership
   - CRM/funnel flow
   - marketing flow
   - local project/toolprint
   - agent/tool support

## Submission Flow

The public audit page stores drafts locally until the user signs in. After authentication and workspace setup, the audit is submitted through the `audit-submit` Supabase Edge Function.

That function:

- verifies the signed-in user
- verifies the selected organization membership
- creates an `audit_requests` row
- creates structured `audit_answers` rows
- optionally sends an internal Resend notification
- optionally sends the customer a Resend confirmation

After submission, the customer lands on the saved audit detail page in the dashboard. The visible preview is directional and rule-based. It is not the final Flow Brief.

## MVP Intake Fields

The first MVP receives form-only information. It does not receive files, CLI snapshots, SaaS credentials, repo access, or connectors.

## Preview vs. Structure Snapshot

The launch preview is based only on form answers. It may produce a directional estimate from the customer's stated tools, URLs, goals, spend, and flow description, but it must not imply that FlowStack has inspected files, repos, local folders, SaaS accounts, or connected systems.

Future structure snapshots are separate from the public MVP intake. They must be permissioned, scoped to approved workspace structure, and file-list/marker-name first. Use customer-facing language such as "approved workspace structure," "structure signals," and "directional estimate." Describe gaps as "not flowing" or "disconnected" instead of exposing internal dot-folder language too bluntly.

Until a human reviews the evidence, any structure snapshot finding remains directional. Do not present snapshot-derived notes as final facts, compliance findings, or proof that a specific framework or language choice is the problem.

Required:

- audit focus
- business type
- current flow context

Optional but useful:

- business name
- website or main URL
- tools in the flow
- project or business signals
- team size range
- monthly tool spend range
- urgency
- desired outcome
- contact consent

Structured field values:

- business type: `creator_solo`, `agency_marketing`, `saas_software`, `local_service`, `corporate_internal`, `consulting_services`, `other`
- monthly tool spend: `unknown`, `under_500`, `500_2000`, `2000_10000`, `10000_plus`
- urgency: `exploring`, `this_month`, `this_week`, `urgent`

Required Supabase secrets for email notification:

```bash
RESEND_API_KEY=re_xxxxxxxxx
AUDIT_NOTIFICATION_TO=you@yourdomain.com
RESEND_AUDIT_FROM="FlowStack <audit@yourdomain.com>"
FLOWSTACK_ADMIN_EMAILS="you@yourdomain.com,ops@yourdomain.com"
```

`RESEND_AUDIT_FROM` must use a verified Resend sending domain for production. If `RESEND_API_KEY` or `AUDIT_NOTIFICATION_TO` is missing, the audit still logs to the database and the notification is skipped.

## First Flow Brief Format

There are two different outputs:

- **Directional Preview:** generated instantly from form-only intake and shown to the customer.
- **Human-Reviewed Flow Brief:** written or approved inside Audit Ops before being treated as the actual Flow Brief.

The final `flow_brief` field should stay empty until human review.

### Executive Summary

Summarize what the business appears to be trying to do and where FlowStack can likely help first.

### Current Stack Signals

List tools, repos, SaaS, agents, workflows, hosting/data layers, community channels, payment tools, and content surfaces mentioned or discovered.

### Likely Help Points

List 3-7 observed or likely help points. Each item must include:

- evidence
- business impact
- recommended next action

### Keep / Connect / Improve / Replace / Own

Classify recommendations:

- Keep: tools that fit the current flow.
- Connect: tools that need a bridge.
- Improve: repeated environment, agent, workflow, or handoff friction.
- Replace: tools that no longer fit.
- Own: small feature slices worth building into the customer's stack.

### Beginner Flow Path

For customers just getting into AI, avoid technical stack language first. Map:

- offer
- audience
- content channel
- community or social surface
- lead capture
- payment
- delivery
- follow-up
- first missing system

The first recommendation should usually be a simple business flow, not a complex automation stack.

### First Implementation Sprint

Recommend one focused sprint that can create value quickly.

## Review Checklist

Before moving an audit to `brief_ready`:

1. Confirm the business type and primary flow lens.
2. Read the current flow context without assuming the customer is wrong.
3. Identify evidence actually provided versus assumptions.
4. Classify likely next actions as keep, connect, improve, replace, or own.
5. Add internal notes for follow-up and quote context.
6. Save a human-reviewed Flow Brief in Audit Ops.
7. Keep implementation separate from the audit unless a sprint is explicitly proposed.

## Priority Audit Handoff

The customer can request a Priority Flow Audit from the saved audit page. The app records `metadata.priorityAuditRequestedAt` and sends an internal notification when Resend is configured.

Payment is not collected in the MVP. The manual path is:

1. Review the saved audit.
2. Contact the customer.
3. Confirm fit and price range.
4. Send a manual invoice.
5. Move the audit to `reviewing` or `sprint_proposed`.

## Quote Readiness

The customer detail page can show a quote-readiness panel before the final Flow Brief exists. This is not a checkout flow and not a guaranteed implementation quote. It is a transparent callback path that says what FlowStack understands, what is missing, and what range may fit the review.

The quote object stored inside a human-reviewed `flow_brief` should use this shape:

```json
{
  "quote": {
    "readiness": "needs_context",
    "range": { "low": 2000, "high": 5000, "currency": "USD" },
    "confidence": 45,
    "assumptions": [],
    "includedScope": [],
    "excludedScope": [],
    "requiredClarifications": [],
    "nextStep": "Book a free review before treating this as a quote.",
    "disclaimer": "Estimates are directional, not guaranteed. They are based only on the information provided. More complete access, exports, screenshots, or approved snapshots may materially change the findings."
  }
}
```

Allowed readiness values:

- `needs_context`: not enough submitted context to treat the range as quote-ready.
- `directional_range`: enough context for a first-pass range, still pending human confirmation.
- `reviewed_quote`: human-reviewed and ready for manual invoice or sprint discussion.

The customer-facing range should always explain exclusions. For the MVP, excluded scope includes file uploads, local scans, repo inspection, SaaS credentials, connectors, production implementation, migrations, exact ROI, guaranteed savings, or compliance conclusions.

Audit Ops may generate a review starter from the directional preview, but that starter must not be saved automatically as the final Flow Brief. Leave `flow_brief` empty until a human intentionally inserts, edits, and saves reviewed output. Customer pages should only render the human-reviewed section when the audit is `brief_ready`, `sprint_proposed`, or the saved quote readiness is `reviewed_quote`.

## Delivery Rule

The audit must not shame the customer's current tools, team, or level of technical knowledge. The output should focus on the flow, the missing bridge, and the practical next step.

## Disclaimer Language

Use this exact language anywhere the app shows estimates, opportunity, savings, or direction:

> Estimates are directional, not guaranteed. They are based only on the information provided. More complete access, exports, screenshots, or approved snapshots may materially change the findings.

Public explanation:

> Show us your flow. We'll help you find the gap.
