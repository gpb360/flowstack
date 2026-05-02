import { SocialPlatform, extractHashtags, extractMentions, validateContentForPlatform } from './platforms';

export interface MediaFile {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  duration?: number;
  altText?: string;
}

export interface PostData {
  content: string;
  media: MediaFile[];
  scheduledFor: Date | null;
  selectedAccounts: string[];
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  postType: 'post' | 'story' | 'reel' | 'article';
  campaignId?: string;
  internalNotes?: string;
}

export interface ScheduledPost extends PostData {
  id: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  errorMessage?: string;
}

/**
 * Save post as draft
 */
export async function saveDraft(postData: PostData, organizationId: string): Promise<string> {
  const response = await fetch('/api/social/posts/draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_id: organizationId,
      content: postData.content,
      media_urls: postData.media.map(m => m.url),
      media_type: postData.media.length > 0 ? (postData.media[0].type === 'image' ? 'image' : 'video') : 'text',
      link_url: postData.linkUrl,
      link_title: postData.linkTitle,
      link_description: postData.linkDescription,
      link_image_url: postData.linkImageUrl,
      hashtags: extractHashtags(postData.content),
      mentions: extractMentions(postData.content),
      post_type: postData.postType,
      campaign_id: postData.campaignId,
      internal_notes: postData.internalNotes,
      status: 'draft',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save draft');
  }

  const { data } = await response.json();
  return data.id;
}

/**
 * Schedule post for specific accounts
 */
export async function schedulePost(
  postData: PostData,
  organizationId: string,
  accountIds: string[],
  scheduledFor: Date
): Promise<string> {
  // First create or update the post
  const postResponse = await fetch('/api/social/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_id: organizationId,
      content: postData.content,
      media_urls: postData.media.map(m => m.url),
      media_type: postData.media.length > 0 ? (postData.media[0].type === 'image' ? 'image' : 'video') : 'text',
      link_url: postData.linkUrl,
      link_title: postData.linkTitle,
      link_description: postData.linkDescription,
      link_image_url: postData.linkImageUrl,
      hashtags: extractHashtags(postData.content),
      mentions: extractMentions(postData.content),
      post_type: postData.postType,
      campaign_id: postData.campaignId,
      internal_notes: postData.internalNotes,
      status: 'scheduled',
    }),
  });

  if (!postResponse.ok) {
    throw new Error('Failed to create post');
  }

  const { data: post } = await postResponse.json();

  // Schedule for each account
  const schedulePromises = accountIds.map(accountId =>
    fetch('/api/social/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: organizationId,
        post_id: post.id,
        account_id: accountId,
        scheduled_for: scheduledFor.toISOString(),
      }),
    })
  );

  await Promise.all(schedulePromises);

  return post.id;
}

/**
 * Update scheduled post
 */
export async function updateScheduledPost(
  postId: string,
  updates: Partial<PostData>,
  organizationId: string
): Promise<void> {
  const response = await fetch(`/api/social/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_id: organizationId,
      ...updates,
      hashtags: updates.content ? extractHashtags(updates.content) : undefined,
      mentions: updates.content ? extractMentions(updates.content) : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }
}

/**
 * Cancel scheduled post
 */
export async function cancelScheduledPost(postId: string, organizationId: string): Promise<void> {
  const response = await fetch(`/api/social/posts/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      organization_id: organizationId,
      status: 'cancelled',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel post');
  }
}

/**
 * Delete post
 */
export async function deletePost(postId: string, organizationId: string): Promise<void> {
  const response = await fetch(`/api/social/posts/${postId}?organization_id=${organizationId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}

/**
 * Generate hashtag suggestions based on content
 */
export function generateHashtagSuggestions(content: string, platform: SocialPlatform): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const suggestions: string[] = [];

  // Extract key topics (simple keyword extraction)
  const topics = words.filter(word => word.length > 4);

  // Generate relevant hashtags
  topics.forEach(topic => {
    const hashtag = `#${topic.replace(/[^a-z0-9]/g, '')}`;
    if (!suggestions.includes(hashtag) && hashtag.length > 2) {
      suggestions.push(hashtag);
    }
  });

  // Add platform-specific trending hashtags
  const platformHashtags: Record<SocialPlatform, string[]> = {
    facebook: ['#Facebook', '#SocialMedia', '#DigitalMarketing'],
    twitter: ['#Twitter', '#Tweet', '#SocialMedia'],
    linkedin: ['#LinkedIn', '#Professional', '#Business'],
    instagram: ['#Instagram', '#InstaGood', '#PhotoOfTheDay'],
    tiktok: ['#TikTok', '#ForYou', '#Trending'],
    pinterest: ['#Pinterest', '#Inspiration', '#DIY'],
    youtube: ['#YouTube', '#Video', '#Subscribe'],
  };

  suggestions.push(...platformHashtags[platform]);

  return suggestions.slice(0, 10);
}

/**
 * Estimate engagement potential
 */
export function estimateEngagement(
  content: string,
  mediaCount: number,
  platform: SocialPlatform,
  followerCount: number
): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 50; // Base score

  // Media boosts engagement
  if (mediaCount > 0) {
    score += 20;
    factors.push('Includes media');
  }

  // Optimal length
  if (content.length > 50 && content.length < 300) {
    score += 10;
    factors.push('Optimal length');
  }

  // Hashtags increase reach
  const hashtags = extractHashtags(content);
  if (hashtags.length >= 3 && hashtags.length <= 10) {
    score += 15;
    factors.push('Good hashtag usage');
  }

  // Questions boost engagement
  if (content.includes('?')) {
    score += 10;
    factors.push('Asks question');
  }

  // Emoji usage (platform dependent)
  if (['instagram', 'tiktok', 'twitter'].includes(platform)) {
    const emojiCount = (content.match(/[\u{1F600}-\u{1F64F}]/gu) || []).length;
    if (emojiCount > 0 && emojiCount <= 5) {
      score += 5;
      factors.push('Uses emojis');
    }
  }

  return {
    score: Math.min(100, score),
    factors,
  };
}
