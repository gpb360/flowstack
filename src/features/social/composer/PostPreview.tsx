import { Card, CardContent } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { formatDistanceToNow } from 'date-fns';
import type { SocialAccount } from '../hooks/useSocialAccounts';
import type { MediaFile } from '../lib/composer';
import { getPlatformConfig } from '../lib/platforms';

interface PostPreviewProps {
  content: string;
  media: MediaFile[];
  accounts: SocialAccount[];
}

export function PostPreview({ content, media, accounts }: PostPreviewProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <p>Select accounts to see preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => {
        const config = getPlatformConfig(account.platform);
        const characterCount = content.length;
        const characterLimit = config.characterLimit;
        const isOverLimit = characterCount > characterLimit;

        return (
          <div key={account.id}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="text-xl"
                style={{ color: config.color }}
              >
                {config.icon}
              </div>
              <span className="font-medium">{config.name}</span>
              {isOverLimit && (
                <Badge variant="destructive">Over limit</Badge>
              )}
            </div>

            <Card>
              <CardContent className="p-4">
                {/* Platform-specific preview */}
                {account.platform === 'twitter' && (
                  <TwitterPreview content={content} media={media} />
                )}
                {account.platform === 'instagram' && (
                  <InstagramPreview content={content} media={media} />
                )}
                {account.platform === 'linkedin' && (
                  <LinkedInPreview content={content} media={media} />
                )}
                {account.platform === 'facebook' && (
                  <FacebookPreview content={content} media={media} />
                )}
                {account.platform === 'tiktok' && (
                  <TikTokPreview content={content} media={media} />
                )}
                {account.platform === 'pinterest' && (
                  <PinterestPreview content={content} media={media} />
                )}
                {account.platform === 'youtube' && (
                  <YouTubePreview content={content} media={media} />
                )}

                {/* Character count */}
                <div className="mt-3 text-xs text-text-secondary">
                  {characterCount} / {characterLimit} characters
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function TwitterPreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1">
          <div className="font-bold">User Name</div>
          <div className="text-text-secondary text-sm">@username</div>
        </div>
      </div>
      <div className="whitespace-pre-wrap">{content || 'Your tweet will appear here...'}</div>
      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
          {media.slice(0, 4).map((file) => (
            <div key={file.id} className="aspect-square bg-gray-100">
              {file.type === 'image' ? (
                <img src={file.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={file.url} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InstagramPreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <div className="font-bold">username</div>
        </div>
      </div>
      {media.length > 0 ? (
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {media[0].type === 'image' ? (
            <img src={media[0].url} alt="" className="w-full h-full object-cover" />
          ) : (
            <video src={media[0].url} className="w-full h-full object-cover" />
          )}
        </div>
      ) : (
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-text-secondary">Instagram requires an image or video</span>
        </div>
      )}
      <div className="whitespace-pre-wrap">{content || 'Your caption will appear here...'}</div>
    </div>
  );
}

function LinkedInPreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div>
          <div className="font-bold">User Name</div>
          <div className="text-text-secondary text-sm">Headline • Connection</div>
        </div>
      </div>
      <div className="whitespace-pre-wrap">{content || 'Your post will appear here...'}</div>
      {media.length > 0 && (
        <div className="rounded-lg overflow-hidden">
          <img src={media[0].url} alt="" className="w-full" />
        </div>
      )}
    </div>
  );
}

function FacebookPreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div>
          <div className="font-bold">User Name</div>
          <div className="text-text-secondary text-sm">Just now • 🌍</div>
        </div>
      </div>
      <div className="whitespace-pre-wrap">{content || 'Your post will appear here...'}</div>
      {media.length > 0 && (
        <div className="rounded-lg overflow-hidden">
          <img src={media[0].url} alt="" className="w-full" />
        </div>
      )}
    </div>
  );
}

function TikTokPreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden relative">
        {media.length > 0 && media[0].type === 'video' ? (
          <video src={media[0].url} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-secondary">TikTok requires a video</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50">
          <div className="text-white text-sm">@username</div>
          <div className="text-white text-xs mt-1">{content || 'Your caption...'}</div>
        </div>
      </div>
    </div>
  );
}

function PinterestPreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
        {media.length > 0 && media[0].type === 'image' ? (
          <img src={media[0].url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-text-secondary">Pinterest requires an image</span>
          </div>
        )}
      </div>
      <div className="whitespace-pre-wrap text-sm">{content || 'Your pin description...'}</div>
    </div>
  );
}

function YouTubePreview({ content, media }: { content: string; media: MediaFile[] }) {
  return (
    <div className="space-y-3">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        {media.length > 0 && media[0].type === 'video' ? (
          <video src={media[0].url} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-text-secondary">YouTube requires a video</span>
          </div>
        )}
      </div>
      <div>
        <div className="font-bold">Video Title</div>
        <div className="text-sm text-text-secondary">0 views</div>
      </div>
      <div className="whitespace-pre-wrap text-sm">{content || 'Your video description...'}</div>
    </div>
  );
}
