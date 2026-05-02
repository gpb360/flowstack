/**
 * Review Aggregation System
 * Fetches reviews from various platforms (Google, Yelp, Facebook, etc.)
 */

import { supabase } from '@/lib/supabase';

export type ReviewPlatform = 'google' | 'yelp' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'zomato' | 'opentable';

export interface ReviewSource {
  id: string;
  organization_id: string;
  platform: ReviewPlatform;
  business_name: string;
  business_location?: string;
  business_id?: string;
  platform_url?: string;
  review_page_url?: string;
  sync_enabled: boolean;
  sync_frequency_hours: number;
  last_synced_at?: string;
  next_sync_at?: string;
  auto_response_enabled: boolean;
  status: 'active' | 'error' | 'disconnected';
  error_message?: string;
  average_rating?: number;
  total_reviews: number;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  organization_id: string;
  source_id: string;
  platform_review_id: string;
  reviewer_name?: string;
  reviewer_username?: string;
  reviewer_profile_url?: string;
  reviewer_image_url?: string;
  is_verified_purchase: boolean;
  rating: number;
  title?: string;
  content?: string;
  images?: string[];
  videos?: string[];
  review_date: string;
  raw_data?: any;
  status: 'new' | 'read' | 'flagged' | 'hidden';
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  tags?: string[];
  assigned_to?: string;
  fetched_at: string;
  created_at: string;
}

export interface ReviewAnalytics {
  total_reviews: number;
  average_rating: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
  positive_count: number;
  negative_count: number;
  response_rate: number;
}

/**
 * Fetch all review sources for an organization
 */
export async function getReviewSources(organizationId: string): Promise<ReviewSource[]> {
  const { data, error } = await supabase
    .from('review_sources')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single review source by ID
 */
export async function getReviewSource(sourceId: string): Promise<ReviewSource | null> {
  const { data, error } = await supabase
    .from('review_sources')
    .select('*')
    .eq('id', sourceId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new review source
 */
export async function createReviewSource(
  organizationId: string,
  source: Omit<ReviewSource, 'id' | 'organization_id' | 'total_reviews' | 'connected_at' | 'created_at' | 'updated_at'>
): Promise<ReviewSource> {
  const { data, error } = await supabase
    .from('review_sources')
    .insert({
      organization_id: organizationId,
      ...source,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a review source
 */
export async function updateReviewSource(
  sourceId: string,
  updates: Partial<Omit<ReviewSource, 'id' | 'organization_id' | 'created_at'>>
): Promise<ReviewSource> {
  const { data, error } = await supabase
    .from('review_sources')
    .update(updates)
    .eq('id', sourceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a review source
 */
export async function deleteReviewSource(sourceId: string): Promise<void> {
  const { error } = await supabase
    .from('review_sources')
    .delete()
    .eq('id', sourceId);

  if (error) throw error;
}

/**
 * Fetch reviews for an organization with optional filters
 */
export async function getReviews(
  organizationId: string,
  filters?: {
    sourceId?: string;
    rating?: number;
    status?: string;
    sentiment?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ reviews: Review[]; count: number }> {
  let query = supabase
    .from('reviews')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (filters?.sourceId) {
    query = query.eq('source_id', filters.sourceId);
  }
  if (filters?.rating) {
    query = query.eq('rating', filters.rating);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.sentiment) {
    query = query.eq('sentiment', filters.sentiment);
  }
  if (filters?.startDate) {
    query = query.gte('review_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('review_date', filters.endDate);
  }
  if (filters?.search) {
    query = query.or(`content.ilike.%${filters.search}%,reviewer_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%`);
  }

  query = query.order('review_date', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { reviews: data || [], count: count || 0 };
}

/**
 * Fetch a single review by ID with source and response info
 */
export async function getReviewDetail(reviewId: string): Promise<Review & { source?: ReviewSource; response?: any }> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      source:review_sources(*),
      responses:review_responses(*)
    `)
    .eq('id', reviewId)
    .single();

  if (error) throw error;
  return data as any;
}

/**
 * Update review status
 */
export async function updateReviewStatus(
  reviewId: string,
  status: 'new' | 'read' | 'flagged' | 'hidden'
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Assign review to a user
 */
export async function assignReview(reviewId: string, userId: string | null): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ assigned_to: userId })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Add tags to a review
 */
export async function tagReview(reviewId: string, tags: string[]): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ tags })
    .eq('id', reviewId);

  if (error) throw error;
}

/**
 * Get review summary using the database function
 */
export async function getReviewSummary(
  organizationId: string,
  sourceId?: string,
  days: number = 30
): Promise<ReviewAnalytics> {
  const { data, error } = await supabase.rpc('get_review_summary', {
    p_organization_id: organizationId,
    p_source_id: sourceId || null,
    p_days: days,
  });

  if (error) throw error;
  return data as any;
}

/**
 * Get review analytics by period
 */
export async function getReviewAnalytics(
  organizationId: string,
  sourceId?: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<any[]> {
  let query = supabase
    .from('review_analytics')
    .select('*')
    .eq('organization_id', organizationId);

  if (sourceId) {
    query = query.eq('source_id', sourceId);
  }
  if (periodStart) {
    query = query.gte('period_start', periodStart.toISOString().split('T')[0]);
  }
  if (periodEnd) {
    query = query.lte('period_end', periodEnd.toISOString().split('T')[0]);
  }

  query = query.order('period_start', { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get rating distribution for an organization
 */
export async function getRatingDistribution(
  organizationId: string,
  sourceId?: string,
  days: number = 30
): Promise<{ rating: number; count: number; percentage: number }[]> {
  const summary = await getReviewSummary(organizationId, sourceId, days);

  const total = summary.total_reviews || 1;

  return [
    { rating: 5, count: summary.rating_5_count, percentage: (summary.rating_5_count / total) * 100 },
    { rating: 4, count: summary.rating_4_count, percentage: (summary.rating_4_count / total) * 100 },
    { rating: 3, count: summary.rating_3_count, percentage: (summary.rating_3_count / total) * 100 },
    { rating: 2, count: summary.rating_2_count, percentage: (summary.rating_2_count / total) * 100 },
    { rating: 1, count: summary.rating_1_count, percentage: (summary.rating_1_count / total) * 100 },
  ];
}

/**
 * Get reviews trend over time
 */
export async function getReviewsTrend(
  organizationId: string,
  sourceId?: string,
  days: number = 90
): Promise<{ date: string; count: number; avg_rating: number }[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('reviews')
    .select('review_date, rating')
    .eq('organization_id', organizationId)
    .gte('review_date', startDate.toISOString())
    .order('review_date', { ascending: true });

  if (error) throw error;

  // Group by date
  const grouped = new Map<string, { count: number; total_rating: number }>();

  data?.forEach((review) => {
    const date = review.review_date.split('T')[0];
    const existing = grouped.get(date) || { count: 0, total_rating: 0 };
    existing.count++;
    existing.total_rating += review.rating;
    grouped.set(date, existing);
  });

  return Array.from(grouped.entries()).map(([date, stats]) => ({
    date,
    count: stats.count,
    avg_rating: stats.total_rating / stats.count,
  }));
}

/**
 * Sync reviews from a source (simulated - would call actual platform APIs in production)
 */
export async function syncReviewsFromSource(sourceId: string): Promise<{
  success: boolean;
  added: number;
  updated: number;
  error?: string;
}> {
  // In production, this would call the actual platform APIs
  // For now, we'll just update the last_synced_at timestamp
  const { error } = await supabase
    .from('review_sources')
    .update({
      last_synced_at: new Date().toISOString(),
      next_sync_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq('id', sourceId);

  if (error) {
    return { success: false, added: 0, updated: 0, error: error.message };
  }

  // Simulate sync result
  return { success: true, added: 0, updated: 0 };
}

/**
 * Bulk update review status
 */
export async function bulkUpdateReviewStatus(
  reviewIds: string[],
  status: 'new' | 'read' | 'flagged' | 'hidden'
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ status })
    .in('id', reviewIds);

  if (error) throw error;
}

/**
 * Bulk assign reviews
 */
export async function bulkAssignReviews(
  reviewIds: string[],
  userId: string | null
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({ assigned_to: userId })
    .in('id', reviewIds);

  if (error) throw error;
}
