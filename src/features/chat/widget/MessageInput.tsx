// @ts-nocheck
/**
 * Message Input Component
 * Text input for composing chat messages
 */

import { cn } from '@/lib/utils';
import type { MessageInputProps } from '../types';

export function MessageInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = 'Type your message...',
  features,
}: MessageInputProps) {
  const maxLength = features?.maxLength || 1000;
  const remaining = maxLength - value.length;

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => {
          const newValue = e.target.value;
          if (newValue.length <= maxLength) {
            onChange(newValue);
          }
        }}
        onKeyDown={onKeyPress}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          'w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50',
          value.length > 0 && 'min-h-[40px]'
        )}
        style={{
          maxHeight: '120px',
        }}
      />

      {remaining <= 100 && (
        <span
          className={cn(
            'absolute bottom-1 right-2 text-xs',
            remaining < 10 ? 'text-red-600' : 'text-gray-400'
          )}
        >
          {remaining}
        </span>
      )}
    </div>
  );
}
