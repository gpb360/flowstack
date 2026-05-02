/**
 * Reputation Management Layout
 * Main layout component for the reputation module
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, Bell as AlertBell, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/reputation', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reputation/reviews', label: 'Reviews', icon: MessageSquare },
  { href: '/reputation/sources', label: 'Sources', icon: Star },
  { href: '/reputation/responses', label: 'Responses', icon: MessageSquare },
  { href: '/reputation/alerts', label: 'Alerts', icon: AlertBell },
  { href: '/reputation/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/reputation/widgets', label: 'Widgets', icon: Star },
  { href: '/reputation/settings', label: 'Settings', icon: Settings },
];

export function ReputationLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold">Reputation</h1>
          <p className="text-sm text-muted-foreground">Review Management</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
