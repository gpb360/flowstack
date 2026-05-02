/**
 * Chat Launcher Component
 * Floating button that opens/closes the chat widget
 */

import { X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import type { ChatLauncherProps } from '../types';

export function ChatLauncher({
  isOpen,
  onClick,
  theme,
  unreadCount = 0,
}: ChatLauncherProps) {
  const position = theme?.position || 'bottom-right';
  const color = theme?.color || '#3B82F6';

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  return (
    <ButtonUntitled
      variant="primary"
      size="lg"
      isIconOnly
      onClick={onClick}
      className={cn('fixed z-50 shadow-lg', positionClasses[position])}
      style={{
        backgroundColor: color,
        borderRadius: '50%',
        width: '56px',
        height: '56px',
      }}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <>
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <BadgeUntitled
              variant="error"
              size="sm"
              className="absolute -right-1 -top-1"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </BadgeUntitled>
          )}
        </>
      )}
    </ButtonUntitled>
  );
}
