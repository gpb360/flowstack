import React, { useState } from 'react';
import type { IntegrationDefinition } from '../lib/registry';
import { Plug, CheckCircle, ExternalLink } from 'lucide-react';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';

interface IntegrationCardProps {
  integration: IntegrationDefinition;
  onConnect: (integrationId: string) => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConnect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getAuthBadge = () => {
    switch (integration.authType) {
      case 'oauth':
        return 'OAuth';
      case 'api_key':
        return 'API Key';
      case 'basic':
        return 'Basic Auth';
      case 'custom':
        return 'Custom';
      default:
        return 'Free';
    }
  };

  const actionCount = integration.actions?.length || 0;
  const triggerCount = integration.triggers?.length || 0;

  return (
    <CardUntitled
      className="p-4 cursor-pointer transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onConnect(integration.id)}
    >
      <div className="flex items-start gap-4">
        {/* Integration Icon */}
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: integration.color ? integration.color + '20' : '#F3F4F6' }}
        >
          {typeof integration.icon === 'string' ? (
            <img src={integration.icon} alt={integration.name} className="w-6 h-6" />
          ) : (
            <Plug className="w-6 h-6" style={{ color: integration.color || '#6B7280' }} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{integration.name}</h3>
            {integration.webhookSupport && (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
            {integration.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            <BadgeUntitled variant="outline" className="text-xs">
              {getAuthBadge()}
            </BadgeUntitled>
            {actionCount > 0 && (
              <BadgeUntitled variant="outline" className="text-xs">
                {actionCount} Actions
              </BadgeUntitled>
            )}
            {triggerCount > 0 && (
              <BadgeUntitled variant="outline" className="text-xs">
                {triggerCount} Triggers
              </BadgeUntitled>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <ButtonUntitled
              size="sm"
              className="flex-1 mr-2"
              onClick={(e) => {
                e.stopPropagation();
                onConnect(integration.id);
              }}
            >
              Connect
            </ButtonUntitled>

            {integration.documentation && (
              <a
                href={integration.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Hover overlay with quick info */}
      {isHovered && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-lg p-4 flex flex-col justify-center animate-in fade-in">
          <div className="text-sm space-y-2">
            <div>
              <span className="font-medium">Category:</span>{' '}
              <span className="text-text-secondary capitalize">{integration.category}</span>
            </div>
            {actionCount > 0 && (
              <div>
                <span className="font-medium">Actions:</span>{' '}
                <span className="text-text-secondary">
                  {integration.actions?.slice(0, 3).map((a) => a.name).join(', ')}
                  {actionCount > 3 && ` +${actionCount - 3} more`}
                </span>
              </div>
            )}
            {triggerCount > 0 && (
              <div>
                <span className="font-medium">Triggers:</span>{' '}
                <span className="text-text-secondary">
                  {integration.triggers?.slice(0, 3).map((t) => t.name).join(', ')}
                  {triggerCount > 3 && ` +${triggerCount - 3} more`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </CardUntitled>
  );
};
