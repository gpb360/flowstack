# FlowStack Workflows Visual Editor Documentation

## Overview

The FlowStack Workflows Visual Editor is a powerful node-based automation builder that allows users to create complex business automation workflows without code. Built with React 19, XyFlow, and Supabase, it provides a visual interface for designing, testing, and deploying automated workflows.

## Architecture

### Directory Structure

```
src/features/workflows/
├── canvas/
│   ├── WorkflowCanvas.tsx       # Main canvas with XyFlow
│   ├── nodes/
│   │   ├── TriggerNode.tsx      # Trigger/start nodes
│   │   ├── ActionNode.tsx       # Action nodes
│   │   ├── ConditionNode.tsx    # Conditional branching
│   │   ├── DelayNode.tsx        # Wait/timer nodes
│   │   ├── ParallelNode.tsx     # Parallel execution
│   │   ├── EndNode.tsx          # End/termination nodes
│   │   ├── AgentNode.tsx        # AI agent nodes
│   │   └── index.ts
│   └── index.ts
├── components/
│   └── NodePalette.tsx          # Draggable node palette
├── properties/
│   ├── NodePropertiesPanel.tsx  # Main properties panel
│   ├── TriggerNodeProperties.tsx
│   ├── ActionNodeProperties.tsx
│   ├── ConditionNodeProperties.tsx
│   ├── DelayNodeProperties.tsx
│   └── index.ts
├── list/
│   ├── WorkflowsList.tsx        # Workflow list view
│   ├── WorkflowTemplates.tsx    # Template gallery
│   └── index.ts
├── logs/
│   ├── ExecutionLogs.tsx        # Execution history viewer
│   └── index.ts
├── WorkflowLayout.tsx           # Main layout with sidebar
├── WorkflowBuilderPage.tsx      # Canvas page with DB integration
├── WorkflowBuilder.tsx          # Legacy builder (backward compat)
├── WorkflowListPage.tsx         # Legacy list page (backward compat)
├── useWorkflowStore.ts          # Zustand store
├── types.ts                     # Feature-specific types
└── index.ts                     # Public exports
```

## Core Components

### 1. WorkflowCanvas (`canvas/WorkflowCanvas.tsx`)

The main visual editor component powered by XyFlow.

**Features:**
- Drag-and-drop node creation
- Visual node connections
- Zoom and pan controls
- Mini-map for navigation
- Background grid
- Custom node types
- Selection and editing

**Props:**
```typescript
interface WorkflowCanvasProps {
  workflowId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onSave?: (nodes: Node[], edges: Edge[]) => void;
  onPublish?: (nodes: Node[], edges: Edge[]) => void;
}
```

**Usage:**
```tsx
<WorkflowCanvas
  workflowId="workflow-123"
  initialNodes={nodes}
  initialEdges={edges}
  onSave={handleSave}
  onPublish={handlePublish}
/>
```

### 2. Node Types

#### TriggerNode (`canvas/nodes/TriggerNode.tsx`)
Represents workflow trigger events.

**Trigger Types:**
- `webhook:incoming` - HTTP webhook triggers
- `schedule:cron` - Scheduled/cron triggers
- `manual` - Manual triggers from UI
- `form:submission` - Form submission events
- `crm:contact_created` - CRM contact creation
- `crm:contact_updated` - CRM contact updates
- `crm:deal_stage_changed` - Deal stage changes
- `marketing:email_opened` - Email opened events
- `marketing:email_clicked` - Email link clicks
- `builder:page_published` - Page published events

**Features:**
- Green color scheme
- Source handle only (output)
- Configurable parameters
- Enable/disable toggle

#### ActionNode (`canvas/nodes/ActionNode.tsx`)
Represents workflow actions.

**Action Categories:**
- CRM (create/update contacts, notes, assignments)
- Communication (send email, SMS)
- Marketing (sequences, tags, campaigns)
- Builder (publish pages, update sites)
- Logic (delay, condition, parallel, merge, loop)
- Data (transform, filter, map, aggregate)
- HTTP (make requests)
- AI Agents (orchestrate, route, analyze)

**Features:**
- Blue color scheme
- Input and output handles
- Configurable parameters
- Retry configuration
- Timeout settings

#### ConditionNode (`canvas/nodes/ConditionNode.tsx`)
Conditional branching logic.

**Features:**
- Yellow color scheme
- Multiple condition support
- AND/OR operators
- Two output handles (true/false)
- Comparison operators (eq, ne, gt, lt, contains, etc.)

**Condition Structure:**
```typescript
{
  operator: 'and' | 'or',
  conditions: [
    {
      field: 'contact.email',
      operator: 'contains',
      value: '@example.com'
    }
  ]
}
```

#### DelayNode (`canvas/nodes/DelayNode.tsx`)
Wait/timer actions.

**Features:**
- Purple color scheme
- Configurable duration
- Multiple time units (ms, seconds, minutes, hours, days)
- Large duration display

**Configuration:**
```typescript
{
  duration: 1000,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days'
}
```

#### ParallelNode (`canvas/nodes/ParallelNode.tsx`)
Parallel execution of multiple branches.

**Features:**
- Indigo color scheme
- Configurable branch count (2-4)
- Multiple output handles (one per branch)
- Branch labels

#### EndNode (`canvas/nodes/EndNode.tsx`)
Workflow termination.

**Features:**
- Gray color scheme
- Input handle only
- Optional output data
- Completion status

#### AgentNode (`canvas/nodes/AgentNode.tsx`)
AI agent actions.

**Agent Types:**
- Orchestrator - Task orchestration and routing
- CRM - Contact finding, creation, updates, enrichment
- Marketing - Campaign generation, segmentation
- Analytics - Report generation, trend detection
- Builder - Layout suggestions, copy generation
- Workflow - Workflow optimization, suggestions

**Features:**
- Rose color scheme
- Status indicators (idle, running, completed, failed)
- Agent type badges
- Configuration summary

### 3. NodePalette (`components/NodePalette.tsx`)

Draggable palette of all available nodes.

**Features:**
- Categorized triggers
- Categorized actions
- AI agent actions
- Drag-and-drop to canvas
- Visual icons and colors
- Searchable (future)

### 4. NodePropertiesPanel (`properties/NodePropertiesPanel.tsx`)

Panel for editing node configurations.

**Features:**
- Common properties (label, description)
- Type-specific properties
- Tabbed interface
- Live validation
- Parameter inputs

**Tabs:**
- Settings - Basic configuration
- Parameters - Action-specific parameters
- Retry - Retry configuration

### 5. WorkflowStore (`useWorkflowStore.ts`)

Zustand store for workflow state management.

**State:**
```typescript
interface WorkflowState {
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string;
  workflowStatus: 'active' | 'paused' | 'draft';

  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;

  isDirty: boolean;
  isValid: boolean;
  validationErrors: string[];
}
```

**Actions:**
- `setWorkflowId` - Set current workflow ID
- `setWorkflowName` - Update workflow name
- `addNode` - Add a new node
- `updateNode` - Update node data
- `deleteNode` - Remove a node
- `addEdge` - Add a connection
- `validateWorkflow` - Validate workflow structure
- `exportWorkflow` - Export workflow for saving

**Usage:**
```tsx
const { nodes, addNode, validateWorkflow } = useWorkflowStore();

addNode({
  type: 'action',
  position: { x: 100, y: 100 },
  data: { label: 'Send Email', actionType: 'communication:send_email' }
});

const isValid = validateWorkflow();
```

### 6. WorkflowsList (`list/WorkflowsList.tsx`)

Grid view of all workflows.

**Features:**
- Search and filter
- Status badges
- Quick actions (edit, duplicate, delete, activate/pause)
- Card-based layout
- Statistics (node count, last updated)

### 7. WorkflowTemplates (`list/WorkflowTemplates.tsx`)

Pre-built workflow templates.

**Available Templates:**
- Lead Nurturing Sequence
- Welcome Email Series
- Deal Stage Automation
- Form Follow-up
- Re-engagement Campaign
- SMS Sequence

**Features:**
- Categorized by type
- Visual previews
- One-click instantiation
- Customizable after creation

### 8. ExecutionLogs (`logs/ExecutionLogs.tsx`)

Execution history and logs viewer.

**Features:**
- Timeline view of executions
- Status indicators (completed, failed, running, cancelled)
- Duration tracking
- Error details
- Step-by-step execution logs
- Success rate statistics

**Data Structure:**
```typescript
interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  trigger_data: Record<string, any>;
  execution_log: ExecutionLogEntry[];
  error?: ExecutionError;
}
```

### 9. WorkflowLayout (`WorkflowLayout.tsx`)

Main layout with sidebar navigation.

**Navigation:**
- All Workflows
- Templates
- Execution Logs

**Features:**
- Responsive sidebar
- Active route highlighting
- Feature guard protection
- Clean, modern design

## Database Integration

### Tables

**workflows**
```sql
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- name (text)
- description (text)
- status (text: 'active' | 'paused' | 'draft')
- trigger_definitions (jsonb)
- nodes (jsonb) - XyFlow nodes
- edges (jsonb) - XyFlow edges
- created_at (timestamp)
- updated_at (timestamp)
```

**workflow_executions**
```sql
- id (uuid, primary key)
- workflow_id (uuid, foreign key)
- organization_id (uuid, foreign key)
- status (text)
- started_at (timestamp)
- completed_at (timestamp)
- trigger_data (jsonb)
- execution_log (jsonb)
- error (jsonb)
```

**workflow_queue** (for scheduled/delayed execution)
```sql
- id (uuid, primary key)
- workflow_id (uuid, foreign key)
- scheduled_at (timestamp)
- status (text)
- attempt_count (integer)
- error (jsonb)
```

## Execution Engine Integration

The visual editor integrates with the execution engine located in `src/lib/workflows/`:

**executor.ts** - Main workflow execution engine
**actions.ts** - 30+ pre-built actions
**triggers.ts** - 10+ trigger types
**queue.ts** - Queue management system

### Saving and Publishing

**Save (Draft):**
```typescript
const handleSave = async (nodes: Node[], edges: Edge[]) => {
  await supabase.from('workflows').update({
    nodes,
    edges,
    status: 'draft'
  }).eq('id', workflowId);
};
```

**Publish (Active):**
```typescript
const handlePublish = async (nodes: Node[], edges: Edge[]) => {
  await supabase.from('workflows').update({
    nodes,
    edges,
    status: 'active'
  }).eq('id', workflowId);
};
```

## Validation

The workflow editor includes built-in validation:

**Validation Rules:**
1. Must have at least one trigger node
2. All nodes must be connected
3. No orphaned nodes
4. Valid node configurations
5. Proper edge connections

**Usage:**
```tsx
const { validateWorkflow, validationErrors } = useWorkflowStore();

const isValid = validateWorkflow();

if (!isValid) {
  validationErrors.forEach(error => console.error(error));
}
```

## Extending the Editor

### Adding a New Node Type

1. **Create the node component:**

```tsx
// canvas/nodes/MyCustomNode.tsx
import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

export const MyCustomNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={selected ? 'border-blue-500' : 'border-gray-300'}>
      <Handle type="target" position={Position.Top} />
      {/* Node content */}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});
```

2. **Register the node type:**

```tsx
// WorkflowCanvas.tsx
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  myCustomNode: MyCustomNode, // Add here
};
```

3. **Add to palette:**

```tsx
// NodePalette.tsx
const CUSTOM_NODES = [
  { type: 'custom:action', label: 'Custom Action', icon: Star }
];
```

### Adding Action Parameters

Edit `properties/ActionNodeProperties.tsx`:

```tsx
{actionType === 'my:custom' && (
  <>
    <div>
      <Label>Parameter 1</Label>
      <Input
        value={config.param1 || ''}
        onChange={(e) => onUpdate({
          config: { ...config, param1: e.target.value }
        })}
      />
    </div>
  </>
)}
```

## Best Practices

1. **Node Design**
   - Keep nodes simple and focused
   - Use consistent color schemes by category
   - Include clear icons and labels
   - Show configuration summaries

2. **User Experience**
   - Provide immediate visual feedback
   - Use intuitive drag-and-drop
   - Show validation errors inline
   - Enable keyboard shortcuts

3. **Performance**
   - Use React.memo for node components
   - Lazy load workflow data
   - Debounce save operations
   - Virtualize large node lists

4. **Data Management**
   - Validate before saving
   - Handle conflicts gracefully
   - Maintain dirty state tracking
   - Provide undo/redo (future)

## Troubleshooting

**Issue: Nodes not connecting**
- Check handle positions (target/source)
- Verify node IDs are unique
- Ensure proper edge validation

**Issue: Workflow not executing**
- Verify workflow status is 'active'
- Check trigger configuration
- Review execution logs for errors
- Validate node connections

**Issue: Properties panel not updating**
- Check node selection state
- Verify update callback is wired correctly
- Ensure data immutability

## Future Enhancements

- [ ] Undo/redo functionality
- [ ] Copy/paste nodes
- [ ] Keyboard shortcuts
- [ ] Node search and filter
- [ ] Workflow templates marketplace
- [ ] Real-time collaboration
- [ ] Workflow versioning
- [ ] Advanced debugging tools
- [ ] Performance profiling
- [ ] Workflow analytics dashboard

## Related Documentation

- [Execution Engine](../lib/workflows/README.md)
- [Database Schema](../../db/workflow_schema.sql)
- [API Reference](../lib/workflows/types.ts)
- [Queue Management](../../db/workflow_queue_schema.sql)

## Support

For issues or questions:
1. Check the execution logs
2. Review validation errors
3. Consult the trigger/action documentation
4. Check database RLS policies
5. Review Edge Function logs

---

**Last Updated:** 2026-01-26
**Version:** 1.0.0
