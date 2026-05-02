import React, { useState } from 'react';
import { Filter, Plus, FileText } from 'lucide-react';
import { useActivities } from '../hooks/useActivities';
import { ActivityForm } from './ActivityForm';
import { getActivityTypeConfig } from './ActivityTypes';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { mapActivityStatusToVariant } from '../lib/badge-variants';
import type { Database } from '@/types/database.types';

type Activity = Database['public']['Tables']['activities']['Row'] & Record<string, any>;

export const ActivityTimeline: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { data: activities, isLoading } = useActivities({
    limit: 100,
  });

  const filteredActivities = activities?.filter((activity) => {
    if (filter === 'all') return true;
    return activity.type === filter;
  }) || [];

  const activityTypes = ['all', 'note', 'email_sent', 'email_received', 'call', 'meeting', 'task'] as const;

  return (
    <div className="flex flex-col h-full">
      <PageHeaderUntitled
        title="Activities"
        description="Track all interactions and activities"
        actions={
          <ButtonUntitled variant="primary" size="md" onClick={() => setIsFormOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Log Activity
          </ButtonUntitled>
        }
      />

      {/* Filters */}
      <div className="px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-text-muted" />
          <div className="flex gap-2">
            {activityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? 'bg-primary text-white'
                    : 'bg-surface-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                {type === 'all' ? 'All' : getActivityTypeConfig(type as any).label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-text-muted">Loading activities...</div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <EmptyStateUntitled
            icon={<FileText size={48} />}
            title="No activities found"
            description={filter !== 'all' ? 'Try a different filter' : 'Log your first activity'}
            action={
              filter === 'all' ? (
                <ButtonUntitled variant="primary" size="md" onClick={() => setIsFormOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                  Log Activity
                </ButtonUntitled>
              ) : null
            }
          />
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              {/* Activities */}
              <div className="space-y-6">
                {filteredActivities.map((activity, index) => {
                  const config = getActivityTypeConfig(activity.type as any);

                  return (
                    <div key={activity.id} className="relative pl-12">
                      {/* Icon */}
                      <div
                        className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 border-background shadow-sm"
                        style={{ backgroundColor: config.color + '20' }}
                      >
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="bg-surface border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{activity.title}</h4>
                            <p className="text-sm text-text-secondary">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                          <BadgeUntitled
                            variant="primary"
                            className="border-primary/30"
                            style={{ borderColor: config.color, color: config.color }}
                          >
                            {config.label}
                          </BadgeUntitled>
                        </div>

                        {activity.description && (
                          <p className="text-text-secondary mt-2">{activity.description}</p>
                        )}

                        {/* Related entities */}
                        {(activity.contact_id || activity.company_id || activity.deal_id) && (
                          <div className="flex items-center gap-2 mt-3 text-sm text-text-secondary">
                            {activity.contact_id && (
                              <span>Related to contact</span>
                            )}
                            {activity.company_id && (
                              <span>Related to company</span>
                            )}
                            {activity.deal_id && (
                              <span>Related to deal</span>
                            )}
                          </div>
                        )}

                        {/* Duration */}
                        {activity.duration_minutes && (
                          <div className="mt-2 text-sm text-text-secondary">
                            Duration: {activity.duration_minutes} minutes
                          </div>
                        )}

                        {/* Due date */}
                        {activity.due_date && (
                          <div className="mt-2 text-sm text-text-secondary">
                            Due: {new Date(activity.due_date).toLocaleString()}
                          </div>
                        )}

                        {/* Status */}
                        {activity.status && activity.status !== 'completed' && (
                          <BadgeUntitled
                            variant={mapActivityStatusToVariant(activity.status)}
                            className="mt-2"
                          >
                            {activity.status}
                          </BadgeUntitled>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && <ActivityForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};
