import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { ArrowLeft, Edit, Trash2, Calendar, Share2 } from 'lucide-react';
import { useSocialPost } from '../hooks/useSocialPosts';
import { format } from 'date-fns';
import { getPlatformConfig } from '../lib/platforms';
import type { SocialPlatform } from '../lib/platforms';

export function PostDetails() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = useSocialPost(postId || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-secondary">Post not found</p>
        <Button onClick={() => navigate('/social/posts')} className="mt-4">
          Back to Posts
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Post Details"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/social/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Publish Now
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Post Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content</CardTitle>
              <Badge>{post.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>

            {post.media_urls && post.media_urls.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {post.media_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {post.link_url && (
              <div className="mt-4 p-4 border rounded-lg">
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {post.link_title || post.link_url}
                </a>
                {post.link_description && (
                  <p className="text-sm text-text-secondary mt-1">{post.link_description}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Scheduled Posts */}
        {post.social_scheduled_posts && post.social_scheduled_posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {post.social_scheduled_posts.map((scheduled: any) => (
                  <div key={scheduled.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">
                        {getPlatformConfig(scheduled.social_accounts.platform as SocialPlatform).icon}
                      </div>
                      <div>
                        <div className="font-medium">{scheduled.social_accounts.account_name}</div>
                        <div className="text-sm text-text-secondary">
                          {format(new Date(scheduled.scheduled_for), 'MMMM d, yyyy at h:mm a')}
                        </div>
                      </div>
                    </div>
                    <Badge>{scheduled.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Created</dt>
                <dd>{format(new Date(post.created_at), 'MMMM d, yyyy')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Post Type</dt>
                <dd className="capitalize">{post.post_type}</dd>
              </div>
              {post.campaign_id && (
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Campaign</dt>
                  <dd>{post.campaign_id}</dd>
                </div>
              )}
              {post.internal_notes && (
                <div>
                  <dt className="text-text-secondary mb-1">Internal Notes</dt>
                  <dd className="text-sm bg-background-secondary p-2 rounded">
                    {post.internal_notes}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
