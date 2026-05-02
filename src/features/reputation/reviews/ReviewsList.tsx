/**
 * Reviews List Component
 * Displays all reviews with filtering and sorting
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Star, MessageSquare, MoreHorizontal, Flag, ExternalLink } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { DataTableUntitled, type ColumnDef } from '@/components/ui/data-table-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReviews, useReviewsCount, useUpdateReviewStatus, useAssignReview, useBulkUpdateReviewStatus } from '../hooks/useReviews';
import { useReviewResponses } from '../hooks/useReputationAlerts';
import { useReviewSources } from '../hooks/useReviewSources';
import { cn } from '@/lib/utils';

export interface ReviewFilters {
  sourceId?: string;
  rating?: number;
  status?: string;
  sentiment?: string;
  search?: string;
}

export function ReviewsList() {
  const [filters, setFilters] = useState<ReviewFilters>({});
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [showBulkResponse, setShowBulkResponse] = useState(false);

  const { data: reviews, isLoading } = useReviews({
    ...filters,
    limit: 50,
  });
  const { data: sources } = useReviewSources();
  const { data: responsesMap } = useReviewsMap(reviews || []);
  const updateStatus = useUpdateReviewStatus();
  const assignReview = useAssignReview();
  const bulkUpdateStatus = useBulkUpdateReviewStatus();

  const handleStatusChange = (reviewId: string, status: 'new' | 'read' | 'flagged' | 'hidden') => {
    updateStatus.mutate({ reviewId, status });
  };

  const handleSelectReview = (reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedReviews.size === reviews?.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews?.map((r) => r.id) || []));
    }
  };

  const getSourceName = (sourceId: string) => {
    return sources?.find((s) => s.id === sourceId)?.business_name || 'Unknown Source';
  };

  const getSourcePlatform = (sourceId: string) => {
    return sources?.find((s) => s.id === sourceId)?.platform || 'google';
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'select',
      header: '',
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedReviews.has(row.original.id)}
          onChange={() => handleSelectReview(row.original.id)}
          className="h-4 w-4"
        />
      ),
    },
    {
      id: 'source',
      header: 'Source',
      cell: ({ row }) => {
        const platform = getSourcePlatform(row.original.source_id);
        const name = getSourceName(row.original.source_id);
        return (
          <div className="flex items-center">
            <PlatformIcon platform={platform} className="h-4 w-4" />
            <span className="ml-2">{name}</span>
          </div>
        );
      },
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: ({ row }) => <StarRating rating={row.original.rating} size="sm" />,
    },
    {
      id: 'reviewer',
      header: 'Reviewer',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.reviewer_name || 'Anonymous'}</div>
          {row.original.is_verified_purchase && (
            <BadgeUntitled variant="neutral" size="sm">Verified</BadgeUntitled>
          )}
        </div>
      ),
    },
    {
      id: 'review',
      header: 'Review',
      cell: ({ row }) => (
        <div className="max-w-md">
          {row.original.title && <div className="font-medium">{row.original.title}</div>}
          <div className="truncate text-sm text-muted-foreground">{row.original.content}</div>
          {(row.original.images?.length || 0) > 0 && (
            <div className="mt-1 text-xs text-muted-foreground">
              {row.original.images?.length} image(s)
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.review_date), { addSuffix: true })}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const hasResponse = responsesMap?.get(row.original.id);
        return (
          <div className="flex gap-1">
            {hasResponse ? (
              <BadgeUntitled variant="success" size="sm">Responded</BadgeUntitled>
            ) : (
              <BadgeUntitled variant="neutral" size="sm">Pending</BadgeUntitled>
            )}
            <BadgeUntitled
              variant={row.original.status === 'new' ? 'info' : 'neutral'}
              size="sm"
            >
              {row.original.status}
            </BadgeUntitled>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ButtonUntitled variant="ghost" size="sm" isIconOnly>
              <MoreHorizontal className="h-4 w-4" />
            </ButtonUntitled>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/reputation/reviews/${row.original.id}`, '_blank')}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, 'read')}>
              Mark as Read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(row.original.id, 'flagged')}>
              <Flag className="mr-2 h-4 w-4" />
              Flag Review
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (window.location.href = `/reputation/responses?review=${row.original.id}`)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Respond
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeaderUntitled
        title="Reviews"
        description="Manage and respond to customer reviews"
        actions={
          <div className="flex gap-2">
            {selectedReviews.size > 0 && (
              <>
                <ButtonUntitled
                  variant="outline"
                  onClick={() => bulkUpdateStatus.mutate({
                    reviewIds: Array.from(selectedReviews),
                    status: 'read',
                  })}
                >
                  Mark as Read ({selectedReviews.size})
                </ButtonUntitled>
                <ButtonUntitled onClick={() => setShowBulkResponse(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Bulk Response
                </ButtonUntitled>
              </>
            )}
            <ButtonUntitled variant="outline" onClick={handleSelectAll}>
              {selectedReviews.size === reviews?.length ? 'Deselect All' : 'Select All'}
            </ButtonUntitled>
          </div>
        }
      />

      <CardUntitled>
        <ReviewFilters filters={filters} sources={sources || []} onChange={setFilters} />
      </CardUntitled>

      <DataTableUntitled
        columns={columns}
        data={reviews || []}
        emptyMessage="No reviews found"
      />
    </div>
  );
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );
}

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  const icons: Record<string, string> = {
    google: 'G',
    yelp: 'Y',
    facebook: 'F',
    tripadvisor: 'T',
    trustpilot: 'TP',
    zomato: 'Z',
    opentable: 'O',
  };

  return (
    <div className={cn('flex items-center justify-center rounded bg-gray-200 text-xs font-bold', className)}>
      {icons[platform] || '?'}
    </div>
  );
}

function ReviewFilters({ filters, sources, onChange }: {
  filters: ReviewFilters;
  sources: any[];
  onChange: (filters: ReviewFilters) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <select
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        value={filters.sourceId || ''}
        onChange={(e) => onChange({ ...filters, sourceId: e.target.value || undefined })}
      >
        <option value="">All Sources</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.business_name}
          </option>
        ))}
      </select>

      <select
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        value={filters.rating || ''}
        onChange={(e) => onChange({ ...filters, rating: e.target.value ? parseInt(e.target.value) : undefined })}
      >
        <option value="">All Ratings</option>
        <option value="5">5 Stars</option>
        <option value="4">4 Stars</option>
        <option value="3">3 Stars</option>
        <option value="2">2 Stars</option>
        <option value="1">1 Star</option>
      </select>

      <select
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        value={filters.status || ''}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined })}
      >
        <option value="">All Status</option>
        <option value="new">New</option>
        <option value="read">Read</option>
        <option value="flagged">Flagged</option>
        <option value="hidden">Hidden</option>
      </select>

      <select
        className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        value={filters.sentiment || ''}
        onChange={(e) => onChange({ ...filters, sentiment: e.target.value || undefined })}
      >
        <option value="">All Sentiments</option>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </select>

      <InputUntitled
        placeholder="Search reviews..."
        value={filters.search || ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        className="w-auto"
      />
    </div>
  );
}

function useReviewsMap(reviews: any[]) {
  const { data: responses } = useReviewResponses(
    reviews.length > 0 ? reviews[0].id : ''
  );

  const responsesMap = new Map<string, boolean>();

  // In a real implementation, you'd fetch responses for all reviews
  // This is a simplified version
  return { data: responsesMap };
}
