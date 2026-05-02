import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  company: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  avatar,
}) => {
  return (
    <div className="group relative p-8 border-r border-b border-[#1a1c20] hover:bg-[#0d0e10] transition-all duration-500">
      {/* Top accent line */}
      <div className="absolute top-0 left-8 w-8 h-px bg-[#d4af37]/40 group-hover:w-16 group-hover:bg-[#d4af37]/70 transition-all duration-500" />

      {/* Large quote mark */}
      <div className="absolute top-6 right-6 text-5xl font-serif text-[#d4af37]/8 leading-none select-none group-hover:text-[#d4af37]/15 transition-colors duration-500">
        "
      </div>

      <blockquote className="text-sm text-[#8a8f9a] leading-relaxed mb-8 group-hover:text-[#a0a6b0] transition-colors duration-300">
        "{quote}"
      </blockquote>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-none bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] text-xs font-bold tracking-wider">
          {avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-white tracking-wide">{author}</div>
          <div className="text-xs text-[#6b7280] mt-0.5">{role}</div>
        </div>
      </div>
    </div>
  );
};
