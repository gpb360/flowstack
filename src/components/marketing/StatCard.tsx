import React from 'react';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  trend = 'up',
}) => {
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-bold text-gold-gradient mb-2">
        {value}
      </div>
      <div className="text-text-secondary text-sm flex items-center justify-center gap-2">
        {label}
        {trend === 'up' && (
          <TrendingUp className="w-4 h-4 text-success" />
        )}
      </div>
    </div>
  );
};
