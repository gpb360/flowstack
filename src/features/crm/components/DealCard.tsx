import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  value: number;
  contactName?: string;
}

interface DealCardProps {
  deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group"
    >
      <div className="flex justify-between items-start mb-2">
         <h4 className="font-medium text-gray-900 line-clamp-2">{deal.title}</h4>
         <GripVertical size={16} className="text-gray-300 opacity-0 group-hover:opacity-100" />
      </div>
      
      <div className="flex justify-between items-center text-sm">
         <span className="text-gray-500">{deal.contactName || 'No Contact'}</span>
         <span className="font-semibold text-green-600">${deal.value.toLocaleString()}</span>
      </div>
    </div>
  );
};
