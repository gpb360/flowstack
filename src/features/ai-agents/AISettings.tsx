/**
 * AI Settings Page
 * Configure AI preferences and API keys
 */

import React, { useState, useEffect } from 'react';
import { Key, Shield, Palette } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { setApiKey, isConfigured } from '../../lib/ai/config';

interface UserPreferences {
  ai_assistance_enabled: boolean;
  command_bar_suggestions: boolean;
  smart_notifications: boolean;
  auto_suggestions: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export function AISettings() {
  const { user, currentOrganization } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    ai_assistance_enabled: true,
    command_bar_suggestions: true,
    smart_notifications: true,
    auto_suggestions: false,
    theme: 'auto',
  });
  const [apiKey, setApiKeyState] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadPreferences();
    checkApiKey();
  }, [user, currentOrganization]);

  const loadPreferences = async () => {
    if (!user || !currentOrganization) return;

    try {
      const { data, error } = await (supabase.rpc as any)(
        'get_or_create_user_preferences',
        {
          p_user_id: user.id,
          p_organization_id: currentOrganization.id,
        }
      );

      if (error) throw error;

      if (data) {
        setPreferences({
          ai_assistance_enabled: data.ai_assistance_enabled ?? true,
          command_bar_suggestions: data.command_bar_suggestions ?? true,
          smart_notifications: data.smart_notifications ?? true,
          auto_suggestions: data.auto_suggestions ?? false,
          theme: data.theme ?? 'auto',
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const checkApiKey = () => {
    try {
      const hasKey = isConfigured();
      setApiKeyState(hasKey ? '••••••••••••' : '');
    } catch {
      setApiKeyState('');
    }
  };

  const handleSavePreferences = async () => {
    if (!user || !currentOrganization) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          organization_id: currentOrganization.id,
          ai_assistance_enabled: preferences.ai_assistance_enabled,
          command_bar_suggestions: preferences.command_bar_suggestions,
          smart_notifications: preferences.smart_notifications,
          auto_suggestions: preferences.auto_suggestions,
          theme: preferences.theme,
        } as any);

      if (error) throw error;

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyState(e.target.value);
  };

  const handleSaveApiKey = () => {
    if (apiKey.startsWith('sk-ant-')) {
      setApiKey(apiKey);
      setApiKeyState('••••••••••••');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Settings</h2>
        <p className="text-text-muted">Configure your AI preferences and API settings</p>
      </div>

      {/* API Configuration */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">API Configuration</h3>
            <p className="text-sm text-text-muted">Configure your Claude API key</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Claude API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-ant-..."
                className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Save Key
              </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Anthropic Console
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* AI Features */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold">AI Features</h3>
            <p className="text-sm text-text-muted">Control AI behavior and assistance</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">AI Assistance</div>
              <div className="text-sm text-text-muted">Enable AI-powered suggestions and assistance</div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, ai_assistance_enabled: !prev.ai_assistance_enabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.ai_assistance_enabled ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.ai_assistance_enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Command Bar Suggestions</div>
              <div className="text-sm text-text-muted">Show AI-powered suggestions in command bar</div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, command_bar_suggestions: !prev.command_bar_suggestions }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.command_bar_suggestions ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.command_bar_suggestions ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Smart Notifications</div>
              <div className="text-sm text-text-muted">Receive proactive AI notifications</div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, smart_notifications: !prev.smart_notifications }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.smart_notifications ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.smart_notifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto Suggestions</div>
              <div className="text-sm text-text-muted">Automatically suggest actions based on context</div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, auto_suggestions: !prev.auto_suggestions }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.auto_suggestions ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  preferences.auto_suggestions ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Palette className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-semibold">Appearance</h3>
            <p className="text-sm text-text-muted">Customize the AI interface</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={preferences.theme}
            onChange={e => setPreferences(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' | 'auto' }))}
            className="px-4 py-2 bg-background border border-border rounded-lg"
          >
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSavePreferences}
          disabled={isSaving}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>

        {saveStatus === 'success' && (
          <span className="text-sm text-green-500">Settings saved successfully</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-sm text-red-500">Failed to save settings</span>
        )}
      </div>
    </div>
  );
}
