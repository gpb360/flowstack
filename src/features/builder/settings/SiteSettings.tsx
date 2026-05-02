import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardUntitled, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card-untitled';
import { Switch } from '@/components/ui/switch';
import { AlertUntitled } from '@/components/ui/alert-untitled';
import { supabase } from '@/lib/supabase';
import { useBuilderStore } from '../stores/useBuilderStore';
import {
  Globe,
  Rocket,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// SITE SETTINGS - Site-wide configuration
// ============================================================================

interface SiteSettingsData {
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  customDomain?: string;
  sslVerified: boolean;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleTagManagerId?: string;
  customHeadCode?: string;
  customBodyCode?: string;
  publishDestination: 'vercel' | 'netlify' | 'custom';
  vercelApiKey?: string;
  netlifyApiKey?: string;
  customWebhook?: string;
  autoPublish: boolean;
}

export const SiteSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentSite } = useBuilderStore();

  // Fetch site settings
  const { data: siteData, isLoading } = useQuery({
    queryKey: ['site-settings', currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return null;

      const { data, error } = await (supabase as any)
        .from('sites')
        .select('*')
        .eq('id', currentSite.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentSite?.id,
  });

  // Form state
  const [settings, setSettings] = useState<SiteSettingsData>({
    name: siteData?.name || '',
    description: (siteData?.settings as any)?.description || '',
    logo: (siteData?.settings as any)?.logo || '',
    favicon: (siteData?.settings as any)?.favicon || '',
    customDomain: siteData?.custom_domain || '',
    sslVerified: (siteData?.settings as any)?.sslVerified || false,
    defaultMetaTitle: (siteData?.settings as any)?.defaultMetaTitle || '',
    defaultMetaDescription: (siteData?.settings as any)?.defaultMetaDescription || '',
    googleAnalyticsId: (siteData?.settings as any)?.googleAnalyticsId || '',
    facebookPixelId: (siteData?.settings as any)?.facebookPixelId || '',
    googleTagManagerId: (siteData?.settings as any)?.googleTagManagerId || '',
    customHeadCode: (siteData?.settings as any)?.customHeadCode || '',
    customBodyCode: (siteData?.settings as any)?.customBodyCode || '',
    publishDestination: (siteData?.settings as any)?.publishDestination || 'vercel',
    vercelApiKey: (siteData?.settings as any)?.vercelApiKey || '',
    netlifyApiKey: (siteData?.settings as any)?.netlifyApiKey || '',
    customWebhook: (siteData?.settings as any)?.customWebhook || '',
    autoPublish: (siteData?.settings as any)?.autoPublish || false,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettingsData>) => {
      if (!currentSite?.id) throw new Error('No site selected');

      const { data, error } = await (supabase as any)
        .from('sites')
        .update({
          name: newSettings.name || settings.name,
          custom_domain: newSettings.customDomain || settings.customDomain,
          settings: {
            ...siteData?.settings,
            ...newSettings,
          },
        })
        .eq('id', currentSite.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async () => {
      // Simulate domain verification
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { verified: true };
    },
    onSuccess: (data) => {
      setSettings((prev) => ({ ...prev, sslVerified: data.verified }));
    },
  });

  const handleSave = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!currentSite) {
    return (
      <AlertUntitled variant="info">
        Please select a site to manage settings.
      </AlertUntitled>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Settings</h2>
        <p className="text-muted-foreground">Manage your site configuration</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="publishing">Publishing</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <CardUntitled title="General Information" description="Basic site information">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <InputUntitled
                  id="site-name"
                  value={settings.name}
                  onChange={(e) => handleSave('name', e.target.value)}
                  placeholder="My Awesome Site"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={settings.description}
                  onChange={(e) => handleSave('description', e.target.value)}
                  placeholder="A brief description of your site"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Site Logo</Label>
                <div className="flex items-center gap-4">
                  {settings.logo && (
                    <img src={settings.logo} alt="Logo" className="h-12 w-auto" />
                  )}
                  <ButtonUntitled variant="secondary" size="sm">
                    <Upload size={16} className="mr-2" />
                    Upload Logo
                  </ButtonUntitled>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  {settings.favicon && (
                    <img src={settings.favicon} alt="Favicon" className="h-8 w-8" />
                  )}
                  <ButtonUntitled variant="secondary" size="sm">
                    <Upload size={16} className="mr-2" />
                    Upload Favicon
                  </ButtonUntitled>
                </div>
              </div>
            </div>
          </CardUntitled>
        </TabsContent>

        {/* Domain Tab */}
        <TabsContent value="domain" className="space-y-6">
          <CardUntitled title="Custom Domain" description="Connect your own domain">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain</Label>
                <div className="flex gap-2">
                  <InputUntitled
                    id="custom-domain"
                    value={settings.customDomain}
                    onChange={(e) => handleSave('customDomain', e.target.value)}
                    placeholder="www.example.com"
                  />
                  <ButtonUntitled
                    onClick={() => verifyDomainMutation.mutate()}
                    disabled={verifyDomainMutation.isPending || !settings.customDomain}
                  >
                    {verifyDomainMutation.isPending ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      'Verify'
                    )}
                  </ButtonUntitled>
                </div>
              </div>

              {settings.customDomain && (
                <AlertUntitled
                  variant={settings.sslVerified ? "success" : "warning"}
                  icon={settings.sslVerified
                    ? <CheckCircle className="h-4 w-4 text-green-600" />
                    : <XCircle className="h-4 w-4 text-red-600" />
                  }
                >
                  {settings.sslVerified
                    ? 'Domain verified and SSL is active'
                    : 'Domain verification pending. Configure your DNS records.'}
                </AlertUntitled>
              )}

              <div className="space-y-2">
                <Label>Default Subdomain</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                  <Globe size={16} className="text-gray-500" />
                  <code className="text-sm">{currentSite.subdomain || `${currentSite.name}.flowstack.app`}</code>
                </div>
              </div>
            </div>
          </CardUntitled>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <CardUntitled>
            <CardHeader>
              <CardTitle>Default SEO Settings</CardTitle>
              <CardDescription>Default meta tags for all pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-title">Default Meta Title Template</Label>
                <InputUntitled
                  id="default-title"
                  value={settings.defaultMetaTitle}
                  onChange={(e) => handleSave('defaultMetaTitle', e.target.value)}
                  placeholder="{{pageTitle}} | {{siteName}}"
                />
                <p className="text-xs text-gray-500">
                  Use {'{{pageTitle}}'} and {'{{siteName}}'} as placeholders
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-description">Default Meta Description</Label>
                <Textarea
                  id="default-description"
                  value={settings.defaultMetaDescription}
                  onChange={(e) => handleSave('defaultMetaDescription', e.target.value)}
                  placeholder="A default description for your pages"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Google Analytics</Label>
                <InputUntitled
                  value={settings.googleAnalyticsId}
                  onChange={(e) => handleSave('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>Facebook Pixel ID</Label>
                <InputUntitled
                  value={settings.facebookPixelId}
                  onChange={(e) => handleSave('facebookPixelId', e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label>Google Tag Manager ID</Label>
                <InputUntitled
                  value={settings.googleTagManagerId}
                  onChange={(e) => handleSave('googleTagManagerId', e.target.value)}
                  placeholder="GTM-XXXXXX"
                />
              </div>
            </CardContent>
          </CardUntitled>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <CardUntitled>
            <CardHeader>
              <CardTitle>Custom Code</CardTitle>
              <CardDescription>Add custom scripts and styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-head">Custom Head Code</Label>
                <Textarea
                  id="custom-head"
                  value={settings.customHeadCode}
                  onChange={(e) => handleSave('customHeadCode', e.target.value)}
                  placeholder="<meta name='custom' content='value'>"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Inserted into the &lt;head&gt; tag
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-body">Custom Body Code</Label>
                <Textarea
                  id="custom-body"
                  value={settings.customBodyCode}
                  onChange={(e) => handleSave('customBodyCode', e.target.value)}
                  placeholder="<script>console.log('Hello');</script>"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Inserted before closing &lt;/body&gt; tag
                </p>
              </div>
            </CardContent>
          </CardUntitled>
        </TabsContent>

        {/* Publishing Tab */}
        <TabsContent value="publishing" className="space-y-6">
          <CardUntitled>
            <CardHeader>
              <CardTitle>Publishing Destination</CardTitle>
              <CardDescription>Configure where your site is deployed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <div className="grid grid-cols-3 gap-4">
                  {['vercel', 'netlify', 'custom'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => handleSave('publishDestination', platform)}
                      className={cn(
                        'p-4 border-2 rounded-lg text-center transition-all',
                        settings.publishDestination === platform
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <Rocket size={24} className="mx-auto mb-2" />
                      <p className="font-medium capitalize">{platform}</p>
                    </button>
                  ))}
                </div>
              </div>

              {settings.publishDestination === 'vercel' && (
                <div className="space-y-2">
                  <Label htmlFor="vercel-api">Vercel API Key</Label>
                  <InputUntitled
                    id="vercel-api"
                    type="password"
                    value={settings.vercelApiKey}
                    onChange={(e) => handleSave('vercelApiKey', e.target.value)}
                    placeholder="Your Vercel API key"
                  />
                </div>
              )}

              {settings.publishDestination === 'netlify' && (
                <div className="space-y-2">
                  <Label htmlFor="netlify-api">Netlify API Key</Label>
                  <InputUntitled
                    id="netlify-api"
                    type="password"
                    value={settings.netlifyApiKey}
                    onChange={(e) => handleSave('netlifyApiKey', e.target.value)}
                    placeholder="Your Netlify API key"
                  />
                </div>
              )}

              {settings.publishDestination === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-webhook">Deployment Webhook URL</Label>
                  <InputUntitled
                    id="custom-webhook"
                    value={settings.customWebhook}
                    onChange={(e) => handleSave('customWebhook', e.target.value)}
                    placeholder="https://example.com/deploy"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label>Auto-publish on Save</Label>
                  <p className="text-xs text-gray-500">
                    Automatically deploy when changes are saved
                  </p>
                </div>
                <Switch
                  checked={settings.autoPublish}
                  onCheckedChange={(checked) => handleSave('autoPublish', checked)}
                />
              </div>
            </CardContent>
          </CardUntitled>
        </TabsContent>
      </Tabs>
    </div>
  );
};
