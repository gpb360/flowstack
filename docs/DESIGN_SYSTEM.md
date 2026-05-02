# FlowStack Design System

Comprehensive design system documentation for FlowStack's UI component library.

## Table of Contents

- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing System](#spacing-system)
- [Border Radius](#border-radius)
- [Component Catalog](#component-catalog)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Animation Standards](#animation-standards)

---

## Color Palette

### Semantic Colors

FlowStack uses semantic color tokens that automatically adapt to light and dark themes:

#### Primary Colors
- **Primary** - Main brand color (purple: hsl(262.1 83.3% 57.8%))
- **Primary Foreground** - Text on primary (hsl(210 20% 98%))

#### Functional Colors
- **Secondary** - Secondary actions (hsl(220 14.3% 95.9%))
- **Accent** - Highlight states (hsl(220 14.3% 95.9%))
- **Muted** - Disabled/subtle content (hsl(220 14.3% 95.9%))
- **Destructive** - Error/danger states (hsl(0 84.2% 60.2%))

#### Neutral Colors
- **Background** - Page background (hsl(0 0% 100%))
- **Foreground** - Primary text (hsl(224 71.4% 4.1%))
- **Border** - Borders and dividers (hsl(220 13% 91%))
- **Input** - Form inputs (hsl(220 13% 91%))
- **Ring** - Focus rings (hsl(262.1 83.3% 57.8%))

#### Component-Specific Colors
- **Card** - Card backgrounds (hsl(0 0% 100%))
- **Card Foreground** - Card text (hsl(224 71.4% 4.1%))
- **Popover** - Popover/dropdown backgrounds (hsl(0 0% 100%))
- **Popover Foreground** - Popover text (hsl(224 71.4% 4.1%))

#### Chart Colors
- **Chart 1** - hsl(12 76% 61%)
- **Chart 2** - hsl(173 58% 39%)
- **Chart 3** - hsl(197 37% 24%)
- **Chart 4** - hsl(43 74% 66%)
- **Chart 5** - hsl(27 87% 67%)

### Dark Mode

All colors automatically adapt in dark mode. The system supports:
- System preference detection (`prefers-color-scheme`)
- Manual toggle via ThemeProvider
- Persistent user preference in localStorage

### Usage Guidelines

```tsx
// Using color tokens in components
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    Primary Action
  </button>
  <button className="bg-destructive text-destructive-foreground">
    Delete
  </button>
</div>
```

---

## Typography

### Font Families
- **Sans**: System font stack (default)
- **Mono**: Monospace for code

### Type Scale

| Size | Class | Usage |
|------|-------|-------|
| xs | `text-xs` | 12px - Captions, labels |
| sm | `text-sm` | 14px - Body text, secondary |
| base | `text-base` | 16px - Default body |
| lg | `text-lg` | 18px - Emphasized body |
| xl | `text-xl` | 20px - Subheadings |
| 2xl | `text-2xl` | 24px - Section headings |
| 3xl | `text-3xl` | 30px - Page headings |
| 4xl | `text-4xl` | 36px - Display headings |

### Font Weights
- **Normal**: `font-normal` (400)
- **Medium**: `font-medium` (500)
- **Semibold**: `font-semibold` (600)
- **Bold**: `font-bold` (700)

### Usage Examples

```tsx
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<p className="text-base">Body text</p>
<small className="text-sm text-muted-foreground">Secondary text</small>
```

---

## Spacing System

### Scale

Tailwind's spacing scale is used throughout:

| Token | Value | Usage |
|-------|-------|-------|
| 0 | 0px | None |
| 1 | 4px | Tight spacing |
| 2 | 8px | Compact spacing |
| 3 | 12px | Default spacing |
| 4 | 16px | Comfortable spacing |
| 5 | 20px | Generous spacing |
| 6 | 24px | Section spacing |
| 8 | 32px | Large spacing |
| 10 | 40px | Extra large spacing |
| 12 | 48px | Component spacing |

### Common Patterns

```tsx
// Padding
<div className="p-4">Default padding</div>
<div className="px-6 py-4">Horizontal/vertical padding</div>

// Margin
<div className="m-4">Default margin</div>
<div className="mt-8 mb-4">Vertical margin</div>

// Gap
<div className="gap-4">Flex/grid gap</div>
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0.25rem (4px) | Small elements, tags |
| default | 0.5rem (8px) | Buttons, inputs, cards |
| md | 0.75rem (12px) | Large buttons |
| lg | 1rem (16px) | Cards, modals |

```tsx
<div className="rounded-md">Medium radius</div>
<div className="rounded-lg">Large radius</div>
```

---

## Component Catalog

### Buttons

**File**: `E:\FlowStack\src\components\ui\button.tsx`

**Variants**:
- `default` - Primary action
- `destructive` - Dangerous actions
- `outline` - Secondary actions
- `secondary` - Alternative secondary
- `ghost` - Minimal style
- `link` - Text-only link

**Sizes**: `sm`, `default`, `lg`, `icon`

```tsx
<Button variant="default">Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Cards

**File**: `E:\FlowStack\src\components\ui\card.tsx`

**Components**:
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title
- `CardDescription` - Subtitle
- `CardContent` - Main content
- `CardFooter` - Footer section

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Inputs

**File**: `E:\FlowStack\src\components\ui\input.tsx`

```tsx
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" disabled />
```

### Badge

**File**: `E:\FlowStack\src\components\ui\badge.tsx`

**Variants**: `default`, `secondary`, `destructive`, `outline`

```tsx
<Badge>Default</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

### Data Table

**File**: `E:\FlowStack\src\components\ui\data-table.tsx`

Features:
- Sortable columns
- Filterable
- Row selection
- Pagination
- Row actions

```tsx
<DataTable
  data={data}
  columns={columns}
  sortable
  filterable
  selectable
  onRowClick={(row) => console.log(row)}
/>
```

### Data Card

**File**: `E:\FlowStack\src\components\ui\data-card.tsx`

Metric display with optional trends.

```tsx
<DataCard
  title="Total Users"
  value="1,234"
  icon={Users}
  trend={{ value: 12, label: "from last month" }}
/>
```

### Empty State

**File**: `E:\FlowStack\src\components\ui\empty-state.tsx`

```tsx
<EmptyState
  icon={Inbox}
  title="No data found"
  description="Get started by creating your first item."
  action={{ label: "Create Item", onClick: handleCreate }}
/>
```

### Alert

**File**: `E:\FlowStack\src\components\ui\alert.tsx`

**Variants**: `default`, `destructive`, `success`, `warning`, `info`

```tsx
<Alert variant="warning" title="Warning">
  <p>This action cannot be undone.</p>
</Alert>
```

### Toast

**File**: `E:\FlowStack\src\components\ui\toast.tsx`

Auto-dismissing notifications with duration control.

```tsx
<Toast
  title="Success"
  description="Your changes have been saved."
  variant="success"
  duration={5000}
/>
```

### Progress Stepper

**File**: `E:\FlowStack\src\components\ui\progress-stepper.tsx`

Multi-step progress indicators.

```tsx
<ProgressStepper
  steps={steps}
  currentStep={1}
  onStepClick={(index) => setCurrentStep(index)}
  variant="alternative"
/>
```

### Loading Spinner

**File**: `E:\FlowStack\src\components\ui\loading-spinner.tsx`

Loading states with skeletons.

```tsx
<LoadingSpinner label="Loading..." />
<Skeleton className="h-12 w-12 rounded-full" />
<SkeletonCard showAvatar lines={3} />
```

### Breadcrumb

**File**: `E:\FlowStack\src\components\ui\breadcrumb.tsx`

```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Sidebar

**File**: `E:\FlowStack\src\components\ui\sidebar.tsx`

Collapsible navigation sidebar.

```tsx
<Sidebar collapsible defaultCollapsed={false}>
  <SidebarHeader>
    <SidebarTitle>Menu</SidebarTitle>
    <SidebarToggle />
  </SidebarHeader>
  <SidebarContent>
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton icon={<Home />}>Home</SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarContent>
</Sidebar>
```

### Tabs

**File**: `E:\FlowStack\src\components\ui\tabs.tsx` (Radix)

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### Tab Bar

**File**: `E:\FlowStack\src\components\ui\tab-bar.tsx`

Lightweight tab navigation.

```tsx
<TabBar
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="pills"
/>
```

### Kanban Board

**File**: `E:\FlowStack\src\components\ui\kanban-board.tsx`

Drag-and-drop kanban board using @dnd-kit.

```tsx
<KanbanBoard
  columns={columns}
  onMove={(itemId, sourceId, targetId) => handleMove(itemId, sourceId, targetId)}
  onReorder={(columnId, items) => handleReorder(columnId, items)}
/>
```

### Timeline

**File**: `E:\FlowStack\src\components\ui\timeline.tsx`

Vertical timeline with variants.

```tsx
<Timeline
  items={timelineItems}
  variant="alternate"
  align="center"
/>
```

### Split Pane

**File**: `E:\FlowStack\src\components\ui\split-pane.tsx`

Resizable split views.

```tsx
<SplitPane
  first={<div>First Pane</div>}
  second={<div>Second Pane</div>}
  direction="horizontal"
  defaultSize={50}
  minSize={20}
  maxSize={80}
/>
```

### Theme Toggle

**File**: `E:\FlowStack\src\components\ui\theme-toggle.tsx`

Dark/light/system theme switcher.

```tsx
<ThemeProvider defaultTheme="system">
  <App />
  <ThemeToggle />
</ThemeProvider>
```

### Layout Components

**Page Header** (`E:\FlowStack\src\components\ui\page-header.tsx`)
```tsx
<PageHeader
  title="Page Title"
  description="Page description"
  actions={<Button>Action</Button>}
  breadcrumbs={<Breadcrumb />}
/>
```

**Section** (`E:\FlowStack\src\components\ui\section.tsx`)
```tsx
<Section title="Section Title" description="Description" variant="card">
  Content
</Section>
```

**Container** (`E:\FlowStack\src\components\ui\container.tsx`)
```tsx
<Container size="7xl" padding="default">
  Centered content
</Container>
```

**Grid** (`E:\FlowStack\src\components\ui\grid.tsx`)
```tsx
<Grid cols={3} gap="lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

---

## Accessibility Guidelines

### WCAG 2.1 Compliance

All components aim for AA compliance:
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators, logical tab order

### Keyboard Shortcuts

Standard patterns:
- `Tab` / `Shift+Tab` - Navigate forward/backward
- `Enter` / `Space` - Activate buttons/links
- `Escape` - Close modals/dropdowns
- `Arrow Keys` - Navigate within components

### ARIA Attributes

Components use semantic ARIA attributes:
- `role` - Component type
- `aria-label` - Accessible name
- `aria-describedby` - Additional description
- `aria-current` - Current state
- `aria-selected` - Selection state
- `aria-expanded` - Expand/collapse state

### Focus Management

- **Focus Trap**: Modals keep focus within (use `useFocusTrap`)
- **Focus Restoration**: Returns focus after closing (use `useFocusRestore`)
- **Skip Links**: Allow skipping navigation

### Accessibility Utilities

**File**: `E:\FlowStack\src\lib\utils/a11y.ts`

```tsx
import {
  useFocusTrap,
  useFocusRestore,
  announceToScreenReader,
  focusUtils,
  VisuallyHidden
} from "@/lib/utils/a11y"

// Focus trap for modals
const containerRef = useFocusTrap(isOpen)

// Screen reader announcements
announceToScreenReader("Item saved successfully", "polite")

// Visually hidden content
<VisuallyHidden>Skip to main content</VisuallyHidden>
```

### Testing

Test components with:
- Keyboard only navigation
- Screen reader (NVDA, JAWS, VoiceOver)
- High contrast mode
- Zoom (200%)

---

## Animation Standards

### Transitions

Use consistent timing functions:
- **Fast**: 150ms - Micro-interactions
- **Default**: 200ms - Standard transitions
- **Slow**: 300ms - Complex animations

### Easing

```tsx
// Standard easing
transition-all duration-200 ease-in-out

// Custom easing
transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
```

### Animation Utilities

Tailwind Animate plugin provides:
- `animate-in` - Entrance animations
- `animate-out` - Exit animations
- `fade-in` / `fade-out` - Opacity
- `zoom-in` / `zoom-out` - Scale
- `slide-in-from-*` / `slide-out-to-*` - Translational

### Best Practices

1. **Respect Preferences**: Honor `prefers-reduced-motion`
2. **Purposeful**: Animations should provide feedback, not decorate
3. **Performant**: Use transform/opacity over layout properties
4. **Consistent**: Similar interactions have similar animations

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or simplify animations */
}
```

---

## Contributing

When adding new components:

1. **Accessibility First**: Ensure keyboard and screen reader support
2. **Variant System**: Use `class-variance-authority` for variants
3. **TypeScript**: Strong typing for all props
4. **Composition**: Build from smaller components
5. **Documentation**: Update this file with usage examples

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/docs/primitives
- **Lucide Icons**: https://lucide.dev/icons/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Changelog

### Version 1.0.0
- Initial design system
- 25+ UI components
- Dark mode support
- Accessibility utilities
- Animation standards
