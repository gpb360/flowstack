/**
 * Access Control Logic for Memberships
 * Handles content gating, membership tiers, and drip content
 */

import { supabase } from '@/lib/supabase';

export interface AccessRule {
  type: 'free' | 'membership' | 'subscription' | 'one_time_purchase';
  required_plans?: string[];
  required_products?: string[];
  drip_enabled?: boolean;
  drip_schedule?: DripSchedule[];
}

export interface DripSchedule {
  content_id: string;
  delay_days: number;
}

export interface MemberAccess {
  hasAccess: boolean;
  accessType: 'full' | 'preview' | 'none';
  availableAt?: Date;
  reason?: string;
}

/**
 * Check if user has access to specific content
 */
export async function checkContentAccess(
  userId: string,
  contentId: string,
  organizationId: string
): Promise<MemberAccess> {
  // Get content details
  const { data: content, error: contentError } = await supabase
    .from('membership_content')
    .select('*')
    .eq('id', contentId)
    .eq('organization_id', organizationId)
    .single();

  if (contentError || !content) {
    return { hasAccess: false, accessType: 'none', reason: 'Content not found' };
  }

  // Free content is accessible to everyone
  if (content.access_tier === 'free' && !content.require_subscription) {
    return { hasAccess: true, accessType: 'full' };
  }

  // Get user's active subscription
  const { data: subscription, error: subError } = await supabase
    .from('membership_subscriptions')
    .select(`
      *,
      plan:membership_plans(*)
    `)
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .in('status', ['trialing', 'active'])
    .single();

  if (!subscription || subError) {
    return { hasAccess: false, accessType: 'none', reason: 'No active subscription' };
  }

  // Check if plan grants access to this tier
  const plan = subscription.plan as any;
  if (plan?.content_tiers?.includes(content.access_tier)) {
    // Check drip content
    if (content.drip_delay_days > 0) {
      const subscriptionStart = new Date(subscription.started_at);
      const availableAt = new Date(subscriptionStart);
      availableAt.setDate(availableAt.getDate() + content.drip_delay_days);

      if (new Date() < availableAt) {
        return {
          hasAccess: false,
          accessType: 'none',
          availableAt,
          reason: `Available in ${content.drip_delay_days} days`,
        };
      }
    }

    return { hasAccess: true, accessType: 'full' };
  }

  // Check if there's a preview available
  const { data: access } = await supabase
    .from('membership_access')
    .select('*')
    .eq('subscription_id', subscription.id)
    .eq('content_id', contentId)
    .single();

  if (access?.access_type === 'preview') {
    return { hasAccess: true, accessType: 'preview' };
  }

  return { hasAccess: false, accessType: 'none', reason: 'Plan does not include this content' };
}

/**
 * Get all accessible content for a user
 */
export async function getAccessibleContent(
  userId: string,
  organizationId: string
) {
  const { data, error } = await supabase.rpc('get_user_accessible_content', {
    p_user_id: userId,
    p_organization_id: organizationId,
  });

  if (error) {
    console.error('Error fetching accessible content:', error);
    return [];
  }

  return data;
}

/**
 * Grant access to content for a subscription
 */
export async function grantContentAccess(
  subscriptionId: string,
  contentId: string,
  accessType: 'full' | 'preview' = 'full'
) {
  const { data, error } = await supabase
    .from('membership_access')
    .upsert({
      subscription_id: subscriptionId,
      content_id: contentId,
      access_type: accessType,
    })
    .select()
    .single();

  if (error) {
    console.error('Error granting access:', error);
    return null;
  }

  return data;
}

/**
 * Update content progress
 */
export async function updateContentProgress(
  accessId: string,
  progressPercent: number,
  isCompleted: boolean = false
) {
  const { data, error } = await supabase
    .from('membership_access')
    .update({
      progress_percent: progressPercent,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      last_accessed_at: new Date().toISOString(),
    })
    .eq('id', accessId)
    .select()
    .single();

  if (error) {
    console.error('Error updating progress:', error);
    return null;
  }

  return data;
}

/**
 * Check if user can upgrade to higher tier
 */
export async function canUserUpgrade(userId: string, organizationId: string) {
  const { data: subscription } = await supabase
    .from('membership_subscriptions')
    .select('*, plan:membership_plans(*)')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .in('status', ['trialing', 'active'])
    .single();

  if (!subscription) {
    return { canUpgrade: true, reason: 'No subscription yet' };
  }

  // Get all available plans
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('price', { ascending: true });

  if (!plans) {
    return { canUpgrade: false, reason: 'No plans available' };
  }

  const currentPlanPrice = subscription.plan?.price || 0;
  const higherPlans = plans.filter((p) => p.price > currentPlanPrice);

  return {
    canUpgrade: higherPlans.length > 0,
    reason: higherPlans.length > 0 ? 'Higher tier plans available' : 'Already on highest tier',
    availablePlans: higherPlans,
  };
}
