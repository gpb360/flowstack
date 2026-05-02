import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../../../components/ui/sheet';
import { TabsWithContent, type Tab } from '../../../components/ui/tabs-untitled';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { supabase } from '../../../lib/supabase';
import type { Block } from '../types';
import { Save, X } from 'lucide-react';

// ============================================================================
// PAGE SETTINGS - Page-level configuration
// ============================================================================

interface Page {
  id: string;
  siteId?: string;
  organizationId?: string;
  title: string;
  path: string;
  content: Block[];
  isHome?: boolean;
  isPublished?: boolean;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
  customCss?: string;
  customJs?: string;
  accessControl?: 'public' | 'members';
  createdAt?: string;
  updatedAt?: string;
}

interface PageSettingsProps {
  page: Page;
  open: boolean;
  onClose: () => void;
}

export const PageSettings: React.FC<PageSettingsProps> = ({ page, open, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');

  // Form state
  const [name, setName] = useState(page.title);
  const [path, setPath] = useState(page.path);
  const [metaTitle, setMetaTitle] = useState(page.seo?.title || '');
  const [metaDescription, setMetaDescription] = useState(page.seo?.description || '');
  const [ogImage, setOgImage] = useState(page.seo?.ogImage || '');
  const [customCSS, setCustomCSS] = useState((page as any).customCss || '');
  const [customJS, setCustomJS] = useState((page as any).customJs || '');
  const [accessControl, setAccessControl] = useState<'public' | 'members'>((page as any).accessControl || 'public');

  const tabs: Array<Tab & { content: React.ReactNode }> = [
    {
      id: 'general',
      label: 'General',
      content: (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="page-name">Page Name</Label>
            <Input
              id="page-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-path">Path</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">/</span>
              <Input
                id="page-path"
                value={path.replace(/^\//, '')}
                onChange={(e) => setPath(`/${e.target.value}`)}
                placeholder="my-page"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Page Status</Label>
            <div className="flex items-center gap-2">
              <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                {page.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'seo',
      label: 'SEO',
      content: (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="My Awesome Page"
              maxLength={60}
            />
            <p className="text-xs text-gray-500">
              {metaTitle.length}/60 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="A brief description of your page"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500">
              {metaDescription.length}/160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image">OG Image URL</Label>
            <Input
              id="og-image"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-gray-500">
              Recommended: 1200 x 630 pixels
            </p>
          </div>

          {/* SEO Preview */}
          <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
            <p className="text-xs text-gray-500">Google Search Preview</p>
            <div className="space-y-1">
              <p className="text-blue-600 text-sm hover:underline cursor-pointer">
                {metaTitle || name} | Example Site
              </p>
              <p className="text-green-700 text-xs">
                https://example.com{path}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {metaDescription || 'A description of your page will appear here...'}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'code',
      label: 'Code',
      content: (
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="custom-css">Custom CSS</Label>
            <Textarea
              id="custom-css"
              value={customCSS}
              onChange={(e) => setCustomCSS(e.target.value)}
              placeholder=".my-class { color: red; }"
              rows={6}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-js">Custom JavaScript</Label>
            <Textarea
              id="custom-js"
              value={customJS}
              onChange={(e) => setCustomJS(e.target.value)}
              placeholder="// Your custom JavaScript"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'access',
      label: 'Access',
      content: (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Access</Label>
              <p className="text-xs text-gray-500">
                Anyone can view this page
              </p>
            </div>
            <Switch
              checked={accessControl === 'public'}
              onCheckedChange={(checked) =>
                setAccessControl(checked ? 'public' : 'members')
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Members Only</Label>
              <p className="text-xs text-gray-500">
                Only logged-in members can view this page
              </p>
            </div>
            <Switch
              checked={accessControl === 'members'}
              onCheckedChange={(checked) =>
                setAccessControl(checked ? 'members' : 'public')
              }
            />
          </div>
        </div>
      ),
    },
  ];

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (updates: Partial<Page>) => {
      const { data, error } = await (supabase.from('pages') as any)
        .update({
          title: name,
          path: path,
          seo: {
            title: metaTitle,
            description: metaDescription,
            ogImage: ogImage,
          },
          customCss: customCSS,
          customJs: customJS,
          accessControl: accessControl,
          ...updates,
        })
        .eq('id', page.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      onClose();
    },
  });

  const handleSave = () => {
    updatePageMutation.mutate({});
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Page Settings</SheetTitle>
          <SheetDescription>Configure page properties and SEO</SheetDescription>
        </SheetHeader>

        <TabsWithContent
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
          size="md"
        />

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            <X size={18} className="mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updatePageMutation.isPending}>
            <Save size={18} className="mr-2" />
            {updatePageMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
