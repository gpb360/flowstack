/**
 * AI Integration Library - Main Exports
 * Complete AI-native features for FlowStack
 */

// Client
export { AIClient, getAIClient, resetAIClient } from './client';

// Configuration
export { getApiKey, setApiKey, clearApiKey, getConfig, isConfigured, getModelDefaults, validateConfig } from './config';

// Types
export {
  type Message,
  type MessageRole,
  type EnhancedMessage,
  type Tool,
  type ToolParameter,
  type ExecutionContext,
  type OrganizationContext,
  type TeamMember,
  type UserPreferences,
  type ChatParams,
  type ChatResponse,
  type ToolCall,
  type TokenUsage,
  type AgentType,
  type AgentExecution,
  type Command,
  type CommandCategory,
  type CommandSuggestion,
  type AIErrorCode,
  AIError,
  calculateCost,
  DEFAULT_AI_CONFIG,
} from './types';

// Context & Memory
export {
  contextManager,
  useAIContext,
  saveConversationMemory,
  loadConversationMemory,
  searchConversationMemories,
  pruneMessagesToTokenLimit,
  createContextWindow,
  getOrganizationContext,
} from './context';

// Commands/Tools
export {
  TOOL_REGISTRY,
  getToolsByCategory,
  getAllTools,
  getTool,
  getToolDefinitions,
  // CRM Tools
  createContactTool,
  findContactsTool,
  updateContactTool,
  createCompanyTool,
  // Marketing Tools
  createCampaignTool,
  generateContentTool,
  saveTemplateTool,
  // Workflow Tools
  createWorkflowTool,
  triggerWorkflowTool,
  getWorkflowStatusTool,
  // Analytics Tools
  generateReportTool,
  getMetricsTool,
  // General Tools
  searchTool,
  getCurrentUserTool,
} from './commands';

// Suggestions
export {
  getCRMSuggestions,
  getWorkflowSuggestions,
  generateMarketingContent,
  getSmartSuggestions,
  detectAnomalies,
  getProactiveNotifications,
  type CRMSuggestion,
  type WorkflowSuggestion,
  type ContentGenerationOptions,
  type GeneratedContent,
  type SmartSuggestion,
  type Anomaly,
  type ProactiveNotification,
} from './suggestions';
