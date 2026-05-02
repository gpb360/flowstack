/**
 * useFormBuilder Hook
 * Manages form builder state including selected field, preview mode, etc.
 */

import { useState, useCallback } from 'react';
import type { FormField, FormPage } from '../lib';

interface UseFormBuilderOptions {
  onSave?: (schema: FormPage) => void;
}

export function useFormBuilder(options: UseFormBuilderOptions = {}) {
  // UI State
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [builderMode, setBuilderMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Drag and drop state
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);

  // Panel state
  const [activePanel, setActivePanel] = useState<'fields' | 'properties' | 'settings'>('fields');

  // Select a field
  const selectField = useCallback((fieldId: string | null) => {
    setSelectedFieldId(fieldId);
    if (fieldId) {
      setActivePanel('properties');
    }
  }, []);

  // Select a page
  const selectPage = useCallback((pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedFieldId(null);
  }, []);

  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
    setSelectedFieldId(null);
  }, []);

  // Set builder device mode
  const setDeviceMode = useCallback((mode: 'desktop' | 'tablet' | 'mobile') => {
    setBuilderMode(mode);
  }, []);

  // Start dragging
  const startDrag = useCallback((fieldId: string) => {
    setDraggedFieldId(fieldId);
  }, []);

  // Drag over
  const dragOver = useCallback((fieldId: string) => {
    setDragOverFieldId(fieldId);
  }, []);

  // End drag
  const endDrag = useCallback(() => {
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  }, []);

  // Save form
  const saveForm = useCallback((schema: FormPage) => {
    options.onSave?.(schema);
  }, [options.onSave]);

  // Get builder container width based on device mode
  const getBuilderWidth = useCallback(() => {
    switch (builderMode) {
      case 'desktop':
        return '100%';
      case 'tablet':
        return '768px';
      case 'mobile':
        return '375px';
    }
  }, [builderMode]);

  // Check if field is selected
  const isFieldSelected = useCallback((fieldId: string) => {
    return selectedFieldId === fieldId;
  }, [selectedFieldId]);

  // Check if page is selected
  const isPageSelected = useCallback((pageId: string) => {
    return selectedPageId === pageId;
  }, [selectedPageId]);

  return {
    // State
    selectedFieldId,
    selectedPageId,
    isPreviewMode,
    builderMode,
    draggedFieldId,
    dragOverFieldId,
    activePanel,

    // Actions
    selectField,
    selectPage,
    togglePreview,
    setDeviceMode,
    setActivePanel,
    startDrag,
    dragOver,
    endDrag,
    saveForm,

    // Helpers
    getBuilderWidth,
    isFieldSelected,
    isPageSelected,
  };
}
