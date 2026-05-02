/**
 * UrlField Component
 * URL input with validation
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface UrlFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UrlField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: UrlFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="url"
      label={field.label}
      placeholder="https://example.com"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
