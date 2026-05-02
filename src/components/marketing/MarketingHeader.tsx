import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketingHeaderProps {
  isScrolled: boolean;
  onSignIn: () => void;
  onStartTrial: () => void;
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
  isScrolled,
  onSignIn,
  onStartTrial,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Audit', href: '/#features' },
    { label: 'How it works', href: '/#process' },
    { label: 'Stages', href: '/#pricing' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-[#08090a]/90 backdrop-blur-xl border-b border-[#d4af37]/10'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-[#d4af37] opacity-20 rounded-sm rotate-45 scale-75 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-full h-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
                  <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
                </svg>
              </div>
            </div>
            <span className="text-lg font-semibold tracking-[0.08em] text-white uppercase">
              FlowStack
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[#8a8f9a] hover:text-white transition-colors text-sm tracking-wide font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-6">
            <button
              onClick={onSignIn}
              className="text-sm font-medium text-[#8a8f9a] hover:text-white transition-colors tracking-wide"
            >
              Sign In
            </button>
            <button
              onClick={onStartTrial}
              className="relative px-5 py-2.5 text-sm font-semibold tracking-wide text-[#08090a] bg-[#d4af37] hover:bg-[#e8c547] transition-colors rounded-sm overflow-hidden group"
            >
              <span className="relative z-10">Get Audit</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#8a8f9a] hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#d4af37]/10 bg-[#08090a]/95 backdrop-blur-xl">
          <div className="px-6 py-8 space-y-6">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-[#8a8f9a] hover:text-white transition-colors text-sm tracking-wide"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="pt-4 border-t border-[#d4af37]/10 space-y-3">
              <button
                onClick={() => { onSignIn(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 rounded-sm border border-[#d4af37]/20 text-white text-sm font-medium tracking-wide"
              >
                Sign In
              </button>
              <button
                onClick={() => { onStartTrial(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 rounded-sm bg-[#d4af37] text-[#08090a] text-sm font-semibold tracking-wide"
              >
                Get Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
