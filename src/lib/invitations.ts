import { supabase } from './supabase';

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired';
  token: string;
  expires_at: string;
  created_at: string;
}

export interface InvitationWithDetails extends Invitation {
  organization_name?: string;
  inviter_name?: string;
}

/**
 * Generate a unique token for invitation
 */
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Create a new invitation for a team member
 * @param organizationId - The ID of the organization
 * @param email - Email address of the person to invite
 * @param role - Role to assign (admin or member)
 * @param invitedBy - User ID of the person sending the invitation
 * @returns The created invitation or error
 */
export async function createInvitation(
  organizationId: string,
  email: string,
  role: 'admin' | 'member',
  invitedBy: string
): Promise<{ data: Invitation | null; error: any }> {
  // Check if invitation already exists for this email and org
  const { data: existing } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (existing) {
    return {
      data: null,
      error: { message: 'An invitation has already been sent to this email address.' }
    };
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('memberships')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', invitedBy)
    .single();

  if (!existingMember) {
    return {
      data: null,
      error: { message: 'You must be a member of this organization to send invitations.' }
    };
  }

  // Generate token and set expiry (7 days)
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email,
      role,
      invited_by: invitedBy,
      token,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error };
  }

  // Send invitation email (via Edge Function or email service)
  await sendInvitationEmail(email, token, data.organization_id);

  return { data, error: null };
}

/**
 * Send invitation email to the recipient
 * This would typically call a Supabase Edge Function
 * @param email - Recipient email
 * @param token - Invitation token
 * @param organizationId - Organization ID for fetching name
 */
async function sendInvitationEmail(
  email: string,
  token: string,
  organizationId: string
): Promise<{ success: boolean; error?: any }> {
  // Fetch organization name
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single();

  const orgName = org?.name || 'FlowStack Organization';

  // Call Supabase Edge Function to send email
  // This assumes you have an Edge Function set up for sending emails
  try {
    const { error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        email,
        token,
        organizationName: orgName,
        inviteUrl: `${window.location.origin}/invite/${token}`,
      },
    });

    if (error) {
      console.error('Failed to send invitation email:', error);
      // For development, log the invite URL
      console.log(`Invitation URL: ${window.location.origin}/invite/${token}`);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    // For development, log the invite URL
    console.log(`Invitation URL: ${window.location.origin}/invite/${token}`);
    return { success: false, error };
  }
}

/**
 * Get invitation details by token
 * Used on the invitation acceptance page
 * @param token - Invitation token
 * @returns Invitation details with organization and inviter info
 */
export async function getInvitationByToken(
  token: string
): Promise<{ data: InvitationWithDetails | null; error: any }> {
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      organizations (
        name,
        slug
      ),
      user_profiles!invitations_invited_by_fkey (
        full_name
      )
    `)
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (error) {
    return { data: null, error };
  }

  // Check if invitation has expired
  if (new Date(data.expires_at) < new Date()) {
    // Update status to expired
    await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('token', token);

    return { data: null, error: { message: 'This invitation has expired.' } };
  }

  // Transform data to include organization name and inviter name
  const invitation: InvitationWithDetails = {
    ...data,
    organization_name: (data.organizations as any)?.name,
    inviter_name: (data.user_profiles as any)?.full_name,
  };

  return { data: invitation, error: null };
}

/**
 * Accept an invitation and create membership
 * @param token - Invitation token
 * @param userId - User ID accepting the invitation
 * @returns Success or error
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: any; organizationId?: string }> {
  // Get invitation details
  const { data: invitation, error: fetchError } = await getInvitationByToken(token);

  if (fetchError || !invitation) {
    return { success: false, error: fetchError || { message: 'Invalid invitation token.' } };
  }

  // Check if user's email matches the invitation email
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (profile?.email !== invitation.email) {
    return { success: false, error: { message: 'This invitation is for a different email address.' } };
  }

  // Check if user is already a member
  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('organization_id', invitation.organization_id)
    .single();

  if (existingMembership) {
    // Update invitation status to accepted anyway
    await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('token', token);

    return { success: true, organizationId: invitation.organization_id };
  }

  // Create membership
  const { error: memberError } = await supabase
    .from('memberships')
    .insert({
      user_id: userId,
      organization_id: invitation.organization_id,
      role: invitation.role,
    });

  if (memberError) {
    return { success: false, error: memberError };
  }

  // Update invitation status
  await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('token', token);

  return { success: true, organizationId: invitation.organization_id };
}

/**
 * Get all pending invitations for an organization
 * @param organizationId - Organization ID
 * @returns List of pending invitations
 */
export async function getPendingInvitations(
  organizationId: string
): Promise<{ data: Invitation[] | null; error: any }> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Delete (cancel) an invitation
 * @param invitationId - Invitation ID
 * @returns Success or error
 */
export async function deleteInvitation(
  invitationId: string
): Promise<{ success: boolean; error: any }> {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId);

  return { success: !error, error };
}

/**
 * Re-send an invitation email
 * @param invitationId - Invitation ID
 * @returns Success or error
 */
export async function resendInvitation(
  invitationId: string
): Promise<{ success: boolean; error: any }> {
  // Get invitation details
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (error || !invitation) {
    return { success: false, error };
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    // Update expiry and resend
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('invitations')
      .update({ expires_at: newExpiresAt })
      .eq('id', invitationId);
  }

  // Send email
  await sendInvitationEmail(invitation.email, invitation.token, invitation.organization_id);

  return { success: true, error: null };
}

/**
 * Clean up expired invitations
 * Should be run periodically (e.g., via cron job)
 * @returns Number of invitations cleaned up
 */
export async function cleanupExpiredInvitations(): Promise<{ count: number; error: any }> {
  const { data, error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .lt('expires_at', new Date().toISOString())
    .eq('status', 'pending')
    .select();

  return { count: data?.length || 0, error };
}
