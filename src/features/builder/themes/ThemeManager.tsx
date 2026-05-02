import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import { supabase } from '@/lib/supabase';
import { useBuilderStore } from '../stores/useBuilderStore';
import type { Theme } from '../types';
import {
  Palette,
  Type,
  Check,
  Plus,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// THEME MANAGER - Site theme management
// ============================================================================

const PREDEFINED_THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#000000',
      card: '#ffffff',
      'card-foreground': '#000000',
      border: '#e5e7eb',
      muted: '#f3f4f6',
      'muted-foreground': '#6b7280',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      accent: '#3b82f6',
      background: '#09090b',
      foreground: '#fafafa',
      card: '#18181b',
      'card-foreground': '#fafafa',
      border: '#27272a',
      muted: '#27272a',
      'muted-foreground': '#a1a1aa',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0c4a6e',
      secondary: '#0369a1',
      accent: '#06b6d4',
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      card: '#ffffff',
      'card-foreground': '#0c4a6e',
      border: '#bae6fd',
      muted: '#e0f2fe',
      'muted-foreground': '#075985',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
  },
];

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Merriweather',
  'Playfair Display',
];

export const ThemeManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentSite, updateSiteSettings } = useBuilderStore();

  const [selectedTheme, setSelectedTheme] = useState<Theme>(PREDEFINED_THEMES[0]);
  const [customColors, setCustomColors] = useState<Record<string, string>>(selectedTheme.colors);
  const [customFonts, setCustomFonts] = useState<Record<string, string>>(selectedTheme.fonts);
  const [themeTab, setThemeTab] = useState('preset');

  // Apply theme mutation
  const applyThemeMutation = useMutation({
    mutationFn: async (theme: Theme) => {
      if (!currentSite?.id) throw new Error('No site selected');

      const { error } = await supabase
        .from('sites')
        .update({
          settings: {
            theme: theme,
          },
        })
        .eq('id', currentSite.id);

      if (error) throw error;
      return theme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  const handleApplyTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
    setCustomFonts(theme.fonts);
    applyThemeMutation.mutate(theme);
  };

  const handleColorChange = (key: string, value: string) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
  };

  const handleFontChange = (key: string, value: string) => {
    const newFonts = { ...customFonts, [key]: value };
    setCustomFonts(newFonts);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Theme Manager</h2>
        <p className="text-muted-foreground">Customize your site's appearance</p>
      </div>

      <TabsWithContent
        activeTab={themeTab}
        onTabChange={setThemeTab}
        tabs={[
          {
            id: 'preset',
            label: 'Preset Themes',
            icon: Palette,
            content: (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PREDEFINED_THEMES.map((theme) => (
                  <CardUntitled
                    key={theme.id}
                    className={cn(
                      'cursor-pointer hover:shadow-lg transition-all',
                      selectedTheme.id === theme.id && 'ring-2 ring-primary'
                    )}
                    onClick={() => handleApplyTheme(theme)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{theme.name}</CardTitle>
                        {selectedTheme.id === theme.id && (
                          <BadgeUntitled className="bg-green-100 text-green-800">
                            <Check size={14} className="mr-1" />
                            Active
                          </BadgeUntitled>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Color Swatches */}
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(theme.colors).slice(0, 6).map(([key, value]) => (
                          <div
                            key={key}
                            className="w-8 h-8 rounded border border-gray-200"
                            style={{ backgroundColor: value }}
                            title={key}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </CardUntitled>
                ))}
              </div>
            ),
          },
          {
            id: 'custom',
            label: 'Custom Theme',
            icon: Type,
            content: (
              <div className="space-y-6">
                {/* Colors */}
                <CardUntitled>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette size={18} />
                      Colors
                    </CardTitle>
                    <CardDescription>Customize your color palette</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(customColors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className="text-xs capitalize">{key.replace(/-/g, ' ')}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="w-10 h-10 rounded cursor-pointer border"
                            />
                            <InputUntitled
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="flex-1 font-mono text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CardUntitled>

                {/* Typography */}
                <CardUntitled>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Type size={18} />
                      Typography
                    </CardTitle>
                    <CardDescription>Customize fonts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label>Heading Font</label>
                        <select
                          value={customFonts.heading}
                          onChange={(e) => handleFontChange('heading', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font} value={font}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label>Body Font</label>
                        <select
                          value={customFonts.body}
                          onChange={(e) => handleFontChange('body', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font} value={font}>
                              {font}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </CardUntitled>

                {/* Actions */}
                <div className="flex gap-2">
                  <ButtonUntitled onClick={() => applyThemeMutation.mutate(selectedTheme)}>
                    Apply Custom Theme
                  </ButtonUntitled>
                  <ButtonUntitled variant="outline">
                    <Copy size={18} className="mr-2" />
                    Duplicate Theme
                  </ButtonUntitled>
                  <ButtonUntitled variant="outline">
                    <Plus size={18} className="mr-2" />
                    Save as New Theme
                  </ButtonUntitled>
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
