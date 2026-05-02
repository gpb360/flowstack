/**
 * Phone Numbers List Component
 * Manages organization phone numbers
 */

import { useState } from 'react';
import { Plus, Phone, MessageSquare, Settings } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { DataTableUntitled } from '@/components/ui/data-table-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { MetricCardUntitled } from '@/components/ui/metric-card-untitled';
import { usePhoneNumbers, useDeletePhoneNumber, useActivePhoneNumbers } from '../hooks';
import { formatPhoneNumber } from '../lib/twilio';

const getBadgeVariant = (status: string): 'success' | 'error' | 'warning' | 'neutral' | 'info' => {
  switch (status) {
    case 'active':
      return 'success';
    case 'suspended':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'neutral';
  }
};

export function NumbersList() {
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const { data: numbers, isLoading } = usePhoneNumbers();
  const { data: activeNumbers } = useActivePhoneNumbers();
  const deleteNumber = useDeletePhoneNumber();

  const columns = [
    {
      id: 'number',
      header: 'Phone Number',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{formatPhoneNumber(row.phone_number)}</div>
          {row.tracking_source && (
            <div className="text-sm text-gray-500">{row.tracking_source}</div>
          )}
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row: any) => (
        <BadgeUntitled variant="neutral" size="sm" className="capitalize">
          {row.type}
        </BadgeUntitled>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row: any) => (
        <BadgeUntitled variant={getBadgeVariant(row.status)} size="sm">
          {row.status}
        </BadgeUntitled>
      ),
    },
    {
      id: 'capabilities',
      header: 'Capabilities',
      cell: (row: any) => (
        <div className="flex gap-1">
          {row.sms_enabled && (
            <BadgeUntitled variant="neutral" size="sm">
              <MessageSquare className="h-3 w-3 mr-1" />
              SMS
            </BadgeUntitled>
          )}
          {row.recording_enabled && (
            <BadgeUntitled variant="neutral" size="sm">
              Recording
            </BadgeUntitled>
          )}
          {row.voicemail_enabled && (
            <BadgeUntitled variant="neutral" size="sm">
              Voicemail
            </BadgeUntitled>
          )}
        </div>
      ),
    },
    {
      id: 'forwarding',
      header: 'Forwards To',
      cell: (row: any) => row.forward_to ? formatPhoneNumber(row.forward_to) : '-',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <ButtonUntitled variant="ghost" size="sm" isIconOnly>
            <Settings className="h-4 w-4" />
          </ButtonUntitled>
          <ButtonUntitled
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to release this number?')) {
                deleteNumber.mutate(row.id);
              }
            }}
            disabled={deleteNumber.isPending}
          >
            Release
          </ButtonUntitled>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeaderUntitled
        title="Phone Numbers"
        description="Manage your organization's phone numbers"
        actions={
          <ButtonUntitled onClick={() => setShowPurchaseDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Purchase Number
          </ButtonUntitled>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCardUntitled
          title="Total Numbers"
          value={`${numbers?.length || 0}`}
          icon={Phone}
        />
        <MetricCardUntitled
          title="Active Numbers"
          value={`${activeNumbers?.length || 0}`}
          icon={Phone}
        />
        <MetricCardUntitled
          title="SMS Enabled"
          value={`${numbers?.filter((n) => n.sms_enabled).length || 0}`}
          icon={MessageSquare}
        />
        <MetricCardUntitled
          title="Recording Enabled"
          value={`${numbers?.filter((n) => n.recording_enabled).length || 0}`}
          icon={Settings}
        />
      </div>

      {/* Numbers Table */}
      <DataTableUntitled
        columns={columns}
        data={numbers || []}
        isLoading={isLoading}
        emptyMessage="No phone numbers found. Purchase your first number to get started."
      />

      {/* Purchase Number Dialog - would be implemented separately */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <CardUntitled className="w-full max-w-2xl">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold">Purchase Phone Number</h2>
              <p className="text-gray-600">
                Purchase a new phone number from Twilio. Search by area code or keyword.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <ButtonUntitled variant="secondary" onClick={() => setShowPurchaseDialog(false)}>
                  Cancel
                </ButtonUntitled>
                <ButtonUntitled>Search Numbers</ButtonUntitled>
              </div>
            </div>
          </CardUntitled>
        </div>
      )}
    </div>
  );
}
