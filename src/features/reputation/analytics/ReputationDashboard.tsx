/**
 * Reputation Dashboard Component
 * Main analytics dashboard for reputation management
 */

import { useState } from 'react';
import { Star, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { MetricCardUntitled } from '@/components/ui/metric-card-untitled';
import { useReviewSummary, useRatingDistribution, useReviewsTrend } from '../hooks/useReviews';
import { useResponseStats } from '../hooks/useReputationAlerts';
import { useAlertStats } from '../hooks/useReputationAlerts';
import { RatingBreakdown } from './RatingBreakdown';
import { ReviewsChart } from './ReviewsChart';
import { SentimentAnalysis } from './SentimentAnalysis';

export function ReputationDashboard() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const { data: summary } = useReviewSummary(undefined, timeRange);
  const { data: distribution } = useRatingDistribution(undefined, timeRange);
  const { data: trend } = useReviewsTrend(undefined, 90);
  const { data: responseStats } = useResponseStats(timeRange);
  const { data: alertStats } = useAlertStats();

  return (
    <div className="space-y-6">
      <PageHeaderUntitled
        title="Reputation Dashboard"
        description="Monitor your online reputation and review performance"
        actions={
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        }
      />

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardUntitled
          title="Average Rating"
          value={summary?.average_rating?.toFixed(1) || '-'}
          icon={Star}
          description="Out of 5 stars"
        />
        <MetricCardUntitled
          title="Total Reviews"
          value={`${summary?.total_reviews || 0}`}
          icon={MessageSquare}
          description={`In last ${timeRange} days`}
        />
        <MetricCardUntitled
          title="Response Rate"
          value={`${summary?.response_rate?.toFixed(0) || 0}%`}
          icon={TrendingUp}
          description="Reviews responded to"
        />
        <MetricCardUntitled
          title="Active Alerts"
          value={`${alertStats?.unread || 0}`}
          icon={AlertCircle}
          description="Require attention"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CardUntitled title="Rating Distribution" description="Breakdown of reviews by star rating">
          <RatingBreakdown data={distribution || []} />
        </CardUntitled>

        <CardUntitled title="Sentiment Analysis" description="Positive vs negative reviews">
          <SentimentAnalysis
            positive={summary?.positive_count || 0}
            neutral={(summary?.total_reviews || 0) - (summary?.positive_count || 0) - (summary?.negative_count || 0)}
            negative={summary?.negative_count || 0}
          />
        </CardUntitled>
      </div>

      <CardUntitled title="Review Trend" description="Review volume over time">
        <ReviewsChart data={trend || []} />
      </CardUntitled>

      {/* Response Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <CardUntitled title="Response Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Responses</span>
              <span className="font-medium">{responseStats?.total_responses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Posted</span>
              <span className="font-medium">{responseStats?.posted_responses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Drafts</span>
              <span className="font-medium">{responseStats?.draft_responses || 0}</span>
            </div>
          </div>
        </CardUntitled>

        <CardUntitled title="Quick Actions">
          <div className="space-y-2">
            <a href="/reputation/reviews?status=new" className="block rounded border p-2 text-sm hover:bg-gray-50">
              View New Reviews ({summary?.total_reviews || 0})
            </a>
            <a href="/reputation/reviews?sentiment=negative" className="block rounded border p-2 text-sm hover:bg-gray-50">
              Negative Reviews ({summary?.negative_count || 0})
            </a>
            <a href="/reputation/responses" className="block rounded border p-2 text-sm hover:bg-gray-50">
              Pending Responses
            </a>
          </div>
        </CardUntitled>

        <CardUntitled title="Alerts">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Critical</span>
              <span className="font-medium text-red-600">{alertStats?.critical || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Warnings</span>
              <span className="font-medium text-yellow-600">{alertStats?.warnings || 0}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Total Unread</span>
              <span className="font-medium">{alertStats?.unread || 0}</span>
            </div>
          </div>
        </CardUntitled>
      </div>
    </div>
  );
}
