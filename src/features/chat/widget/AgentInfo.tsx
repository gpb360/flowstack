/**
 * Agent Info Component
 * Displays agent information in the chat header
 */

import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AgentInfo } from '../types';

interface AgentInfoProps {
  agent: AgentInfo | undefined;
  showStatus?: boolean;
}

export function AgentInfo({ agent, showStatus = true }: AgentInfoProps) {
  if (!agent) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="text-white">
          <p className="font-semibold">Chat Support</p>
          <p className="text-xs opacity-90">Online</p>
        </div>
      </div>
    );
  }

  const isOnline = agent.status === 'online';
  const isAway = agent.status === 'away';
  const isBusy = agent.status === 'busy';

  return (
    <div className="flex items-center gap-3">
      {agent.avatar ? (
        <div className="relative">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="h-10 w-10 rounded-full border-2 border-white object-cover"
          />
          {showStatus && (
            <span
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                isOnline && 'bg-green-500',
                isAway && 'bg-yellow-500',
                isBusy && 'bg-red-500'
              )}
            />
          )}
        </div>
      ) : (
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <User className="h-5 w-5 text-white" />
          {showStatus && (
            <span
              className={cn(
                'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white',
                isOnline && 'bg-green-500',
                isAway && 'bg-yellow-500',
                isBusy && 'bg-red-500'
              )}
            />
          )}
        </div>
      )}

      <div className="text-white">
        <p className="font-semibold">{agent.name}</p>
        {agent.title && <p className="text-xs opacity-90">{agent.title}</p>}
        {showStatus && (
          <p className="text-xs opacity-90">
            {isOnline && 'Online'}
            {isAway && 'Away'}
            {isBusy && 'Busy'}
            {!isOnline && !isAway && !isBusy && 'Offline'}
          </p>
        )}
      </div>
    </div>
  );
}
