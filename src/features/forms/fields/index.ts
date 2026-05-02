/**
 * Field Components Registry
 * Export all field components and create field renderer
 */

import React from 'react';
import { TextField } from './TextField';
import { TextareaField } from './TextareaField';
import { NumberField } from './NumberField';
import { EmailField } from './EmailField';
import { PhoneField } from './PhoneField';
import { UrlField } from './UrlField';
import { SelectField } from './SelectField';
import { MultiSelectField } from './MultiSelectField';
import { CheckboxField } from './CheckboxField';
import { RadioGroupField } from './RadioGroupField';
import { DateField } from './DateField';
import { TimeField } from './TimeField';
import { DateTimeField } from './DateTimeField';
import { FileUploadField } from './FileUploadField';
import { RatingField } from './RatingField';
import { HeadingField } from './HeadingField';
import { DescriptionField } from './DescriptionField';
import { DividerField } from './DividerField';
import { HiddenField } from './HiddenField';
import { PasswordField } from './PasswordField';
import { ConfirmationField } from './ConfirmationField';

import type { FormField, FieldType } from '../lib/schema';

// Export all field components
export {
  TextField,
  TextareaField,
  NumberField,
  EmailField,
  PhoneField,
  UrlField,
  SelectField,
  MultiSelectField,
  CheckboxField,
  RadioGroupField,
  DateField,
  TimeField,
  DateTimeField,
  FileUploadField,
  RatingField,
  HeadingField,
  DescriptionField,
  DividerField,
  HiddenField,
  PasswordField,
  ConfirmationField,
};

// Field component mapping
const FIELD_COMPONENTS: Record<FieldType, React.ComponentType<any>> = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  email: EmailField,
  phone: PhoneField,
  url: UrlField,
  select: SelectField,
  multiselect: MultiSelectField,
  checkbox: CheckboxField,
  radio: RadioGroupField,
  date: DateField,
  time: TimeField,
  datetime: DateTimeField,
  file: FileUploadField,
  rating: RatingField,
  heading: HeadingField,
  description: DescriptionField,
  divider: DividerField,
  hidden: HiddenField,
  password: PasswordField,
  confirmation: ConfirmationField,
};

// Props for field renderer
export interface FieldRendererProps {
  field: FormField;
  value?: unknown;
  onChange?: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  originalValue?: string; // For confirmation field
}

// Field renderer component
export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled,
  originalValue,
}: FieldRendererProps) {
  const FieldComponent = FIELD_COMPONENTS[field.type];

  if (!FieldComponent) {
    console.warn(`Unknown field type: ${field.type}`);
    return null;
  }

  // Special handling for confirmation field
  if (field.type === 'confirmation') {
    const props = {
      field,
      value: value as string,
      originalValue,
      onChange,
      error,
      disabled,
    };
    return React.createElement(FieldComponent, props);
  }

  const props = {
    field,
    value,
    onChange,
    error,
    disabled,
  };
  return React.createElement(FieldComponent, props);
}

// Get field component by type
export function getFieldComponent(type: FieldType) {
  return FIELD_COMPONENTS[type];
}
