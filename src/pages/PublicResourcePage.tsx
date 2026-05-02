import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { publicResourcePages } from '@/content/publicResourcePages';
import type { PublicResourcePageId } from '@/content/publicResourcePages';

interface PublicResourcePageProps {
  pageId: PublicResourcePageId;
}

export const PublicResourcePage = ({ pageId }: PublicResourcePageProps) => {
  const navigate = useNavigate();
  const page = publicResourcePages[pageId];
  const Icon = page.icon;

  const handleSignIn = () => navigate('/auth?mode=login');
  const handleStartTrial = () => navigate('/audit');

  return (
    <div className="min-h-screen bg-[#08090a] text-white">
      <MarketingHeader isScrolled={false} onSignIn={handleSignIn} onStartTrial={handleStartTrial} />

      <main className="mx-auto max-w-5xl px-6 py-28 lg:px-8 lg:py-36">
        <section className="mb-16 border-b border-[#1a1c20] pb-12">
          <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#d4af37]/30 bg-[#d4af37]/10">
            <Icon className="h-6 w-6 text-[#d4af37]" />
          </div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">
            {page.eyebrow}
          </p>
          <h1 className="mb-6 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            {page.title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-[#8a8f9a]">
            {page.summary}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={page.primaryCta.href}
              className="inline-flex items-center justify-center gap-2 bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#08090a] transition-colors hover:bg-[#e8c547]"
            >
              {page.primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {page.secondaryCta && (
              <Link
                to={page.secondaryCta.href}
                className="inline-flex items-center justify-center border border-[#24272f] px-5 py-3 text-sm font-semibold text-[#c4c7cf] transition-colors hover:border-[#d4af37]/40 hover:text-white"
              >
                {page.secondaryCta.label}
              </Link>
            )}
          </div>
        </section>

        <section className="grid gap-5">
          {page.sections.map(section => (
            <article key={section.title} className="border border-[#1a1c20] bg-[#0d0f12] p-6">
              <h2 className="mb-3 text-xl font-semibold text-white">{section.title}</h2>
              <p className="text-sm leading-7 text-[#8a8f9a]">{section.body}</p>
              {section.items && (
                <ul className="mt-4 space-y-2 text-sm text-[#c4c7cf]">
                  {section.items.map(item => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#d4af37]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
};
