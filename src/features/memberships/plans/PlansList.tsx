/**
 * PlansList Component
 * Display and manage membership plans
 */

import { useState } from 'react';
import { Plus, Edit, Trash2, Copy, Star, TrendingUp } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { PageHeaderUntitled } from '@/components/ui/page-header-untitled';
import { useMembershipPlans, useDeletePlan, useSubscriptionStats } from '../hooks/useMemberships';
import { PlanEditor } from './PlanEditor';

export function PlansList({ organizationId }: { organizationId: string }) {
  const { data: plans, isLoading } = useMembershipPlans(organizationId);
  const { data: stats } = useSubscriptionStats(organizationId);
  const deletePlan = useDeletePlan();
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  if (isLoading) {
    return <div>Loading plans...</div>;
  }

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowEditor(true);
  };

  const handleDelete = async (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deletePlan.mutateAsync({ planId, organizationId });
    }
  };

  const handleDuplicate = (plan: any) => {
    const duplicate = {
      ...plan,
      id: undefined,
      name: `${plan.name} (Copy)`,
      slug: `${plan.slug}-copy`,
      status: 'draft',
    };
    setEditingPlan(duplicate);
    setShowEditor(true);
  };

  const getSubscriberCount = (planId: string) => {
    // This would come from stats or a separate query
    return 0;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeaderUntitled
        title="Membership Plans"
        description="Manage subscription tiers and pricing"
        actions={
          <ButtonUntitled variant="primary" onClick={() => { setEditingPlan(null); setShowEditor(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </ButtonUntitled>
        }
      />

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-4 px-6">
        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Plans</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{plans?.length || 0}</div>
          </CardUntitled.Content>
        </CardUntitled>
        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Subscribers</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.active || 0}</div>
          </CardUntitled.Content>
        </CardUntitled>
        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">${stats?.mrr?.toFixed(0) || 0}</div>
          </CardUntitled.Content>
        </CardUntitled>
        <CardUntitled>
          <CardUntitled.Header className="pb-3">
            <CardUntitled.Title className="text-sm font-medium text-gray-500 dark:text-gray-400">Annual Revenue</CardUntitled.Title>
          </CardUntitled.Header>
          <CardUntitled.Content>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">${stats?.arr?.toFixed(0) || 0}</div>
          </CardUntitled.Content>
        </CardUntitled>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-3 px-6">
        {plans?.map((plan) => (
          <CardUntitled
            key={plan.id}
            className={`relative ${plan.featured ? 'ring-2 ring-[#D4AF37]' : ''}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <BadgeUntitled variant="primary">{plan.badge}</BadgeUntitled>
              </div>
            )}
            {plan.featured && (
              <div className="absolute top-4 right-4">
                <Star className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
              </div>
            )}

            <CardUntitled.Header>
              <div className="flex items-center justify-between">
                <CardUntitled.Title className="text-gray-900 dark:text-white">{plan.name}</CardUntitled.Title>
                <BadgeUntitled variant={plan.status === 'active' ? 'primary' : 'secondary'}>
                  {plan.status}
                </BadgeUntitled>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
            </CardUntitled.Header>

            <CardUntitled.Content>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.currency === 'USD' ? '$' : '€'}{plan.price}
                </span>
                {plan.billing_interval !== 'one_time' && (
                  <span className="text-gray-500 dark:text-gray-400">/{plan.billing_interval}</span>
                )}
              </div>

              {plan.trial_days > 0 && (
                <div className="mb-4 text-sm">
                  <BadgeUntitled variant="outline">
                    {plan.trial_days} day trial
                  </BadgeUntitled>
                </div>
              )}

              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-2">
                  {plan.features.map((feature: any, index: number) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className={`mr-2 ${feature.included ? 'text-green-500' : 'text-gray-400'}`}>
                        {feature.included ? '✓' : '✗'}
                      </span>
                      <span className={feature.included ? 'text-gray-900 dark:text-white' : 'line-through text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {plan.content_tiers && plan.content_tiers.length > 0 && (
                <div className="mt-4 text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">Access:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {plan.content_tiers.map((tier) => (
                      <BadgeUntitled key={tier} variant="outline" className="text-xs">
                        {tier}
                      </BadgeUntitled>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {getSubscriberCount(plan.id)} subscribers
              </div>
            </CardUntitled.Content>

            <CardUntitled.Footer className="flex gap-2">
              <ButtonUntitled
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEdit(plan)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </ButtonUntitled>
              <ButtonUntitled
                variant="outline"
                size="sm"
                onClick={() => handleDuplicate(plan)}
              >
                <Copy className="h-4 w-4" />
              </ButtonUntitled>
              <ButtonUntitled
                variant="outline"
                size="sm"
                onClick={() => handleDelete(plan.id)}
              >
                <Trash2 className="h-4 w-4" />
              </ButtonUntitled>
            </CardUntitled.Footer>
          </CardUntitled>
        ))}
      </div>

      {showEditor && (
        <PlanEditor
          organizationId={organizationId}
          plan={editingPlan}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
