/**
 * Marketing Module - Main Export
 *
 * Exports all marketing components for easy importing
 */

// Layout
export { MarketingLayout } from './MarketingLayout';

// Email Campaigns
export { default as EmailCampaignsList } from './email/EmailCampaignsList';
export { default as EmailCampaignBuilder } from './email/EmailCampaignBuilder';
export { default as EmailCampaignDetail } from './email/EmailCampaignDetail';

// SMS Campaigns
export { default as SMSCampaignsList } from './sms/SMSCampaignsList';
export { default as SMSBuilder } from './sms/SMSBuilder';
export { default as SMSConversations } from './sms/SMSConversations';

// Templates
export { default as TemplatesList } from './templates/TemplatesList';
export { default as TemplateEditor } from './templates/TemplateEditor';
export { default as TemplateVariables } from './templates/TemplateVariables';

// Sequences
export { default as SequenceBuilder } from './sequences/SequenceBuilder';
export type { Sequence, SequenceStep } from './sequences/SequenceBuilder';

// Segments
export { default as SegmentBuilder } from './segments/SegmentBuilder';

// Analytics
export { default as MarketingDashboard } from './analytics/MarketingDashboard';
