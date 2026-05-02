import { format, startOfDay, endOfDay, addHours } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { Button } from '@/components/ui/button-untitled';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { useScheduledPosts } from '../hooks/useSocialPosts';
import { getPlatformConfig } from '../lib/platforms';
import type { SocialPlatform } from '../lib/platforms';

interface DayViewProps {
  date: Date;
  onPostClick?: (postId: string) => void;
}

export function DayView({ date, onPostClick }: DayViewProps) {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const { data: scheduledPosts = [], isLoading } = useScheduledPosts(dayStart, dayEnd);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getPostsForHour = (hour: number) => {
    return scheduledPosts.filter(post => {
      const postHour = new Date(post.scheduled_for).getHours();
      return postHour === hour;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-2">
        <div className="text-lg font-bold mb-4">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </div>

        {hours.map((hour) => {
          const posts = getPostsForHour(hour);

          return (
            <div key={hour} className="flex gap-4">
              <div className="w-16 text-right text-sm text-text-secondary">
                <Clock className="h-3 w-3 inline mr-1" />
                {hour.toString().padStart(2, '0')}:00
              </div>

              <div className="flex-1 min-h-[60px] border rounded-lg p-2 hover:bg-background-secondary transition-colors">
                {posts.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                    No posts scheduled
                  </div>
                ) : (
                  <div className="space-y-2">
                    {posts.map((post) => (
                      <Card
                        key={post.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onPostClick?.(post.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg">
                                  {getPlatformConfig(post.social_accounts.platform as SocialPlatform).icon}
                                </span>
                                <span className="font-medium">
                                  {post.social_accounts.account_name}
                                </span>
                                <Badge variant="outline">{post.status}</Badge>
                              </div>
                              <p className="text-sm text-text-secondary line-clamp-2">
                                {post.social_posts.content}
                              </p>
                              <div className="text-xs text-text-secondary mt-2">
                                {format(new Date(post.scheduled_for), 'h:mm a')}
                              </div>
                            </div>

                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle edit
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle delete
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
