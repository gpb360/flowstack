/**
 * MembershipLayout Component
 * Main layout for the membership management module
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, CreditCard, BookOpen, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarUntitled } from '@/components/ui/sidebar-untitled';

const navItems = [
  { name: 'Plans', href: '/memberships/plans', icon: Users },
  { name: 'Members', href: '/memberships/members', icon: Users },
  { name: 'Content', href: '/memberships/content', icon: BookOpen },
  { name: 'Payments', href: '/memberships/payments', icon: CreditCard },
];

export function MembershipLayout() {
  const location = useLocation();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#D4AF37] text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
