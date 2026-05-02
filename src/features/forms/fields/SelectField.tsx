/**
 * SelectField Component
 * Dropdown select
 */

import { SelectUntitled, SelectItem } from '@/components/ui/select-untitled';
import type { FormField } from '../lib/schema';

interface SelectFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function SelectField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <SelectUntitled
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      label={field.label}
      error={error}
      helperText={field.helpText}
      placeholder={field.placeholder || 'Select an option'}
      style={field.styles}
    >
      {field.options?.map((option) => (
        <SelectItem key={option.id} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectUntitled>
  );
}
