import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Monitor, Tablet, Smartphone, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { ViewMode } from '../types';

// ============================================================================
// RESPONSIVE PREVIEW - Multi-device preview
// ============================================================================

interface ResponsivePreviewProps {
  pages: Array<{ id: string; title: string; content: any[] }>;
  currentPageId?: string;
  onPageChange?: (pageId: string) => void;
  onClose?: () => void;
}

const DEVICE_CONFIG = [
  { key: 'desktop' as ViewMode, label: 'Desktop', width: 1440, height: 900, icon: <Monitor size={16} /> },
  { key: 'tablet' as ViewMode, label: 'Tablet', width: 768, height: 1024, icon: <Tablet size={16} /> },
  { key: 'mobile' as ViewMode, label: 'Mobile', width: 375, height: 667, icon: <Smartphone size={16} /> },
];

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  pages,
  currentPageId,
  onPageChange,
  onClose,
}) => {
  const [selectedDevices, setSelectedDevices] = useState<ViewMode[]>(['desktop', 'tablet', 'mobile']);
  const [syncScroll, setSyncScroll] = useState(true);

  const toggleDevice = (device: ViewMode) => {
    setSelectedDevices((prev) =>
      prev.includes(device) ? prev.filter((d) => d !== device) : [...prev, device]
    );
  };

  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Responsive Preview</h2>
          <p className="text-sm text-gray-500">
            {currentPage?.title}{' '}
            {pages.length > 1 && (
              <select
                value={currentPageId}
                onChange={(e) => onPageChange?.(e.target.value)}
                className="ml-2 border rounded px-2 py-1"
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Device Toggles */}
          <div className="flex items-center gap-2">
            {DEVICE_CONFIG.map((device) => (
              <button
                key={device.key}
                onClick={() => toggleDevice(device.key)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                  selectedDevices.includes(device.key)
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {device.icon}
                <span className="text-sm">{device.label}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-200" />

          {/* Sync Scroll Toggle */}
          <button
            onClick={() => setSyncScroll(!syncScroll)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm',
              syncScroll ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            Sync Scroll
          </button>

          <Button variant="outline" size="sm" onClick={onClose}>
            <X size={18} className="mr-2" />
            Close
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-gray-900 p-8">
        <div className="flex gap-8 justify-center items-start h-full">
          {selectedDevices.map((deviceKey) => {
            const config = DEVICE_CONFIG.find((d) => d.key === deviceKey)!;
            return (
              <div
                key={deviceKey}
                className="flex flex-col items-center"
                style={{ maxWidth: config.width + 100 }}
              >
                {/* Device Frame */}
                <div className="bg-black rounded-lg p-2 mb-4">
                  <Badge className="bg-white text-black">{config.label}</Badge>
                  <span className="text-white text-sm ml-2">
                    {config.width} × {config.height}
                  </span>
                </div>

                {/* Device Preview */}
                <div
                  className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all"
                  style={{
                    width: config.width,
                    height: config.height,
                    transform: 'scale(0.75)',
                    transformOrigin: 'top center',
                  }}
                >
                  {/* Page Content Preview */}
                  <div className="h-full overflow-auto">
                    {currentPage?.content && currentPage.content.length > 0 ? (
                      <div className="p-4">
                        <p className="text-sm text-gray-500 text-center py-8">
                          Page preview would render here
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">No content yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
