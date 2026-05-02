/**
 * PasswordField Component
 * Password input
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface PasswordFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PasswordField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: PasswordFieldProps) {
  return (
    <InputUntitled
      id={field.id}
      type="password"
      label={field.label}
      placeholder="••••••••"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
