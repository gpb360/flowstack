# Integrations Module Documentation

## Overview

The Integrations module enables FlowStack to connect with third-party services (Stripe, Google, Slack, etc.) for data synchronization, webhook handling, and workflow automation. This module is the connective tissue that allows FlowStack to integrate with the broader ecosystem of business tools.

## Architecture

### Core Components

```
src/features/integrations/
├── lib/
│   ├── registry.ts          # Integration definitions (20+ integrations)
│   ├── oauth.ts             # OAuth flow handler
│   ├── api.ts               # API client factory
│   ├── webhooks.ts          # Webhook management
│   ├── sync.ts              # Data synchronization
│   ├── types.ts             # TypeScript types
│   └── queries.ts           # React Query hooks
├── connections/
│   ├── ConnectionList.tsx   # Active connections view
│   ├── ConnectionWizard.tsx # New connection flow
│   └── ConnectionSettings.tsx # Connection configuration
├── registry/
│   ├── IntegrationRegistry.tsx # Browse integrations
│   └── IntegrationCard.tsx     # Integration card component
├── webhooks/
│   ├── WebhookList.tsx      # Webhook management UI
│   ├── WebhookViewer.tsx    # Webhook details
│   └── WebhookLogs.tsx      # Webhook event logs
├── oauth/
│   └── OAuthCallback.tsx    # OAuth redirect handler
├── IntegrationsLayout.tsx   # Main layout with navigation
└── index.ts                 # Exports
```

### Database Schema

```sql
-- Integration Connections
integration_connections (id, organization_id, integration_id, name, status, credentials, config)

-- Webhook Subscriptions
integration_webhooks (id, organization_id, connection_id, integration_id, event_type, endpoint_url, secret)

-- Sync Logs
integration_sync_logs (id, connection_id, sync_type, sync_direction, status, records_processed)

-- Webhook Events
integration_webhook_events (id, webhook_id, event_type, payload, status, processed_at)
```

## Available Integrations

### Payment
- **Stripe** - Payments, subscriptions, invoices, customers
- **PayPal** - One-time payments and order processing

### Communication
- **Slack** - Messages, channels, mentions
- **Discord** - Webhook-based messaging

### Productivity (Google Workspace)
- **Gmail** - Send and read emails
- **Calendar** - Create and manage events
- **Drive** - File upload and management
- **Sheets** - Read and write spreadsheet data

### Calendar
- **Calendly** - Appointment scheduling

### CRM
- **HubSpot** - Contacts, deals, companies
- **Salesforce** - Leads and opportunities

### E-commerce
- **Shopify** - Products, orders, customers
- **WooCommerce** - Products, orders

### Analytics
- **Google Analytics** - Event tracking
- **Mixpanel** - Event analytics

### Video
- **Zoom** - Meetings and recordings

### Productivity
- **Notion** - Pages and databases
- **Trello** - Cards and lists

### Storage
- **Dropbox** - File storage

### Email Marketing
- **SendGrid** - Transactional email
- **Mailgun** - Email automation

### Other
- **Zapier** - Connect to 5000+ apps
- **Custom Webhooks** - Receive webhooks from any service

## Usage

### Connecting an Integration

1. Navigate to `/integrations/registry`
2. Browse or search for an integration
3. Click "Connect" on the desired integration
4. Follow the authentication flow (OAuth or API key)
5. Configure sync settings and webhooks
6. Save the connection

### Using Integrations in Workflows

Integrations provide **actions** and **triggers** for workflow automation:

**Actions** (what you can do):
- Send a Slack message when a deal is won
- Create a Stripe invoice for a new order
- Add a Google Calendar event for new appointments
- Create a HubSpot contact from form submissions

**Triggers** (what starts workflows):
- Payment succeeded in Stripe
- New email received in Gmail
- Slack message in a channel
- New order in Shopify

### Data Synchronization

Configure automatic data sync between FlowStack and connected integrations:

**Sync Types:**
- `stripe_customers` → CRM contacts
- `stripe_subscriptions` → Deals/subscriptions
- `google_calendar_events` → Appointments
- `hubspot_contacts` → CRM contacts
- `shopify_orders` → CRM contacts

**Sync Configuration:**
```typescript
const syncConfig: SyncConfig = {
  frequency: 'daily',
  direction: 'pull',
  mappings: [
    { source: 'email', target: 'email' },
    { source: 'name', target: 'full_name' },
  ],
};
```

### Webhook Management

1. Navigate to `/integrations/webhooks`
2. View active webhook subscriptions
3. See webhook event logs
4. Test webhooks
5. Toggle webhooks on/off

## API Reference

### Integration Registry

```typescript
import { getAllIntegrations, getIntegration } from '@/features/integrations';

// Get all integrations
const integrations = getAllIntegrations();

// Get specific integration
const stripe = getIntegration('stripe');
```

### OAuth Functions

```typescript
import { initiateOAuth, getValidAccessToken } from '@/features/integrations/lib/oauth';

// Start OAuth flow
const authUrl = await initiateOAuth('stripe', organizationId);

// Get access token (auto-refreshes if needed)
const token = await getValidAccessToken(connectionId, 'stripe');
```

### API Clients

```typescript
import { createStripeClient, createSlackClient } from '@/features/integrations/lib/api';

// Create API client
const stripe = createStripeClient(apiKey);

// Use the client
const customer = await stripe.post('/v1/customers', {
  email: 'user@example.com',
  name: 'John Doe',
});
```

### React Query Hooks

```typescript
import {
  useConnections,
  useCreateConnection,
  useWebhooks,
  useSyncLogs,
} from '@/features/integrations';

// Fetch connections
const { data: connections } = useConnections(organizationId);

// Create connection
const createConnection = useCreateConnection();
await createConnection.mutateAsync({
  organization_id: orgId,
  integration_id: 'stripe',
  credentials: { api_key: 'sk_test_...' },
});
```

## Environment Variables

```bash
# Stripe
STRIPE_CLIENT_ID=...
STRIPE_CLIENT_SECRET=...
STRIPE_WEBHOOK_SECRET=...

# Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...

# Slack
SLACK_CLIENT_ID=...
SLACK_CLIENT_SECRET=...
SLACK_SIGNING_SECRET=...

# HubSpot
HUBSPOT_CLIENT_ID=...
HUBSPOT_CLIENT_SECRET=...
HUBSPOT_API_KEY=...

# Others
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...
NOTION_CLIENT_ID=...
NOTION_CLIENT_SECRET=...
DROPBOX_CLIENT_ID=...
DROPBOX_CLIENT_SECRET=...
TRELLO_CLIENT_ID=...
TRELLO_CLIENT_SECRET=...
CALENDLY_CLIENT_ID=...
CALENDLY_CLIENT_SECRET=...
SENDGRID_API_KEY=...
MAILGUN_API_KEY=...
```

## Webhook Endpoint

FlowStack provides a Supabase Edge Function for receiving webhooks:

**URL:** `https://your-project.supabase.co/functions/v1/webhook-handler/{integration_id}`

**Example for Stripe:**
```
https://your-project.supabase.co/functions/v1/webhook-handler/stripe
```

## Adding a New Integration

### 1. Define Integration in Registry

```typescript
// src/features/integrations/lib/registry.ts
export const INTEGRATIONS: Record<string, IntegrationDefinition> = {
  my_integration: {
    id: 'my_integration',
    name: 'My Integration',
    description: 'Does amazing things',
    category: 'other',
    icon: MyIcon,
    authType: 'api_key',
    webhookSupport: true,
    actions: [
      {
        id: 'my_integration.do_something',
        name: 'Do Something',
        description: 'Performs an action',
        category: 'action',
        inputs: {
          param1: { type: 'string', label: 'Parameter', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'my_integration.event_happened',
        name: 'Event Happened',
        description: 'Triggered when something occurs',
        category: 'event',
        webhookSupported: true,
      },
    ],
  },
};
```

### 2. Add OAuth Configuration (if applicable)

```typescript
// src/features/integrations/lib/oauth.ts
const getOAuthConfig = (integrationId: string): OAuthConfig | null => {
  const configs: Record<string, OAuthConfig> = {
    my_integration: {
      clientId: import.meta.env.MY_INTEGRATION_CLIENT_ID,
      clientSecret: import.meta.env.MY_INTEGRATION_CLIENT_SECRET,
      redirectUri: `${window.location.origin}/integrations/oauth/callback`,
      authUrl: 'https://api.example.com/oauth/authorize',
      tokenUrl: 'https://api.example.com/oauth/token',
      scopes: ['read', 'write'],
    },
  };
  return configs[integrationId] || null;
};
```

### 3. Create API Client

```typescript
// src/features/integrations/lib/api.ts
export function createMyIntegrationClient(getAccessToken: () => Promise<string>): APIClient {
  return new GenericAPIClient(
    'https://api.example.com/v2',
    getAccessToken
  );
}
```

### 4. Add Webhook Handler

```typescript
// supabase/functions/webhook-handler/index.ts
const webhookHandlers: Record<string, ...> = {
  my_integration: async (payload, headers) => {
    return {
      eventType: `my_integration.${payload.type}`,
      data: payload.data,
    };
  },
};
```

### 5. Implement Sync (optional)

```typescript
// src/features/integrations/lib/sync.ts
async function syncMyIntegration(
  syncType: string,
  config: SyncConfig,
  apiClient: any,
  organizationId: string
): Promise<SyncResult> {
  // Implementation
}
```

## Security

### OAuth Security
- State parameter validation to prevent CSRF attacks
- Token expiration handling with auto-refresh
- Secure token storage in database (encrypted)

### Webhook Security
- Signature verification (HMAC-based)
- Timestamp validation (Slack, Stripe)
- Idempotency key handling

### API Key Security
- Encrypted storage in database
- Never logged or exposed in error messages
- RLS policies restrict access to organization members

## Troubleshooting

### OAuth Flow Fails
1. Check redirect URI matches in OAuth provider settings
2. Verify client ID and secret are correct
3. Check required scopes are granted

### Webhooks Not Received
1. Verify webhook secret matches provider's secret
2. Check webhook URL is accessible
3. Review webhook signature verification
4. Check integration_webhook_events table for errors

### Sync Fails
1. Check connection status is 'active'
2. Verify credentials are valid and not expired
3. Review sync logs in integration_sync_logs table
4. Check API rate limits

### Connection Shows as Expired
- OAuth tokens have expired
- Click "Refresh" or "Reconnect"
- For API key integrations, update the key

## Future Enhancements

- [ ] Polling-based sync for integrations without webhooks
- [ ] Bulk import/export functionality
- [ ] Integration health monitoring
- [ ] Automatic retry with exponential backoff
- [ ] Rate limiting and quota management
- [ ] Sandbox/test mode for integrations
- [ ] Webhook replay functionality
- [ ] Custom field mapping UI
- [ ] Integration marketplace templates

## Contributing

When adding a new integration:

1. Follow the registry pattern in `lib/registry.ts`
2. Add comprehensive actions and triggers
3. Include proper TypeScript types
4. Document all API endpoints used
5. Add webhook signature verification
6. Implement sync if applicable
7. Add tests for critical functions
8. Update this documentation
