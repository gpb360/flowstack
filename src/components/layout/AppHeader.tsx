import React from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/context/AuthContext';

export const AppHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="search"
            placeholder="Search... (⌘K)"
            className="pl-9 bg-surface-hover border-border text-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <ButtonUntitled variant="ghost" size="icon" isIconOnly className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
            </ButtonUntitled>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <h3 className="font-semibold">Notifications</h3>
              <div className="space-y-2">
                <div className="text-sm text-text-muted">No new notifications</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <ButtonUntitled variant="ghost" size="icon" isIconOnly>
          <Settings className="w-4 h-4" />
        </ButtonUntitled>

        {/* User Avatar */}
        <Popover>
          <PopoverTrigger asChild>
            <ButtonUntitled variant="ghost">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ButtonUntitled>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48">
            <div className="space-y-2">
              <div className="text-sm font-medium">{user?.email}</div>
              <hr className="border-border" />
              <button className="w-full text-left text-sm hover:bg-surface-hover rounded px-2 py-1">
                Profile Settings
              </button>
              <button className="w-full text-left text-sm hover:bg-surface-hover rounded px-2 py-1">
                Organization
              </button>
              <hr className="border-border" />
              <button
                onClick={() => (window.location.href = '/auth')}
                className="w-full text-left text-sm text-error hover:bg-error/10 rounded px-2 py-1"
              >
                Sign Out
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
};
