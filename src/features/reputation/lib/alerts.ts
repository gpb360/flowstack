/**
 * Reputation Alert Management System
 * Handles alert notifications and preferences
 */

import { supabase } from '@/lib/supabase';

export interface ReviewNotification {
  id: string;
  organization_id: string;
  source_id: string;
  notify_on_new_review: boolean;
  notify_on_rating_change: boolean;
  notify_on_negative_review: boolean;
  negative_threshold: number;
  email_enabled: boolean;
  email_recipients: string[];
  sms_enabled: boolean;
  sms_recipients: string[];
  slack_enabled: boolean;
  slack_webhook_url?: string;
  send_digest: boolean;
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  active: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewFlag {
  id: string;
  organization_id: string;
  review_id: string;
  flag_reason: 'spam' | 'fake_review' | 'inappropriate_content' | 'competitor' | 'off_topic' | 'other';
  notes?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  action_taken: 'none' | 'hidden' | 'reported' | 'removed';
  flagged_by?: string;
  created_at: string;
}

export interface ReputationAlert {
  id: string;
  organization_id: string;
  type: 'negative_review' | 'rating_drop' | 'review_volume' | 'response_needed' | 'flagged_review';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  details?: any;
  action_url?: string;
  read: boolean;
  dismissed: boolean;
  created_at: string;
  read_at?: string;
  dismissed_at?: string;
}

/**
 * Get notification settings for a source
 */
export async function getNotificationSettings(sourceId: string): Promise<ReviewNotification | null> {
  const { data, error } = await supabase
    .from('review_notifications')
    .select('*')
    .eq('source_id', sourceId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }

  return data;
}

/**
 * Get all notification settings for an organization
 */
export async function getAllNotificationSettings(organizationId: string): Promise<ReviewNotification[]> {
  const { data, error } = await supabase
    .from('review_notifications')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) throw error;
  return data || [];
}

/**
 * Create or update notification settings
 */
export async function upsertNotificationSettings(
  organizationId: string,
  sourceId: string,
  settings: Omit<ReviewNotification, 'id' | 'organization_id' | 'source_id' | 'created_at' | 'updated_at'>
): Promise<ReviewNotification> {
  const { data, error } = await supabase
    .from('review_notifications')
    .upsert({
      organization_id: organizationId,
      source_id: sourceId,
      ...settings,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete notification settings
 */
export async function deleteNotificationSettings(sourceId: string): Promise<void> {
  const { error } = await supabase
    .from('review_notifications')
    .delete()
    .eq('source_id', sourceId);

  if (error) throw error;
}

/**
 * Get all flags for reviews
 */
export async function getReviewFlags(
  organizationId: string,
  filters?: {
    resolved?: boolean;
    flag_reason?: string;
  }
): Promise<ReviewFlag[]> {
  let query = supabase
    .from('review_flags')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved);
  }
  if (filters?.flag_reason) {
    query = query.eq('flag_reason', filters.flag_reason);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Flag a review
 */
export async function flagReview(
  organizationId: string,
  reviewId: string,
  flag: Omit<ReviewFlag, 'id' | 'organization_id' | 'review_id' | 'resolved' | 'created_at'>
): Promise<ReviewFlag> {
  const { data, error } = await supabase
    .from('review_flags')
    .insert({
      organization_id: organizationId,
      review_id: reviewId,
      ...flag,
      resolved: false,
    })
    .select()
    .single();

  if (error) throw error;

  // Update review status to flagged
  await supabase
    .from('reviews')
    .update({ status: 'flagged' })
    .eq('id', reviewId);

  return data;
}

/**
 * Resolve a flag
 */
export async function resolveFlag(
  flagId: string,
  resolvedBy: string,
  resolutionNotes?: string,
  actionTaken: 'none' | 'hidden' | 'reported' | 'removed' = 'none'
): Promise<ReviewFlag> {
  const { data, error } = await supabase
    .from('review_flags')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: resolvedBy,
      resolution_notes: resolutionNotes,
      action_taken: actionTaken,
    })
    .eq('id', flagId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get reputation alerts for an organization
 */
export async function getReputationAlerts(
  organizationId: string,
  filters?: {
    read?: boolean;
    dismissed?: boolean;
    severity?: string;
    limit?: number;
  }
): Promise<ReputationAlert[]> {
  let query = supabase
    .from('reputation_alerts')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (filters?.read !== undefined) {
    query = query.eq('read', filters.read);
  }
  if (filters?.dismissed !== undefined) {
    query = query.eq('dismissed', filters.dismissed);
  }
  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  // For now, we'll return mock data if the table doesn't exist yet
  return data || [];
}

/**
 * Mark an alert as read
 */
export async function markAlertRead(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('reputation_alerts')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', alertId);

  if (error) {
    // Table might not exist yet, that's okay
    console.warn('Failed to mark alert as read:', error);
  }
}

/**
 * Dismiss an alert
 */
export async function dismissAlert(alertId: string): Promise<void> {
  const { error } = await supabase
    .from('reputation_alerts')
    .update({
      dismissed: true,
      dismissed_at: new Date().toISOString(),
    })
    .eq('id', alertId);

  if (error) {
    // Table might not exist yet, that's okay
    console.warn('Failed to dismiss alert:', error);
  }
}

/**
 * Mark all alerts as read
 */
export async function markAllAlertsRead(organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('reputation_alerts')
    .update({
      read: true,
      read_at: new Date().toISOString(),
    })
    .eq('organization_id', organizationId)
    .eq('read', false);

  if (error) {
    // Table might not exist yet, that's okay
    console.warn('Failed to mark all alerts as read:', error);
  }
}

/**
 * Check if a review should trigger an alert
 */
export function shouldAlertReview(
  review: any,
  notificationSettings: ReviewNotification
): boolean {
  // Check for negative review alert
  if (notificationSettings.notify_on_negative_review) {
    if (review.rating <= notificationSettings.negative_threshold) {
      return true;
    }
  }

  // Check for new review alert
  if (notificationSettings.notify_on_new_review) {
    return true;
  }

  return false;
}

/**
 * Send notification for a review (simulated)
 */
export async function sendReviewNotification(
  review: any,
  source: any,
  notificationSettings: ReviewNotification
): Promise<{ success: boolean; error?: string }> {
  // In production, this would send actual emails, SMS, Slack messages, etc.
  // For now, we'll just log it

  console.log('Sending review notification:', {
    reviewId: review.id,
    sourceId: source.id,
    methods: {
      email: notificationSettings.email_enabled,
      sms: notificationSettings.sms_enabled,
      slack: notificationSettings.slack_enabled,
    },
  });

  // Update last_sent_at
  await supabase
    .from('review_notifications')
    .update({
      last_sent_at: new Date().toISOString(),
    })
    .eq('id', notificationSettings.id);

  return { success: true };
}

/**
 * Get alert statistics
 */
export async function getAlertStats(organizationId: string): Promise<{
  total: number;
  unread: number;
  critical: number;
  warnings: number;
}> {
  const alerts = await getReputationAlerts(organizationId);

  return {
    total: alerts.length,
    unread: alerts.filter((a) => !a.read).length,
    critical: alerts.filter((a) => a.severity === 'critical' && !a.dismissed).length,
    warnings: alerts.filter((a) => a.severity === 'warning' && !a.dismissed).length,
  };
}

/**
 * Create a reputation alert
 */
export async function createReputationAlert(
  organizationId: string,
  alert: Omit<ReputationAlert, 'id' | 'organization_id' | 'read' | 'dismissed' | 'created_at'>
): Promise<ReputationAlert> {
  const { data, error } = await supabase
    .from('reputation_alerts')
    .insert({
      organization_id: organizationId,
      ...alert,
      read: false,
      dismissed: false,
    })
    .select()
    .single();

  if (error) {
    // Table might not exist yet
    console.warn('Failed to create alert:', error);
    return {
      id: 'mock',
      organization_id: organizationId,
      ...alert,
      read: false,
      dismissed: false,
      created_at: new Date().toISOString(),
    };
  }

  return data;
}

/**
 * Get review flags for a specific review
 */
export async function getReviewFlagsForReview(reviewId: string): Promise<ReviewFlag[]> {
  const { data, error } = await supabase
    .from('review_flags')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
