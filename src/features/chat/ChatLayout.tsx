/**
 * Chat Layout Component
 * Main layout for the Chat module with navigation
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { MessageSquare, Inbox, BarChart2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatLayout() {
  const location = useLocation();

  const navItems = [
    { href: '/chat', label: 'Inbox', icon: Inbox },
    { href: '/chat/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/chat/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Live Chat</h1>
          </div>
        </div>

        <nav className="px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
