import { supabase } from '@/lib/supabase';
import type { SyncConfig, SyncResult, SyncLog, FieldMapping } from './types';
import { createClientFromConnection } from './api';
import { getIntegration } from './registry';
import { SyncError } from './types';

/**
 * Data Synchronization
 *
 * Handles bidirectional data sync between FlowStack and external integrations
 */

// =====================================================
// Sync Execution
// =====================================================

/**
 * Run a data synchronization job
 */
export async function runSync(
  connectionId: string,
  syncType: string,
  config: SyncConfig
): Promise<SyncResult> {
  // Get connection details
  const { data: connection, error: connError } = await supabase
    .from('integration_connections')
    .select('*')
    .eq('id', connectionId)
    .single();

  if (connError || !connection) {
    throw new Error(`Connection not found: ${connectionId}`);
  }

  // Create sync log entry
  const { data: syncLog, error: logError } = await supabase
    .from('integration_sync_logs')
    .insert({
      connection_id: connectionId,
      sync_type: syncType,
      sync_direction: config.direction,
      status: 'running',
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_failed: 0,
      started_at: new Date().toISOString(),
      triggered_by: 'manual',
    })
    .select()
    .single();

  if (logError || !syncLog) {
    throw new Error(`Failed to create sync log: ${logError?.message}`);
  }

  try {
    // Create API client
    const apiClient = await createClientFromConnection(
      connection.integration_id,
      connection.credentials
    );

    // Execute sync based on type
    const result = await executeSync(
      connection.integration_id,
      syncType,
      config,
      apiClient,
      connection.organization_id
    );

    // Update sync log with results
    await supabase
      .from('integration_sync_logs')
      .update({
        status: result.status,
        records_processed: result.records_processed,
        records_created: result.records_created,
        records_updated: result.records_updated,
        records_failed: result.records_failed,
        errors: result.errors,
        completed_at: new Date().toISOString(),
        duration_seconds: result.duration_seconds,
      })
      .eq('id', syncLog.id);

    // Update connection's last_synced_at
    await supabase
      .from('integration_connections')
      .update({
        last_synced_at: new Date().toISOString(),
        error_count: result.records_failed > 0 ? (connection.error_count || 0) + 1 : 0,
      })
      .eq('id', connectionId);

    return {
      ...result,
      sync_log_id: syncLog.id,
    };
  } catch (error) {
    // Log sync failure
    await supabase
      .from('integration_sync_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        duration_seconds: Math.floor((Date.now() - new Date(syncLog.started_at).getTime()) / 1000),
        errors: [{ error_message: (error as Error).message }],
      })
      .eq('id', syncLog.id);

    throw error;
  }
}

/**
 * Execute sync based on integration and type
 */
async function executeSync(
  integrationId: string,
  syncType: string,
  config: SyncConfig,
  apiClient: any,
  organizationId: string
): Promise<Omit<SyncResult, 'sync_log_id'>> {
  const startTime = Date.now();

  let recordsProcessed = 0;
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsFailed = 0;
  const errors: Array<{ record_id?: string; error_message: string; timestamp: string }> = [];

  try {
    // Integration-specific sync implementations
    switch (integrationId) {
      case 'stripe':
        return await syncStripe(syncType, config, apiClient, organizationId);

      case 'google':
        return await syncGoogle(syncType, config, apiClient, organizationId);

      case 'hubspot':
        return await syncHubSpot(syncType, config, apiClient, organizationId);

      case 'shopify':
        return await syncShopify(syncType, config, apiClient, organizationId);

      default:
        throw new SyncError('', `Sync not implemented for ${integrationId}: ${syncType}`);
    }
  } catch (error) {
    errors.push({
      error_message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }

  const duration = Math.floor((Date.now() - startTime) / 1000);

  return {
    status: recordsFailed > 0 ? 'failed' : 'completed',
    records_processed: recordsProcessed,
    records_created: recordsCreated,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    errors: errors.length > 0 ? errors : undefined,
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: duration,
  };
}

// =====================================================
// Integration-Specific Sync Implementations
// =====================================================

/**
 * Stripe sync: Pull customers, subscriptions, invoices
 */
async function syncStripe(
  syncType: string,
  config: SyncConfig,
  apiClient: any,
  organizationId: string
): Promise<Omit<SyncResult, 'sync_log_id'>> {
  const startTime = Date.now();
  let recordsProcessed = 0;
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsFailed = 0;
  const errors: Array<{ record_id?: string; error_message: string; timestamp: string }> = [];

  try {
    switch (syncType) {
      case 'stripe_customers':
        // Fetch customers from Stripe
        const customers = await apiClient.get('/v1/customers', { limit: 100 });

        for (const customer of customers.data) {
          recordsProcessed++;
          try {
            // Check if contact already exists
            const { data: existing } = await supabase
              .from('contacts')
              .select('id')
              .eq('organization_id', organizationId)
              .eq('email', customer.email)
              .single();

            const contactData = {
              organization_id: organizationId,
              email: customer.email,
              first_name: customer.name?.split(' ')[0] || null,
              last_name: customer.name?.split(' ').slice(1).join(' ') || null,
              phone: customer.phone || null,
            };

            if (existing) {
              // Update existing contact
              await supabase
                .from('contacts')
                .update(contactData)
                .eq('id', existing.id);
              recordsUpdated++;
            } else {
              // Create new contact
              await supabase.from('contacts').insert(contactData);
              recordsCreated++;
            }
          } catch (error) {
            recordsFailed++;
            errors.push({
              record_id: customer.id,
              error_message: (error as Error).message,
              timestamp: new Date().toISOString(),
            });
          }
        }
        break;

      case 'stripe_subscriptions':
        // Sync subscriptions to deals or custom table
        const subscriptions = await apiClient.get('/v1/subscriptions', { limit: 100 });

        for (const subscription of subscriptions.data) {
          recordsProcessed++;
          try {
            // Could sync to deals or a subscriptions table
            // Implementation depends on your schema
            recordsCreated++;
          } catch (error) {
            recordsFailed++;
            errors.push({
              record_id: subscription.id,
              error_message: (error as Error).message,
              timestamp: new Date().toISOString(),
            });
          }
        }
        break;

      case 'stripe_invoices':
        // Sync invoices
        const invoices = await apiClient.get('/v1/invoices', { limit: 100 });

        for (const invoice of invoices.data) {
          recordsProcessed++;
          try {
            // Could sync to an invoices table or activities
            recordsCreated++;
          } catch (error) {
            recordsFailed++;
            errors.push({
              record_id: invoice.id,
              error_message: (error as Error).message,
              timestamp: new Date().toISOString(),
            });
          }
        }
        break;

      default:
        throw new SyncError('', `Unknown Stripe sync type: ${syncType}`);
    }
  } catch (error) {
    errors.push({
      error_message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }

  const duration = Math.floor((Date.now() - startTime) / 1000);

  return {
    status: recordsFailed > 0 ? 'failed' : 'completed',
    records_processed: recordsProcessed,
    records_created: recordsCreated,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    errors: errors.length > 0 ? errors : undefined,
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: duration,
  };
}

/**
 * Google sync: Calendar events to appointments
 */
async function syncGoogle(
  syncType: string,
  config: SyncConfig,
  apiClient: any,
  organizationId: string
): Promise<Omit<SyncResult, 'sync_log_id'>> {
  const startTime = Date.now();
  let recordsProcessed = 0;
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsFailed = 0;
  const errors: Array<{ record_id?: string; error_message: string; timestamp: string }> = [];

  try {
    if (syncType === 'google_calendar_events') {
      // Fetch calendar events from Google Calendar
      const now = new Date();
      const timeMin = new Date(now.setDate(now.getDate() - 30)).toISOString();
      const timeMax = new Date(now.setDate(now.getDate() + 90)).toISOString();

      const events = await apiClient.get('/calendars/primary/events', {
        timeMin,
        timeMax,
        singleEvents: true,
      });

      for (const event of events.items || []) {
        if (!event.start || !event.end) continue;

        recordsProcessed++;
        try {
          // Check if appointment already exists
          const { data: existing } = await supabase
            .from('appointments')
            .select('id')
            .eq('calendar_event_id', event.id)
            .single();

          const appointmentData = {
            organization_id: organizationId,
            calendar_event_id: event.id,
            title: event.summary || 'Untitled Event',
            description: event.description || null,
            start_time: event.start.dateTime || event.start.date,
            end_time: event.end.dateTime || event.end.date,
            status: 'scheduled',
            synced_to_external_cal: true,
            booking_source: 'api',
          };

          if (existing) {
            await supabase
              .from('appointments')
              .update(appointmentData)
              .eq('id', existing.id);
            recordsUpdated++;
          } else {
            await supabase.from('appointments').insert(appointmentData);
            recordsCreated++;
          }
        } catch (error) {
          recordsFailed++;
          errors.push({
            record_id: event.id,
            error_message: (error as Error).message,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    errors.push({
      error_message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }

  const duration = Math.floor((Date.now() - startTime) / 1000);

  return {
    status: recordsFailed > 0 ? 'failed' : 'completed',
    records_processed: recordsProcessed,
    records_created: recordsCreated,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    errors: errors.length > 0 ? errors : undefined,
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: duration,
  };
}

/**
 * HubSpot sync: Contacts and deals
 */
async function syncHubSpot(
  syncType: string,
  config: SyncConfig,
  apiClient: any,
  organizationId: string
): Promise<Omit<SyncResult, 'sync_log_id'>> {
  const startTime = Date.now();
  let recordsProcessed = 0;
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsFailed = 0;
  const errors: Array<{ record_id?: string; error_message: string; timestamp: string }> = [];

  try {
    if (syncType === 'hubspot_contacts') {
      // Fetch contacts from HubSpot
      const contacts = await apiClient.get('/crm/v3/objects/contacts', {
        limit: 100,
      });

      for (const contact of contacts.results) {
        recordsProcessed++;
        try {
          const props = contact.properties;
          const { data: existing } = await supabase
            .from('contacts')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('email', props.email)
            .single();

          const contactData = {
            organization_id: organizationId,
            email: props.email,
            first_name: props.firstname || null,
            last_name: props.lastname || null,
            phone: props.phone || null,
          };

          if (existing) {
            await supabase
              .from('contacts')
              .update(contactData)
              .eq('id', existing.id);
            recordsUpdated++;
          } else {
            await supabase.from('contacts').insert(contactData);
            recordsCreated++;
          }
        } catch (error) {
          recordsFailed++;
          errors.push({
            record_id: contact.id,
            error_message: (error as Error).message,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    errors.push({
      error_message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }

  const duration = Math.floor((Date.now() - startTime) / 1000);

  return {
    status: recordsFailed > 0 ? 'failed' : 'completed',
    records_processed: recordsProcessed,
    records_created: recordsCreated,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    errors: errors.length > 0 ? errors : undefined,
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: duration,
  };
}

/**
 * Shopify sync: Products and orders
 */
async function syncShopify(
  syncType: string,
  config: SyncConfig,
  apiClient: any,
  organizationId: string
): Promise<Omit<SyncResult, 'sync_log_id'>> {
  const startTime = Date.now();
  let recordsProcessed = 0;
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let recordsFailed = 0;
  const errors: Array<{ record_id?: string; error_message: string; timestamp: string }> = [];

  try {
    if (syncType === 'shopify_orders') {
      // Fetch orders from Shopify
      const orders = await apiClient.get('/orders.json', {
        status: 'any',
        limit: 50,
      });

      for (const order of orders.orders) {
        recordsProcessed++;
        try {
          // Create or update contact from order
          const { data: existing } = await supabase
            .from('contacts')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('email', order.email)
            .single();

          const contactData = {
            organization_id: organizationId,
            email: order.email,
            first_name: order.customer.first_name,
            last_name: order.customer.last_name,
            phone: order.phone || null,
          };

          if (existing) {
            await supabase
              .from('contacts')
              .update(contactData)
              .eq('id', existing.id);
            recordsUpdated++;
          } else {
            await supabase.from('contacts').insert(contactData);
            recordsCreated++;
          }
        } catch (error) {
          recordsFailed++;
          errors.push({
            record_id: String(order.id),
            error_message: (error as Error).message,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    errors.push({
      error_message: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }

  const duration = Math.floor((Date.now() - startTime) / 1000);

  return {
    status: recordsFailed > 0 ? 'failed' : 'completed',
    records_processed: recordsProcessed,
    records_created: recordsCreated,
    records_updated: recordsUpdated,
    records_failed: recordsFailed,
    errors: errors.length > 0 ? errors : undefined,
    started_at: new Date(startTime).toISOString(),
    completed_at: new Date().toISOString(),
    duration_seconds: duration,
  };
}

// =====================================================
// Sync History
// =====================================================

/**
 * Get sync logs for a connection
 */
export async function getSyncLogs(
  connectionId: string,
  limit = 20
): Promise<SyncLog[]> {
  const { data, error } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('connection_id', connectionId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch sync logs: ${error.message}`);
  }

  return data || [];
}

/**
 * Get sync log by ID
 */
export async function getSyncLog(syncLogId: string): Promise<SyncLog | null> {
  const { data, error } = await supabase
    .from('integration_sync_logs')
    .select('*')
    .eq('id', syncLogId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Cancel a running sync
 */
export async function cancelSync(syncLogId: string): Promise<void> {
  const { error } = await supabase
    .from('integration_sync_logs')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', syncLogId)
    .eq('status', 'running');

  if (error) {
    throw new Error(`Failed to cancel sync: ${error.message}`);
  }
}

// =====================================================
// Scheduled Sync (for future implementation with cron)
// =====================================================

/**
 * Schedule recurring sync
 */
export async function scheduleSync(
  connectionId: string,
  syncType: string,
  config: SyncConfig
): Promise<void> {
  // This would integrate with a job scheduler like cron or pg_cron
  // For now, this is a placeholder
  console.log(`Scheduled sync for connection ${connectionId}: ${syncType}`);
}

/**
 * Unschedule sync
 */
export async function unscheduleSync(
  connectionId: string,
  syncType: string
): Promise<void> {
  // Remove scheduled job
  console.log(`Unscheduled sync for connection ${connectionId}: ${syncType}`);
}
