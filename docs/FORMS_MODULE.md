# Forms Module Documentation

## Overview

The Forms module provides a powerful form builder with conditional logic, calculations, validation, and CRM integration. It allows users to create multi-step forms with 21 different field types.

## Features

### Field Types (21 Total)

#### Basic Fields (6)
- **Text** - Single line text input
- **Textarea** - Multi-line text input
- **Number** - Number input with min/max validation
- **Email** - Email input with format validation
- **Phone** - Phone input with auto-formatting
- **URL** - URL input with validation

#### Selection Fields (4)
- **Select** - Dropdown select
- **MultiSelect** - Multi-value select with checkboxes
- **Checkbox** - Single checkbox (for terms/consent)
- **RadioGroup** - Radio button group

#### Advanced Fields (5)
- **Date** - Date picker
- **Time** - Time picker
- **DateTime** - Date and time picker
- **FileUpload** - File upload with drag and drop
- **Rating** - Star rating input (1-5 stars)

#### Layout Fields (3)
- **Heading** - Section heading
- **Description** - Explanatory text
- **Divider** - Visual separator

#### Special Fields (3)
- **Hidden** - Hidden field (for UTM parameters)
- **Password** - Password input
- **Confirmation** - Email/phone confirmation field

## Core Functionality

### 1. Form Schema Management

Located in `src/features/forms/lib/schema.ts`:

```typescript
interface FormSchema {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'archived';
  settings: FormSettings;
  pages: FormPage[];
  fields: FormField[];
  createContact?: boolean;
  createCompany?: boolean;
  addTags?: string[];
  sendEmailNotification?: boolean;
  notificationEmails?: string[];
  thankYouMessage?: string;
  redirectUrl?: string;
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  required: boolean;
  validation?: ValidationRule[];
  conditional?: ConditionalLogic;
  calculation?: CalculationRule;
  crmMapping?: CRMMapping;
  styles?: FieldStyles;
  options?: FieldOption[];
  orderIndex: number;
  columnWidth?: number;
  pageId?: string;
}
```

### 2. Validation System

Located in `src/features/forms/lib/validation.ts`:

Built-in validators:
- `required` - Field must have a value
- `email` - Valid email format
- `phone` - Valid phone format
- `url` - Valid URL format
- `min_length` - Minimum string length
- `max_length` - Maximum string length
- `min_value` - Minimum numeric value
- `max_value` - Maximum numeric value
- `pattern` - Regex pattern matching
- `custom` - Custom validation function

Usage:
```typescript
import { validateField, validateForm } from '@/features/forms/lib';

// Validate single field
const result = validateField(field, value);

// Validate entire form
const result = validateForm(fields, formData);
```

### 3. Conditional Logic

Located in `src/features/forms/lib/conditions.ts`:

Supported operators:
- `equals`, `not_equals`
- `contains`, `not_contains`
- `gt`, `lt`, `gte`, `lte`
- `empty`, `not_empty`
- `starts_with`, `ends_with`

Supported actions:
- `show` / `hide` - Control field visibility
- `require` / `optional` - Change required status
- `set_value` - Auto-fill field value
- `enable` / `disable` - Enable/disable field

Usage:
```typescript
import { evaluateCondition, applyConditionalLogic } from '@/features/forms/lib';

// Evaluate single condition
const isMet = evaluateCondition(rule, formData);

// Apply all conditional logic
const formState = applyConditionalLogic(conditionalLogics, formData, fieldIds);
```

### 4. Calculation System

Located in `src/features/forms/lib/calculations.ts`:

Supported calculations:
- `sum` - Add all field values
- `difference` - Subtract field values
- `product` - Multiply field values
- `quotient` - Divide field values
- `count` - Count non-empty fields
- `average` - Calculate average
- `min` / `max` - Find min/max value
- `custom` - Custom formula

Usage:
```typescript
import { calculate, evaluateCustomFormula } from '@/features/forms/lib';

// Built-in calculation
const result = calculate(rule, formData);

// Custom formula
const result = evaluateCustomFormula('{field1} + {field2} * 0.5', formData, ['field1', 'field2']);
```

### 5. CRM Integration

Located in `src/features/forms/lib/integrations.ts`:

Supported CRM fields:
- Contact: `first_name`, `last_name`, `email`, `phone`, `company`, `position`, `website`, `address`, `city`, `state`, `zip`, `country`, `tags`
- Company: `name`, `website`, `industry`, `size`, `address`, `city`, `state`, `zip`, `country`

Built-in transforms:
- `formatPhone` - Format phone number
- `titleCase` - Convert to title case
- `uppercase` / `lowercase` - Change case
- `trim` - Trim whitespace
- `extractDomain` - Extract domain from URL
- `toNumber` - Convert to number
- `splitName` - Split name into first/last

Usage:
```typescript
import { createContactFromSubmission, createDealFromSubmission } from '@/features/forms/lib/integrations';

// Create contact
const { contactId } = await createContactFromSubmission(organizationId, submissionData, mappings);

// Create deal
const { dealId } = await createDealFromSubmission(organizationId, contactId, companyId, config);
```

## Hooks

### useFormSchema

Manages form schema state and operations:

```typescript
const formSchema = useFormSchema();

// Update metadata
formSchema.updateMetadata({ name: 'New Name' });

// Add field
const field = formSchema.addField('text', { label: 'Name' });

// Update field
formSchema.updateField(fieldId, { required: true });

// Delete field
formSchema.deleteField(fieldId);

// Reorder fields
formSchema.reorderFields([id1, id2, id3]);

// Validate schema
const { valid, errors } = formSchema.validateSchema();
```

### useFormBuilder

Manages builder UI state:

```typescript
const builder = useFormBuilder({ onSave });

// Select field
builder.selectField(fieldId);

// Toggle preview
builder.togglePreview();

// Set device mode
builder.setDeviceMode('mobile');

// Get builder width
const width = builder.getBuilderWidth();
```

### useFormSubmissions

Manages form submissions:

```typescript
const { submissions, updateStatus, deleteSubmission, exportSubmissions } = useFormSubmissions(organizationId);

// Update status
updateStatus(submissionId, 'contacted');

// Delete submission
deleteSubmission(submissionId);

// Export to CSV
exportSubmissions(formId);
```

## Routes

- `/forms` - Forms list
- `/forms/new` - Create new form
- `/forms/:formId` - Edit form
- `/forms/:formId/submissions` - View submissions
- `/forms/:formId/analytics` - Form analytics
- `/forms/:formId/embed` - Embed code generator

## File Structure

```
src/features/forms/
├── lib/
│   ├── schema.ts           # Type definitions
│   ├── validation.ts       # Validation system
│   ├── conditions.ts       # Conditional logic
│   ├── calculations.ts     # Calculation system
│   ├── integrations.ts     # CRM integration
│   └── index.ts
├── hooks/
│   ├── useFormSchema.ts    # Schema management
│   ├── useFormBuilder.ts   # Builder state
│   ├── useFormSubmissions.ts
│   └── index.ts
├── fields/
│   ├── TextField.tsx
│   ├── TextareaField.tsx
│   ├── NumberField.tsx
│   ├── EmailField.tsx
│   ├── PhoneField.tsx
│   ├── UrlField.tsx
│   ├── SelectField.tsx
│   ├── MultiSelectField.tsx
│   ├── CheckboxField.tsx
│   ├── RadioGroupField.tsx
│   ├── DateField.tsx
│   ├── TimeField.tsx
│   ├── DateTimeField.tsx
│   ├── FileUploadField.tsx
│   ├── RatingField.tsx
│   ├── HeadingField.tsx
│   ├── DescriptionField.tsx
│   ├── DividerField.tsx
│   ├── HiddenField.tsx
│   ├── PasswordField.tsx
│   ├── ConfirmationField.tsx
│   └── index.ts
├── builder/
│   └── FormBuilder.tsx     # Main builder UI
├── submissions/
│   ├── SubmissionsList.tsx
│   ├── SubmissionDetail.tsx
│   └── SubmissionAnalytics.tsx
├── embed/
│   ├── EmbedCode.tsx
│   └── FormStyle.tsx
├── FormLayout.tsx
├── FormsList.tsx
└── index.ts
```

## Database Schema

Tables:
- `forms` - Form definitions
- `form_fields` - Field definitions
- `form_submissions` - Submitted data
- `form_notifications` - Notification config

See `db/forms_schema.sql` for full schema.

## Integration Points

### CRM Module
- Create contacts from form submissions
- Create companies from form data
- Create deals automatically
- Add tags to contacts

### Workflow Engine
- Trigger workflows on form submission
- Pass form data to workflow
- Create conditional workflow triggers

### Site Builder
- Embed forms on pages
- Capture UTM parameters
- Style forms to match site theme

### AI Integration
- Generate field suggestions
- Optimize form layout
- Suggest conditional logic

## Best Practices

1. **Field Organization**: Use layout fields (heading, description, divider) to group related fields
2. **Progressive Profiling**: Use multi-step forms for complex data collection
3. **Conditional Logic**: Use show/hide to reduce form complexity
4. **Validation**: Use appropriate validation for each field type
5. **CRM Mapping**: Map form fields to CRM fields for automatic contact creation
6. **Thank You Pages**: Always provide clear next steps after submission

## Example: Creating a Contact Form

```typescript
const formSchema = useFormSchema();

// Add fields
formSchema.addField('text', { label: 'First Name', required: true, crmMapping: { crmField: 'first_name' } });
formSchema.addField('text', { label: 'Last Name', required: true, crmMapping: { crmField: 'last_name' } });
formSchema.addField('email', { label: 'Email', required: true, crmMapping: { crmField: 'email' } });
formSchema.addField('phone', { label: 'Phone', crmMapping: { crmField: 'phone' } });
formSchema.addField('textarea', { label: 'Message' });

// Configure CRM integration
formSchema.updateMetadata({
  createContact: true,
  addTags: ['website-contact', 'lead-form'],
});

// Set thank you message
formSchema.updateMetadata({
  thankYouMessage: 'Thanks for reaching out! We\'ll get back to you within 24 hours.',
});
```

## Future Enhancements

- [ ] Form templates library
- [ ] A/B testing for forms
- [ ] Advanced conditional logic UI builder
- [ ] Custom calculation formula builder
- [ ] Form versioning
- [ ] Form analytics dashboard
- [ ] Partial submission saving
- [ ] Multi-language forms
- [ ] Form import/export
- [ ] Signature field
