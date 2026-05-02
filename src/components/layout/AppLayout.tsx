import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { useFeature, type ModuleId } from '../../context/FeatureContext';
import {
  LayoutDashboard,
  Users,
  Globe,
  Workflow,
  Settings,
  LogOut,
  Menu,
  Megaphone,
  Bot,
  ChevronRight,
  Building2,
  Mail,
  FileText,
  BarChart3,
  Zap,
  Phone,
  Calendar,
  MessageCircle,
  Star,
  Plug,
  CreditCard,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Icons = {
  Dashboard: LayoutDashboard,
  CRM: Users,
  Sites: Globe,
  Workflows: Workflow,
  Settings: Settings,
  Logout: LogOut,
  Menu: Menu,
  Marketing: Megaphone,
  AIAgents: Bot,
  Building: Building2,
  Campaign: Mail,
  Template: FileText,
  Analytics: BarChart3,
  Action: Zap,
  Phone: Phone,
  Calendar: Calendar,
  Chat: MessageCircle,
  Star: Star,
  Plug: Plug,
  CreditCard: CreditCard,
  FileEdit: FileText,
  ClipboardList: ClipboardList,
} as const;

interface NavItem {
  label: string;
  path: string;
  icon: React.FC<{ size?: number; className?: string }>;
  moduleId?: ModuleId;
}

interface SidebarGroup {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: 'Overview',
    defaultOpen: true,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: Icons.Dashboard },
      { label: 'Flow Audits', path: '/dashboard/audits', icon: Icons.ClipboardList },
    ],
  },
  {
    label: 'Business',
    defaultOpen: true,
    items: [
      { label: 'CRM', path: '/dashboard/crm', icon: Icons.CRM, moduleId: 'crm' },
      { label: 'Companies', path: '/dashboard/crm/companies', icon: Icons.Building, moduleId: 'crm' },
      { label: 'Deals', path: '/dashboard/crm/deals', icon: Icons.CreditCard, moduleId: 'crm' },
      { label: 'Activities', path: '/dashboard/crm/activities', icon: Icons.Action, moduleId: 'crm' },
    ],
  },
  {
    label: 'Automation',
    defaultOpen: true,
    items: [
      { label: 'Workflows', path: '/dashboard/workflows', icon: Icons.Workflows, moduleId: 'workflows' },
      { label: 'AI Agents', path: '/dashboard/ai-agents', icon: Icons.AIAgents, moduleId: 'ai_agents' },
    ],
  },
  {
    label: 'Marketing',
    defaultOpen: false,
    items: [
      { label: 'Campaigns', path: '/dashboard/marketing', icon: Icons.Campaign, moduleId: 'email_marketing' },
      { label: 'Templates', path: '/dashboard/marketing/templates', icon: Icons.Template, moduleId: 'email_marketing' },
      { label: 'Analytics', path: '/dashboard/marketing/analytics', icon: Icons.Analytics, moduleId: 'email_marketing' },
    ],
  },
  {
    label: 'Builder',
    defaultOpen: false,
    items: [
      { label: 'Site Builder', path: '/dashboard/sites', icon: Icons.Sites, moduleId: 'site_builder' },
      { label: 'Forms', path: '/dashboard/forms', icon: Icons.FileEdit, moduleId: 'forms' },
    ],
  },
  {
    label: 'Communication',
    defaultOpen: false,
    items: [
      { label: 'Chat', path: '/dashboard/chat', icon: Icons.Chat, moduleId: 'chat_widget' },
      { label: 'Phone', path: '/dashboard/phone', icon: Icons.Phone, moduleId: 'phone_system' },
      { label: 'Calendar', path: '/dashboard/calendar', icon: Icons.Calendar, moduleId: 'appointments' },
    ],
  },
  {
    label: 'Growth',
    defaultOpen: false,
    items: [
      { label: 'Social', path: '/dashboard/social', icon: Icons.Campaign, moduleId: 'social_planner' },
      { label: 'Reputation', path: '/dashboard/reputation', icon: Icons.Star, moduleId: 'reputation' },
      { label: 'Memberships', path: '/dashboard/memberships', icon: Icons.CreditCard, moduleId: 'membership' },
    ],
  },
  {
    label: 'Platform',
    defaultOpen: false,
    items: [
      { label: 'Analytics', path: '/dashboard/analytics', icon: Icons.Analytics, moduleId: 'analytics' },
      { label: 'Integrations', path: '/dashboard/integrations', icon: Icons.Plug, moduleId: 'integrations' },
    ],
  },
];

export const AppLayout: React.FC = () => {
  const { signOut, user, currentOrganization } = useAuth();
  const { isModuleEnabled } = useFeature();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(SIDEBAR_GROUPS.filter((g) => g.defaultOpen).map((g) => g.label))
  );

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const toggleGroup = (label: string) => {
    const newOpen = new Set(openGroups);
    if (newOpen.has(label)) newOpen.delete(label);
    else newOpen.add(label);
    setOpenGroups(newOpen);
  };

  return (
    <div className="flex h-screen bg-[#08090a] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-[#0c0d0e] border-r border-[#1a1c20] transition-all duration-300 flex flex-col',
          isSidebarOpen ? 'w-60' : 'w-[60px]'
        )}
      >
        {/* Logo */}
        <div className="h-14 px-4 border-b border-[#1a1c20] flex items-center justify-between flex-shrink-0">
          {isSidebarOpen ? (
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
                <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
              </svg>
              <span className="text-xs font-semibold tracking-[0.1em] text-white uppercase">FlowStack</span>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto">
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                <path d="M9 1L17 9L9 17L1 9L9 1Z" stroke="#d4af37" strokeWidth="1.5" fill="none" />
                <path d="M9 5L13 9L9 13L5 9L9 5Z" fill="#d4af37" />
              </svg>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-[#1a1c20] rounded text-[#4b5563] hover:text-[#9ca3af] transition-colors"
          >
            <Icons.Menu size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {SIDEBAR_GROUPS.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.moduleId || isModuleEnabled(item.moduleId)
            );
            if (filteredItems.length === 0) return null;

            const isOpen = openGroups.has(group.label);

            return (
              <div key={group.label} className="mt-3 first:mt-0">
                {/* Group Label */}
                {isSidebarOpen && (
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold tracking-[0.15em] uppercase text-[#4b5563] hover:text-[#6b7280] transition-colors rounded"
                  >
                    <span>{group.label}</span>
                    <ChevronRight
                      className={cn('w-3 h-3 transition-transform duration-200', isOpen && 'rotate-90')}
                    />
                  </button>
                )}

                {/* Items */}
                {(!isSidebarOpen || isOpen) && (
                  <div className={cn(isSidebarOpen && 'space-y-px mt-0.5')}>
                    {filteredItems.map((item) => {
                      const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            'flex items-center gap-2.5 rounded-md text-[13px] transition-all duration-150',
                            isSidebarOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center',
                            isActive
                              ? 'bg-[#d4af37]/10 text-[#d4af37]'
                              : 'text-[#6b7280] hover:bg-[#1a1c20] hover:text-[#9ca3af]'
                          )}
                          title={!isSidebarOpen ? item.label : undefined}
                        >
                          <item.icon size={16} />
                          {isSidebarOpen && (
                            <span className={isActive ? 'font-medium' : 'font-normal'}>{item.label}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#1a1c20] mt-auto space-y-1">
          {isSidebarOpen && (
            <div className="px-2.5 py-2">
              <div className="text-xs font-medium text-[#9ca3af] truncate">
                {currentOrganization?.name || 'My Org'}
              </div>
              <div className="text-[10px] text-[#4b5563] truncate">
                {user?.email}
              </div>
            </div>
          )}
          <Link
            to="/dashboard/settings"
            className={cn(
              'flex items-center gap-2.5 rounded-md text-[13px] transition-colors py-1.5',
              isSidebarOpen ? 'px-2.5' : 'justify-center',
              'text-[#6b7280] hover:bg-[#1a1c20] hover:text-[#9ca3af]'
            )}
            title={!isSidebarOpen ? 'Settings' : undefined}
          >
            <Icons.Settings size={16} />
            {isSidebarOpen && <span>Settings</span>}
          </Link>
          <button
            onClick={() => signOut()}
            className={cn(
              'flex items-center gap-2.5 rounded-md text-[13px] transition-colors py-1.5 w-full text-left',
              isSidebarOpen ? 'px-2.5' : 'justify-center',
              'text-[#4b5563] hover:bg-red-500/10 hover:text-red-400'
            )}
            title={!isSidebarOpen ? 'Sign Out' : undefined}
          >
            <Icons.Logout size={16} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
};
