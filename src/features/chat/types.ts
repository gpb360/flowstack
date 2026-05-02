/**
 * Chat Widget Types
 * Complete type definitions for the Chat Widget system
 */

// =====================================================
// Conversation Types
// =====================================================

export type ConversationStatus = 'active' | 'waiting' | 'closed';
export type SenderType = 'visitor' | 'agent' | 'bot';
export type MessageType = 'text' | 'file' | 'system' | 'emoji';
export type WidgetPosition = 'bottom-right' | 'bottom-left';
export type AgentAssignmentType = 'round_robin' | 'least_active' | 'manual';
export type OfflineAction = 'hide_widget' | 'collect_message' | 'show_schedule';
export type AgentStatus = 'online' | 'away' | 'offline' | 'busy';

export interface ChatConversation {
  id: string;
  organization_id: string;
  visitor_id?: string;
  visitor_name?: string;
  visitor_email?: string;
  visitor_phone?: string;
  assigned_to?: string;
  status: ConversationStatus;
  source_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer_url?: string;
  ip_address?: string;
  user_agent?: string;
  location_country?: string;
  location_region?: string;
  location_city?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  language?: string;
  started_at: string;
  ended_at?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  tags?: ChatTag[];
  assigned_agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_id?: string;
  sender_name?: string;
  message: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  is_internal: boolean;
  metadata: Record<string, any>;
  sent_at: string;
  read_at?: string;
  created_at: string;

  // UI state
  isSending?: boolean;
  error?: string;
}

export interface ChatSettings {
  id: string;
  organization_id: string;

  // Appearance
  widget_color: string;
  widget_position: WidgetPosition;
  widget_icon: string;
  custom_css?: string;

  // Header
  header_title: string;
  show_agent_avatar: boolean;
  show_agent_name: boolean;
  show_agent_status: boolean;

  // Messages
  welcome_message: string;
  offline_message: string;
  sound_enabled: boolean;
  typing_indicator_enabled: boolean;

  // Visitor Collection
  collect_email: boolean;
  collect_name: boolean;
  collect_phone: boolean;
  pre_chat_form_enabled: boolean;

  // Availability
  availability_enabled: boolean;
  availability_timezone: string;
  availability_hours: AvailabilityHours;
  offline_action: OfflineAction;

  // Assignment
  agent_assignment_enabled: boolean;
  agent_assignment_type: AgentAssignmentType;
  max_concurrent_chats: number;

  // Auto Response
  auto_response_enabled: boolean;
  auto_response_delay: number;
  auto_response_message: string;

  // Branding
  branding_hide_logo: boolean;
  branding_custom_logo?: string;
  branding_custom_name?: string;

  // Features
  file_upload_enabled: boolean;
  file_upload_max_size: number;
  file_upload_types: string[];
  emoji_picker_enabled: boolean;
  rating_enabled: boolean;
  rating_question: string;

  // Security
  rate_limit_enabled: boolean;
  rate_limit_max_messages: number;
  rate_limit_window: number;

  // Integrations
  link_to_crm: boolean;
  create_contact_if_not_exists: boolean;

  created_at: string;
  updated_at: string;
}

export interface AvailabilityHours {
  monday: TimeRange[];
  tuesday: TimeRange[];
  wednesday: TimeRange[];
  thursday: TimeRange[];
  friday: TimeRange[];
  saturday: TimeRange[];
  sunday: TimeRange[];
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface ChatTag {
  id: string;
  organization_id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatCannedResponse {
  id: string;
  organization_id: string;
  name: string;
  content: string;
  category?: string;
  tags?: string[];
  shortcuts?: string[];
  created_by?: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatAnalytics {
  id: string;
  organization_id: string;
  date: string;

  // Conversation metrics
  conversations_started: number;
  conversations_closed: number;
  concurrent_conversations_peak: number;
  avg_conversation_duration?: string;

  // Message metrics
  messages_sent: number;
  messages_received: number;
  avg_messages_per_conversation: number;

  // Response time metrics
  avg_first_response_time?: string;
  avg_response_time?: string;
  longest_response_time?: string;
  shortest_response_time?: string;

  // Agent metrics
  agent_online_time?: string;
  avg_agent_concurrent_chats: number;

  // Satisfaction
  satisfaction_score?: number;
  total_ratings: number;

  // Source metrics
  conversations_by_source: Record<string, number>;
  conversations_by_device: Record<string, number>;

  created_at: string;
  updated_at: string;
}

export interface ChatAgentStatus {
  id: string;
  agent_id: string;
  organization_id: string;
  status: AgentStatus;
  status_message?: string;
  max_concurrent_chats: number;
  current_chats: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;

  // Joined fields
  agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ChatRating {
  id: string;
  conversation_id: string;
  score: number;
  comment?: string;
  rated_at: string;
  created_at: string;
}

export interface ChatNote {
  id: string;
  conversation_id: string;
  agent_id: string;
  note: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;

  // Joined fields
  agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

// =====================================================
// Widget Types
// =====================================================

export interface ChatTheme {
  color?: string;
  position?: WidgetPosition;
  borderRadius?: number;
  fontSize?: 'sm' | 'md' | 'lg';
  customCss?: string;
}

export interface AgentInfo {
  name: string;
  avatar?: string;
  title?: string;
  status?: AgentStatus;
}

export interface ChatWidgetProps {
  organizationId: string;
  theme?: ChatTheme;
  welcomeMessage?: string;
  agentInfo?: AgentInfo;
  onMessageSent?: (message: string) => void;
  onConversationStarted?: (conversationId: string) => void;
  preChatFormEnabled?: boolean;
}

export interface ChatLauncherProps {
  isOpen: boolean;
  onClick: () => void;
  theme?: ChatTheme;
  unreadCount?: number;
}

export interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  isTyping: boolean;
  onClose: () => void;
  welcomeMessage?: string;
  agentInfo?: AgentInfo;
  theme?: ChatTheme;
  isLoading?: boolean;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
}

export interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  features?: {
    fileUpload?: boolean;
    emojiPicker?: boolean;
    maxLength?: number;
  };
}

export interface TypingIndicatorProps {
  agentName?: string;
}

// =====================================================
// Form Types
// =====================================================

export interface PreChatFormData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface AvailabilityFormData {
  enabled: boolean;
  timezone: string;
  hours: AvailabilityHours;
  offlineAction: OfflineAction;
}

export interface CannedResponseFormData {
  name: string;
  content: string;
  category?: string;
  tags?: string[];
  shortcuts?: string[];
}

// =====================================================
// Analytics Types
// =====================================================

export interface ChatMetrics {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  avgResponseTime: number; // in seconds
  satisfactionScore: number; // 0-100
  conversationsChange?: number; // percentage change
  messagesChange?: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalConversations: number;
  avgResponseTime: number;
  satisfactionScore: number;
  onlineTime: number; // in hours
}

export interface ConversationTimeline {
  date: string;
  conversations: number;
  messages: number;
}

// =====================================================
// AI Types
// =====================================================

export interface AISuggestedResponse {
  suggestion: string;
  confidence: number;
  category?: string;
}

export interface ConversationClassification {
  category: string;
  priority: number;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// =====================================================
// Realtime Types
// =====================================================

export interface ChatRealtimeEvent {
  type: 'message' | 'typing' | 'agent_status' | 'conversation_update';
  data: any;
}

export interface TypingEvent {
  conversationId: string;
  isTyping: boolean;
  userId?: string;
}

// =====================================================
// Embed Types
// =====================================================

export interface EmbedConfig {
  organizationId: string;
  theme: ChatTheme;
  welcomeMessage: string;
  agentInfo?: AgentInfo;
  preChatFormEnabled?: boolean;
}

export interface EmbedCodeOptions {
  format: 'html' | 'react' | 'vue';
  minified?: boolean;
}

// =====================================================
// Filter/Sort Types
// =====================================================

export interface ConversationFilters {
  status?: ConversationStatus[];
  assignedTo?: string[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  hasUnread?: boolean;
  search?: string;
}

export interface ConversationSort {
  field: 'started_at' | 'last_message_at' | 'status';
  direction: 'asc' | 'desc';
}

// =====================================================
// Error Types
// =====================================================

export interface ChatError {
  code: string;
  message: string;
  details?: any;
}

export type ChatErrorCode =
  | 'RATE_LIMIT_EXCEEDED'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'CONVERSATION_CLOSED'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR';
