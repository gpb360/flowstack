import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, PenTool, Users, FolderOpen, Megaphone, BarChart3, List } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/social', icon: Calendar, label: 'Calendar' },
  { to: '/social/composer', icon: PenTool, label: 'Composer' },
  { to: '/social/posts', icon: List, label: 'Posts' },
  { to: '/social/accounts', icon: Users, label: 'Accounts' },
  { to: '/social/media', icon: FolderOpen, label: 'Media Library' },
  { to: '/social/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/social/analytics', icon: BarChart3, label: 'Analytics' },
];

export function SocialLayout() {
  const location = useLocation();

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card">
        <div className="p-6">
          <h1 className="text-xl font-bold text-primary">Social Planner</h1>
          <p className="text-sm text-text-secondary mt-1">Schedule and manage your social media</p>
        </div>

        <nav className="px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== '/social' && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-text-secondary hover:bg-background-secondary hover:text-primary'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
