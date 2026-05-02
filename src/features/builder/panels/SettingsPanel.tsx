import React from 'react';
import { useBuilderStore } from '../stores/useBuilderStore';
import { cn } from '../../../lib/utils';
import type { Block } from '../types';

// ============================================================================
// SETTINGS PANEL - Block-specific settings
// ============================================================================

export const SettingsPanel: React.FC = () => {
  const { blocks, selectedBlockId, updateBlock } = useBuilderStore();

  // Find selected block
  const findBlock = (blocks: Block[], id: string): Block | null => {
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p className="text-sm font-medium">Select a block to edit its settings</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
    updateBlock(selectedBlock.id, {
      props: { ...selectedBlock.props, [key]: value },
    });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-bold text-gray-900">Settings</h3>
        <span className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded uppercase font-medium">
          {selectedBlock.type}
        </span>
      </div>

      {/* Settings content */}
      <div className="p-4 space-y-6">
        {/* Render block-specific settings */}
        <BlockSettings block={selectedBlock} onPropChange={handlePropChange} />

        {/* Visibility toggle */}
        <div className="pt-4 border-t border-gray-200">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Visible</span>
            <button
              onClick={() => updateBlock(selectedBlock.id, { visible: !selectedBlock.visible })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                selectedBlock.visible ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  selectedBlock.visible ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </label>
        </div>

        {/* Locked toggle */}
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Locked</span>
            <button
              onClick={() => updateBlock(selectedBlock.id, { locked: !selectedBlock.locked })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                selectedBlock.locked ? 'bg-blue-600' : 'bg-gray-200'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  selectedBlock.locked ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </label>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BLOCK SETTINGS - Dynamic form based on block type
// ============================================================================

interface BlockSettingsProps {
  block: Block;
  onPropChange: (key: string, value: any) => void;
}

const BlockSettings: React.FC<BlockSettingsProps> = ({ block, onPropChange }) => {
  switch (block.type) {
    case 'heading':
      return (
        <>
          <SettingRow label="Level">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.level || 2}
              onChange={(e) => onPropChange('level', parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((level) => (
                <option key={level} value={level}>
                  H{level}
                </option>
              ))}
            </select>
          </SettingRow>
          <SettingRow label="Content">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.content || ''}
              onChange={(e) => onPropChange('content', e.target.value)}
              rows={3}
            />
          </SettingRow>
        </>
      );

    case 'text':
      return (
        <SettingRow label="Content">
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={block.props.content || ''}
            onChange={(e) => onPropChange('content', e.target.value)}
            rows={5}
          />
        </SettingRow>
      );

    case 'image':
      return (
        <>
          <SettingRow label="Image URL">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.src || ''}
              onChange={(e) => onPropChange('src', e.target.value)}
              placeholder="https://..."
            />
          </SettingRow>
          <SettingRow label="Alt Text">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.alt || ''}
              onChange={(e) => onPropChange('alt', e.target.value)}
              placeholder="Image description"
            />
          </SettingRow>
          <SettingRow label="Link URL">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.link || ''}
              onChange={(e) => onPropChange('link', e.target.value)}
              placeholder="https://..."
            />
          </SettingRow>
        </>
      );

    case 'button':
      return (
        <>
          <SettingRow label="Button Text">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.text || ''}
              onChange={(e) => onPropChange('text', e.target.value)}
            />
          </SettingRow>
          <SettingRow label="Link URL">
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.link || ''}
              onChange={(e) => onPropChange('link', e.target.value)}
              placeholder="https://..."
            />
          </SettingRow>
          <SettingRow label="Variant">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.variant || 'primary'}
              onChange={(e) => onPropChange('variant', e.target.value)}
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </SettingRow>
        </>
      );

    case 'video':
      return (
        <>
          <SettingRow label="Video Type">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={block.props.type || 'youtube'}
              onChange={(e) => onPropChange('type', e.target.value)}
            >
              <option value="youtube">YouTube</option>
              <option value="vimeo">Vimeo</option>
              <option value="custom">Custom</option>
            </select>
          </SettingRow>
          {block.props.type !== 'custom' ? (
            <SettingRow label="Video ID">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={block.props.videoId || ''}
                onChange={(e) => onPropChange('videoId', e.target.value)}
                placeholder="YouTube or Vimeo video ID"
              />
            </SettingRow>
          ) : (
            <SettingRow label="Video URL">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={block.props.src || ''}
                onChange={(e) => onPropChange('src', e.target.value)}
                placeholder="https://..."
              />
            </SettingRow>
          )}
        </>
      );

    default:
      return (
        <div className="text-center text-gray-400 py-8">
          <p className="text-sm">No settings available for this block type.</p>
        </div>
      );
  }
};

interface SettingRowProps {
  label: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-gray-700">{label}</label>
    {children}
  </div>
);
