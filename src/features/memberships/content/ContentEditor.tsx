/**
 * ContentEditor Component
 * Create or edit membership content
 */

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { TabsUntitled } from '@/components/ui/tabs-untitled';
import { useSaveContent } from '../hooks/useMembershipContent';

interface ContentEditorProps {
  organizationId: string;
  content?: any;
  onClose: () => void;
}

export function ContentEditor({ organizationId, content, onClose }: ContentEditorProps) {
  const saveContent = useSaveContent();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    content_type: 'video' as 'course' | 'video' | 'document' | 'resource' | 'live_event',
    content_body: '',
    thumbnail_url: '',
    video_url: '',
    file_url: '',
    access_tier: 'free',
    require_subscription: false,
    drip_delay_days: 0,
    is_published: false,
    order_index: 0,
    parent_content_id: null as string | null,
    settings: {},
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        description: content.description || '',
        slug: content.slug || '',
        content_type: content.content_type || 'video',
        content_body: content.content_body || '',
        thumbnail_url: content.thumbnail_url || '',
        video_url: content.video_url || '',
        file_url: content.file_url || '',
        access_tier: content.access_tier || 'free',
        require_subscription: content.require_subscription || false,
        drip_delay_days: content.drip_delay_days || 0,
        is_published: content.is_published || false,
        order_index: content.order_index || 0,
        parent_content_id: content.parent_content_id || null,
        settings: content.settings || {},
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await saveContent.mutateAsync({
        organizationId,
        content: formData,
      });
      onClose();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white dark:bg-gray-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {content ? 'Edit Content' : 'Create Content'}
          </h2>
          <ButtonUntitled variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </ButtonUntitled>
        </div>

        <form onSubmit={handleSubmit}>
          <TabsUntitled defaultValue="basic">
            <TabsUntitled.List className="mb-6">
              <TabsUntitled.Trigger value="basic">Basic Info</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="content">Content</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="access">Access</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="settings">Settings</TabsUntitled.Trigger>
            </TabsUntitled.List>

            <TabsUntitled.Content value="basic" className="space-y-4">
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title>Basic Information</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content className="space-y-4">
                  <div>
                    <InputUntitled
                      id="title"
                      label="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Introduction to React"
                      required
                    />
                  </div>

                  <div>
                    <TextareaUntitled
                      id="description"
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Learn the basics of React..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <InputUntitled
                      id="slug"
                      label="URL Slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="introduction-to-react"
                      required
                    />
                  </div>

                  <div>
                    <InputUntitled
                      id="type"
                      label="Content Type"
                      value={formData.content_type}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value as any })}
                      type="select"
                      options={[
                        { value: 'course', label: 'Course' },
                        { value: 'video', label: 'Video' },
                        { value: 'document', label: 'Document' },
                        { value: 'resource', label: 'Resource' },
                        { value: 'live_event', label: 'Live Event' },
                      ]}
                    />
                  </div>

                  <div>
                    <InputUntitled
                      id="order"
                      label="Display Order"
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>

            <TabsUntitled.Content value="content" className="space-y-4">
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title>Content Details</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content className="space-y-4">
                  {formData.content_type === 'video' && (
                    <>
                      <div>
                        <InputUntitled
                          id="video_url"
                          label="Video URL"
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </>
                  )}

                  {formData.content_type === 'document' && (
                    <>
                      <div>
                        <InputUntitled
                          id="file_url"
                          label="File URL"
                          value={formData.file_url}
                          onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                          placeholder="https://s3.amazonaws.com/..."
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <InputUntitled
                      id="thumbnail"
                      label="Thumbnail URL"
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <TextareaUntitled
                      id="body"
                      label="Content Body"
                      value={formData.content_body}
                      onChange={(e) => setFormData({ ...formData, content_body: e.target.value })}
                      placeholder="HTML content or detailed description..."
                      rows={10}
                    />
                  </div>
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>

            <TabsUntitled.Content value="access" className="space-y-4">
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title>Access Control</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content className="space-y-4">
                  <div>
                    <InputUntitled
                      id="tier"
                      label="Access Tier"
                      value={formData.access_tier}
                      onChange={(e) => setFormData({ ...formData, access_tier: e.target.value })}
                      type="select"
                      options={[
                        { value: 'free', label: 'Free' },
                        { value: 'basic', label: 'Basic' },
                        { value: 'premium', label: 'Premium' },
                        { value: 'vip', label: 'VIP' },
                      ]}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label htmlFor="require_subscription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Subscription
                    </label>
                    <input
                      type="checkbox"
                      id="require_subscription"
                      checked={formData.require_subscription}
                      onChange={(e) => setFormData({ ...formData, require_subscription: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <InputUntitled
                      id="drip"
                      label="Drip Content Delay (Days)"
                      type="number"
                      value={formData.drip_delay_days}
                      onChange={(e) => setFormData({ ...formData, drip_delay_days: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Number of days after subscription before this content becomes available
                    </p>
                  </div>
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>

            <TabsUntitled.Content value="settings" className="space-y-4">
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title>Publication Settings</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Published
                    </label>
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                  </div>
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>
          </TabsUntitled>

          <div className="mt-6 flex justify-end gap-4">
            <ButtonUntitled type="button" variant="outline" onClick={onClose}>
              Cancel
            </ButtonUntitled>
            <ButtonUntitled type="submit" variant="primary" disabled={saveContent.isPending}>
              {saveContent.isPending ? 'Saving...' : 'Save Content'}
              <Save className="ml-2 h-4 w-4" />
            </ButtonUntitled>
          </div>
        </form>
      </div>
    </div>
  );
}
