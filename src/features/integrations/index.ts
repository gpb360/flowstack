/**
 * Integrations Feature Module - Exports
 */

// Layout
export { IntegrationsLayout } from './IntegrationsLayout';

// Components
export { ConnectionList } from './connections/ConnectionList';
export { ConnectionWizard } from './connections/ConnectionWizard';
export { IntegrationRegistry } from './registry/IntegrationRegistry';
export { IntegrationCard } from './registry/IntegrationCard';
export { WebhookList } from './webhooks/WebhookList';
export { OAuthCallback } from './oauth/OAuthCallback';

// Library (explicit re-exports to avoid naming conflicts)
export { INTEGRATIONS as INTEGRATION_REGISTRY, getIntegration as getIntegrationDefinition } from './lib/registry';
export type { IntegrationDefinition, IntegrationCategory } from './lib/registry';
export type { OAuthTokens, WebhookSubscription, WebhookEvent, SyncConfig } from './lib/types';
export { GenericAPIClient } from './lib/api';
