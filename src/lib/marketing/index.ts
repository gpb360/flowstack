/**
 * Marketing Module - Main Export
 *
 * Exports all marketing functionality for easy importing
 */

// Email delivery
export {
  sendEmail,
  sendBulk,
  sendBulkWithRateLimit,
  getEmailStats,
  isValidEmail,
  sanitizeEmailHTML,
  generateEmailPreview,
  parseEmailTemplate,
  type SendEmailParams,
  type BulkResult,
  type Attachment,
  type EmailStats,
} from './resend';

// SMS delivery
export {
  sendSMS,
  sendBulkSMS,
  getSMSStatus,
  getConversation,
  formatPhoneNumber,
  calculateSMSCost,
  truncateForSMS,
  getSMSStats,
  parseIncomingWebhook,
  type SendSMSParams,
  type SMSResult,
  type SMSMessage,
  type SMSConversation,
} from './twilio';

// Template rendering
export {
  renderTemplate,
  renderTemplateWithAnalysis,
  prepareContactData,
  renderSubject,
  previewTemplate,
  validateTemplate,
  extractVariables,
  getNestedValue,
  sanitizeTemplateHTML,
  calculateComplexity,
  getTemplateSuggestions,
  CONTACT_VARIABLES,
  COMPANY_VARIABLES,
  SYSTEM_VARIABLES,
  ALL_VARIABLES,
  TEMPLATE_VARIABLE_GROUPS,
  getVariableLabel,
  type TemplateVariable,
  type ContactData,
  type TemplateRenderResult,
} from './templates';
