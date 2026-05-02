import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { Block } from '../types';

interface FaqBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const FaqBlock: React.FC<FaqBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const items = block.props.items || [];

  const toggleItem = (idx: number) => {
    if (block.props.allowMultipleOpen) {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        return next;
      });
    } else {
      setOpenItems(new Set(openItems.has(idx) ? [] : [idx]));
    }
  };

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">FAQ</span>
        </div>
      )}
      <div className="space-y-2">
        {items.map((item: any, idx: number) => (
          <div key={idx} className="border rounded-lg">
            <button onClick={() => toggleItem(idx)} className="w-full flex items-center justify-between p-4 text-left font-medium">
              <span className="flex items-center gap-2">
                <HelpCircle size={18} />
                {item.question}
              </span>
              <ChevronDown size={18} className={cn('transition-transform', openItems.has(idx) && 'rotate-180')} />
            </button>
            {openItems.has(idx) && (
              <div className="px-4 pb-4 text-gray-600">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
