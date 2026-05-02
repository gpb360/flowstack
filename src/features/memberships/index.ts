/**
 * Membership Module Exports
 */

// Layout
export { MembershipLayout } from './MembershipLayout';

// Plans
export { PlansList } from './plans/PlansList';
export { PlanEditor } from './plans/PlanEditor';
export { PlanComparison } from './plans/PlanComparison';

// Members
export { MembersList } from './members/MembersList';
export { MemberDetails } from './members/MemberDetails';
export { MemberProgress } from './members/MemberProgress';

// Content
export { ContentLibrary } from './content/ContentLibrary';
export { ContentEditor } from './content/ContentEditor';

// Payments
export { PaymentsList } from './payments/PaymentsList';

// Portal
export { MemberPortal } from './portal/MemberPortal';
export { ContentViewer } from './portal/ContentViewer';

// Hooks
export {
  useMembershipPlans,
  useMembershipPlan,
  usePublicPlans,
  useUserSubscription,
  useSubscriptions,
  useSavePlan,
  useDeletePlan,
  useUpdateSubscription,
  useCancelSubscription,
  useSubscriptionStats,
  useMemberProgress,
  useUpdateProgress,
  useCourseWithProgress,
  useContentWithAccess,
} from './hooks/useMemberships';

export {
  useMembershipContent,
  useContentTree,
  useContent,
  useContentWithChildren,
  useContentSearch,
  useSaveContent,
  useDeleteContent,
  useDuplicateContent,
  useUpdateContentOrder,
  usePublishContent,
  useContentStats,
  usePopularContent,
  useCertificates,
  useVerifyCertificate,
  useIssueCertificate,
} from './hooks/useMembershipContent';

export {
  useContentAccess,
  useAccessRecords,
  useGrantAccess,
  useRevokeAccess,
  useUpdateAccessType,
  useContentProgress,
  useUpdateLessonProgress,
  useBookmarkContent,
  useUpdateContentNotes,
  useBookmarkedContent,
  useCompletedContent,
  useInProgressContent,
  useBulkGrantAccess,
  useAccessSummary,
} from './hooks/useMemberAccess';

// Lib
export {
  checkContentAccess,
  getAccessibleContent,
  grantContentAccess,
  updateContentProgress,
  canUserUpgrade,
} from './lib/access';

export {
  buildContentTree,
  calculateCourseProgress,
  formatVideoDuration,
  getContentThumbnail,
  searchContent,
  getCourseWithProgress,
  updateContentOrder,
  duplicateContent,
} from './lib/content';

export {
  createCheckoutSession,
  createPortalSession,
  updateSubscription,
  cancelSubscription,
  resumeSubscription,
  getSubscriptionUsage,
  handleWebhookEvent,
} from './lib/stripe';
