import { useNavigate } from 'react-router-dom';
import { Database, EyeOff, KeyRound, Lock, Shield } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export const SecurityPage = () => {
  const navigate = useNavigate();

  const handleSignIn = () => navigate('/auth?mode=login');
  const handleStartTrial = () => navigate('/audit');

  const safeguards = [
    {
      icon: EyeOff,
      title: 'Read-only first',
      description:
        'The audit intake starts with customer-provided context. Deeper inspection should require explicit customer approval.',
    },
    {
      icon: KeyRound,
      title: 'Permissioned connectors',
      description:
        'Connected tools should use scoped authorization, clear consent, and revocable access as connector support expands.',
    },
    {
      icon: Database,
      title: 'Tenant-aware data model',
      description:
        'FlowStack is designed around organization-scoped records and Supabase row-level security policies where customer data is stored.',
    },
    {
      icon: Lock,
      title: 'No silent migration',
      description:
        'FlowStack should not move, rewrite, or replace a customer system without an approved implementation scope.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <MarketingHeader isScrolled={false} onSignIn={handleSignIn} onStartTrial={handleStartTrial} />

      <main className="mx-auto max-w-5xl px-6 py-28 lg:px-8 lg:py-36">
        <section className="mb-14 border-b border-[#1a1c20] pb-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#d4af37]/30 bg-[#d4af37]/10">
            <Shield className="h-6 w-6 text-[#d4af37]" />
          </div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Security</p>
          <h1 className="mb-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Security starts with consent and scope.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[#8a8f9a]">
            FlowStack's audit-first MVP should be honest about what it sees. The product should only analyze
            what the customer submits, connects, or explicitly approves for review.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {safeguards.map(safeguard => (
            <article key={safeguard.title} className="border border-[#1a1c20] bg-[#0d0f12] p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center border border-[#d4af37]/30 bg-[#d4af37]/10">
                <safeguard.icon className="h-5 w-5 text-[#d4af37]" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-white">{safeguard.title}</h2>
              <p className="text-sm leading-6 text-[#8a8f9a]">{safeguard.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-14 grid gap-6">
          <article className="border border-[#1a1c20] bg-[#0d0f12] p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">Current MVP boundary</h2>
            <p className="text-sm leading-7 text-[#8a8f9a]">
              The public audit flow captures an intake draft and routes customers toward account creation.
              The audit database schema is prepared for persistence, but automatic local scanning and live SaaS
              monitoring are not turned on by default.
            </p>
          </article>

          <article className="border border-[#1a1c20] bg-[#0d0f12] p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">How recommendations should be handled</h2>
            <p className="text-sm leading-7 text-[#8a8f9a]">
              Recommendations should cite the evidence used, explain the business impact, and separate observation
              from action. A customer can receive a Flow Brief without allowing FlowStack to change anything.
            </p>
          </article>

          <article className="border border-[#1a1c20] bg-[#0d0f12] p-6">
            <h2 className="mb-3 text-xl font-semibold text-white">Report a security concern</h2>
            <p className="text-sm leading-7 text-[#8a8f9a]">
              For security questions or responsible disclosure, use the contact page and include the word
              "security" in the subject so it can be routed correctly.
            </p>
          </article>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
};
