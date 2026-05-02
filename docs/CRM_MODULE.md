# CRM Module Documentation

## Overview

The CRM (Customer Relationship Management) module is a **core module** in FlowStack that provides comprehensive contact, company, deal pipeline, and activity management with lead scoring capabilities.

## Features

- **Contacts Management**: Full CRUD operations with filtering, search, and tags
- **Companies Management**: Manage company profiles with associated contacts
- **Deals/Pipelines**: Visual Kanban board for deal pipeline management with drag-and-drop
- **Activities**: Timeline-based activity tracking (notes, calls, meetings, emails, tasks)
- **Lead Scoring**: Algorithmic lead scoring with multiple factors and recommendations

## Architecture

### Directory Structure

```
src/features/crm/
├── lib/
│   ├── supabase.ts           # CRM-specific Supabase queries and mutations
│   └── lead-scoring.ts       # Lead scoring algorithm
├── hooks/
│   ├── useContacts.ts        # Contacts data fetching and mutations
│   ├── useCompanies.ts       # Companies data fetching and mutations
│   ├── useDeals.ts           # Deals/Pipelines data fetching and mutations
│   ├── useActivities.ts      # Activities data fetching and mutations
│   └── index.ts
├── contacts/
│   ├── ContactsList.tsx      # Contacts list with DataTable
│   ├── ContactDetail.tsx     # Contact detail page with timeline
│   ├── ContactForm.tsx       # Contact create/edit form
│   ├── ContactImport.tsx     # CSV import wizard
│   └── index.ts
├── companies/
│   ├── CompaniesList.tsx     # Companies list
│   ├── CompanyDetail.tsx     # Company detail page
│   ├── CompanyForm.tsx       # Company create/edit form
│   └── index.ts
├── deals/
│   ├── PipelineBoard.tsx     # Kanban board for deals
│   ├── DealCard.tsx          # Deal card component
│   ├── DealDetail.tsx        # Deal detail page
│   ├── DealForm.tsx          # Deal create/edit form
│   └── index.ts
├── activities/
│   ├── ActivityTimeline.tsx  # Activity timeline view
│   ├── ActivityForm.tsx      # Quick activity logger
│   ├── ActivityTypes.ts      # Activity type definitions
│   └── index.ts
├── CrmLayout.tsx            # Main CRM layout with navigation
└── index.ts
```

### Database Schema

The CRM module uses the following database tables (see `db/` directory for schema files):

- **contacts**: Contact information
- **companies**: Company profiles
- **pipelines**: Deal pipelines
- **stages**: Pipeline stages
- **deals**: Deal/opportunity records
- **activities**: Activity tracking
- **deal_history**: Deal stage/status change history
- **tags**: Tag management
- **contact_tags**: Contact-tag junction table
- **lead_scores**: Cached lead scores

## Data Layer

### Queries (`src/features/crm/lib/supabase.ts`)

The data layer provides comprehensive query and mutation functions:

#### Contacts

```typescript
// Fetch contacts with filtering
fetchContacts(params: {
  organizationId: string;
  search?: string;
  companyId?: string;
  ownerId?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
})

// Fetch single contact
fetchContactById(contactId: string)

// CRUD operations
createContact(contact: ContactInsert)
updateContact(contactId: string, updates: ContactUpdate)
deleteContact(contactId: string)
```

#### Companies

```typescript
fetchCompanies(params: {...})
fetchCompanyById(companyId: string)
fetchCompanyContacts(companyId: string)
createCompany(company: CompanyInsert)
updateCompany(companyId: string, updates: CompanyUpdate)
deleteCompany(companyId: string)
```

#### Deals/Pipelines

```typescript
fetchDeals(params: {...})
fetchDealById(dealId: string)
fetchPipelineWithStages(pipelineId: string)
fetchPipelines(organizationId: string)
fetchDealHistory(dealId: string)
createDeal(deal: DealInsert)
updateDeal(dealId: string, updates: DealUpdate)
moveDealToStage(params: {...})  // Creates history record
updateDealStatus(params: {...})  // Creates history record
deleteDeal(dealId: string)
```

#### Activities

```typescript
fetchActivities(params: {...})
createActivity(activity: ActivityInsert)
updateActivity(activityId: string, updates: Partial<ActivityInsert>)
deleteActivity(activityId: string)
```

#### Tags

```typescript
fetchTags(organizationId: string)
fetchContactTags(contactId: string)
createTag(params: {...})
updateTag(tagId: string, updates: {...})
deleteTag(tagId: string)
addTagToContact(params: {...})
removeTagFromContact(params: {...})
```

#### Metrics

```typescript
fetchCRMMetrics(organizationId: string)
// Returns: { totalContacts, totalCompanies, totalDeals, totalValue, wonDeals, openDeals, recentActivities }
```

### React Query Hooks (`src/features/crm/hooks/`)

All hooks use React Query for data fetching and caching:

#### useContacts

```typescript
useContacts(params?: UseContactsParams)
useContact(contactId: string)
useCreateContact()
useUpdateContact()
useDeleteContact()
useContactTags(contactId: string)
useAddTagToContact()
useRemoveTagFromContact()
useCalculateLeadScore()
useImportContacts()
```

#### useCompanies

```typescript
useCompanies(params?: UseCompaniesParams)
useCompany(companyId: string)
useCompanyContacts(companyId: string)
useCreateCompany()
useUpdateCompany()
useDeleteCompany()
```

#### useDeals

```typescript
useDeals(params?: UseDealsParams)
useDeal(dealId: string)
useDealHistory(dealId: string)
usePipeline(pipelineId: string)
usePipelines()
useCreateDeal()
useUpdateDeal()
useMoveDeal()  // Handles stage changes
useUpdateDealStatus()
useDeleteDeal()
```

#### useActivities

```typescript
useActivities(params?: UseActivitiesParams)
useCreateActivity()
useUpdateActivity()
useDeleteActivity()
useTags()
useCreateTag()
useUpdateTag()
useDeleteTag()
useLogNote()
useLogCall()
useLogMeeting()
useLogEmail()
useLogTask()
```

## Lead Scoring

The lead scoring algorithm (`src/features/crm/lib/lead-scoring.ts`) calculates scores based on four factors:

### Scoring Factors

1. **Engagement (30%)**: Recent interactions, email opens, link clicks, website visits
2. **Demographics (20%)**: Job title, company size, industry fit
3. **Behavior (30%)**: Form submissions, content downloads, demo requests, deal progression
4. **Timing (20%)**: Recency of activity, urgency signals, deal stage position

### Usage

```typescript
import { calculateLeadScore } from '@/features/crm/lib/lead-scoring';

const result = calculateLeadScore({
  contact: contactData,
  company: companyData,
  activities: activitiesData,
  deals: dealsData,
});

// Result:
{
  score: 85,           // 0-100
  grade: 'B',          // A, B, C, D, F
  factors: {
    engagement: 80,
    demographics: 75,
    behavior: 90,
    timing: 85
  },
  recommendations: [
    "Qualified lead. Follow up within 24 hours.",
    "Nurture with personalized content and case studies."
  ]
}
```

### Score Grades

- **A** (90-100): Hot lead - prioritize immediately
- **B** (75-89): Qualified lead - follow up within 24 hours
- **C** (60-74): Moderate interest - add to nurture campaign
- **D** (40-59): Early-stage - focus on education
- **F** (0-39): Cold lead - long-term nurture

## Components

### Contacts Module

#### ContactsList

Features:
- DataTable with sorting and filtering
- Search by name, email
- Filter by tags
- Quick actions (edit, delete)
- Import from CSV

#### ContactDetail

Displays:
- Contact information (email, phone, position)
- Associated company
- Tags
- Associated deals
- Other contacts at the same company
- Activity timeline
- Lead score (with calculate button)

#### ContactForm

Create/edit contact with:
- Name (first, last)
- Email, phone
- Position/title
- Company selection
- Tags

#### ContactImport

CSV import wizard with:
- File upload
- Column mapping
- Preview
- Batch import

### Companies Module

#### CompaniesList

- DataTable with company information
- Search functionality
- Website links
- Location display

#### CompanyDetail

Shows:
- Company information
- Website, address
- Associated contacts
- Associated deals
- Total pipeline value
- Activity timeline

#### CompanyForm

Create/edit company with:
- Name
- Domain/website
- Address

### Deals/Pipelines Module

#### PipelineBoard

Kanban board featuring:
- Drag-and-drop deal management
- Stage columns
- Deal cards with value and contact
- Add deal/stage buttons
- Pipeline metrics (total deals, value)

#### DealCard

Displays:
- Deal title (linked to detail)
- Contact/company
- Value
- Status badge
- Expected close date

#### DealDetail

Shows:
- Deal information
- Value, currency
- Associated contact/company
- Expected close date
- Stage history
- Activity timeline
- Quick status actions (mark won/lost)

#### DealForm

Create/edit deal with:
- Title
- Pipeline and stage selection
- Value and currency
- Contact association
- Expected close date

### Activities Module

#### ActivityTimeline

Timeline view with:
- Activity type filtering
- Chronological display
- Activity icons and colors
- Related entity links

#### ActivityForm

Quick activity logger for:
- Notes
- Calls (with duration)
- Meetings (with duration, date/time)
- Emails (sent/received)
- Tasks (with due date)

#### ActivityTypes

Activity type definitions:
- **note**: General notes
- **email_sent**: Outbound emails
- **email_received**: Inbound emails
- **call**: Phone calls
- **meeting**: Scheduled meetings
- **task**: To-do items
- **deal_stage_change**: Pipeline movements
- **other**: Miscellaneous activities

## Routes

To add CRM routes to `App.tsx`, update the imports and route configuration:

```typescript
// Add imports
import { CrmLayout, CrmDashboard } from './features/crm';
import { ContactsList, ContactDetail } from './features/crm/contacts';
import { CompaniesList, CompanyDetail } from './features/crm/companies';
import { PipelineBoard, DealDetail } from './features/crm/deals';
import { ActivityTimeline } from './features/crm/activities';

// Add routes
<Route path="crm" element={
  <FeatureGuard moduleId="crm" redirectTo="/">
    <Suspense fallback={<PageLoader />}>
      <CrmLayout />
    </Suspense>
  </FeatureGuard>
}>
  <Route index element={<CrmDashboard />} />
  <Route path="contacts" element={<ContactsList />} />
  <Route path="contacts/:id" element={<ContactDetail />} />
  <Route path="companies" element={<CompaniesList />} />
  <Route path="companies/:id" element={<CompanyDetail />} />
  <Route path="deals" element={<PipelineBoard />} />
  <Route path="deals/:id" element={<DealDetail />} />
  <Route path="activities" element={<ActivityTimeline />} />
</Route>
```

## Integration Points

### Workflow Engine

Register CRM actions in `src/lib/workflows/actions.ts`:

```typescript
// Available CRM actions:
- create_contact: Create a new contact
- update_contact: Update contact information
- create_company: Create a new company
- create_deal: Create a new deal
- update_deal_stage: Move deal to a different stage
- log_activity: Log an activity
- update_lead_score: Recalculate lead score
```

### AI Integration

Register CRM tools in `src/lib/ai/`:

```typescript
// Available AI tools:
- find_contact: Search for contacts
- get_contact_details: Get full contact profile
- create_deal: Create a deal from AI conversation
- log_activity: Log activity from AI
- get_lead_score: Get lead score for a contact
```

### Forms Module

Form submissions can:
- Create contacts automatically
- Create companies
- Log activities
- Add tags

### Marketing Module

Campaign responses:
- Track as activities
- Update lead scores
- Create contacts from submissions

## UI Components Used

The CRM module uses these existing UI components:

- **DataTable**: For contacts/companies lists
- **KanbanBoard**: For deal pipelines (via @dnd-kit)
- **Timeline**: For activity feeds
- **PageHeader**: For all page headers
- **Badge**: For lead scores, deal stages, tags
- **DataCard**: For metrics display
- **Button, Input, Label**: Form components
- **EmptyState**: For empty states
- **Alert**: For notifications

## Customization

### Adding Custom Fields

To add custom fields to contacts/companies:

1. Update database schema with new columns
2. Update TypeScript types in `src/types/database.types.ts`
3. Add fields to forms (ContactForm, CompanyForm)
4. Update DataTable columns

### Adding Activity Types

To add new activity types:

1. Update `activities` table check constraint in schema
2. Add to `ActivityType` type in `ActivityTypes.ts`
3. Add to `ACTIVITY_TYPES` configuration
4. Update ActivityForm if needed

### Modifying Lead Scoring

To adjust the lead scoring algorithm:

1. Edit `src/features/crm/lib/lead-scoring.ts`
2. Modify factor weights (currently 30%, 20%, 30%, 20%)
3. Adjust scoring logic in factor functions
4. Update grade thresholds
5. Customize recommendations

## Best Practices

1. **Always use React Query hooks** for data operations
2. **Invalidate queries** after mutations to keep data fresh
3. **Use optimistic updates** for drag-and-drop operations
4. **Handle loading states** with Suspense and PageLoader
5. **Implement proper error handling** for all operations
6. **Use the Timeline component** for activity feeds
7. **Filter by organization_id** in all queries
8. **Cache lead scores** to avoid recalculating on every render

## Performance Considerations

- Lead scores are cached in the `lead_scores` table
- Activities are limited to 50 items per query by default
- Pagination is implemented for contacts/companies/deals
- React Query provides automatic caching and deduplication
- Use `enabled` flag in queries to prevent unnecessary fetching

## Security

All tables have RLS (Row Level Security) policies:

- Users can only access data from their organization
- Owners/admins have full access
- Members can view but may not edit (configurable via RoleGuard)

## Future Enhancements

Potential improvements:

1. **Email Integration**: Sync emails from Gmail/Outlook
2. **Calendar Integration**: Sync meetings from Google Calendar
3. **Advanced Reporting**: Custom reports and dashboards
4. **Automation Rules**: Trigger workflows based on events
5. **Document Storage**: Attach files to contacts/companies/deals
6. **Advanced Lead Scoring**: Machine learning-based scoring
7. **Team Collaboration**: @mentions, comments, assignments
8. **Mobile App**: React Native mobile application
