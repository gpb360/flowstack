/**
 * Integration Types
 *
 * Shared type definitions for the Integrations module
 */

// =====================================================
// OAuth Types
// =====================================================

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // Unix timestamp
  token_type?: string;
  scope?: string;
}

export interface APIKeyCredentials {
  api_key: string;
  endpoint_url?: string;
  additional_params?: Record<string, string>;
}

export interface BasicAuthCredentials {
  username: string;
  password: string;
}

export type ConnectionCredentials =
  | OAuthTokens
  | APIKeyCredentials
  | BasicAuthCredentials
  | { webhook_url: string }; // For Discord-style webhooks

// =====================================================
// Connection Types
// =====================================================

export type ConnectionStatus = 'active' | 'error' | 'disabled' | 'expired';

export interface ConnectionConfig {
  webhook_url?: string;
  sync_settings?: SyncConfig;
  features_enabled?: string[];
  webhook_events?: string[];
}

export interface IntegrationConnection {
  id: string;
  organization_id: string;
  integration_id: string;
  name: string;
  status: ConnectionStatus;
  credentials: ConnectionCredentials;
  config: ConnectionConfig;
  last_synced_at?: string;
  last_error?: string;
  error_count: number;
  created_at: string;
  updated_at: string;
}

// =====================================================
// Webhook Types
// =====================================================

export interface WebhookSubscription {
  id: string;
  organization_id: string;
  connection_id?: string;
  integration_id: string;
  webhook_id: string;
  event_type: string;
  endpoint_url: string;
  secret?: string;
  config: Record<string, unknown>;
  active: boolean;
  status: 'active' | 'paused' | 'error';
  total_received: number;
  last_received_at?: string;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  webhook_id: string;
  connection_id?: string;
  event_type: string;
  event_id?: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  status: 'received' | 'processing' | 'processed' | 'failed';
  processed_at?: string;
  error_message?: string;
  retry_count: number;
  max_reached: boolean;
  triggered_workflow_execution_id?: string;
  received_at: string;
  created_at: string;
}

// =====================================================
// Sync Types
// =====================================================

export type SyncDirection = 'pull' | 'push' | 'bidirectional';
export type SyncFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual';
export type SyncTrigger = 'manual' | 'scheduled' | 'webhook' | 'automation';

export interface FieldMapping {
  source: string;
  target: string;
  transform?: string;
}

export interface SyncFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: unknown;
}

export interface SyncConfig {
  frequency: SyncFrequency;
  direction: SyncDirection;
  mappings: FieldMapping[];
  filters?: SyncFilter[];
  batch_size?: number;
}

export interface SyncResult {
  sync_log_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  errors?: Array<{
    record_id?: string;
    error_message: string;
    timestamp: string;
  }>;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
}

export interface SyncLog {
  id: string;
  connection_id: string;
  sync_type: string;
  sync_direction: SyncDirection;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  errors?: Array<Record<string, unknown>>;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  triggered_by: SyncTrigger;
  triggered_by_user_id?: string;
  created_at: string;
}

// =====================================================
// API Client Types
// =====================================================

export interface APIClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T>;
  put<T>(endpoint: string, data?: Record<string, unknown>): Promise<T>;
  patch<T>(endpoint: string, data?: Record<string, unknown>): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

export interface APIRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

// =====================================================
// Integration Action/Trigger Types
// =====================================================

export interface ActionInput {
  type: 'string' | 'number' | 'boolean' | 'datetime' | 'json' | 'array' | 'file';
  label: string;
  required: boolean;
  description?: string;
  default?: unknown;
  options?: Array<{ value: string; label: string }>;
}

export interface IntegrationAction {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs?: Record<string, ActionInput>;
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

// =====================================================
// Integration Connection Wizard Types
// =====================================================

export interface ConnectionWizardStep {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType;
}

export interface ConnectionWizardData {
  integration_id: string;
  auth_type: string;
  credentials?: ConnectionCredentials;
  name?: string;
  features_enabled?: string[];
  sync_config?: SyncConfig;
  webhook_events?: string[];
}

// =====================================================
// Error Types
// =====================================================

export class IntegrationError extends Error {
  constructor(
    public code: string,
    public integrationId: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'IntegrationError';
  }
}

export class OAuthError extends Error {
  constructor(
    public provider: string,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'OAuthError';
  }
}

export class APIError extends Error {
  constructor(
    public integrationId: string,
    public endpoint: string,
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class WebhookError extends Error {
  constructor(
    public webhookId: string,
    message: string,
    public event_type?: string
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class SyncError extends Error {
  constructor(
    public connectionId: string,
    message: string,
    public syncType?: string,
    public records?: Array<{ id: string; error: string }>
  ) {
    super(message);
    this.name = 'SyncError';
  }
}
