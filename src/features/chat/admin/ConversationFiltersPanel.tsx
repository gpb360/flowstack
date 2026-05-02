/**
 * Conversation Filters Panel
 * Filter panel for the inbox
 */

import { X } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CheckboxUntitled } from '@/components/ui/checkbox-untitled';
import type { ConversationFilters, ConversationStatus } from '../types';

interface ConversationFiltersPanelProps {
  filters: ConversationFilters;
  onChange: (filters: ConversationFilters) => void;
  onClose: () => void;
}

const STATUSES: ConversationStatus[] = ['active', 'waiting', 'closed'];

export function ConversationFiltersPanel({
  filters,
  onChange,
  onClose,
}: ConversationFiltersPanelProps) {
  const handleStatusToggle = (status: ConversationStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s) => s !== status)
      : [...currentStatuses, status];

    onChange({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleClearFilters = () => {
    onChange({});
  };

  const hasActiveFilters =
    (filters.status?.length || 0) > 0 ||
    (filters.assignedTo?.length || 0) > 0 ||
    !!filters.hasUnread ||
    !!filters.search;

  return (
    <div className="border-b bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <ButtonUntitled variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear all
            </ButtonUntitled>
          )}
          <ButtonUntitled
            onClick={onClose}
            variant="ghost"
            size="icon"
            aria-label="Close filters"
          >
            <X className="h-4 w-4" />
          </ButtonUntitled>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="space-y-2">
          {STATUSES.map((status) => (
            <div key={status} className="flex items-center gap-2">
              <CheckboxUntitled
                id={`status-${status}`}
                checked={filters.status?.includes(status) || false}
                onCheckedChange={() => handleStatusToggle(status)}
              />
              <label
                htmlFor={`status-${status}`}
                className="cursor-pointer text-sm text-gray-700 capitalize"
              >
                {status}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Unread Filter */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <CheckboxUntitled
            id="unread"
            checked={filters.hasUnread || false}
            onCheckedChange={(checked) =>
              onChange({ ...filters, hasUnread: checked ? true : undefined })
            }
          />
          <label
            htmlFor="unread"
            className="cursor-pointer text-sm text-gray-700"
          >
            Has unread messages
          </label>
        </div>
      </div>
    </div>
  );
}
