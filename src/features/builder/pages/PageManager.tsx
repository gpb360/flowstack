import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable, type ColumnDef } from '@/components/ui/data-table';
import {
  FilePlus,
  MoreVertical,
  Home,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  Settings,
  Globe,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PageSettings } from './PageSettings';
import { cn } from '@/lib/utils';
import type { Block } from '../types';
import { useBuilderStore } from '../stores/useBuilderStore';

// ============================================================================
// PAGE MANAGER - Complete page management for Site Builder
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
  createdAt?: string;
  updatedAt?: string;
}

interface PageRow {
  id: string;
  name: string;
  path: string;
  isHome: boolean;
  status: 'draft' | 'published';
  updatedAt: string;
}

export const PageManager: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentSite } = useBuilderStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [selectedPageForSettings, setSelectedPageForSettings] = useState<Page | null>(null);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);

  // Fetch pages
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pages', currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return [];

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Page[];
    },
    enabled: !!currentSite?.id,
  });

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (pageData: { name: string; path: string }) => {
      if (!currentSite?.id) throw new Error('No site selected');

      // Check if path already exists
      const { data: existing } = await supabase
        .from('pages')
        .select('id')
        .eq('site_id', currentSite.id)
        .eq('path', pageData.path)
        .single();

      if (existing) {
        throw new Error('A page with this path already exists');
      }

      const { data, error } = await (supabase
        .from('pages') as any)
        .insert({
          site_id: currentSite.id,
          organization_id: currentSite.organizationId,
          title: pageData.name,
          path: pageData.path,
          content: [],
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setShowNewPageDialog(false);
      setNewPageName('');
      setNewPagePath('');
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await supabase.from('pages').delete().eq('id', pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setPageToDelete(null);
    },
  });

  // Set as homepage mutation
  const setHomepageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      if (!currentSite?.id) throw new Error('No site selected');

      // First, remove is_home from all pages
      await (supabase.from('pages') as any)
        .update({ is_home: false })
        .eq('site_id', currentSite.id);

      // Set new homepage
      const { data, error } = await (supabase
        .from('pages') as any)
        .update({ is_home: true })
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });

  // Duplicate page mutation
  const duplicatePageMutation = useMutation({
    mutationFn: async (page: Page) => {
      const { data, error } = await (supabase.from('pages') as any)
        .insert({
          site_id: page.siteId,
          organization_id: page.organizationId,
          title: `${page.title} (Copy)`,
          path: `${page.path}-copy`,
          content: page.content,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });

  // Toggle publish status
  const togglePublishMutation = useMutation({
    mutationFn: async ({ pageId, status }: { pageId: string; status: boolean }) => {
      const { data, error } = await (supabase.from('pages') as any)
        .update({ is_published: status })
        .eq('id', pageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
  });

  // Filter pages based on search
  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Table columns
  const columns: ColumnDef<PageRow>[] = [
    {
      id: 'name',
      header: 'Page Name',
      cell: ({ row }) => {
        const pageRow = row.original;
        return (
          <div className="flex items-center gap-2">
            {pageRow.isHome && <Home size={16} className="text-purple-600" />}
            <span className="font-medium">{pageRow.name}</span>
          </div>
        );
      },
    },
    {
      id: 'path',
      header: 'Path',
      cell: ({ row }) => (
        <code className="text-sm text-gray-500">{row.original.path}</code>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const pageRow = row.original;
        return (
          <BadgeUntitled
            variant={pageRow.status === 'published' ? 'primary' : 'secondary'}
            className={cn(
              pageRow.status === 'published'
                ? 'bg-green-100 text-green-800 hover:bg-green-100'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
            )}
          >
            {pageRow.status}
          </BadgeUntitled>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const pageRow = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ButtonUntitled variant="ghost" size="sm">
                <MoreVertical size={16} />
              </ButtonUntitled>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/builder/pages/${pageRow.id}`)}>
                <Edit size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPageForSettings(pages.find((p) => p.id === pageRow.id) || null)}>
                <Settings size={16} className="mr-2" />
                Settings
              </DropdownMenuItem>
              {!pageRow.isHome && (
                <DropdownMenuItem onClick={() => setHomepageMutation.mutate(pageRow.id)}>
                  <Home size={16} className="mr-2" />
                  Set as Homepage
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => duplicatePageMutation.mutate(pages.find((p) => p.id === pageRow.id)!)}>
                <Copy size={16} className="mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePublishMutation.mutate({ pageId: pageRow.id, status: pageRow.status !== 'published' })}>
                {pageRow.status === 'published' ? (
                  <>
                    <EyeOff size={16} className="mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye size={16} className="mr-2" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              {!pageRow.isHome && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setPageToDelete(pages.find((p) => p.id === pageRow.id) || null)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Transform pages to table rows
  const tableData: PageRow[] = filteredPages.map((page) => ({
    id: page.id,
    name: page.title,
    path: page.path,
    isHome: (page as any).is_home || false,
    status: (page as any).is_published ? 'published' : 'draft',
    updatedAt: new Date(page.updatedAt || '').toLocaleDateString(),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pages</h2>
          <p className="text-muted-foreground">Manage your site pages</p>
        </div>
        <ButtonUntitled onClick={() => setShowNewPageDialog(true)} className="gap-2">
          <FilePlus size={18} />
          New Page
        </ButtonUntitled>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <InputUntitled
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Pages Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : tableData.length === 0 ? (
        <EmptyState
          icon={Globe as any}
          title={searchQuery ? 'No pages found' : 'No pages yet'}
          description={
            searchQuery
              ? 'Try a different search term'
              : 'Create your first page to get started'
          }
          action={!searchQuery ? {
            label: 'Create Page',
            onClick: () => setShowNewPageDialog(true),
          } : undefined}
        />
      ) : (
        <DataTable columns={columns} data={tableData} />
      )}

      {/* New Page Dialog */}
      <AlertDialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Page</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name and path for your new page
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="page-name">Page Name</label>
              <InputUntitled
                id="page-name"
                placeholder="My Page"
                value={newPageName}
                onChange={(e) => {
                  setNewPageName(e.target.value);
                  setNewPagePath(`/${e.target.value.toLowerCase().replace(/\s+/g, '-')}`);
                }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="page-path">Path</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">/</span>
                <InputUntitled
                  id="page-path"
                  placeholder="my-page"
                  value={newPagePath.replace(/^\//, '')}
                  onChange={(e) => setNewPagePath(`/${e.target.value}`)}
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => createPageMutation.mutate({ name: newPageName, path: newPagePath })}
              disabled={!newPageName || !newPagePath || createPageMutation.isPending}
            >
              {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => pageToDelete && deletePageMutation.mutate(pageToDelete.id)}
              disabled={deletePageMutation.isPending}
            >
              {deletePageMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Page Settings Drawer */}
      {selectedPageForSettings && (
        <PageSettings
          page={selectedPageForSettings}
          open={!!selectedPageForSettings}
          onClose={() => setSelectedPageForSettings(null)}
        />
      )}
    </div>
  );
};
