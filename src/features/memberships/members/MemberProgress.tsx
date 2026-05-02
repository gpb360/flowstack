/**
 * MemberProgress Component
 * Display and track member learning progress
 */

import { Trophy, Target, TrendingUp, Clock } from 'lucide-react';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { ProgressUntitled } from '@/components/ui/progress-untitled';
import { useAccessSummary, useCompletedContent, useInProgressContent } from '../hooks/useMemberAccess';

interface MemberProgressProps {
  subscriptionId: string;
}

export function MemberProgress({ subscriptionId }: MemberProgressProps) {
  const { data: summary } = useAccessSummary(subscriptionId);
  const { data: completed } = useCompletedContent(subscriptionId);
  const { data: inProgress } = useInProgressContent(subscriptionId);

  if (!summary) {
    return <div>Loading progress...</div>;
  }

  const completionRate = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Completion Rate
            </CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{Math.round(completionRate)}%</div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {summary.completed} of {summary.total} completed
            </div>
            <ProgressUntitled value={completionRate} className="mt-3" />
          </CardUntitled.Content>
        </CardUntitled>

        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Completed
            </CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{summary.completed}</div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Courses/lessons finished
            </div>
          </CardUntitled.Content>
        </CardUntitled>

        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              In Progress
            </CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{summary.inProgress}</div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Currently learning
            </div>
          </CardUntitled.Content>
        </CardUntitled>

        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Spent
            </CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{summary.totalTimeSpentHours}h</div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Total learning time
            </div>
          </CardUntitled.Content>
        </CardUntitled>
      </div>

      {/* In Progress Content */}
      {inProgress && inProgress.length > 0 && (
        <CardUntitled>
          <CardUntitled.Header>
            <CardUntitled.Title>Continue Learning</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="space-y-4">
              {inProgress.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                >
                  {record.content?.thumbnail_url && (
                    <img
                      src={record.content.thumbnail_url}
                      alt={record.content.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{record.content?.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {record.content?.content_type}
                    </div>
                  </div>
                  <div className="w-48">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-900 dark:text-white">Progress</span>
                      <span className="text-gray-900 dark:text-white">{record.progress_percent}%</span>
                    </div>
                    <ProgressUntitled value={record.progress_percent} />
                  </div>
                  <BadgeUntitled variant="outline">
                    {Math.round((100 - record.progress_percent) / 10)} steps left
                  </BadgeUntitled>
                </div>
              ))}
            </div>
          </CardUntitled.Content>
        </CardUntitled>
      )}

      {/* Completed Content */}
      {completed && completed.length > 0 && (
        <CardUntitled>
          <CardUntitled.Header>
            <CardUntitled.Title>Completed</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="grid gap-4 md:grid-cols-2">
              {completed.slice(0, 6).map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{record.content?.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Completed {record.completed_at ? new Date(record.completed_at).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {completed.length > 6 && (
              <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                +{completed.length - 6} more completed items
              </div>
            )}
          </CardUntitled.Content>
        </CardUntitled>
      )}
    </div>
  );
}
