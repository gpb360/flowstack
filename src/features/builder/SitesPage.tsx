import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreVertical, Trash2, Edit, Globe, Copy } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/context/AuthContext';

export const SitesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentOrganization } = useAuth();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [creating, setCreating] = useState(false);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['builder-pages', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from('pages') as any)
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganization?.id,
  });

  const createPage = useMutation({
    mutationFn: async ({ title, path }: { title: string; path: string }) => {
      // Create a site first if none exists, then create the page
      const { data: existingSites } = await (supabase
        .from('sites') as any)
        .select('id')
        .eq('organization_id', currentOrganization?.id)
        .limit(1);

      let siteId: string;
      if (existingSites && existingSites.length > 0) {
        siteId = existingSites[0].id;
      } else {
        const { data: newSite, error: siteError } = await (supabase
          .from('sites') as any)
          .insert({
            organization_id: currentOrganization?.id,
            name: `${currentOrganization?.name} Site`,
            domain: null,
          })
          .select()
          .single();
        if (siteError) throw siteError;
        siteId = newSite.id;
      }

      const { data, error } = await (supabase
        .from('pages') as any)
        .insert({
          organization_id: currentOrganization?.id,
          site_id: siteId,
          title,
          path: `/${path.replace(/^\//, '')}`,
          content: [],
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['builder-pages'] });
      setCreateDialogOpen(false);
      setNewPageTitle('');
      setNewPagePath('');
      setCreating(false);
      navigate(`/dashboard/sites/builder/${data.id}`);
    },
    onError: (err: any) => {
      setCreating(false);
      addToast({
        title: 'Failed to create page',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const deletePage = useMutation({
    mutationFn: async (pageId: string) => {
      const { error } = await (supabase
        .from('pages') as any)
        .delete()
        .eq('id', pageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-pages'] });
      setDeleteId(null);
      addToast({ title: 'Page deleted', variant: 'success' });
    },
    onError: (err: any) => {
      addToast({
        title: 'Failed to delete page',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const duplicatePage = useMutation({
    mutationFn: async (page: any) => {
      const { data, error } = await (supabase
        .from('pages') as any)
        .insert({
          organization_id: page.organization_id,
          site_id: page.site_id,
          title: `${page.title} (Copy)`,
          path: `${page.path}-copy`,
          content: page.content,
          is_published: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['builder-pages'] });
      addToast({ title: 'Page duplicated', variant: 'success' });
    },
    onError: (err: any) => {
      addToast({
        title: 'Failed to duplicate',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!newPageTitle.trim()) return;
    const path = newPagePath.trim() || newPageTitle.toLowerCase().replace(/\s+/g, '-');
    setCreating(true);
    createPage.mutate({ title: newPageTitle.trim(), path });
  };

  const filteredPages = (pages || []).filter((page: any) =>
    search === '' ||
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.path.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Builder</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage your website pages
          </p>
        </div>
        <ButtonUntitled variant="primary" onClick={() => setCreateDialogOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Page
        </ButtonUntitled>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <InputUntitled
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Pages Grid */}
      {filteredPages.length === 0 ? (
        <EmptyStateUntitled
          title="No pages found"
          description={search ? 'Try adjusting your search' : 'Create your first page to get started'}
          action={!search ? (
            <ButtonUntitled variant="primary" onClick={() => setCreateDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              Create Page
            </ButtonUntitled>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPages.map((page: any) => (
            <div
              key={page.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/sites/builder/${page.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{page.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <Globe size={12} />
                    <span className="truncate">{page.path}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                      <MoreVertical size={14} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/sites/builder/${page.id}`); }}>
                      <Edit size={14} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicatePage.mutate(page); }}>
                      <Copy size={14} className="mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); setDeleteId(page.id); }}
                      className="text-red-600"
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between">
                <BadgeUntitled variant={page.is_published ? 'success' : 'neutral'}>
                  {page.is_published ? 'Published' : 'Draft'}
                </BadgeUntitled>
                <span className="text-xs text-gray-400">
                  {new Date(page.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Page Dialog */}
      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Page</AlertDialogTitle>
            <AlertDialogDescription>
              Add a new page to your site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
              <InputUntitled
                placeholder="e.g., About Us"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Path</label>
              <InputUntitled
                placeholder="e.g., about-us (auto-generated from title)"
                value={newPagePath}
                onChange={(e) => setNewPagePath(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreate}
              disabled={!newPageTitle.trim() || creating}
            >
              {creating ? 'Creating...' : 'Create Page'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The page and all its content will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deletePage.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
