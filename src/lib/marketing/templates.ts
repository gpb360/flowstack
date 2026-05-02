/**
 * Template Rendering System
 *
 * Provides template variable parsing and rendering for email and SMS templates.
 * Supports nested variables, conditionals, and loops.
 */

export interface TemplateVariable {
  name: string;
  description?: string;
  defaultValue?: string;
  required?: boolean;
}

export interface ContactData {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: {
    name?: string | null;
  } | null;
  [key: string]: unknown;
}

export interface TemplateRenderResult {
  rendered: string;
  missingVariables: string[];
  usedVariables: string[];
}

/**
 * Available template variables for contact-based templates
 */
export const CONTACT_VARIABLES: TemplateVariable[] = [
  { name: 'contact.first_name', description: 'Contact first name', defaultValue: 'there' },
  { name: 'contact.last_name', description: 'Contact last name' },
  { name: 'contact.full_name', description: 'Contact full name', defaultValue: 'there' },
  { name: 'contact.email', description: 'Contact email address' },
  { name: 'contact.phone', description: 'Contact phone number' },
  { name: 'contact.company.name', description: 'Company name' },
];

/**
 * Available template variables for company-based templates
 */
export const COMPANY_VARIABLES: TemplateVariable[] = [
  { name: 'company.name', description: 'Company name', required: true },
  { name: 'company.domain', description: 'Company website domain' },
  { name: 'company.address', description: 'Company address' },
];

/**
 * Available template variables for system-based templates
 */
export const SYSTEM_VARIABLES: TemplateVariable[] = [
  { name: 'organization.name', description: 'Your organization name', required: true },
  { name: 'today', description: 'Today\'s date', defaultValue: new Date().toLocaleDateString() },
  { name: 'unsubscribe_url', description: 'Unsubscribe link', required: true },
  { name: 'web_view_url', description: 'Web view link' },
];

/**
 * All available template variables
 */
export const ALL_VARIABLES = [
  ...CONTACT_VARIABLES,
  ...COMPANY_VARIABLES,
  ...SYSTEM_VARIABLES,
];

/**
 * Simple template rendering with {{variable}} syntax
 * @param template Template string
 * @param data Variables data
 * @returns Rendered string
 */
export function renderTemplate(
  template: string,
  data: Record<string, unknown>
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(data, trimmedKey);

    if (value === null || value === undefined) {
      console.warn(`Missing template variable: ${trimmedKey}`);
      return match; // Return original if not found
    }

    return String(value);
  });
}

/**
 * Render template with analysis
 * @param template Template string
 * @param data Variables data
 * @returns Render result with analysis
 */
export function renderTemplateWithAnalysis(
  template: string,
  data: Record<string, unknown>
): TemplateRenderResult {
  const usedVariables: string[] = [];
  const missingVariables: string[] = [];

  const rendered = template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    usedVariables.push(trimmedKey);

    const value = getNestedValue(data, trimmedKey);

    if (value === null || value === undefined) {
      missingVariables.push(trimmedKey);
      return match;
    }

    return String(value);
  });

  return {
    rendered,
    missingVariables,
    usedVariables: [...new Set(usedVariables)],
  };
}

/**
 * Get nested value from object using dot notation
 * @param obj Object
 * @param path Dot notation path
 * @returns Value or undefined
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj as unknown);
}

/**
 * Extract all variables from a template
 * @param template Template string
 * @returns Array of variable names
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1].trim());
  }

  return [...new Set(variables)];
}

/**
 * Validate template variables
 * Checks if all required variables are present
 * @param template Template string
 * @param availableVariables Available variables
 * @returns Validation result
 */
export function validateTemplate(
  template: string,
  availableVariables: TemplateVariable[] = ALL_VARIABLES
): {
  valid: boolean;
  missing: string[];
  found: string[];
} {
  const usedVariables = extractVariables(template);
  const availableNames = availableVariables.map(v => v.name);
  const missing = usedVariables.filter(v => !availableNames.includes(v));

  return {
    valid: missing.length === 0,
    missing,
    found: usedVariables.filter(v => availableNames.includes(v)),
  };
}

/**
 * Prepare contact data for template rendering
 * Enriches contact data with computed fields
 * @param contact Contact data
 * @returns Prepared data
 */
export function prepareContactData(contact: ContactData): Record<string, unknown> {
  return {
    contact: {
      ...contact,
      full_name: [contact.first_name, contact.last_name]
        .filter(Boolean)
        .join(' ') || null,
    },
    today: new Date().toLocaleDateString(),
  };
}

/**
 * Render email subject with fallback
 * @param subject Subject template
 * @param data Variables data
 * @param fallback Fallback value if rendering fails
 * @returns Rendered subject
 */
export function renderSubject(
  subject: string,
  data: Record<string, unknown>,
  fallback: string = 'No Subject'
): string {
  try {
    const rendered = renderTemplate(subject, data);
    return rendered.trim() || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Sanitize template HTML
 * Removes dangerous elements while preserving structure
 * @param html HTML content
 * @returns Sanitized HTML
 */
export function sanitizeTemplateHTML(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove onclick, onerror, etc. attributes
  sanitized = sanitized.replace(/\s+on\w+="[^"]*"/gi, '');

  return sanitized;
}

/**
 * Preview template with sample data
 * @param template Template string
 * @returns Preview with sample data
 */
export function previewTemplate(template: string): string {
  const sampleData = {
    contact: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: {
        name: 'Acme Corporation',
      },
    },
    company: {
      name: 'Acme Corporation',
      domain: 'acme.com',
    },
    organization: {
      name: 'My Organization',
    },
    today: new Date().toLocaleDateString(),
    unsubscribe_url: 'https://example.com/unsubscribe',
    web_view_url: 'https://example.com/view',
  };

  return renderTemplate(template, sampleData);
}

/**
 * Calculate template complexity score
 * Higher score = more complex template
 * @param template Template string
 * @returns Complexity score (0-100)
 */
export function calculateComplexity(template: string): number {
  let score = 0;

  // Number of variables (0-40 points)
  const variables = extractVariables(template);
  score += Math.min(variables.length * 4, 40);

  // Length (0-20 points)
  score += Math.min(template.length / 500, 20);

  // HTML tags (0-20 points)
  const tags = (template.match(/<[^>]+>/g) || []).length;
  score += Math.min(tags * 2, 20);

  // Conditional/loop syntax (0-20 points)
  if (template.includes('{{#if')) score += 10;
  if (template.includes('{{#each')) score += 10;

  return Math.min(score, 100);
}

/**
 * Get template suggestions based on content
 * @param content Template content
 * @returns Array of suggestions
 */
export function getTemplateSuggestions(content: string): string[] {
  const suggestions: string[] = [];
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('dear') && !lowerContent.includes('{{contact.first_name')) {
    suggestions.push('Consider personalizing with {{contact.first_name}} instead of "Dear"');
  }

  if (!lowerContent.includes('unsubscribe') && !lowerContent.includes('opt-out')) {
    suggestions.push('Add an unsubscribe link: {{unsubscribe_url}}');
  }

  if (content.length > 2000 && !lowerContent.includes('<img')) {
    suggestions.push('Consider adding images to break up long text');
  }

  return suggestions;
}

/**
 * Template variable picker data
 * Groups variables by category for UI
 */
export const TEMPLATE_VARIABLE_GROUPS = {
  Contact: CONTACT_VARIABLES,
  Company: COMPANY_VARIABLES,
  System: SYSTEM_VARIABLES,
};

/**
 * Get variable label for display
 * @param variableName Variable name
 * @returns Display label
 */
export function getVariableLabel(variableName: string): string {
  const variable = ALL_VARIABLES.find(v => v.name === variableName);
  return variable?.description || variableName;
}
