import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
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
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import { useBuilderStore } from '../stores/useBuilderStore';
import {
  History,
  ExternalLink,
  RotateCcw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Version {
  id: string;
  site_id: string;
  version: string;
  published_at: string;
  published_by?: string;
  url: string | null;
  status: 'success' | 'failed';
  deployment_id?: string;
  error_message?: string;
  pages_snapshot?: unknown[];
}

// ============================================================================
// PUBLISH HISTORY
// ============================================================================

export const PublishHistory: React.FC = () => {
  const queryClient = useQueryClient();
  const { currentSite } = useBuilderStore();
  const { addToast } = useToast();
  const [versionToDelete, setVersionToDelete] = useState<Version | null>(null);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [rollbackVersion, setRollbackVersion] = useState<Version | null>(null);

  // Fetch version history
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['site-versions', currentSite?.id],
    queryFn: async (): Promise<Version[]> => {
      if (!currentSite?.id) return [];

      const { data, error } = await supabase
        .from('site_versions')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('published_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return (data || []) as Version[];
    },
    enabled: !!currentSite?.id,
  });

  // Delete version mutation
  const deleteVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const { error } = await supabase
        .from('site_versions')
        .delete()
        .eq('id', versionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-versions'] });
      setVersionToDelete(null);
      addToast({ title: 'Version deleted', variant: 'success' });
    },
    onError: (err: Error) => {
      addToast({ title: 'Failed to delete version', description: err.message, variant: 'destructive' });
    },
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (version: Version) => {
      if (!currentSite?.id) throw new Error('No site selected');

      const { data: versionData, error } = await supabase
        .from('site_versions')
        .select('pages_snapshot')
        .eq('id', version.id)
        .single();

      if (error) throw error;
      if (!versionData) throw new Error('Version not found');

      const pages = (versionData.pages_snapshot || []) as Array<{
        id: string;
        content: unknown;
        title: string;
        path: string;
      }>;

      for (const page of pages) {
        await supabase
          .from('pages')
          .update({ content: page.content, title: page.title, path: page.path })
          .eq('id', page.id);
      }

      return version;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      setShowRollbackDialog(false);
      setRollbackVersion(null);
      addToast({ title: 'Rollback complete', variant: 'success' });
    },
    onError: (err: Error) => {
      addToast({ title: 'Rollback failed', description: err.message, variant: 'destructive' });
    },
  });

  const handleRollback = (version: Version) => {
    setRollbackVersion(version);
    setShowRollbackDialog(true);
  };

  const confirmRollback = () => {
    if (rollbackVersion) {
      rollbackMutation.mutate(rollbackVersion);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!currentSite) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
        <History size={40} className="text-muted-foreground" />
        <p className="text-muted-foreground">Select a site to view publish history</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Publish History</h2>
        <p className="text-muted-foreground">
          View and manage previous deployments
        </p>
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-3 border rounded-lg">
          <History size={40} className="text-muted-foreground" />
          <p className="font-medium">No publish history</p>
          <p className="text-sm text-muted-foreground">Publish your site to create version history</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              {/* Status icon */}
              <div className="flex-shrink-0">
                {version.status === 'success' ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : (
                  <XCircle size={20} className="text-red-500" />
                )}
              </div>

              {/* Version info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{version.version}</span>
                  <BadgeUntitled
                    variant={version.status === 'success' ? 'primary' : 'error'}
                  >
                    {version.status}
                  </BadgeUntitled>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock size={12} />
                  {new Date(version.published_at).toLocaleDateString()}{' '}
                  {new Date(version.published_at).toLocaleTimeString()}
                </div>
                {version.error_message && (
                  <p className="text-xs text-red-500 mt-1 truncate">{version.error_message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {version.url && (
                  <ButtonUntitled
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(version.url!, '_blank')}
                    isIconOnly
                    title="Visit site"
                  >
                    <ExternalLink size={14} />
                  </ButtonUntitled>
                )}
                {version.status === 'success' && version.pages_snapshot && (
                  <ButtonUntitled
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRollback(version)}
                    disabled={rollbackMutation.isPending}
                    isIconOnly
                    title="Rollback to this version"
                  >
                    <RotateCcw size={14} />
                  </ButtonUntitled>
                )}
                <ButtonUntitled
                  size="sm"
                  variant="ghost"
                  onClick={() => setVersionToDelete(version)}
                  isIconOnly
                  title="Delete version"
                >
                  <Trash2 size={14} />
                </ButtonUntitled>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!versionToDelete} onOpenChange={() => setVersionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete version &quot;{versionToDelete?.version}&quot;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => versionToDelete && deleteVersionMutation.mutate(versionToDelete.id)}
              disabled={deleteVersionMutation.isPending}
            >
              {deleteVersionMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rollback Dialog */}
      <AlertDialog open={showRollbackDialog} onOpenChange={setShowRollbackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rollback to Version?</AlertDialogTitle>
            <AlertDialogDescription>
              Rollback to version &quot;{rollbackVersion?.version}&quot;? This replaces your current pages with the version from{' '}
              {rollbackVersion ? new Date(rollbackVersion.published_at).toLocaleDateString() : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRollback}
              disabled={rollbackMutation.isPending}
            >
              {rollbackMutation.isPending ? 'Rolling back...' : 'Rollback'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
