/**
 * Review Response Management System
 * Handles response templates, auto-response rules, and response posting
 */

import { supabase } from '@/lib/supabase';

export interface ReviewResponse {
  id: string;
  organization_id: string;
  review_id: string;
  content: string;
  author_id?: string;
  author_name?: string;
  status: 'draft' | 'posted' | 'failed';
  platform_response_id?: string;
  posted_at?: string;
  posted_on_platform: boolean;
  error_message?: string;
  response_type: 'public' | 'private' | 'both';
  template_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ResponseTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  rating_range?: [number, number]; // Min and max rating
  variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutoResponseRule {
  id: string;
  organization_id: string;
  source_id?: string;
  template_id: string;
  enabled: boolean;
  conditions: {
    min_rating?: number;
    max_rating?: number;
    sentiment?: string;
    keywords?: string[];
  };
  delay_hours: number;
  response_type: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

/**
 * Get all responses for a review
 */
export async function getReviewResponses(reviewId: string): Promise<ReviewResponse[]> {
  const { data, error } = await supabase
    .from('review_responses')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single response by ID
 */
export async function getResponse(responseId: string): Promise<ReviewResponse | null> {
  const { data, error } = await supabase
    .from('review_responses')
    .select('*')
    .eq('id', responseId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new response
 */
export async function createResponse(
  organizationId: string,
  reviewId: string,
  response: Omit<ReviewResponse, 'id' | 'organization_id' | 'review_id' | 'created_at' | 'updated_at'>
): Promise<ReviewResponse> {
  const { data, error } = await supabase
    .from('review_responses')
    .insert({
      organization_id: organizationId,
      review_id: reviewId,
      ...response,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a response
 */
export async function updateResponse(
  responseId: string,
  updates: Partial<Omit<ReviewResponse, 'id' | 'organization_id' | 'review_id' | 'created_at'>>
): Promise<ReviewResponse> {
  const { data, error } = await supabase
    .from('review_responses')
    .update(updates)
    .eq('id', responseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a response
 */
export async function deleteResponse(responseId: string): Promise<void> {
  const { error } = await supabase
    .from('review_responses')
    .delete()
    .eq('id', responseId);

  if (error) throw error;
}

/**
 * Post a response to the platform (simulated)
 */
export async function postResponseToPlatform(
  responseId: string
): Promise<{ success: boolean; platform_response_id?: string; error?: string }> {
  // In production, this would call the actual platform API to post the response
  // For now, we'll just mark it as posted
  const { error } = await supabase
    .from('review_responses')
    .update({
      status: 'posted',
      posted_at: new Date().toISOString(),
      posted_on_platform: true,
      platform_response_id: `platform_${Date.now()}`,
    })
    .eq('id', responseId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, platform_response_id: `platform_${Date.now()}` };
}

/**
 * Get all response templates for an organization
 */
export async function getResponseTemplates(organizationId: string): Promise<ResponseTemplate[]> {
  const { data, error } = await supabase
    .from('marketing_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('template_type', 'review_response')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []) as ResponseTemplate[];
}

/**
 * Get a single template by ID
 */
export async function getResponseTemplate(templateId: string): Promise<ResponseTemplate | null> {
  const { data, error } = await supabase
    .from('marketing_templates')
    .select('*')
    .eq('id', templateId)
    .eq('template_type', 'review_response')
    .single();

  if (error) throw error;
  return data as ResponseTemplate;
}

/**
 * Create a response template
 */
export async function createResponseTemplate(
  organizationId: string,
  template: Omit<ResponseTemplate, 'id' | 'organization_id' | 'created_at' | 'updated_at'>
): Promise<ResponseTemplate> {
  const { data, error } = await supabase
    .from('marketing_templates')
    .insert({
      organization_id: organizationId,
      template_type: 'review_response',
      name: template.name,
      subject: template.description || '',
      content: template.content,
      is_active: template.is_active,
      metadata: {
        sentiment: template.sentiment,
        rating_range: template.rating_range,
        variables: template.variables,
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data as ResponseTemplate;
}

/**
 * Update a response template
 */
export async function updateResponseTemplate(
  templateId: string,
  updates: Partial<Omit<ResponseTemplate, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<ResponseTemplate> {
  const { data, error } = await supabase
    .from('marketing_templates')
    .update({
      name: updates.name,
      subject: updates.description,
      content: updates.content,
      is_active: updates.is_active,
      metadata: {
        sentiment: updates.sentiment,
        rating_range: updates.rating_range,
        variables: updates.variables,
      },
    })
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return data as ResponseTemplate;
}

/**
 * Delete a response template
 */
export async function deleteResponseTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('marketing_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}

/**
 * Apply a template to a review, replacing variables
 */
export function applyTemplate(
  template: ResponseTemplate,
  variables: Record<string, string>
): string {
  let content = template.content;

  // Replace variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });

  return content;
}

/**
 * Get default variables for a review
 */
export function getDefaultVariables(review: any, source: any): Record<string, string> {
  return {
    reviewer_name: review.reviewer_name || 'Valued Customer',
    business_name: source.business_name,
    rating: review.rating.toString(),
    review_date: new Date(review.review_date).toLocaleDateString(),
  };
}

/**
 * Get suggested templates for a review
 */
export async function getSuggestedTemplates(
  organizationId: string,
  reviewRating: number,
  reviewSentiment?: string
): Promise<ResponseTemplate[]> {
  const { data, error } = await supabase
    .from('marketing_templates')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('template_type', 'review_response')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;

  // Filter templates based on rating and sentiment
  return (data || []).filter((template: any) => {
    const metadata = template.metadata || {};

    // Check rating range
    if (metadata.rating_range) {
      const [min, max] = metadata.rating_range;
      if (reviewRating < min || reviewRating > max) {
        return false;
      }
    }

    // Check sentiment
    if (metadata.sentiment && reviewSentiment) {
      if (metadata.sentiment !== reviewSentiment) {
        return false;
      }
    }

    return true;
  }) as ResponseTemplate[];
}

/**
 * Bulk create responses
 */
export async function bulkCreateResponses(
  organizationId: string,
  responses: Array<{
    reviewId: string;
    content: string;
    author_id?: string;
    author_name?: string;
    response_type?: 'public' | 'private' | 'both';
  }>
): Promise<ReviewResponse[]> {
  const inserts = responses.map((r) => ({
    organization_id: organizationId,
    review_id: r.reviewId,
    content: r.content,
    author_id: r.author_id,
    author_name: r.author_name,
    response_type: r.response_type || 'public',
    status: 'draft' as const,
  }));

  const { data, error } = await supabase
    .from('review_responses')
    .insert(inserts)
    .select();

  if (error) throw error;
  return data as ReviewResponse[];
}

/**
 * Bulk post responses
 */
export async function bulkPostResponses(responseIds: string[]): Promise<{
  successful: string[];
  failed: Array<{ id: string; error: string }>;
}> {
  const results = await Promise.allSettled(
    responseIds.map((id) => postResponseToPlatform(id))
  );

  const successful: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successful.push(responseIds[index]);
    } else {
      failed.push({
        id: responseIds[index],
        error: result.status === 'rejected' ? result.reason : result.value.error || 'Unknown error',
      });
    }
  });

  return { successful, failed };
}

/**
 * Get response statistics
 */
export async function getResponseStats(
  organizationId: string,
  days: number = 30
): Promise<{
  total_responses: number;
  posted_responses: number;
  draft_responses: number;
  avg_response_time_hours?: number;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('review_responses')
    .select('status, created_at, review_id')
    .eq('organization_id', organizationId)
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  const total = data?.length || 0;
  const posted = data?.filter((r) => r.status === 'posted').length || 0;
  const draft = data?.filter((r) => r.status === 'draft').length || 0;

  return {
    total_responses: total,
    posted_responses: posted,
    draft_responses: draft,
  };
}
