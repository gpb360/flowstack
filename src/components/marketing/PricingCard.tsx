import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number | string | null;
  description: string;
  features: string[];
  ctaText: string;
  isPopular: boolean;
  onStartTrial: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  name,
  price,
  description,
  features,
  ctaText,
  isPopular,
  onStartTrial,
}) => {
  return (
    <div
      className={cn(
        'relative p-8 border-r border-b border-[#1e2025] transition-all duration-500 group flex flex-col',
        isPopular
          ? 'bg-[#0d0e10]'
          : 'bg-transparent hover:bg-[#0a0b0d]'
      )}
    >
      {/* Popular indicator */}
      {isPopular && (
        <>
          <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#d4af37] border border-[#d4af37]/30 px-2 py-1">
              Most Popular
            </span>
          </div>
        </>
      )}

      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-[#d4af37]/20 group-hover:border-[#d4af37]/60 transition-colors duration-500" />

      {/* Plan name */}
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b7280] mb-3">{name}</p>
        <div className="flex items-baseline gap-2 mb-3">
          {typeof price === 'number' ? (
            <>
              <span className="text-5xl font-light text-white tracking-tight">${price}</span>
              <span className="text-sm text-[#6b7280]">/ month</span>
            </>
          ) : typeof price === 'string' ? (
            <span className="text-4xl font-light text-white tracking-tight">{price}</span>
          ) : (
            <span className="text-4xl font-light text-white tracking-tight">Custom</span>
          )}
        </div>
        <p className="text-sm text-[#6b7280] leading-relaxed">{description}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#1e2025] mb-6" />

      {/* Features */}
      <ul className="space-y-3.5 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" strokeWidth={2} />
            <span className="text-sm text-[#8a8f9a]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onStartTrial}
        className={cn(
          'w-full py-3.5 text-sm font-semibold tracking-wide transition-all duration-300',
          isPopular
            ? 'bg-[#d4af37] text-[#08090a] hover:bg-[#e8c547]'
            : 'border border-[#2a2d35] text-white hover:border-[#d4af37]/40 hover:text-[#d4af37]'
        )}
      >
        {ctaText}
      </button>
    </div>
  );
};
