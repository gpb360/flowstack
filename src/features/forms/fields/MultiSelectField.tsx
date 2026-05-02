/**
 * MultiSelectField Component
 * Multi-value select with checkboxes
 */

import { Label } from '@/components/ui/label';
import { CheckboxBase } from '@/components/ui/checkbox-untitled';
import type { FormField } from '../lib/schema';

interface MultiSelectFieldProps {
  field: FormField;
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function MultiSelectField({
  field,
  value = [],
  onChange,
  error,
  disabled,
}: MultiSelectFieldProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange?.([...value, optionValue]);
    } else {
      onChange?.(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-2">
      <Label className={error ? 'text-error' : ''}>{field.label}</Label>
      <div className="space-y-2">
        {field.options?.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <CheckboxBase
              id={`${field.id}-${option.id}`}
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => handleChange(option.value, checked === true)}
              disabled={disabled}
              error={error}
            />
            <label
              htmlFor={`${field.id}-${option.id}`}
              className={`text-sm cursor-pointer ${error ? 'text-error' : ''}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {field.helpText && (
        <p className="text-sm text-text-secondary">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
