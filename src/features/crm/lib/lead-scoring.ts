import type { Database } from '@/types/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'] & Record<string, any>;
type Company = Database['public']['Tables']['companies']['Row'] & Record<string, any>;
type Deal = Database['public']['Tables']['deals']['Row'] & Record<string, any>;
type Activity = Database['public']['Tables']['activities']['Row'] & Record<string, any>;

export interface LeadScoreInput {
  contact: Contact;
  company?: Company;
  activities: Activity[];
  deals: Deal[];
}

export interface LeadScoreOutput {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    engagement: number;
    demographics: number;
    behavior: number;
    timing: number;
  };
  recommendations: string[];
}

/**
 * Calculate lead score based on multiple factors
 *
 * Scoring methodology:
 * - Engagement (30%): Recent interactions, email opens, link clicks, website visits
 * - Demographics (20%): Job title relevance, company size, industry fit
 * - Behavior (30%): Form submissions, content downloads, demo requests, deal progression
 * - Timing (20%): Recency of activity, urgency signals, deal stage position
 */
export function calculateLeadScore(input: LeadScoreInput): LeadScoreOutput {
  const { contact, company, activities, deals } = input;

  // Calculate individual factor scores (0-100)
  const engagementScore = calculateEngagementScore(activities);
  const demographicsScore = calculateDemographicsScore(contact, company);
  const behaviorScore = calculateBehaviorScore(activities, deals);
  const timingScore = calculateTimingScore(activities, deals);

  // Weighted average to get final score
  const finalScore = Math.round(
    engagementScore * 0.3 +
      demographicsScore * 0.2 +
      behaviorScore * 0.3 +
      timingScore * 0.2
  );

  // Determine grade
  const grade = getGrade(finalScore);

  // Generate recommendations
  const recommendations = generateRecommendations({
    engagement: engagementScore,
    demographics: demographicsScore,
    behavior: behaviorScore,
    timing: timingScore,
    finalScore,
  });

  return {
    score: finalScore,
    grade,
    factors: {
      engagement: engagementScore,
      demographics: demographicsScore,
      behavior: behaviorScore,
      timing: timingScore,
    },
    recommendations,
  };
}

/**
 * Calculate engagement score based on recent interactions
 */
function calculateEngagementScore(activities: Activity[]): number {
  if (activities.length === 0) return 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Count activities by recency
  const recentActivities = activities.filter((a) => new Date(a.created_at) >= thirtyDaysAgo);
  const veryRecentActivities = activities.filter((a) => new Date(a.created_at) >= sevenDaysAgo);

  // Score based on activity frequency
  let score = 0;

  // Base score for having any activity
  if (activities.length > 0) score += 10;

  // Bonus for recent activity
  score += Math.min(recentActivities.length * 5, 40);

  // Extra bonus for very recent activity
  score += Math.min(veryRecentActivities.length * 10, 30);

  // Bonus for variety of interaction types
  const uniqueTypes = new Set(activities.map((a) => a.type)).size;
  score += Math.min(uniqueTypes * 5, 20);

  return Math.min(score, 100);
}

/**
 * Calculate demographics score based on contact and company attributes
 */
function calculateDemographicsScore(contact: Contact, company?: Company): number {
  let score = 0;

  // Contact has email
  if (contact.email) score += 10;

  // Contact has phone
  if (contact.phone) score += 10;

  // Contact has a position/title
  if (contact.position) {
    score += 15;

    // Bonus for decision-maker titles
    const decisionMakerTitles = [
      'ceo',
      'cto',
      'cfo',
      'coo',
      'director',
      'vp',
      'vice president',
      'manager',
      'head',
      'lead',
      'owner',
      'founder',
      'president',
    ];

    const position = contact.position.toLowerCase();
    if (decisionMakerTitles.some((title) => position.includes(title))) {
      score += 20;
    }
  }

  // Contact has both first and last name
  if (contact.first_name && contact.last_name) score += 5;

  // Company information
  if (company) {
    // Company has a domain (website)
    if (company.domain) score += 10;

    // Company has an address
    if (company.address) score += 5;

    // Bonus for company name (indicates a real company)
    if (company.name && company.name.length > 2) score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Calculate behavior score based on actions and deal progression
 */
function calculateBehaviorScore(activities: Activity[], deals: Deal[]): number {
  let score = 0;

  // High-value activities
  const highValueTypes = ['meeting', 'call', 'email_sent', 'email_received'];
  const highValueActivities = activities.filter((a) => highValueTypes.includes(a.type));
  score += Math.min(highValueActivities.length * 15, 50);

  // Demo request signals (could be detected from activity notes/title)
  const demoSignals = activities.filter(
    (a) =>
      a.title?.toLowerCase().includes('demo') ||
      a.description?.toLowerCase().includes('demo') ||
      a.title?.toLowerCase().includes('trial') ||
      a.description?.toLowerCase().includes('trial')
  );
  score += Math.min(demoSignals.length * 20, 30);

  // Deal progression
  if (deals.length > 0) {
    score += 10;

    // Bonus for deals with value
    const dealsWithValue = deals.filter((d) => d.value && d.value > 0);
    score += Math.min(dealsWithValue.length * 5, 15);

    // Bonus for deals not in lost/abandoned status
    const activeDeals = deals.filter((d) => d.status === 'open' || d.status === 'won');
    score += Math.min(activeDeals.length * 5, 15);
  }

  // Task completion (shows engagement)
  const completedTasks = activities.filter(
    (a) => a.type === 'task' && a.status === 'completed'
  );
  score += Math.min(completedTasks.length * 5, 10);

  return Math.min(score, 100);
}

/**
 * Calculate timing score based on recency and urgency
 */
function calculateTimingScore(activities: Activity[], deals: Deal[]): number {
  if (activities.length === 0 && deals.length === 0) return 0;

  let score = 0;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Most recent activity
  const mostRecentActivity = activities.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];

  if (mostRecentActivity) {
    const activityDate = new Date(mostRecentActivity.created_at);

    // Very recent activity (within 7 days)
    if (activityDate >= sevenDaysAgo) {
      score += 40;
    }
    // Recent activity (within 30 days)
    else if (activityDate >= thirtyDaysAgo) {
      score += 25;
    }
    // Older activity
    else {
      score += 10;
    }
  }

  // Deal stage progression (higher stages = closer to closing)
  if (deals.length > 0) {
    const activeDeals = deals.filter((d) => d.status === 'open');

    if (activeDeals.length > 0) {
      // Bonus for having active deals
      score += 20;

      // Check if any deal is in advanced stage (stage position > 2 would indicate this)
      // This is a simplified check - in reality you'd need to know the stage position
      const advancedDeals = activeDeals.filter(
        (d) => d.stage_id !== null && d.status === 'open'
      );
      score += Math.min(advancedDeals.length * 10, 20);
    }

    // Bonus for deals with expected close date soon
    const dealsClosingSoon = activeDeals.filter((d) => {
      if (!d.expected_close_date) return false;
      const closeDate = new Date(d.expected_close_date);
      const daysUntilClose = Math.ceil(
        (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilClose >= 0 && daysUntilClose <= 30;
    });

    score += Math.min(dealsClosingSoon.length * 15, 20);
  }

  // Penalty for no recent activity
  if (mostRecentActivity) {
    const daysSinceLastActivity = Math.floor(
      (now.getTime() - new Date(mostRecentActivity.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity > 90) {
      score = Math.max(score - 30, 0);
    } else if (daysSinceLastActivity > 60) {
      score = Math.max(score - 15, 0);
    }
  }

  return Math.min(score, 100);
}

/**
 * Convert numerical score to letter grade
 */
function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

/**
 * Generate actionable recommendations based on scores
 */
function generateRecommendations(params: {
  engagement: number;
  demographics: number;
  behavior: number;
  timing: number;
  finalScore: number;
}): string[] {
  const recommendations: string[] = [];
  const { engagement, demographics, behavior, timing, finalScore } = params;

  // Overall recommendations based on grade
  if (finalScore >= 90) {
    recommendations.push(
      'Hot lead! Prioritize immediate outreach and schedule a demo.',
      'Consider assigning to your top sales representative.'
    );
  } else if (finalScore >= 75) {
    recommendations.push(
      'Qualified lead. Follow up within 24 hours.',
      'Nurture with personalized content and case studies.'
    );
  } else if (finalScore >= 60) {
    recommendations.push(
      'Moderate interest. Add to nurture campaign.',
      'Try to engage with more touchpoints before prioritizing.'
    );
  } else if (finalScore >= 40) {
    recommendations.push(
      'Early-stage lead. Focus on education and awareness.',
      'Invite to webinars or send introductory content.'
    );
  } else {
    recommendations.push(
      'Cold lead. Add to long-term nurture campaign.',
      'Re-engage in 3-6 months with industry updates.'
    );
  }

  // Specific factor recommendations
  if (engagement < 50) {
    recommendations.push(
      'Low engagement. Try multiple channels (email, phone, LinkedIn).',
      'Consider sending a personalized video message.'
    );
  }

  if (demographics < 50) {
    recommendations.push(
      'Incomplete profile. Research the contact and company online.',
      'Use tools like LinkedIn or company website to gather more info.'
    );
  }

  if (behavior < 50) {
    recommendations.push(
      'Limited buying signals. Offer value first before asking for a meeting.',
      'Share relevant content to gauge interest level.'
    );
  }

  if (timing < 50) {
    recommendations.push(
      'Stale lead. Re-engage with a new angle or fresh perspective.',
      'Check if there are any recent company news or events to reference.'
    );
  }

  return recommendations;
}

/**
 * Batch calculate scores for multiple contacts
 */
export async function batchCalculateScores(
  inputs: LeadScoreInput[]
): Promise<Map<string, LeadScoreOutput>> {
  const results = new Map<string, LeadScoreOutput>();

  for (const input of inputs) {
    const score = calculateLeadScore(input);
    results.set(input.contact.id, score);
  }

  return results;
}

/**
 * Get lead score color for UI display
 */
export function getLeadScoreColor(score: number): string {
  if (score >= 90) return '#10b981'; // green-500
  if (score >= 75) return '#22c55e'; // green-600
  if (score >= 60) return '#eab308'; // yellow-500
  if (score >= 40) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
}

/**
 * Get lead score grade color
 */
export function getLeadScoreGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return '#10b981'; // green
    case 'B':
      return '#22c55e'; // light green
    case 'C':
      return '#eab308'; // yellow
    case 'D':
      return '#f97316'; // orange
    case 'F':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
}
