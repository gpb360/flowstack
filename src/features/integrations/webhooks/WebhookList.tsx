import React, { useState } from 'react';
import { useWebhooks, useCreateWebhook, useDeleteWebhook, useUpdateWebhook } from '../lib/queries';
import { useConnection } from '../lib/queries';
import { Webhook, Plus, Trash2, Pause, Play, RefreshCw } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { TabsWithContent } from '@/components/ui/tabs-untitled';
import type { WebhookSubscription } from '../lib/types';

interface WebhookListProps {
  connectionId: string;
}

export const WebhookList: React.FC<WebhookListProps> = ({ connectionId }) => {
  const { data: webhooks, isLoading } = useWebhooks(connectionId);
  const { data: connection } = useConnection(connectionId);
  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const updateWebhook = useUpdateWebhook();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const handleToggleWebhook = async (webhook: WebhookSubscription) => {
    await updateWebhook.mutateAsync({
      webhookId: webhook.id,
      updates: {
        active: !webhook.active,
        status: !webhook.active ? 'active' : 'paused',
      },
    });
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (confirm('Are you sure you want to delete this webhook?')) {
      await deleteWebhook.mutateAsync({
        webhookId,
        connectionId,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  const activeWebhooks = webhooks?.filter((w) => w.active) ?? [];
  const pausedWebhooks = webhooks?.filter((w) => !w.active) ?? [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Webhooks</h3>
          <p className="text-sm text-text-secondary">
            Manage webhook subscriptions for {connection?.integration_id}
          </p>
        </div>
        <ButtonUntitled onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Webhook
        </ButtonUntitled>
      </div>

      {/* Webhooks */}
      <TabsWithContent
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          {
            id: 'active',
            label: `Active (${activeWebhooks.length})`,
            content: (
              activeWebhooks.length === 0 ? (
                <EmptyState
                  icon={Webhook}
                  title="No active webhooks"
                  description="Configure webhooks to receive real-time events from this integration"
                />
              ) : (
                <div className="space-y-3">
                  {activeWebhooks.map((webhook) => (
                    <WebhookListItem
                      key={webhook.id}
                      webhook={webhook}
                      onToggle={handleToggleWebhook}
                      onDelete={handleDeleteWebhook}
                    />
                  ))}
                </div>
              )
            ),
          },
          {
            id: 'paused',
            label: `Paused (${pausedWebhooks.length})`,
            content: (
              pausedWebhooks.length === 0 ? (
                <div className="text-center py-8 text-text-secondary">
                  No paused webhooks
                </div>
              ) : (
                <div className="space-y-3">
                  {pausedWebhooks.map((webhook) => (
                    <WebhookListItem
                      key={webhook.id}
                      webhook={webhook}
                      onToggle={handleToggleWebhook}
                      onDelete={handleDeleteWebhook}
                    />
                  ))}
                </div>
              )
            ),
          },
        ]}
      />

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CardUntitled className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Webhook</h3>
            <p className="text-text-secondary mb-4">
              Webhook configuration will be implemented here.
            </p>
            <div className="flex gap-2">
              <ButtonUntitled
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </ButtonUntitled>
              <ButtonUntitled
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
                disabled
              >
                Create
              </ButtonUntitled>
            </div>
          </CardUntitled>
        </div>
      )}
    </div>
  );
};

interface WebhookListItemProps {
  webhook: WebhookSubscription;
  onToggle: (webhook: WebhookSubscription) => void;
  onDelete: (webhookId: string) => void;
}

const WebhookListItem: React.FC<WebhookListItemProps> = ({ webhook, onToggle, onDelete }) => {
  return (
    <CardUntitled className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{webhook.event_type}</h4>
            <BadgeUntitled variant="outline" className="text-xs">
              {webhook.integration_id}
            </BadgeUntitled>
          </div>
          <p className="text-sm text-text-secondary font-mono truncate">
            {webhook.endpoint_url}
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
            <span>Total received: {webhook.total_received}</span>
            {webhook.last_received_at && (
              <span>
                Last:{' '}
                {new Date(webhook.last_received_at).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => onToggle(webhook)}
          >
            <Pause className="w-4 h-4" />
          </ButtonUntitled>
          <ButtonUntitled
            variant="outline"
            size="sm"
            onClick={() => onDelete(webhook.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </ButtonUntitled>
        </div>
      </div>
    </CardUntitled>
  );
};
