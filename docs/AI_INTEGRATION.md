# AI Integration Documentation

## Overview

FlowStack features a comprehensive AI-native architecture powered by Claude API. AI capabilities are woven throughout the application, from the command bar to intelligent suggestions and multi-agent automation.

## Architecture

### Core Components

```
src/lib/ai/
├── client.ts          # Claude API wrapper with streaming & retries
├── types.ts           # TypeScript types for all AI interactions
├── config.ts          # Configuration and API key management
├── context.ts         # Context tracking and memory system
├── commands.ts        # Tool/Function registry for Claude
├── suggestions.ts     # AI-powered suggestion engine
└── index.ts           # Main exports
```

### Database Schema

- `db/agents_schema.sql` - Multi-agent execution tracking
- `db/ai_memory_schema.sql` - Conversation memory and user preferences

### Feature Module

- `src/features/ai-agents/` - AI Agents UI module

## Environment Variables

Add to your `.env` file:

```bash
# Claude API Configuration
VITE_CLAUDE_API_KEY=sk-ant-...
VITE_CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### Getting an API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new key
5. Add it to your environment variables or use the AI Settings page in the app

## Core Features

### 1. Claude API Client (`src/lib/ai/client.ts`)

**Capabilities:**
- Streaming responses for real-time feedback
- Function calling support for tool use
- Context window management
- Retry logic with exponential backoff
- Cost tracking (token usage)

**Usage:**

```typescript
import { getAIClient } from '@/lib/ai';

const client = getAIClient();

// Complete response
const response = await client.complete({
  messages: [{ role: 'user', content: 'Hello!' }],
  maxTokens: 1000,
});

// Streaming response
for await (const chunk of client.stream({
  messages: [{ role: 'user', content: 'Hello!' }],
})) {
  console.log(chunk);
}

// With tools
const responseWithTools = await client.chatWithTools({
  messages: [{ role: 'user', content: 'Create a contact' }],
  tools: getToolDefinitions(),
});
```

### 2. Context & Memory System (`src/lib/ai/context.ts`)

**Features:**
- User context tracking (current module, recent actions)
- Organization context (team members, active workflows)
- Conversation memory (chat history, preferences)
- Smart context pruning to stay within token limits

**Usage:**

```typescript
import { useAIContext, saveConversationMemory } from '@/lib/ai';

function MyComponent() {
  const { context, trackAction } = useAIContext();

  // Track user actions
  trackAction('viewed_contact', 'crm', { contactId: '123' });

  // Save conversation
  await saveConversationMemory(
    userId,
    organizationId,
    messages,
    context
  );
}
```

### 3. Command Bar (Cmd+K) (`src/components/CommandBar.tsx`)

**Features:**
- Keyboard shortcut (Cmd+K / Ctrl+K)
- Fuzzy search for commands
- AI-powered command suggestions
- Quick actions for each module

**Command Categories:**
- **Navigation**: Go to Dashboard, CRM, Workflows, etc.
- **Actions**: Create contact, send email, create workflow
- **Search**: Find contacts, companies, campaigns
- **AI**: Ask questions, generate content

**Usage:**

```tsx
import { CommandBarTrigger } from '@/components/CommandBar';

function MyLayout() {
  return (
    <header>
      <CommandBarTrigger />
    </header>
  );
}
```

### 4. Function Registry (`src/lib/ai/commands.ts`)

**Available Tools:**

**CRM:**
- `create_contact` - Create new contact
- `find_contacts` - Search contacts
- `update_contact` - Update contact info
- `create_company` - Create company

**Marketing:**
- `create_campaign` - Create marketing campaign
- `generate_content` - Generate marketing content
- `save_template` - Save email template

**Workflow:**
- `create_workflow` - Create workflow automation
- `trigger_workflow` - Trigger workflow execution
- `get_workflow_status` - Check workflow status

**Analytics:**
- `generate_report` - Generate analytics report
- `get_metrics` - Get key metrics

**General:**
- `search` - Search across all entities
- `get_current_user` - Get user info

**Adding New Tools:**

```typescript
import { Tool } from '@/lib/ai/types';

export const myCustomTool: Tool = {
  name: 'my_custom_tool',
  description: 'Does something custom',
  category: 'crm',
  input_schema: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'First param' },
    },
    required: ['param1'],
  },
  handler: async (params, context) => {
    // Your logic here
    return { success: true, data: '...' };
  },
};

// Register in TOOL_REGISTRY in commands.ts
```

### 5. AI-Powered Suggestions (`src/lib/ai/suggestions.ts`)

**Available Suggestions:**

- **CRM Suggestions**: Next best actions, contact insights
- **Workflow Suggestions**: Automation opportunities
- **Content Generation**: Email subjects, bodies, SMS, ad copy
- **Smart Suggestions**: Cross-module recommendations
- **Anomaly Detection**: Activity drops, stagnation
- **Proactive Notifications**: Tips, reminders, opportunities

**Usage:**

```typescript
import {
  getCRMSuggestions,
  getWorkflowSuggestions,
  generateMarketingContent,
  getSmartSuggestions,
} from '@/lib/ai';

// Get CRM suggestions
const suggestions = await getCRMSuggestions(context);

// Generate marketing content
const content = await generateMarketingContent(
  {
    type: 'email_subject',
    topic: 'Summer sale',
    tone: 'persuasive',
  },
  context
);

// Get smart suggestions
const smartSuggestions = await getSmartSuggestions(context);
```

## AI Agents Feature Module

### Routes

- `/ai-agents` - Overview dashboard
- `/ai-agents/chat` - AI chat interface
- `/ai-agents/analytics` - Agent execution analytics
- `/ai-agents/settings` - AI configuration

### Components

```tsx
import {
  AIAgentsLayout,
  AIAgentsOverview,
  AIChat,
  AIAnalytics,
  AISettings,
} from '@/features/ai-agents';
```

### Agent Types

1. **Orchestrator** - Coordinates multiple agents
2. **CRM Agent** - Manages contacts and companies
3. **Marketing Agent** - Campaigns and content
4. **Workflow Agent** - Automation building
5. **Analytics Agent** - Reports and insights
6. **Builder Agent** - Page design assistance

## Integration Examples

### Example 1: AI-Powered Contact Creation

```typescript
import { getAIClient } from '@/lib/ai';
import { createContactTool } from '@/lib/ai/commands';

async function createContactWithAI(userInfo: string) {
  const client = getAIClient();

  const response = await client.chatWithTools({
    messages: [{
      role: 'user',
      content: `Create a contact from this info: ${userInfo}`,
    }],
    tools: [createContactTool],
    context: {
      userId: 'user-123',
      organizationId: 'org-456',
      currentModule: 'crm',
      recentActions: [],
      relevantData: {},
      permissions: ['write'],
      timestamp: Date.now(),
    },
  });

  return response;
}
```

### Example 2: Smart Suggestions in CRM

```typescript
import { useAIContext } from '@/lib/ai';
import { getCRMSuggestions } from '@/lib/ai/suggestions';

function ContactListPage() {
  const { context } = useAIContext();
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    getCRMSuggestions(context).then(setSuggestions);
  }, [context]);

  return (
    <div>
      <h2>Contacts</h2>
      {suggestions.map(s => (
        <div key={s.title}>
          <strong>{s.title}</strong>
          <p>{s.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Content Generation for Marketing

```typescript
import { generateMarketingContent } from '@/lib/ai/suggestions';

async function generateEmail(topic: string) {
  const content = await generateMarketingContent(
    {
      type: 'email_body',
      topic,
      tone: 'persuasive',
      audience: 'existing customers',
      length: 'medium',
    },
    context
  );

  return content;
}
```

## Cost Management

### Token Pricing (as of 2024)

| Model | Input | Output | Cache Create | Cache Read |
|-------|-------|--------|--------------|------------|
| Claude 3.5 Sonnet | $3/M | $15/M | $3.75/M | $0.30/M |
| Claude 3.5 Haiku | $0.80/M | $4/M | $1/M | $0.08/M |
| Claude 3 Opus | $15/M | $75/M | - | - |

### Cost Tracking

```typescript
import { calculateCost } from '@/lib/ai/types';

const cost = calculateCost(
  'claude-3-5-sonnet-20241022',
  inputTokens,
  outputTokens,
  cacheCreationTokens,
  cacheReadTokens
);

console.log(`Request cost: $${cost.toFixed(4)}`);
```

## Best Practices

### 1. Context Management

- Always track user actions for better context
- Use `useAIContext` hook to access current context
- Prune messages to stay within token limits

### 2. Tool Design

- Keep tool descriptions clear and specific
- Include parameter descriptions
- Mark dangerous tools appropriately
- Handle errors gracefully

### 3. Cost Optimization

- Use streaming for long responses
- Enable prompt caching for repeated prompts
- Choose appropriate model for task complexity
- Monitor token usage

### 4. User Experience

- Show loading states during AI requests
- Provide feedback on tool executions
- Allow users to cancel long-running requests
- Display AI confidence levels when appropriate

### 5. Security

- Never expose API keys in client code
- Validate tool permissions before execution
- Sanitize AI-generated content
- Implement rate limiting

## Troubleshooting

### Common Issues

**1. API Key Not Found**
- Ensure `VITE_CLAUDE_API_KEY` is set in `.env`
- Or use the AI Settings page to add the key
- Key should start with `sk-ant-`

**2. Context Too Long**
- Use `pruneMessagesToTokenLimit()` to reduce message history
- Summarize older conversations
- Limit recent actions tracked

**3. Tool Execution Failed**
- Check tool permissions in context
- Verify tool handler returns expected format
- Check Supabase connection for data operations

**4. Streaming Not Working**
- Ensure using `for await` with async generator
- Check browser supports streaming
- Verify network connectivity

## Future Enhancements

- [ ] Multi-modal support (images, documents)
- [ ] Voice interaction
- [ ] Custom agent training
- [ ] Agent marketplace
- [ ] Advanced analytics dashboard
- [ ] A/B testing for AI suggestions
- [ ] Fine-tuning support

## Support

For issues or questions about the AI integration:

1. Check this documentation
2. Review Claude API docs: https://docs.anthropic.com/
3. Check database schema files
4. Examine example implementations in feature modules

## Credits

Built with:
- Claude API (Anthropic)
- Supabase (backend)
- React 19 (frontend)
- TypeScript (types)
