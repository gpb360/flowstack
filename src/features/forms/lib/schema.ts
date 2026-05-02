/**
 * Form Schema Types
 * Defines all types for form fields, validation, conditional logic, and calculations
 */

// =====================================================
// Field Types
// =====================================================

export type FieldType =
  // Basic Fields
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  // Selection Fields
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  // Advanced Fields
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'rating'
  // Layout Fields
  | 'heading'
  | 'description'
  | 'divider'
  // Special Fields
  | 'hidden'
  | 'password'
  | 'confirmation';

// =====================================================
// Field Option Types (for select, radio, checkbox)
// =====================================================

export interface FieldOption {
  id: string;
  label: string;
  value: string;
  order?: number;
}

// =====================================================
// Validation Rules
// =====================================================

export type ValidationType =
  | 'required'
  | 'email'
  | 'phone'
  | 'url'
  | 'min_length'
  | 'max_length'
  | 'min_value'
  | 'max_value'
  | 'pattern'
  | 'custom';

export interface ValidationRule {
  type: ValidationType;
  value?: unknown;
  message?: string;
}

// =====================================================
// Conditional Logic
// =====================================================

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'empty'
  | 'not_empty'
  | 'starts_with'
  | 'ends_with';

export interface ConditionalRule {
  fieldId: string;
  operator: ConditionalOperator;
  value: unknown;
  logic?: 'and' | 'or';
}

export type ConditionalActionType =
  | 'show'
  | 'hide'
  | 'require'
  | 'optional'
  | 'set_value'
  | 'enable'
  | 'disable';

export interface ConditionalAction {
  type: ConditionalActionType;
  targetFieldId: string;
  value?: unknown;
}

export interface ConditionalLogic {
  rules: ConditionalRule[];
  actions: ConditionalAction[];
}

// =====================================================
// Calculations
// =====================================================

export type CalculationType =
  | 'sum'
  | 'difference'
  | 'product'
  | 'quotient'
  | 'count'
  | 'average'
  | 'min'
  | 'max'
  | 'custom';

export interface CalculationRule {
  type: CalculationType;
  fieldIds: string[];
  formula?: string; // For custom calculations
  roundTo?: number;
}

// =====================================================
// CRM Field Mapping
// =====================================================

export type CRMFieldType =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'phone'
  | 'company'
  | 'position'
  | 'website'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'country'
  | 'tags';

export interface CRMMapping {
  formFieldId: string;
  crmField: CRMFieldType;
  transform?: (value: unknown) => unknown;
}

// =====================================================
// Field Styles
// =====================================================

export interface FieldStyles {
  width?: string;
  maxWidth?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  customCSS?: string;
}

// =====================================================
// Form Field Definition
// =====================================================

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  required: boolean;
  validation?: ValidationRule[];
  conditional?: ConditionalLogic;
  calculation?: CalculationRule;
  crmMapping?: CRMMapping;
  styles?: FieldStyles;
  options?: FieldOption[]; // For select, radio, checkbox
  // Layout
  orderIndex: number;
  columnWidth?: number; // 12-column grid (1-12)
  // Multi-step forms
  pageId?: string; // Which page this field belongs to
}

// =====================================================
// Form Page (for multi-step forms)
// =====================================================

export interface FormPage {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

// =====================================================
// Form Schema
// =====================================================

export interface FormSettings {
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };
  branding?: {
    logo?: string;
    showLogo?: boolean;
    customTitle?: string;
  };
  submitButton?: {
    text?: string;
    color?: string;
    align?: 'left' | 'center' | 'right';
  };
  layout?: {
    width?: 'full' | 'narrow' | 'medium';
    alignment?: 'left' | 'center' | 'right';
  };
  behavior?: {
    allowMultipleSubmissions?: boolean;
    showProgress?: boolean;
    autoAdvance?: boolean;
  };
}

export interface FormSchema {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  settings: FormSettings;
  pages: FormPage[];
  fields: FormField[];
  // CRM integration
  createContact?: boolean;
  createCompany?: boolean;
  addTags?: string[];
  // Notifications
  sendEmailNotification?: boolean;
  notificationEmails?: string[];
  // Thank you page
  thankYouMessage?: string;
  redirectUrl?: string;
}

// =====================================================
// Form Submission Data
// =====================================================

export interface FormSubmissionData {
  formId: string;
  data: Record<string, unknown>;
  files?: Record<string, File>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  meta?: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  };
}

// =====================================================
// Validation Result
// =====================================================

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export interface FieldValidationResult {
  valid: boolean;
  errors: string[];
}

// =====================================================
// Form State (for conditional logic)
// =====================================================

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  visibleFields: Record<string, boolean>;
  requiredFields: Record<string, boolean>;
  disabledFields: Record<string, boolean>;
}

// =====================================================
// Field Categories (for palette)
// =====================================================

export type FieldCategory = 'basic' | 'selection' | 'advanced' | 'layout' | 'special';

export const FIELD_CATEGORIES: Record<FieldCategory, { name: string; fields: FieldType[] }> = {
  basic: {
    name: 'Basic Fields',
    fields: ['text', 'textarea', 'number', 'email', 'phone', 'url'],
  },
  selection: {
    name: 'Selection Fields',
    fields: ['select', 'multiselect', 'checkbox', 'radio'],
  },
  advanced: {
    name: 'Advanced Fields',
    fields: ['date', 'time', 'datetime', 'file', 'rating'],
  },
  layout: {
    name: 'Layout Fields',
    fields: ['heading', 'description', 'divider'],
  },
  special: {
    name: 'Special Fields',
    fields: ['hidden', 'password', 'confirmation'],
  },
};

// =====================================================
// Helper Functions
// =====================================================

export function isLayoutField(type: FieldType): boolean {
  return ['heading', 'description', 'divider'].includes(type);
}

export function isInputField(type: FieldType): boolean {
  return !isLayoutField(type) && type !== 'hidden';
}

export function getFieldTypeLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: 'Text Input',
    textarea: 'Multi-line Text',
    number: 'Number',
    email: 'Email',
    phone: 'Phone',
    url: 'URL',
    select: 'Dropdown',
    multiselect: 'Multi-select',
    checkbox: 'Checkbox',
    radio: 'Radio Group',
    date: 'Date',
    time: 'Time',
    datetime: 'Date & Time',
    file: 'File Upload',
    rating: 'Rating',
    heading: 'Heading',
    description: 'Description',
    divider: 'Divider',
    hidden: 'Hidden Field',
    password: 'Password',
    confirmation: 'Confirmation',
  };
  return labels[type] || type;
}

export function createFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createPageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
