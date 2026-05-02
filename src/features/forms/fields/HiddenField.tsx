/**
 * HiddenField Component
 * Hidden field (usually for UTM parameters, etc.)
 */

import type { FormField } from '../lib/schema';

interface HiddenFieldProps {
  field: FormField;
  value?: string;
}

export function HiddenField({ field, value }: HiddenFieldProps) {
  return (
    <input
      type="hidden"
      name={field.id}
      value={value || ''}
    />
  );
}
