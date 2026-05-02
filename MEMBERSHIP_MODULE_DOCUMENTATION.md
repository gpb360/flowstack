# Membership Sites Module - Complete Implementation

## Overview

The Membership Sites module provides complete gated content delivery, course management, and subscription functionality for FlowStack. It integrates with Stripe for payments and includes a public member portal.

## Features

### 1. Membership Plans Management
- Create/edit/delete subscription tiers
- Flexible pricing (one-time, monthly, yearly)
- Feature lists per plan
- Content tier assignments
- Trial periods
- Stripe price ID integration
- Plan comparison view
- Featured/badge support

### 2. Member Management
- View all subscribers
- Filter by status (active, trial, past_due, cancelled)
- Detailed member profiles
- Content progress tracking
- Subscription management
- Internal notes
- Contact integration

### 3. Content Library
- Support for courses, videos, documents, resources
- Content tree structure (courses with lessons)
- Access tier assignment (free, basic, premium, VIP)
- Drip content (delayed availability)
- Draft/published states
- Content statistics (views, likes)
- Search and filtering

### 4. Member Portal
- Public-facing content access
- Course progress tracking
- Video playback
- Downloadable resources
- Certificate issuance
- Bookmarks and notes
- Continue learning section

### 5. Payment Integration
- Stripe checkout sessions
- Customer portal access
- Subscription updates/cancellations
- Payment history
- MRR/ARR tracking
- Webhook handling

### 6. Access Control
- Content gating by tier
- Drip content scheduling
- MemberGuard component for protecting content
- Upgrade prompts
- Access validation

## File Structure

```
src/features/memberships/
├── lib/
│   ├── access.ts           # Access control logic
│   ├── content.ts          # Content management utilities
│   └── stripe.ts           # Stripe integration
├── hooks/
│   ├── useMemberships.ts   # Plan and subscription hooks
│   ├── useMembershipContent.ts  # Content hooks
│   └── useMemberAccess.ts  # Access control hooks
├── plans/
│   ├── PlansList.tsx       # Plan management UI
│   ├── PlanEditor.tsx      # Plan creation/editing
│   └── PlanComparison.tsx  # Pricing table view
├── members/
│   ├── MembersList.tsx     # Member list with filters
│   ├── MemberDetails.tsx   # Detailed member view
│   └── MemberProgress.tsx  # Progress tracking
├── content/
│   ├── ContentLibrary.tsx  # Content management
│   ├── ContentEditor.tsx   # Content creation/editing
│   └── ContentGating.tsx   # Access control UI
├── payments/
│   ├── PaymentsList.tsx    # Payment history
│   └── PaymentSettings.tsx # Stripe configuration
├── portal/
│   ├── MemberPortal.tsx    # Public member portal
│   ├── PortalLayout.tsx    # Portal layout
│   └── ContentViewer.tsx   # Content playback
├── MembershipLayout.tsx    # Admin layout
└── index.ts               # Module exports
```

## Database Schema

### Tables

1. **membership_plans** - Subscription tier definitions
2. **membership_subscriptions** - Active subscriptions
3. **membership_content** - Gated content (courses, videos, etc.)
4. **membership_access** - User access to content
5. **membership_progress** - Detailed lesson progress
6. **membership_certificates** - Issued certificates

### Key Relationships

- Plans → Subscriptions (one-to-many)
- Subscriptions → Access (one-to-many)
- Content → Access (one-to-many)
- Content → Progress (one-to-many via Access)
- Courses → Lessons (self-reference)

## Component Usage

### MemberGuard Component

Protect content based on membership status:

```tsx
import { MemberGuard } from '@/components/MemberGuard';

<MemberGuard
  contentId={content.id}
  organizationId={organizationId}
  requiredPlan="premium"
>
  <YourPremiumContent />
</MemberGuard>
```

### Plan Comparison

Display pricing table on your public pages:

```tsx
import { PlanComparison } from '@/features/memberships';

<PlanComparison
  organizationId={orgId}
  onSelectPlan={(planId) => handlePlanSelect(planId)}
  currentPlanId={userPlanId}
/>
```

### Member Portal

Embed the public portal:

```tsx
import { MemberPortal } from '@/features/memberships';

<MemberPortal organizationId={organizationId} />
```

## React Query Hooks

### Plans

```tsx
import { useMembershipPlans, useSavePlan } from '@/features/memberships';

const { data: plans } = useMembershipPlans(organizationId);
const savePlan = useSavePlan();
```

### Content

```tsx
import { useMembershipContent, useSaveContent } from '@/features/memberships';

const { data: content } = useMembershipContent(organizationId, {
  content_type: 'course',
  access_tier: 'premium'
});
```

### Access Control

```tsx
import { useContentAccess } from '@/features/memberships';

const { data: access } = useContentAccess(contentId, organizationId);
// Returns: { hasAccess, accessType, availableAt, reason }
```

### Member Progress

```tsx
import { useAccessSummary } from '@/features/memberships';

const { data: summary } = useAccessSummary(subscriptionId);
// Returns: { total, completed, inProgress, avgProgress, totalTimeSpent }
```

## Stripe Integration

### Create Checkout Session

```tsx
import { createCheckoutSession } from '@/features/memberships/lib/stripe';

const session = await createCheckoutSession({
  planId: 'plan-uuid',
  userId: 'user-uuid',
  organizationId: 'org-uuid',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel',
});
```

### Create Portal Session

```tsx
import { createPortalSession } from '@/features/memberships/lib/stripe';

const portalUrl = await createPortalSession(userId, returnUrl);
```

### Update Subscription

```tsx
import { updateSubscription } from '@/features/memberships/lib/stripe';

await updateSubscription({
  subscriptionId: 'sub-uuid',
  newPlanId: 'new-plan-uuid',
  prorationBehavior: 'create_prorations',
});
```

## Edge Functions Required

### stripe-create-customer
Creates a new Stripe customer.

### stripe-create-checkout
Creates a checkout session for new subscriptions.

### stripe-create-portal
Creates a customer portal session.

### stripe-update-subscription
Updates subscription plan.

### stripe-cancel-subscription
Cancels subscription at period end.

### stripe-resume-subscription
Resumes cancelled subscription.

## Routes

### Admin Routes
- `/memberships/plans` - Manage plans
- `/memberships/members` - View members
- `/memberships/content` - Manage content
- `/memberships/payments` - View payments

### Public Routes
- `/portal/:organizationId` - Member portal

## Permissions

All admin routes require `owner` or `admin` role via `RoleGuard`.

Module requires `integrations` to be enabled (for Stripe).

## Content Types

- **course** - Collection of lessons with progress tracking
- **video** - Single video with playback tracking
- **document** - PDF/document download
- **resource** - Any downloadable resource
- **live_event** - Scheduled live sessions

## Access Tiers

- **free** - Available to everyone
- **basic** - Basic plan members
- **premium** - Premium plan members
- **vip** - VIP plan members

## Progress Tracking

- Automatic progress calculation for courses
- Video position tracking
- Lesson completion status
- Time spent tracking
- Bookmark support
- Notes per content item

## Drip Content

Content can be scheduled to release X days after subscription:

```tsx
const content = {
  title: 'Advanced Module',
  drip_delay_days: 30, // Available 30 days after subscription
};
```

The system automatically checks availability and shows countdowns.

## Certificates

When a member completes a course:

```tsx
import { useIssueCertificate } from '@/features/memberships';

const issueCertificate = useIssueCertificate();

await issueCertificate.mutateAsync({
  subscriptionId: 'sub-uuid',
  contentId: 'course-uuid',
  userId: 'user-uuid',
  organizationId: 'org-uuid',
});
```

Certificates include:
- Certificate number
- Verification token
- PDF generation capability
- Public verification page

## Content Gating Example

```tsx
import { MemberGuard } from '@/components/MemberGuard';

function PremiumCourse() {
  return (
    <MemberGuard
      contentId="course-uuid"
      organizationId="org-uuid"
      requiredPlan="premium"
      fallback={<UpgradePrompt />}
    >
      <CourseContent />
    </MemberGuard>
  );
}
```

## Stats & Analytics

Track:
- Total subscribers (MRR/ARR)
- Content engagement (views, likes, completion)
- Progress by member
- Popular content
- Certificate issuance

## Best Practices

1. **Always use MemberGuard** for gated content
2. **Set content_tiers** on plans for access control
3. **Use drip content** for structured course releases
4. **Track progress** automatically through ContentViewer
5. **Enable Stripe webhooks** for subscription sync
6. **Use React Query hooks** for data fetching
7. **Respect RLS policies** in database queries

## Integration Points

- **CRM**: Member profiles come from user_profiles/contacts
- **Integrations**: Requires Stripe integration
- **Site Builder**: Can embed pricing tables, member portal
- **Email**: Trigger emails on subscription events

## Future Enhancements

- Coupon/discount codes
- Payment plans
- Team/group subscriptions
- Content comments/forums
- Quiz scoring integration
- Certificate templates
- Bulk member import
- Advanced drip scheduling
- Content recommendations
- Gamification (badges, points)

## Troubleshooting

### Members can't access content
1. Check plan's `content_tiers` array
2. Verify content's `access_tier` matches
3. Check subscription status is `active`
4. Verify RLS policies

### Stripe webhooks failing
1. Verify webhook secret in Edge Function
2. Check Stripe webhook endpoint configuration
3. Review Supabase logs for errors

### Progress not saving
1. Verify `subscriptionId` is correct
2. Check `accessId` is being used
3. Ensure user is authenticated

## Support

For issues or questions, refer to:
- Database schema: `db/membership_schema.sql`
- Type definitions: `src/types/database.types.ts`
- Component examples: Above documentation
