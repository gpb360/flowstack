/**
 * DateTimeField Component
 * Date and time picker
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface DateTimeFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function DateTimeField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: DateTimeFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="datetime-local"
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
