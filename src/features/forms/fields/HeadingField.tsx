/**
 * HeadingField Component
 * Section heading (layout field)
 */

import type { FormField } from '../lib/schema';

interface HeadingFieldProps {
  field: FormField;
}

export function HeadingField({ field }: HeadingFieldProps) {
  const level = field.styles?.fontSize || 'text-xl';
  const align = field.styles?.textAlign || 'left';

  return (
    <div className={`py-2 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
      <h3 className={`font-bold ${level}`} style={field.styles}>
        {field.label}
      </h3>
    </div>
  );
}
