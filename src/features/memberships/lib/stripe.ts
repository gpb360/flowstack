/**
 * Stripe Integration for Membership Payments
 * Handles subscription creation, management, and webhooks
 */

import { supabase } from '@/lib/supabase';

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  prices: StripePrice[];
}

export interface StripePrice {
  id: string;
  product_id: string;
  unit_amount: number;
  currency: string;
  billing_interval: 'one_time' | 'monthly' | 'yearly';
  stripe_price_id?: string;
}

export interface CheckoutSessionInput {
  planId: string;
  userId: string;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionUpdateInput {
  subscriptionId: string;
  newPlanId: string;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}

/**
 * Create a Stripe checkout session for new subscriptions
 */
export async function createCheckoutSession(input: CheckoutSessionInput) {
  const { planId, userId, organizationId, successUrl, cancelUrl, metadata = {} } = input;

  // Get plan details with Stripe price ID
  const { data: plan, error: planError } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', planId)
    .eq('organization_id', organizationId)
    .single();

  if (planError || !plan) {
    throw new Error('Plan not found');
  }

  if (!plan.stripe_price_id && plan.price > 0) {
    throw new Error('Plan does not have a Stripe price configured');
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', userId)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    // Create new customer via Edge Function
    const { data: customer, error: customerError } = await supabase.functions.invoke(
      'stripe-create-customer',
      {
        body: {
          email: profile?.email,
          name: profile?.full_name,
          metadata: {
            user_id: userId,
            organization_id: organizationId,
          },
        },
      }
    );

    if (customerError || !customer?.id) {
      throw new Error('Failed to create Stripe customer');
    }

    customerId = customer.id;

    // Update user profile with customer ID
    await supabase
      .from('user_profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  // Create checkout session via Edge Function
  const { data: session, error: sessionError } = await supabase.functions.invoke(
    'stripe-create-checkout',
    {
      body: {
        priceId: plan.stripe_price_id,
        customerId,
        successUrl,
        cancelUrl,
        metadata: {
          plan_id: planId,
          user_id: userId,
          organization_id: organizationId,
          ...metadata,
        },
      },
    }
  );

  if (sessionError || !session?.url) {
    console.error('Checkout session error:', sessionError);
    throw new Error('Failed to create checkout session');
  }

  return session;
}

/**
 * Create a portal session for managing subscriptions
 */
export async function createPortalSession(
  userId: string,
  returnUrl: string
) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_customer_id) {
    throw new Error('No Stripe customer found');
  }

  const { data, error } = await supabase.functions.invoke('stripe-create-portal', {
    body: {
      customerId: profile.stripe_customer_id,
      returnUrl,
    },
  });

  if (error || !data?.url) {
    throw new Error('Failed to create portal session');
  }

  return data;
}

/**
 * Update subscription to a new plan
 */
export async function updateSubscription(input: SubscriptionUpdateInput) {
  const { subscriptionId, newPlanId, prorationBehavior = 'create_prorations' } = input;

  // Get current subscription
  const { data: currentSub, error: subError } = await supabase
    .from('membership_subscriptions')
    .select('*, plan:membership_plans(*)')
    .eq('id', subscriptionId)
    .single();

  if (subError || !currentSub) {
    throw new Error('Subscription not found');
  }

  // Get new plan
  const { data: newPlan, error: planError } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('id', newPlanId)
    .single();

  if (planError || !newPlan) {
    throw new Error('New plan not found');
  }

  if (!newPlan.stripe_price_id) {
    throw new Error('New plan does not have a Stripe price configured');
  }

  // Update via Edge Function
  const { data, error } = await supabase.functions.invoke('stripe-update-subscription', {
    body: {
      subscriptionId: currentSub.stripe_subscription_id,
      newPriceId: newPlan.stripe_price_id,
      prorationBehavior,
    },
  });

  if (error) {
    throw new Error('Failed to update subscription');
  }

  // Update local database
  await supabase
    .from('membership_subscriptions')
    .update({
      plan_id: newPlanId,
      price: newPlan.price,
      currency: newPlan.currency,
      billing_interval: newPlan.billing_interval,
    })
    .eq('id', subscriptionId);

  return data;
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(subscriptionId: string) {
  const { data: subscription, error: subError } = await supabase
    .from('membership_subscriptions')
    .select('stripe_subscription_id')
    .eq('id', subscriptionId)
    .single();

  if (subError || !subscription) {
    throw new Error('Subscription not found');
  }

  // Cancel via Stripe
  const { error } = await supabase.functions.invoke('stripe-cancel-subscription', {
    body: {
      subscriptionId: subscription.stripe_subscription_id,
      cancelAtPeriodEnd: true,
    },
  });

  if (error) {
    throw new Error('Failed to cancel subscription');
  }

  // Update local database
  await supabase
    .from('membership_subscriptions')
    .update({
      cancel_at_period_end: true,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  return { success: true };
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(subscriptionId: string) {
  const { data: subscription, error: subError } = await supabase
    .from('membership_subscriptions')
    .select('stripe_subscription_id')
    .eq('id', subscriptionId)
    .single();

  if (subError || !subscription) {
    throw new Error('Subscription not found');
  }

  // Resume via Stripe
  const { error } = await supabase.functions.invoke('stripe-resume-subscription', {
    body: {
      subscriptionId: subscription.stripe_subscription_id,
    },
  });

  if (error) {
    throw new Error('Failed to resume subscription');
  }

  // Update local database
  await supabase
    .from('membership_subscriptions')
    .update({
      cancel_at_period_end: false,
      cancelled_at: null,
    })
    .eq('id', subscriptionId);

  return { success: true };
}

/**
 * Get subscription usage stats
 */
export async function getSubscriptionUsage(subscriptionId: string) {
  const { data: subscription, error } = await supabase
    .from('membership_subscriptions')
    .select(`
      *,
      plan:membership_plans(*),
      access_records:membership_access(
        content_id,
        is_completed,
        last_accessed_at,
        total_time_spent_seconds
      )
    `)
    .eq('id', subscriptionId)
    .single();

  if (error || !subscription) {
    return null;
  }

  const totalContent = subscription.access_records?.length || 0;
  const completedContent = subscription.access_records?.filter((a) => a.is_completed).length || 0;
  const totalTimeSpent = subscription.access_records?.reduce(
    (sum, a) => sum + (a.total_time_spent_seconds || 0),
    0
  ) || 0;

  return {
    totalContent,
    completedContent,
    completionRate: totalContent > 0 ? (completedContent / totalContent) * 100 : 0,
    totalTimeSpent,
    totalTimeSpentHours: Math.round(totalTimeSpent / 3600),
  };
}

/**
 * Handle Stripe webhook events
 * This should be called from an Edge Function
 */
export async function handleWebhookEvent(event: {
  type: string;
  data: any;
}) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data);
      break;
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(data: any) {
  const { plan_id, user_id, organization_id } = data.metadata || {};

  if (plan_id && user_id && organization_id) {
    // Create pending subscription record
    await supabase.from('membership_subscriptions').insert({
      organization_id,
      plan_id,
      user_id,
      status: 'incomplete',
      stripe_customer_id: data.customer,
      started_at: new Date().toISOString(),
    });
  }
}

async function handleSubscriptionCreated(data: any) {
  const { metadata } = data;
  if (metadata?.plan_id && metadata?.user_id && metadata?.organization_id) {
    await supabase
      .from('membership_subscriptions')
      .update({
        status: 'active',
        stripe_subscription_id: data.id,
        current_period_start: new Date(data.current_period_start * 1000).toISOString(),
        current_period_end: new Date(data.current_period_end * 1000).toISOString(),
        trial_start: data.trial_start ? new Date(data.trial_start * 1000).toISOString() : null,
        trial_end: data.trial_end ? new Date(data.trial_end * 1000).toISOString() : null,
      })
      .eq('user_id', metadata.user_id)
      .eq('plan_id', metadata.plan_id)
      .eq('organization_id', metadata.organization_id);
  }
}

async function handleSubscriptionUpdated(data: any) {
  await supabase
    .from('membership_subscriptions')
    .update({
      status: data.status,
      cancel_at_period_end: data.cancel_at_period_end,
      current_period_end: new Date(data.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', data.id);
}

async function handleSubscriptionDeleted(data: any) {
  await supabase
    .from('membership_subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', data.id);
}

async function handleInvoicePaid(data: any) {
  // Update payment records, send receipt, etc.
  console.log('Invoice paid:', data.id);
}

async function handleInvoicePaymentFailed(data: any) {
  // Update subscription status, send notification, etc.
  const subscription = await supabase
    .from('membership_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', data.subscription);

  console.log('Invoice payment failed:', data.id);
}
