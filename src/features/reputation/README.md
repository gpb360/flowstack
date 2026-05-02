# Reputation Management Module

## Overview

The Reputation Management module provides comprehensive review aggregation, monitoring, and response management for FlowStack. It connects to multiple review platforms (Google, Yelp, Facebook, TripAdvisor, etc.) and provides tools to manage your online reputation effectively.

## Features

### Core Capabilities

- **Multi-Platform Review Aggregation**: Connect to Google, Yelp, Facebook, TripAdvisor, Trustpilot, Zomato, and OpenTable
- **Review Management**: View, filter, search, and respond to reviews from all platforms in one place
- **Response Templates**: Create and manage pre-written response templates for different review types
- **Auto-Response Rules**: Configure automatic responses based on rating, sentiment, and keywords
- **Alert System**: Get notified about negative reviews, rating changes, and other important events
- **Analytics Dashboard**: Track rating trends, response rates, and sentiment analysis
- **Embeddable Widgets**: Display review badges and testimonial carousels on your website

## Architecture

### Database Schema

The module uses 7 main tables:

1. **`review_sources`**: Connected review platforms and their sync settings
2. **`reviews`**: Aggregated reviews from all platforms
3. **`review_responses`**: Responses to reviews
4. **`review_flags`**: Flagged reviews for moderation
5. **`review_notifications`**: Notification settings per source
6. **`review_analytics`**: Aggregated metrics by time period
7. **`reputation_alerts`**: Alert notifications

### Directory Structure

```
src/features/reputation/
├── lib/
│   ├── aggregators.ts      # Review aggregation logic
│   ├── responders.ts       # Response management
│   └── alerts.ts           # Alert system
├── hooks/
│   ├── useReviews.ts       # Review queries and mutations
│   ├── useReviewSources.ts # Source management
│   └── useReputationAlerts.ts # Alerts and responses
├── reviews/
│   ├── ReviewsList.tsx     # Main reviews list with filters
│   └── ReviewDetail.tsx    # Individual review view
├── sources/
│   └── SourcesList.tsx     # Connected platforms
├── responses/
│   └── ResponseTemplates.tsx # Template management
├── analytics/
│   ├── ReputationDashboard.tsx # Main dashboard
│   ├── RatingBreakdown.tsx    # Rating distribution
│   ├── SentimentAnalysis.tsx  # Sentiment chart
│   └── ReviewsChart.tsx       # Trend visualization
├── alerts/
│   └── AlertsList.tsx      # Alert notifications
├── widgets/
│   ├── ReviewBadge.tsx     # Embeddable rating badge
│   └── TestimonialCarousel.tsx # Review carousel
├── ReputationLayout.tsx    # Main layout with navigation
└── index.ts               # Module exports
```

## API Reference

### Data Layer (lib/)

#### `aggregators.ts`

**Functions:**

- `getReviewSources(organizationId)` - Fetch all connected sources
- `getReviews(organizationId, filters)` - Fetch reviews with optional filters
- `getReviewDetail(reviewId)` - Fetch single review with responses
- `getReviewSummary(organizationId, sourceId, days)` - Get aggregated metrics
- `getRatingDistribution(organizationId, sourceId, days)` - Get rating breakdown
- `getReviewsTrend(organizationId, sourceId, days)` - Get review volume over time
- `syncReviewsFromSource(sourceId)` - Trigger manual sync
- `updateReviewStatus(reviewId, status)` - Mark as read/flagged/hidden
- `assignReview(reviewId, userId)` - Assign to team member

**Types:**

```typescript
interface Review {
  id: string;
  organization_id: string;
  source_id: string;
  platform_review_id: string;
  reviewer_name?: string;
  rating: number;
  title?: string;
  content?: string;
  review_date: string;
  status: 'new' | 'read' | 'flagged' | 'hidden';
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
}

interface ReviewSource {
  id: string;
  organization_id: string;
  platform: 'google' | 'yelp' | 'facebook' | 'tripadvisor' | 'trustpilot' | 'zomato' | 'opentable';
  business_name: string;
  sync_enabled: boolean;
  auto_response_enabled: boolean;
  average_rating?: number;
  total_reviews: number;
}
```

#### `responders.ts`

**Functions:**

- `getReviewResponses(reviewId)` - Fetch all responses for a review
- `createResponse(organizationId, reviewId, response)` - Create new response
- `postResponseToPlatform(responseId)` - Post response to platform
- `getResponseTemplates(organizationId)` - Get all templates
- `getSuggestedTemplates(organizationId, rating, sentiment)` - Get matching templates
- `applyTemplate(template, variables)` - Replace template variables
- `bulkCreateResponses(organizationId, responses)` - Create multiple responses

**Types:**

```typescript
interface ReviewResponse {
  id: string;
  organization_id: string;
  review_id: string;
  content: string;
  status: 'draft' | 'posted' | 'failed';
  response_type: 'public' | 'private' | 'both';
  posted_at?: string;
}

interface ResponseTemplate {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  content: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  rating_range?: [number, number];
  variables?: string[];
}
```

#### `alerts.ts`

**Functions:**

- `getNotificationSettings(sourceId)` - Get notification preferences
- `upsertNotificationSettings(organizationId, sourceId, settings)` - Configure notifications
- `getReviewFlags(organizationId, filters)` - Get flagged reviews
- `flagReview(organizationId, reviewId, flag)` - Flag a review
- `resolveFlag(flagId, resolvedBy, resolutionNotes, actionTaken)` - Resolve flag
- `getReputationAlerts(organizationId, filters)` - Get alerts
- `markAlertRead(alertId)` - Mark alert as read
- `dismissAlert(alertId)` - Dismiss alert

**Types:**

```typescript
interface ReviewNotification {
  id: string;
  organization_id: string;
  source_id: string;
  notify_on_new_review: boolean;
  notify_on_negative_review: boolean;
  negative_threshold: number;
  email_enabled: boolean;
  email_recipients: string[];
  sms_enabled: boolean;
  slack_enabled: boolean;
  digest_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

interface ReputationAlert {
  id: string;
  organization_id: string;
  type: 'negative_review' | 'rating_drop' | 'review_volume' | 'response_needed';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  read: boolean;
  dismissed: boolean;
}
```

### React Query Hooks

#### `useReviews.ts`

```typescript
const { data: reviews, isLoading } = useReviews({
  sourceId?: string;
  rating?: number;
  status?: string;
  sentiment?: string;
  search?: string;
  limit?: number;
});

const updateStatus = useUpdateReviewStatus();
updateStatus.mutate({ reviewId, status });

const assignReview = useAssignReview();
assignReview.mutate({ reviewId, userId });
```

#### `useReviewSources.ts`

```typescript
const { data: sources } = useReviewSources();

const createSource = useCreateReviewSource();
createSource.mutate(sourceData);

const syncReviews = useSyncReviews();
syncReviews.mutate(sourceId);
```

#### `useReputationAlerts.ts`

```typescript
const { data: alerts } = useReputationAlerts({
  read?: boolean;
  dismissed?: boolean;
  severity?: string;
});

const markRead = useMarkAlertRead();
markRead.mutate(alertId);

const { data: templates } = useResponseTemplates();
const createResponse = useCreateResponse();
createResponse.mutate({ reviewId, response });
```

## Components

### ReviewsList

Main reviews list with filtering, sorting, and bulk actions.

```tsx
<ReviewsList />
```

**Features:**
- Filter by source, rating, status, sentiment, date range
- Search reviews by content or reviewer name
- Bulk mark as read/flagged
- Bulk response
- Navigate to review details

### ReviewDetail

Full review view with response management.

```tsx
<ReviewDetail />
```

**Features:**
- Complete review information
- Review images/videos
- Response history
- Write and post responses
- Suggested templates
- Flag review

### SourcesList

Connected review platforms management.

```tsx
<SourcesList />
```

**Features:**
- View all connected sources
- Platform status and sync info
- Average rating and review count
- Manual sync
- Configure settings
- Connect new sources

### ResponseTemplates

Template management interface.

```tsx
<ResponseTemplates />
```

**Features:**
- Create/edit/delete templates
- Template variables support
- Sentiment and rating filters
- Preview and apply templates

### ReputationDashboard

Analytics dashboard with metrics and charts.

```tsx
<ReputationDashboard />
```

**Features:**
- Key metrics (avg rating, total reviews, response rate)
- Rating distribution chart
- Sentiment analysis
- Review trend over time
- Response statistics
- Quick action links

### AlertsList

Alert notifications interface.

```tsx
<AlertsList />
```

**Features:**
- Filter by severity and status
- Mark as read
- Dismiss alerts
- Navigate to related content
- Mark all as read

### Widgets

Embeddable widgets for displaying reviews on your website.

```tsx
<ReviewBadge
  organizationId="org-123"
  platform="all"
  showRating={true}
  showCount={true}
  theme="light"
/>

<TestimonialCarousel
  organizationId="org-123"
  minRating={4}
  autoPlay={true}
  autoPlayInterval={5000}
  maxItems={5}
/>
```

## Routes

- `/reputation` - Dashboard (ReputationDashboard)
- `/reputation/reviews` - Reviews list (ReviewsList)
- `/reputation/reviews/:reviewId` - Review detail (ReviewDetail)
- `/reputation/sources` - Connected sources (SourcesList)
- `/reputation/responses` - Response templates (ResponseTemplates)
- `/reputation/alerts` - Alerts list (AlertsList)

## Integration Points

### CRM Integration

Reviews can be linked to CRM contacts:

```typescript
// Reviews are automatically associated with contacts by email
// Access via the reviewer's email
const contact = await getContactByEmail(review.reviewer_email);
```

### Workflow Integration

Review events trigger workflows:

- `review.new` - New review received
- `review.negative` - Negative review posted
- `review.flagged` - Review flagged
- `review.responded` - Response posted

### Marketing Integration

Use review data in campaigns:

```typescript
// Get 5-star reviews for testimonials
const testimonials = await getReviews(orgId, {
  rating: 5,
  sentiment: 'positive',
  limit: 10,
});
```

## Best Practices

### Response Management

1. **Set up auto-response templates** for common review types
2. **Respond to negative reviews quickly** (within 24 hours)
3. **Personalize responses** using template variables
4. **Use suggested templates** for consistency
5. **Track response rates** in the dashboard

### Alert Configuration

1. **Enable email notifications** for negative reviews
2. **Set appropriate negative thresholds** (usually 3 stars or below)
3. **Use digest mode** for high-volume sources
4. **Configure Slack/webhook** for team notifications
5. **Review alerts daily** for critical issues

### Review Monitoring

1. **Sync sources daily** or more frequently for active businesses
2. **Monitor rating trends** weekly
3. **Flag inappropriate reviews** immediately
4. **Tag reviews** for categorization
5. **Export reviews** for further analysis

## Future Enhancements

- AI-powered sentiment analysis
- Smart response suggestions
- Review export to CRM
- Review request campaigns
- Competitive benchmarking
- Review scheduling
- Multi-language support
- Platform-specific response formatting
- Review escalation workflows

## Troubleshooting

### Reviews not syncing

1. Check source status in `/reputation/sources`
2. Verify API credentials are valid
3. Trigger manual sync
4. Check error messages in source settings
5. Ensure sync frequency is configured

### Template variables not working

1. Use correct format: `{variable_name}`
2. Ensure variables are defined in template metadata
3. Check variable values in review context
4. Preview before applying

### Alerts not appearing

1. Check notification settings for each source
2. Verify alert filters
3. Ensure email/Slack webhooks are configured
4. Check spam folders
5. Verify alert severity settings

## Support

For issues or questions about the Reputation Management module:
- Check the database schema: `db/reputation_schema.sql`
- Review component examples in `src/features/reputation/`
- Consult API documentation above
- Contact support for platform-specific API issues
