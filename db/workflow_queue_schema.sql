-- Workflow Queue and Trigger Management Schema
-- This extends the base workflow_schema.sql with queue and trigger tables

-- ============================================================================
-- QUEUE MANAGEMENT
-- ============================================================================

-- Workflow Queue Table
CREATE TABLE IF NOT EXISTS public.workflow_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  priority INTEGER DEFAULT 2 CHECK (priority BETWEEN 0 AND 10), -- 0=highest, 10=lowest
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workflow Queue Data Table (separate for size efficiency)
CREATE TABLE IF NOT EXISTS public.workflow_queue_data (
  queue_item_id UUID PRIMARY KEY REFERENCES public.workflow_queue(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Dead Letter Queue
CREATE TABLE IF NOT EXISTS public.workflow_dead_letter_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  original_queue_id UUID NOT NULL,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  priority INTEGER NOT NULL,
  attempt_count INTEGER NOT NULL,
  error JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  moved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- WEBHOOK MANAGEMENT
-- ============================================================================

-- Webhook Events Table
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  trigger_id TEXT NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  payload JSONB NOT NULL,
  headers JSONB NOT NULL,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  error JSONB
);

-- ============================================================================
-- SCHEDULED TRIGGERS
-- ============================================================================

-- Scheduled Triggers Table
CREATE TABLE IF NOT EXISTS public.scheduled_triggers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
  trigger_id TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  next_run TIMESTAMP WITH TIME ZONE NOT NULL,
  last_run TIMESTAMP WITH TIME ZONE,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- EXECUTION HISTORY AND LOGS
-- ============================================================================

-- Execution Logs Table (detailed logs per execution)
CREATE TABLE IF NOT EXISTS public.workflow_execution_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE NOT NULL,
  node_id TEXT NOT NULL,
  node_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('started', 'completed', 'failed', 'skipped')) NOT NULL,
  input JSONB,
  output JSONB,
  error TEXT,
  duration_ms INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Queue indexes
CREATE INDEX IF NOT EXISTS idx_workflow_queue_status_priority ON public.workflow_queue(status, priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_org ON public.workflow_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_workflow_queue_workflow ON public.workflow_queue(workflow_id);

-- Webhook events indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_workflow ON public.webhook_events(workflow_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_org ON public.webhook_events(organization_id);

-- Scheduled triggers indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_triggers_next_run ON public.scheduled_triggers(next_run) WHERE enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_scheduled_triggers_workflow ON public.scheduled_triggers(workflow_id);

-- Execution logs indexes
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution ON public.workflow_execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_timestamp ON public.workflow_execution_logs(timestamp);

-- Dead letter queue indexes
CREATE INDEX IF NOT EXISTS idx_dead_letter_org ON public.workflow_dead_letter_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_dead_letter_moved_at ON public.workflow_dead_letter_queue(moved_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE public.workflow_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_queue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_dead_letter_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policies for workflow_queue
CREATE POLICY "Users can view queue items in their organization"
  ON public.workflow_queue FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships WHERE organization_id = workflow_queue.organization_id
    )
  );

CREATE POLICY "Service role can insert queue items"
  ON public.workflow_queue FOR INSERT
  WITH CHECK (
    -- Allow service role or system to insert
    true
  );

CREATE POLICY "Service role can update queue items"
  ON public.workflow_queue FOR UPDATE
  USING (
    true -- Service role or system
  );

-- Policies for workflow_queue_data
CREATE POLICY "Users can view queue data in their organization"
  ON public.workflow_queue_data FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships WHERE organization_id = (
        SELECT organization_id FROM public.workflow_queue WHERE id = workflow_queue_data.queue_item_id
      )
    )
  );

-- Policies for workflow_dead_letter_queue
CREATE POLICY "Users can view dead letter items in their organization"
  ON public.workflow_dead_letter_queue FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships WHERE organization_id = workflow_dead_letter_queue.organization_id
    )
  );

-- Policies for webhook_events
CREATE POLICY "Users can view webhook events in their organization"
  ON public.webhook_events FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships WHERE organization_id = webhook_events.organization_id
    )
  );

CREATE POLICY "Service role can insert webhook events"
  ON public.webhook_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update webhook events"
  ON public.webhook_events FOR UPDATE
  USING (true);

-- Policies for scheduled_triggers
CREATE POLICY "Users can view scheduled triggers in their organization"
  ON public.scheduled_triggers FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships WHERE organization_id = (
        SELECT organization_id FROM public.workflows WHERE id = scheduled_triggers.workflow_id
      )
    )
  );

-- Policies for workflow_execution_logs
CREATE POLICY "Users can view execution logs in their organization"
  ON public.workflow_execution_logs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships WHERE organization_id = (
        SELECT organization_id FROM public.workflow_executions WHERE id = workflow_execution_logs.execution_id
      )
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get next run time from cron expression (simplified)
CREATE OR REPLACE FUNCTION calculate_next_run(cron_expr TEXT, last_run TIMESTAMP WITH TIME ZONE DEFAULT NULL)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  -- This is a simplified version
  -- In production, use a proper cron parsing library
  IF last_run IS NULL THEN
    RETURN TIMEZONE('utc'::text, NOW()) + INTERVAL '1 minute';
  END IF;

  RETURN last_run + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_workflow_queue_updated_at BEFORE UPDATE ON public.workflow_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_triggers_updated_at BEFORE UPDATE ON public.scheduled_triggers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for active queue items with workflow info
CREATE OR REPLACE VIEW active_queue_view AS
SELECT
  q.id,
  q.workflow_id,
  q.organization_id,
  w.name AS workflow_name,
  q.status,
  q.priority,
  q.scheduled_at,
  q.attempt_count,
  q.max_attempts,
  q.created_at
FROM public.workflow_queue q
JOIN public.workflows w ON w.id = q.workflow_id
WHERE q.status IN ('queued', 'processing');

-- View for execution history with workflow info
CREATE OR REPLACE VIEW execution_history_view AS
SELECT
  e.id,
  e.workflow_id,
  w.name AS workflow_name,
  e.organization_id,
  e.status,
  e.started_at,
  e.completed_at,
  EXTRACT(EPOCH FROM (e.completed_at - e.started_at)) AS duration_seconds,
  jsonb_array_length(e.execution_log) AS step_count,
  e.error IS NOT NULL AS has_error
FROM public.workflow_executions e
JOIN public.workflows w ON w.id = e.workflow_id
ORDER BY e.started_at DESC;
