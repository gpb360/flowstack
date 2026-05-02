/**
 * PaymentsList Component
 * Display membership payment history
 */

import { useState } from 'react';
import { Search, Download, RefreshCw } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { useSubscriptions } from '../hooks/useMemberships';

export function PaymentsList({ organizationId }: { organizationId: string }) {
  const [search, setSearch] = useState('');

  const { data: subscriptions, isLoading } = useSubscriptions(organizationId);

  const filteredPayments = subscriptions?.filter((sub: any) => {
    const searchLower = search.toLowerCase();
    const userName = sub.user?.full_name?.toLowerCase() || '';
    const userEmail = sub.user?.email?.toLowerCase() || '';
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'past_due':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeaderUntitled
        title="Payments & Subscriptions"
        description="Track membership revenue and payment history"
        actions={
          <ButtonUntitled variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </ButtonUntitled>
        }
      />

      <div className="mb-6 flex gap-4 px-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-6 text-center text-gray-500 dark:text-gray-400">Loading payments...</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 mx-6">
          <div className="grid grid-cols-6 gap-4 border-b border-gray-200 bg-gray-50 p-4 text-sm font-medium dark:border-gray-800 dark:bg-gray-900">
            <div className="col-span-2">Member</div>
            <div>Plan</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {filteredPayments?.map((subscription: any) => (
              <div key={subscription.id} className="grid grid-cols-6 gap-4 p-4 text-sm">
                <div className="col-span-2">
                  <div className="font-medium text-gray-900 dark:text-white">{subscription.user?.full_name || 'Unknown'}</div>
                  <div className="text-gray-500 dark:text-gray-400">{subscription.user?.email}</div>
                </div>
                <div className="text-gray-900 dark:text-white">{subscription.plan?.name || 'No plan'}</div>
                <div className="text-gray-900 dark:text-white">
                  {subscription.currency === 'USD' ? '$' : '€'}{subscription.price}/{subscription.billing_interval}
                </div>
                <div>
                  <BadgeUntitled variant={getStatusColor(subscription.status) === 'default' ? 'primary' : getStatusColor(subscription.status) === 'destructive' ? 'danger' : getStatusColor(subscription.status) === 'secondary' ? 'secondary' : 'outline'}>
                    {subscription.status}
                  </BadgeUntitled>
                </div>
                <div>
                  <ButtonUntitled variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </ButtonUntitled>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
