import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useResponsiveMode } from './useResponsiveMode';
import type { ViewMode } from '../types';

// ============================================================================
// RESPONSIVE EDITOR - Device mode switcher with zoom controls
// ============================================================================

interface ResponsiveEditorProps {
  children: (props: { width: number; height: number; mode: ViewMode }) => React.ReactNode;
}

export const ResponsiveEditor: React.FC<ResponsiveEditorProps> = ({ children }) => {
  const {
    mode,
    orientation,
    zoom,
    width,
    height,
    setMode,
    setOrientation,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useResponsiveMode();

  const devices: Array<{ key: ViewMode; icon: React.ReactNode; label: string; width: number }> = [
    { key: 'desktop', icon: <Monitor size={18} />, label: 'Desktop', width: 1440 },
    { key: 'tablet', icon: <Tablet size={18} />, label: 'Tablet', width: 768 },
    { key: 'mobile', icon: <Smartphone size={18} />, label: 'Mobile', width: 375 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Device Mode Toolbar */}
      <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between">
        {/* Device Selector */}
        <div className="flex items-center gap-2">
          {devices.map((device) => (
            <button
              key={device.key}
              onClick={() => setMode(device.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                mode === device.key
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              title={device.label}
            >
              {device.icon}
              <span className="text-sm font-medium">{device.label}</span>
              {mode === device.key && (
                <Badge variant="secondary" className="ml-1 text-xs bg-white/20 text-white hover:bg-white/20">
                  {device.width}px
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={zoomOut}
              className="p-1.5 hover:bg-white rounded transition-colors"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="px-3 text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 hover:bg-white rounded transition-colors"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <button
            onClick={resetZoom}
            className="text-sm text-gray-600 hover:text-gray-900 px-2"
          >
            Reset
          </button>

          <div className="w-px h-6 bg-gray-200" />

          {/* Orientation Toggle */}
          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Toggle orientation"
          >
            <RotateCw size={18} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8 flex items-center justify-center">
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {children({ width, height, mode })}
        </div>
      </div>

      {/* Breakpoint Indicator */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <span>
          Canvas: <strong>{width}</strong> × <strong>{height}</strong>
        </span>
        <span>
          Breakpoint: <strong className="capitalize">{mode}</strong>
          {orientation === 'landscape' && ' (Landscape)'}
        </span>
      </div>
    </div>
  );
};
