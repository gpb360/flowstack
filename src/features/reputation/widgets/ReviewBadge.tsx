// @ts-nocheck
/**
 * Review Badge Widget
 * Embeddable badge showing review summary
 */

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReviewSummary } from '../hooks/useReviews';

export interface ReviewBadgeProps {
  organizationId: string;
  platform?: 'all' | 'google' | 'yelp' | 'tripadvisor';
  showRating?: boolean;
  showCount?: boolean;
  theme?: 'light' | 'dark';
  sourceId?: string;
}

export function ReviewBadge({
  organizationId,
  platform = 'all',
  showRating = true,
  showCount = true,
  theme = 'light',
  sourceId,
}: ReviewBadgeProps) {
  const { data: stats } = useReviewSummary(sourceId);

  const embedCode = generateEmbedCode(organizationId, {
    platform,
    showRating,
    showCount,
    theme,
    sourceId,
  });

  return (
    <div>
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-lg p-4',
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        )}
      >
        {showRating && (
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold">
              {stats?.average_rating?.toFixed(1) || '-'}
            </span>
          </div>
        )}
        {showCount && (
          <span className="text-sm text-gray-500">
            Based on {stats?.total_reviews || 0} reviews
          </span>
        )}
      </div>

      {/* Embed code preview */}
      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Embed Code</label>
        <textarea
          readOnly
          className="w-full rounded border border-gray-300 p-2 text-xs font-mono"
          rows={3}
          value={embedCode}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Copy and paste this code into your website
        </p>
      </div>
    </div>
  );
}

function generateEmbedCode(organizationId: string, options: ReviewBadgeProps): string {
  const params = new URLSearchParams({
    org: organizationId,
    ...(options.platform !== 'all' && { platform: options.platform }),
    ...(options.sourceId && { source: options.sourceId }),
    showRating: String(options.showRating),
    showCount: String(options.showCount),
    theme: options.theme,
  });

  return `<script src="${window.location.origin}/widgets/review-badge.js?${params.toString()}"></script>`;
}

/**
 * Star Rating Component
 * Displays stars with optional count
 */

export function StarRating({ rating, count, size = 'md' }: {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
      {count !== undefined && (
        <span className="ml-2 text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
