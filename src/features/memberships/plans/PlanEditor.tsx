/**
 * PlanEditor Component
 * Create or edit a membership plan
 */

import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { InputUntitled } from '@/components/ui/input-untitled';
import { TextareaUntitled } from '@/components/ui/textarea-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { useSavePlan, useMembershipPlan } from '../hooks/useMemberships';

interface PlanEditorProps {
  organizationId: string;
  plan?: any;
  onClose: () => void;
}

export function PlanEditor({ organizationId, plan, onClose }: PlanEditorProps) {
  const savePlan = useSavePlan();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    price: 0,
    currency: 'USD',
    billing_interval: 'monthly' as 'one_time' | 'monthly' | 'yearly',
    trial_days: 0,
    features: [] as { name: string; included: boolean }[],
    content_tiers: [] as string[],
    status: 'draft' as 'draft' | 'active' | 'archived',
    public: false,
    featured: false,
    badge: '',
    order_index: 0,
    stripe_price_id: '',
  });

  const [newFeature, setNewFeature] = useState('');
  const [newTier, setNewTier] = useState('');

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        slug: plan.slug || '',
        price: plan.price || 0,
        currency: plan.currency || 'USD',
        billing_interval: plan.billing_interval || 'monthly',
        trial_days: plan.trial_days || 0,
        features: plan.features || [],
        content_tiers: plan.content_tiers || [],
        status: plan.status || 'draft',
        public: plan.public || false,
        featured: plan.featured || false,
        badge: plan.badge || '',
        order_index: plan.order_index || 0,
        stripe_price_id: plan.stripe_price_id || '',
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await savePlan.mutateAsync({
        organizationId,
        plan: formData,
      });
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, { name: newFeature, included: true }],
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const toggleFeature = (index: number) => {
    const updated = [...formData.features];
    updated[index].included = !updated[index].included;
    setFormData({ ...formData, features: updated });
  };

  const addTier = () => {
    if (newTier.trim() && !formData.content_tiers.includes(newTier)) {
      setFormData({
        ...formData,
        content_tiers: [...formData.content_tiers, newTier],
      });
      setNewTier('');
    }
  };

  const removeTier = (tier: string) => {
    setFormData({
      ...formData,
      content_tiers: formData.content_tiers.filter((t) => t !== tier),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white dark:bg-gray-950 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {plan ? 'Edit Plan' : 'Create Plan'}
          </h2>
          <ButtonUntitled variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </ButtonUntitled>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Basic Information</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content className="space-y-4">
              <InputUntitled
                id="name"
                label="Plan Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Basic Plan"
                required
              />

              <TextareaUntitled
                id="description"
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Perfect for getting started..."
                rows={3}
              />

              <InputUntitled
                id="slug"
                label="URL Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="basic-plan"
                required
              />
            </CardUntitled.Content>
          </CardUntitled>

          {/* Pricing */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Pricing</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputUntitled
                  id="price"
                  label="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  required
                />
                <InputUntitled
                  id="currency"
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  type="select"
                  options={[
                    { value: 'USD', label: 'USD ($)' },
                    { value: 'EUR', label: 'EUR (€)' },
                    { value: 'GBP', label: 'GBP (£)' },
                  ]}
                />
              </div>

              <InputUntitled
                id="interval"
                label="Billing Interval"
                value={formData.billing_interval}
                onChange={(e) => setFormData({ ...formData, billing_interval: e.target.value as any })}
                type="select"
                options={[
                  { value: 'one_time', label: 'One-time' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
              />

              <InputUntitled
                id="trial"
                label="Trial Days"
                type="number"
                value={formData.trial_days}
                onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />

              <InputUntitled
                id="stripe_price"
                label="Stripe Price ID"
                value={formData.stripe_price_id}
                onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                placeholder="price_1234567890"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty for free plans
              </p>
            </CardUntitled.Content>
          </CardUntitled>

          {/* Features */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Features</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add feature..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500"
                />
                <ButtonUntitled type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </ButtonUntitled>
              </div>

              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={feature.included}
                      onChange={() => toggleFeature(index)}
                      className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className={feature.included ? 'text-gray-900 dark:text-white' : 'line-through text-gray-400'}>
                      {feature.name}
                    </span>
                    <ButtonUntitled
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </ButtonUntitled>
                  </div>
                ))}
              </div>
            </CardUntitled.Content>
          </CardUntitled>

          {/* Content Tiers */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Content Access Tiers</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTier())}
                  placeholder="Add tier (e.g., premium, pro)..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500"
                />
                <ButtonUntitled type="button" onClick={addTier}>
                  <Plus className="h-4 w-4" />
                </ButtonUntitled>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.content_tiers.map((tier) => (
                  <BadgeUntitled key={tier} variant="secondary" className="gap-1">
                    {tier}
                    <button
                      type="button"
                      onClick={() => removeTier(tier)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </BadgeUntitled>
                ))}
              </div>
            </CardUntitled.Content>
          </CardUntitled>

          {/* Display Settings */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Display Settings</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="public" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show on Pricing Page
                </label>
                <input
                  type="checkbox"
                  id="public"
                  checked={formData.public}
                  onChange={(e) => setFormData({ ...formData, public: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured Plan
                </label>
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                />
              </div>

              <InputUntitled
                id="badge"
                label="Badge Text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Most Popular"
              />

              <InputUntitled
                id="order"
                label="Display Order"
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              />
            </CardUntitled.Content>
          </CardUntitled>

          {/* Status */}
          <CardUntitled>
            <CardUntitled.Header>
              <CardUntitled.Title>Status</CardUntitled.Title>
            </CardUntitled.Header>
            <CardUntitled.Content>
              <InputUntitled
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                type="select"
                options={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'active', label: 'Active' },
                  { value: 'archived', label: 'Archived' },
                ]}
              />
            </CardUntitled.Content>
          </CardUntitled>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <ButtonUntitled type="button" variant="outline" onClick={onClose}>
              Cancel
            </ButtonUntitled>
            <ButtonUntitled type="submit" variant="primary" disabled={savePlan.isPending}>
              {savePlan.isPending ? 'Saving...' : 'Save Plan'}
              <Save className="ml-2 h-4 w-4" />
            </ButtonUntitled>
          </div>
        </form>
      </div>
    </div>
  );
}
