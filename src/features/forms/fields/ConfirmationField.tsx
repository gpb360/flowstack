/**
 * ConfirmationField Component
 * Email or phone confirmation field
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface ConfirmationFieldProps {
  field: FormField;
  value?: string;
  originalValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function ConfirmationField({
  field,
  value = '',
  originalValue = '',
  onChange,
  error,
  disabled,
}: ConfirmationFieldProps) {
  // Determine if this is email or phone confirmation
  const isEmail = field.label.toLowerCase().includes('email');
  const placeholder = isEmail ? 'Confirm email address' : 'Confirm phone number';

  const hasMismatch = value && value !== originalValue;
  const finalError = error || (hasMismatch ? 'Values do not match' : undefined);

  return (
    <InputUntitled
      id={field.id}
      type={isEmail ? 'email' : 'tel'}
      label={field.label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      error={finalError}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
