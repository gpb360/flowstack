import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'] & Record<string, any>;
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

type Company = Database['public']['Tables']['companies']['Row'] & Record<string, any>;
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

type Deal = Database['public']['Tables']['deals']['Row'] & Record<string, any>;
type DealInsert = Database['public']['Tables']['deals']['Insert'];
type DealUpdate = Database['public']['Tables']['deals']['Update'];

type Stage = Database['public']['Tables']['stages']['Row'] & Record<string, any>;
type Pipeline = Database['public']['Tables']['pipelines']['Row'] & Record<string, any>;

type Activity = Database['public']['Tables']['activities']['Row'] & Record<string, any>;
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];

type Tag = Database['public']['Tables']['tags']['Row'] & Record<string, any>;

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Fetch contacts with filtering, sorting, and pagination
 */
export async function fetchContacts(params: {
  organizationId: string;
  search?: string;
  companyId?: string;
  ownerId?: string;
  tags?: string[];
  sortBy?: 'created_at' | 'updated_at' | 'first_name' | 'last_name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) {
  const {
    organizationId,
    search,
    companyId,
    ownerId,
    tags,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 50,
  } = params;

  let query = supabase
    .from('contacts')
    .select('*, companies(*), user_profiles(*)', { count: 'exact' })
    .eq('organization_id', organizationId);

  // Apply filters
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  if (tags && tags.length > 0) {
    // Fetch contacts with these tags
    const { data: tagContacts } = await supabase
      .from('contact_tags')
      .select('contact_id')
      .in('tag_id', tags);

    if (tagContacts) {
      const contactIds = tagContacts.map((tc) => tc.contact_id);
      query = query.in('id', contactIds);
    }
  }

  // Apply sorting and pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) throw error;

  return {
    contacts: data as (Contact & { companies: Company | null; user_profiles: any })[],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Fetch a single contact by ID with related data
 */
export async function fetchContactById(contactId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select(
      `
      *,
      companies(*),
      user_profiles(*),
      tags(*)
    `
    )
    .eq('id', contactId)
    .single();

  if (error) throw error;
  return data as Contact & {
    companies: Company | null;
    user_profiles: any;
    tags: Tag[];
  };
}

/**
 * Fetch companies with filtering
 */
export async function fetchCompanies(params: {
  organizationId: string;
  search?: string;
  ownerId?: string;
  sortBy?: 'created_at' | 'updated_at' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}) {
  const {
    organizationId,
    search,
    ownerId,
    sortBy = 'created_at',
    sortOrder = 'desc',
    page = 1,
    pageSize = 50,
  } = params;

  let query = supabase
    .from('companies')
    .select('*, user_profiles(*)', { count: 'exact' })
    .eq('organization_id', organizationId);

  if (search) {
    query = query.or(`name.ilike.%${search}%,domain.ilike.%${search}%`);
  }

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);

  if (error) throw error;

  return {
    companies: data as (Company & { user_profiles: any })[],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Fetch a single company by ID with related data
 */
export async function fetchCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*, user_profiles(*)')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data as Company & { user_profiles: any };
}

/**
 * Fetch contacts for a company
 */
export async function fetchCompanyContacts(companyId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*, user_profiles(*)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as (Contact & { user_profiles: any })[];
}

/**
 * Fetch deals with filtering
 */
export async function fetchDeals(params: {
  organizationId: string;
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  status?: Deal['status'];
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const {
    organizationId,
    pipelineId,
    stageId,
    contactId,
    companyId,
    status,
    search,
    page = 1,
    pageSize = 50,
  } = params;

  let query = supabase
    .from('deals')
    .select(
      `
      *,
      stages(*),
      pipelines(*),
      contacts(*),
      companies(*)
    `,
      { count: 'exact' }
    )
    .eq('organization_id', organizationId);

  if (pipelineId) query = query.eq('pipeline_id', pipelineId);
  if (stageId) query = query.eq('stage_id', stageId);
  if (contactId) query = query.eq('contact_id', contactId);
  if (companyId) query = query.eq('company_id', companyId);
  if (status) query = query.eq('status', status);
  if (search) query = query.ilike('title', `%${search}%`);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    deals: data as (Deal & {
      stages: Stage | null;
      pipelines: Pipeline | null;
      contacts: Contact | null;
      companies: Company | null;
    })[],
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

/**
 * Fetch a single deal by ID
 */
export async function fetchDealById(dealId: string) {
  const { data, error } = await supabase
    .from('deals')
    .select(
      `
      *,
      stages(*),
      pipelines(*),
      contacts(*),
      companies(*)
    `
    )
    .eq('id', dealId)
    .single();

  if (error) throw error;
  return data as Deal & {
    stages: Stage | null;
    pipelines: Pipeline | null;
    contacts: Contact | null;
    companies: Company | null;
  };
}

/**
 * Fetch pipeline with stages and deals
 */
export async function fetchPipelineWithStages(pipelineId: string) {
  const { data: stages, error: stagesError } = await supabase
    .from('stages')
    .select('*, deals(*)')
    .eq('pipeline_id', pipelineId)
    .order('position', { ascending: true });

  if (stagesError) throw stagesError;

  return stages as (Stage & {
    deals: (Deal & {
      contacts: Contact | null;
      companies: Company | null;
    })[];
  })[];
}

/**
 * Fetch all pipelines for an organization
 */
export async function fetchPipelines(organizationId: string) {
  const { data, error } = await supabase
    .from('pipelines')
    .select('*, stages(*)')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data as (Pipeline & { stages: Stage[] })[];
}

/**
 * Fetch activities with filtering
 */
export async function fetchActivities(params: {
  organizationId: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
  type?: Activity['type'];
  limit?: number;
  offset?: number;
}) {
  const {
    organizationId,
    contactId,
    companyId,
    dealId,
    type,
    limit = 50,
    offset = 0,
  } = params;

  let query = supabase
    .from('activities')
    .select('*, user_profiles(*)')
    .eq('organization_id', organizationId);

  if (contactId) query = query.eq('contact_id', contactId);
  if (companyId) query = query.eq('company_id', companyId);
  if (dealId) query = query.eq('deal_id', dealId);
  if (type) query = query.eq('type', type);

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return data as (Activity & { user_profiles: any })[];
}

/**
 * Fetch deal history
 */
export async function fetchDealHistory(dealId: string) {
  const { data, error } = await supabase
    .from('deal_history')
    .select('*, user_profiles(*)')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch tags for an organization
 */
export async function fetchTags(organizationId: string) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Tag[];
}

/**
 * Fetch tags for a specific contact
 */
export async function fetchContactTags(contactId: string) {
  const { data, error } = await supabase
    .from('contact_tags')
    .select('tags(*)')
    .eq('contact_id', contactId);

  if (error) throw error;
  return (data?.map((ct) => ct.tags).filter(Boolean) as unknown) as Tag[];
}

/**
 * Fetch lead score for a contact
 */
export async function fetchLeadScore(contactId: string) {
  const { data, error } = await supabase
    .from('lead_scores')
    .select('*')
    .eq('contact_id', contactId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

/**
 * Fetch CRM dashboard metrics
 */
export async function fetchCRMMetrics(organizationId: string) {
  // Get total counts
  const [contactsResult, companiesResult, dealsResult, activitiesResult] =
    await Promise.all([
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('companies')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('deals')
        .select('id, value', { count: 'exact' })
        .eq('organization_id', organizationId),
      supabase
        .from('activities')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

  const deals = (dealsResult.data || []) as Array<{ id: string; value: number; status?: string }>;
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
  const wonDeals = deals.filter((d) => d.status === 'won').length;
  const openDeals = deals.filter((d) => d.status === 'open').length;

  return {
    totalContacts: contactsResult.count || 0,
    totalCompanies: companiesResult.count || 0,
    totalDeals: dealsResult.count || 0,
    totalValue,
    wonDeals,
    openDeals,
    recentActivities: activitiesResult.count || 0,
  };
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new contact
 */
export async function createContact(contact: ContactInsert) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contact)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

/**
 * Update a contact
 */
export async function updateContact(contactId: string, updates: ContactUpdate) {
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', contactId)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

/**
 * Delete a contact
 */
export async function deleteContact(contactId: string) {
  const { error } = await supabase.from('contacts').delete().eq('id', contactId);
  if (error) throw error;
}

/**
 * Create a new company
 */
export async function createCompany(company: CompanyInsert) {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

/**
 * Update a company
 */
export async function updateCompany(companyId: string, updates: CompanyUpdate) {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

/**
 * Delete a company
 */
export async function deleteCompany(companyId: string) {
  const { error } = await supabase.from('companies').delete().eq('id', companyId);
  if (error) throw error;
}

/**
 * Create a new deal
 */
export async function createDeal(deal: DealInsert) {
  const { data, error } = await supabase
    .from('deals')
    .insert(deal)
    .select()
    .single();

  if (error) throw error;
  return data as Deal;
}

/**
 * Update a deal
 */
export async function updateDeal(dealId: string, updates: DealUpdate) {
  const { data, error } = await supabase
    .from('deals')
    .update(updates)
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw error;
  return data as Deal;
}

/**
 * Move deal to a different stage (creates history record)
 */
export async function moveDealToStage(params: {
  dealId: string;
  fromStageId: string | null;
  toStageId: string;
  userId?: string;
  notes?: string;
}) {
  const { dealId, fromStageId, toStageId, userId, notes } = params;

  // Fetch current deal and stage info
  const { data: deal } = await supabase
    .from('deals')
    .select('*, stages(*)')
    .eq('id', dealId)
    .single();

  if (!deal) throw new Error('Deal not found');

  const { data: toStage } = await supabase
    .from('stages')
    .select('*')
    .eq('id', toStageId)
    .single();

  if (!toStage) throw new Error('Stage not found');

  // Update deal
  const { data: updatedDeal, error: updateError } = await supabase
    .from('deals')
    .update({ stage_id: toStageId })
    .eq('id', dealId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Create history record
  await supabase.from('deal_history').insert({
    organization_id: deal.organization_id,
    deal_id: dealId,
    from_stage_id: fromStageId,
    to_stage_id: toStageId,
    from_stage_name: deal.stages?.name || null,
    to_stage_name: toStage.name,
    changed_by_user_id: userId,
    notes,
  });

  // Create activity
  await supabase.from('activities').insert({
    organization_id: deal.organization_id,
    deal_id: dealId,
    contact_id: deal.contact_id,
    company_id: deal.company_id,
    user_id: userId,
    type: 'deal_stage_change',
    title: `Deal moved to ${toStage.name}`,
    description: notes,
  });

  return updatedDeal as Deal;
}

/**
 * Update deal status (creates history record)
 */
export async function updateDealStatus(params: {
  dealId: string;
  status: Deal['status'];
  userId?: string;
  notes?: string;
}) {
  const { dealId, status, userId, notes } = params;

  // Fetch current deal
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (!deal) throw new Error('Deal not found');

  // Update deal
  const { data: updatedDeal, error: updateError } = await supabase
    .from('deals')
    .update({ status })
    .eq('id', dealId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Create history record
  await supabase.from('deal_history').insert({
    organization_id: deal.organization_id,
    deal_id: dealId,
    from_status: deal.status,
    to_status: status,
    changed_by_user_id: userId,
    notes,
  });

  return updatedDeal as Deal;
}

/**
 * Delete a deal
 */
export async function deleteDeal(dealId: string) {
  const { error } = await supabase.from('deals').delete().eq('id', dealId);
  if (error) throw error;
}

/**
 * Create an activity
 */
export async function createActivity(activity: ActivityInsert) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}

/**
 * Update an activity
 */
export async function updateActivity(activityId: string, updates: Partial<ActivityInsert>) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}

/**
 * Delete an activity
 */
export async function deleteActivity(activityId: string) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);
  if (error) throw error;
}

/**
 * Create a tag
 */
export async function createTag(params: {
  organizationId: string;
  name: string;
  color?: string;
}) {
  const { data, error } = await supabase
    .from('tags')
    .insert({
      organization_id: params.organizationId,
      name: params.name,
      color: params.color || '#3b82f6',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Tag;
}

/**
 * Update a tag
 */
export async function updateTag(tagId: string, updates: Partial<{ name: string; color: string }>) {
  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', tagId)
    .select()
    .single();

  if (error) throw error;
  return data as Tag;
}

/**
 * Delete a tag
 */
export async function deleteTag(tagId: string) {
  const { error } = await supabase.from('tags').delete().eq('id', tagId);
  if (error) throw error;
}

/**
 * Add tag to contact
 */
export async function addTagToContact(params: { contactId: string; tagId: string }) {
  const { error } = await supabase.from('contact_tags').insert({
    contact_id: params.contactId,
    tag_id: params.tagId,
  });

  if (error) throw error;
}

/**
 * Remove tag from contact
 */
export async function removeTagFromContact(params: { contactId: string; tagId: string }) {
  const { error } = await supabase
    .from('contact_tags')
    .delete()
    .eq('contact_id', params.contactId)
    .eq('tag_id', params.tagId);

  if (error) throw error;
}

/**
 * Update or create lead score
 */
export async function upsertLeadScore(params: {
  organizationId: string;
  contactId: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    engagement: number;
    demographics: number;
    behavior: number;
    timing: number;
  };
}) {
  const { data, error } = await supabase
    .from('lead_scores')
    .upsert({
      organization_id: params.organizationId,
      contact_id: params.contactId,
      score: params.score,
      grade: params.grade,
      factors: params.factors,
      last_calculated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
