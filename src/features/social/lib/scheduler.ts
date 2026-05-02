// @ts-nocheck
import { SocialPlatform } from './platforms';

export interface ScheduleSlot {
  date: Date;
  available: boolean;
  reason?: string;
  optimalScore: number;
}

export interface ScheduledPost {
  id: string;
  postId: string;
  accountId: string;
  accountName: string;
  platform: SocialPlatform;
  content: string;
  scheduledFor: Date;
  status: 'pending' | 'processing' | 'posted' | 'failed' | 'cancelled';
}

/**
 * Get available time slots for a date range
 */
export async function getAvailableTimeSlots(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  accountIds: string[]
): Promise<ScheduleSlot[]> {
  const response = await fetch(
    `/api/social/schedule/available?organization_id=${organizationId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}&accounts=${accountIds.join(',')}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch available time slots');
  }

  const { data } = await response.json();
  return data;
}

/**
 * Find best available slots based on platform recommendations
 */
export function findBestSlots(
  slots: ScheduleSlot[],
  count: number = 5
): ScheduleSlot[] {
  return slots
    .filter(slot => slot.available)
    .sort((a, b) => b.optimalScore - a.optimalScore)
    .slice(0, count);
}

/**
 * Get scheduled posts for date range
 */
export async function getScheduledPosts(
  organizationId: string,
  startDate: Date,
  endDate: Date
): Promise<ScheduledPost[]> {
  const response = await fetch(
    `/api/social/schedule/posts?organization_id=${organizationId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch scheduled posts');
  }

  const { data } = await response.json();
  return data;
}

/**
 * Reschedule post to new time
 */
export async function reschedulePost(
  scheduledPostId: string,
  newTime: Date,
  organizationId: string
): Promise<void> {
  const response = await fetch(`/api/social/schedule/${scheduledPostId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_id: organizationId,
      scheduled_for: newTime.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to reschedule post');
  }
}

/**
 * Bulk reschedule posts
 */
export async function bulkReschedule(
  scheduledPostIds: string[],
  newTime: Date,
  organizationId: string
): Promise<void> {
  const response = await fetch('/api/social/schedule/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_id: organizationId,
      scheduled_post_ids: scheduledPostIds,
      scheduled_for: newTime.toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to bulk reschedule posts');
  }
}

/**
 * Generate weekly schedule suggestions
 */
export function generateWeeklySchedule(
  platforms: SocialPlatform[],
  postsPerDay: number = 3
): Map<string, Date[]> {
  const schedule = new Map<string, Date[]>();
  const now = new Date();

  // Generate slots for next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const dateKey = date.toISOString().split('T')[0];
    const slots: Date[] = [];

    // Generate time slots for each platform
    platforms.forEach(platform => {
      const bestHour = getBestTimeToPost(platform, date.getDay()).hour;
      const slotTime = new Date(date);
      slotTime.setHours(bestHour, 0, 0, 0);
      slots.push(slotTime);
    });

    schedule.set(dateKey, slots.slice(0, postsPerDay));
  }

  return schedule;
}

/**
 * Check for scheduling conflicts
 */
export function hasSchedulingConflict(
  newTime: Date,
  scheduledPosts: ScheduledPost[],
  accountId: string
): boolean {
  const conflictWindow = 15 * 60 * 1000; // 15 minutes in milliseconds

  return scheduledPosts.some(post => {
    if (post.accountId !== accountId) return false;

    const timeDiff = Math.abs(post.scheduledFor.getTime() - newTime.getTime());
    return timeDiff < conflictWindow;
  });
}

/**
 * Find next available slot without conflicts
 */
export function findNextAvailableSlot(
  startTime: Date,
  scheduledPosts: ScheduledPost[],
  accountId: string,
  intervalMinutes: number = 30
): Date {
  let currentTime = new Date(startTime);

  while (hasSchedulingConflict(currentTime, scheduledPosts, accountId)) {
    currentTime = new Date(currentTime.getTime() + intervalMinutes * 60 * 1000);
  }

  return currentTime;
}

/**
 * Validate scheduled time is in the future
 */
export function isValidScheduleTime(time: Date): boolean {
  const now = new Date();
  const minFutureTime = new Date(now.getTime() + 15 * 60 * 1000); // At least 15 minutes in future

  return time >= minFutureTime;
}

/**
 * Get timezone-adjusted time
 */
export function getTimezoneAdjustedTime(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Format schedule time for display
 */
export function formatScheduleTime(date: Date, timezone: string = 'UTC'): string {
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate time until scheduled
 */
export function getTimeUntilScheduled(scheduledFor: Date): {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
} {
  const now = new Date();
  const diff = scheduledFor.getTime() - now.getTime();

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isPast: false };
}

/**
 * Generate recurring schedule
 */
export function generateRecurringSchedule(
  startDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly',
  count: number
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(new Date(currentDate));

    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
  }

  return dates;
}
