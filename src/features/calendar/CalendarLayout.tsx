/**
 * Calendar System Layout
 * Main layout for the calendar module with tabs navigation
 */

import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, CalendarClock, Settings, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'appointments', label: 'Appointments', icon: CalendarClock, path: '/calendar/appointments' },
  { id: 'availability', label: 'Availability', icon: CalendarDays, path: '/calendar/availability' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/calendar/settings' },
];

export function CalendarLayout() {
  const location = useLocation();
  const [activeTab, _setActiveTab] = useState(() => {
    const path = location.pathname;
    if (path === '/calendar') return 'calendar';
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/availability')) return 'availability';
    if (path.includes('/settings')) return 'settings';
    return 'calendar';
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar & Appointments</h1>
            <p className="text-sm text-muted-foreground">Manage your schedule and bookings</p>
          </div>

          {/* Custom Tabs */}
          <div className="flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === item.id
                    ? 'bg-[#D4AF37] text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
