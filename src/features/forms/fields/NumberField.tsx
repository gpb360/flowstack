/**
 * NumberField Component
 * Number input with min/max validation
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface NumberFieldProps {
  field: FormField;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export function NumberField({
  field,
  value = 0,
  onChange,
  error,
  disabled,
}: NumberFieldProps) {
  const minValue = field.validation?.find((v) => v.type === 'min_value')?.value as number;
  const maxValue = field.validation?.find((v) => v.type === 'max_value')?.value as number;

  return (
    <InputUntitled
      id={field.id}
      type="number"
      label={field.label}
      placeholder={field.placeholder}
      value={value}
      min={minValue}
      max={maxValue}
      onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
