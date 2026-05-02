import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Building2, Users, MailPlus, X, Loader2 } from 'lucide-react';

interface ProfileData {
  full_name: string;
  job_title: string;
  company_size: string;
  industry: string;
}

interface OrganizationData {
  name: string;
  slug: string;
  type: string;
  timezone: string;
  id?: string;
}

interface TeamInvitation {
  email: string;
  role: 'admin' | 'member';
}

const STEPS = ['Welcome', 'Profile', 'Organization', 'Team'];

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, isLoading, hasCompletedOnboarding } = useAuth();
  const intent = searchParams.get('intent');
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: profile?.full_name || user?.user_metadata?.full_name || '',
    job_title: '',
    company_size: '',
    industry: '',
  });
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: '',
    slug: '',
    type: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState<'admin' | 'member'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && hasCompletedOnboarding) {
      navigate(intent === 'audit' ? '/audit?continue=1' : '/dashboard', { replace: true });
    }
  }, [isLoading, hasCompletedOnboarding, navigate, intent]);

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth', { replace: true });
  }, [isLoading, user, navigate]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleOrgNameChange = (name: string) => {
    setOrganizationData(prev => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const addInvitation = () => {
    if (!newInviteEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newInviteEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (invitations.some(inv => inv.email === newInviteEmail)) {
      setError('This email has already been invited');
      return;
    }
    setInvitations([...invitations, { email: newInviteEmail, role: newInviteRole }]);
    setNewInviteEmail('');
    setError(null);
  };

  const removeInvitation = (email: string) =>
    setInvitations(invitations.filter(inv => inv.email !== email));

  const updateProfile = async () => {
    if (!user) return { error: { message: 'Not authenticated' } };
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: profileData.full_name,
        job_title: profileData.job_title,
        company_size: profileData.company_size,
        industry: profileData.industry,
      })
      .eq('id', user.id);
    return { error };
  };

  const createOrganization = async () => {
    if (!user) return { error: { message: 'Not authenticated' } };
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', organizationData.slug)
      .single();
    if (existingOrg) return { error: { message: 'This workspace URL is already taken.' } };

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationData.name,
        slug: organizationData.slug,
        owner_id: user.id,
        type: organizationData.type,
        timezone: organizationData.timezone,
      })
      .select()
      .single();
    if (orgError) return { error: orgError };

    const { error: memberError } = await supabase
      .from('memberships')
      .insert({ user_id: user.id, organization_id: orgData.id, role: 'owner' });
    if (memberError) return { error: memberError };

    return { data: orgData, error: null };
  };

  const sendInvitations = async (orgId: string) => {
    if (invitations.length === 0) return { error: null };
    const results = await Promise.all(
      invitations.map(inv =>
        supabase.from('invitations').insert({
          organization_id: orgId,
          email: inv.email,
          role: inv.role,
          invited_by: user?.id,
          token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
      )
    );
    return { error: results.find(r => r.error)?.error };
  };

  const handleNext = async () => {
    setError(null);
    setLoading(true);

    if (currentStep === 1) {
      const { error } = await updateProfile();
      if (error) { setError(error.message); setLoading(false); return; }
    } else if (currentStep === 2) {
      if (!organizationData.name || !organizationData.slug || !organizationData.type) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      const { data, error } = await createOrganization();
      if (error) { setError(error.message); setLoading(false); return; }
      if (data) setOrganizationData(prev => ({ ...prev, ...data }));
    } else if (currentStep === 3) {
      const orgId = organizationData.id;
      if (orgId && invitations.length > 0) {
        const { error } = await sendInvitations(orgId);
        if (error) setError('Failed to send some invitations. You can invite team members later.');
      }
      navigate(intent === 'audit' ? '/audit?continue=1' : '/dashboard', { replace: true });
      return;
    }

    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, 3));
    setLoading(false);
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError(null);
  };

  const handleSkip = () => navigate(intent === 'audit' ? '/audit?continue=1' : '/dashboard', { replace: true });

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 40 : -40, opacity: 0 }),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090a] text-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1c20_1px,transparent_1px),linear-gradient(to_bottom,#1a1c20_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.1em] text-white uppercase">FlowStack</span>
          </Link>

          <div className="space-y-8">
            <h2
              className="text-4xl leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}
            >
              Let's get<br />you set up
            </h2>
            <p className="text-[#6b7280] text-base">
              Complete your profile in a few steps and unlock the full power of FlowStack.
            </p>

            <div className="space-y-3">
              {[
                { icon: Sparkles, title: 'Complete your profile', desc: 'Tell us about yourself' },
                { icon: Building2, title: 'Create your workspace', desc: 'Set up your organization' },
                { icon: Users, title: 'Invite your team', desc: 'Collaborate seamlessly' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "flex items-start gap-4 p-4 border transition-colors",
                    idx <= currentStep ? "border-[#2a2d35] bg-[#0c0d0e]" : "border-transparent opacity-40"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    idx < currentStep ? "bg-emerald-500/10 text-emerald-400" :
                    idx === currentStep ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-[#1a1c20] text-[#4b5563]"
                  )}>
                    {idx < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <item.icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-[#4b5563]">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-lg relative z-10">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
              <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
            </svg>
            <span className="text-sm font-semibold tracking-[0.1em] text-white uppercase">FlowStack</span>
          </Link>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-center gap-2">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors",
                      idx < currentStep ? "bg-[#d4af37] text-[#08090a]" :
                      idx === currentStep ? "bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40" :
                      "bg-[#1a1c20] text-[#4b5563]"
                    )}>
                      {idx < currentStep ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-xs transition-colors hidden sm:inline",
                      idx <= currentStep ? "text-white" : "text-[#4b5563]"
                    )}>
                      {step}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={cn(
                      "flex-1 h-px transition-colors",
                      idx < currentStep ? "bg-[#d4af37]/40" : "bg-[#1a1c20]"
                    )} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-[#d4af37]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-medium text-white mb-2">Welcome to FlowStack</h1>
                    <p className="text-sm text-[#6b7280]">
                      You're just a few steps away from streamlining your business.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {['CRM & Pipelines', 'Workflow Automation', 'Email Marketing', 'AI Agents'].map((f) => (
                      <div key={f} className="p-3 border border-[#2a2d35] text-xs font-medium text-[#9ca3af]">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-xl font-medium text-white mb-1">Complete your profile</h1>
                    <p className="text-sm text-[#6b7280]">Tell us a bit about yourself</p>
                  </div>
                  <div className="space-y-4">
                    <InputUntitled
                      label="Full Name"
                      id="fullName"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                    <InputUntitled
                      label="Job Title"
                      id="jobTitle"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder="Marketing Manager"
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#9ca3af]">Company Size</label>
                      <select
                        value={profileData.company_size}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company_size: e.target.value }))}
                        className="w-full h-10 px-4 rounded-lg border border-[#2a2d35] bg-transparent text-white text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                      >
                        <option value="" className="bg-[#1c1c1f]">Select size</option>
                        <option value="1" className="bg-[#1c1c1f]">Just me</option>
                        <option value="2-10" className="bg-[#1c1c1f]">2-10</option>
                        <option value="11-50" className="bg-[#1c1c1f]">11-50</option>
                        <option value="51-200" className="bg-[#1c1c1f]">51-200</option>
                        <option value="201-500" className="bg-[#1c1c1f]">201-500</option>
                        <option value="500+" className="bg-[#1c1c1f]">500+</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#9ca3af]">Industry</label>
                      <select
                        value={profileData.industry}
                        onChange={(e) => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full h-10 px-4 rounded-lg border border-[#2a2d35] bg-transparent text-white text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                      >
                        <option value="" className="bg-[#1c1c1f]">Select industry</option>
                        <option value="agency" className="bg-[#1c1c1f]">Agency</option>
                        <option value="saas" className="bg-[#1c1c1f]">SaaS</option>
                        <option value="ecommerce" className="bg-[#1c1c1f]">E-commerce</option>
                        <option value="consulting" className="bg-[#1c1c1f]">Consulting</option>
                        <option value="education" className="bg-[#1c1c1f]">Education</option>
                        <option value="healthcare" className="bg-[#1c1c1f]">Healthcare</option>
                        <option value="finance" className="bg-[#1c1c1f]">Finance</option>
                        <option value="other" className="bg-[#1c1c1f]">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-xl font-medium text-white mb-1">Create your workspace</h1>
                    <p className="text-sm text-[#6b7280]">Set up your organization</p>
                  </div>
                  <div className="space-y-4">
                    <InputUntitled
                      label="Organization Name *"
                      id="orgName"
                      value={organizationData.name}
                      onChange={(e) => handleOrgNameChange(e.target.value)}
                      placeholder="Acme Corp"
                      required
                    />
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#9ca3af]">Workspace URL *</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 h-10 rounded-l-lg border border-r-0 border-[#2a2d35] bg-[#0c0d0e] text-[#4b5563] text-sm">
                          flowstack.app/
                        </span>
                        <input
                          value={organizationData.slug}
                          onChange={(e) => setOrganizationData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                          placeholder="acme-corp"
                          className="flex-1 h-10 px-4 rounded-r-lg border border-[#2a2d35] bg-transparent text-white text-sm placeholder:text-[#4b5563] focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                          required
                        />
                      </div>
                      <p className="text-[10px] text-[#4b5563]">Your unique workspace URL. Letters, numbers, and hyphens only.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#9ca3af]">Organization Type *</label>
                      <select
                        value={organizationData.type}
                        onChange={(e) => setOrganizationData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full h-10 px-4 rounded-lg border border-[#2a2d35] bg-transparent text-white text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                        required
                      >
                        <option value="" className="bg-[#1c1c1f]">Select type</option>
                        <option value="agency" className="bg-[#1c1c1f]">Agency</option>
                        <option value="saas" className="bg-[#1c1c1f]">SaaS</option>
                        <option value="ecommerce" className="bg-[#1c1c1f]">E-commerce</option>
                        <option value="consulting" className="bg-[#1c1c1f]">Consulting</option>
                        <option value="other" className="bg-[#1c1c1f]">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm text-[#9ca3af]">Timezone</label>
                      <select
                        value={organizationData.timezone}
                        onChange={(e) => setOrganizationData(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full h-10 px-4 rounded-lg border border-[#2a2d35] bg-transparent text-white text-sm focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                      >
                        {Intl.supportedValuesOf('timeZone').map((tz) => (
                          <option key={tz} value={tz} className="bg-[#1c1c1f]">{tz}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div>
                    <h1 className="text-xl font-medium text-white mb-1">Invite your team</h1>
                    <p className="text-sm text-[#6b7280]">Collaborate better with your team (optional)</p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newInviteEmail}
                      onChange={(e) => setNewInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addInvitation()}
                      placeholder="colleague@example.com"
                      className="flex-1 h-10 px-4 rounded-lg border border-[#2a2d35] bg-transparent text-white text-sm placeholder:text-[#4b5563] focus:outline-none focus:border-[#d4af37]/50 focus:ring-2 focus:ring-[#d4af37]/10 transition-all"
                    />
                    <select
                      value={newInviteRole}
                      onChange={(e) => setNewInviteRole(e.target.value as 'admin' | 'member')}
                      className="h-10 px-3 rounded-lg border border-[#2a2d35] bg-transparent text-white text-sm focus:outline-none focus:border-[#d4af37]/50 transition-all"
                    >
                      <option value="member" className="bg-[#1c1c1f]">Member</option>
                      <option value="admin" className="bg-[#1c1c1f]">Admin</option>
                    </select>
                    <ButtonUntitled variant="outline" size="md" onClick={addInvitation}>
                      <MailPlus className="w-4 h-4" />
                    </ButtonUntitled>
                  </div>
                  {invitations.length > 0 && (
                    <div className="space-y-2">
                      {invitations.map((inv) => (
                        <div key={inv.email} className="flex items-center justify-between p-3 border border-[#2a2d35]">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                              <span className="text-[10px] font-semibold text-[#d4af37]">{inv.email.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm text-white">{inv.email}</p>
                              <p className="text-[10px] text-[#4b5563] capitalize">{inv.role}</p>
                            </div>
                          </div>
                          <button onClick={() => removeInvitation(inv.email)} className="p-1 text-[#4b5563] hover:text-white transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/5 text-sm text-red-400 mt-4">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8">
            <ButtonUntitled variant="ghost" onClick={handleBack} disabled={currentStep === 0 || loading}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </ButtonUntitled>
            <div className="flex gap-3">
              {currentStep === 3 && (
                <ButtonUntitled variant="ghost" onClick={handleSkip} disabled={loading}>
                  Skip for now
                </ButtonUntitled>
              )}
              <ButtonUntitled
                variant="primary"
                onClick={handleNext}
                disabled={
                  loading ||
                  (currentStep === 2 && (!organizationData.name || !organizationData.slug || !organizationData.type))
                }
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : currentStep === 3 ? (
                  <><span>Complete</span><CheckCircle2 className="w-4 h-4" /></>
                ) : (
                  <><span>Next</span><ArrowRight className="w-4 h-4" /></>
                )}
              </ButtonUntitled>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
