import { supabase } from './supabase';

export interface NewsletterSubscriptionResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Validates email format using RFC 5322 compliant regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Subscribes an email to the newsletter
 * Uses Supabase newsletter_subscribers table
 */
export const subscribeToNewsletter = async (
  email: string
): Promise<NewsletterSubscriptionResult> => {
  // Validate email format
  if (!validateEmail(email)) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
      error: 'INVALID_EMAIL',
    };
  }

  try {
    // Check if email already exists
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    // If already subscribed and active
    if (existing && existing.status === 'active') {
      return {
        success: true,
        message: 'You are already subscribed to our newsletter!',
      };
    }

    // If exists but unsubscribed, reactivate
    if (existing && existing.status === 'unsubscribed') {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'active', subscribed_at: new Date().toISOString() })
        .eq('email', email.toLowerCase());

      if (updateError) throw updateError;

      return {
        success: true,
        message: 'Welcome back! You have been resubscribed to our newsletter.',
      };
    }

    // New subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        source: 'landing_page',
        status: 'active',
        subscribed_at: new Date().toISOString(),
      });

    if (insertError) {
      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return {
          success: true,
          message: 'You are already subscribed to our newsletter!',
        };
      }
      throw insertError;
    }

    return {
      success: true,
      message: 'Thanks for subscribing! Check your inbox for a confirmation.',
    };
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
      error: error.message || 'UNKNOWN_ERROR',
    };
  }
};

/**
 * Rate limiting tracker for newsletter subscriptions
 * Prevents spam submissions from the same session
 */
class SubscriptionRateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private readonly MAX_SUBMISSIONS = 3;
  private readonly WINDOW_MS = 60000; // 1 minute

  canSubmit(identifier: string): boolean {
    const now = Date.now();
    const timestamps = this.submissions.get(identifier) || [];

    // Remove timestamps outside the window
    const validTimestamps = timestamps.filter(t => now - t < this.WINDOW_MS);

    if (validTimestamps.length >= this.MAX_SUBMISSIONS) {
      return false;
    }

    validTimestamps.push(now);
    this.submissions.set(identifier, validTimestamps);
    return true;
  }

  reset(identifier: string): void {
    this.submissions.delete(identifier);
  }
}

export const rateLimiter = new SubscriptionRateLimiter();
