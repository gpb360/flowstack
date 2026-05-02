/**
 * Phone System Layout
 * Main layout for the phone module with sidebar navigation
 */

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Phone, PhoneIncoming, PhoneOutgoing, Voicemail, MessageSquare, Settings, Hash } from 'lucide-react';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { useNewVoicemailsCount, useUnreadSMSCount } from './hooks';

export function PhoneLayout() {
  const location = useLocation();
  const { data: newVoicemails } = useNewVoicemailsCount();
  const { data: unreadSMS } = useUnreadSMSCount();

  const navigation = [
    {
      name: 'Dialer',
      href: '/phone',
      icon: Phone,
      end: true,
    },
    {
      name: 'Calls',
      href: '/phone/calls',
      icon: PhoneOutgoing,
    },
    {
      name: 'Voicemail',
      href: '/phone/voicemail',
      icon: Voicemail,
      badge: newVoicemails || 0,
    },
    {
      name: 'Messages',
      href: '/phone/sms',
      icon: MessageSquare,
      badge: unreadSMS || 0,
    },
    {
      name: 'Numbers',
      href: '/phone/numbers',
      icon: Hash,
    },
  ];

  const getBadgeVariant = (count: number) => {
    return count > 0 ? 'error' : 'neutral';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="border-b p-4">
          <h1 className="text-xl font-bold">Phone System</h1>
          <p className="text-sm text-gray-600">Twilio-powered calling & messaging</p>
        </div>

        <nav className="space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = item.end
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <BadgeUntitled variant={getBadgeVariant(item.badge) as any} size="sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </BadgeUntitled>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings Link */}
        <div className="absolute bottom-0 left-0 w-64 border-t bg-white p-2">
          <NavLink
            to="/phone/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
