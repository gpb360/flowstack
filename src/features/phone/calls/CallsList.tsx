// @ts-nocheck
/**
 * Calls List Component
 * Displays history of phone calls
 */

import { useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, Search, Clock, Calendar } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { useCalls } from '../hooks';
import { formatPhoneNumber } from '../lib/twilio';
import { formatDistanceToNow } from 'date-fns';

const getBadgeVariant = (status: string): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'in_progress':
    case 'ringing':
      return 'info';
    default:
      return 'neutral';
  }
};

export function CallsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');

  const { data: calls, isLoading } = useCalls(
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
    directionFilter !== 'all' ? { direction: directionFilter } : undefined,
  );

  // Filter calls by search query
  const filteredCalls = calls?.filter((call) =>
    call.from_number.includes(searchQuery) ||
    call.to_number.includes(searchQuery) ||
    call.contact?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.contact?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const columns = [
    {
      id: 'direction',
      header: 'Direction',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.direction === 'inbound' ? (
            <PhoneIncoming className="h-4 w-4 text-green-600" />
          ) : (
            <PhoneOutgoing className="h-4 w-4 text-blue-600" />
          )}
          <span className="capitalize">{row.direction}</span>
        </div>
      ),
    },
    {
      id: 'from',
      header: 'From',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{formatPhoneNumber(row.from_number)}</div>
          {row.contact && (
            <div className="text-sm text-gray-500">
              {row.contact.first_name} {row.contact.last_name}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'to',
      header: 'To',
      cell: (row: any) => formatPhoneNumber(row.to_number),
    },
    {
      id: 'duration',
      header: 'Duration',
      cell: (row: any) => {
        if (!row.duration_seconds) return '-';
        const mins = Math.floor(row.duration_seconds / 60);
        const secs = row.duration_seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: any) => (
        <BadgeUntitled variant={getBadgeVariant(row.status)} size="sm">
          {row.status.replace('_', ' ')}
        </BadgeUntitled>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row: any) => (
        <div className="text-sm">
          <div>{new Date(row.started_at).toLocaleDateString()}</div>
          <div className="text-gray-500">
            {formatDistanceToNow(new Date(row.started_at), { addSuffix: true })}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          {row.recording && (
            <ButtonUntitled variant="ghost" size="sm">
              Play
            </ButtonUntitled>
          )}
          {row.contact && (
            <ButtonUntitled variant="ghost" size="sm">
              View Contact
            </ButtonUntitled>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeaderUntitled
        title="Calls"
        description="View your call history and recordings"
        actions={
          <ButtonUntitled>
            <Phone className="mr-2 h-4 w-4" />
            New Call
          </ButtonUntitled>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <InputUntitled
          placeholder="Search by number or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="flex-1 min-w-[200px]"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="ringing">Ringing</option>
          <option value="failed">Failed</option>
          <option value="no_answer">No Answer</option>
          <option value="busy">Busy</option>
          <option value="voicemail">Voicemail</option>
        </select>

        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
        >
          <option value="all">All Directions</option>
          <option value="inbound">Inbound</option>
          <option value="outbound">Outbound</option>
        </select>
      </div>

      {/* Calls Table */}
      <DataTableUntitled
        columns={columns}
        data={filteredCalls}
        isLoading={isLoading}
        emptyMessage="No calls found"
      />
    </div>
  );
}
