/**
 * Resend Email Delivery Integration
 *
 * Provides email sending capabilities via Resend API.
 * Supports single emails, bulk sending, templates, and attachments.
 *
 * Environment Variables Required:
 * - RESEND_API_KEY: Your Resend API key
 */

export interface Attachment {
  filename: string;
  content: string; // base64 encoded content
  type?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: Attachment[];
  tags?: { name: string; value: string }[];
}

export interface BulkResult {
  to: string;
  messageId?: string;
  error?: string;
  success: boolean;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
}

/**
 * Send a single email via Resend
 * @param params Email parameters
 * @returns Message ID if successful
 */
export async function sendEmail(params: SendEmailParams): Promise<string> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const from = params.from || 'noreply@flowstack.app';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        reply_to: params.replyTo,
        attachments: params.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          type: att.type,
        })),
        tags: params.tags,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

/**
 * Send bulk emails via Resend
 * @param params Array of email parameters
 * @returns Array of results for each email
 */
export async function sendBulk(params: SendEmailParams[]): Promise<BulkResult[]> {
  const results: BulkResult[] = [];

  for (const param of params) {
    try {
      const messageId = await sendEmail(param);
      results.push({
        to: Array.isArray(param.to) ? param.to[0] : param.to,
        messageId,
        success: true,
      });
    } catch (error) {
      results.push({
        to: Array.isArray(param.to) ? param.to[0] : param.to,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
    }
  }

  return results;
}

/**
 * Get email statistics from Resend
 * Note: This requires the Resend API to expose stats endpoints
 * For now, returns cached stats from your database
 *
 * @param campaignId Campaign ID to get stats for
 * @returns Email statistics
 */
export async function getEmailStats(_campaignId: string): Promise<EmailStats> {
  // In production, you would fetch this from Resend's analytics API
  // For now, return default stats
  // The actual stats should be tracked in your marketing_logs table

  return {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    complained: 0,
  };
}

/**
 * Validate email address format
 * @param email Email address to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize HTML content for email
 * Removes potentially dangerous scripts and styles
 * @param html HTML content
 * @returns Sanitized HTML
 */
export function sanitizeEmailHTML(html: string): string {
  // Basic sanitization - remove script tags
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Preview email content
 * Generates a preview URL for testing emails
 * @param html HTML content
 * @returns Preview URL
 */
export function generateEmailPreview(html: string): string {
  // In production, you'd store this and return a URL
  // For now, create a data URL
  const sanitized = sanitizeEmailHTML(html);
  return `data:text/html;charset=utf-8,${encodeURIComponent(sanitized)}`;
}

/**
 * Parse email template with variables
 * Replaces {{variable}} placeholders with actual values
 * @param template Template string
 * @param data Variables data
 * @returns Rendered string
 */
export function parseEmailTemplate(template: string, data: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return String(data[key] ?? match);
  });
}

/**
 * Batch send emails with rate limiting
 * Resend has rate limits, so this helps stay within them
 * @param params Array of email parameters
 * @param batchSize Number of emails per batch
 * @param delayMs Delay between batches
 * @returns Array of results
 */
export async function sendBulkWithRateLimit(
  params: SendEmailParams[],
  batchSize: number = 50,
  delayMs: number = 1000
): Promise<BulkResult[]> {
  const results: BulkResult[] = [];

  for (let i = 0; i < params.length; i += batchSize) {
    const batch = params.slice(i, i + batchSize);
    const batchResults = await sendBulk(batch);
    results.push(...batchResults);

    // Wait before next batch (except for last batch)
    if (i + batchSize < params.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
