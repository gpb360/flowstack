import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../../lib/utils';
import { Check } from 'lucide-react';
import type { Block } from '../types';

interface PricingBlockProps {
  block: Block;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({
  block,
  isSelected = false,
  isHovered = false,
  onClick,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockStyles = block.styles.desktop || {};
  const plans = block.props.plans || [];

  return (
    <div ref={setNodeRef} style={{ ...style, ...blockStyles } as React.CSSProperties} {...attributes} {...listeners} onClick={onClick}
      className={cn('relative group transition-all grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', isSelected && 'ring-2 ring-blue-500 ring-offset-2 z-10', isHovered && !isSelected && 'ring-2 ring-blue-300 ring-offset-2', !block.visible && 'hidden')}>
      {(isSelected || isHovered) && !block.locked && (
        <div className="absolute -top-6 left-0 pointer-events-none">
          <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs font-medium">Pricing</span>
        </div>
      )}
      {plans.map((plan: any, idx: number) => (
        <div key={idx} className={cn('p-6 border rounded-lg', plan.highlighted && 'border-blue-500 shadow-lg')}>
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="text-3xl font-bold mb-2">{plan.price}<span className="text-base font-normal">{plan.period || ''}</span></div>
          <ul className="space-y-2 mb-6">
            {plan.features.map((feature: string, fidx: number) => (
              <li key={fidx} className="flex items-center gap-2">
                <Check size={16} className="text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a href={plan.buttonLink || '#'} className={cn('block text-center py-2 rounded-lg font-medium', plan.highlighted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900')}>
            {plan.buttonText || 'Get Started'}
          </a>
        </div>
      ))}
    </div>
  );
};
