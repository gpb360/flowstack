/**
 * useFormSchema Hook
 * Manages form schema state and operations
 */

import { useState, useCallback } from 'react';
import type {
  FormSchema,
  FormField,
  FormPage,
  FieldType,
} from '../lib/schema';
import {
  createFieldId,
  createPageId,
  isLayoutField,
  getFieldTypeLabel,
} from '../lib/schema';

interface UseFormSchemaOptions {
  initialSchema?: FormSchema;
}

export function useFormSchema(options: UseFormSchemaOptions = {}) {
  const [schema, setSchema] = useState<FormSchema>(
    options.initialSchema || {
      id: '',
      name: 'Untitled Form',
      description: '',
      status: 'draft',
      settings: {},
      pages: [
        {
          id: createPageId(),
          name: 'Page 1',
          orderIndex: 0,
        },
      ],
      fields: [],
    }
  );

  // Update form metadata
  const updateMetadata = useCallback((updates: Partial<FormSchema>) => {
    setSchema((prev) => ({ ...prev, ...updates }));
  }, []);

  // Add a new field
  const addField = useCallback((
    type: FieldType,
    options?: Partial<FormField>
  ) => {
    const newField: FormField = {
      id: createFieldId(),
      type,
      label: getFieldTypeLabel(type),
      required: false,
      orderIndex: schema.fields.length,
      columnWidth: 12,
      pageId: schema.pages[0]?.id,
      ...options,
    };

    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));

    return newField;
  }, [schema.fields.length, schema.pages]);

  // Update a field
  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  }, []);

  // Delete a field
  const deleteField = useCallback((fieldId: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  }, []);

  // Duplicate a field
  const duplicateField = useCallback((fieldId: string) => {
    const field = schema.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newField: FormField = {
      ...field,
      id: createFieldId(),
      label: `${field.label} (Copy)`,
      orderIndex: schema.fields.length,
    };

    setSchema((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));

    return newField;
  }, [schema.fields]);

  // Reorder fields
  const reorderFields = useCallback((fieldIds: string[]) => {
    setSchema((prev) => {
      const fieldMap = new Map(prev.fields.map((f) => [f.id, f]));
      const reorderedFields = fieldIds
        .map((id) => fieldMap.get(id))
        .filter((f) => f !== undefined) as FormField[];

      return {
        ...prev,
        fields: reorderedFields.map((field, index) => ({
          ...field,
          orderIndex: index,
        })),
      };
    });
  }, []);

  // Add a new page
  const addPage = useCallback((options?: Partial<FormPage>) => {
    const newPage: FormPage = {
      id: createPageId(),
      name: `Page ${schema.pages.length + 1}`,
      orderIndex: schema.pages.length,
      ...options,
    };

    setSchema((prev) => ({
      ...prev,
      pages: [...prev.pages, newPage],
    }));

    return newPage;
  }, [schema.pages.length]);

  // Update a page
  const updatePage = useCallback((pageId: string, updates: Partial<FormPage>) => {
    setSchema((prev) => ({
      ...prev,
      pages: prev.pages.map((page) =>
        page.id === pageId ? { ...page, ...updates } : page
      ),
    }));
  }, []);

  // Delete a page
  const deletePage = useCallback((pageId: string) => {
    // Don't allow deleting the last page
    if (schema.pages.length <= 1) return;

    setSchema((prev) => ({
      ...prev,
      pages: prev.pages.filter((page) => page.id !== pageId),
      // Remove fields from deleted page
      fields: prev.fields.filter((field) => field.pageId !== pageId),
    }));
  }, [schema.pages.length]);

  // Move field to page
  const moveFieldToPage = useCallback((fieldId: string, pageId: string) => {
    setSchema((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, pageId } : field
      ),
    }));
  }, []);

  // Update form settings
  const updateSettings = useCallback((settings: FormSchema['settings']) => {
    setSchema((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  }, []);

  // Get field by ID
  const getField = useCallback((fieldId: string) => {
    return schema.fields.find((f) => f.id === fieldId);
  }, [schema.fields]);

  // Get page by ID
  const getPage = useCallback((pageId: string) => {
    return schema.pages.find((p) => p.id === pageId);
  }, [schema.pages]);

  // Get fields for a page
  const getPageFields = useCallback((pageId: string) => {
    return schema.fields
      .filter((field) => field.pageId === pageId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [schema.fields]);

  // Get input fields (exclude layout fields)
  const getInputFields = useCallback(() => {
    return schema.fields.filter((field) => !isLayoutField(field.type));
  }, [schema.fields]);

  // Validate form schema
  const validateSchema = useCallback(() => {
    const errors: string[] = [];

    if (!schema.name || schema.name.trim() === '') {
      errors.push('Form name is required');
    }

    if (schema.pages.length === 0) {
      errors.push('Form must have at least one page');
    }

    if (schema.fields.length === 0) {
      errors.push('Form must have at least one field');
    }

    for (const field of schema.fields) {
      if (!field.label) {
        errors.push(`Field ${field.id} must have a label`);
      }

      if (field.type === 'select' || field.type === 'radio' || field.type === 'multiselect') {
        if (!field.options || field.options.length === 0) {
          errors.push(`Field ${field.id} must have at least one option`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [schema]);

  // Export schema as JSON
  const exportSchema = useCallback(() => {
    return JSON.stringify(schema, null, 2);
  }, [schema]);

  // Import schema from JSON
  const importSchema = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      setSchema(imported);
      return { success: true, error: null };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }, []);

  return {
    schema,
    updateMetadata,
    addField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
    addPage,
    updatePage,
    deletePage,
    moveFieldToPage,
    updateSettings,
    getField,
    getPage,
    getPageFields,
    getInputFields,
    validateSchema,
    exportSchema,
    importSchema,
  };
}
