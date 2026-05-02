import { useState } from 'react';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { X } from 'lucide-react';
import { getPlatformConfig, type SocialPlatform } from '../lib/platforms';

interface ConnectAccountProps {
  onClose: () => void;
  onConnect: (platform: SocialPlatform) => void;
}

export function ConnectAccount({ onClose, onConnect }: ConnectAccountProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const platforms: SocialPlatform[] = ['facebook', 'twitter', 'linkedin', 'instagram', 'tiktok', 'pinterest', 'youtube'];

  const handleConnect = async (platform: SocialPlatform) => {
    setIsConnecting(true);
    try {
      // Redirect to OAuth flow
      const authUrl = `/api/social/oauth/${platform}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect account:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Connect Social Account</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {platforms.map((platform) => {
              const config = getPlatformConfig(platform);

              return (
                <button
                  key={platform}
                  onClick={() => handleConnect(platform)}
                  disabled={isConnecting}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  <div
                    className="text-4xl"
                    style={{ color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-text-secondary">
                      {config.supportsSchedule ? 'Schedule posts' : 'Post only'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-background-secondary rounded-lg">
            <p className="text-sm text-text-secondary">
              <strong>Note:</strong> You'll be redirected to {selectedPlatform ? getPlatformConfig(selectedPlatform).name : 'the platform'} to authorize FlowStack.
              We only request permissions necessary for posting and analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
