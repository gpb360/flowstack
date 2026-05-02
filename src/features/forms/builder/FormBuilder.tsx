/**
 * FormBuilder Component
 * Main form builder UI with palette, canvas, and properties panel
 */

import { useState } from 'react';
import { useFormSchema, useFormBuilder } from '../hooks';
import { FIELD_CATEGORIES, type FieldType } from '../lib';
import { FieldRenderer } from '../fields';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { Label } from '@/components/ui/label';
import { TabsUntitled } from '@/components/ui/tabs-untitled';
import { Plus, Trash2, Copy, Settings, Eye, EyeOff } from 'lucide-react';

interface FormBuilderProps {
  formId?: string;
  onSave?: (schema: any) => void;
}

export function FormBuilder({ formId, onSave }: FormBuilderProps) {
  const formSchema = useFormSchema();
  const builder = useFormBuilder({ onSave });

  const [searchTerm, setSearchTerm] = useState('');

  // Filter field types by search
  const filteredCategories = Object.entries(FIELD_CATEGORIES).filter(([_, cat]) =>
    cat.fields.some((field) =>
      field.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Field Palette */}
      <div className="w-80 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold mb-2">Field Palette</h2>
          <InputUntitled
            placeholder="Search fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="p-4 space-y-4">
          {filteredCategories.map(([categoryKey, category]) => (
            <div key={categoryKey}>
              <h3 className="text-sm font-medium text-text-secondary mb-2">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.fields
                  .filter((field) =>
                    field.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((fieldType) => (
                    <button
                      key={fieldType}
                      onClick={() => formSchema.addField(fieldType as FieldType)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                    >
                      {fieldType}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <InputUntitled
              value={formSchema.schema.name}
              onChange={(e) => formSchema.updateMetadata({ name: e.target.value })}
              className="text-2xl font-bold border-none focus-visible:ring-0 p-0"
              placeholder="Form Name"
            />
            <div className="flex gap-2">
              <ButtonUntitled
                variant="secondary"
                size="sm"
                onClick={builder.togglePreview}
              >
                {builder.isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {builder.isPreviewMode ? 'Edit' : 'Preview'}
              </ButtonUntitled>
              <ButtonUntitled
                variant="primary"
                size="sm"
                onClick={() => builder.saveForm(formSchema.schema as any)}
              >
                Save Form
              </ButtonUntitled>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            {formSchema.schema.fields.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <p className="mb-2">No fields added yet</p>
                <p className="text-sm">Click on a field type from the palette to add it</p>
              </div>
            ) : (
              formSchema.schema.fields.map((field) => (
                <div
                  key={field.id}
                  className={`group relative p-4 rounded-lg border-2 transition-colors ${
                    builder.selectedFieldId === field.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => builder.selectField(field.id)}
                >
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        formSchema.duplicateField(field.id);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        formSchema.deleteField(field.id);
                      }}
                      className="p-1 hover:bg-destructive hover:text-destructive-foreground rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <FieldRenderer field={field} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-96 border-l border-border bg-card overflow-y-auto">
        {builder.selectedFieldId ? (
          <FieldProperties
            field={formSchema.getField(builder.selectedFieldId)!}
            onUpdate={(updates) => formSchema.updateField(builder.selectedFieldId!, updates)}
            onDelete={() => {
              formSchema.deleteField(builder.selectedFieldId!);
              builder.selectField(null);
            }}
          />
        ) : (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Form Settings</h2>
            <FormSettings
              schema={formSchema.schema}
              onUpdate={formSchema.updateSettings}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Field Properties Panel
function FieldProperties({
  field,
  onUpdate,
  onDelete,
}: {
  field: any;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Field Properties</h2>
        <ButtonUntitled
          variant="ghost"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </ButtonUntitled>
      </div>

      <TabsUntitled defaultValue="basic">
        <TabsUntitled.List className="grid w-full grid-cols-4">
          <TabsUntitled.Trigger value="basic">Basic</TabsUntitled.Trigger>
          <TabsUntitled.Trigger value="validation">Validation</TabsUntitled.Trigger>
          <TabsUntitled.Trigger value="logic">Logic</TabsUntitled.Trigger>
          <TabsUntitled.Trigger value="style">Style</TabsUntitled.Trigger>
        </TabsUntitled.List>

        <TabsUntitled.Content value="basic" className="space-y-4 mt-4">
          <div>
            <Label>Label</Label>
            <InputUntitled
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </div>

          <div>
            <Label>Placeholder</Label>
            <InputUntitled
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
            />
          </div>

          <div>
            <Label>Help Text</Label>
            <InputUntitled
              value={field.helpText || ''}
              onChange={(e) => onUpdate({ helpText: e.target.value })}
              placeholder="Additional instructions for the user"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="required"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
            />
            <Label htmlFor="required">Required field</Label>
          </div>

          <div>
            <Label>Column Width (1-12)</Label>
            <InputUntitled
              type="number"
              min={1}
              max={12}
              value={field.columnWidth || 12}
              onChange={(e) => onUpdate({ columnWidth: parseInt(e.target.value) })}
            />
          </div>
        </TabsUntitled.Content>

        <TabsUntitled.Content value="validation" className="space-y-4 mt-4">
          <div className="text-sm text-text-secondary">
            Validation rules coming soon
          </div>
        </TabsUntitled.Content>

        <TabsUntitled.Content value="logic" className="space-y-4 mt-4">
          <div className="text-sm text-text-secondary">
            Conditional logic coming soon
          </div>
        </TabsUntitled.Content>

        <TabsUntitled.Content value="style" className="space-y-4 mt-4">
          <div>
            <Label>Max Width</Label>
            <InputUntitled
              value={field.styles?.maxWidth || ''}
              onChange={(e) =>
                onUpdate({
                  styles: { ...field.styles, maxWidth: e.target.value },
                })
              }
              placeholder="e.g., 100%, 500px"
            />
          </div>

          <div>
            <Label>Font Size</Label>
            <InputUntitled
              value={field.styles?.fontSize || ''}
              onChange={(e) =>
                onUpdate({
                  styles: { ...field.styles, fontSize: e.target.value },
                })
              }
              placeholder="e.g., text-sm, text-lg"
            />
          </div>
        </TabsUntitled.Content>
      </TabsUntitled>
    </div>
  );
}

// Form Settings Panel
function FormSettings({ schema, onUpdate }: { schema: any; onUpdate: any }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Description</Label>
        <InputUntitled
          value={schema.description || ''}
          onChange={(e) => onUpdate({ ...schema, description: e.target.value })}
          placeholder="Form description"
        />
      </div>

      <div>
        <Label>Submit Button Text</Label>
        <InputUntitled
          value={schema.settings.submitButton?.text || 'Submit'}
          onChange={(e) =>
            onUpdate({
              ...schema,
              settings: {
                ...schema.settings,
                submitButton: { ...schema.settings.submitButton, text: e.target.value },
              },
            })
          }
        />
      </div>

      <div>
        <Label>Thank You Message</Label>
        <textarea
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          value={schema.thankYouMessage || ''}
          onChange={(e) => onUpdate({ ...schema, thankYouMessage: e.target.value })}
          placeholder="Message shown after submission"
        />
      </div>

      <div>
        <Label>Redirect URL</Label>
        <InputUntitled
          value={schema.redirectUrl || ''}
          onChange={(e) => onUpdate({ ...schema, redirectUrl: e.target.value })}
          placeholder="https://example.com/thank-you"
        />
      </div>
    </div>
  );
}
