import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentRole: 'owner' | 'admin' | 'member' | null;
  organizationId: string | null;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithGithub: (redirectTo?: string) => Promise<{ data: any; error: any }>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ data: any; error: any }>;
  signInWithMagicLink: (email: string, redirectTo?: string) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [memberships, setMemberships] = useState<{ role: string, organization_id: string }[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentRole = currentOrganization 
    ? (memberships.find(m => m.organization_id === currentOrganization.id)?.role as 'owner' | 'admin' | 'member' | null) 
    : null;

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndOrgs(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndOrgs(session.user.id);
      } else {
        setProfile(null);
        setOrganizations([]);
        setMemberships([]);
        setCurrentOrganization(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfileAndOrgs = async (userId: string) => {
    try {
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch Orgs via Memberships
      const { data: membershipsData, error: membershipError } = await supabase
        .from('memberships')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            slug,
            owner_id,
            created_at
          )
        `)
        .eq('user_id', userId);

      if (membershipError) {
        console.error('Error fetching memberships:', membershipError);
      } else if (membershipsData) {
        // Update memberships state
        setMemberships(membershipsData.map((m: any) => ({
          role: m.role,
          organization_id: m.organization_id
        })));

        // @ts-ignore
        const orgs = membershipsData.map((m: any) => m.organizations).filter(Boolean) as Organization[];
        setOrganizations(orgs);
        
        if (orgs.length > 0 && !currentOrganization) {
          setCurrentOrganization(orgs[0]);
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
     return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
          avatar_url: `https://ui-avatars.com/api/?name=${email.split('@')[0]}`,
        },
      },
    });
  };

  const signInWithGithub = async (redirectTo?: string) => {
    return await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectTo ?? `${window.location.origin}/onboarding`,
      },
    });
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo ?? `${window.location.origin}/onboarding`,
      },
    });
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  };

  const signInWithMagicLink = async (email: string, redirectTo?: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo ?? `${window.location.origin}/dashboard`,
      },
    });
  };

  const hasCompletedOnboarding = organizations.length > 0;

  return (
    <AuthContext.Provider value={{ user, session, profile, organizations, currentOrganization, currentRole, organizationId: currentOrganization?.id ?? null, isLoading, hasCompletedOnboarding, signOut, signIn, signUp, signInWithGithub, signInWithGoogle, signInWithMagicLink, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
