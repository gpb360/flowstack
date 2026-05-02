/**
 * Badge Variant Mappings for CRM Module
 *
 * Centralized utility for mapping status values to Untitled UI badge variants.
 * This replaces inline style color functions with semantic variants.
 */

export type BadgeVariantType = 'success' | 'error' | 'warning' | 'info' | 'neutral';

/**
 * Map deal status to badge variant
 */
export function mapDealStatusToVariant(status: string): BadgeVariantType {
  switch (status) {
    case 'won':
      return 'success';
    case 'lost':
    case 'abandoned':
      return 'error';
    case 'open':
      return 'info';
    default:
      return 'neutral';
  }
}

/**
 * Map activity status to badge variant
 */
export function mapActivityStatusToVariant(status: string): BadgeVariantType {
  switch (status) {
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    case 'pending':
      return 'warning';
    case 'in_progress':
      return 'info';
    default:
      return 'neutral';
  }
}

/**
 * Map lead score grade to badge variant
 */
export function mapLeadGradeToVariant(grade: string): BadgeVariantType {
  switch (grade) {
    case 'A':
    case 'B':
      return 'success';
    case 'C':
      return 'warning';
    case 'D':
      return 'error';
    case 'F':
      return 'error';
    default:
      return 'neutral';
  }
}

/**
 * Map lead score (0-100) to badge variant
 */
export function mapLeadScoreToVariant(score: number): BadgeVariantType {
  if (score >= 90) return 'success';
  if (score >= 75) return 'success';
  if (score >= 60) return 'warning';
  if (score >= 40) return 'error';
  return 'error';
}
