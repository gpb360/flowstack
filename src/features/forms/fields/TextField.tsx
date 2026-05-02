/**
 * TextField Component
 * Single line text input
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface TextFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function TextField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: TextFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="text"
      label={field.label}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
