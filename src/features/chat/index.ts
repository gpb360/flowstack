/**
 * Chat Module Exports
 * Main exports for the Chat Widget module
 */

// Layout
export { ChatLayout } from './ChatLayout';

// Widget Components
export { ChatWidget } from './widget/ChatWidget';
export { ChatLauncher } from './widget/ChatLauncher';
export { ChatWindow } from './widget/ChatWindow';
export { MessageList } from './widget/MessageList';
export { MessageInput } from './widget/MessageInput';
export { AgentInfo } from './widget/AgentInfo';
export { PreChatForm } from './widget/PreChatForm';
export { TypingIndicator } from './widget/typing-indicator/TypingIndicator';

// Admin Components
export { ChatInbox } from './admin/ChatInbox';
export { ConversationView } from './admin/ConversationView';
export { ConversationList } from './admin/ConversationList';
export { ConversationDetails } from './admin/ConversationDetails';
export { ConversationNotes } from './admin/ConversationNotes';
export { ConversationFiltersPanel } from './admin/ConversationFiltersPanel';
export { ChatAnalytics } from './admin/ChatAnalytics';
export { MetricCard } from './admin/MetricCard';
export { ConversationsChart } from './admin/ConversationsChart';
export { AgentPerformanceTable } from './admin/AgentPerformanceTable';

// Settings Components
export { ChatSettings } from './settings/ChatSettings';
export { AppearanceSettings } from './settings/AppearanceSettings';
export { BehaviorSettings } from './settings/BehaviorSettings';
export { AvailabilityEditor } from './settings/AvailabilityEditor';
export { CannedResponses } from './settings/CannedResponses';
export { EmbedCodeGenerator } from './settings/EmbedCodeGenerator';

// Hooks
export {
  useChatMessages,
  useChatRealtime,
  useChatWidget,
  useChatConversations,
  useChatSettings,
  useChatTags,
  useChatCannedResponses,
  useChatAnalytics,
  useChatAgentStatus,
  useChatNotes,
  useUnreadCount,
} from './hooks/useChatMessages';

// Types (aliased to avoid collision with component exports)
export type {
  ChatConversation,
  ChatMessage,
  ChatSettings as ChatSettingsType,
  ChatTag,
  ChatCannedResponse,
  ChatAnalytics as ChatAnalyticsType,
  ChatAgentStatus,
  ChatRating,
  ChatNote,
  ChatTheme,
  AgentInfo as AgentInfoType,
  ChatWidgetProps,
  ChatLauncherProps,
  ChatWindowProps,
  MessageBubbleProps,
  MessageInputProps,
  TypingIndicatorProps,
  PreChatFormData,
  AvailabilityFormData,
  CannedResponseFormData,
  ChatMetrics,
  AgentPerformance,
  ConversationTimeline,
  AISuggestedResponse,
  ConversationClassification,
  ChatRealtimeEvent,
  TypingEvent,
  EmbedConfig,
  EmbedCodeOptions,
  ConversationFilters,
  ConversationSort,
  ChatError,
  ConversationStatus,
  SenderType,
  MessageType,
  WidgetPosition,
  AgentAssignmentType,
  OfflineAction,
  AgentStatus,
  AvailabilityHours,
  TimeRange,
} from './types';

// Lib
export * from './lib/supabase';
export * from './lib/widget';
export * from './lib/ai';
