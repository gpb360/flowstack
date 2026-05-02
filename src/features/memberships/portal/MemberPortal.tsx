// @ts-nocheck
/**
 * MemberPortal Component
 * Public-facing member portal for content access
 */

import { useEffect, useState } from 'react';
import { Search, Filter, Play, FileText, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ProgressUntitled } from '@/components/ui/progress-untitled';
import { useAuth } from '@/context/AuthContext';
import { useContentAccess as useContentWithAccess, useCourseWithProgress } from '../hooks/useMemberAccess';
import { ContentViewer } from './ContentViewer';

interface MemberPortalProps {
  organizationId: string;
}

export function MemberPortal({ organizationId }: MemberPortalProps) {
  const { session } = useAuth();
  const { data: subscription } = useUserSubscription(session?.user?.id, organizationId);
  const { data: content, isLoading } = useContentWithAccess(session?.user?.id, organizationId);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredContent = content?.filter((c: any) => {
    const matchesSearch = c.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || c.content_type === typeFilter;
    return matchesSearch && matchesType && c.access_type !== 'none';
  });

  const courses = filteredContent?.filter((c: any) => c.content_type === 'course');
  const videos = filteredContent?.filter((c: any) => c.content_type === 'video');
  const resources = filteredContent?.filter((c: any) => c.content_type === 'resource' || c.content_type === 'document');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Portal</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {session?.user?.user_metadata?.full_name || 'Member'}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <BadgeUntitled variant="outline">
                {subscription?.plan?.name || 'Free Plan'}
              </BadgeUntitled>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex gap-2">
            <ButtonUntitled
              variant={typeFilter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              All
            </ButtonUntitled>
            <ButtonUntitled
              variant={typeFilter === 'course' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('course')}
            >
              Courses
            </ButtonUntitled>
            <ButtonUntitled
              variant={typeFilter === 'video' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('video')}
            >
              Videos
            </ButtonUntitled>
            <ButtonUntitled
              variant={typeFilter === 'resource' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('resource')}
            >
              Resources
            </ButtonUntitled>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading content...</div>
        ) : (
          <div className="space-y-12">
            {/* Courses Section */}
            {courses && courses.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Courses</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {courses.map((item: any) => (
                    <CourseCard key={item.content_id} item={item} onSelect={setSelectedContent} />
                  ))}
                </div>
              </section>
            )}

            {/* Videos Section */}
            {videos && videos.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Videos</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {videos.map((item: any) => (
                    <ContentCard key={item.content_id} item={item} onSelect={setSelectedContent} />
                  ))}
                </div>
              </section>
            )}

            {/* Resources Section */}
            {resources && resources.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Resources</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {resources.map((item: any) => (
                    <ContentCard key={item.content_id} item={item} onSelect={setSelectedContent} />
                  ))}
                </div>
              </section>
            )}

            {filteredContent?.length === 0 && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                No content available matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {selectedContent && (
        <ContentViewer
          contentId={selectedContent.content_id}
          subscriptionId={subscription?.id}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </div>
  );
}

function CourseCard({ item, onSelect }: { item: any; onSelect: (item: any) => void }) {
  return (
    <CardUntitled className="cursor-pointer transition-shadow hover:shadow-lg border-gray-200 dark:border-gray-800" onClick={() => onSelect(item)}>
      {item.thumbnail && (
        <img src={item.thumbnail} alt={item.title} className="h-48 w-full rounded-t-lg object-cover" />
      )}
      <CardUntitled.Header>
        <CardUntitled.Title className="flex items-center gap-2 text-gray-900 dark:text-white">
          <BookOpen className="h-5 w-5" />
          {item.title}
        </CardUntitled.Title>
      </CardUntitled.Header>
      <CardUntitled.Content>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
        {item.progress_percent !== undefined && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-900 dark:text-white">Progress</span>
              <span className="text-gray-900 dark:text-white">{item.progress_percent}%</span>
            </div>
            <ProgressUntitled value={item.progress_percent} />
          </div>
        )}
      </CardUntitled.Content>
    </CardUntitled>
  );
}

function ContentCard({ item, onSelect }: { item: any; onSelect: (item: any) => void }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-5 w-5" />;
      case 'document':
      case 'resource':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <CardUntitled className="cursor-pointer transition-shadow hover:shadow-lg border-gray-200 dark:border-gray-800" onClick={() => onSelect(item)}>
      <CardUntitled.Header>
        <CardUntitled.Title className="flex items-center gap-2 text-gray-900 dark:text-white">
          {getIcon(item.content_type)}
          {item.title}
        </CardUntitled.Title>
      </CardUntitled.Header>
      <CardUntitled.Content>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.description}</p>
        {item.progress_percent !== undefined && item.progress_percent > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            {item.progress_percent}% complete
          </div>
        )}
      </CardUntitled.Content>
    </CardUntitled>
  );
}

// Import hook for user subscription
import { useUserSubscription } from '../hooks/useMemberships';
