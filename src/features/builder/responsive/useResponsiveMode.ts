import { useState, useCallback } from 'react';
import type { ViewMode } from '../types';

// ============================================================================
// RESPONSIVE MODE HOOK - Device mode and zoom state
// ============================================================================

export interface ResponsiveModeState {
  mode: ViewMode;
  orientation: 'portrait' | 'landscape';
  zoom: number;
  width: number;
  height: number;
}

export interface ResponsiveModeActions {
  setMode: (mode: ViewMode) => void;
  setOrientation: (orientation: 'portrait' | 'landscape') => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const DEVICE_DIMENSIONS: Record<ViewMode, { portrait: number; landscape: number }> = {
  desktop: { portrait: 1440, landscape: 1920 },
  tablet: { portrait: 768, landscape: 1024 },
  mobile: { portrait: 375, landscape: 667 },
};

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150];

export function useResponsiveMode() {
  const [mode, setMode] = useState<ViewMode>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoom, setZoomState] = useState(100);

  // Calculate dimensions based on mode and orientation
  const width = DEVICE_DIMENSIONS[mode][orientation];
  const height = Math.round(width * (orientation === 'portrait' ? 1.5 : 0.75));

  // Set mode
  const handleSetMode = useCallback((newMode: ViewMode) => {
    setMode(newMode);
    // Reset zoom when changing device mode
    setZoomState(100);
  }, []);

  // Set orientation
  const handleSetOrientation = useCallback((newOrientation: 'portrait' | 'landscape') => {
    setOrientation(newOrientation);
  }, []);

  // Set zoom
  const setZoom = useCallback((newZoom: number) => {
    // Clamp zoom between 25 and 150
    const clampedZoom = Math.max(25, Math.min(150, newZoom));
    setZoomState(clampedZoom);
  }, []);

  // Zoom in
  const zoomIn = useCallback(() => {
    setZoomState((current) => {
      const currentIndex = ZOOM_LEVELS.indexOf(current);
      if (currentIndex < ZOOM_LEVELS.length - 1) {
        return ZOOM_LEVELS[currentIndex + 1];
      }
      return current;
    });
  }, []);

  // Zoom out
  const zoomOut = useCallback(() => {
    setZoomState((current) => {
      const currentIndex = ZOOM_LEVELS.indexOf(current);
      if (currentIndex > 0) {
        return ZOOM_LEVELS[currentIndex - 1];
      }
      return current;
    });
  }, []);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomState(100);
  }, []);

  return {
    mode,
    orientation,
    zoom,
    width,
    height,
    setMode: handleSetMode,
    setOrientation: handleSetOrientation,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
