import { type ClassValue, clsx } from 'clsx';

/**
 * Social platform types supported by FlowStack
 */
export type SocialPlatform =
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'pinterest'
  | 'youtube';

/**
 * Platform-specific configurations
 */
export const PLATFORM_CONFIGS: Record<SocialPlatform, {
  name: string;
  characterLimit: number;
  supportsImage: boolean;
  supportsVideo: boolean;
  supportsCarousel: boolean;
  supportsHashtags: boolean;
  supportsSchedule: boolean;
  icon: string;
  color: string;
}> = {
  facebook: {
    name: 'Facebook',
    characterLimit: 63206,
    supportsImage: true,
    supportsVideo: true,
    supportsCarousel: true,
    supportsHashtags: true,
    supportsSchedule: true,
    icon: '📘',
    color: '#1877F2',
  },
  twitter: {
    name: 'Twitter/X',
    characterLimit: 280,
    supportsImage: true,
    supportsVideo: true,
    supportsCarousel: false,
    supportsHashtags: true,
    supportsSchedule: true,
    icon: '🐦',
    color: '#000000',
  },
  linkedin: {
    name: 'LinkedIn',
    characterLimit: 3000,
    supportsImage: true,
    supportsVideo: true,
    supportsCarousel: false,
    supportsHashtags: true,
    supportsSchedule: true,
    icon: '💼',
    color: '#0A66C2',
  },
  instagram: {
    name: 'Instagram',
    characterLimit: 2200,
    supportsImage: true,
    supportsVideo: true,
    supportsCarousel: true,
    supportsHashtags: true,
    supportsSchedule: true,
    icon: '📷',
    color: '#E4405F',
  },
  tiktok: {
    name: 'TikTok',
    characterLimit: 150,
    supportsImage: false,
    supportsVideo: true,
    supportsCarousel: false,
    supportsHashtags: true,
    supportsSchedule: false,
    icon: '🎵',
    color: '#000000',
  },
  pinterest: {
    name: 'Pinterest',
    characterLimit: 500,
    supportsImage: true,
    supportsVideo: true,
    supportsCarousel: false,
    supportsHashtags: true,
    supportsSchedule: true,
    icon: '📌',
    color: '#E60023',
  },
  youtube: {
    name: 'YouTube',
    characterLimit: 5000,
    supportsImage: true,
    supportsVideo: true,
    supportsCarousel: false,
    supportsHashtags: true,
    supportsSchedule: true,
    icon: '▶️',
    color: '#FF0000',
  },
};

/**
 * Get platform configuration
 */
export function getPlatformConfig(platform: SocialPlatform) {
  return PLATFORM_CONFIGS[platform];
}

/**
 * Calculate character count with platform-specific rules
 */
export function calculateCharacterCount(content: string, platform: SocialPlatform): number {
  const config = getPlatformConfig(platform);

  // Twitter counts URLs as 23 characters regardless of actual length
  if (platform === 'twitter') {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    const urlCount = urls.length * 23;
    const textWithoutUrls = content.replace(urlRegex, '');
    return textWithoutUrls.length + urlCount;
  }

  return content.length;
}

/**
 * Check if content exceeds character limit
 */
export function exceedsCharacterLimit(content: string, platform: SocialPlatform): boolean {
  return calculateCharacterCount(content, platform) > getPlatformConfig(platform).characterLimit;
}

/**
 * Extract hashtags from content
 */
export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex) || [];
  return matches.map(tag => tag.substring(1));
}

/**
 * Extract mentions from content
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex) || [];
  return matches.map(mention => mention.substring(1));
}

/**
 * Get best time to post based on day of week
 * These are general recommendations - can be overridden by account-specific data
 */
export function getBestTimeToPost(platform: SocialPlatform, dayOfWeek: number): { hour: number; reason: string } {
  const bestTimes: Record<SocialPlatform, Record<number, { hour: number; reason: string }>> = {
    facebook: {
      0: { hour: 12, reason: 'Sunday afternoon' },
      1: { hour: 15, reason: 'Monday afternoon' },
      2: { hour: 15, reason: 'Tuesday afternoon' },
      3: { hour: 15, reason: 'Wednesday afternoon' },
      4: { hour: 15, reason: 'Thursday afternoon' },
      5: { hour: 14, reason: 'Friday early afternoon' },
      6: { hour: 12, reason: 'Saturday noon' },
    },
    twitter: {
      0: { hour: 9, reason: 'Sunday morning' },
      1: { hour: 9, reason: 'Monday morning' },
      2: { hour: 9, reason: 'Tuesday morning' },
      3: { hour: 9, reason: 'Wednesday morning' },
      4: { hour: 9, reason: 'Thursday morning' },
      5: { hour: 9, reason: 'Friday morning' },
      6: { hour: 9, reason: 'Saturday morning' },
    },
    linkedin: {
      0: { hour: 10, reason: 'Sunday morning business hours' },
      1: { hour: 10, reason: 'Monday morning business hours' },
      2: { hour: 10, reason: 'Tuesday morning business hours' },
      3: { hour: 10, reason: 'Wednesday morning business hours' },
      4: { hour: 10, reason: 'Thursday morning business hours' },
      5: { hour: 10, reason: 'Friday morning business hours' },
      6: { hour: 10, reason: 'Saturday morning business hours' },
    },
    instagram: {
      0: { hour: 11, reason: 'Sunday late morning' },
      1: { hour: 11, reason: 'Monday late morning' },
      2: { hour: 11, reason: 'Tuesday late morning' },
      3: { hour: 11, reason: 'Wednesday late morning' },
      4: { hour: 11, reason: 'Thursday late morning' },
      5: { hour: 11, reason: 'Friday late morning' },
      6: { hour: 10, reason: 'Saturday morning' },
    },
    tiktok: {
      0: { hour: 19, reason: 'Sunday evening' },
      1: { hour: 19, reason: 'Monday evening' },
      2: { hour: 19, reason: 'Tuesday evening' },
      3: { hour: 19, reason: 'Wednesday evening' },
      4: { hour: 19, reason: 'Thursday evening' },
      5: { hour: 15, reason: 'Friday afternoon' },
      6: { hour: 10, reason: 'Saturday morning' },
    },
    pinterest: {
      0: { hour: 20, reason: 'Sunday evening' },
      1: { hour: 20, reason: 'Monday evening' },
      2: { hour: 20, reason: 'Tuesday evening' },
      3: { hour: 20, reason: 'Wednesday evening' },
      4: { hour: 20, reason: 'Thursday evening' },
      5: { hour: 15, reason: 'Friday afternoon' },
      6: { hour: 9, reason: 'Saturday morning' },
    },
    youtube: {
      0: { hour: 14, reason: 'Sunday afternoon' },
      1: { hour: 14, reason: 'Monday afternoon' },
      2: { hour: 14, reason: 'Tuesday afternoon' },
      3: { hour: 14, reason: 'Wednesday afternoon' },
      4: { hour: 14, reason: 'Thursday afternoon' },
      5: { hour: 15, reason: 'Friday afternoon' },
      6: { hour: 9, reason: 'Saturday morning' },
    },
  };

  return bestTimes[platform]?.[dayOfWeek] || { hour: 12, reason: 'Midday' };
}

/**
 * Format platform for display
 */
export function formatPlatform(platform: SocialPlatform): string {
  return PLATFORM_CONFIGS[platform].name;
}

/**
 * Validate content for platform
 */
export function validateContentForPlatform(
  content: string,
  platform: SocialPlatform,
  mediaCount: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const config = getPlatformConfig(platform);

  // Check character limit
  if (exceedsCharacterLimit(content, platform)) {
    errors.push(`Content exceeds ${config.characterLimit} character limit`);
  }

  // Check media support
  if (mediaCount > 0 && !config.supportsImage && !config.supportsVideo) {
    errors.push(`${config.name} does not support media uploads`);
  }

  // Instagram requires at least one image or video
  if (platform === 'instagram' && mediaCount === 0) {
    errors.push('Instagram posts require at least one image or video');
  }

  // TikTok requires video
  if (platform === 'tiktok' && mediaCount === 0) {
    errors.push('TikTok posts require a video');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
