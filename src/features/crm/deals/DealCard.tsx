import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, DollarSign, User, Building2 } from 'lucide-react';
import type { Database } from '@/types/database.types';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { mapDealStatusToVariant } from '../lib/badge-variants';

type Deal = Database['public']['Tables']['deals']['Row'] & {
  contacts?: Database['public']['Tables']['contacts']['Row'] | null;
  companies?: Database['public']['Tables']['companies']['Row'] | null;
};

interface DealCardProps {
  deal: Deal;
  stageId: string;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, stageId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id, data: { type: 'deal', stageId } });

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
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
    >
      <div className="flex items-start justify-between mb-2">
        <Link
          to={`/crm/deals/${deal.id}`}
          className="flex-1 font-medium text-gray-900 line-clamp-2 hover:text-primary"
        >
          {deal.title}
        </Link>
        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical size={16} className="text-gray-300" />
        </div>
      </div>

      {/* Contact/Company */}
      {(deal.contacts || deal.companies) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          {deal.contacts && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span className="truncate">
                {deal.contacts.first_name} {deal.contacts.last_name}
              </span>
            </div>
          )}
          {deal.companies && (
            <div className="flex items-center gap-1">
              <Building2 size={14} />
              <span className="truncate">{deal.companies.name}</span>
            </div>
          )}
        </div>
      )}

      {/* Value and Status */}
      <div className="flex items-center justify-between">
        {deal.value && (
          <div className="flex items-center gap-1 text-green-600 font-semibold text-sm">
            <DollarSign size={14} />
            <span>{deal.value.toLocaleString()}</span>
          </div>
        )}

        {deal.status !== 'open' && (
          <BadgeUntitled variant={mapDealStatusToVariant(deal.status)}>
            {deal.status}
          </BadgeUntitled>
        )}
      </div>

      {/* Expected Close Date */}
      {deal.expected_close_date && (
        <div className="mt-2 text-xs text-gray-500">
          Expected: {new Date(deal.expected_close_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
