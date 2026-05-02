import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { MODULES, type ModuleId, type ModuleDefinition } from '../lib/registry';

export type { ModuleId, ModuleDefinition };

interface FeatureContextType {
  isModuleEnabled: (moduleId: ModuleId) => boolean;
  getModule: (moduleId: ModuleId) => ModuleDefinition | undefined;
  availableModules: ModuleDefinition[];
  enabledModules: Record<string, boolean>;
  setEnabledModules: (modules: Record<string, boolean>) => Promise<void>;
  isLoading: boolean;
}

const FeatureContext = createContext<FeatureContextType | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentOrganization } = useAuth();
  const [enabledModules, setEnabledModulesState] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization settings when organization changes
  useEffect(() => {
    if (!currentOrganization?.id) {
      setEnabledModulesState({});
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await (supabase
          .from('organization_settings')
          .select('enabled_modules')
          .eq('organization_id', currentOrganization.id)
          .single() as any);

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching organization settings:', error);
        }

        if (data?.enabled_modules && typeof data.enabled_modules === 'object') {
          setEnabledModulesState(data.enabled_modules as Record<string, boolean>);
        } else {
          setEnabledModulesState({});
        }
      } catch (err) {
        console.error('Failed to fetch organization settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [currentOrganization?.id]);

  const isModuleEnabled = (moduleId: ModuleId): boolean => {
    const module = MODULES[moduleId];
    if (!module) return false;

    // Core modules are always enabled regardless of settings
    if (module.isCore) return true;

    if (!currentOrganization) return false;

    // Check organization settings
    // If the module is explicitly disabled, return false
    // If the module is not in settings at all, default to enabled (for development)
    if (moduleId in enabledModules) {
      return enabledModules[moduleId] === true;
    }

    // Default: enabled for modules not explicitly configured
    return true;
  };

  const getModule = (moduleId: ModuleId) => MODULES[moduleId];

  const setEnabledModules = async (modules: Record<string, boolean>) => {
    if (!currentOrganization?.id) return;

    try {
      const { error } = await (supabase
        .from('organization_settings')
        .update({ enabled_modules: modules as any, updated_at: new Date().toISOString() })
        .eq('organization_id', currentOrganization.id) as any);

      if (error) throw error;
      setEnabledModulesState(modules);
    } catch (err) {
      console.error('Failed to save module settings:', err);
      throw err;
    }
  };

  return (
    <FeatureContext.Provider value={{
      isModuleEnabled,
      getModule,
      availableModules: Object.values(MODULES),
      enabledModules,
      setEnabledModules,
      isLoading,
    }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeature must be used within a FeatureProvider');
  }
  return context;
};
