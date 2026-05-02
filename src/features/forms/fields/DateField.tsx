/**
 * DateField Component
 * Date picker
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface DateFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function DateField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: DateFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="date"
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
