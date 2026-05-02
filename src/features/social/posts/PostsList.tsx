// @ts-nocheck
import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTable } from '@/components/ui/data-table';
import { PenTool, Trash2, Eye, Calendar, Filter } from 'lucide-react';
import { useSocialPosts } from '../hooks/useSocialPosts';
import { format } from 'date-fns';
import { getPlatformConfig } from '../lib/platforms';
import type { SocialPlatform } from '../lib/platforms';

export function PostsList() {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { posts, isLoading, deletePost } = useSocialPosts();

  const filteredPosts = posts.filter(post => {
    if (selectedStatus === 'all') return true;
    return post.status === selectedStatus;
  });

  const columns = [
    {
      id: 'content',
      header: 'Content',
      cell: (row: any) => (
        <div className="max-w-md">
          <p className="line-clamp-2">{row.content}</p>
          {row.media_urls && row.media_urls.length > 0 && (
            <div className="flex gap-1 mt-1">
              {row.media_urls.slice(0, 3).map((url: string, i: number) => (
                <img key={i} src={url} alt="" className="w-10 h-10 object-cover rounded" />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'accounts',
      header: 'Accounts',
      cell: (row: any) => (
        <div className="flex gap-1">
          {row.social_scheduled_posts?.map((scheduled: any) => (
            <Badge key={scheduled.id} variant="secondary">
              {getPlatformConfig(scheduled.social_accounts.platform as SocialPlatform).icon}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: any) => {
        const statusColors: Record<string, string> = {
          draft: 'bg-gray-100 text-gray-800',
          scheduled: 'bg-[#D4AF37]/10 text-[#D4AF37]',
          publishing: 'bg-yellow-100 text-yellow-800',
          published: 'bg-green-100 text-green-800',
          failed: 'bg-red-100 text-red-800',
          cancelled: 'bg-gray-100 text-gray-800',
        };

        return (
          <Badge className={statusColors[row.status] || 'bg-gray-100'}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      id: 'scheduled_for',
      header: 'Scheduled',
      cell: (row: any) => {
        const scheduledPost = row.social_scheduled_posts?.[0];
        if (!scheduledPost) return '-';
        return format(new Date(scheduledPost.scheduled_for), 'MMM d, h:mm a');
      },
    },
    {
      id: 'created_at',
      header: 'Created',
      cell: (row: any) => format(new Date(row.created_at), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <PenTool className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deletePost(row.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Posts"
        description="Manage your social media posts"
        actions={
          <Button onClick={() => window.location.href = '/social/composer'}>
            <PenTool className="mr-2 h-4 w-4" />
            New Post
          </Button>
        }
      />

      <div className="flex-1 overflow-auto">
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No posts yet"
                description="Create your first social media post to get started"
                action={{
                  label: 'Create Post',
                  onClick: () => window.location.href = '/social/composer',
                }}
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredPosts}
                pagination
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
