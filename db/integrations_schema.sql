-- =====================================================
-- Integrations Module Schema
-- =====================================================
-- This schema enables connecting third-party services (Stripe, Google, Slack, etc.)
-- for data synchronization, webhook handling, and workflow automation

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Integration Connections
-- =====================================================
-- Stores authenticated connections to external services

CREATE TABLE IF NOT EXISTS public.integration_connections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id text NOT NULL, -- e.g., 'stripe', 'google', 'slack'
  name text, -- Custom name for the connection (e.g., 'Production Stripe', 'Dev Slack')
  status text DEFAULT 'active' CHECK (status IN ('active', 'error', 'disabled', 'expired')),

  -- Credentials stored as encrypted JSON
  -- OAuth: { access_token, refresh_token, expires_at, token_type }
  -- API Key: { api_key, endpoint_url }
  -- Basic: { username, password }
  credentials jsonb NOT NULL,

  -- Connection configuration
  config jsonb DEFAULT '{}', -- { webhook_url, sync_settings, features_enabled }

  -- Metadata
  last_synced_at timestamptz,
  last_error text,
  error_count int DEFAULT 0,

  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL,

  -- Ensure one active connection per integration per org
  UNIQUE(organization_id, integration_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_integration_connections_org ON public.integration_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_integration ON public.integration_connections(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_connections_status ON public.integration_connections(status);

-- =====================================================
-- Integration Webhooks
-- =====================================================
-- Stores webhook subscriptions for external services

CREATE TABLE IF NOT EXISTS public.integration_webhooks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.integration_connections(id) ON DELETE CASCADE,
  integration_id text NOT NULL,

  -- External webhook details
  webhook_id text, -- ID returned by external service
  event_type text NOT NULL, -- e.g., 'stripe.payment_succeeded', 'slack.message'
  endpoint_url text, -- Our endpoint that receives webhooks

  -- Security
  secret text, -- Webhook signing secret for verification

  -- Configuration
  config jsonb DEFAULT '{}', -- Additional webhook config

  -- Status
  active boolean DEFAULT true,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),

  -- Statistics
  total_received int DEFAULT 0,
  last_received_at timestamptz,
  last_error text,

  created_at timestamptz DEFAULT NOW() NOT NULL,
  updated_at timestamptz DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_org ON public.integration_webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_connection ON public.integration_webhooks(connection_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_integration ON public.integration_webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhooks_event_type ON public.integration_webhooks(event_type);

-- =====================================================
-- Integration Sync Logs
-- =====================================================
-- Records of data synchronization operations

CREATE TABLE IF NOT EXISTS public.integration_sync_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id uuid NOT NULL REFERENCES public.integration_connections(id) ON DELETE CASCADE,

  -- Sync details
  sync_type text NOT NULL, -- e.g., 'stripe_customers', 'google_calendar_events'
  sync_direction text CHECK (sync_direction IN ('pull', 'push', 'bidirectional')),

  -- Status
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),

  -- Results
  records_processed int DEFAULT 0,
  records_created int DEFAULT 0,
  records_updated int DEFAULT 0,
  records_failed int DEFAULT 0,

  -- Error details
  errors jsonb, -- Array of error objects { record_id, error_message, timestamp }

  -- Timing
  started_at timestamptz DEFAULT NOW() NOT NULL,
  completed_at timestamptz,
  duration_seconds int,

  -- Trigger info
  triggered_by text CHECK (triggered_by IN ('manual', 'scheduled', 'webhook', 'automation')),
  triggered_by_user_id uuid REFERENCES public.user_profiles(id),

  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_connection ON public.integration_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON public.integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_started_at ON public.integration_sync_logs(started_at DESC);

-- =====================================================
-- Integration Webhook Event Logs
-- =====================================================
-- Log of all received webhook events for debugging and replay

CREATE TABLE IF NOT EXISTS public.integration_webhook_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id uuid NOT NULL REFERENCES public.integration_webhooks(id) ON DELETE CASCADE,
  connection_id uuid REFERENCES public.integration_connections(id) ON DELETE CASCADE,

  -- Event details
  event_type text NOT NULL,
  event_id text, -- Unique ID from external service (idempotency key)

  -- Payload
  payload jsonb NOT NULL,
  headers jsonb, -- Request headers for debugging

  -- Processing status
  status text DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed')),

  -- Results
  processed_at timestamptz,
  error_message text,
  retry_count int DEFAULT 0,
  max_reached boolean DEFAULT false,

  -- Workflow trigger
  triggered_workflow_execution_id uuid REFERENCES public.workflow_executions(id),

  -- Timing
  received_at timestamptz DEFAULT NOW() NOT NULL,

  created_at timestamptz DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integration_webhook_events_webhook ON public.integration_webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhook_events_connection ON public.integration_webhook_events(connection_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhook_events_event_id ON public.integration_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_integration_webhook_events_status ON public.integration_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_integration_webhook_events_received_at ON public.integration_webhook_events(received_at DESC);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Integration Connections
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view connections"
  ON public.integration_connections FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization admins can insert connections"
  ON public.integration_connections FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Organization admins can update connections"
  ON public.integration_connections FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Organization admins can delete connections"
  ON public.integration_connections FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Integration Webhooks
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view webhooks"
  ON public.integration_webhooks FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage webhooks"
  ON public.integration_webhooks FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM public.memberships
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- Integration Sync Logs
ALTER TABLE public.integration_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view sync logs"
  ON public.integration_sync_logs FOR SELECT
  USING (connection_id IN (
    SELECT id FROM public.integration_connections WHERE organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Organization admins can insert sync logs"
  ON public.integration_sync_logs FOR INSERT
  WITH CHECK (connection_id IN (
    SELECT id FROM public.integration_connections WHERE organization_id IN (
      SELECT organization_id FROM public.memberships
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  ));

-- Integration Webhook Events
ALTER TABLE public.integration_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view webhook events"
  ON public.integration_webhook_events FOR SELECT
  USING (connection_id IN (
    SELECT id FROM public.integration_connections WHERE organization_id IN (
      SELECT organization_id FROM public.memberships WHERE user_id = auth.uid()
    )
  ));

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integration_connections_updated_at
  BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_updated_at();

CREATE TRIGGER integration_webhooks_updated_at
  BEFORE UPDATE ON public.integration_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_integration_updated_at();

-- =====================================================
-- Helper Functions
-- =====================================================

-- Get active connection for an organization and integration
CREATE OR REPLACE FUNCTION get_active_connection(
  p_organization_id uuid,
  p_integration_id text
)
RETURNS public.integration_connections AS $$
  SELECT * FROM public.integration_connections
  WHERE organization_id = p_organization_id
    AND integration_id = p_integration_id
    AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Log sync completion
CREATE OR REPLACE FUNCTION complete_sync_log(
  p_sync_log_id uuid,
  p_status text,
  p_records_processed int,
  p_records_created int DEFAULT 0,
  p_records_updated int DEFAULT 0,
  p_records_failed int DEFAULT 0,
  p_errors jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.integration_sync_logs
  SET
    status = p_status,
    records_processed = p_records_processed,
    records_created = p_records_created,
    records_updated = p_records_updated,
    records_failed = p_records_failed,
    errors = p_errors,
    completed_at = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::int
  WHERE id = p_sync_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE public.integration_connections IS 'Stores authenticated connections to external services like Stripe, Google, Slack, etc.';
COMMENT ON TABLE public.integration_webhooks IS 'Webhook subscriptions configured for external services to push data to FlowStack';
COMMENT ON TABLE public.integration_sync_logs IS 'Records of data synchronization operations between FlowStack and external services';
COMMENT ON TABLE public.integration_webhook_events IS 'Log of all received webhook events for debugging and audit trail';
