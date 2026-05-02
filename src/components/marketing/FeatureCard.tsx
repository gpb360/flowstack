import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  index = 0,
}) => {
  return (
    <div
      className="group relative p-8 border-r border-b border-[#1a1c20] hover:bg-[#0a0b0d] transition-all duration-500 cursor-default"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#d4af37]/40 group-hover:border-[#d4af37] transition-colors duration-500" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#d4af37]/0 group-hover:border-[#d4af37]/40 transition-colors duration-500" />

      {/* Background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/0 to-[#d4af37]/0 group-hover:from-[#d4af37]/3 group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      <div className="relative">
        {/* Icon */}
        <div className="mb-6 relative">
          <div className="w-10 h-10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
          </div>
        </div>

        {/* Index number */}
        <div className="absolute top-0 right-0 text-[10px] font-mono text-[#3a3d45] group-hover:text-[#d4af37]/40 transition-colors duration-300 tracking-widest">
          {String(index + 1).padStart(2, '0')}
        </div>

        <h3 className="text-base font-semibold text-white mb-3 tracking-wide">
          {title}
        </h3>

        <p className="text-sm text-[#6b7280] leading-relaxed group-hover:text-[#8a8f9a] transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
};
