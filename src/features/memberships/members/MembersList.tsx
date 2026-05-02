/**
 * MembersList Component
 * Display and manage organization members/subscribers
 */

import { useState } from 'react';
import { Search, MoreVertical, Mail, Phone } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useSubscriptions, useCancelSubscription } from '../hooks/useMemberships';
import { MemberDetails } from './MemberDetails';

interface MembersListProps {
  organizationId: string;
}

export function MembersList({ organizationId }: MembersListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { data: subscriptions, isLoading } = useSubscriptions(
    organizationId,
    statusFilter === 'all' ? undefined : statusFilter
  );

  const cancelSubscription = useCancelSubscription();

  const filteredMembers = subscriptions?.filter((sub: any) => {
    const searchLower = search.toLowerCase();
    const userName = sub.user?.full_name?.toLowerCase() || '';
    const userEmail = sub.user?.email?.toLowerCase() || '';
    const contactName = sub.contact?.first_name?.toLowerCase() || '';
    const contactEmail = sub.contact?.email?.toLowerCase() || '';

    return (
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      contactName.includes(searchLower) ||
      contactEmail.includes(searchLower)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'trialing':
        return 'default';
      case 'past_due':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    if (confirm('Are you sure you want to cancel this subscription?')) {
      await cancelSubscription.mutateAsync(subscriptionId);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeaderUntitled
        title="Members"
        description="Manage your membership subscribers"
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 px-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500"
          />
        </div>

        <div className="flex gap-2">
          <ButtonUntitled
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({subscriptions?.length || 0})
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({subscriptions?.filter((s: any) => s.status === 'active').length || 0})
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'trialing' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('trialing')}
          >
            Trial ({subscriptions?.filter((s: any) => s.status === 'trialing').length || 0})
          </ButtonUntitled>
          <ButtonUntitled
            variant={statusFilter === 'past_due' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('past_due')}
          >
            Past Due ({subscriptions?.filter((s: any) => s.status === 'past_due').length || 0})
          </ButtonUntitled>
        </div>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="px-6 text-center text-gray-500 dark:text-gray-400">Loading members...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 mx-6">
          <div className="grid grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 p-4 text-sm font-medium dark:border-gray-800 dark:bg-gray-900">
            <div className="col-span-3">Member</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Started</div>
            <div className="col-span-2">Next Billing</div>
            <div className="col-span-1"></div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredMembers?.map((subscription: any) => (
              <div
                key={subscription.id}
                className="grid grid-cols-12 gap-4 p-4 text-sm hover:bg-gray-50 cursor-pointer dark:hover:bg-gray-900"
                onClick={() => {
                  setSelectedMember(subscription);
                  setShowDetails(true);
                }}
              >
                {/* Member Info */}
                <div className="col-span-3">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {subscription.user?.full_name ||
                      `${subscription.contact?.first_name || ''} ${subscription.contact?.last_name || ''}`.trim() ||
                      'Unknown'}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {subscription.user?.email || subscription.contact?.email || 'No email'}
                  </div>
                </div>

                {/* Plan */}
                <div className="col-span-2 flex items-center text-gray-900 dark:text-white">
                  <span>{subscription.plan?.name || 'No plan'}</span>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center">
                  <BadgeUntitled variant={getStatusColor(subscription.status) === 'default' ? 'primary' : getStatusColor(subscription.status) === 'destructive' ? 'danger' : getStatusColor(subscription.status) === 'secondary' ? 'secondary' : 'outline'}>
                    {subscription.status}
                  </BadgeUntitled>
                </div>

                {/* Started */}
                <div className="col-span-2 flex items-center text-gray-500 dark:text-gray-400">
                  {new Date(subscription.started_at).toLocaleDateString()}
                </div>

                {/* Next Billing */}
                <div className="col-span-2 flex items-center text-gray-500 dark:text-gray-400">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'}
                </div>

                {/* Actions */}
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Show dropdown menu - simplified for now
                      setSelectedMember(subscription);
                      setShowDetails(true);
                    }}
                    className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            ))}

            {filteredMembers?.length === 0 && (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No members found
              </div>
            )}
          </div>
        </div>
      )}

      {showDetails && selectedMember && (
        <MemberDetails
          subscription={selectedMember}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}
