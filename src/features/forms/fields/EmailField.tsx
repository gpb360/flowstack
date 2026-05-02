/**
 * EmailField Component
 * Email input with validation
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface EmailFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function EmailField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: EmailFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="email"
      label={field.label}
      placeholder="user@example.com"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
