import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { subscribeToNewsletter, rateLimiter } from '@/lib/newsletter';
import { trackNewsletterSignup } from '@/lib/analytics';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface MarketingFooterProps {
  onStartTrial?: () => void | Promise<void>;
}

export const MarketingFooter: React.FC<MarketingFooterProps> = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate limiting check
    if (!rateLimiter.canSubmit('newsletter-footer')) {
      setSubmitStatus({
        type: 'error',
        message: 'Please wait a moment before trying again.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    const result = await subscribeToNewsletter(email);

    if (result.success) {
      trackNewsletterSignup(email);
      setSubmitStatus({
        type: 'success',
        message: result.message,
      });
      setEmail('');
    } else {
      setSubmitStatus({
        type: 'error',
        message: result.message,
      });
    }

    setIsSubmitting(false);

    // Clear status message after 5 seconds
    setTimeout(() => {
      setSubmitStatus({ type: null, message: '' });
    }, 5000);
  };

  const footerSections: Array<{ title: string; links: FooterLink[] }> = [
    {
      title: 'Product',
      links: [
        { label: 'Audit', href: '/#features' },
        { label: 'How it works', href: '/#process' },
        { label: 'Engagement stages', href: '/#pricing' },
        { label: 'Example flow map', href: '/#comparison' },
        { label: 'Start audit', href: '/audit' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
        { label: 'Partners', href: '/partners' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Help Center', href: '/help' },
        { label: 'Community', href: '/community' },
        { label: 'Templates', href: '/templates' },
        { label: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'GDPR', href: '/gdpr' },
        { label: 'Security', href: '/security' },
      ],
    },
  ];

  return (
    <footer className="border-t border-[#1a1c20] bg-[#08090a]">
      <div className="border-b border-[#1a1c20]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#d4af37] mb-4">Stay in the loop</p>
            <h3 className="text-2xl font-light text-white mb-4" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Flow intelligence, delivered.
            </h3>
            <p className="text-sm text-[#6b7280] mb-8">
              Get practical notes on AI tools, stack drift, ownership, and flow improvement.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              onSubmit={handleNewsletterSubmit}
            >
              <div className="flex-1">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-[#2a2d35] text-white placeholder:text-[#4b5563] focus:outline-none focus:border-[#d4af37]/40 text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#d4af37] text-[#08090a] px-6 py-3 font-semibold text-sm hover:bg-[#e8c547] transition-colors whitespace-nowrap flex items-center justify-center gap-2 min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            {/* Status Messages */}
            {submitStatus.type && (
              <div className={`mt-4 flex items-center justify-center gap-2 text-sm ${
                submitStatus.type === 'success' ? 'text-success' : 'text-destructive'
              }`}>
                {submitStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{submitStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
                <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
              </svg>
              <span className="text-sm font-semibold tracking-[0.1em] text-white uppercase">FlowStack</span>
            </Link>
            <p className="text-sm text-[#6b7280] mb-6 max-w-xs leading-relaxed">
              The business flow intelligence layer that helps you understand, improve, and own the stack you already have.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/audit" className="border border-[#24272f] px-3 py-1.5 text-xs text-[#8a8f9a] transition-colors hover:border-[#d4af37]/40 hover:text-white">
                Start audit
              </Link>
              <Link to="/docs" className="border border-[#24272f] px-3 py-1.5 text-xs text-[#8a8f9a] transition-colors hover:border-[#d4af37]/40 hover:text-white">
                Read docs
              </Link>
              <Link to="/contact" className="border border-[#24272f] px-3 py-1.5 text-xs text-[#8a8f9a] transition-colors hover:border-[#d4af37]/40 hover:text-white">
                Contact
              </Link>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b7280] mb-5">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => {
                  const isExternal = link.external || link.href.startsWith('http');
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a href={link.href} className="text-sm text-[#4b5563] hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      ) : link.href.includes('#') ? (
                        <a href={link.href} className="text-sm text-[#4b5563] hover:text-white transition-colors">
                          {link.label}
                        </a>
                      ) : (
                        <Link to={link.href} className="text-sm text-[#4b5563] hover:text-white transition-colors">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1a1c20]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#4b5563] tracking-wide">
              © {currentYear} FlowStack. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-xs text-[#4b5563] hover:text-white transition-colors tracking-wide">Privacy</Link>
              <Link to="/terms" className="text-xs text-[#4b5563] hover:text-white transition-colors tracking-wide">Terms</Link>
              <Link to="/security" className="text-xs text-[#4b5563] hover:text-white transition-colors tracking-wide">Security</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
