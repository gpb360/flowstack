import type { APIClient, APIRequestOptions } from './types';
import type { OAuthTokens } from './types';

/**
 * Generic API Client Factory
 *
 * Creates typed API clients for external services with automatic authentication
 */

// =====================================================
// Generic API Client
// =====================================================

export class GenericAPIClient implements APIClient {
  constructor(
    private baseUrl: string,
    private getAccessToken: () => Promise<string>,
    private defaultHeaders: Record<string, string> = {}
  ) {}

  private async request<T>(
    method: string,
    endpoint: string,
    options: APIRequestOptions = {}
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    let url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (options.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(options.body);
    }

    // Add query parameters for GET requests
    if (options.params && Object.keys(options.params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${response.status} ${error}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>('GET', endpoint, { params });
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>('POST', endpoint, { body: data });
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>('PUT', endpoint, { body: data });
  }

  async patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    return this.request<T>('PATCH', endpoint, { body: data });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

// =====================================================
// Stripe API Client
// =====================================================

export function createStripeClient(apiKey: string): APIClient {
  return new GenericAPIClient(
    'https://api.stripe.com/v1',
    async () => apiKey,
    {
      'Authorization': `Bearer ${apiKey}`,
      'Stripe-Version': '2023-10-16',
    }
  );
}

// =====================================================
// Google API Client
// =====================================================

export function createGoogleClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://www.googleapis.com',
    getAccessToken
  );
}

// Gmail-specific client
export function createGmailClient(getAccessToken: () => Promise<string>) {
  return new GenericAPIClient(
    'https://gmail.googleapis.com',
    getAccessToken
  );
}

// Calendar-specific client
export function createGoogleCalendarClient(getAccessToken: () => Promise<string>) {
  return new GenericAPIClient(
    'https://www.googleapis.com/calendar/v3',
    getAccessToken
  );
}

// Drive-specific client
export function createGoogleDriveClient(getAccessToken: () => Promise<string>) {
  return new GenericAPIClient(
    'https://www.googleapis.com/drive/v3',
    getAccessToken
  );
}

// Sheets-specific client
export function createGoogleSheetsClient(getAccessToken: () => Promise<string>) {
  return new GenericAPIClient(
    'https://sheets.googleapis.com/v4',
    getAccessToken
  );
}

// =====================================================
// Slack API Client
// =====================================================

export function createSlackClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://slack.com/api',
    getAccessToken
  );
}

// =====================================================
// HubSpot API Client
// =====================================================

export function createHubSpotClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://api.hubapi.com',
    getAccessToken
  );
}

// =====================================================
// Salesforce API Client
// =====================================================

export function createSalesforceClient(
  getInstanceUrl: () => Promise<string>,
  getAccessToken: () => Promise<string>
): APIClient {
  return new GenericAPIClient(
    '', // Base URL is dynamic, will be prepended to each endpoint
    async () => {
      const token = await getAccessToken();
      const instanceUrl = await getInstanceUrl();
      return `${instanceUrl}/`;
    }
  );
}

// =====================================================
// Shopify API Client
// =====================================================

export function createShopifyClient(
  shopDomain: string,
  accessToken: string
): APIClient {
  return new GenericAPIClient(
    `https://${shopDomain}/admin/api/2024-01`,
    async () => accessToken,
    {
      'X-Shopify-Access-Token': accessToken,
    }
  );
}

// =====================================================
// WooCommerce API Client
// =====================================================

export function createWooCommerceClient(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): APIClient {
  const auth = btoa(`${consumerKey}:${consumerSecret}`);

  return new GenericAPIClient(
    `${storeUrl}/wp-json/wc/v3`,
    async () => '',
    {
      'Authorization': `Basic ${auth}`,
    }
  );
}

// =====================================================
// Zoom API Client
// =====================================================

export function createZoomClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://api.zoom.us/v2',
    getAccessToken
  );
}

// =====================================================
// Notion API Client
// =====================================================

export function createNotionClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://api.notion.com/v1',
    getAccessToken,
    {
      'Notion-Version': '2022-06-28',
    }
  );
}

// =====================================================
// Trello API Client
// =====================================================

export function createTrelloClient(apiKey: string, token: string): APIClient {
  return new GenericAPIClient(
    'https://api.trello.com/1',
    async () => token,
    {
      'Accept': 'application/json',
    }
  );
}

// =====================================================
// Calendly API Client
// =====================================================

export function createCalendlyClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://api.calendly.com',
    getAccessToken
  );
}

// =====================================================
// Dropbox API Client
// =====================================================

export function createDropboxClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://api.dropboxapi.com',
    getAccessToken,
    {
      'Dropbox-API-Arg': '{}',
    }
  );
}

// =====================================================
// SendGrid API Client
// =====================================================

export function createSendGridClient(apiKey: string): APIClient {
  return new GenericAPIClient(
    'https://api.sendgrid.com/v3',
    async () => apiKey,
    {
      'Authorization': `Bearer ${apiKey}`,
    }
  );
}

// =====================================================
// Mailgun API Client
// =====================================================

export function createMailgunClient(
  apiUrl: string,
  apiKey: string
): APIClient {
  return new GenericAPIClient(
    apiUrl,
    async () => apiKey,
    {
      'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
    }
  );
}

// =====================================================
// Mixpanel API Client
// =====================================================

export function createMixpanelClient(apiKey: string): APIClient {
  return new GenericAPIClient(
    'https://api.mixpanel.com',
    async () => '',
    {
      'Authorization': `Basic ${btoa(`${apiKey}:`)}`,
    }
  );
}

// =====================================================
// Discord Webhook Client
// =====================================================

export class DiscordWebhookClient {
  constructor(private webhookUrl: string) {}

  async sendMessage(
    content: string,
    options?: {
      username?: string;
      avatar_url?: string;
      embeds?: Array<{
        title?: string;
        description?: string;
        color?: number;
        fields?: Array<{ name: string; value: string; inline?: boolean }>;
      }>;
    }
  ): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        ...options,
      }),
    });
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Create API client from connection credentials
 */
export async function createClientFromConnection(
  integrationId: string,
  credentials: any
): Promise<APIClient> {
  const getAccessToken = async () => {
    if (credentials.access_token) {
      return credentials.access_token;
    }
    throw new Error('No access token available');
  };

  switch (integrationId) {
    case 'stripe':
      return createStripeClient(credentials.api_key);

    case 'google':
      return createGoogleClient(getAccessToken);

    case 'slack':
      return createSlackClient(getAccessToken);

    case 'hubspot':
      return createHubSpotClient(getAccessToken);

    case 'salesforce':
      return createSalesforceClient(
        async () => credentials.instance_url,
        getAccessToken
      );

    case 'shopify':
      return createShopifyClient(credentials.shop_domain, credentials.access_token);

    case 'woo':
    case 'woocommerce':
      return createWooCommerceClient(
        credentials.store_url,
        credentials.consumer_key,
        credentials.consumer_secret
      );

    case 'zoom':
      return createZoomClient(getAccessToken);

    case 'notion':
      return createNotionClient(getAccessToken);

    case 'trello':
      return createTrelloClient(credentials.api_key, credentials.oauth_token);

    case 'calendly':
      return createCalendlyClient(getAccessToken);

    case 'dropbox':
      return createDropboxClient(getAccessToken);

    case 'sendgrid':
      return createSendGridClient(credentials.api_key);

    case 'mailgun':
      return createMailgunClient(credentials.api_url, credentials.api_key);

    default:
      throw new Error(`Unknown integration: ${integrationId}`);
  }
}
