import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { FeatureCard } from '@/components/marketing/FeatureCard';
import { PricingCard } from '@/components/marketing/PricingCard';
import { TestimonialCard } from '@/components/marketing/TestimonialCard';
import { initAnalytics, trackPageView, trackCTAClick, initScrollTracking, trackPricingClick } from '@/lib/analytics';
import {
  flowstackAuditComparison,
  flowstackAuditFeatures,
  flowstackAuditHero,
  flowstackAuditProofPoints,
  flowstackAuditStages,
  flowstackAuditSteps,
} from '@/content/flowstackAudit';
import {
  ArrowRight,
  Play,
  Check,
} from 'lucide-react';

// ─── Noise texture SVG (grain overlay) ──────────────────────────────────────
const NoiseOverlay = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.025] mix-blend-overlay" style={{ zIndex: 1 }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// ─── Animated grid lines ─────────────────────────────────────────────────────
const GridLines = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(212,175,55,0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(212,175,55,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
    }}
  />
);

export const LandingPage = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    initAnalytics();
    trackPageView(window.location.pathname, 'FlowStack - Landing Page');
    initScrollTracking();
  }, []);

  useEffect(() => {
    if (session && !isLoading) navigate('/dashboard', { replace: true });
  }, [session, isLoading, navigate]);

  const handleStartTrial = useCallback(() => {
    trackCTAClick('flowstack_audit', 'hero_section');
    navigate('/audit');
  }, [navigate]);

  const handleSignIn = useCallback(() => {
    trackCTAClick('sign_in', 'header');
    navigate('/auth?mode=login');
  }, [navigate]);

  const handlePricingClick = useCallback((tier: string, price: number | string | null) => {
    trackPricingClick(tier, typeof price === 'number' ? price : null);
    navigate(`/audit?stage=${encodeURIComponent(tier.toLowerCase())}`);
  }, [navigate]);

  const handleWatchDemo = useCallback(() => {
    trackCTAClick('example_flow_map', 'hero_section');
    document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090a]">
        <div className="w-px h-12 bg-[#d4af37]/30 animate-pulse" />
      </div>
    );
  }

  if (session) return null;

  const features = flowstackAuditFeatures;

  const pricingTiers = flowstackAuditStages;

  const testimonials = flowstackAuditSteps.map((step, index) => ({
    quote: step.description,
    author: step.title,
    role: ['Intake', 'Mapping', 'Brief', 'Sprint'][index] ?? 'FlowStack',
    avatar: String(index + 1).padStart(2, '0'),
    company: 'FlowStack',
  }));

  const comparisonData = flowstackAuditComparison.map(row => ({
    feature: row.feature,
    flowstack: row.flowstack,
    alternative: row.alternative,
  }));

  const stats = flowstackAuditProofPoints;

  return (
    <div className="min-h-screen bg-[#08090a] text-white overflow-x-hidden">
      <MarketingHeader isScrolled={isScrolled} onSignIn={handleSignIn} onStartTrial={handleStartTrial} />

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
          <GridLines />
          <NoiseOverlay />

          {/* Radial glow — center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />

          {/* Horizontal rule — top decoration */}
          <div className="absolute top-28 left-0 right-0 flex items-center px-8 lg:px-16 pointer-events-none" style={{ zIndex: 2 }}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37]/15 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-32" style={{ zIndex: 2 }}>
            {/* Eyebrow */}
            <div
              className="flex items-center gap-3 mb-10 transition-all duration-700"
              style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(16px)' }}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 border border-[#d4af37]/25 bg-[#d4af37]/5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#d4af37]">
                  {flowstackAuditHero.eyebrow}
                </span>
              </div>
              <span className="text-xs text-[#6b7280] tracking-wide">{flowstackAuditHero.trustText}</span>
            </div>

            {/* Main headline */}
            <div
              className="transition-all duration-700 delay-100"
              style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)' }}
            >
              <h1 className="text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em] text-white mb-4"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                {flowstackAuditHero.headlinePrimary}
              </h1>
              <h1
                className="text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em] mb-8"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, WebkitTextFillColor: 'transparent', WebkitTextStroke: '1px rgba(212,175,55,0.6)' }}
              >
                {flowstackAuditHero.headlineSecondary}
              </h1>
            </div>

            {/* Subhead + CTA row */}
            <div
              className="flex flex-col lg:flex-row lg:items-end gap-10 transition-all duration-700 delay-200"
              style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)' }}
            >
              <div className="lg:max-w-sm">
                <p className="text-base text-[#6b7280] leading-relaxed">
                  {flowstackAuditHero.subhead}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartTrial}
                  className="group flex items-center gap-3 px-7 py-4 bg-[#d4af37] text-[#08090a] font-semibold text-sm tracking-wide hover:bg-[#e8c547] transition-colors duration-200"
                >
                  {flowstackAuditHero.primaryCta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleWatchDemo}
                  className="group flex items-center gap-3 px-6 py-4 border border-[#2a2d35] text-[#8a8f9a] text-sm tracking-wide hover:border-[#d4af37]/30 hover:text-white transition-all duration-200"
                >
                  <Play className="w-3.5 h-3.5" />
                  {flowstackAuditHero.secondaryCta}
                </button>
              </div>
            </div>

            {/* Trust strip */}
            <div
              className="flex items-center gap-6 mt-16 transition-all duration-700 delay-300"
              style={{ opacity: heroVisible ? 1 : 0 }}
            >
              <div className="h-px flex-1 max-w-[60px] bg-[#2a2d35]" />
              <span className="text-[11px] text-[#4b5563] tracking-[0.15em] uppercase">{flowstackAuditHero.trustStrip}</span>
            </div>
          </div>

          {/* Bottom border decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
        </section>

        {/* ── STATS STRIP ─────────────────────────────────────────────── */}
        <section className="relative border-b border-[#1a1c20]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#1a1c20]">
              {stats.map((stat) => (
                <div key={stat.label} className="px-8 py-10 text-center">
                  <div className="text-3xl lg:text-4xl font-light text-white mb-1 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-xs text-[#6b7280] tracking-[0.12em] uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOGO CLOUD ───────────────────────────────────────────────── */}
        <section className="py-16 border-b border-[#1a1c20]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <p className="text-center text-[10px] font-bold tracking-[0.25em] uppercase text-[#4b5563] mb-10">
              Built to understand the tools you already use
            </p>
            <div className="flex flex-wrap justify-center items-center gap-10 lg:gap-16">
              {['HubSpot', 'Wix', 'Vapi', 'Zapier', 'GitHub', 'GSD', 'Beads', 'Supabase'].map((logo) => (
                <span key={logo} className="text-sm font-semibold text-[#3a3d45] tracking-widest uppercase hover:text-[#6b7280] transition-colors cursor-default">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section id="features" className="py-32 relative">
          <GridLines />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8" style={{ zIndex: 2 }}>
            {/* Section header */}
            <div className="flex items-start justify-between mb-20 flex-col lg:flex-row gap-8">
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-4">Audit outcomes</p>
                <h2 className="text-4xl lg:text-6xl text-white leading-tight tracking-tight mb-4"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                Know what to keep,<br />fix, connect, or own.
              </h2>
              </div>
              <div className="lg:max-w-xs lg:pt-16">
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  FlowStack does not ask you to replace your stack. It maps the flow you already have and shows the next practical move.
                </p>
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-l border-t border-[#1a1c20]">
              {features.map((feature, index) => (
                <FeatureCard key={feature.title} {...feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARISON ───────────────────────────────────────────────── */}
        <section id="comparison" className="py-32 bg-[#0a0b0d] border-t border-b border-[#1a1c20]">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-4">Example flow map</p>
              <h2 className="text-4xl lg:text-5xl font-extralight text-white leading-tight">
                Why FlowStack sits<br />above the tool layer.
              </h2>
            </div>

            <div className="border border-[#1e2025]">
              {/* Header */}
              <div className="grid grid-cols-3 border-b border-[#1e2025] bg-[#0d0e10]">
                <div className="px-6 py-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#4b5563]">Feature</div>
                <div className="px-6 py-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#d4af37] text-center border-x border-[#1e2025]">FlowStack</div>
                <div className="px-6 py-4 text-[11px] font-bold tracking-[0.15em] uppercase text-[#4b5563] text-center">Typical tool layer</div>
              </div>

              {comparisonData.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${index !== comparisonData.length - 1 ? 'border-b border-[#1a1c20]' : ''} hover:bg-[#0d0e10] transition-colors`}
                >
                  <div className="px-6 py-4 text-sm text-[#6b7280]">{row.feature}</div>
                  <div className="px-6 py-4 text-center border-x border-[#1e2025]">
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#d4af37]">
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {row.flowstack}
                    </span>
                  </div>
                  <div className="px-6 py-4 text-center">
                    <span className="text-sm text-[#4b5563]">{row.alternative}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────── */}
        <section id="pricing" className="py-32 relative">
          <GridLines />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8" style={{ zIndex: 2 }}>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-4">Engagement stages</p>
              <h2 className="text-4xl lg:text-5xl text-white leading-tight mb-8"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                Start with clarity.<br />Then fix one flow.
              </h2>
              <p className="text-sm text-[#6b7280]">Begin with an audit, then choose the repair or owned slice that matters most.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 border-l border-t border-[#1e2025]">
              {pricingTiers.map((tier) => (
                <PricingCard
                  key={tier.name}
                  {...tier}
                  onStartTrial={() => handlePricingClick(tier.name, tier.price)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section id="process" className="py-32 bg-[#0a0b0d] border-t border-[#1a1c20]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-end justify-between mb-16 flex-col lg:flex-row gap-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-4">How it works</p>
                <h2 className="text-4xl lg:text-5xl font-extralight text-white leading-tight">
                  From messy stack<br />to first Flow Brief.
                </h2>
              </div>
              <p className="text-sm text-[#6b7280] lg:max-w-xs leading-relaxed">
                The first win is understanding the flow before adding another tool to it.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 border-l border-t border-[#1a1c20]">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.author} {...testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section className="relative py-40 overflow-hidden border-t border-[#1a1c20]">
          <GridLines />
          <NoiseOverlay />

          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.05) 0%, transparent 65%)' }}
          />

          <div className="relative max-w-4xl mx-auto px-6 text-center" style={{ zIndex: 2 }}>
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-8">Get started today</p>
              <h2 className="text-5xl lg:text-7xl text-white leading-[0.95] tracking-[-0.02em] mb-8"
                style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>
                Stop chasing tools.<br />
                <span style={{ WebkitTextFillColor: 'transparent', WebkitTextStroke: '1px rgba(212,175,55,0.5)' }}>
                  Own the flow.
                </span>
              </h2>
            <p className="text-sm text-[#6b7280] mb-12 max-w-md mx-auto leading-relaxed">
              Start with a FlowStack Audit and see what your business stack is already trying to tell you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartTrial}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-[#d4af37] text-[#08090a] font-semibold text-sm tracking-wide hover:bg-[#e8c547] transition-colors"
              >
                Get a FlowStack Audit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleWatchDemo}
                className="inline-flex items-center gap-3 px-8 py-4 border border-[#2a2d35] text-[#8a8f9a] text-sm tracking-wide hover:border-[#d4af37]/30 hover:text-white transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                See example flow map
              </button>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
};
