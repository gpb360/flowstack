import React from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import {
  Mail,
  MessageSquare,
  GitBranch,
  Filter,
  BarChart,
  PenTool,
  Plus
} from 'lucide-react';
import { SidebarUntitled, SidebarSection } from '@/components/ui/sidebar-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const MarketingLayout: React.FC = () => {
  const location = useLocation();

  // If at root marketing, redirect to dashboard
  if (location.pathname === '/marketing' || location.pathname === '/marketing/') {
    return <Navigate to="dashboard" replace />;
  }

  const quickActionsSection: SidebarSection = {
    id: 'quick-actions',
    title: 'Quick Actions',
    items: [
      {
        id: 'new-email',
        label: 'New Email Campaign',
        icon: Mail,
        href: '/marketing/email/new',
      },
      {
        id: 'new-sms',
        label: 'New SMS Campaign',
        icon: MessageSquare,
        href: '/marketing/sms/new',
      },
      {
        id: 'new-sequence',
        label: 'New Sequence',
        icon: GitBranch,
        href: '/marketing/sequences/new',
      },
      {
        id: 'new-template',
        label: 'New Template',
        icon: PenTool,
        href: '/marketing/templates/new',
      },
    ],
  };

  const navigationSection: SidebarSection = {
    id: 'overview',
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart,
        href: '/marketing/dashboard',
        active: location.pathname.includes('/dashboard'),
      },
      {
        id: 'email',
        label: 'Email Campaigns',
        icon: Mail,
        href: '/marketing/email',
        active: location.pathname.includes('/email') && !location.pathname.includes('/email/'),
      },
      {
        id: 'sms',
        label: 'SMS Campaigns',
        icon: MessageSquare,
        href: '/marketing/sms',
        active: location.pathname.includes('/sms') && !location.pathname.includes('/sms/'),
      },
      {
        id: 'sequences',
        label: 'Sequences',
        icon: GitBranch,
        href: '/marketing/sequences',
        active: location.pathname.includes('/sequences'),
      },
      {
        id: 'segments',
        label: 'Segments',
        icon: Filter,
        href: '/marketing/segments',
        active: location.pathname.includes('/segments'),
      },
      {
        id: 'templates',
        label: 'Templates',
        icon: PenTool,
        href: '/marketing/templates',
        active: location.pathname.includes('/templates'),
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart,
        href: '/marketing/analytics',
        active: location.pathname.includes('/analytics'),
      },
    ],
  };

  const getActiveItemId = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/email')) return 'email';
    if (path.includes('/sms')) return 'sms';
    if (path.includes('/sequences')) return 'sequences';
    if (path.includes('/segments')) return 'segments';
    if (path.includes('/templates')) return 'templates';
    if (path.includes('/analytics')) return 'analytics';
    return '';
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <SidebarUntitled
        sections={[quickActionsSection, navigationSection]}
        activeItemId={getActiveItemId()}
        collapsed={false}
        width="md"
        variant="default"
        position="left"
        logo={
          <div className="px-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Marketing
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Campaigns & Automation
            </p>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MarketingLayout;
