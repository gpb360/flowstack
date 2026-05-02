-- ============================================================================
-- M001: Fix RLS policies for onboarding flow
-- The init.sql only created SELECT policies. The app needs INSERT/UPDATE
-- on user_profiles, organizations, memberships, and invitations.
-- ============================================================================

-- user_profiles: allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- organizations: allow users to create organizations (they become owner)
CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- organizations: allow owners to update their org
CREATE POLICY "Owners can update organizations" ON public.organizations
  FOR UPDATE USING (auth.uid() = owner_id);

-- memberships: allow users to create their own membership
CREATE POLICY "Users can create their own membership" ON public.memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- memberships: allow users to view their own memberships
CREATE POLICY "Users can view their own memberships" ON public.memberships
  FOR SELECT USING (auth.uid() = user_id);

-- memberships: allow admins/owners to manage memberships in their org
CREATE POLICY "Owners and admins can manage memberships" ON public.memberships
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.memberships
      WHERE organization_id = public.memberships.organization_id
      AND role IN ('owner', 'admin')
    )
  );

-- invitations: allow owners/admins to create invitations
CREATE POLICY "Owners and admins can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.memberships
      WHERE organization_id = public.invitations.organization_id
      AND role IN ('owner', 'admin')
    )
  );
