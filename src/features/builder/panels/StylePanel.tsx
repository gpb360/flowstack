import React, { useState } from 'react';
import { useBuilderStore } from '../stores/useBuilderStore';
import { cn } from '../../../lib/utils';
import { TabsUntitled } from '@/components/ui/tabs-untitled';
import { useViewMode } from '../hooks/useViewMode';

// ============================================================================
// STYLE PANEL - Right sidebar for styling blocks
// ============================================================================

export const StylePanel: React.FC = () => {
  const { blocks, selectedBlockId, updateBlock, viewMode, setViewMode } = useBuilderStore();
  const { isDesktop, isTablet, isMobile } = useViewMode();
  const [activeStyleTab, setActiveStyleTab] = useState('layout');

  // Find selected block
  const findBlock = (blocks: any[], id: string): any => {
    for (const block of blocks) {
      if (block.id === id) return block;
      if (block.children) {
        const found = findBlock(block.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = selectedBlockId ? findBlock(blocks, selectedBlockId) : null;

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400">
        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p className="text-sm font-medium">Select a block to edit its styles</p>
      </div>
    );
  }

  const currentStyles = selectedBlock.styles[viewMode] || selectedBlock.styles.desktop || {};

  const handleStyleChange = (property: string, value: string | number) => {
    updateBlock(selectedBlock.id, {
      styles: {
        ...selectedBlock.styles,
        [viewMode]: {
          ...currentStyles,
          [property]: value,
        },
      },
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Styles</h3>
        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded uppercase font-medium">
          {selectedBlock.type}
        </span>
      </div>

      {/* Responsive mode toggle */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              isDesktop && 'bg-white shadow text-gray-900',
              !isDesktop && 'text-gray-600 hover:text-gray-900'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Desktop
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              isTablet && 'bg-white shadow text-gray-900',
              !isTablet && 'text-gray-600 hover:text-gray-900'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Tablet
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              isMobile && 'bg-white shadow text-gray-900',
              !isMobile && 'text-gray-600 hover:text-gray-900'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Mobile
          </button>
        </div>
      </div>

      {/* Style controls */}
      <TabsUntitled
        tabs={[
          { id: 'layout', label: 'Layout' },
          { id: 'typography', label: 'Typography' },
          { id: 'background', label: 'Background' },
          { id: 'border', label: 'Border' },
        ]}
        activeTab={activeStyleTab}
        onTabChange={setActiveStyleTab}
        variant="underline"
        size="md"
        className="w-full px-4"
      />

      <div className="p-4 space-y-6">
        {activeStyleTab === 'layout' && (
          <div className="space-y-4">
            <StyleRow label="Width">
              <StyleInput value={currentStyles.width} onChange={(v) => handleStyleChange('width', v)} placeholder="auto" />
            </StyleRow>
            <StyleRow label="Height">
              <StyleInput value={currentStyles.height} onChange={(v) => handleStyleChange('height', v)} placeholder="auto" />
            </StyleRow>
            <StyleRow label="Padding">
              <StyleInput value={currentStyles.padding} onChange={(v) => handleStyleChange('padding', v)} placeholder="16px" />
            </StyleRow>
            <StyleRow label="Margin">
              <StyleInput value={currentStyles.margin} onChange={(v) => handleStyleChange('margin', v)} placeholder="16px" />
            </StyleRow>
            <StyleRow label="Display">
              <StyleSelect
                value={currentStyles.display}
                onChange={(v) => handleStyleChange('display', v)}
                options={['block', 'inline-block', 'flex', 'grid', 'none']}
              />
            </StyleRow>
          </div>
        )}

        {activeStyleTab === 'typography' && (
          <div className="space-y-4">
            <StyleRow label="Font Family">
              <StyleInput value={currentStyles.fontFamily} onChange={(v) => handleStyleChange('fontFamily', v)} placeholder="Inter" />
            </StyleRow>
            <StyleRow label="Font Size">
              <StyleInput value={currentStyles.fontSize} onChange={(v) => handleStyleChange('fontSize', v)} placeholder="16px" />
            </StyleRow>
            <StyleRow label="Font Weight">
              <StyleSelect
                value={currentStyles.fontWeight}
                onChange={(v) => handleStyleChange('fontWeight', v)}
                options={['300', '400', '500', '600', '700', '800']}
              />
            </StyleRow>
            <StyleRow label="Line Height">
              <StyleInput value={currentStyles.lineHeight} onChange={(v) => handleStyleChange('lineHeight', v)} placeholder="1.5" />
            </StyleRow>
            <StyleRow label="Text Align">
              <StyleSelect
                value={currentStyles.textAlign}
                onChange={(v) => handleStyleChange('textAlign', v)}
                options={['left', 'center', 'right', 'justify']}
              />
            </StyleRow>
            <StyleRow label="Color">
              <ColorPicker value={currentStyles.color} onChange={(v) => handleStyleChange('color', v)} />
            </StyleRow>
          </div>
        )}

        {activeStyleTab === 'background' && (
          <div className="space-y-4">
            <StyleRow label="Background">
              <ColorPicker value={currentStyles.backgroundColor} onChange={(v) => handleStyleChange('backgroundColor', v)} />
            </StyleRow>
            <StyleRow label="Background Image">
              <StyleInput value={currentStyles.backgroundImage} onChange={(v) => handleStyleChange('backgroundImage', v)} placeholder="url(...)" />
            </StyleRow>
            <StyleRow label="Background Size">
              <StyleSelect
                value={currentStyles.backgroundSize}
                onChange={(v) => handleStyleChange('backgroundSize', v)}
                options={['cover', 'contain', 'auto']}
              />
            </StyleRow>
          </div>
        )}

        {activeStyleTab === 'border' && (
          <div className="space-y-4">
            <StyleRow label="Border">
              <StyleInput value={currentStyles.border} onChange={(v) => handleStyleChange('border', v)} placeholder="1px solid #ccc" />
            </StyleRow>
            <StyleRow label="Border Radius">
              <StyleInput value={currentStyles.borderRadius} onChange={(v) => handleStyleChange('borderRadius', v)} placeholder="8px" />
            </StyleRow>
            <StyleRow label="Shadow">
              <StyleInput value={currentStyles.boxShadow} onChange={(v) => handleStyleChange('boxShadow', v)} placeholder="0 2px 4px rgba(0,0,0,0.1)" />
            </StyleRow>
            <StyleRow label="Opacity">
              <StyleInput value={currentStyles.opacity} onChange={(v) => handleStyleChange('opacity', v)} placeholder="1" type="number" step="0.1" min="0" max="1" />
            </StyleRow>
          </div>
        )}
      </div>

      {/* Advanced toggle */}
      <div className="px-4 py-3 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Show Advanced Options
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface StyleRowProps {
  label: string;
  children: React.ReactNode;
}

const StyleRow: React.FC<StyleRowProps> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

interface StyleInputProps {
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
}

const StyleInput: React.FC<StyleInputProps> = ({ value, onChange, placeholder, type = 'text', step, min, max }) => (
  <input
    type={type}
    step={step}
    min={min}
    max={max}
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
    placeholder={placeholder}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  />
);

interface StyleSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: string[];
}

const StyleSelect: React.FC<StyleSelectProps> = ({ value, onChange, options }) => (
  <select
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
  >
    <option value="">Select...</option>
    {options.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

interface ColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
      value={value || '#000000'}
      onChange={(e) => onChange(e.target.value)}
    />
    <input
      type="text"
      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
      placeholder="#000000"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
