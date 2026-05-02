# Chat Widget Module

Complete real-time chat widget system for FlowStack with AI-powered features, visitor tracking, and comprehensive analytics.

## Overview

The Chat Widget module provides a fully-featured live chat system that can be embedded on any website. It includes real-time messaging, agent assignment, canned responses, analytics, and AI-powered features.

## Features

### Core Features
- **Real-time Messaging**: Instant messaging using Supabase Realtime
- **Visitor Tracking**: Automatic collection of visitor info, UTM parameters, and location
- **Agent Assignment**: Round-robin, least-active, or manual assignment
- **Pre-Chat Forms**: Collect visitor information before chat starts
- **File Upload**: Allow visitors to share files
- **Canned Responses**: Quick replies for common questions
- **Internal Notes**: Private notes for agents
- **Conversation Tags**: Organize and categorize conversations

### Advanced Features
- **AI-Powered Suggestions**: Smart response recommendations
- **Auto-Response**: Automatic replies when agents are unavailable
- **Business Hours**: Schedule widget availability
- **Chat Analytics**: Comprehensive performance metrics
- **Satisfaction Ratings**: Collect feedback from visitors
- **Smart Routing**: Intelligent agent assignment based on skills

## Database Schema

### Tables

#### `chat_conversations`
Stores individual chat conversations with visitor information.

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  visitor_id UUID,
  visitor_name TEXT,
  visitor_email TEXT,
  visitor_phone TEXT,
  assigned_to UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed')),
  source_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  location_country TEXT,
  location_city TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `chat_messages`
Stores all messages in conversations.

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'agent', 'bot')),
  sender_id UUID,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

#### `chat_settings`
Per-organization widget configuration.

```sql
CREATE TABLE chat_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id),
  widget_color TEXT DEFAULT '#3B82F6',
  widget_position TEXT DEFAULT 'bottom-right',
  welcome_message TEXT DEFAULT 'How can we help you?',
  offline_message TEXT DEFAULT 'We are currently offline.',
  availability_enabled BOOLEAN DEFAULT FALSE,
  auto_response_enabled BOOLEAN DEFAULT FALSE,
  file_upload_enabled BOOLEAN DEFAULT TRUE,
  rating_enabled BOOLEAN DEFAULT FALSE
);
```

#### `chat_agent_status`
Agent online status and concurrent chat limits.

```sql
CREATE TABLE chat_agent_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES user_profiles(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline', 'busy')),
  max_concurrent_chats INTEGER DEFAULT 5,
  current_chats INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Installation

### 1. Database Setup

Run the chat schema SQL:

```bash
psql -U postgres -d your_database -f db/chat_schema.sql
```

Or via Supabase SQL Editor:

```sql
-- Copy contents of db/chat_schema.sql and run in SQL Editor
```

### 2. Install Dependencies

```bash
npm install date-fns recharts
```

### 3. Configure Routes

Routes are already configured in `src/App.tsx`:

```
/chat          -> Inbox (list of conversations)
/chat/analytics -> Analytics dashboard
/chat/settings  -> Widget settings
```

## Usage

### Embedding on Your Website

#### HTML/Universal

```html
<script>
  window.FlowStackChat = {
    organizationId: 'your-org-id',
    theme: {
      color: '#3B82F6',
      position: 'bottom-right'
    },
    welcomeMessage: 'How can we help you?'
  };
</script>
<script src="https://cdn.flowstack.com/chat/widget.js" async defer></script>
```

#### React

```tsx
import { ChatWidget } from '@flowstack/chat-widget';

function App() {
  return (
    <ChatWidget
      organizationId="your-org-id"
      theme={{ color: "#3B82F6", position: "bottom-right" }}
      welcomeMessage="How can we help you?"
    />
  );
}
```

#### WordPress

1. Install the FlowStack Chat plugin
2. Activate and configure with your organization ID
3. Customize appearance in settings

#### Shopify

1. Go to Online Store > Themes
2. Edit theme.liquid
3. Add embed code before `</body>`

## Components

### ChatWidget

Main embeddable widget component.

```tsx
<ChatWidget
  organizationId="org-id"
  theme={{
    color: '#3B82F6',
    position: 'bottom-right',
    borderRadius: 8
  }}
  welcomeMessage="How can we help you?"
  agentInfo={{
    name: 'Support Team',
    avatar: '/avatar.png',
    status: 'online'
  }}
  preChatFormEnabled={false}
  onMessageSent={(message) => console.log('Sent:', message)}
  onConversationStarted={(conversationId) => console.log('Started:', conversationId)}
/>
```

### ChatInbox

Agent inbox for managing conversations.

```tsx
<ChatInbox
  organizationId="org-id"
  currentUserId="user-id"
/>
```

### ChatSettings

Widget customization interface.

```tsx
<ChatSettings organizationId="org-id" />
```

### ChatAnalytics

Performance metrics and reports.

```tsx
<ChatAnalytics organizationId="org-id" />
```

## Hooks

### useChatMessages

Real-time message subscription.

```tsx
const { messages, sendMessage, markAsRead, isSending } = useChatMessages({
  conversationId: 'conv-id',
  enabled: true
});
```

### useChatRealtime

Combined real-time functionality.

```tsx
const { messages, sendMessage, isTyping, broadcastTyping } = useChatRealtime(conversationId);
```

### useChatConversations

Conversation list with filtering.

```tsx
const { conversations, closeConversation, assignConversation } = useChatConversations(
  organizationId,
  { status: ['active'], assignedTo: ['agent-id'] },
  { field: 'last_message_at', direction: 'desc' }
);
```

### useChatSettings

Settings management.

```tsx
const { settings, updateSettings, isUpdating } = useChatSettings(organizationId);
```

### useChatAnalytics

Analytics data.

```tsx
const { analytics, metrics } = useChatAnalytics(
  organizationId,
  '2024-01-01',
  '2024-01-31'
);
```

## AI Features

### Generate Suggested Responses

```typescript
import { generateSuggestedResponse } from '@/features/chat/lib/ai';

const suggestion = await generateSuggestedResponse(
  conversationHistory,
  'Sales inquiry context'
);
```

### Classify Conversations

```typescript
import { classifyConversation } from '@/features/chat/lib/ai';

const classification = await classifyConversation(messages);
// Returns: { category, priority, tags, sentiment }
```

### Smart Agent Assignment

```typescript
import { smartAssignAgent } from '@/features/chat/lib/ai';

const agentId = smartAssignAgent(classification, availableAgents);
```

## Configuration

### Widget Appearance

Customize the widget look:

```typescript
const settings: Partial<ChatSettings> = {
  widget_color: '#3B82F6',
  widget_position: 'bottom-right',
  widget_icon: 'message-square',
  header_title: 'Chat with us',
  show_agent_avatar: true,
  show_agent_name: true,
  show_agent_status: true,
};
```

### Behavior Settings

Configure widget behavior:

```typescript
const settings: Partial<ChatSettings> = {
  welcome_message: 'How can we help you?',
  offline_message: 'We are offline. Leave a message.',
  sound_enabled: true,
  typing_indicator_enabled: true,
  emoji_picker_enabled: true,
  file_upload_enabled: true,
  rating_enabled: false,
};
```

### Business Hours

Set availability:

```typescript
const settings: Partial<ChatSettings> = {
  availability_enabled: true,
  availability_timezone: 'America/New_York',
  availability_hours: {
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    // ... other days
  },
  offline_action: 'collect_message'
};
```

## API

### Supabase Queries

All database operations are in `src/features/chat/lib/supabase.ts`:

```typescript
// Conversations
fetchConversations(orgId, filters, sort)
fetchConversation(conversationId)
createConversation(data)
updateConversation(conversationId, data)
closeConversation(conversationId)
assignConversation(conversationId, agentId)

// Messages
fetchMessages(conversationId)
sendMessage(data)
markMessagesAsRead(conversationId, senderType)

// Settings
fetchChatSettings(orgId)
upsertChatSettings(orgId, data)

// Analytics
fetchChatAnalytics(orgId, dateFrom, dateTo)
fetchChatMetrics(orgId)
```

## Real-time Subscriptions

### Message Events

```typescript
const channel = subscribeToMessages(conversationId, (message) => {
  console.log('New message:', message);
});
```

### Conversation Updates

```typescript
const channel = subscribeToConversationUpdates(orgId, (conversation) => {
  console.log('Conversation updated:', conversation);
});
```

### Typing Indicators

```typescript
// Subscribe
const channel = subscribeToTypingIndicator(conversationId, (isTyping) => {
  console.log('Agent typing:', isTyping);
});

// Broadcast
broadcastTypingIndicator(conversationId, true);
```

## File Structure

```
src/features/chat/
├── lib/
│   ├── supabase.ts          # Database queries
│   ├── widget.ts            # Embed code generator
│   └── ai.ts                # AI features
├── hooks/
│   └── useChatMessages.ts   # React hooks
├── widget/
│   ├── ChatWidget.tsx       # Main widget
│   ├── ChatLauncher.tsx     # Launcher button
│   ├── ChatWindow.tsx       # Chat window
│   ├── MessageList.tsx      # Message display
│   ├── MessageInput.tsx     # Input field
│   ├── AgentInfo.tsx        # Agent header
│   ├── PreChatForm.tsx      # Pre-chat form
│   └── typing-indicator/
│       └── TypingIndicator.tsx
├── admin/
│   ├── ChatInbox.tsx        # Agent inbox
│   ├── ConversationView.tsx # Conversation detail
│   ├── ConversationList.tsx # Conversation list
│   ├── ConversationFiltersPanel.tsx
│   ├── ConversationDetails.tsx
│   ├── ConversationNotes.tsx
│   ├── ChatAnalytics.tsx    # Analytics dashboard
│   ├── MetricCard.tsx
│   ├── ConversationsChart.tsx
│   └── AgentPerformanceTable.tsx
├── settings/
│   ├── ChatSettings.tsx     # Settings layout
│   ├── AppearanceSettings.tsx
│   ├── BehaviorSettings.tsx
│   ├── AvailabilityEditor.tsx
│   ├── CannedResponses.tsx
│   └── EmbedCodeGenerator.tsx
├── ChatLayout.tsx           # Module layout
├── types.ts                 # TypeScript types
└── index.ts                 # Exports
```

## Best Practices

### 1. Rate Limiting

Enable rate limiting to prevent spam:

```typescript
const settings = {
  rate_limit_enabled: true,
  rate_limit_max_messages: 100,
  rate_limit_window: 3600, // 1 hour
};
```

### 2. Agent Assignment

Use intelligent assignment based on conversation volume:

```typescript
const settings = {
  agent_assignment_enabled: true,
  agent_assignment_type: 'least_active', // Best for busy teams
  max_concurrent_chats: 5,
};
```

### 3. Auto-Response

Set up helpful auto-responses:

```typescript
const settings = {
  auto_response_enabled: true,
  auto_response_delay: 5, // seconds
  auto_response_message: 'Thanks for reaching out! An agent will be with you shortly.',
};
```

### 4. Canned Responses

Create categorized responses for common issues:

```typescript
await createCannedResponse({
  organization_id: 'org-id',
  name: 'Pricing',
  content: 'Our pricing starts at $X/month. Would you like me to send you our full price list?',
  category: 'Sales',
  tags: ['pricing', 'sales'],
  shortcuts: ['/price', '/pricing'],
});
```

## Troubleshooting

### Messages Not Appearing

1. Check realtime subscription is active
2. Verify RLS policies allow access
3. Check browser console for errors
4. Ensure Supabase realtime is enabled for `chat_messages`

### Widget Not Loading

1. Verify organization ID is correct
2. Check browser console for errors
3. Ensure settings exist for organization
4. Verify widget.js is accessible

### Agent Status Not Updating

1. Check `chat_agent_status` table has records
2. Verify agent_id matches user_profiles.id
3. Check RLS policies allow updates

## Integration with Other Modules

### CRM Integration

Link conversations to contacts:

```typescript
// Automatically creates/links contact
const settings = {
  link_to_crm: true,
  create_contact_if_not_exists: true,
};
```

### Workflow Triggers

Trigger workflows on chat events:

```typescript
// New conversation started
// Conversation closed
// New message received
// Rating submitted
```

### AI Agents Integration

Use AI agents for automated responses:

```typescript
import { generateAutoResponse } from '@/features/chat/lib/ai';

const response = await generateAutoResponse(visitorMessage, settings);
```

## Security

### RLS Policies

All tables have RLS policies:

- Organization members can view their data
- Admins can update settings
- Agents can update their own status
- Visitors can only insert messages to their conversation

### File Upload

File uploads use Supabase Storage with:

- Size limits (configurable, default 10MB)
- Type restrictions (images, PDFs, docs)
- Virus scanning (via Supabase)

### Rate Limiting

Built-in rate limiting to prevent:

- Spam messages
- Bot attacks
- Resource exhaustion

## Performance

### Optimization Tips

1. **Use pagination** for conversation lists
2. **Lazy load** message history
3. **Debounce** typing indicators
4. **Cache** agent statuses
5. **Use indexes** on frequently queried fields

### Scalability

- Supports 1000+ concurrent conversations
- Real-time via Supabase (WebSockets)
- Efficient database queries with proper indexes
- Horizontal scaling via organization_id partitioning

## Future Enhancements

- [ ] Video/voice chat
- [ ] Screen sharing
- [ ] Co-browsing
- [ ] Multi-language support
- [ ] Chatbot integration
- [ ] SMS fallback
- [ ] Mobile SDKs (iOS/Android)
- [ ] WhatsApp integration
- [ ] Facebook Messenger integration
- [ ] Advanced analytics with funnels

## Support

For issues or questions:

1. Check documentation in `/docs/CHAT_WIDGET.md`
2. Review database schema in `/db/chat_schema.sql`
3. Check TypeScript types in `/src/features/chat/types.ts`
4. Review component examples in source files
