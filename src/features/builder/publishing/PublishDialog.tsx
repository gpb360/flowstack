import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input-untitled';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { AlertUntitled } from '@/components/ui/alert-untitled';
import { ProgressUntitled } from '@/components/ui/progress-untitled';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';
import { useBuilderStore } from '../stores/useBuilderStore';
import {
  publishSite,
  exportToHTML,
  generateVersionNumber,
  formatBytes,
  calculateFileSize,
  renderSite,
  type PublishOptions,
} from './PublishingEngine';
import { sanitizeProjectName } from './CloudflareClient';
import {
  Rocket,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Globe,
  FileCode,
  Files,
  ExternalLink,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type PublishStep = 'options' | 'generating' | 'deploying' | 'success' | 'error';

interface DeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
  filesDeployed?: number;
  projectName?: string;
}

// ============================================================================
// PUBLISH DIALOG
// ============================================================================

interface PublishDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PublishDialog: React.FC<PublishDialogProps> = ({ open, onClose }) => {
  const { currentSite } = useBuilderStore();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const defaultProjectName = useMemo(
    () => sanitizeProjectName(currentSite?.subdomain || currentSite?.name || 'my-site'),
    [currentSite?.subdomain, currentSite?.name]
  );

  const [step, setStep] = useState<PublishStep>('options');
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [publishOptions, setPublishOptions] = useState<PublishOptions>({
    generateSitemap: true,
  });
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [progress, setProgress] = useState(0);

  // Fetch site pages
  const { data: pages = [] } = useQuery({
    queryKey: ['pages', currentSite?.id],
    queryFn: async () => {
      if (!currentSite?.id) return [];
      const { data, error } = await (supabase as any)
        .from('pages')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!currentSite?.id && open,
  });

  const publishedPages = pages.filter((p: any) => p.is_published);
  const draftPages = pages.filter((p: any) => !p.is_published);

  // Preview render size
  const previewSize = useMemo(() => {
    if (!currentSite || publishedPages.length === 0) return null;
    try {
      const files = renderSite(currentSite, publishedPages);
      const totalBytes = files.reduce((sum, f) => sum + calculateFileSize(f.content), 0);
      return { fileCount: files.length, totalSize: formatBytes(totalBytes) };
    } catch {
      return null;
    }
  }, [currentSite, publishedPages]);

  // Sanitized project name (live)
  const sanitizedName = useMemo(() => sanitizeProjectName(projectName), [projectName]);

  // ========================================================================
  // PUBLISH MUTATION
  // ========================================================================

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!currentSite) throw new Error('No site selected');

      setStep('generating');
      setProgress(20);

      // Small delay to show generating state
      await new Promise((r) => setTimeout(r, 300));
      setProgress(40);

      setStep('deploying');
      setProgress(60);

      const pubResult = await publishSite(
        currentSite,
        publishedPages,
        publishOptions,
        sanitizedName
      );

      setProgress(90);

      // Save to site_versions if successful
      if (pubResult.success) {
        await (supabase as any).from('site_versions').insert({
          site_id: currentSite.id,
          version: generateVersionNumber(),
          published_at: new Date().toISOString(),
          url: pubResult.url,
          status: 'success',
          deployment_id: pubResult.deploymentId || null,
        });

        // Store cloudflare project name on the site for future publishes
        if (pubResult.projectName) {
          await (supabase as any)
            .from('sites')
            .update({ cloudflare_project_name: pubResult.projectName })
            .eq('id', currentSite.id);
        }
      } else {
        // Log failed deployment too
        await (supabase as any).from('site_versions').insert({
          site_id: currentSite.id,
          version: generateVersionNumber(),
          published_at: new Date().toISOString(),
          url: null,
          status: 'failed',
          error_message: pubResult.error || 'Unknown error',
        }).catch(() => {
          // Don't fail the whole operation if logging fails
        });
      }

      return pubResult;
    },
    onSuccess: (pubResult) => {
      setProgress(100);
      setResult({
        success: pubResult.success,
        url: pubResult.url,
        deploymentId: pubResult.deploymentId,
        error: pubResult.error,
        filesDeployed: pubResult.filesDeployed,
        projectName: pubResult.projectName,
      });
      setStep(pubResult.success ? 'success' : 'error');
      queryClient.invalidateQueries({ queryKey: ['site-versions'] });

      if (pubResult.success) {
        addToast({ title: 'Site published successfully!', variant: 'success' });
      }
    },
    onError: (err: Error) => {
      setResult({ success: false, error: err.message });
      setStep('error');
      addToast({ title: 'Publishing failed', description: err.message, variant: 'destructive' });
    },
  });

  // ========================================================================
  // EXPORT MUTATION
  // ========================================================================

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!currentSite) throw new Error('No site selected');
      const blob = await exportToHTML(currentSite, publishedPages);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentSite.name}-export.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return blob;
    },
    onSuccess: () => {
      addToast({ title: 'Export downloaded', variant: 'success' });
    },
    onError: (err: Error) => {
      addToast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    },
  });

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handlePublish = () => {
    publishMutation.mutate();
  };

  const handleReset = () => {
    setStep('options');
    setResult(null);
    setProgress(0);
  };

  const handleClose = () => {
    if (step === 'generating' || step === 'deploying') return; // Don't close while deploying
    handleReset();
    onClose();
  };

  if (!currentSite) return null;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={20} />
            Publish to Cloudflare Pages
          </DialogTitle>
          <DialogDescription>
            Deploy your site to the internet
          </DialogDescription>
        </DialogHeader>

        {/* ============ OPTIONS STEP ============ */}
        {step === 'options' && (
          <div className="space-y-5">
            {/* Summary Card */}
            <CardUntitled
              title="Deployment Summary"
              description={`${publishedPages.length} page${publishedPages.length !== 1 ? 's' : ''} ready`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Published pages</span>
                  <BadgeUntitled variant="primary">{publishedPages.length}</BadgeUntitled>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Drafts (not deployed)</span>
                  <BadgeUntitled variant="neutral">{draftPages.length}</BadgeUntitled>
                </div>
                {previewSize && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Files to deploy</span>
                      <BadgeUntitled variant="neutral">
                        <Files size={12} className="mr-1" />
                        {previewSize.fileCount}
                      </BadgeUntitled>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total size</span>
                      <span className="text-sm text-muted-foreground">{previewSize.totalSize}</span>
                    </div>
                  </>
                )}
              </div>
            </CardUntitled>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProjectName(e.target.value)}
                placeholder="my-awesome-site"
              />
              <p className="text-xs text-muted-foreground">
                Your site will be available at{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {sanitizedName || '...'}.pages.dev
                </code>
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generate Sitemap</Label>
                  <p className="text-xs text-muted-foreground">Create sitemap.xml for SEO</p>
                </div>
                <Switch
                  checked={publishOptions.generateSitemap}
                  onCheckedChange={(checked) =>
                    setPublishOptions({ ...publishOptions, generateSitemap: checked })
                  }
                />
              </div>
            </div>

            {/* Export Option */}
            <div className="border-t pt-4">
              <ButtonUntitled
                onClick={() => exportMutation.mutate()}
                disabled={exportMutation.isPending || publishedPages.length === 0}
                className="w-full"
                variant="secondary"
              >
                <Download size={16} className="mr-2" />
                {exportMutation.isPending ? 'Exporting...' : 'Download as HTML'}
              </ButtonUntitled>
            </div>
          </div>
        )}

        {/* ============ GENERATING / DEPLOYING ============ */}
        {(step === 'generating' || step === 'deploying') && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <div>
                <h3 className="text-lg font-semibold">
                  {step === 'generating' ? 'Generating pages...' : 'Deploying to Cloudflare...'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step === 'generating'
                    ? 'Converting blocks to HTML'
                    : 'Uploading to the Cloudflare global network'}
                </p>
              </div>
              <ProgressUntitled value={progress} className="w-full max-w-sm" />
            </div>
          </div>
        )}

        {/* ============ SUCCESS ============ */}
        {step === 'success' && result && (
          <div className="space-y-5">
            <AlertUntitled variant="success" icon={<CheckCircle className="h-4 w-4 text-green-600" />}>
              Site published successfully!
            </AlertUntitled>

            <CardUntitled title="Deployment Details">
              <div className="space-y-3">
                {result.url && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Live URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm flex-1 truncate">{result.url}</code>
                      <ButtonUntitled
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(result.url, '_blank')}
                        isIconOnly
                      >
                        <ExternalLink size={14} />
                      </ButtonUntitled>
                    </div>
                  </div>
                )}
                {result.filesDeployed && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Files Deployed</Label>
                    <p className="text-sm mt-1">{result.filesDeployed} files</p>
                  </div>
                )}
                {result.deploymentId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Deployment ID</Label>
                    <p className="text-sm mt-1 font-mono text-muted-foreground truncate">
                      {result.deploymentId}
                    </p>
                  </div>
                )}
              </div>
            </CardUntitled>
          </div>
        )}

        {/* ============ ERROR ============ */}
        {step === 'error' && result && (
          <div className="space-y-5">
            <AlertUntitled variant="error" icon={<XCircle className="h-4 w-4" />}>
              {result.error || 'An unknown error occurred during publishing.'}
            </AlertUntitled>
          </div>
        )}

        {/* ============ FOOTER ============ */}
        <DialogFooter>
          {step === 'options' && (
            <>
              <ButtonUntitled variant="ghost" onClick={handleClose}>
                Cancel
              </ButtonUntitled>
              <ButtonUntitled
                onClick={handlePublish}
                disabled={publishedPages.length === 0 || !sanitizedName}
              >
                <Rocket size={16} className="mr-2" />
                Publish Site
              </ButtonUntitled>
            </>
          )}

          {step === 'success' && (
            <>
              <ButtonUntitled variant="ghost" onClick={handleReset}>
                Publish Again
              </ButtonUntitled>
              {result?.url && (
                <ButtonUntitled onClick={() => window.open(result.url, '_blank')}>
                  <Eye size={16} className="mr-2" />
                  Visit Site
                </ButtonUntitled>
              )}
              <ButtonUntitled variant="secondary" onClick={handleClose}>
                Done
              </ButtonUntitled>
            </>
          )}

          {step === 'error' && (
            <>
              <ButtonUntitled variant="ghost" onClick={handleClose}>
                Close
              </ButtonUntitled>
              <ButtonUntitled onClick={handleReset}>
                Try Again
              </ButtonUntitled>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
