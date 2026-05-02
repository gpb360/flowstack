# FlowStack Comprehensive UI/UX Audit Report

**Date**: 2026-02-01
**Audited**: Marketing, Campaigns, Auth/API, Forms, Navigation, Dialogs

---

## Executive Summary

After a comprehensive audit of the FlowStack codebase, **the root cause of the 401 errors has been identified**: Marketing and Campaign queries are missing `organization_id` filters, causing RLS policy failures. Dialog close buttons are properly implemented - the issue may be event propagation or overlay conflicts.

---

## Priority 1: CRITICAL Fixes Required

### 1.1 401 Authorization Errors - Marketing/Campaign Section

**Root Cause**: All queries to `marketing_campaigns` and `marketing_templates` tables are **missing `.eq('organization_id', ...)` filter**.

**Affected Files** (11 files):
- `src/features/marketing/email/EmailCampaignsList.tsx`
- `src/features/marketing/email/EmailCampaignBuilder.tsx`
- `src/features/marketing/email/EmailCampaignDetail.tsx`
- `src/features/marketing/sms/SMSCampaignsList.tsx`
- `src/features/marketing/sms/SMSBuilder.tsx`
- `src/features/marketing/templates/TemplatesList.tsx`
- `src/features/marketing/templates/TemplateEditor.tsx`
- `src/features/marketing/analytics/MarketingDashboard.tsx`
- `src/features/marketing/CampaignList.tsx`
- `src/features/marketing/CampaignBuilder.tsx`
- `src/features/marketing/MarketingLayout.tsx`

**Fix Pattern**:
```typescript
// BEFORE (Broken - causes 401):
const { data } = await supabase
  .from('marketing_campaigns')
  .select('*')
  .eq('type', 'email')

// AFTER (Fixed):
import { useAuth } from '@/context/AuthContext';

const { organizationId } = useAuth();
const { data } = await supabase
  .from('marketing_campaigns')
  .select('*')
  .eq('type', 'email')
  .eq('organization_id', organizationId) // ADD THIS LINE
```

---

### 1.2 Missing RLS DELETE Policies

**Location**: `db/crm_schema.sql`

The `contacts` and `companies` tables are missing DELETE policies. Any delete operation will fail with 401.

---

## Priority 2: HIGH Priority Fixes

### 2.1 Console.log Placeholder Handlers (5 instances)

| File | Button | Action |
|------|--------|--------|
| CampaignList.tsx | Edit campaign | Open edit dialog |
| EmailCampaignsList.tsx | Duplicate/Delete | Clone/delete campaign |
| TemplatesList.tsx | Duplicate/Delete | Clone/delete template |

### 2.2 Missing onClick Handlers (3+ buttons)

| File | Component | Issue |
|------|-----------|-------|
| CampaignList.tsx | Filter button | No handler |
| AppHeader.tsx | Settings button | No handler |
| AppHeader.tsx | Profile Settings | No handler |

### 2.3 Non-functional Search (2 locations)

| File | Component | Issue |
|------|-----------|-------|
| CampaignList.tsx | Search input | No state/filtering |
| AppHeader.tsx | Global search (⌘K) | Placeholder only |

---

## Priority 3: MEDIUM Priority

### 3.1 Tooltip UX Issue

**Location**: `src/components/layout/AppLayout.tsx`

Uses native browser `title` attribute instead of Radix UI Tooltip. Tooltips don't disappear on hover away as expected.

### 3.2 Auth Error Handling

**Location**: `src/App.tsx`

React Query only retries failed queries once. Increase retry from 1 to 3.

---

## Findings That Were NOT Issues

✅ **Dialog/Sheet Close Buttons**: All properly implemented
✅ **Form State Hooks**: All forms have properly connected state
✅ **Mobile/Burger Menu**: Working correctly
✅ **Active/Archived Toggle**: Functional (labeled as All/Draft/Sending/Completed)

---

## Implementation Plan

### Phase 1: Critical Fixes
1. Add `organization_id` filters to all Marketing queries
2. Add missing RLS DELETE policies
3. Replace console.log handlers with real implementations

### Phase 2: High Priority
4. Add missing onClick handlers
5. Implement search functionality
6. Fix tooltip hover state

### Phase 3: Medium Priority
7. Add global 401 error handling
8. Increase query retry count

### Phase 4: Testing
9. Test all pages
