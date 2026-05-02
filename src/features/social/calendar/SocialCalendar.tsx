// @ts-nocheck
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button-untitled';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card-untitled';
import { Badge } from '@/components/ui/badge-untitled';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { useScheduledPosts } from '../hooks/useSocialPosts';
import { DayView } from './DayView';
import { cn } from '@/lib/utils';

type ViewMode = 'month' | 'week' | 'day';

export function SocialCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

  const { data: scheduledPosts = [], isLoading } = useScheduledPosts(monthStart, monthEnd);

  const handlePreviousMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_for);
      return format(postDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  if (viewMode === 'day') {
    return (
      <div className="h-full">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => setViewMode('month')}>
            <CalendarIcon className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
        </div>
        <DayView date={selectedDate} onPostClick={setSelectedPost} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'month' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="rounded-r-none"
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="rounded-none border-l"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="rounded-l-none border-l"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-auto">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b bg-background-secondary">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-text-secondary"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 flex-1 auto-rows-fr">
                {weeks.map((week, weekIndex) => {
                  const days = eachDayOfInterval({
                    start: week,
                    end: new Date(week.getTime() + 6 * 24 * 60 * 60 * 1000),
                  });

                  return days.map((day, dayIndex) => {
                    const posts = getPostsForDate(day);
                    const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                    const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={cn(
                          'border-r border-b p-2 min-h-[120px] cursor-pointer hover:bg-background-secondary transition-colors',
                          !isCurrentMonth && 'bg-background-secondary/50',
                          isToday && 'bg-primary/5'
                        )}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className={cn(
                          'text-sm font-medium mb-1',
                          !isCurrentMonth && 'text-text-secondary',
                          isToday && 'text-primary'
                        )}>
                          {format(day, 'd')}
                        </div>

                        <div className="space-y-1">
                          {posts.slice(0, 3).map((post) => (
                            <div
                              key={post.id}
                              className="text-xs p-1 rounded bg-blue-100 hover:bg-blue-200 transition-colors truncate"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPost(post.id);
                              }}
                            >
                              <span className="font-medium">{post.social_accounts.account_name}</span>
                              <span className="ml-1 text-text-secondary">
                                {post.social_posts.content.substring(0, 20)}...
                              </span>
                            </div>
                          ))}
                          {posts.length > 3 && (
                            <div className="text-xs text-text-secondary">
                              +{posts.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
