/**
 * RatingField Component
 * Star rating input
 */

import { RatingUntitled } from '@/components/ui/rating-untitled';
import type { FormField } from '../lib/schema';

interface RatingFieldProps {
  field: FormField;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export function RatingField({
  field,
  value = 0,
  onChange,
  error,
  disabled,
}: RatingFieldProps) {
  return (
    <RatingUntitled
      value={value}
      onChange={onChange}
      disabled={disabled}
      label={field.label}
      error={error}
      helperText={field.helpText}
      count={5}
      readonly={false}
    />
  );
}
