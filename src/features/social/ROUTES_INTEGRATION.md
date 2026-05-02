# Social Planner Routes Integration

Add these imports to `src/App.tsx` after the existing lazy imports:

```typescript
// Social Planner
const SocialLayout = React.lazy(() => import('./features/social').then(m => ({ default: m.SocialLayout })));
const SocialCalendar = React.lazy(() => import('./features/social/calendar/SocialCalendar').then(m => ({ default: m.SocialCalendar })));
const PostComposer = React.lazy(() => import('./features/social/composer/PostComposer').then(m => ({ default: m.PostComposer })));
const PostsList = React.lazy(() => import('./features/social/posts/PostsList').then(m => ({ default: m.PostsList })));
const PostDetails = React.lazy(() => import('./features/social/posts/PostDetails').then(m => ({ default: m.PostDetails })));
const AccountsList = React.lazy(() => import('./features/social/accounts/AccountsList').then(m => ({ default: m.AccountsList })));
const MediaLibrary = React.lazy(() => import('./features/social/media/MediaLibrary').then(m => ({ default: m.MediaLibrary })));
const CampaignsList = React.lazy(() => import('./features/social/campaigns/CampaignsList').then(m => ({ default: m.CampaignsList })));
const CampaignBuilder = React.lazy(() => import('./features/social/campaigns/CampaignBuilder').then(m => ({ default: m.CampaignBuilder })));
const CampaignAnalytics = React.lazy(() => import('./features/social/campaigns/CampaignAnalytics').then(m => ({ default: m.CampaignAnalytics })));
const SocialAnalytics = React.lazy(() => import('./features/social/analytics/SocialAnalytics').then(m => ({ default: m.SocialAnalytics })));
```

Then add these routes inside the main Route (after the Calendar/Appointments routes and before the closing Route tags):

```tsx
{/* Social Planner Module Routes */}
<Route path="social" element={
  <FeatureGuard moduleId="social_planner" redirectTo="/">
    <Suspense fallback={<PageLoader />}>
      <SocialLayout />
    </Suspense>
  </FeatureGuard>
}>
  <Route index element={
    <Suspense fallback={<PageLoader />}>
      <SocialCalendar />
    </Suspense>
  } />
  <Route path="composer" element={
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <Suspense fallback={<PageLoader />}>
        <PostComposer />
      </Suspense>
    </RoleGuard>
  } />
  <Route path="posts" element={
    <Suspense fallback={<PageLoader />}>
      <PostsList />
    </Suspense>
  } />
  <Route path="posts/:postId" element={
    <Suspense fallback={<PageLoader />}>
      <PostDetails />
    </Suspense>
  } />
  <Route path="accounts" element={
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <Suspense fallback={<PageLoader />}>
        <AccountsList />
      </Suspense>
    </RoleGuard>
  } />
  <Route path="media" element={
    <Suspense fallback={<PageLoader />}>
      <MediaLibrary />
    </Suspense>
  } />
  <Route path="campaigns" element={
    <Suspense fallback={<PageLoader />}>
      <CampaignsList />
    </Suspense>
  } />
  <Route path="campaigns/new" element={
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <Suspense fallback={<PageLoader />}>
        <CampaignBuilder />
      </Suspense>
    </RoleGuard>
  } />
  <Route path="campaigns/:campaignId" element={
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <Suspense fallback={<PageLoader />}>
        <CampaignBuilder />
      </Suspense>
    </RoleGuard>
  } />
  <Route path="campaigns/:campaignId/analytics" element={
    <Suspense fallback={<PageLoader />}>
      <CampaignAnalytics />
    </Suspense>
  } />
  <Route path="analytics" element={
    <Suspense fallback={<PageLoader />}>
      <SocialAnalytics />
    </Suspense>
  } />
</Route>
```

## Navigation

Add the Social Planner link to your navigation menu:

```tsx
<Link to="/social" className="flex items-center gap-3">
  <Share2 className="h-5 w-5" />
  <span>Social Planner</span>
</Link>
```

## Access Control

The Social Planner uses these access controls:
- **Calendar, Posts, Media**: All organization members
- **Composer, Accounts, Campaigns**: Owner and Admin roles only (as specified in routes)

To change access permissions, modify the `RoleGuard` components in the routes above.
