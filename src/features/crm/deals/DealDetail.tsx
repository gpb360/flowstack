import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  User,
  Building2,
  Calendar,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useDeal, useDealHistory, useDeleteDeal, useUpdateDealStatus } from '../hooks/useDeals';
import { useActivities, useLogNote } from '../hooks/useActivities';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { DataCard } from '@/components/ui/data-card';
import { Timeline } from '@/components/ui/timeline';
import { DealForm } from './DealForm';
import { mapDealStatusToVariant } from '../lib/badge-variants';
import { formatDistanceToNow } from 'date-fns';

export const DealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: deal, isLoading, error } = useDeal(id!);
  const { data: history } = useDealHistory(id!);
  const { data: activities } = useActivities({ dealId: id!, limit: 50 });
  const deleteDeal = useDeleteDeal();
  const updateStatus = useUpdateDealStatus();

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this deal?')) {
      deleteDeal.mutate(id!, {
        onSuccess: () => {
          navigate('/crm/deals');
        },
      });
    }
  };

  const handleStatusChange = (status: 'open' | 'won' | 'lost' | 'abandoned') => {
    updateStatus.mutate({
      dealId: id!,
      status,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-muted">Loading deal...</div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-danger">Deal not found</div>
      </div>
    );
  }

  const combinedTimeline = [
    // History entries (stage changes, status changes)
    ...(history || []).map((h: any) => ({
      id: h.id,
      title: h.to_stage_name
        ? `Moved to ${h.to_stage_name}`
        : `Status changed to ${h.to_status}`,
      description: h.notes,
      timestamp: new Date(h.created_at),
      type: 'deal_stage_change',
      icon: '💼',
    })),
    // Activities
    ...(activities || []).map((activity) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      timestamp: new Date(activity.created_at),
      type: activity.type,
      icon: getActivityIcon(activity.type),
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ButtonUntitled variant="tertiary" size="sm" onClick={() => navigate('/crm/deals')} isIconOnly>
              <ArrowLeft size={18} />
            </ButtonUntitled>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{deal.title}</h1>
                <BadgeUntitled variant={mapDealStatusToVariant(deal.status)}>
                  {deal.status}
                </BadgeUntitled>
              </div>
              {deal.stages && (
                <p className="text-text-secondary text-sm mt-1">{deal.stages.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deal.status === 'open' && (
              <>
                <ButtonUntitled variant="secondary" size="sm" onClick={() => handleStatusChange('won')} leftIcon={<TrendingUp size={16} />}>
                  Mark Won
                </ButtonUntitled>
                <ButtonUntitled
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusChange('lost')}
                >
                  Mark Lost
                </ButtonUntitled>
              </>
            )}
            <ButtonUntitled variant="secondary" size="sm" onClick={() => setIsFormOpen(true)} leftIcon={<Edit size={16} />}>
              Edit
            </ButtonUntitled>
            <ButtonUntitled variant="tertiary" size="sm" onClick={handleDelete} leftIcon={<Trash2 size={16} />}>
              Delete
            </ButtonUntitled>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Deal Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Value */}
            <DataCard
              icon={<DollarSign size={18} />}
              title="Value"
              content={
                deal.value ? (
                  <span className="text-green-600 font-semibold text-lg">
                    ${deal.value.toLocaleString()}
                  </span>
                ) : (
                  '-'
                )
              }
            />

            {/* Contact */}
            <DataCard
              icon={<User size={18} />}
              title="Contact"
              content={
                deal.contacts ? (
                  <Link
                    to={`/crm/contacts/${deal.contacts.id}`}
                    className="text-primary hover:underline"
                  >
                    {deal.contacts.first_name} {deal.contacts.last_name}
                  </Link>
                ) : (
                  '-'
                )
              }
            />

            {/* Company */}
            <DataCard
              icon={<Building2 size={18} />}
              title="Company"
              content={
                deal.companies ? (
                  <Link
                    to={`/crm/companies/${deal.companies.id}`}
                    className="text-primary hover:underline"
                  >
                    {deal.companies.name}
                  </Link>
                ) : (
                  '-'
                )
              }
            />

            {/* Expected Close Date */}
            <DataCard
              icon={<Calendar size={18} />}
              title="Expected Close"
              content={
                deal.expected_close_date ? (
                  <span className="text-text-secondary">
                    {new Date(deal.expected_close_date).toLocaleDateString()}
                  </span>
                ) : (
                  '-'
                )
              }
            />
          </div>

          {/* Stage History */}
          {history && history.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Stage History</h3>
              <div className="border border-border rounded-lg divide-y divide-border">
                {history.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="p-3 flex items-center justify-between">
                    <div>
                      {h.to_stage_name && (
                        <p className="font-medium">
                          Moved to <span className="text-primary">{h.to_stage_name}</span>
                        </p>
                      )}
                      {h.to_status && (
                        <p className="font-medium">
                          Status: <span className="text-primary">{h.to_status}</span>
                        </p>
                      )}
                      {h.notes && (
                        <p className="text-sm text-text-secondary mt-1">{h.notes}</p>
                      )}
                    </div>
                    <span className="text-sm text-text-muted">
                      {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Activity Timeline</h3>
              <ButtonUntitled variant="secondary" size="sm" leftIcon={<FileText size={16} />}>
                Log Activity
              </ButtonUntitled>
            </div>

            {combinedTimeline.length > 0 ? (
              <Timeline items={combinedTimeline} />
            ) : (
              <div className="text-center py-12 text-text-muted">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Log your first activity for this deal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isFormOpen && (
        <DealForm
          deal={deal}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'note':
      return '📝';
    case 'email_sent':
    case 'email_received':
      return '📧';
    case 'call':
      return '📞';
    case 'meeting':
      return '📅';
    case 'task':
      return '✅';
    default:
      return '📌';
  }
}
