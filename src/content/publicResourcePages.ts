import {
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  ClipboardList,
  Handshake,
  Newspaper,
  Radio,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type PublicResourcePageId =
  | 'blog'
  | 'careers'
  | 'partners'
  | 'docs'
  | 'help'
  | 'community'
  | 'templates'
  | 'status';

interface ResourceSection {
  title: string;
  body: string;
  items?: string[];
}

export interface PublicResourcePageContent {
  id: PublicResourcePageId;
  eyebrow: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  sections: ResourceSection[];
}

export const publicResourcePages: Record<PublicResourcePageId, PublicResourcePageContent> = {
  blog: {
    id: 'blog',
    eyebrow: 'Flow Notes',
    title: 'Practical thinking on AI, ownership, and business flow.',
    summary:
      'These notes support the FlowStack position without pretending the product is more automated than it is today.',
    icon: Newspaper,
    primaryCta: { label: 'Start an audit', href: '/audit' },
    secondaryCta: { label: 'Read the docs', href: '/docs' },
    sections: [
      {
        title: 'Stop chasing AI tools. Own the flow.',
        body:
          'The market will keep changing. FlowStack starts by mapping the business flow so each new tool can be evaluated by what it improves, not by how loud the launch cycle is.',
      },
      {
        title: 'Why FlowStack starts with an audit',
        body:
          'The first product is not magic automation. It is a structured intake and human-reviewed Flow Brief that identifies where the business needs help first, then turns that into a quoteable implementation path.',
      },
      {
        title: 'Give us what you have',
        body:
          'A customer might have marketing in HubSpot, a site in Wix, designers changing pages, AI tools writing content, and sales follow-up somewhere else. FlowStack puts that into one logical system before recommending more tools.',
      },
      {
        title: 'Keep, connect, improve, replace, or own',
        body:
          'FlowStack recommendations are framed around practical next steps. The goal is not to shame a tool choice. The goal is to decide what should stay rented and what should become owned software.',
      },
    ],
  },
  careers: {
    id: 'careers',
    eyebrow: 'Careers',
    title: 'FlowStack is building carefully before hiring broadly.',
    summary:
      'We are not listing roles until there is a real opening. The near-term path is founder-led delivery plus trusted implementation partners.',
    icon: BriefcaseBusiness,
    primaryCta: { label: 'Contact us', href: '/contact' },
    secondaryCta: { label: 'Partner with FlowStack', href: '/partners' },
    sections: [
      {
        title: 'Current hiring state',
        body:
          'There are no open full-time roles listed publicly right now. As audit demand grows, the first needs are implementation partners, operators, and specialists who can help customers improve one valuable flow at a time.',
      },
      {
        title: 'What we look for',
        body:
          'People who can understand messy business systems, translate between tools, and create owned software only when it is actually better than renting another platform.',
      },
      {
        title: 'How to reach out',
        body:
          'Use the contact page with a short note about the workflows, tools, industries, or implementation work you are strongest in.',
      },
    ],
  },
  partners: {
    id: 'partners',
    eyebrow: 'Partners',
    title: 'A provider network based on fit, not paid placement.',
    summary:
      'FlowStack can recommend providers, platforms, and implementation specialists, but the recommendation has to make sense for the customer flow.',
    icon: Handshake,
    primaryCta: { label: 'Become a partner', href: '/contact' },
    secondaryCta: { label: 'Start an audit', href: '/audit' },
    sections: [
      {
        title: 'Current partner path',
        body:
          'Providers can be evaluated for voice agents, call agents, development agents, automation, hosting, and implementation help when the FlowStack Audit shows that those capabilities fit the customer flow.',
      },
      {
        title: 'FlowStack Verified means current and useful',
        body:
          'A verified provider should be active, clear about pricing, compatible with modern AI workflows, and able to help without trapping the customer in unnecessary complexity.',
      },
      {
        title: 'Recommendation rules',
        body:
          'A partner can be surfaced when it fits the audit evidence. Paid placement should not override the customer need.',
        items: [
          'The provider solves a real help point in the flow.',
          'The provider does not add avoidable lock-in.',
          'The provider is still shipping and supportable.',
          'The customer can understand the tradeoff before switching.',
        ],
      },
      {
        title: 'Partner categories',
        body:
          'Likely partner paths include CRM, voice AI, call agents, development agents, hosting, automation, design-to-code, analytics, community, payments, and implementation services.',
      },
    ],
  },
  docs: {
    id: 'docs',
    eyebrow: 'Documentation',
    title: 'The audit model behind the FlowStack landing page.',
    summary:
      'This page explains what FlowStack can support today, what evidence an audit uses, and what requires explicit customer permission.',
    icon: BookOpen,
    primaryCta: { label: 'Start audit intake', href: '/audit' },
    secondaryCta: { label: 'See help center', href: '/help' },
    sections: [
      {
        title: 'Current product truth',
        body:
          'FlowStack is in an audit-first MVP phase. The public intake collects focus areas, tools, pain points, project signals, desired outcomes, and contact intent. The first Flow Brief is designed to be human-reviewed before deeper automation and should lead to a practical implementation quote.',
      },
      {
        title: 'Evidence used in a FlowStack Audit',
        body:
          'Recommendations should be tied to evidence the customer submitted or explicitly authorized FlowStack to inspect.',
        items: [
          'Submitted tool and SaaS list',
          'Approved URLs, funnels, forms, and public pages',
          'Approved repositories, READMEs, manifests, configs, or folder inventories',
          'Approved workflow notes, invoices, logs, exports, or screenshots',
          'Customer explanation of what feels unclear, slow, expensive, or hard to maintain',
        ],
      },
      {
        title: 'Recommendation framework',
        body:
          'Every recommendation should be expressed as keep, connect, improve, replace, or own. This keeps the audit practical and lets FlowStack attach the quote to a real flow instead of a vague service package.',
      },
      {
        title: 'What is not automatic yet',
        body:
          'Automated local scanning, connector monitoring, provider switching, and owned software generation are target capabilities. They should only happen with explicit permission and a scoped implementation path.',
      },
    ],
  },
  help: {
    id: 'help',
    eyebrow: 'Help Center',
    title: 'How to work with FlowStack without changing everything first.',
    summary:
      'The simplest path is to submit what you use, explain what feels unclear, and let FlowStack create the first map.',
    icon: CircleHelp,
    primaryCta: { label: 'Start an audit', href: '/audit' },
    secondaryCta: { label: 'Contact support', href: '/contact' },
    sections: [
      {
        title: 'What should I submit?',
        body:
          'Start with your website, main tools, active AI tools, CRM or funnel tools, payment tools, project folders, repositories, and anything that feels expensive or slow.',
      },
      {
        title: 'Do I need to migrate?',
        body:
          'No. FlowStack is replacement-aware, not replacement-first. The audit may recommend keeping a tool, connecting it better, improving one step, or building one owned slice.',
      },
      {
        title: 'What happens after intake?',
        body:
          'The first response should be a Flow Brief: current stack signals, likely help points, recommendations, provider options, and one suggested implementation quote.',
      },
      {
        title: 'Can beginners use it?',
        body:
          'Yes. If someone is just getting into AI, FlowStack starts with the plain business flow: offer, audience, content, lead capture, payment, delivery, and follow-up.',
      },
    ],
  },
  community: {
    id: 'community',
    eyebrow: 'Community',
    title: 'A community for people learning to own their flow.',
    summary:
      'The community layer should support honest implementation, not tool hype. It is being shaped around audit learnings and practical examples.',
    icon: Users,
    primaryCta: { label: 'Join through an audit', href: '/audit' },
    secondaryCta: { label: 'Contact FlowStack', href: '/contact' },
    sections: [
      {
        title: 'Current community state',
        body:
          'There is not a public community portal linked here yet. The first community motion is direct conversation through audits, implementation notes, and partner feedback.',
      },
      {
        title: 'What the community should contain',
        body:
          'Useful examples, provider notes, owned software patterns, beginner flow templates, implementation retrospectives, and lessons from real audits.',
      },
      {
        title: 'Why it is not rushed',
        body:
          'A community without real audit evidence becomes another noise layer. FlowStack should earn the examples before scaling the conversation.',
      },
    ],
  },
  templates: {
    id: 'templates',
    eyebrow: 'Templates',
    title: 'Reusable audit templates for turning messy systems into a map.',
    summary:
      'Templates are the repeatable artifacts behind the audit: intake, stack map, Flow Brief, provider review, and implementation sprint.',
    icon: ClipboardList,
    primaryCta: { label: 'Use the intake', href: '/audit' },
    secondaryCta: { label: 'Read documentation', href: '/docs' },
    sections: [
      {
        title: 'First Flow Brief',
        body:
          'A short customer-facing brief covering what the business appears to be doing, current stack signals, likely help points, provider options, and one quoteable next step.',
      },
      {
        title: 'Stack and SaaS map',
        body:
          'A structured inventory of tools, owners, costs, dependencies, handoffs, and replacement risk.',
      },
      {
        title: 'Owned software candidate',
        body:
          'A template for deciding whether a narrow feature should stay rented, be connected better, or be built into the customer-owned stack.',
      },
      {
        title: 'Implementation sprint',
        body:
          'A scoped plan for improving one valuable flow before expanding into ongoing monitoring or larger builds.',
      },
    ],
  },
  status: {
    id: 'status',
    eyebrow: 'Status',
    title: 'FlowStack status and product maturity.',
    summary:
      'This status page is intentionally plain: what is available, what is manual, and what is planned.',
    icon: Radio,
    primaryCta: { label: 'Start audit', href: '/audit' },
    secondaryCta: { label: 'Read docs', href: '/docs' },
    sections: [
      {
        title: 'Available now',
        body:
          'Public landing page, audit intake, Flow Brief preview, quote-path messaging, auth handoff, and audit database schema are in place.',
      },
      {
        title: 'Manual by design',
        body:
          'The first FlowStack Audit is human-reviewed. That is the correct MVP because recommendations need context before automation should act.',
      },
      {
        title: 'Prepared next',
        body:
          'The next implementation step is submitting audit intake records to Supabase, then turning approved customer evidence into a delivered Flow Brief.',
      },
      {
        title: 'Planned, permissioned capabilities',
        body:
          'Local project scanning, connector monitoring, recurring tool friction memory, provider recommendations, and owned feature generation require explicit permission and scoped rollout.',
      },
    ],
  },
};
