/**
 * Content Management Utilities
 * Helper functions for managing membership content
 */

import { supabase } from '@/lib/supabase';

export interface ContentNode {
  id: string;
  title: string;
  content_type: 'course' | 'video' | 'document' | 'resource' | 'live_event';
  parent_content_id?: string;
  order_index: number;
  children?: ContentNode[];
}

/**
 * Build a tree structure from flat content list
 */
export function buildContentTree(contents: any[]): ContentNode[] {
  const map = new Map<string, ContentNode>();
  const roots: ContentNode[] = [];

  // First pass: create nodes
  contents.forEach((content) => {
    map.set(content.id, { ...content, children: [] });
  });

  // Second pass: build tree
  contents.forEach((content) => {
    const node = map.get(content.id)!;
    if (content.parent_content_id) {
      const parent = map.get(content.parent_content_id);
      if (parent) {
        parent.children!.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Calculate course progress
 */
export function calculateCourseProgress(
  lessons: any[],
  completedLessons: string[]
): number {
  if (lessons.length === 0) return 0;
  const completed = lessons.filter((l) => completedLessons.includes(l.id)).length;
  return Math.round((completed / lessons.length) * 100);
}

/**
 * Get video duration in human-readable format
 */
export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Get content thumbnail or fallback
 */
export function getContentThumbnail(content: any): string {
  return content.thumbnail_url || '/placeholder-content.svg';
}

/**
 * Search content by title or description
 */
export async function searchContent(
  organizationId: string,
  query: string,
  filters?: {
    content_type?: string;
    access_tier?: string;
  }
) {
  let dbQuery = supabase
    .from('membership_content')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_published', true)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

  if (filters?.content_type) {
    dbQuery = dbQuery.eq('content_type', filters.content_type);
  }

  if (filters?.access_tier) {
    dbQuery = dbQuery.eq('access_tier', filters.access_tier);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Error searching content:', error);
    return [];
  }

  return data;
}

/**
 * Get course curriculum with progress
 */
export async function getCourseWithProgress(
  courseId: string,
  subscriptionId: string
) {
  // Get course and lessons
  const { data: course, error: courseError } = await supabase
    .from('membership_content')
    .select(`
      *,
      children:membership_content(
        id,
        title,
        description,
        content_type,
        video_duration_seconds,
        order_index
      )
    `)
    .eq('id', courseId)
    .single();

  if (courseError || !course) {
    return null;
  }

  // Get progress for each lesson
  const lessonIds = course.children?.map((c: any) => c.id) || [];
  const { data: progressData } = await supabase
    .from('membership_access')
    .select('content_id, progress_percent, is_completed')
    .eq('subscription_id', subscriptionId)
    .in('content_id', lessonIds);

  const progressMap = new Map(
    progressData?.map((p) => [p.content_id, p]) || []
  );

  const lessonsWithProgress = course.children?.map((lesson: any) => ({
    ...lesson,
    progress: progressMap.get(lesson.id)?.progress_percent || 0,
    is_completed: progressMap.get(lesson.id)?.is_completed || false,
  }));

  return {
    ...course,
    children: lessonsWithProgress,
    overallProgress: calculateCourseProgress(
      lessonsWithProgress || [],
      progressData?.filter((p) => p.is_completed).map((p) => p.content_id) || []
    ),
  };
}

/**
 * Bulk update content order
 */
export async function updateContentOrder(
  organizationId: string,
  updates: { id: string; order_index: number }[]
) {
  const promises = updates.map((update) =>
    supabase
      .from('membership_content')
      .update({ order_index: update.order_index })
      .eq('id', update.id)
      .eq('organization_id', organizationId)
  );

  const results = await Promise.all(promises);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error('Errors updating content order:', errors);
    return { success: false, errors };
  }

  return { success: true };
}

/**
 * Duplicate content with all children
 */
export async function duplicateContent(contentId: string, organizationId: string) {
  // Get original content
  const { data: original, error: fetchError } = await supabase
    .from('membership_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (fetchError || !original) {
    return null;
  }

  // Create duplicate
  const { data: duplicate, error: duplicateError } = await supabase
    .from('membership_content')
    .insert({
      organization_id: organizationId,
      content_type: original.content_type,
      parent_content_id: original.parent_content_id,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now()}`,
      description: original.description,
      content_body: original.content_body,
      thumbnail_url: original.thumbnail_url,
      video_url: original.video_url,
      video_duration_seconds: original.video_duration_seconds,
      file_url: original.file_url,
      file_size_bytes: original.file_size_bytes,
      access_tier: original.access_tier,
      require_subscription: original.require_subscription,
      drip_delay_days: original.drip_delay_days,
      settings: original.settings,
      is_published: false, // Start as draft
    })
    .select()
    .single();

  if (duplicateError || !duplicate) {
    return null;
  }

  // Duplicate children if it's a course
  if (original.content_type === 'course') {
    const { data: children } = await supabase
      .from('membership_content')
      .select('*')
      .eq('parent_content_id', contentId);

    if (children) {
      for (const child of children) {
        await supabase.from('membership_content').insert({
          organization_id: organizationId,
          content_type: child.content_type,
          parent_content_id: duplicate.id,
          title: child.title,
          slug: `${child.slug}-${Date.now()}`,
          description: child.description,
          content_body: child.content_body,
          video_url: child.video_url,
          video_duration_seconds: child.video_duration_seconds,
          access_tier: child.access_tier,
          drip_delay_days: child.drip_delay_days,
          settings: child.settings,
          order_index: child.order_index,
          is_published: false,
        });
      }
    }
  }

  return duplicate;
}
