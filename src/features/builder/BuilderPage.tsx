import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Monitor, Tablet, Smartphone, Eye, Save, Undo, Redo, ChevronLeft, ExternalLink, Loader2 } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { TabsUntitled, type Tab } from '@/components/ui/tabs-untitled';
import { BuilderSidebar } from './components/BuilderSidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { Canvas } from './components/Canvas';
import { useBuilderStore } from './stores/useBuilderStore';
import { useToast } from '@/components/ui/toast';

export const BuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    viewMode, setViewMode, undo, redo, isPreview, setPreview,
    historyIndex, history, currentPage,
    isSaving, isDirty, lastSavedAt,
    loadPage, savePage,
  } = useBuilderStore();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Load page from Supabase
  useEffect(() => {
    if (!id || id === 'new') {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadPage(id)
      .catch((err: any) => {
        addToast({
          title: 'Failed to load page',
          description: err.message || 'Page not found',
          variant: 'destructive',
        });
        navigate('/dashboard/sites');
      })
      .finally(() => setLoading(false));
  }, [id, loadPage, addToast, navigate]);

  // Keyboard shortcut for save
  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    try {
      await savePage();
      addToast({ title: 'Page saved', variant: 'success' });
    } catch (err: any) {
      addToast({
        title: 'Failed to save',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [savePage, currentPage, isDirty, isSaving, addToast]); // eslint-disable-line react-hooks/exhaustive-deps

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const viewModeTabs: Tab[] = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
  ];

  const formatLastSaved = (dateStr: string | null) => {
    if (!dateStr) return 'Not saved yet';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/sites" className="p-2 hover:bg-surface-hover rounded-full text-text-secondary">
            <ChevronLeft size={20} />
          </Link>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">
              {currentPage?.title || (id === 'new' ? 'New Page' : 'Untitled Page')}
            </h1>
            <p className="text-xs text-text-muted">
              {isSaving ? 'Saving...' : formatLastSaved(lastSavedAt)}
              {isDirty && !isSaving && ' • Unsaved changes'}
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center">
          <TabsUntitled
            tabs={viewModeTabs}
            activeTab={viewMode}
            onTabChange={(tabId) => setViewMode(tabId as any)}
            variant="pills"
            size="sm"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 border-r border-border pr-3">
            <ButtonUntitled
              variant="tertiary"
              size="sm"
              leftIcon={<Undo size={18} />}
              onClick={undo}
              disabled={!canUndo}
            />
            <ButtonUntitled
              variant="tertiary"
              size="sm"
              leftIcon={<Redo size={18} />}
              onClick={redo}
              disabled={!canRedo}
            />
          </div>

          {/* Preview button */}
          <ButtonUntitled
            variant={isPreview ? 'primary' : 'secondary'}
            size="sm"
            leftIcon={<Eye size={18} />}
            onClick={() => setPreview(!isPreview)}
          >
            {isPreview ? 'Editing' : 'Preview'}
          </ButtonUntitled>

          {/* Save button */}
          <ButtonUntitled
            variant="primary"
            size="sm"
            leftIcon={isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            onClick={handleSave}
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </ButtonUntitled>
        </div>
      </header>

      {/* Builder Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <BuilderSidebar />
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
};
