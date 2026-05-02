# FlowStack Marketing Module

Complete email and SMS marketing automation system with visual sequence builder, audience segmentation, and advanced analytics.

## Overview

The Marketing module provides a comprehensive solution for managing email and SMS campaigns, automation sequences, audience segmentation, and performance analytics. It integrates seamlessly with the CRM module for contact targeting and the Workflow engine for advanced automation.

## Features

### Email Marketing
- **Campaign Management**: Create, schedule, and send email campaigns
- **Visual Templates**: Rich template editor with drag-and-drop blocks
- **Variable Support**: Personalize emails with contact variables
- **A/B Testing**: Built-in support for campaign variants
- **Delivery Tracking**: Real-time open, click, and bounce tracking
- **Resend Integration**: Professional email delivery via Resend API

### SMS Marketing
- **SMS Campaigns**: Send bulk SMS messages to your contacts
- **Twilio Integration**: Reliable SMS delivery via Twilio API
- **Conversations**: Two-way SMS threading and response tracking
- **Segment Calculation**: Real-time cost and segment estimation
- **Character Counter**: SMS segment and cost calculator

### Automation Sequences
- **Visual Builder**: Drag-and-drop sequence editor
- **Multiple Triggers**: Manual, form submit, webhook, or contact-based
- **Step Types**:
  - Email steps with templates
  - SMS steps with custom messages
  - Wait steps (minutes, hours, days)
  - Conditional branching logic
- **Preview Mode**: Visualize your entire automation flow

### Audience Segmentation
- **Visual Builder**: Create complex segment rules
- **Field Matching**: Filter by any contact field
- **Operators**: Equals, contains, greater than, less than, in list
- **Logic**: AND/OR combinations for precise targeting
- **Live Preview**: See estimated segment size in real-time

### Analytics & Reporting
- **Campaign Performance**: Open rates, click rates, delivery stats
- **Channel Comparison**: Email vs SMS performance metrics
- **Trend Analysis**: Month-over-month performance tracking
- **Link Tracking**: Individual link performance analytics
- **Real-time Stats**: Live campaign progress monitoring

## Architecture

### Directory Structure

```
src/
├── features/
│   └── marketing/
│       ├── MarketingLayout.tsx         # Main layout with sidebar navigation
│       ├── email/                      # Email campaigns
│       │   ├── EmailCampaignsList.tsx
│       │   ├── EmailCampaignBuilder.tsx
│       │   └── EmailCampaignDetail.tsx
│       ├── sms/                        # SMS campaigns
│       │   ├── SMSCampaignsList.tsx
│       │   ├── SMSBuilder.tsx
│       │   └── SMSConversations.tsx
│       ├── templates/                  # Template management
│       │   ├── TemplatesList.tsx
│       │   ├── TemplateEditor.tsx
│       │   └── TemplateVariables.tsx
│       ├── sequences/                  # Automation sequences
│       │   └── SequenceBuilder.tsx
│       ├── segments/                   # Audience segmentation
│       │   └── SegmentBuilder.tsx
│       └── analytics/                  # Analytics dashboard
│           └── MarketingDashboard.tsx
└── lib/
    └── marketing/                      # External integrations
        ├── resend.ts                   # Email delivery via Resend
        ├── twilio.ts                   # SMS delivery via Twilio
        ├── templates.ts                # Template rendering
        └── index.ts                    # Main export
```

### Database Schema

The Marketing module uses three main tables:

- **`marketing_templates`**: Store email and SMS templates
- **`marketing_campaigns`**: Store campaign configurations
- **`marketing_logs`**: Track individual message deliveries

All tables are organization-scoped with Row Level Security (RLS) policies.

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Resend Email API
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Twilio SMS API
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Supabase (already configured)
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install @tanstack/react-query react-hook-form @hookform/resolvers zod
   npm install react-beautiful-dnd
   ```

2. **Configure External Services**:
   - Get Resend API key from [resend.com](https://resend.com)
   - Get Twilio credentials from [twilio.com](https://twilio.com)
   - Add credentials to environment variables

3. **Run Database Migrations**:
   ```bash
   # The marketing schema should already be applied
   # Check db/marketing_schema.sql
   ```

## Usage

### Creating an Email Campaign

1. Navigate to `/marketing/email`
2. Click "New Campaign"
3. Fill in campaign details
4. Select or create a template
5. Choose your audience segment
6. Schedule or send immediately

### Building an Automation Sequence

1. Navigate to `/marketing/sequences`
2. Click "New Sequence"
3. Choose a trigger (manual, form, webhook, etc.)
4. Add steps using drag-and-drop:
   - Email steps with template selection
   - SMS steps with message composer
   - Wait steps for delays
   - Condition steps for branching
5. Save and activate your sequence

### Creating a Segment

1. Navigate to `/marketing/segments`
2. Click "New Segment"
3. Add rules to define your audience:
   - Select field (email, name, tags, etc.)
   - Choose operator (equals, contains, etc.)
   - Enter value
   - Combine with AND/OR logic
4. See real-time estimate of matching contacts

### Template Variables

Available variables for personalization:

**Contact Variables**:
- `{{contact.first_name}}` - Contact's first name
- `{{contact.last_name}}` - Contact's last name
- `{{contact.full_name}}` - Contact's full name
- `{{contact.email}}` - Contact's email
- `{{contact.phone}}` - Contact's phone
- `{{contact.company.name}}` - Company name

**System Variables**:
- `{{organization.name}}` - Your organization name
- `{{today}}` - Current date
- `{{unsubscribe_url}}` - Unsubscribe link

## API Reference

### Resend Integration

```typescript
import { sendEmail, sendBulk } from '@/lib/marketing';

// Send single email
const messageId = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello {{contact.first_name}}</h1>',
});

// Send bulk emails
const results = await sendBulk([
  { to: 'user1@example.com', subject: '...', html: '...' },
  { to: 'user2@example.com', subject: '...', html: '...' },
]);
```

### Twilio Integration

```typescript
import { sendSMS, sendBulkSMS } from '@/lib/marketing';

// Send single SMS
const sid = await sendSMS({
  to: '+1234567890',
  body: 'Your message here',
});

// Send bulk SMS
const results = await sendBulkSMS([
  { to: '+1234567890', body: 'Message 1' },
  { to: '+0987654321', body: 'Message 2' },
]);
```

### Template Rendering

```typescript
import { renderTemplate, prepareContactData } from '@/lib/marketing';

// Prepare contact data
const data = prepareContactData(contact);

// Render template
const html = renderTemplate(template, data);
```

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/marketing` | MarketingLayout | Marketing module layout |
| `/marketing/dashboard` | MarketingDashboard | Analytics overview |
| `/marketing/email` | EmailCampaignsList | Email campaigns list |
| `/marketing/email/new` | EmailCampaignBuilder | Create email campaign |
| `/marketing/email/:id` | EmailCampaignDetail | Campaign analytics |
| `/marketing/sms` | SMSCampaignsList | SMS campaigns list |
| `/marketing/sms/new` | SMSBuilder | Create SMS campaign |
| `/marketing/sequences` | SequenceBuilder | Automation sequences |
| `/marketing/segments` | SegmentBuilder | Audience segments |
| `/marketing/templates` | TemplatesList | Template gallery |
| `/marketing/templates/new` | TemplateEditor | Create template |
| `/marketing/analytics` | MarketingDashboard | Detailed analytics |

## Integration Points

### CRM Integration
- Contact data for targeting campaigns
- Activities created for campaign interactions
- Company data for B2B segmentation

### Workflow Integration
- Trigger sequences from workflows
- Send emails/SMS as workflow actions
- Update contact fields based on engagement

### Forms Integration
- Add contacts to sequences on form submission
- Send confirmation emails automatically
- Trigger sequences based on form data

### AI Integration
- Generate email content with AI
- Suggest subject lines
- Optimize send times
- Analyze campaign performance

## Performance Optimization

- **Lazy Loading**: All routes use React.lazy for code splitting
- **Query Caching**: TanStack Query with intelligent caching
- **Pagination**: Large datasets use server-side pagination
- **Debouncing**: Search inputs debounced to reduce API calls

## Security

- **RLS Policies**: All database queries protected by Row Level Security
- **Role Guards**: Admin-only features protected by RoleGuard
- **Input Sanitization**: All user inputs sanitized
- **API Key Protection**: External API keys stored server-side

## Future Enhancements

- [ ] A/B testing with winner selection
- [ ] Drip campaign scheduling
- [ ] Advanced reporting with export
- [ ] Email template library
- [ ] SMS shortlink tracking
- [ ] Automated follow-up sequences
- [ ] Lead scoring integration
- [ ] Campaign cloning

## Troubleshooting

### Emails not sending
- Check Resend API key is valid
- Verify sender email is configured in Resend
- Check domain DNS settings (SPF/DKIM)

### SMS delivery failures
- Verify Twilio credentials
- Check phone number format (E.164)
- Ensure sufficient Twilio balance

### Template variables not working
- Check variable syntax: `{{variable.name}}`
- Verify contact has required fields
- Use `previewTemplate()` to test rendering

## Support

For issues or questions:
- Check documentation: `/marketing` → Help link
- View logs in `/marketing/analytics`
- Contact support at support@flowstack.app
