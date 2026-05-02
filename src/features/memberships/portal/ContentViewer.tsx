// @ts-nocheck
/**
 * ContentViewer Component
 * Display and track progress for membership content
 */

import { useState } from 'react';
import { X, Play, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ProgressUntitled } from '@/components/ui/progress-untitled';
import { TabsUntitled } from '@/components/ui/tabs-untitled';
import { useContent, useMemberProgress, useUpdateProgress } from '../hooks/useMemberAccess';
import { useCourseWithProgress } from '../hooks/useMemberships';

interface ContentViewerProps {
  contentId: string;
  subscriptionId?: string;
  onClose: () => void;
}

export function ContentViewer({ contentId, subscriptionId, onClose }: ContentViewerProps) {
  const { data: content, isLoading } = useContent(contentId);
  const { data: progress } = useMemberProgress(subscriptionId, contentId);
  const { data: courseData } = useCourseWithProgress(contentId, subscriptionId);
  const updateProgress = useUpdateProgress();
  const [currentLesson, setCurrentLesson] = useState<any>(null);

  if (isLoading || !content) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-[#D4AF37] mx-auto" />
          <p className="text-gray-900 dark:text-white">Loading content...</p>
        </div>
      </div>
    );
  }

  const isCourse = content.content_type === 'course';
  const lessons = courseData?.children || [];
  const overallProgress = courseData?.overallProgress || progress?.progress_percent || 0;

  const handleMarkComplete = async () => {
    if (subscriptionId && progress?.id) {
      await updateProgress.mutateAsync({
        accessId: progress.id,
        progressPercent: 100,
        isCompleted: true,
      });
    }
  };

  const handleUpdateProgress = async (percent: number) => {
    if (subscriptionId && progress?.id) {
      await updateProgress.mutateAsync({
        accessId: progress.id,
        progressPercent: percent,
        isCompleted: percent === 100,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{content.title}</h2>
                {progress?.is_completed && (
                  <BadgeUntitled variant="primary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </BadgeUntitled>
                )}
              </div>
              {content.description && (
                <p className="text-gray-500 dark:text-gray-400">{content.description}</p>
              )}
            </div>
            <ButtonUntitled variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </ButtonUntitled>
          </div>

          {progress && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-900 dark:text-white">Your Progress</span>
                <span className="text-gray-900 dark:text-white">{progress.progress_percent}%</span>
              </div>
              <ProgressUntitled value={progress.progress_percent} />
            </div>
          )}
        </div>

        <div className="p-6">
          {isCourse ? (
            <CourseView
              content={content}
              lessons={lessons}
              currentLesson={currentLesson}
              onSelectLesson={setCurrentLesson}
              overallProgress={overallProgress}
              onMarkComplete={handleMarkComplete}
            />
          ) : (
            <ContentView
              content={content}
              progress={progress}
              onMarkComplete={handleMarkComplete}
              onUpdateProgress={handleUpdateProgress}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CourseView({
  content,
  lessons,
  currentLesson,
  onSelectLesson,
  overallProgress,
  onMarkComplete,
}: any) {
  return (
    <TabsUntitled defaultValue="content">
      <TabsUntitled.List className="mb-6">
        <TabsUntitled.Trigger value="content">Content</TabsUntitled.Trigger>
        <TabsUntitled.Trigger value="lessons">Lessons</TabsUntitled.Trigger>
      </TabsUntitled.List>

      <TabsUntitled.Content value="content">
        {currentLesson ? (
          <LessonView lesson={currentLesson} onMarkComplete={onMarkComplete} />
        ) : lessons.length > 0 ? (
          <div className="space-y-4">
            {lessons.map((lesson: any) => (
              <CardUntitled
                key={lesson.id}
                className="cursor-pointer hover:shadow-md border-gray-200 dark:border-gray-800"
                onClick={() => onSelectLesson(lesson)}
              >
                <CardUntitled.Content className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
                      {lesson.is_completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Play className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{lesson.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {lesson.video_duration_seconds
                          ? `${Math.floor(lesson.video_duration_seconds / 60)} min`
                          : 'Lesson'}
                      </div>
                    </div>
                    {lesson.progress !== undefined && (
                      <div className="w-24">
                        <ProgressUntitled value={lesson.progress} />
                      </div>
                    )}
                  </div>
                </CardUntitled.Content>
              </CardUntitled>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No lessons added yet
          </div>
        )}
      </TabsUntitled.Content>

      <TabsUntitled.Content value="lessons">
        <CardUntitled>
          <CardUntitled.Header>
            <CardUntitled.Title>Course Progress</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-900 dark:text-white">Overall Progress</span>
                <span className="text-gray-900 dark:text-white">{overallProgress}%</span>
              </div>
              <ProgressUntitled value={overallProgress} />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {lessons.filter((l: any) => l.is_completed).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {lessons.filter((l: any) => l.progress > 0 && !l.is_completed).length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lessons.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Lessons</div>
              </div>
            </div>
          </CardUntitled.Content>
        </CardUntitled>
      </TabsUntitled.Content>
    </TabsUntitled>
  );
}

function LessonView({ lesson, onMarkComplete }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
        {lesson.description && (
          <p className="text-gray-500 dark:text-gray-400 mb-6">{lesson.description}</p>
        )}
      </div>

      {lesson.video_url && (
        <div className="aspect-video overflow-hidden rounded-lg bg-black">
          <video
            src={lesson.video_url}
            controls
            className="h-full w-full"
          />
        </div>
      )}

      {lesson.content_body && (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content_body }}
        />
      )}

      <div className="flex justify-end">
        <ButtonUntitled onClick={onMarkComplete} disabled={lesson.is_completed} variant="primary">
          {lesson.is_completed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </ButtonUntitled>
      </div>
    </div>
  );
}

function ContentView({ content, progress, onMarkComplete, onUpdateProgress }: any) {
  return (
    <div className="space-y-6">
      {content.video_url && (
        <div className="aspect-video overflow-hidden rounded-lg bg-black">
          <video
            src={content.video_url}
            controls
            className="h-full w-full"
            onTimeUpdate={(e) => {
              const percent = Math.round((e.currentTarget.currentTime / e.currentTarget.duration) * 100);
              if (percent % 10 === 0) onUpdateProgress(percent);
            }}
          />
        </div>
      )}

      {content.content_body && (
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content.content_body }}
        />
      )}

      {content.file_url && (
        <CardUntitled>
          <CardUntitled.Content className="pt-6">
            <a
              href={content.file_url}
              download
              className="flex items-center gap-2 text-[#D4AF37] hover:underline"
            >
              <BookOpen className="h-4 w-4" />
              Download Resource
            </a>
          </CardUntitled.Content>
        </CardUntitled>
      )}

      <div className="flex justify-end">
        <ButtonUntitled onClick={onMarkComplete} disabled={progress?.is_completed} variant="primary">
          {progress?.is_completed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
            </>
          ) : (
            'Mark as Complete'
          )}
        </ButtonUntitled>
      </div>
    </div>
  );
}
