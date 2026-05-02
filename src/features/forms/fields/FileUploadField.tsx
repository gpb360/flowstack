/**
 * FileUploadField Component
 * File upload with drag and drop
 */

import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import type { FormField } from '../lib/schema';

interface FileUploadFieldProps {
  field: FormField;
  value?: File;
  onChange?: (value: File) => void;
  error?: string;
  disabled?: boolean;
}

export function FileUploadField({
  field,
  value,
  onChange,
  error,
  disabled,
}: FileUploadFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange?.(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onChange?.(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label className={error ? 'text-error' : ''}>{field.label}</Label>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          error ? 'border-error' : 'border-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer'}`}
      >
        <input
          type="file"
          id={field.id}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
        />
        <label htmlFor={field.id} className={disabled ? 'cursor-not-allowed' : 'cursor-pointer'}>
          <Upload className="mx-auto h-12 w-12 text-text-secondary mb-2" />
          {value ? (
            <p className="text-sm font-medium">{value.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-text-secondary mt-1">
                {field.placeholder || 'SVG, PNG, JPG or GIF (max. 800x400px)'}
              </p>
            </>
          )}
        </label>
      </div>
      {field.helpText && (
        <p className="text-sm text-text-secondary">{field.helpText}</p>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
