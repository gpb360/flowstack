import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFeature } from '@/context/FeatureContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import { MODULES, type ModuleId } from '@/lib/registry';
import { Building2, User, Puzzle, Loader2, Save } from 'lucide-react';
import { TabsUntitled, type Tab } from '@/components/ui/tabs-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';

// ============================================================================
// Organization Settings Tab
// ============================================================================

function OrgSettingsTab() {
  const { currentOrganization } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(currentOrganization?.name || '');
  const [slug, setSlug] = useState(currentOrganization?.slug || '');
  const [timezone, setTimezone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!currentOrganization?.id) return;
    setSaving(true);
    try {
      const { error } = await (supabase
        .from('organizations')
        .update({ name, slug, updated_at: new Date().toISOString() })
        .eq('id', currentOrganization.id) as any);

      if (error) throw error;

      // Also update org settings
      const { error: settingsError } = await (supabase
        .from('organization_settings')
        .update({ default_timezone: timezone, default_currency: currency, updated_at: new Date().toISOString() })
        .eq('organization_id', currentOrganization.id) as any);

      if (settingsError) throw settingsError;

      addToast({ title: 'Organization settings saved', variant: 'success', duration: 3000 });
    } catch (err: any) {
      addToast({ title: 'Failed to save settings', description: err.message, variant: 'destructive', duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Organization Name</label>
          <InputUntitled value={name} onChange={(e: any) => setName(e.target.value)} placeholder="My Organization" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Slug</label>
          <InputUntitled value={slug} onChange={(e: any) => setSlug(e.target.value)} placeholder="my-organization" />
          <p className="text-xs text-text-muted mt-1">Used in URLs: flowstack.io/{slug}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Timezone</label>
            <InputUntitled value={timezone} onChange={(e: any) => setTimezone(e.target.value)} placeholder="UTC" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Currency</label>
            <InputUntitled value={currency} onChange={(e: any) => setCurrency(e.target.value)} placeholder="USD" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <ButtonUntitled
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </ButtonUntitled>
      </div>
    </div>
  );
}

// ============================================================================
// User Profile Tab
// ============================================================================

function UserProfileTab() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await (supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', user.id) as any);

      if (error) throw error;

      addToast({ title: 'Profile updated', variant: 'success', duration: 3000 });
    } catch (err: any) {
      addToast({ title: 'Failed to update profile', description: err.message, variant: 'destructive', duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
          {fullName?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <p className="text-xs text-text-muted">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Full Name</label>
          <InputUntitled value={fullName} onChange={(e: any) => setFullName(e.target.value)} placeholder="John Doe" />
        </div>
      </div>
      <div className="flex justify-end">
        <ButtonUntitled
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </ButtonUntitled>
      </div>
    </div>
  );
}

// ============================================================================
// Module Toggles Tab
// ============================================================================

function ModuleTogglesTab() {
  const { enabledModules, setEnabledModules } = useFeature();
  const { addToast } = useToast();
  const [localModules, setLocalModules] = useState<Record<string, boolean>>({ ...enabledModules });
  const [saving, setSaving] = useState(false);

  const moduleCategories = [
    { label: 'Core (always enabled)', ids: Object.entries(MODULES).filter(([, m]) => m.isCore).map(([id]) => id as ModuleId) },
    { label: 'Business', ids: ['crm'] as ModuleId[] },
    { label: 'Automation', ids: ['workflows', 'ai_agents', 'integrations'] as ModuleId[] },
    { label: 'Marketing', ids: ['email_marketing', 'sms_marketing', 'social_planner'] as ModuleId[] },
    { label: 'Builder', ids: ['site_builder', 'forms'] as ModuleId[] },
    { label: 'Communication', ids: ['chat_widget', 'phone_system', 'appointments'] as ModuleId[] },
    { label: 'Growth', ids: ['membership', 'reputation'] as ModuleId[] },
    { label: 'Analytics', ids: ['analytics'] as ModuleId[] },
  ];

  const toggleModule = (moduleId: ModuleId) => {
    const module = MODULES[moduleId];
    if (!module || module.isCore) return;
    setLocalModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setEnabledModules(localModules);
      addToast({ title: 'Module settings saved', variant: 'success', duration: 3000 });
    } catch (err: any) {
      addToast({ title: 'Failed to save module settings', description: err.message, variant: 'destructive', duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {moduleCategories.map((category) => (
        <div key={category.label}>
          <h3 className="text-sm font-medium text-text-muted mb-3">{category.label}</h3>
          <div className="space-y-2">
            {category.ids.map((id) => {
              const module = MODULES[id];
              if (!module) return null;
              const isEnabled = module.isCore ? true : (localModules[id] ?? true);
              const isCore = module.isCore;

              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <module.icon size={18} className={isEnabled ? 'text-primary' : 'text-text-muted'} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{module.name}</p>
                      <p className="text-xs text-text-muted">{module.description}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      disabled={isCore}
                      onChange={() => toggleModule(id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    {isCore && (
                      <span className="text-xs text-text-muted">Required</span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex justify-end">
        <ButtonUntitled
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          leftIcon={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </ButtonUntitled>
      </div>
    </div>
  );
}

// ============================================================================
// Settings Page
// ============================================================================

export function SettingsPage() {
  const tabs: Tab[] = [
    { id: 'org', label: 'Organization', icon: Building2 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'modules', label: 'Modules', icon: Puzzle },
  ];

  const [activeTab, setActiveTab] = React.useState('org');

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        <PageHeaderUntitled
          title="Settings"
          description="Manage your organization, profile, and module preferences"
        />

        <div className="mt-6">
          <TabsUntitled
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="pills"
            size="md"
          />
        </div>

        <div className="mt-6">
          {activeTab === 'org' && <OrgSettingsTab />}
          {activeTab === 'profile' && <UserProfileTab />}
          {activeTab === 'modules' && <ModuleTogglesTab />}
        </div>
      </div>
    </div>
  );
}
