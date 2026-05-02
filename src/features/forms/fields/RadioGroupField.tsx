/**
 * RadioGroupField Component
 * Radio button group
 */

import { RadioUntitled } from '@/components/ui/radio-untitled';
import type { FormField } from '../lib/schema';

interface RadioGroupFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RadioGroupField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: RadioGroupFieldProps) {
  const options = field.options?.map((option) => ({
    value: option.value,
    label: option.label,
    disabled,
  })) || [];

  return (
    <RadioUntitled
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      label={field.label}
      error={error}
      helperText={field.helpText}
      options={options}
      orientation="vertical"
    />
  );
}
