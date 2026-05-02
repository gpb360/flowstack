// @ts-nocheck
import { useState } from 'react';
import { Button } from '@/components/ui/button-untitled';
import { Textarea } from '@/components/ui/textarea-untitled';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { Loader2, Save, Calendar, Send, Eye, Settings } from 'lucide-react';
import { useSocialAccounts } from '../hooks/useSocialAccounts';
import { useSocialAccounts as useAccounts } from '../hooks/useSocialAccounts';
import { useSocialMedia } from '../hooks/useMediaLibrary';
import type { PostData, MediaFile } from '../lib/composer';
import { PostPreview } from './PostPreview';
import { MediaUploader } from './MediaUploader';
import { EmojiPicker } from './EmojiPicker';
import { HashtagSuggestions } from './HashtagSuggestions';
import { SchedulePicker } from './SchedulePicker';
import { AccountSelector } from './AccountSelector';
import { cn } from '@/lib/utils';

interface PostComposerProps {
  initialData?: Partial<PostData>;
  onSave?: (postId: string) => void;
  onSchedule?: (postId: string) => void;
}

export function PostComposer({ initialData, onSave, onSchedule }: PostComposerProps) {
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(initialData?.selectedAccounts || []);
  const [media, setMedia] = useState<MediaFile[]>(initialData?.media || []);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(initialData?.scheduledFor || null);
  const [linkUrl, setLinkUrl] = useState(initialData?.linkUrl || '');
  const [linkTitle, setLinkTitle] = useState(initialData?.linkTitle || '');
  const [linkDescription, setLinkDescription] = useState(initialData?.linkDescription || '');
  const [activeTab, setActiveTab] = useState<'preview' | 'accounts' | 'schedule' | 'settings'>('preview');

  const { createPost, isCreating } = useSocialPosts();
  const { accounts, isLoading: isLoadingAccounts } = useAccounts();
  const { uploadMedia, isUploading } = useSocialMedia();

  const selectedAccountsData = accounts.filter(acc => selectedAccounts.includes(acc.id));

  const handleSaveDraft = async () => {
    try {
      const postData: PostData = {
        content,
        media,
        scheduledFor: null,
        selectedAccounts,
        linkUrl: linkUrl || undefined,
        linkTitle: linkTitle || undefined,
        linkDescription: linkDescription || undefined,
        postType: 'post',
      };

      const postId = await createPost(postData);
      onSave?.(postId);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledFor) {
      alert('Please select a date and time to schedule');
      return;
    }

    if (selectedAccounts.length === 0) {
      alert('Please select at least one account');
      return;
    }

    try {
      const postData: PostData = {
        content,
        media,
        scheduledFor,
        selectedAccounts,
        linkUrl: linkUrl || undefined,
        linkTitle: linkTitle || undefined,
        linkDescription: linkDescription || undefined,
        postType: 'post',
      };

      const postId = await createPost(postData);
      onSchedule?.(postId);
    } catch (error) {
      console.error('Failed to schedule post:', error);
    }
  };

  const handleMediaUpload = async (files: FileList) => {
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadMedia(file);
        setMedia(prev => [...prev, {
          id: uploaded.id,
          type: uploaded.file_type,
          url: uploaded.file_url,
          thumbnail: uploaded.thumbnail_url || uploaded.file_url,
          width: uploaded.width || undefined,
          height: uploaded.height || undefined,
          duration: uploaded.duration_seconds || undefined,
        }]);
      }
    } catch (error) {
      console.error('Failed to upload media:', error);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji);
  };

  const handleHashtagSelect = (hashtag: string) => {
    setContent(prev => prev + hashtag);
  };

  const characterCount = content.length;
  const maxChars = Math.max(...selectedAccountsData.map(acc => {
    const config = acc.platform === 'twitter' ? 280 : acc.platform === 'instagram' ? 2200 : 63206;
    return config;
  }), 63206);

  return (
    <div className="flex gap-6 h-full">
      {/* Main Composer */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Create Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Content Input */}
            <div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share?"
                className="min-h-[200px] resize-none"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-text-secondary">
                <span>{characterCount} / {maxChars} characters</span>
                {characterCount > maxChars && (
                  <span className="text-red-500">Exceeds limit for some platforms</span>
                )}
              </div>
            </div>

            {/* Media Preview */}
            {media.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {media.map((file) => (
                  <div key={file.id} className="relative group">
                    {file.type === 'image' ? (
                      <img
                        src={file.thumbnail || file.url}
                        alt={file.altText || 'Media'}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ) : (
                      <video
                        src={file.url}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveMedia(file.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Link Preview */}
            {linkUrl && (
              <div className="border rounded-lg p-3">
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Link title"
                  className="font-medium w-full mb-1 border-0 p-0 focus:ring-0"
                />
                <input
                  type="text"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Link description"
                  className="text-sm text-text-secondary w-full border-0 p-0 focus:ring-0"
                />
              </div>
            )}

            {/* Composer Toolbar */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <MediaUploader onUpload={handleMediaUpload} isUploading={isUploading} />
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <HashtagSuggestions content={content} onSelect={handleHashtagSelect} />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isCreating || !content.trim()}
                >
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Draft
                </Button>
                <Button
                  onClick={handleSchedule}
                  disabled={isCreating || !content.trim() || !scheduledFor}
                >
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="w-96">
        <Card>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="accounts">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Calendar className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Send className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="p-4">
              <PostPreview
                content={content}
                media={media}
                accounts={selectedAccountsData}
              />
            </TabsContent>

            <TabsContent value="accounts" className="p-4">
              <AccountSelector
                accounts={accounts}
                selected={selectedAccounts}
                onChange={setSelectedAccounts}
                isLoading={isLoadingAccounts}
              />
            </TabsContent>

            <TabsContent value="schedule" className="p-4">
              <SchedulePicker
                value={scheduledFor}
                onChange={setScheduledFor}
              />
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Link URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {linkUrl && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Link Title</label>
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Link title"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Link Description</label>
                    <Textarea
                      value={linkDescription}
                      onChange={(e) => setLinkDescription(e.target.value)}
                      placeholder="Link description"
                      className="min-h-[80px]"
                    />
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
