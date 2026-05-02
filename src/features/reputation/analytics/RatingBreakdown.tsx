/**
 * Rating Breakdown Chart
 * Visualizes distribution of reviews by star rating
 */

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RatingBreakdown({ data }: { data: Array<{ rating: number; count: number; percentage: number }> }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-3">
      {[5, 4, 3, 2, 1].map((rating) => {
        const item = data.find((d) => d.rating === rating);
        const count = item?.count || 0;
        const percentage = item?.percentage || 0;

        return (
          <div key={rating} className="flex items-center gap-3">
            <div className="flex w-24 items-center gap-1">
              <span className="text-sm font-medium">{rating}</span>
              <Star className="h-4 w-4 fill-gray-300 text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div className="w-20 text-right">
              <span className="text-sm font-medium">{count}</span>
              <span className="text-xs text-muted-foreground"> ({percentage.toFixed(0)}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
