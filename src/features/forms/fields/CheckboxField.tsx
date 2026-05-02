/**
 * CheckboxField Component
 * Single checkbox (usually for terms/consent)
 */

import { CheckboxUntitled } from '@/components/ui/checkbox-untitled';
import type { FormField } from '../lib/schema';

interface CheckboxFieldProps {
  field: FormField;
  value?: boolean;
  onChange?: (value: boolean) => void;
  error?: string;
  disabled?: boolean;
}

export function CheckboxField({
  field,
  value = false,
  onChange,
  error,
  disabled,
}: CheckboxFieldProps) {
  return (
    <CheckboxUntitled
      id={field.id}
      checked={value}
      onCheckedChange={(checked) => onChange?.(checked === true)}
      disabled={disabled}
      label={field.label}
      error={error}
      helperText={field.helpText}
      required={field.required}
    />
  );
}
