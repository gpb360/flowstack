// =====================================================
// Type Exports and Utilities
// =====================================================

// Import the Database interface and Json type for type exports
import type { Json, Database } from './database.types';

// Re-export all database types (except interface)
export * from './database.types';

// =====================================================
// Common Type Exports
// =====================================================

// Core entity types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type Membership = Database['public']['Tables']['memberships']['Row']

// CRM types
export type Company = Database['public']['Tables']['companies']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']

// Workflow types
export type Workflow = Database['public']['Tables']['workflows']['Row']
export type WorkflowExecution = Database['public']['Tables']['workflow_executions']['Row']

// Builder types
export type Site = Database['public']['Tables']['sites']['Row']
export type Funnel = Database['public']['Tables']['funnels']['Row']
export type Page = Database['public']['Tables']['pages']['Row']

// Marketing types
export type MarketingTemplate = Database['public']['Tables']['marketing_templates']['Row']
export type MarketingCampaign = Database['public']['Tables']['marketing_campaigns']['Row']
export type MarketingLog = Database['public']['Tables']['marketing_logs']['Row']

// Deals/Pipeline types
export type Pipeline = Database['public']['Tables']['pipelines']['Row']
export type Stage = Database['public']['Tables']['stages']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']

// Agent types
export type AgentExecution = Database['public']['Tables']['agent_executions']['Row']
export type OrchestratorTask = Database['public']['Tables']['orchestrator_tasks']['Row']
export type AgentCapability = Database['public']['Tables']['agent_capabilities']['Row']

// Forms types
export type Form = Database['public']['Tables']['forms']['Row']
export type FormField = Database['public']['Tables']['form_fields']['Row']
export type FormSubmission = Database['public']['Tables']['form_submissions']['Row']
export type FormNotification = Database['public']['Tables']['form_notifications']['Row']

// Calendar types
export type Calendar = Database['public']['Tables']['calendars']['Row']
export type AppointmentType = Database['public']['Tables']['appointment_types']['Row']
export type AvailabilitySlot = Database['public']['Tables']['availability_slots']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentReminder = Database['public']['Tables']['appointment_reminders']['Row']
export type AppointmentHistory = Database['public']['Tables']['appointment_history']['Row']

// Phone types
export type PhoneNumber = Database['public']['Tables']['phone_numbers']['Row']

// Membership types
export type MembershipPlan = Database['public']['Tables']['membership_plans']['Row']

// Social types
export type SocialAccount = Database['public']['Tables']['social_accounts']['Row']

// Reputation types
export type ReviewSource = Database['public']['Tables']['review_sources']['Row']

// =====================================================
// Missing Tables - Activities Module
// =====================================================
export type Activity = Database['public']['Tables']['activities']['Row']
export type DealHistory = Database['public']['Tables']['deal_history']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type ContactTag = Database['public']['Tables']['contact_tags']['Row']
export type LeadScore = Database['public']['Tables']['lead_scores']['Row']

// =====================================================
// Missing Tables - Phone Module
// =====================================================
export type PhoneCall = Database['public']['Tables']['phone_calls']['Row']
export type PhoneRecording = Database['public']['Tables']['phone_recordings']['Row']
export type Voicemail = Database['public']['Tables']['voicemails']['Row']
export type SmsThread = Database['public']['Tables']['sms_threads']['Row']
export type SmsMessage = Database['public']['Tables']['sms_messages']['Row']

// =====================================================
// Missing Tables - Membership Module
// =====================================================
export type MembershipSubscription = Database['public']['Tables']['membership_subscriptions']['Row']
export type MembershipContent = Database['public']['Tables']['membership_content']['Row']
export type MembershipAccess = Database['public']['Tables']['membership_access']['Row']
export type MembershipProgress = Database['public']['Tables']['membership_progress']['Row']
export type MembershipCertificate = Database['public']['Tables']['membership_certificates']['Row']

// =====================================================
// Missing Tables - Social Media Module
// =====================================================
export type SocialPost = Database['public']['Tables']['social_posts']['Row']
export type SocialScheduledPost = Database['public']['Tables']['social_scheduled_posts']['Row']
export type SocialAnalytics = Database['public']['Tables']['social_analytics']['Row']
export type SocialComment = Database['public']['Tables']['social_comments']['Row']
export type SocialCommentReply = Database['public']['Tables']['social_comment_replies']['Row']
export type SocialMediaLibrary = Database['public']['Tables']['social_media_library']['Row']

// =====================================================
// Missing Tables - Reputation Module
// =====================================================
export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewResponse = Database['public']['Tables']['review_responses']['Row']
export type ReviewFlag = Database['public']['Tables']['review_flags']['Row']
export type ReviewNotification = Database['public']['Tables']['review_notifications']['Row']
export type ReviewAnalytics = Database['public']['Tables']['review_analytics']['Row']

// =====================================================
// Insert/Update Types for Missing Tables
// =====================================================

export type DealHistoryInsert = Database['public']['Tables']['deal_history']['Insert']
export type DealHistoryUpdate = Database['public']['Tables']['deal_history']['Update']
export type TagInsert = Database['public']['Tables']['tags']['Insert']
export type TagUpdate = Database['public']['Tables']['tags']['Update']
export type ContactTagInsert = Database['public']['Tables']['contact_tags']['Insert']
export type ContactTagUpdate = Database['public']['Tables']['contact_tags']['Update']
export type LeadScoreInsert = Database['public']['Tables']['lead_scores']['Insert']
export type LeadScoreUpdate = Database['public']['Tables']['lead_scores']['Update']

export type PhoneCallInsert = Database['public']['Tables']['phone_calls']['Insert']
export type PhoneCallUpdate = Database['public']['Tables']['phone_calls']['Update']
export type PhoneRecordingInsert = Database['public']['Tables']['phone_recordings']['Insert']
export type PhoneRecordingUpdate = Database['public']['Tables']['phone_recordings']['Update']
export type VoicemailInsert = Database['public']['Tables']['voicemails']['Insert']
export type VoicemailUpdate = Database['public']['Tables']['voicemails']['Update']
export type SmsThreadInsert = Database['public']['Tables']['sms_threads']['Insert']
export type SmsThreadUpdate = Database['public']['Tables']['sms_threads']['Update']
export type SmsMessageInsert = Database['public']['Tables']['sms_messages']['Insert']
export type SmsMessageUpdate = Database['public']['Tables']['sms_messages']['Update']

export type MembershipSubscriptionInsert = Database['public']['Tables']['membership_subscriptions']['Insert']
export type MembershipSubscriptionUpdate = Database['public']['Tables']['membership_subscriptions']['Update']
export type MembershipContentInsert = Database['public']['Tables']['membership_content']['Insert']
export type MembershipContentUpdate = Database['public']['Tables']['membership_content']['Update']
export type MembershipAccessInsert = Database['public']['Tables']['membership_access']['Insert']
export type MembershipAccessUpdate = Database['public']['Tables']['membership_access']['Update']
export type MembershipProgressInsert = Database['public']['Tables']['membership_progress']['Insert']
export type MembershipProgressUpdate = Database['public']['Tables']['membership_progress']['Update']
export type MembershipCertificateInsert = Database['public']['Tables']['membership_certificates']['Insert']
export type MembershipCertificateUpdate = Database['public']['Tables']['membership_certificates']['Update']

export type SocialPostInsert = Database['public']['Tables']['social_posts']['Insert']
export type SocialPostUpdate = Database['public']['Tables']['social_posts']['Update']
export type SocialScheduledPostInsert = Database['public']['Tables']['social_scheduled_posts']['Insert']
export type SocialScheduledPostUpdate = Database['public']['Tables']['social_scheduled_posts']['Update']
export type SocialAnalyticsInsert = Database['public']['Tables']['social_analytics']['Insert']
export type SocialAnalyticsUpdate = Database['public']['Tables']['social_analytics']['Update']
export type SocialCommentInsert = Database['public']['Tables']['social_comments']['Insert']
export type SocialCommentUpdate = Database['public']['Tables']['social_comments']['Update']
export type SocialCommentReplyInsert = Database['public']['Tables']['social_comment_replies']['Insert']
export type SocialCommentReplyUpdate = Database['public']['Tables']['social_comment_replies']['Update']
export type SocialMediaLibraryInsert = Database['public']['Tables']['social_media_library']['Insert']
export type SocialMediaLibraryUpdate = Database['public']['Tables']['social_media_library']['Update']

export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']
export type ReviewResponseInsert = Database['public']['Tables']['review_responses']['Insert']
export type ReviewResponseUpdate = Database['public']['Tables']['review_responses']['Update']
export type ReviewFlagInsert = Database['public']['Tables']['review_flags']['Insert']
export type ReviewFlagUpdate = Database['public']['Tables']['review_flags']['Update']
export type ReviewNotificationInsert = Database['public']['Tables']['review_notifications']['Insert']
export type ReviewNotificationUpdate = Database['public']['Tables']['review_notifications']['Update']
export type ReviewAnalyticsInsert = Database['public']['Tables']['review_analytics']['Insert']
export type ReviewAnalyticsUpdate = Database['public']['Tables']['review_analytics']['Update']

// =====================================================
// Insert/Update Types (Existing)
// =====================================================

export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type CompanyInsert = Database['public']['Tables']['companies']['Insert']
export type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export type ContactInsert = Database['public']['Tables']['contacts']['Insert']
export type ContactUpdate = Database['public']['Tables']['contacts']['Update']

export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert']
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update']

export type DealInsert = Database['public']['Tables']['deals']['Insert']
export type DealUpdate = Database['public']['Tables']['deals']['Update']

// =====================================================
// Utility Types
// =====================================================

/**
 * Extract the Row type from a Database table
 */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/**
 * Extract the Insert type from a Database table
 */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

/**
 * Extract the Update type from a Database table
 */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// =====================================================
// Common Enums/Unions
// =====================================================

export type MembershipRole = 'owner' | 'admin' | 'member'
export type WorkflowStatus = 'active' | 'paused' | 'draft'
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type DealStatus = 'open' | 'won' | 'lost' | 'abandoned'
export type MarketingStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled'
export type FormStatus = 'draft' | 'active' | 'archived'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'

// =====================================================
// Helper Types for Supabase Queries
// =====================================================

/**
 * Relations for joins - expand with specific relations as needed
 */
export type Relations =
  | 'user_profiles'
  | 'organizations'
  | 'memberships'
  | 'companies'
  | 'contacts'
  | 'workflows'
  | 'workflow_executions'
  | 'sites'
  | 'funnels'
  | 'pages'
  | 'marketing_templates'
  | 'marketing_campaigns'
  | 'marketing_logs'
  | 'pipelines'
  | 'stages'
  | 'deals'
  | 'agent_executions'
  | 'orchestrator_tasks'
  | 'forms'
  | 'form_fields'
  | 'form_submissions'
  | 'calendars'
  | 'appointments'

/**
 * UUID type alias for better type hints
 */
export type UUID = string

/**
 * ISO timestamp string
 */
export type ISODateTime = string

/**
 * JSON data type
 */
export type JSONData = Json

// =====================================================
// Additional Helper Types
// =====================================================

/**
 * Pagination response wrapper
 */
export type PaginatedResponse<T> = {
  data: T[]
  count: number
  page: number
  pageSize: number
}

/**
 * Filter options for queries
 */
export type FilterOptions<T> = {
  field: keyof T
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'like' | 'in'
  value: unknown
}

/**
 * Relations with required nested fields
 */
export type WithRelations<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>
}

/**
 * Common audit fields
 */
export type AuditFields = {
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

/**
 * Organization-scoped entity
 */
export type OrganizationScoped = {
  organization_id: string
}
