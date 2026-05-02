/**
 * TextareaField Component
 * Multi-line text input
 */

import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import type { FormField } from '../lib/schema';

interface TextareaFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function TextareaField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: TextareaFieldProps) {
  return (
    <TextareaUntitled
      id={field.id}
      label={field.label}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
      rows={4}
    />
  );
}
