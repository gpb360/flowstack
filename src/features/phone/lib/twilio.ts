/**
 * Twilio API Client for Phone System
 * Handles calls, SMS, and phone number management
 */

import { supabase } from '@/lib/supabase';

// Types
export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  apiKeySid?: string;
  apiKeySecret?: string;
  edge?: string;
  region?: string;
}

export interface TwilioCallOptions {
  to: string;
  from: string;
  url?: string; // TwiML URL for call handling
  statusCallback?: string;
  statusCallbackEvent?: string[];
  timeout?: number;
  record?: boolean;
  recordingStatusCallback?: string;
  machineDetection?: 'Enable' | 'DetectMessageEnd';
  callerId?: string;
}

export interface TwilioSMSOptions {
  to: string;
  from: string;
  body: string;
  mediaUrls?: string[];
  statusCallback?: string;
}

export interface TwilioNumberOptions {
  phoneNumber: string;
  friendlyName?: string;
  voiceUrl?: string;
  voiceMethod?: 'GET' | 'POST';
  smsUrl?: string;
  smsMethod?: 'GET' | 'POST';
  statusCallback?: string;
}

// Helper: Format phone number to E.164
export function formatToE164(phone: string, countryCode: string = '+1'): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // If already has country code
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }

  // Add country code
  if (cleaned.length === 10) {
    return `${countryCode}${cleaned}`;
  }

  // Return as-is if already formatted
  if (phone.startsWith('+')) {
    return phone;
  }

  return `${countryCode}${cleaned}`;
}

// Helper: Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

// Initialize Twilio client config from edge function
export async function getTwilioConfig(): Promise<TwilioConfig | null> {
  const { data, error } = await supabase.functions.invoke('twilio-get-config');

  if (error) {
    console.error('Error fetching Twilio config:', error);
    return null;
  }

  return data;
}

// Make a phone call
export async function makeCall(options: TwilioCallOptions): Promise<{ success: boolean; callSid?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-make-call', {
      body: options,
    });

    if (error) throw error;

    return { success: true, callSid: data.sid };
  } catch (error: any) {
    console.error('Error making call:', error);
    return { success: false, error: error.message || 'Failed to make call' };
  }
}

// End an active call
export async function endCall(callSid: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('twilio-end-call', {
      body: { callSid },
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error ending call:', error);
    return { success: false, error: error.message || 'Failed to end call' };
  }
}

// Send SMS message
export async function sendSMS(options: TwilioSMSOptions): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-send-sms', {
      body: options,
    });

    if (error) throw error;

    return { success: true, messageSid: data.sid };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message || 'Failed to send SMS' };
  }
}

// Purchase phone number
export async function purchaseNumber(options: {
  areaCode?: string;
  contains?: string;
  country?: string;
}): Promise<{ success: boolean; phoneNumber?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-purchase-number', {
      body: options,
    });

    if (error) throw error;

    return { success: true, phoneNumber: data.phoneNumber };
  } catch (error: any) {
    console.error('Error purchasing number:', error);
    return { success: false, error: error.message || 'Failed to purchase number' };
  }
}

// Search available phone numbers
export async function searchAvailableNumbers(params: {
  areaCode?: string;
  contains?: string;
  country?: string;
  limit?: number;
}): Promise<{ success: boolean; numbers?: Array<{ phoneNumber: string; friendlyName: string; region: string }>; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-search-numbers', {
      body: params,
    });

    if (error) throw error;

    return { success: true, numbers: data.numbers };
  } catch (error: any) {
    console.error('Error searching numbers:', error);
    return { success: false, error: error.message || 'Failed to search numbers' };
  }
}

// Release phone number
export async function releaseNumber(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('twilio-release-number', {
      body: { phoneNumber },
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error releasing number:', error);
    return { success: false, error: error.message || 'Failed to release number' };
  }
}

// Get call recording
export async function getRecording(recordingSid: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-get-recording', {
      body: { recordingSid },
    });

    if (error) throw error;

    return { success: true, url: data.url };
  } catch (error: any) {
    console.error('Error getting recording:', error);
    return { success: false, error: error.message || 'Failed to get recording' };
  }
}

// Get call transcription
export async function getTranscription(callSid: string): Promise<{ success: boolean; transcript?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-get-transcription', {
      body: { callSid },
    });

    if (error) throw error;

    return { success: true, transcript: data.transcript };
  } catch (error: any) {
    console.error('Error getting transcription:', error);
    return { success: false, error: error.message || 'Failed to get transcription' };
  }
}

// Validate phone number
export async function validatePhoneNumber(phoneNumber: string): Promise<{
  success: boolean;
  valid?: boolean;
  countryCode?: string;
  type?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('twilio-validate-number', {
      body: { phoneNumber },
    });

    if (error) throw error;

    return {
      success: true,
      valid: data.valid,
      countryCode: data.countryCode,
      type: data.type,
    };
  } catch (error: any) {
    console.error('Error validating number:', error);
    return { success: false, error: error.message || 'Failed to validate number' };
  }
}
