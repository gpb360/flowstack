/**
 * MemberDetails Component
 * Detailed view of a member/subscriber
 */

import { useState } from 'react';
import { X, Mail, Phone, Calendar, Clock, DollarSign, BookOpen, Award } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { TabsUntitled } from '@/components/ui/tabs-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import { useAccessRecords, useAccessSummary } from '../hooks/useMemberAccess';

interface MemberDetailsProps {
  subscription: any;
  onClose: () => void;
}

export function MemberDetails({ subscription, onClose }: MemberDetailsProps) {
  const { data: accessRecords } = useAccessRecords(subscription.id);
  const { data: summary } = useAccessSummary(subscription.id);
  const [notes, setNotes] = useState('');

  const memberName =
    subscription.user?.full_name ||
    `${subscription.contact?.first_name || ''} ${subscription.contact?.last_name || ''}`.trim() ||
    'Unknown';
  const memberEmail = subscription.user?.email || subscription.contact?.email;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'default';
      case 'past_due':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white dark:bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{memberName}</h2>
                <BadgeUntitled variant={getStatusColor(subscription.status) === 'default' ? 'primary' : getStatusColor(subscription.status) === 'destructive' ? 'danger' : 'secondary'}>
                  {subscription.status}
                </BadgeUntitled>
              </div>
              <p className="text-gray-500 dark:text-gray-400">{memberEmail}</p>
            </div>
            <ButtonUntitled variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </ButtonUntitled>
          </div>
        </div>

        <div className="p-6">
          <TabsUntitled defaultValue="overview">
            <TabsUntitled.List className="mb-6">
              <TabsUntitled.Trigger value="overview">Overview</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="content">Content Access</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="progress">Progress</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="billing">Billing</TabsUntitled.Trigger>
              <TabsUntitled.Trigger value="notes">Notes</TabsUntitled.Trigger>
            </TabsUntitled.List>

            {/* Overview Tab */}
            <TabsUntitled.Content value="overview" className="space-y-6">
              {/* Subscription Details */}
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title className="text-lg">Subscription Details</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Plan</label>
                      <div className="font-medium text-gray-900 dark:text-white">{subscription.plan?.name || 'No plan'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Price</label>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.currency === 'USD' ? '$' : '€'}{subscription.price}/{subscription.billing_interval}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Started</label>
                      <div className="font-medium flex items-center gap-1 text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4" />
                        {new Date(subscription.started_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Next Billing</label>
                      <div className="font-medium flex items-center gap-1 text-gray-900 dark:text-white">
                        <Clock className="h-4 w-4" />
                        {subscription.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {subscription.cancel_at_period_end && (
                    <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        This subscription will be cancelled at the end of the current billing period.
                      </p>
                    </div>
                  )}
                </CardUntitled.Content>
              </CardUntitled>

              {/* Contact Info */}
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title className="text-lg">Contact Information</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content>
                  <div className="space-y-2">
                    {memberEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a
                          href={`mailto:${memberEmail}`}
                          className="text-[#D4AF37] hover:underline"
                        >
                          {memberEmail}
                        </a>
                      </div>
                    )}
                    {subscription.user?.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${subscription.user.phone}`} className="text-[#D4AF37] hover:underline">
                          {subscription.user.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardUntitled.Content>
              </CardUntitled>

              {/* Quick Stats */}
              {summary && (
                <div className="grid gap-4 md:grid-cols-4">
                  <CardUntitled>
                    <CardUntitled.Content className="pt-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Total Content</div>
                        </div>
                      </div>
                    </CardUntitled.Content>
                  </CardUntitled>
                  <CardUntitled>
                    <CardUntitled.Content className="pt-6">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.completed}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                        </div>
                      </div>
                    </CardUntitled.Content>
                  </CardUntitled>
                  <CardUntitled>
                    <CardUntitled.Content className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.avgProgress}%</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Progress</div>
                        </div>
                      </div>
                    </CardUntitled.Content>
                  </CardUntitled>
                  <CardUntitled>
                    <CardUntitled.Content className="pt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalTimeSpentHours}h</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Time Spent</div>
                        </div>
                      </div>
                    </CardUntitled.Content>
                  </CardUntitled>
                </div>
              )}
            </TabsUntitled.Content>

            {/* Content Access Tab */}
            <TabsUntitled.Content value="content" className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-4 gap-4 border-b border-gray-200 bg-gray-50 p-4 text-sm font-medium dark:border-gray-800 dark:bg-gray-900">
                  <div>Content</div>
                  <div>Access Type</div>
                  <div>Progress</div>
                  <div>Last Accessed</div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {accessRecords?.map((record: any) => (
                    <div key={record.id} className="grid grid-cols-4 gap-4 p-4 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">{record.content?.title}</div>
                      <div>
                        <BadgeUntitled variant={record.access_type === 'full' ? 'primary' : 'secondary'}>
                          {record.access_type}
                        </BadgeUntitled>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-[#D4AF37]"
                              style={{ width: `${record.progress_percent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{record.progress_percent}%</span>
                        </div>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {record.last_accessed_at
                          ? new Date(record.last_accessed_at).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                  ))}

                  {!accessRecords || accessRecords.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No content access records found
                    </div>
                  ) : null}
                </div>
              </div>
            </TabsUntitled.Content>

            {/* Progress Tab */}
            <TabsUntitled.Content value="progress">
              <CardUntitled>
                <CardUntitled.Content className="pt-6">
                  {summary ? (
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-white">Completion Rate</span>
                          <span className="text-gray-900 dark:text-white">{summary.completed} of {summary.total} items</span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-[#D4AF37]"
                            style={{ width: `${(summary.completed / summary.total) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-500">{summary.completed}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-500">{summary.inProgress}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-400">{summary.notStarted}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Not Started</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      Loading progress data...
                    </div>
                  )}
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>

            {/* Billing Tab */}
            <TabsUntitled.Content value="billing">
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title className="text-lg">Billing Information</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Amount</label>
                      <div className="font-medium flex items-center gap-1 text-gray-900 dark:text-white">
                        <DollarSign className="h-4 w-4" />
                        {subscription.currency === 'USD' ? '$' : '€'}{subscription.price}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Billing Interval</label>
                      <div className="font-medium capitalize text-gray-900 dark:text-white">
                        {subscription.billing_interval}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Current Period Start</label>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.current_period_start
                          ? new Date(subscription.current_period_start).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">Current Period End</label>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {subscription.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {subscription.stripe_subscription_id && (
                    <div className="rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
                      <div className="font-medium text-gray-900 dark:text-white">Stripe Subscription</div>
                      <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                        {subscription.stripe_subscription_id}
                      </div>
                    </div>
                  )}
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>

            {/* Notes Tab */}
            <TabsUntitled.Content value="notes">
              <CardUntitled>
                <CardUntitled.Header>
                  <CardUntitled.Title className="text-lg">Internal Notes</CardUntitled.Title>
                </CardUntitled.Header>
                <CardUntitled.Content>
                  <TextareaUntitled
                    id="notes"
                    label="Notes about this member"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this member..."
                    rows={8}
                  />
                  <div className="mt-4 flex justify-end">
                    <ButtonUntitled size="sm" variant="primary">Save Notes</ButtonUntitled>
                  </div>
                </CardUntitled.Content>
              </CardUntitled>
            </TabsUntitled.Content>
          </TabsUntitled>
        </div>
      </div>
    </div>
  );
}
