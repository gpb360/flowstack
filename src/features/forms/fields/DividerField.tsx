/**
 * DividerField Component
 * Visual separator (layout field)
 */

import type { FormField } from '../lib/schema';

interface DividerFieldProps {
  field: FormField;
}

export function DividerField({ field }: DividerFieldProps) {
  return (
    <div className="py-4">
      <hr className="border-border" style={field.styles} />
    </div>
  );
}
