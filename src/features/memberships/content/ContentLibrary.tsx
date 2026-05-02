/**
 * ContentLibrary Component
 * Manage membership content (courses, videos, documents)
 */

import { useState } from 'react';
import { Plus, Search, Filter, Grid, List, Play, FileText, Video, BookOpen } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useMembershipContent, useContentStats, usePublishContent } from '../hooks/useMembershipContent';
import { ContentEditor } from './ContentEditor';

export function ContentLibrary({ organizationId }: { organizationId: string }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showEditor, setShowEditor] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

  const { data: content, isLoading } = useMembershipContent(organizationId, {
    content_type: typeFilter === 'all' ? undefined : typeFilter,
    access_tier: tierFilter === 'all' ? undefined : tierFilter,
  });

  const { data: stats } = useContentStats(organizationId);
  const publishContent = usePublishContent();

  const filteredContent = content?.filter((c) => {
    const searchLower = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(searchLower) ||
      c.description?.toLowerCase().includes(searchLower)
    );
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleTogglePublish = async (contentId: string, currentStatus: boolean) => {
    await publishContent.mutateAsync({
      contentId,
      isPublished: !currentStatus,
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeaderUntitled
        title="Content Library"
        description="Manage courses, videos, and resources"
        actions={
          <ButtonUntitled variant="primary" onClick={() => { setEditingContent(null); setShowEditor(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </ButtonUntitled>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid gap-4 md:grid-cols-4 px-6">
          <CardUntitled>
            <CardUntitled.Content className="pt-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Content</div>
            </CardUntitled.Content>
          </CardUntitled>
          <CardUntitled>
            <CardUntitled.Content className="pt-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.published}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Published</div>
            </CardUntitled.Content>
          </CardUntitled>
          <CardUntitled>
            <CardUntitled.Content className="pt-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Views</div>
            </CardUntitled.Content>
          </CardUntitled>
          <CardUntitled>
            <CardUntitled.Content className="pt-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLikes}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Likes</div>
            </CardUntitled.Content>
          </CardUntitled>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 px-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500"
          />
        </div>

        <InputUntitled
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          type="select"
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'course', label: 'Courses' },
            { value: 'video', label: 'Videos' },
            { value: 'document', label: 'Documents' },
            { value: 'resource', label: 'Resources' },
          ]}
          className="w-[180px]"
        />

        <InputUntitled
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          type="select"
          options={[
            { value: 'all', label: 'All Tiers' },
            { value: 'free', label: 'Free' },
            { value: 'basic', label: 'Basic' },
            { value: 'premium', label: 'Premium' },
          ]}
          className="w-[180px]"
        />

        <div className="flex rounded-lg border border-gray-300 dark:border-gray-700">
          <ButtonUntitled
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </ButtonUntitled>
          <ButtonUntitled
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </ButtonUntitled>
        </div>
      </div>

      {/* Content Grid/List */}
      {isLoading ? (
        <div className="px-6 text-center text-gray-500 dark:text-gray-400">Loading content...</div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-3 px-6' : 'space-y-4 px-6'}>
          {filteredContent?.map((item) => (
            <CardUntitled key={item.id} className={viewMode === 'list' ? 'flex' : ''}>
              {item.thumbnail_url && viewMode === 'grid' && (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="h-48 w-full rounded-t-lg object-cover"
                />
              )}
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <CardUntitled.Header>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.content_type)}
                      <CardUntitled.Title className="text-lg">{item.title}</CardUntitled.Title>
                    </div>
                    <div className="flex gap-1">
                      <BadgeUntitled variant={item.is_published ? 'primary' : 'secondary'}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </BadgeUntitled>
                      <BadgeUntitled variant="outline">{item.access_tier}</BadgeUntitled>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </CardUntitled.Header>
                <CardUntitled.Content>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{item.content_type}</span>
                    {item.video_duration_seconds && (
                      <span>{Math.floor(item.video_duration_seconds / 60)} min</span>
                    )}
                    <span>{item.views || 0} views</span>
                  </div>
                </CardUntitled.Content>
              </div>
              <CardUntitled.Footer className={viewMode === 'list' ? 'flex flex-col gap-2' : ''}>
                <div className="flex gap-2 w-full">
                  <ButtonUntitled
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingContent(item);
                      setShowEditor(true);
                    }}
                  >
                    Edit
                  </ButtonUntitled>
                  <ButtonUntitled
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(item.id, item.is_published)}
                  >
                    {item.is_published ? 'Unpublish' : 'Publish'}
                  </ButtonUntitled>
                </div>
              </CardUntitled.Footer>
            </CardUntitled>
          ))}

          {filteredContent?.length === 0 && (
            <div className="col-span-full p-12 text-center text-gray-500 dark:text-gray-400">
              No content found. Create your first piece of content to get started.
            </div>
          )}
        </div>
      )}

      {showEditor && (
        <ContentEditor
          organizationId={organizationId}
          content={editingContent}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
