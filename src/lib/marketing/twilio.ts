/**
 * Twilio SMS Integration
 *
 * Provides SMS sending capabilities via Twilio API.
 * Supports single SMS, bulk SMS, and conversation tracking.
 *
 * Environment Variables Required:
 * - TWILIO_ACCOUNT_SID: Your Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio Auth Token
 * - TWILIO_PHONE_NUMBER: Your Twilio phone number
 */

export interface SendSMSParams {
  to: string;
  body: string;
  from?: string;
}

export interface SMSResult {
  to: string;
  sid?: string;
  status: string;
  error?: string;
  success: boolean;
}

export interface SMSMessage {
  sid: string;
  from: string;
  to: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  dateCreated: Date;
  dateSent?: Date;
  errorCode?: string;
  errorMessage?: string;
}

export interface SMSConversation {
  phoneNumber: string;
  messages: SMSMessage[];
  unreadCount: number;
}

/**
 * Send a single SMS via Twilio
 * @param params SMS parameters
 * @returns Message SID if successful
 */
export async function sendSMS(params: SendSMSParams): Promise<string> {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
  const fromNumber = params.from || import.meta.env.VITE_TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required');
  }

  if (!fromNumber) {
    throw new Error('TWILIO_PHONE_NUMBER environment variable is required');
  }

  // Validate phone number format
  const formattedTo = formatPhoneNumber(params.to);
  if (!formattedTo) {
    throw new Error(`Invalid phone number format: ${params.to}`);
  }

  try {
    const credentials = btoa(`${accountSid}:${authToken}`);

    const formData = new URLSearchParams({
      From: fromNumber,
      To: formattedTo,
      Body: params.body.substring(0, 1600), // Twilio limit
    });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twilio API error: ${error}`);
    }

    const data = await response.json();
    return data.sid;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

/**
 * Send bulk SMS messages
 * @param params Array of SMS parameters
 * @returns Array of results for each SMS
 */
export async function sendBulkSMS(params: SendSMSParams[]): Promise<SMSResult[]> {
  const results: SMSResult[] = [];

  for (const param of params) {
    try {
      const sid = await sendSMS(param);
      results.push({
        to: param.to,
        sid,
        status: 'queued',
        success: true,
      });
    } catch (error) {
      results.push({
        to: param.to,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
    }
  }

  return results;
}

/**
 * Get SMS message status
 * @param messageSid Message SID
 * @returns Message status
 */
export async function getSMSStatus(messageSid: string): Promise<SMSMessage> {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required');
  }

  const credentials = btoa(`${accountSid}:${authToken}`);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${messageSid}.json`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch message status');
  }

  const data = await response.json();

  return {
    sid: data.sid,
    from: data.from,
    to: data.to,
    body: data.body,
    status: data.status,
    dateCreated: new Date(data.date_created),
    dateSent: data.date_sent ? new Date(data.date_sent) : undefined,
    errorCode: data.error_code,
    errorMessage: data.error_message,
  };
}

/**
 * Get conversation history for a phone number
 * @param phoneNumber Phone number
 * @returns Conversation messages
 */
export async function getConversation(phoneNumber: string): Promise<SMSConversation> {
  const accountSid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
  const authToken = import.meta.env.VITE_TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required');
  }

  const credentials = btoa(`${accountSid}:${authToken}`);
  const formattedNumber = formatPhoneNumber(phoneNumber);

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?To=${formattedNumber}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch conversation');
  }

  const data = await response.json();

  const messages: SMSMessage[] = data.messages.map((msg: any) => ({
    sid: msg.sid,
    from: msg.from,
    to: msg.to,
    body: msg.body,
    status: msg.status,
    dateCreated: new Date(msg.date_created),
    dateSent: msg.date_sent ? new Date(msg.date_sent) : undefined,
  }));

  return {
    phoneNumber,
    messages,
    unreadCount: 0, // You'd track this in your database
  };
}

/**
 * Validate phone number format
 * @param phone Phone number
 * @returns Formatted phone number or null if invalid
 */
export function formatPhoneNumber(phone: string): string | null {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid length (10-15 digits for international)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return null;
  }

  // Format as E.164
  if (!cleaned.startsWith('+')) {
    // Assume US number if no country code
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return `+${cleaned}`;
  }

  return cleaned;
}

/**
 * Calculate SMS segments and cost
 * @param message Message body
 * @returns Number of segments and estimated cost
 */
export function calculateSMSCost(message: string): {
  segments: number;
  estimatedCostUSD: number;
} {
  // GSM-7 encoding: 160 chars per segment (153 for multi-segment)
  // UTF-16 encoding: 70 chars per segment (67 for multi-segment)

  const hasNonGSM = /[^\x00-\x7F]/.test(message);
  const segmentSize = hasNonGSM ? 70 : 160;
  const multiSegmentSize = hasNonGSM ? 67 : 153;

  const length = message.length;
  let segments: number;

  if (length <= segmentSize) {
    segments = 1;
  } else {
    segments = Math.ceil(length / multiSegmentSize);
  }

  // Twilio SMS cost varies by country
  // US: ~$0.0075 per segment
  const estimatedCostUSD = segments * 0.0075;

  return { segments, estimatedCostUSD };
}

/**
 * Truncate message to fit in SMS segments
 * @param message Message body
 * @param maxSegments Maximum segments
 * @returns Truncated message
 */
export function truncateForSMS(message: string, maxSegments: number = 1): string {
  const hasNonGSM = /[^\x00-\x7F]/.test(message);
  const limit = hasNonGSM ? 70 * maxSegments : 160 * maxSegments;

  if (message.length <= limit) {
    return message;
  }

  return message.substring(0, limit - 3) + '...';
}

/**
 * Get SMS statistics
 * In production, you'd fetch this from Twilio or your database
 * @returns SMS statistics
 */
export async function getSMSStats(): Promise<{
  sent: number;
  delivered: number;
  failed: number;
  cost: number;
}> {
  // In production, fetch from Twilio API or your database
  return {
    sent: 0,
    delivered: 0,
    failed: 0,
    cost: 0,
  };
}

/**
 * Handle incoming SMS webhook
 * Twilio sends webhooks when you receive an SMS
 * @param body Webhook body
 * @returns Parsed webhook data
 */
export function parseIncomingWebhook(body: Record<string, unknown>): {
  from: string;
  to: string;
  body: string;
  sid: string;
} {
  return {
    from: body.From as string,
    to: body.To as string,
    body: body.Body as string,
    sid: body.MessageSid as string,
  };
}
