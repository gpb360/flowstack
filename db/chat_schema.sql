-- =====================================================
-- Chat Widget Schema
-- =====================================================
-- Real-time chat widget for websites with visitor tracking,
-- agent assignment, canned responses, and analytics.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Chat Conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  visitor_id UUID,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed')),
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location_country TEXT,
  location_region TEXT,
  location_city TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  language TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Chat Messages
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'agent', 'bot')),
  sender_id UUID,
  sender_name TEXT,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'emoji')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  is_internal BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Chat Settings (per organization)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Appearance
  widget_color TEXT DEFAULT '#3B82F6',
  widget_position TEXT DEFAULT 'bottom-right' CHECK (widget_position IN ('bottom-right', 'bottom-left')),
  widget_icon TEXT DEFAULT 'message-square',
  custom_css TEXT,

  -- Header
  header_title TEXT DEFAULT 'Chat with us',
  show_agent_avatar BOOLEAN DEFAULT TRUE,
  show_agent_name BOOLEAN DEFAULT TRUE,
  show_agent_status BOOLEAN DEFAULT TRUE,

  -- Messages
  welcome_message TEXT DEFAULT 'How can we help you?',
  offline_message TEXT DEFAULT 'We are currently offline. Leave a message and we will get back to you.',
  sound_enabled BOOLEAN DEFAULT TRUE,
  typing_indicator_enabled BOOLEAN DEFAULT TRUE,

  -- Visitor Collection
  collect_email BOOLEAN DEFAULT FALSE,
  collect_name BOOLEAN DEFAULT FALSE,
  collect_phone BOOLEAN DEFAULT FALSE,
  pre_chat_form_enabled BOOLEAN DEFAULT FALSE,

  -- Availability
  availability_enabled BOOLEAN DEFAULT FALSE,
  availability_timezone TEXT DEFAULT 'UTC',
  availability_hours JSONB DEFAULT '{"monday": [], "tuesday": [], "wednesday": [], "thursday": [], "friday": [], "saturday": [], "sunday": []}',
  offline_action TEXT DEFAULT 'collect_message' CHECK (offline_action IN ('hide_widget', 'collect_message', 'show_schedule')),

  -- Assignment
  agent_assignment_enabled BOOLEAN DEFAULT FALSE,
  agent_assignment_type TEXT DEFAULT 'round_robin' CHECK (agent_assignment_type IN ('round_robin', 'least_active', 'manual')),
  max_concurrent_chats INTEGER DEFAULT 5,

  -- Auto Response
  auto_response_enabled BOOLEAN DEFAULT FALSE,
  auto_response_delay INTEGER DEFAULT 5,
  auto_response_message TEXT DEFAULT 'Thanks for reaching out! An agent will be with you shortly.',

  -- Branding
  branding_hide_logo BOOLEAN DEFAULT FALSE,
  branding_custom_logo TEXT,
  branding_custom_name TEXT,

  -- Features
  file_upload_enabled BOOLEAN DEFAULT TRUE,
  file_upload_max_size INTEGER DEFAULT 10485760, -- 10MB in bytes
  file_upload_types TEXT[] DEFAULT ARRAY['image/*', '.pdf', '.doc', '.docx'],
  emoji_picker_enabled BOOLEAN DEFAULT TRUE,
  rating_enabled BOOLEAN DEFAULT FALSE,
  rating_question TEXT DEFAULT 'How would you rate this conversation?',

  -- Security
  rate_limit_enabled BOOLEAN DEFAULT TRUE,
  rate_limit_max_messages INTEGER DEFAULT 100,
  rate_limit_window INTEGER DEFAULT 3600, -- 1 hour in seconds

  -- Integrations
  link_to_crm BOOLEAN DEFAULT TRUE,
  create_contact_if_not_exists BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Chat Tags
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- =====================================================
-- Chat Conversation Tags (many-to-many)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_conversation_tags (
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES chat_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, tag_id)
);

-- =====================================================
-- Chat Canned Responses
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  shortcuts TEXT[],
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Chat Analytics (aggregated daily)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Conversation metrics
  conversations_started INTEGER DEFAULT 0,
  conversations_closed INTEGER DEFAULT 0,
  concurrent_conversations_peak INTEGER DEFAULT 0,
  avg_conversation_duration INTERVAL,

  -- Message metrics
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  avg_messages_per_conversation NUMERIC(10,2),

  -- Response time metrics
  avg_first_response_time INTERVAL,
  avg_response_time INTERVAL,
  longest_response_time INTERVAL,
  shortest_response_time INTERVAL,

  -- Agent metrics
  agent_online_time INTERVAL,
  avg_agent_concurrent_chats NUMERIC(5,2),

  -- Satisfaction
  satisfaction_score NUMERIC(3,2),
  total_ratings INTEGER DEFAULT 0,

  -- Source metrics
  conversations_by_source JSONB DEFAULT '{}',
  conversations_by_device JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, date)
);

-- =====================================================
-- Chat Agent Status
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline', 'busy')),
  status_message TEXT,
  max_concurrent_chats INTEGER DEFAULT 5,
  current_chats INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, organization_id)
);

-- =====================================================
-- Chat Ratings
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  rated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Chat Notes (internal agent notes)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_chat_conversations_org ON chat_conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned ON chat_conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_started_at ON chat_conversations(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor ON chat_conversations(visitor_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sent_at ON chat_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_type ON chat_messages(sender_type);

CREATE INDEX IF NOT EXISTS idx_chat_settings_org ON chat_settings(organization_id);

CREATE INDEX IF NOT EXISTS idx_chat_tags_org ON chat_tags(organization_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversation_tags_conv ON chat_conversation_tags(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation_tags_tag ON chat_conversation_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_chat_canned_responses_org ON chat_canned_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_canned_responses_category ON chat_canned_responses(category);

CREATE INDEX IF NOT EXISTS idx_chat_analytics_org_date ON chat_analytics(organization_id, date);

CREATE INDEX IF NOT EXISTS idx_chat_agent_status_agent ON chat_agent_status(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_agent_status_org ON chat_agent_status(organization_id);
CREATE INDEX IF NOT EXISTS idx_chat_agent_status_status ON chat_agent_status(status);

CREATE INDEX IF NOT EXISTS idx_chat_ratings_conversation ON chat_ratings(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_notes_conversation ON chat_notes(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_notes_agent ON chat_notes(agent_id);

-- =====================================================
-- Enable Realtime for chat_messages
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_canned_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_notes ENABLE ROW LEVEL SECURITY;

-- chat_conversations policies
CREATE POLICY "Organization members can view conversations"
  ON chat_conversations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can insert conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can update conversations"
  ON chat_conversations FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- chat_messages policies
CREATE POLICY "Organization members can view messages"
  ON chat_messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can insert messages to their conversation"
  ON chat_messages FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations
    )
  );

CREATE POLICY "Organization members can update messages"
  ON chat_messages FOR UPDATE
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

-- chat_settings policies
CREATE POLICY "Organization members can view settings"
  ON chat_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update settings"
  ON chat_settings FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- chat_tags policies
CREATE POLICY "Organization members can view tags"
  ON chat_tags FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage tags"
  ON chat_tags FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- chat_conversation_tags policies
CREATE POLICY "Organization members can view conversation tags"
  ON chat_conversation_tags FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can add conversation tags"
  ON chat_conversation_tags FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can remove conversation tags"
  ON chat_conversation_tags FOR DELETE
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

-- chat_canned_responses policies
CREATE POLICY "Organization members can view canned responses"
  ON chat_canned_responses FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization members can insert canned responses"
  ON chat_canned_responses FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update their canned responses"
  ON chat_canned_responses FOR UPDATE
  USING (
    created_by = auth.uid() OR organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- chat_analytics policies
CREATE POLICY "Organization members can view analytics"
  ON chat_analytics FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

-- chat_agent_status policies
CREATE POLICY "Agents can view agent status in their org"
  ON chat_agent_status FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Agents can update their own status"
  ON chat_agent_status FOR UPDATE
  USING (
    agent_id = auth.uid()
  );

CREATE POLICY "Agents can insert their status"
  ON chat_agent_status FOR INSERT
  WITH CHECK (
    agent_id = auth.uid()
  );

-- chat_ratings policies
CREATE POLICY "Organization members can view ratings"
  ON chat_ratings FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Visitors can insert ratings"
  ON chat_ratings FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations
    )
  );

-- chat_notes policies
CREATE POLICY "Organization members can view notes"
  ON chat_notes FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Organization members can insert notes"
  ON chat_notes FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations WHERE organization_id IN (
        SELECT organization_id FROM memberships WHERE user_id = auth.uid()
      )
    ) AND agent_id = auth.uid()
  );

CREATE POLICY "Note creators can update their notes"
  ON chat_notes FOR UPDATE
  USING (
    agent_id = auth.uid()
  );

CREATE POLICY "Note creators can delete their notes"
  ON chat_notes FOR DELETE
  USING (
    agent_id = auth.uid() OR organization_id IN (
      SELECT organization_id FROM memberships WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION chat_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

CREATE TRIGGER chat_settings_updated_at
  BEFORE UPDATE ON chat_settings
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

CREATE TRIGGER chat_tags_updated_at
  BEFORE UPDATE ON chat_tags
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

CREATE TRIGGER chat_canned_responses_updated_at
  BEFORE UPDATE ON chat_canned_responses
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

CREATE TRIGGER chat_analytics_updated_at
  BEFORE UPDATE ON chat_analytics
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

CREATE TRIGGER chat_agent_status_updated_at
  BEFORE UPDATE ON chat_agent_status
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

CREATE TRIGGER chat_notes_updated_at
  BEFORE UPDATE ON chat_notes
  FOR EACH ROW EXECUTE FUNCTION chat_update_updated_at();

-- Function to increment canned response usage count
CREATE OR REPLACE FUNCTION increment_canned_response_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_canned_responses
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = NEW.canned_response_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET last_message_at = NEW.sent_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chat_messages_last_message_at
  AFTER INSERT ON chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
