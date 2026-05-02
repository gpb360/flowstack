/**
 * DescriptionField Component
 * Explanatory text (layout field)
 */

import type { FormField } from '../lib/schema';

interface DescriptionFieldProps {
  field: FormField;
}

export function DescriptionField({ field }: DescriptionFieldProps) {
  return (
    <div className="py-2">
      <p
        className="text-text-secondary"
        style={field.styles}
      >
        {field.label}
      </p>
    </div>
  );
}
