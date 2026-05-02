// @ts-nocheck
/**
 * CRM Integration System
 * Handles creating contacts, companies, and deals from form submissions
 */

import { supabase } from '@/lib/supabase';
import type { CRMMapping, CRMFieldType } from './schema';

// =====================================================
// Contact Creation
// =====================================================

export interface ContactData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  tags?: string[];
}

export async function createContactFromSubmission(
  organizationId: string,
  submissionData: Record<string, unknown>,
  mappings: CRMMapping[]
): Promise<{ contactId: string | null; error?: string }> {
  try {
    const contactData: ContactData = {};

    // Apply mappings and transformations
    for (const mapping of mappings) {
      const value = submissionData[mapping.formFieldId];

      if (value !== null && value !== undefined && value !== '') {
        const transformedValue = mapping.transform
          ? mapping.transform(value)
          : value;

        contactData[mapping.crmField] = transformedValue as never;
      }
    }

    // Validate we have at least an email or phone
    if (!contactData.email && !contactData.phone) {
      return {
        contactId: null,
        error: 'Contact must have either email or phone',
      };
    }

    // Check if contact already exists
    let existingContact = null;

    if (contactData.email) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('email', contactData.email)
        .single();

      existingContact = existing;
    }

    if (existingContact) {
      // Update existing contact
      const { data: updated, error } = await supabase
        .from('contacts')
        .update({
          ...contactData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingContact.id)
        .select('id')
        .single();

      if (error) throw error;

      return { contactId: updated.id };
    }

    // Create new contact
    const { data: newContact, error } = await supabase
      .from('contacts')
      .insert({
        organization_id: organizationId,
        ...contactData,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { contactId: newContact.id };
  } catch (error) {
    console.error('Error creating contact from submission:', error);
    return {
      contactId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Company Creation
// =====================================================

export interface CompanyData {
  name?: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export async function createCompanyFromSubmission(
  organizationId: string,
  submissionData: Record<string, unknown>,
  mappings: CRMMapping[]
): Promise<{ companyId: string | null; error?: string }> {
  try {
    const companyData: CompanyData = {};

    // Apply mappings
    for (const mapping of mappings) {
      const value = submissionData[mapping.formFieldId];

      if (value !== null && value !== undefined && value !== '') {
        const transformedValue = mapping.transform
          ? mapping.transform(value)
          : value;

        companyData[mapping.crmField] = transformedValue as never;
      }
    }

    // Validate we have at least a company name
    if (!companyData.name) {
      return {
        companyId: null,
        error: 'Company must have a name',
      };
    }

    // Check if company already exists
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('name', companyData.name)
      .single();

    if (existing) {
      return { companyId: existing.id };
    }

    // Create new company
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert({
        organization_id: organizationId,
        ...companyData,
      })
      .select('id')
      .single();

    if (error) throw error;

    return { companyId: newCompany.id };
  } catch (error) {
    console.error('Error creating company from submission:', error);
    return {
      companyId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Deal Creation
// =====================================================

export interface DealConfig {
  pipelineId?: string;
  stageId?: string;
  name?: string;
  value?: number;
  expectedCloseDate?: string;
}

export async function createDealFromSubmission(
  organizationId: string,
  contactId: string | null,
  companyId: string | null,
  config: DealConfig
): Promise<{ dealId: string | null; error?: string }> {
  try {
    if (!contactId && !companyId) {
      return {
        dealId: null,
        error: 'Deal must be associated with a contact or company',
      };
    }

    // Get default pipeline if not specified
    let pipelineId = config.pipelineId;

    if (!pipelineId) {
      const { data: pipelines } = await supabase
        .from('pipelines')
        .select('id')
        .eq('organization_id', organizationId)
        .limit(1)
        .single();

      pipelineId = pipelines?.id;
    }

    if (!pipelineId) {
      return {
        dealId: null,
        error: 'No pipeline found. Please create a pipeline first.',
      };
    }

    // Get first stage if not specified
    let stageId = config.stageId;

    if (!stageId) {
      const { data: stages } = await supabase
        .from('deal_stages')
        .select('id')
        .eq('pipeline_id', pipelineId)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      stageId = stages?.id;
    }

    // Create deal
    const dealData: Record<string, unknown> = {
      organization_id: organizationId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      name: config.name || 'New Deal from Form',
    };

    if (contactId) dealData.contact_id = contactId;
    if (companyId) dealData.company_id = companyId;
    if (config.value) dealData.value = config.value;
    if (config.expectedCloseDate) dealData.expected_close_date = config.expectedCloseDate;

    const { data: newDeal, error } = await supabase
      .from('deals')
      .insert(dealData)
      .select('id')
      .single();

    if (error) throw error;

    return { dealId: newDeal.id };
  } catch (error) {
    console.error('Error creating deal from submission:', error);
    return {
      dealId: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Tag Management
// =====================================================

export async function addTagsToContact(
  contactId: string,
  tags: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get existing tags
    const { data: contact } = await supabase
      .from('contacts')
      .select('tags')
      .eq('id', contactId)
      .single();

    const existingTags = (contact?.tags as string[]) || [];
    const allTags = [...new Set([...existingTags, ...tags])];

    // Update contact
    const { error } = await supabase
      .from('contacts')
      .update({ tags: allTags })
      .eq('id', contactId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error adding tags to contact:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =====================================================
// Built-in Transform Functions
// =====================================================

export const transforms = {
  // Format phone number
  formatPhone: (value: unknown): string => {
    if (typeof value !== 'string') return String(value);
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return value;
  },

  // Convert to title case
  titleCase: (value: unknown): string => {
    if (typeof value !== 'string') return String(value);
    return value
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Convert to uppercase
  uppercase: (value: unknown): string => {
    if (typeof value !== 'string') return String(value);
    return value.toUpperCase();
  },

  // Convert to lowercase
  lowercase: (value: unknown): string => {
    if (typeof value !== 'string') return String(value);
    return value.toLowerCase();
  },

  // Trim whitespace
  trim: (value: unknown): string => {
    if (typeof value !== 'string') return String(value);
    return value.trim();
  },

  // Extract domain from URL
  extractDomain: (value: unknown): string => {
    if (typeof value !== 'string') return String(value);
    try {
      const url = new URL(value.startsWith('http') ? value : `https://${value}`);
      return url.hostname;
    } catch {
      return value;
    }
  },

  // Convert to number
  toNumber: (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  },

  // Split name into first and last
  splitName: (value: unknown): { first_name: string; last_name: string } => {
    if (typeof value !== 'string') {
      return { first_name: String(value), last_name: '' };
    }

    const parts = value.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return { first_name: firstName, last_name: lastName };
  },
};

// =====================================================
// CRM Field Labels
// =====================================================

export const CRM_FIELD_LABELS: Record<CRMFieldType, string> = {
  first_name: 'First Name',
  last_name: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  company: 'Company',
  position: 'Position',
  website: 'Website',
  address: 'Address',
  city: 'City',
  state: 'State',
  zip: 'Zip Code',
  country: 'Country',
  tags: 'Tags',
};

// =====================================================
// Get Available CRM Fields
// =====================================================

export function getAvailableCRMFields(): CRMFieldType[] {
  return Object.keys(CRM_FIELD_LABELS) as CRMFieldType[];
}

// =====================================================
// Validate CRM Mapping
// =====================================================

export function validateCRMMapping(mapping: CRMMapping): boolean {
  if (!mapping.formFieldId) {
    console.warn('CRM mapping must have a form field ID');
    return false;
  }

  if (!mapping.crmField) {
    console.warn('CRM mapping must have a CRM field');
    return false;
  }

  return true;
}

// =====================================================
// Auto-suggest CRM Mappings
// =====================================================

export function suggestCRMMapping(
  fieldLabel: string,
  fieldType: string
): CRMFieldType | null {
  const label = fieldLabel.toLowerCase();

  // Name fields
  if (label.includes('first') && label.includes('name')) return 'first_name';
  if (label.includes('last') && label.includes('name')) return 'last_name';
  if (label === 'name' && fieldType === 'text') return 'first_name';

  // Contact info
  if (label.includes('email')) return 'email';
  if (label.includes('phone') || label.includes('mobile')) return 'phone';

  // Company info
  if (label.includes('company') || label.includes('organization')) return 'company';
  if (label.includes('position') || label.includes('title') || label.includes('role')) return 'position';
  if (label.includes('website') || label.includes('url')) return 'website';

  // Address
  if (label.includes('address') || label.includes('street')) return 'address';
  if (label.includes('city')) return 'city';
  if (label.includes('state') || label.includes('province')) return 'state';
  if (label.includes('zip') || label.includes('postal')) return 'zip';
  if (label.includes('country')) return 'country';

  return null;
}
