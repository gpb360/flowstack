// @ts-nocheck
// OAuth flow handlers — needs server-side migration for production
import { supabase } from '@/lib/supabase';
import type { OAuthTokens } from './types';

/**
 * OAuth Configuration for each integration
 */
interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  extraAuthParams?: Record<string, string>;
}

/**
 * Stored OAuth tokens with metadata
 */
export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp
  token_type?: string;
  scope?: string;
  provider: string; // integration_id
  connection_id?: string;
}

/**
 * OAuth state for security verification
 */
interface OAuthState {
  provider: string;
  organization_id: string;
  redirect_to?: string;
  timestamp: number;
}

// =====================================================
// OAuth Configuration
// =====================================================

const getOAuthConfig = (integrationId: string): OAuthConfig | null => {
  const configs: Record<string, OAuthConfig> = {
    google: {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scopes: ['openid', 'profile', 'email'],
    },
    slack: {
      clientId: import.meta.env.VITE_SLACK_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_SLACK_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://slack.com/oauth/v2/authorize',
      tokenUrl: 'https://slack.com/api/oauth.v2.access',
      scopes: ['chat:write', 'channels:read'],
    },
    hubspot: {
      clientId: import.meta.env.VITE_HUBSPOT_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_HUBSPOT_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
    },
    salesforce: {
      clientId: import.meta.env.VITE_SALESFORCE_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_SALESFORCE_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      scopes: ['api', 'refresh_token'],
    },
    zoom: {
      clientId: import.meta.env.VITE_ZOOM_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_ZOOM_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://zoom.us/oauth/authorize',
      tokenUrl: 'https://zoom.us/oauth/token',
      scopes: ['meeting:write', 'user:read'],
    },
    notion: {
      clientId: import.meta.env.VITE_NOTION_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_NOTION_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://api.notion.com/v1/oauth/authorize',
      tokenUrl: 'https://api.notion.com/v1/oauth/token',
      scopes: [],
    },
    dropbox: {
      clientId: import.meta.env.VITE_DROPBOX_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_DROPBOX_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://www.dropbox.com/oauth2/authorize',
      tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
      scopes: ['files.content.write', 'files.content.read'],
    },
    trello: {
      clientId: import.meta.env.VITE_TRELLO_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_TRELLO_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://trello.com/1/authorize',
      tokenUrl: 'https://trello.com/1/oauth2/token',
      scopes: ['read', 'write'],
      extraAuthParams: {
        response_type: 'token',
        expiration: 'never',
      },
    },
    calendly: {
      clientId: import.meta.env.VITE_CALENDLY_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_CALENDLY_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://auth.calendly.com/oauth/authorize',
      tokenUrl: 'https://auth.calendly.com/oauth/token',
      scopes: [],
    },
    paypal: {
      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_PAYPAL_CLIENT_SECRET || '',
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://www.paypal.com/signin/authorize',
      tokenUrl: 'https://api-m.paypal.com/v1/oauth2/token',
      scopes: ['openid', 'email'],
    },
  };

  return configs[integrationId] || null;
};

// =====================================================
// OAuth State Management
// =====================================================

/**
 * Generate OAuth state parameter for security
 */
const generateOAuthState = (
  provider: string,
  organizationId: string,
  redirectTo?: string
): string => {
  const state: OAuthState = {
    provider,
    organization_id: organizationId,
    redirect_to: redirectTo,
    timestamp: Date.now(),
  };

  // Store state in session storage for verification during callback
  const stateString = JSON.stringify(state);
  const encodedState = btoa(stateString);
  sessionStorage.setItem('oauth_state', encodedState);

  return encodedState;
};

/**
 * Verify and decode OAuth state
 */
export const verifyOAuthState = (
  state: string
): OAuthState | null => {
  try {
    const storedState = sessionStorage.getItem('oauth_state');
    if (!storedState || storedState !== state) {
      return null;
    }

    const decoded: OAuthState = JSON.parse(atob(state));

    // Check if state is not too old (5 minutes)
    const maxAge = 5 * 60 * 1000;
    if (Date.now() - decoded.timestamp > maxAge) {
      return null;
    }

    // Clear stored state after verification
    sessionStorage.removeItem('oauth_state');

    return decoded;
  } catch {
    return null;
  }
};

// =====================================================
// OAuth Flow Functions
// =====================================================

/**
 * Initiate OAuth flow by redirecting to provider's auth URL
 */
export const initiateOAuth = async (
  integrationId: string,
  organizationId: string,
  redirectTo?: string
): Promise<string> => {
  const config = getOAuthConfig(integrationId);
  if (!config) {
    throw new Error(`OAuth not configured for integration: ${integrationId}`);
  }

  if (!config.clientId) {
    throw new Error(`Missing client ID for integration: ${integrationId}`);
  }

  // Generate state parameter
  const state = generateOAuthState(integrationId, organizationId, redirectTo);

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    state,
    ...(config.scopes.length > 0 && { scope: config.scopes.join(' ') }),
    ...config.extraAuthParams,
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;

  return authUrl;
};

/**
 * Exchange authorization code for access tokens
 */
export const exchangeCodeForTokens = async (
  integrationId: string,
  code: string
): Promise<OAuthTokens> => {
  const config = getOAuthConfig(integrationId);
  if (!config) {
    throw new Error(`OAuth not configured for integration: ${integrationId}`);
  }

  if (!config.clientSecret) {
    throw new Error(`Missing client secret for integration: ${integrationId}`);
  }

  // Prepare token request
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  // Some providers use Basic auth instead of client_id/secret in body
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // Special handling for different providers
  let tokenUrl = config.tokenUrl;
  if (integrationId === 'notion') {
    // Notion uses Basic auth
    const basicAuth = btoa(`${config.clientId}:${config.clientSecret}`);
    headers['Authorization'] = `Basic ${basicAuth}`;
    // Remove client_id and client_secret from body
    params.delete('client_id');
    params.delete('client_secret');
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers,
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  // Calculate token expiration
  const expires_in = data.expires_in || data.expires || 3600;
  const expires_at = Date.now() + expires_in * 1000;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
    provider: integrationId,
  };
};

/**
 * Refresh an expired access token
 */
export const refreshAccessToken = async (
  connectionId: string,
  refreshToken: string,
  integrationId: string
): Promise<OAuthTokens> => {
  const config = getOAuthConfig(integrationId);
  if (!config) {
    throw new Error(`OAuth not configured for integration: ${integrationId}`);
  }

  if (!config.clientSecret) {
    throw new Error(`Missing client secret for integration: ${integrationId}`);
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  let tokenUrl = config.tokenUrl;
  if (integrationId === 'notion') {
    const basicAuth = btoa(`${config.clientId}:${config.clientSecret}`);
    headers['Authorization'] = `Basic ${basicAuth}`;
    params.delete('client_id');
    params.delete('client_secret');
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers,
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();

  const expires_in = data.expires_in || data.expires || 3600;
  const expires_at = Date.now() + expires_in * 1000;

  // Update connection in database with new tokens
  const { error } = await supabase
    .from('integration_connections')
    .update({
      credentials: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshToken,
        expires_at,
        token_type: data.token_type || 'Bearer',
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId);

  if (error) {
    throw new Error(`Failed to update connection: ${error.message}`);
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
    provider: integrationId,
    connection_id,
  };
};

/**
 * Get a valid access token, refreshing if necessary
 */
export const getValidAccessToken = async (
  connectionId: string,
  integrationId: string
): Promise<string> => {
  // Fetch connection from database
  const { data: connection, error } = await supabase
    .from('integration_connections')
    .select('credentials')
    .eq('id', connectionId)
    .single();

  if (error || !connection) {
    throw new Error(`Connection not found: ${connectionId}`);
  }

  const credentials = connection.credentials as OAuthTokens;
  const now = Date.now();

  // Add buffer (5 minutes) before expiration
  const isExpired = now > credentials.expires_at - 5 * 60 * 1000;

  if (isExpired) {
    // Token needs refresh
    if (!credentials.refresh_token) {
      throw new Error('Access token expired and no refresh token available');
    }

    const newTokens = await refreshAccessToken(
      connectionId,
      credentials.refresh_token,
      integrationId
    );

    return newTokens.access_token;
  }

  return credentials.access_token;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (tokens: OAuthTokens): boolean => {
  const now = Date.now();
  const buffer = 5 * 60 * 1000; // 5 minutes buffer
  return now > tokens.expires_at - buffer;
};

/**
 * Save OAuth connection to database
 */
export const saveOAuthConnection = async (
  organizationId: string,
  integrationId: string,
  tokens: OAuthTokens,
  name?: string
): Promise<string> => {
  const { data, error } = await supabase
    .from('integration_connections')
    .insert({
      organization_id: organizationId,
      integration_id: integrationId,
      name: name || `${integrationId} Connection`,
      status: 'active',
      credentials: tokens,
      config: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to save connection: ${error.message}`);
  }

  return data.id;
};

/**
 * Revoke OAuth tokens (disconnect integration)
 */
export const revokeOAuthConnection = async (
  connectionId: string
): Promise<void> => {
  const { error } = await supabase
    .from('integration_connections')
    .update({
      status: 'disabled',
      credentials: {},
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId);

  if (error) {
    throw new Error(`Failed to revoke connection: ${error.message}`);
  }
};
