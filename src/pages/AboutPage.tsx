import { useNavigate } from 'react-router-dom';
import { Blocks, Compass, Eye, GitBranch, Handshake, ShieldCheck } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export const AboutPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => navigate('/auth?mode=login');
  const handleStartTrial = () => navigate('/audit');

  const principles = [
    {
      icon: Eye,
      title: 'See the real flow',
      description:
        'FlowStack starts by mapping what the business already uses instead of asking the customer to rebuild around a new system.',
    },
    {
      icon: Compass,
      title: 'Recommend the next useful move',
      description:
        'The output should be practical: keep, connect, improve, replace, or own the right piece.',
    },
    {
      icon: ShieldCheck,
      title: 'Ask before inspecting',
      description:
        'Local folders, repos, SaaS tools, and connector data should only be reviewed when the customer explicitly approves that scope.',
    },
    {
      icon: Blocks,
      title: 'Build ownership carefully',
      description:
        'Owned software matters when it removes lock-in or cost. It should not be used as an excuse to rebuild what already works.',
    },
  ];

  const proofPoints = [
    { label: 'Current stage', value: 'Audit-first MVP' },
    { label: 'Default posture', value: 'Read-only intake' },
    { label: 'Recommendation model', value: 'Keep / connect / improve / replace / own' },
    { label: 'Implementation rule', value: 'One valuable flow first' },
  ];

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <MarketingHeader isScrolled={false} onSignIn={handleSignIn} onStartTrial={handleStartTrial} />

      <main>
        <section className="mx-auto max-w-6xl px-6 py-28 lg:px-8 lg:py-36">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">About FlowStack</p>
          <h1 className="mb-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            FlowStack helps businesses own the flow while the stack changes.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[#8a8f9a]">
            FlowStack is not trying to be another operating system, CRM, harness, or all-in-one replacement.
            It is an abstraction and intelligence layer for understanding the tools, SaaS, agents, repos,
            local projects, and workflows a business already depends on.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {proofPoints.map(point => (
              <div key={point.label} className="border border-[#1a1c20] bg-[#0d0f12] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">{point.label}</div>
                <div className="mt-3 text-lg font-semibold text-white">{point.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-[#1a1c20] bg-[#0a0b0d]">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Why it exists</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">The problem is not another missing tool.</h2>
            </div>
            <div className="space-y-5 text-sm leading-7 text-[#8a8f9a]">
              <p>
                Businesses are spread across GoHighLevel, HubSpot, Wix, Webflow, GitHub, Vercel, Railway,
                Supabase, Vapi, Skool, Replit, Codex, Claude, GSD, Beads, and whatever becomes useful next.
              </p>
              <p>
                The hard part is knowing how those pieces fit together, where effort is duplicated, what should
                stay rented, and where a small owned feature would be cleaner than another subscription.
              </p>
              <p>
                FlowStack starts with an audit because the first step is not automation. The first step is understanding.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Principles</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white">What keeps the product believable</h2>
            </div>
            <GitBranch className="hidden h-10 w-10 text-[#d4af37] md:block" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {principles.map(principle => (
              <article key={principle.title} className="border border-[#1a1c20] bg-[#0d0f12] p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#d4af37]/30 bg-[#d4af37]/10">
                  <principle.icon className="h-5 w-5 text-[#d4af37]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{principle.title}</h3>
                <p className="text-sm leading-6 text-[#8a8f9a]">{principle.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24 text-center lg:px-8">
          <div className="border border-[#d4af37]/20 bg-[#d4af37]/10 p-8">
            <Handshake className="mx-auto mb-4 h-8 w-8 text-[#d4af37]" />
            <h2 className="mb-3 text-3xl font-semibold tracking-tight text-white">Start with the audit.</h2>
            <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-[#8a8f9a]">
              Give FlowStack the tools, projects, and workflow context you are comfortable sharing. The first output
              should be a practical Flow Brief, not a forced migration pitch.
            </p>
            <button
              type="button"
              onClick={handleStartTrial}
              className="bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#08090a] transition-colors hover:bg-[#e8c547]"
            >
              Get a FlowStack Audit
            </button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
};
