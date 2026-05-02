/**
 * Workflow Layout Component
 * Main layout with sidebar for workflows module
 */

import { Outlet, useLocation } from 'react-router-dom';
import { FeatureGuard } from '@/components/FeatureGuard';
import { SidebarUntitled, type SidebarSection } from '@/components/ui/sidebar-untitled';
import { Workflow, Grid, FolderOpen, FileText } from 'lucide-react';

const navSections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'all-workflows',
        label: 'All Workflows',
        icon: Grid,
        href: '/workflows',
      },
      {
        id: 'templates',
        label: 'Templates',
        icon: FolderOpen,
        href: '/workflows/templates',
      },
      {
        id: 'logs',
        label: 'Execution Logs',
        icon: FileText,
        href: '/workflows/logs',
      },
    ],
  },
];

export const WorkflowLayout = () => {
  const location = useLocation();

  // Get active item ID based on current location
  const getActiveItemId = () => {
    const pathname = location.pathname;
    if (pathname === '/workflows') return 'all-workflows';
    if (pathname.includes('/templates')) return 'templates';
    if (pathname.includes('/logs')) return 'logs';
    return '';
  };

  return (
    <FeatureGuard moduleId="workflows" redirectTo="/">
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <SidebarUntitled
          sections={navSections}
          activeItemId={getActiveItemId()}
          collapsed={false}
          width="md"
          variant="default"
          position="left"
          logo={
            <div className="px-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-lg">
                  <Workflow size={20} className="text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-text-primary">Workflows</h1>
                  <p className="text-xs text-text-muted">Automation Studio</p>
                </div>
              </div>
            </div>
          }
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </FeatureGuard>
  );
};
