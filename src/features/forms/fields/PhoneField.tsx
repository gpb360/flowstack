/**
 * PhoneField Component
 * Phone input with formatting
 */

import { InputUntitled } from '@/components/ui/input-untitled';
import type { FormField } from '../lib/schema';

interface PhoneFieldProps {
  field: FormField;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneField({
  field,
  value = '',
  onChange,
  error,
  disabled,
}: PhoneFieldProps) {
  // Format phone number as (123) 456-7890
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 0) return '';

    if (cleaned.length <= 3) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
    const formatted = formatPhone(cleaned);
    onChange?.(formatted);
  };

  return (
    <InputUntitled
      id={field.id}
      type="tel"
      label={field.label}
      placeholder="(123) 456-7890"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      error={error}
      helperText={field.helpText}
      style={field.styles}
    />
  );
}
