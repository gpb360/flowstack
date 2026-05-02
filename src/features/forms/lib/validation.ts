// @ts-nocheck
/**
 * Form Validation Library
 * Provides validation functions for all field types
 */

import type { FormField, ValidationRule, FieldValidationResult, ValidationResult } from './schema';

// =====================================================
// Built-in Validators
// =====================================================

export const validators = {
  required: (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  email: (value: unknown): boolean => {
    if (typeof value !== 'string' || value.trim() === '') return true; // Empty is ok if not required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  phone: (value: unknown): boolean => {
    if (typeof value !== 'string' || value.trim() === '') return true;
    // Support various phone formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(value.replace(/[\s\(\)\-\.]/g, ''));
  },

  url: (value: unknown): boolean => {
    if (typeof value !== 'string' || value.trim() === '') return true;
    try {
      new URL(value.startsWith('http') ? value : `https://${value}`);
      return true;
    } catch {
      return false;
    }
  },

  min_length: (value: unknown, min: number): boolean => {
    if (typeof value !== 'string') return true;
    return value.length >= min;
  },

  max_length: (value: unknown, max: number): boolean => {
    if (typeof value !== 'string') return true;
    return value.length <= max;
  },

  min_value: (value: unknown, min: number): boolean => {
    const num = Number(value);
    if (isNaN(num)) return true;
    return num >= min;
  },

  max_value: (value: unknown, max: number): boolean => {
    const num = Number(value);
    if (isNaN(num)) return true;
    return num <= max;
  },

  pattern: (value: unknown, pattern: string): boolean => {
    if (typeof value !== 'string') return true;
    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch {
      return true; // Invalid pattern, pass validation
    }
  },

  custom: (value: unknown, validator: (value: unknown) => boolean): boolean => {
    return validator(value);
  },
};

// =====================================================
// Default Error Messages
// =====================================================

export const defaultMessages: Record<string, (value?: unknown) => string> = {
  required: () => 'This field is required',
  email: () => 'Please enter a valid email address',
  phone: () => 'Please enter a valid phone number',
  url: () => 'Please enter a valid URL',
  min_length: (val?: unknown) => `Must be at least ${val} characters`,
  max_length: (val?: unknown) => `Must be no more than ${val} characters`,
  min_value: (val?: unknown) => `Must be at least ${val}`,
  max_value: (val?: unknown) => `Must be at most ${val}`,
  pattern: () => 'Please match the required format',
  custom: () => 'Validation failed',
};

// =====================================================
// Validate a Single Field
// =====================================================

export function validateField(field: FormField, value: unknown): FieldValidationResult {
  const errors: string[] = [];

  // Skip validation for layout fields
  if (field.type === 'heading' || field.type === 'description' || field.type === 'divider') {
    return { valid: true, errors: [] };
  }

  // Run validation rules
  if (field.validation) {
    for (const rule of field.validation) {
      const isValid = runValidator(rule, value);

      if (!isValid) {
        const message = rule.message || defaultMessages[rule.type]?.(rule.value) || 'Validation failed';
        errors.push(message);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// Run a Single Validator
// =====================================================

function runValidator(rule: ValidationRule, value: unknown): boolean {
  const validator = validators[rule.type];

  if (!validator) {
    console.warn(`Unknown validator type: ${rule.type}`);
    return true;
  }

  if (rule.value !== undefined) {
    return validator(value, rule.value as never);
  }

  return validator(value);
}

// =====================================================
// Validate All Fields in a Form
// =====================================================

export function validateForm(
  fields: FormField[],
  data: Record<string, unknown>
): ValidationResult {
  const errors: Record<string, string[]> = {};
  let valid = true;

  for (const field of fields) {
    const value = data[field.id];
    const result = validateField(field, value);

    if (!result.valid) {
      errors[field.id] = result.errors;
      valid = false;
    }
  }

  return {
    valid,
    errors,
  };
}

// =====================================================
// Validate Required Fields Only
// =====================================================

export function validateRequiredFields(
  fields: FormField[],
  data: Record<string, unknown>
): ValidationResult {
  const errors: Record<string, string[]> = {};
  let valid = true;

  for (const field of fields) {
    if (field.required) {
      const value = data[field.id];
      const isValid = validators.required(value);

      if (!isValid) {
        errors[field.id] = [defaultMessages.required()];
        valid = false;
      }
    }
  }

  return {
    valid,
    errors,
  };
}

// =====================================================
// Real-time Validation (on change)
// =====================================================

export function validateFieldOnChange(
  field: FormField,
  value: unknown,
  touched: boolean
): FieldValidationResult {
  // Only validate if field has been touched
  if (!touched) {
    return { valid: true, errors: [] };
  }

  return validateField(field, value);
}

// =====================================================
// Validate Single Rule
// =====================================================

export function validateRule(
  rule: ValidationRule,
  value: unknown
): boolean {
  return runValidator(rule, value);
}

// =====================================================
// Get Validation Rules for Field Type
// =====================================================

export function getAvailableValidators(fieldType: string): ValidationRule[] {
  const baseRules: ValidationRule[] = [
    { type: 'required', value: true },
  ];

  const typeRules: Record<string, ValidationRule[]> = {
    text: [
      ...baseRules,
      { type: 'min_length', value: 0 },
      { type: 'max_length', value: 255 },
      { type: 'pattern', value: '' },
    ],
    textarea: [
      ...baseRules,
      { type: 'min_length', value: 0 },
      { type: 'max_length', value: 5000 },
    ],
    number: [
      ...baseRules,
      { type: 'min_value', value: 0 },
      { type: 'max_value', value: 999999 },
    ],
    email: [
      ...baseRules,
      { type: 'email' },
    ],
    phone: [
      ...baseRules,
      { type: 'phone' },
    ],
    url: [
      ...baseRules,
      { type: 'url' },
    ],
    password: [
      ...baseRules,
      { type: 'min_length', value: 8 },
    ],
    date: baseRules,
    time: baseRules,
    datetime: baseRules,
    file: baseRules,
    select: baseRules,
    multiselect: baseRules,
    checkbox: [], // Checkbox is validated by checking if checked
    radio: baseRules,
    rating: baseRules,
    heading: [],
    description: [],
    divider: [],
    hidden: [],
    confirmation: baseRules,
  };

  return typeRules[fieldType] || baseRules;
}

// =====================================================
// Sanitize Form Data
// =====================================================

export function sanitizeFormData(
  fields: FormField[],
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const field of fields) {
    const value = data[field.id];

    // Skip layout fields
    if (field.type === 'heading' || field.type === 'description' || field.type === 'divider') {
      continue;
    }

    // Trim strings
    if (typeof value === 'string') {
      sanitized[field.id] = value.trim();
    } else {
      sanitized[field.id] = value;
    }
  }

  return sanitized;
}

// =====================================================
// Check if Form is Valid (for submit button)
// =====================================================

export function isFormValid(
  fields: FormField[],
  data: Record<string, unknown>
): boolean {
  const result = validateForm(fields, data);
  return result.valid;
}
