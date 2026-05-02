/**
 * Review Sources List Component
 * Displays connected review platforms
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Star, Plus, Settings, RefreshCw } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useReviewSources } from '../hooks/useReviewSources';
import { useSyncReviews } from '../hooks/useReviews';
import { cn } from '@/lib/utils';

export function SourcesList() {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const { data: sources, isLoading } = useReviewSources();
  const syncReviews = useSyncReviews();

  const handleSync = async (sourceId: string) => {
    await syncReviews.mutate(sourceId);
  };

  if (isLoading) {
    return <div>Loading sources...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeaderUntitled
        title="Review Sources"
        description="Connected review platforms and sync settings"
        actions={
          <ButtonUntitled onClick={() => setShowConnectDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Connect Source
          </ButtonUntitled>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sources?.map((source) => (
          <SourceCard key={source.id} source={source} onSync={handleSync} isSyncing={syncReviews.isPending} />
        ))}
      </div>

      {showConnectDialog && (
        <ConnectSourceDialog onClose={() => setShowConnectDialog(false)} />
      )}
    </div>
  );
}

function SourceCard({ source, onSync, isSyncing }: { source: any; onSync: (id: string) => void; isSyncing?: boolean }) {
  const platformConfig = getPlatformConfig(source.platform);

  const getBadgeVariant = (status: string, isEnabled: boolean): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
    if (status === 'active' || isEnabled) return 'success';
    return 'neutral';
  };

  return (
    <CardUntitled>
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', platformConfig.bgColor)}>
            <platformConfig.icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">{source.business_name}</div>
            <div className="text-sm text-muted-foreground">{platformConfig.name}</div>
          </div>
        </div>
        <BadgeUntitled variant={getBadgeVariant(source.status, false)} size="sm">
          {source.status}
        </BadgeUntitled>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Average Rating</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{source.average_rating?.toFixed(1) || '-'}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Reviews</span>
          <span className="font-medium">{source.total_reviews}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sync Status</span>
          <span className="text-muted-foreground">
            {source.last_synced_at
              ? formatDistanceToNow(new Date(source.last_synced_at), { addSuffix: true })
              : 'Never'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Auto-Response</span>
          <BadgeUntitled variant={getBadgeVariant('', source.auto_response_enabled)} size="sm">
            {source.auto_response_enabled ? 'Enabled' : 'Disabled'}
          </BadgeUntitled>
        </div>
        {source.error_message && (
          <div className="rounded bg-red-50 p-2 text-xs text-red-600">
            {source.error_message}
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <ButtonUntitled
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onSync(source.id)}
          disabled={isSyncing}
        >
          <RefreshCw className={cn('mr-2 h-3 w-3', isSyncing && 'animate-spin')} />
          Sync Now
        </ButtonUntitled>
        <ButtonUntitled variant="outline" size="sm" isIconOnly>
          <Settings className="h-4 w-4" />
        </ButtonUntitled>
      </div>
    </CardUntitled>
  );
}

function getPlatformConfig(platform: string) {
  const configs: Record<string, { name: string; bgColor: string; icon: any }> = {
    google: { name: 'Google', bgColor: 'bg-blue-100 text-blue-600', icon: Star },
    yelp: { name: 'Yelp', bgColor: 'bg-red-100 text-red-600', icon: Star },
    facebook: { name: 'Facebook', bgColor: 'bg-blue-100 text-blue-600', icon: Star },
    tripadvisor: { name: 'TripAdvisor', bgColor: 'bg-green-100 text-green-600', icon: Star },
    trustpilot: { name: 'Trustpilot', bgColor: 'bg-blue-100 text-blue-600', icon: Star },
    zomato: { name: 'Zomato', bgColor: 'bg-red-100 text-red-600', icon: Star },
    opentable: { name: 'OpenTable', bgColor: 'bg-yellow-100 text-yellow-600', icon: Star },
  };

  return configs[platform] || { name: platform, bgColor: 'bg-gray-100 text-gray-600', icon: Star };
}

function ConnectSourceDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="text-xl font-bold">Connect Review Source</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a platform to connect and start aggregating reviews
        </p>
        <div className="mt-4 space-y-2">
          {['Google', 'Yelp', 'Facebook', 'TripAdvisor'].map((platform) => (
            <button
              key={platform}
              className="w-full rounded border border-gray-300 p-3 text-left hover:bg-gray-50 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              onClick={() => {
                // Handle connection
                onClose();
              }}
            >
              {platform}
            </button>
          ))}
        </div>
        <ButtonUntitled variant="secondary" className="mt-4 w-full" onClick={onClose}>
          Cancel
        </ButtonUntitled>
      </div>
    </div>
  );
}
