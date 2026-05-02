/**
 * CRM Agent
 * Specialized agent for CRM operations (contacts, companies, lead scoring)
 */

import type {
  AgentDefinition,
  AgentConfig,
  AgentContext,
} from '../types';
import { BaseAgent, agentFactory } from './BaseAgent';

// ============================================================================
// CRM Types
// ============================================================================

interface Contact {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  company_id?: string;
  status?: string;
  lead_score?: number;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
}

interface LeadScoreFactors {
  email_engagement: number;
  website_visits: number;
  form_submissions: number;
  meeting_attended: number;
  last_activity_days: number;
}

// ============================================================================
// CRM Agent Definition
// ============================================================================

const CRM_DEFINITION: AgentDefinition = {
  id: 'crm',
  name: 'CRM Agent',
  description: 'Manages contacts, companies, and lead scoring',
  category: 'crm',
  type: 'crm',
  capabilities: ['data_query', 'data_mutate', 'analysis'],
  dependencies: [],
  requiresModules: ['crm'],
  maxConcurrency: 5,
  timeout: 60000,
  isCore: true,
  icon: 'users',
  color: 'bg-blue-500',
};

// ============================================================================
// CRM Agent Class
// ============================================================================

export class CRMAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(CRM_DEFINITION, config);
  }

  /**
   * Execute CRM-specific actions
   */
  protected async executeAction(
    action: string,
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<unknown> {
    switch (action) {
      case 'find_contact':
        return this.findContact(params, _context);

      case 'create_contact':
        return this.createContact(params, _context);

      case 'update_contact':
        return this.updateContact(params, _context);

      case 'enrich_contact':
        return this.enrichContact(params, _context);

      case 'score_lead':
        return this.scoreLead(params, _context);

      case 'detect_duplicates':
        return this.detectDuplicates(params, _context);

      case 'suggest_next_action':
        return this.suggestNextAction(params, _context);

      default:
        throw new Error(`Unknown CRM action: ${action}`);
    }
  }

  /**
   * Find a contact by email, phone, or name
   */
  private async findContact(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<Contact[]> {
    this.log('Finding contact', params);

    const { email } = params;

    // This would query the database in a real implementation
    // For now, return mock data
    const contacts: Contact[] = [];

    if (email) {
      // Mock: In real implementation, query Supabase
      contacts.push({
        id: 'mock-contact-1',
        email: email as string,
        first_name: 'John',
        last_name: 'Doe',
        status: 'active',
        lead_score: 75,
      });
    }

    return contacts;
  }

  /**
   * Create a new contact
   */
  private async createContact(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<Contact> {
    this.log('Creating contact', params);

    // Validate required fields
    if (!params.email && !params.phone) {
      throw new Error('Email or phone is required to create a contact');
    }

    // In real implementation, insert into Supabase
    const contact: Contact = {
      id: `contact-${Date.now()}`,
      email: params.email as string,
      phone: params.phone as string,
      first_name: params.first_name as string,
      last_name: params.last_name as string,
      company_id: params.company_id as string,
      status: (params.status as string) ?? 'prospect',
      tags: (params.tags as string[]) ?? [],
      custom_fields: params.custom_fields as Record<string, unknown>,
    };

    this.log('Contact created', contact);
    return contact;
  }

  /**
   * Update an existing contact
   */
  private async updateContact(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<Contact> {
    this.log('Updating contact', params);

    const { id, ...updates } = params;

    if (!id) {
      throw new Error('Contact ID is required for update');
    }

    // In real implementation, update in Supabase
    const contact: Contact = {
      id: id as string,
      email: updates.email as string,
      phone: updates.phone as string,
      first_name: updates.first_name as string,
      last_name: updates.last_name as string,
      status: updates.status as string,
      tags: updates.tags as string[],
      custom_fields: updates.custom_fields as Record<string, unknown>,
    };

    this.log('Contact updated', contact);
    return contact;
  }

  /**
   * Enrich a contact with AI-powered data
   */
  private async enrichContact(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<Contact> {
    this.log('Enriching contact', params);

    const { id } = params;

    if (!id) {
      throw new Error('Contact ID is required for enrichment');
    }

    // In real implementation, would use AI to enrich data
    // For now, return mock enriched data
    const enriched: Contact = {
      id: id as string,
      email: 'john.doe@company.com',
      first_name: 'John',
      last_name: 'Doe',
      company_id: 'company-1',
      status: 'lead',
      lead_score: 85,
      tags: ['enriched', 'high-value'],
    };

    this.log('Contact enriched', enriched);
    return enriched;
  }

  /**
   * Score a lead based on engagement factors
   */
  private async scoreLead(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<{ score: number; factors: LeadScoreFactors; tier: string }> {
    this.log('Scoring lead', params);

    const { id } = params;

    if (!id) {
      throw new Error('Contact ID is required for lead scoring');
    }

    // In real implementation, would fetch actual engagement data
    const factors: LeadScoreFactors = {
      email_engagement: 8,
      website_visits: 12,
      form_submissions: 3,
      meeting_attended: 2,
      last_activity_days: 5,
    };

    // Calculate score (0-100)
    let score = 0;
    score += Math.min(factors.email_engagement * 3, 30); // Max 30 points
    score += Math.min(factors.website_visits * 2, 20); // Max 20 points
    score += Math.min(factors.form_submissions * 10, 20); // Max 20 points
    score += Math.min(factors.meeting_attended * 10, 20); // Max 20 points
    score += Math.max(0, 10 - factors.last_activity_days); // Max 10 points

    // Determine tier
    let tier = 'cold';
    if (score >= 80) tier = 'hot';
    else if (score >= 60) tier = 'warm';
    else if (score >= 40) tier = 'medium';

    this.log('Lead scored', { score, factors, tier });
    return { score, factors, tier };
  }

  /**
   * Detect duplicate contacts
   */
  private async detectDuplicates(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<Array<{ contacts: Contact[]; confidence: number }>> {
    this.log('Detecting duplicates', params);

    const { threshold: _threshold = 0.8 } = params;

    // In real implementation, would use fuzzy matching
    // For now, return mock duplicates
    const duplicates = [
      {
        contacts: [
          { id: 'contact-1', email: 'john@example.com', first_name: 'John', last_name: 'Doe' },
          { id: 'contact-2', email: 'john.doe@example.com', first_name: 'John', last_name: 'Doe' },
        ],
        confidence: 0.95,
      },
    ];

    this.log('Duplicates detected', duplicates);
    return duplicates;
  }

  /**
   * Suggest next action for a contact
   */
  private async suggestNextAction(
    params: Record<string, unknown>,
    _context: AgentContext
  ): Promise<{ action: string; reason: string; priority: string }> {
    this.log('Suggesting next action', params);

    const { id } = params;

    if (!id) {
      throw new Error('Contact ID is required for action suggestion');
    }

    // In real implementation, would analyze contact history and behavior
    // For now, return mock suggestion
    const suggestion = {
      action: 'Schedule a follow-up call',
      reason: 'Contact has shown high engagement with recent emails but has not yet booked a meeting',
      priority: 'high',
    };

    this.log('Next action suggested', suggestion);
    return suggestion;
  }

  /**
   * Validate input parameters
   */
  protected validateInput(action: string, params: Record<string, unknown>): void {
    super.validateInput(action, params);

    switch (action) {
      case 'find_contact':
        if (!params.email && !params.phone && !params.first_name && !params.last_name) {
          throw new Error('At least one search parameter (email, phone, first_name, last_name) is required');
        }
        break;

      case 'create_contact':
        if (!params.email && !params.phone) {
          throw new Error('Email or phone is required to create a contact');
        }
        break;

      case 'update_contact':
      case 'enrich_contact':
      case 'score_lead':
      case 'suggest_next_action':
        if (!params.id) {
          throw new Error('Contact ID is required');
        }
        break;
    }
  }
}

// ============================================================================
// Register the CRM agent with the factory
// ============================================================================

agentFactory.register('crm', CRM_DEFINITION, (config) => {
  return new CRMAgent(config);
});
