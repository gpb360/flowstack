/**
 * TimeField Component
 * Time picker
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface TimeFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function TimeField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: TimeFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="time"
      label={field.label}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
