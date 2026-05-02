/**
 * PlanComparison Component
 * Display pricing table comparing membership plans
 */

import { Check, X } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { usePublicPlans } from '../hooks/useMemberships';

interface PlanComparisonProps {
  organizationId: string;
  onSelectPlan: (planId: string) => void;
  currentPlanId?: string;
}

export function PlanComparison({ organizationId, onSelectPlan, currentPlanId }: PlanComparisonProps) {
  const { data: plans, isLoading } = usePublicPlans(organizationId);

  if (isLoading) {
    return <div>Loading plans...</div>;
  }

  if (!plans || plans.length === 0) {
    return <div>No plans available</div>;
  }

  // Get all unique features from all plans
  const allFeatures = Array.from(
    new Set(
      plans.flatMap((plan) =>
        plan.features?.map((f: any) => f.name) || []
      )
    )
  );

  return (
    <div className="space-y-8">
      {/* Mobile View - Stacked Cards */}
      <div className="space-y-6 lg:hidden">
        {plans.map((plan) => (
          <CardUntitled key={plan.id} className={`p-6 ${plan.featured ? 'ring-2 ring-[#D4AF37]' : ''}`}>
            {plan.badge && (
              <div className="mb-4">
                <BadgeUntitled variant="primary">{plan.badge}</BadgeUntitled>
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{plan.description}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {plan.currency === 'USD' ? '$' : '€'}{plan.price}
              </span>
              {plan.billing_interval !== 'one_time' && (
                <span className="text-gray-500 dark:text-gray-400">/{plan.billing_interval}</span>
              )}
            </div>
            <div className="mb-6 space-y-3">
              {plan.features?.map((feature: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={feature.included ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}>
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
            <ButtonUntitled
              className="w-full"
              variant={plan.featured ? 'primary' : 'outline'}
              onClick={() => onSelectPlan(plan.id)}
              disabled={plan.id === currentPlanId}
            >
              {plan.id === currentPlanId ? 'Current Plan' : 'Select Plan'}
            </ButtonUntitled>
          </CardUntitled>
        ))}
      </div>

      {/* Desktop View - Comparison Table */}
      <div className="hidden lg:block">
        <div className="grid gap-6" style={{ gridTemplateColumns: `auto repeat(${plans.length}, 1fr)` }}>
          {/* Header Row */}
          <div></div>
          {plans.map((plan) => (
            <div key={plan.id} className="text-center">
              {plan.badge && (
                <BadgeUntitled variant="primary" className="mb-2">{plan.badge}</BadgeUntitled>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {plan.currency === 'USD' ? '$' : '€'}{plan.price}
                </span>
                {plan.billing_interval !== 'one_time' && (
                  <span className="text-gray-500 dark:text-gray-400">/{plan.billing_interval}</span>
                )}
              </div>
              <ButtonUntitled
                className="w-full"
                variant={plan.featured ? 'primary' : 'outline'}
                onClick={() => onSelectPlan(plan.id)}
                disabled={plan.id === currentPlanId}
              >
                {plan.id === currentPlanId ? 'Current Plan' : 'Select Plan'}
              </ButtonUntitled>
            </div>
          ))}

          {/* Feature Rows */}
          {allFeatures.map((feature) => (
            <div key={feature} className="contents">
              <div className="py-3 pr-4 text-sm font-medium text-gray-900 dark:text-white">{feature}</div>
              {plans.map((plan) => {
                const planFeature = plan.features?.find((f: any) => f.name === feature);
                const included = planFeature?.included ?? false;
                return (
                  <div key={plan.id} className="py-3 text-center">
                    {included ? (
                      <Check className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
