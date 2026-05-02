import React, { useState } from 'react';
import { Outlet, Link, useParams, useNavigate } from 'react-router-dom';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { TabsUntitled, type Tab } from '@/components/ui/tabs-untitled';
import { SidebarUntitled, type SidebarSection } from '@/components/ui/sidebar-untitled';
import { useBuilderStore } from '../stores/useBuilderStore';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Undo,
  Redo,
  ChevronLeft,
  ExternalLink,
  Settings,
  FileText,
  Globe,
  Rocket,
  PanelLeftClose,
  PanelRightClose,
  Layers,
} from 'lucide-react';
import { PageTemplates } from '../pages';
import { PublishDialog } from '../publishing';
import { ResponsivePreview } from '../responsive';

// ============================================================================
// BUILDER LAYOUT - Enhanced builder layout with sidebar navigation
// ============================================================================

export const BuilderLayout: React.FC = () => {
  const { pageId } = useParams<{ pageId?: string }>();
  const navigate = useNavigate();
  const {
    viewMode,
    setViewMode,
    undo,
    redo,
    isPreview,
    setPreview,
    historyIndex,
    history,
    showLeftPanel,
    showRightPanel,
    toggleLeftPanel,
    zoom,
    zoomIn,
    zoomOut,
    currentSite,
  } = useBuilderStore();

  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showResponsivePreview, setShowResponsivePreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [_searchQuery, _setSearchQuery] = useState('');
  const [_activeTab, _setActiveTab] = useState('blocks');

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Sidebar sections
  const sidebarSections: SidebarSection[] = [
    {
      id: 'pages',
      title: 'Pages',
      items: [
        {
          id: 'all-pages',
          label: 'All Pages',
          icon: FileText,
          active: !pageId,
          onClick: () => navigate('/builder'),
        },
      ],
    },
    {
      id: 'site',
      title: 'Site',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          active: window.location.pathname.includes('settings'),
          onClick: () => navigate('/builder/settings'),
        },
        {
          id: 'themes',
          label: 'Themes',
          icon: Globe,
          active: window.location.pathname.includes('themes'),
          onClick: () => navigate('/builder/themes'),
        },
        {
          id: 'history',
          label: 'History',
          icon: Layers,
          active: window.location.pathname.includes('history'),
          onClick: () => navigate('/builder/history'),
        },
      ],
    },
  ];

  // View mode tabs
  const viewModeTabs: Tab[] = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone },
  ];

  // Block palette tabs (reserved for future use)
  // To be implemented when palette tabs functionality is added

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left Sidebar */}
      {showLeftPanel && (
        <SidebarUntitled
          sections={sidebarSections}
          activeItemId={pageId || 'all-pages'}
          collapsed={false}
          width="md"
          variant="default"
          position="left"
          logo={
            <div className="px-4">
              <Link to="/sites" className="flex items-center gap-2 text-text-secondary hover:text-text-primary">
                <ChevronLeft size={18} />
                <span className="text-sm font-medium">Back to Sites</span>
              </Link>
              <div className="mt-3">
                <h3 className="font-semibold text-text-primary truncate">
                  {currentSite?.name || 'Untitled Site'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {currentSite?.customDomain || `${currentSite?.name}.flowstack.app`}
                </p>
              </div>
            </div>
          }
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <ButtonUntitled
              variant="tertiary"
              size="sm"
              leftIcon={showLeftPanel ? <PanelLeftClose size={18} /> : <PanelRightClose size={18} />}
              onClick={toggleLeftPanel}
            >
              {showLeftPanel ? 'Hide' : 'Show'}
            </ButtonUntitled>

            <div className="h-6 w-px bg-border" />

            <div>
              <h1 className="text-sm font-semibold text-text-primary">
                {pageId ? 'Page Editor' : 'Site Builder'}
              </h1>
              <p className="text-xs text-text-muted">
                {pageId ? 'Editing page content' : 'Manage your site'}
              </p>
            </div>
          </div>

          {/* Center Section - Device Mode */}
          <div className="flex items-center">
            <TabsUntitled
              tabs={viewModeTabs}
              activeTab={viewMode}
              onTabChange={(tabId) => setViewMode(tabId as any)}
              variant="pills"
              size="sm"
            />
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-r border-border pr-3">
              <ButtonUntitled
                variant="tertiary"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 25}
              >
                −
              </ButtonUntitled>
              <span className="text-sm font-medium min-w-[50px] text-center">{zoom}%</span>
              <ButtonUntitled
                variant="tertiary"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 150}
              >
                +
              </ButtonUntitled>
            </div>

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

            {/* Preview */}
            <ButtonUntitled
              variant={isPreview ? 'primary' : 'secondary'}
              size="sm"
              leftIcon={<Eye size={18} />}
              onClick={() => setPreview(!isPreview)}
            >
              {isPreview ? 'Editing' : 'Preview'}
            </ButtonUntitled>

            {/* Responsive Preview */}
            <ButtonUntitled
              variant="secondary"
              size="sm"
              leftIcon={<Smartphone size={18} />}
              onClick={() => setShowResponsivePreview(true)}
            >
              Preview All
            </ButtonUntitled>

            {/* Publish */}
            <ButtonUntitled
              variant="primary"
              size="sm"
              leftIcon={<Rocket size={18} />}
              onClick={() => setShowPublishDialog(true)}
            >
              Publish
            </ButtonUntitled>

            {/* Open in new tab */}
            <ButtonUntitled
              variant="tertiary"
              size="sm"
              leftIcon={<ExternalLink size={18} />}
              title="Open in new tab"
              onClick={() => window.open(window.location.href, '_blank')}
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <Outlet />
          {showRightPanel && (
            <aside className="w-80 bg-surface border-l border-border shrink-0">
              {/* Properties Panel */}
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-4">Properties</h3>
                <p className="text-sm text-text-muted">Select an element to edit its properties</p>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPublishDialog && (
        <PublishDialog open={showPublishDialog} onClose={() => setShowPublishDialog(false)} />
      )}

      {showResponsivePreview && (
        <ResponsivePreview
          pages={[]}
          onClose={() => setShowResponsivePreview(false)}
        />
      )}

      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
          <div className="bg-surface border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <PageTemplates onComplete={() => setShowTemplates(false)} />
          </div>
        </div>
      )}
    </div>
  );
};
