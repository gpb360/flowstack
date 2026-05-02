import { CreditCard, Mail, MessageSquare, Calendar, Users, ShoppingBag, BarChart3, Video, Database, FileText, Globe } from 'lucide-react';
import type { LucideIcon } from '@/types/icons';

/**
 * Integration Hub Registry
 *
 * Defines all available third-party service integrations that can be connected to FlowStack.
 * Each integration includes auth methods, capabilities, and available actions/triggers.
 */

// =====================================================
// Type Definitions
// =====================================================

export type IntegrationCategory =
  | 'payment'        // Stripe, PayPal
  | 'communication'  // Slack, Discord
  | 'email'          // Gmail, Outlook, SendGrid
  | 'calendar'       // Google Calendar, Calendly
  | 'crm'            // HubSpot, Salesforce
  | 'storage'        // Google Drive, Dropbox
  | 'analytics'      // Google Analytics, Mixpanel
  | 'ecommerce'      // Shopify, WooCommerce
  | 'video'          // Zoom, Google Meet
  | 'productivity'   // Notion, Trello
  | 'other';

export type AuthType = 'oauth' | 'api_key' | 'basic' | 'custom' | 'none';

export interface OAuthScope {
  key: string;
  description: string;
  required: boolean;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs?: Record<string, { type: string; label: string; required: boolean; description?: string }>;
}

export interface IntegrationTrigger {
  id: string;
  name: string;
  description: string;
  category: string;
  webhookSupported: boolean;
  pollingSupported?: boolean;
  pollInterval?: number; // minutes
}

export interface IntegrationConfig {
  features?: string[];
  settings?: Record<string, unknown>;
  webhooks?: {
    signatureHeader?: string;
    supportedEvents: string[];
  };
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: LucideIcon | string;
  authType: AuthType;
  scopes?: OAuthScope[];
  webhookSupport: boolean;
  actions?: IntegrationAction[];
  triggers?: IntegrationTrigger[];
  config?: IntegrationConfig;
  documentation?: string;
  color?: string; // Hex color for UI
}

// =====================================================
// Integration Definitions
// =====================================================

export const INTEGRATIONS: Record<string, IntegrationDefinition> = {
  // =====================================================
  // Payment Integrations
  // =====================================================

  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments, manage subscriptions, and handle invoices',
    category: 'payment',
    icon: CreditCard,
    authType: 'api_key',
    webhookSupport: true,
    scopes: [],
    actions: [
      {
        id: 'stripe.create_customer',
        name: 'Create Customer',
        description: 'Create a new customer in Stripe',
        category: 'customer',
        inputs: {
          email: { type: 'string', label: 'Email', required: true },
          name: { type: 'string', label: 'Name', required: false },
          phone: { type: 'string', label: 'Phone', required: false },
        },
      },
      {
        id: 'stripe.create_payment_intent',
        name: 'Create Payment Intent',
        description: 'Create a payment intent for one-time payment',
        category: 'payment',
        inputs: {
          amount: { type: 'number', label: 'Amount (cents)', required: true },
          currency: { type: 'string', label: 'Currency', required: true, description: '3-letter ISO code (e.g., USD)' },
          customer_id: { type: 'string', label: 'Customer ID', required: false },
        },
      },
      {
        id: 'stripe.create_subscription',
        name: 'Create Subscription',
        description: 'Create a recurring subscription',
        category: 'subscription',
        inputs: {
          customer_id: { type: 'string', label: 'Customer ID', required: true },
          price_id: { type: 'string', label: 'Price ID', required: true },
          trial_period_days: { type: 'number', label: 'Trial Days', required: false },
        },
      },
      {
        id: 'stripe.create_invoice',
        name: 'Create Invoice',
        description: 'Create an invoice for a customer',
        category: 'billing',
        inputs: {
          customer_id: { type: 'string', label: 'Customer ID', required: true },
          description: { type: 'string', label: 'Description', required: false },
        },
      },
      {
        id: 'stripe.send_invoice',
        name: 'Send Invoice',
        description: 'Send an invoice to a customer via email',
        category: 'billing',
        inputs: {
          invoice_id: { type: 'string', label: 'Invoice ID', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'stripe.payment_succeeded',
        name: 'Payment Succeeded',
        description: 'Triggered when a payment succeeds',
        category: 'payment',
        webhookSupported: true,
      },
      {
        id: 'stripe.payment_failed',
        name: 'Payment Failed',
        description: 'Triggered when a payment fails',
        category: 'payment',
        webhookSupported: true,
      },
      {
        id: 'stripe.subscription_created',
        name: 'Subscription Created',
        description: 'Triggered when a new subscription is created',
        category: 'subscription',
        webhookSupported: true,
      },
      {
        id: 'stripe.subscription_cancelled',
        name: 'Subscription Cancelled',
        description: 'Triggered when a subscription is cancelled',
        category: 'subscription',
        webhookSupported: true,
      },
      {
        id: 'stripe.invoice_paid',
        name: 'Invoice Paid',
        description: 'Triggered when an invoice is paid',
        category: 'billing',
        webhookSupported: true,
      },
    ],
    config: {
      webhooks: {
        signatureHeader: 'stripe-signature',
        supportedEvents: [
          'payment_intent.succeeded',
          'payment_intent.payment_failed',
          'customer.subscription.created',
          'customer.subscription.deleted',
          'invoice.paid',
        ],
      },
    },
    documentation: 'https://stripe.com/docs/api',
    color: '#635BFF',
  },

  paypal: {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal payments and manage transactions',
    category: 'payment',
    icon: CreditCard,
    authType: 'oauth',
    webhookSupport: true,
    actions: [
      {
        id: 'paypal.create_order',
        name: 'Create Order',
        description: 'Create a PayPal order',
        category: 'payment',
        inputs: {
          amount: { type: 'number', label: 'Amount', required: true },
          currency: { type: 'string', label: 'Currency', required: true },
        },
      },
      {
        id: 'paypal.capture_payment',
        name: 'Capture Payment',
        description: 'Capture payment for an approved order',
        category: 'payment',
        inputs: {
          order_id: { type: 'string', label: 'Order ID', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'paypal.payment_completed',
        name: 'Payment Completed',
        description: 'Triggered when a PayPal payment is completed',
        category: 'payment',
        webhookSupported: true,
      },
    ],
    documentation: 'https://developer.paypal.com/docs/api/',
    color: '#003087',
  },

  // =====================================================
  // Communication Integrations
  // =====================================================

  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages, create channels, and manage team communication',
    category: 'communication',
    icon: MessageSquare,
    authType: 'oauth',
    webhookSupport: true,
    scopes: [
      { key: 'chat:write', description: 'Send messages', required: true },
      { key: 'channels:read', description: 'Read channels', required: false },
      { key: 'channels:write', description: 'Create channels', required: false },
      { key: 'users:read', description: 'Read user info', required: false },
      { key: 'files:write', description: 'Upload files', required: false },
    ],
    actions: [
      {
        id: 'slack.send_message',
        name: 'Send Message',
        description: 'Send a message to a channel or user',
        category: 'messaging',
        inputs: {
          channel: { type: 'string', label: 'Channel', required: true, description: 'Channel ID or name (e.g., #general)' },
          text: { type: 'string', label: 'Message', required: true },
          blocks: { type: 'json', label: 'Blocks (JSON)', required: false, description: 'Slack block kit layout' },
        },
      },
      {
        id: 'slack.create_channel',
        name: 'Create Channel',
        description: 'Create a new Slack channel',
        category: 'channel',
        inputs: {
          name: { type: 'string', label: 'Channel Name', required: true },
          is_private: { type: 'boolean', label: 'Private', required: false },
        },
      },
      {
        id: 'slack.add_reaction',
        name: 'Add Reaction',
        description: 'Add an emoji reaction to a message',
        category: 'messaging',
        inputs: {
          channel: { type: 'string', label: 'Channel', required: true },
          timestamp: { type: 'string', label: 'Message Timestamp', required: true },
          reaction: { type: 'string', label: 'Emoji', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'slack.new_message',
        name: 'New Message',
        description: 'Triggered when a new message is posted in a channel',
        category: 'messaging',
        webhookSupported: true,
      },
      {
        id: 'slack.mention',
        name: 'Bot Mentioned',
        description: 'Triggered when the bot is mentioned',
        category: 'messaging',
        webhookSupported: true,
      },
    ],
    config: {
      webhooks: {
        signatureHeader: 'x-slack-signature',
        supportedEvents: ['message', 'app_mention'],
      },
    },
    documentation: 'https://api.slack.com/docs',
    color: '#4A154B',
  },

  discord: {
    id: 'discord',
    name: 'Discord',
    description: 'Send messages to Discord servers via webhooks',
    category: 'communication',
    icon: MessageSquare,
    authType: 'api_key', // Webhook URL
    webhookSupport: true,
    actions: [
      {
        id: 'discord.send_message',
        name: 'Send Message',
        description: 'Send a message to a Discord channel via webhook',
        category: 'messaging',
        inputs: {
          content: { type: 'string', label: 'Message', required: true },
          embeds: { type: 'json', label: 'Embeds (JSON)', required: false },
        },
      },
    ],
    triggers: [],
    documentation: 'https://discord.com/developers/docs/resources/webhook',
    color: '#5865F2',
  },

  // =====================================================
  // Google Workspace
  // =====================================================

  google: {
    id: 'google',
    name: 'Google Workspace',
    description: 'Gmail, Calendar, Drive, Sheets, and Docs integration',
    category: 'email',
    icon: Mail,
    authType: 'oauth',
    webhookSupport: true,
    scopes: [
      { key: 'https://www.googleapis.com/auth/gmail.send', description: 'Send emails', required: false },
      { key: 'https://www.googleapis.com/auth/gmail.readonly', description: 'Read emails', required: false },
      { key: 'https://www.googleapis.com/auth/calendar', description: 'Manage calendar', required: false },
      { key: 'https://www.googleapis.com/auth/drive', description: 'Manage Drive files', required: false },
      { key: 'https://www.googleapis.com/auth/spreadsheets', description: 'Manage spreadsheets', required: false },
    ],
    actions: [
      {
        id: 'google.send_email',
        name: 'Send Email',
        description: 'Send an email via Gmail',
        category: 'email',
        inputs: {
          to: { type: 'string', label: 'To', required: true },
          subject: { type: 'string', label: 'Subject', required: true },
          body: { type: 'string', label: 'Body', required: true },
          cc: { type: 'string', label: 'CC', required: false },
          bcc: { type: 'string', label: 'BCC', required: false },
        },
      },
      {
        id: 'google.create_event',
        name: 'Create Calendar Event',
        description: 'Create an event in Google Calendar',
        category: 'calendar',
        inputs: {
          summary: { type: 'string', label: 'Title', required: true },
          start: { type: 'datetime', label: 'Start Time', required: true },
          end: { type: 'datetime', label: 'End Time', required: true },
          description: { type: 'string', label: 'Description', required: false },
          attendees: { type: 'array', label: 'Attendees (emails)', required: false },
        },
      },
      {
        id: 'google.upload_file',
        name: 'Upload File to Drive',
        description: 'Upload a file to Google Drive',
        category: 'storage',
        inputs: {
          file_url: { type: 'string', label: 'File URL', required: true },
          folder_id: { type: 'string', label: 'Folder ID', required: false },
          name: { type: 'string', label: 'File Name', required: true },
        },
      },
      {
        id: 'google.append_row',
        name: 'Append Row to Sheet',
        description: 'Append a row to a Google Sheet',
        category: 'productivity',
        inputs: {
          spreadsheet_id: { type: 'string', label: 'Spreadsheet ID', required: true },
          range: { type: 'string', label: 'Range', required: true, description: 'e.g., Sheet1!A1' },
          values: { type: 'array', label: 'Row Values', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'google.new_email',
        name: 'New Email',
        description: 'Triggered when a new email is received',
        category: 'email',
        webhookSupported: true,
        pollingSupported: true,
        pollInterval: 5,
      },
      {
        id: 'google.calendar_event_created',
        name: 'Calendar Event Created',
        description: 'Triggered when a new calendar event is created',
        category: 'calendar',
        webhookSupported: true,
      },
    ],
    config: {
      features: ['gmail', 'calendar', 'drive', 'sheets'],
    },
    documentation: 'https://developers.google.com/workspace',
    color: '#4285F4',
  },

  // =====================================================
  // Calendar Integrations
  // =====================================================

  calendly: {
    id: 'calendly',
    name: 'Calendly',
    description: 'Online appointment scheduling',
    category: 'calendar',
    icon: Calendar,
    authType: 'oauth',
    webhookSupport: true,
    scopes: [],
    actions: [
      {
        id: 'calendly.create_event',
        name: 'Create Event',
        description: 'Create a scheduled event',
        category: 'scheduling',
        inputs: {
          event_type_uuid: { type: 'string', label: 'Event Type UUID', required: true },
          start_time: { type: 'datetime', label: 'Start Time', required: true },
          email: { type: 'string', label: 'Invitee Email', required: true },
          name: { type: 'string', label: 'Invitee Name', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'calendly.invitee_created',
        name: 'New Booking',
        description: 'Triggered when a new booking is made',
        category: 'scheduling',
        webhookSupported: true,
      },
      {
        id: 'calendly.invitee_canceled',
        name: 'Booking Cancelled',
        description: 'Triggered when a booking is cancelled',
        category: 'scheduling',
        webhookSupported: true,
      },
    ],
    documentation: 'https://calendly.stoplight.io/docs/calendly/public-api/',
    color: '#006BFF',
  },

  // =====================================================
  // CRM Integrations
  // =====================================================

  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing, sales, and service CRM platform',
    category: 'crm',
    icon: Users,
    authType: 'oauth',
    webhookSupport: true,
    scopes: [
      { key: 'crm.objects.contacts.read', description: 'Read contacts', required: false },
      { key: 'crm.objects.contacts.write', description: 'Write contacts', required: false },
      { key: 'crm.objects.companies.read', description: 'Read companies', required: false },
      { key: 'crm.objects.deals.read', description: 'Read deals', required: false },
      { key: 'crm.objects.deals.write', description: 'Write deals', required: false },
    ],
    actions: [
      {
        id: 'hubspot.create_contact',
        name: 'Create Contact',
        description: 'Create a new contact in HubSpot',
        category: 'contact',
        inputs: {
          email: { type: 'string', label: 'Email', required: true },
          firstname: { type: 'string', label: 'First Name', required: false },
          lastname: { type: 'string', label: 'Last Name', required: false },
          phone: { type: 'string', label: 'Phone', required: false },
        },
      },
      {
        id: 'hubspot.create_deal',
        name: 'Create Deal',
        description: 'Create a new deal in HubSpot',
        category: 'deal',
        inputs: {
          dealname: { type: 'string', label: 'Deal Name', required: true },
          amount: { type: 'number', label: 'Amount', required: false },
          pipeline: { type: 'string', label: 'Pipeline', required: false },
          dealstage: { type: 'string', label: 'Deal Stage', required: false },
        },
      },
    ],
    triggers: [
      {
        id: 'hubspot.contact_created',
        name: 'Contact Created',
        description: 'Triggered when a new contact is created',
        category: 'contact',
        webhookSupported: true,
      },
      {
        id: 'hubspot.deal_stage_changed',
        name: 'Deal Stage Changed',
        description: 'Triggered when a deal stage changes',
        category: 'deal',
        webhookSupported: true,
      },
    ],
    documentation: 'https://developers.hubspot.com/docs/api',
    color: '#FF7A59',
  },

  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Enterprise CRM and cloud computing platform',
    category: 'crm',
    icon: Users,
    authType: 'oauth',
    webhookSupport: true,
    actions: [
      {
        id: 'salesforce.create_lead',
        name: 'Create Lead',
        description: 'Create a new lead in Salesforce',
        category: 'lead',
        inputs: {
          FirstName: { type: 'string', label: 'First Name', required: true },
          LastName: { type: 'string', label: 'Last Name', required: true },
          Email: { type: 'string', label: 'Email', required: false },
          Company: { type: 'string', label: 'Company', required: false },
        },
      },
    ],
    triggers: [
      {
        id: 'salesforce.lead_created',
        name: 'Lead Created',
        description: 'Triggered when a new lead is created',
        category: 'lead',
        webhookSupported: true,
      },
    ],
    documentation: 'https://developer.salesforce.com/docs/api',
    color: '#00A1E0',
  },

  // =====================================================
  // E-commerce Integrations
  // =====================================================

  shopify: {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform for online stores',
    category: 'ecommerce',
    icon: ShoppingBag,
    authType: 'api_key',
    webhookSupport: true,
    actions: [
      {
        id: 'shopify.create_product',
        name: 'Create Product',
        description: 'Create a new product in Shopify',
        category: 'product',
        inputs: {
          title: { type: 'string', label: 'Product Title', required: true },
          description: { type: 'string', label: 'Description', required: false },
          price: { type: 'number', label: 'Price', required: true },
          sku: { type: 'string', label: 'SKU', required: false },
        },
      },
      {
        id: 'shopify.create_order',
        name: 'Create Order',
        description: 'Create a new order',
        category: 'order',
        inputs: {
          email: { type: 'string', label: 'Customer Email', required: true },
          line_items: { type: 'json', label: 'Line Items', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'shopify.order_created',
        name: 'Order Created',
        description: 'Triggered when a new order is placed',
        category: 'order',
        webhookSupported: true,
      },
      {
        id: 'shopify.order_updated',
        name: 'Order Updated',
        description: 'Triggered when an order is updated',
        category: 'order',
        webhookSupported: true,
      },
      {
        id: 'shopify.product_created',
        name: 'Product Created',
        description: 'Triggered when a new product is added',
        category: 'product',
        webhookSupported: true,
      },
    ],
    documentation: 'https://shopify.dev/docs/api',
    color: '#96BF48',
  },

  woocommerce: {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'WordPress e-commerce plugin',
    category: 'ecommerce',
    icon: ShoppingBag,
    authType: 'api_key', // Consumer key/secret
    webhookSupport: true,
    actions: [
      {
        id: 'woo.create_order',
        name: 'Create Order',
        description: 'Create a new WooCommerce order',
        category: 'order',
        inputs: {
          payment_method: { type: 'string', label: 'Payment Method', required: true },
          payment_method_title: { type: 'string', label: 'Payment Method Title', required: true },
          set_paid: { type: 'boolean', label: 'Set Paid', required: false },
          billing: { type: 'json', label: 'Billing Info', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'woo.order_created',
        name: 'Order Created',
        description: 'Triggered when a new order is created',
        category: 'order',
        webhookSupported: true,
      },
    ],
    documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    color: '#96588a',
  },

  // =====================================================
  // Analytics Integrations
  // =====================================================

  google_analytics: {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Web analytics and reporting',
    category: 'analytics',
    icon: BarChart3,
    authType: 'oauth',
    webhookSupport: false,
    actions: [
      {
        id: 'ga.track_event',
        name: 'Track Event',
        description: 'Send an event to Google Analytics',
        category: 'analytics',
        inputs: {
          client_id: { type: 'string', label: 'Client ID', required: true },
          event_name: { type: 'string', label: 'Event Name', required: true },
          parameters: { type: 'json', label: 'Parameters', required: false },
        },
      },
    ],
    triggers: [],
    documentation: 'https://developers.google.com/analytics',
    color: '#F9AB00',
  },

  mixpanel: {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics platform',
    category: 'analytics',
    icon: BarChart3,
    authType: 'api_key',
    webhookSupport: false,
    actions: [
      {
        id: 'mixpanel.track_event',
        name: 'Track Event',
        description: 'Track an event in Mixpanel',
        category: 'analytics',
        inputs: {
          event_name: { type: 'string', label: 'Event Name', required: true },
          distinct_id: { type: 'string', label: 'Distinct ID', required: true },
          properties: { type: 'json', label: 'Properties', required: false },
        },
      },
    ],
    triggers: [],
    documentation: 'https://developer.mixpanel.com/reference',
    color: '#5D61AF',
  },

  // =====================================================
  // Video Conferencing
  // =====================================================

  zoom: {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video conferencing and webinars',
    category: 'video',
    icon: Video,
    authType: 'oauth',
    webhookSupport: true,
    actions: [
      {
        id: 'zoom.create_meeting',
        name: 'Create Meeting',
        description: 'Create a Zoom meeting',
        category: 'meeting',
        inputs: {
          topic: { type: 'string', label: 'Topic', required: true },
          type: { type: 'number', label: 'Type', required: true, description: '1=Instant, 2=Scheduled, 8=Recurring' },
          start_time: { type: 'datetime', label: 'Start Time', required: false },
          duration: { type: 'number', label: 'Duration (minutes)', required: false },
        },
      },
    ],
    triggers: [
      {
        id: 'zoom.meeting_started',
        name: 'Meeting Started',
        description: 'Triggered when a meeting starts',
        category: 'meeting',
        webhookSupported: true,
      },
      {
        id: 'zoom.recording_completed',
        name: 'Recording Completed',
        description: 'Triggered when a recording is ready',
        category: 'meeting',
        webhookSupported: true,
      },
    ],
    documentation: 'https://developers.zoom.us/docs/api/',
    color: '#2D8CFF',
  },

  // =====================================================
  // Productivity Integrations
  // =====================================================

  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'All-in-one workspace for notes and databases',
    category: 'productivity',
    icon: FileText,
    authType: 'oauth',
    webhookSupport: false,
    actions: [
      {
        id: 'notion.create_page',
        name: 'Create Page',
        description: 'Create a new page in Notion',
        category: 'page',
        inputs: {
          parent_id: { type: 'string', label: 'Parent Page ID', required: true },
          title: { type: 'string', label: 'Page Title', required: true },
          content: { type: 'string', label: 'Page Content', required: false },
        },
      },
      {
        id: 'notion.append_block',
        name: 'Append Block',
        description: 'Append a content block to a page',
        category: 'page',
        inputs: {
          block_id: { type: 'string', label: 'Block ID', required: true },
          content: { type: 'string', label: 'Content', required: true },
        },
      },
    ],
    triggers: [],
    documentation: 'https://developers.notion.com/reference',
    color: '#000000',
  },

  trello: {
    id: 'trello',
    name: 'Trello',
    description: 'Kanban-style project management',
    category: 'productivity',
    icon: FileText,
    authType: 'oauth',
    webhookSupport: true,
    actions: [
      {
        id: 'trello.create_card',
        name: 'Create Card',
        description: 'Create a new Trello card',
        category: 'card',
        inputs: {
          name: { type: 'string', label: 'Card Name', required: true },
          description: { type: 'string', label: 'Description', required: false },
          list_id: { type: 'string', label: 'List ID', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'trello.card_created',
        name: 'Card Created',
        description: 'Triggered when a card is created',
        category: 'card',
        webhookSupported: true,
      },
    ],
    documentation: 'https://developer.atlassian.com/cloud/trello/rest/api-group-cards/',
    color: '#0079BF',
  },

  // =====================================================
  // Storage Integrations
  // =====================================================

  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Cloud file storage and sharing',
    category: 'storage',
    icon: Database,
    authType: 'oauth',
    webhookSupport: true,
    actions: [
      {
        id: 'dropbox.upload_file',
        name: 'Upload File',
        description: 'Upload a file to Dropbox',
        category: 'file',
        inputs: {
          file_url: { type: 'string', label: 'File URL', required: true },
          path: { type: 'string', label: 'Destination Path', required: true },
        },
      },
      {
        id: 'dropbox.create_share_link',
        name: 'Create Share Link',
        description: 'Create a shareable link for a file',
        category: 'file',
        inputs: {
          path: { type: 'string', label: 'File Path', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'dropbox.file_added',
        name: 'File Added',
        description: 'Triggered when a file is added',
        category: 'file',
        webhookSupported: true,
      },
    ],
    documentation: 'https://www.dropbox.com/developers/documentation',
    color: '#0061FF',
  },

  // =====================================================
  // Email Marketing Integrations
  // =====================================================

  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Transactional email service',
    category: 'email',
    icon: Mail,
    authType: 'api_key',
    webhookSupport: true,
    actions: [
      {
        id: 'sendgrid.send_email',
        name: 'Send Email',
        description: 'Send a transactional email via SendGrid',
        category: 'email',
        inputs: {
          to: { type: 'string', label: 'To', required: true },
          subject: { type: 'string', label: 'Subject', required: true },
          content: { type: 'string', label: 'HTML Content', required: true },
        },
      },
    ],
    triggers: [
      {
        id: 'sendgrid.email_delivered',
        name: 'Email Delivered',
        description: 'Triggered when an email is delivered',
        category: 'email',
        webhookSupported: true,
      },
      {
        id: 'sendgrid.email_opened',
        name: 'Email Opened',
        description: 'Triggered when an email is opened',
        category: 'email',
        webhookSupported: true,
      },
      {
        id: 'sendgrid.email_clicked',
        name: 'Link Clicked',
        description: 'Triggered when a link is clicked',
        category: 'email',
        webhookSupported: true,
      },
    ],
    documentation: 'https://docs.sendgrid.com/api-reference/',
    color: '#5D9BEC',
  },

  mailgun: {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Email automation service',
    category: 'email',
    icon: Mail,
    authType: 'api_key',
    webhookSupport: true,
    actions: [
      {
        id: 'mailgun.send_email',
        name: 'Send Email',
        description: 'Send an email via Mailgun',
        category: 'email',
        inputs: {
          to: { type: 'string', label: 'To', required: true },
          subject: { type: 'string', label: 'Subject', required: true },
          html: { type: 'string', label: 'HTML', required: true },
        },
      },
    ],
    triggers: [],
    documentation: 'https://documentation.mailgun.com/api-reference/',
    color: '#4732E3',
  },

  // =====================================================
  // Other Integrations
  // =====================================================

  zapier: {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    category: 'other',
    icon: Globe,
    authType: 'api_key',
    webhookSupport: true,
    actions: [
      {
        id: 'zapier.trigger_hook',
        name: 'Trigger Zap',
        description: 'Trigger a Zapier webhook',
        category: 'automation',
        inputs: {
          hook_url: { type: 'string', label: 'Webhook URL', required: true },
          data: { type: 'json', label: 'Payload Data', required: false },
        },
      },
    ],
    triggers: [
      {
        id: 'zapier.webhook_received',
        name: 'Webhook Received',
        description: 'Triggered when Zapier sends data to FlowStack',
        category: 'automation',
        webhookSupported: true,
      },
    ],
    documentation: 'https://zapier.com/apps/webhook/docs',
    color: '#FF4A00',
  },

  webhook_custom: {
    id: 'webhook_custom',
    name: 'Custom Webhook',
    description: 'Receive webhooks from any service',
    category: 'other',
    icon: Globe,
    authType: 'none',
    webhookSupport: true,
    actions: [],
    triggers: [
      {
        id: 'webhook.custom_received',
        name: 'Webhook Received',
        description: 'Triggered when a custom webhook is received',
        category: 'automation',
        webhookSupported: true,
      },
    ],
    documentation: '',
    color: '#6B7280',
  },
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get an integration definition by ID
 */
export const getIntegration = (id: string): IntegrationDefinition | undefined => {
  return INTEGRATIONS[id];
};

/**
 * Get all integrations
 */
export const getAllIntegrations = (): IntegrationDefinition[] => {
  return Object.values(INTEGRATIONS);
};

/**
 * Get integrations by category
 */
export const getIntegrationsByCategory = (
  category: IntegrationCategory
): IntegrationDefinition[] => {
  return Object.values(INTEGRATIONS).filter((i) => i.category === category);
};

/**
 * Get all categories
 */
export const getCategories = (): IntegrationCategory[] => {
  const categories = new Set<IntegrationCategory>();
  Object.values(INTEGRATIONS).forEach((integration) => {
    categories.add(integration.category);
  });
  return Array.from(categories);
};

/**
 * Check if integration supports webhooks
 */
export const supportsWebhooks = (integrationId: string): boolean => {
  const integration = getIntegration(integrationId);
  return integration?.webhookSupport ?? false;
};

/**
 * Get integration actions
 */
export const getActions = (integrationId: string): IntegrationAction[] => {
  const integration = getIntegration(integrationId);
  return integration?.actions ?? [];
};

/**
 * Get integration triggers
 */
export const getTriggers = (integrationId: string): IntegrationTrigger[] => {
  const integration = getIntegration(integrationId);
  return integration?.triggers ?? [];
};

/**
 * Get action by ID
 */
export const getActionById = (actionId: string): IntegrationAction | undefined => {
  for (const integration of Object.values(INTEGRATIONS)) {
    const action = integration.actions?.find((a) => a.id === actionId);
    if (action) return action;
  }
  return undefined;
};

/**
 * Get trigger by ID
 */
export const getTriggerById = (triggerId: string): IntegrationTrigger | undefined => {
  for (const integration of Object.values(INTEGRATIONS)) {
    const trigger = integration.triggers?.find((t) => t.id === triggerId);
    if (trigger) return trigger;
  }
  return undefined;
};
