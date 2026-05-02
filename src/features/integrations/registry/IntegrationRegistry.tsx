import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAvailableIntegrations } from '../lib/queries';
import { Search, SlidersHorizontal } from 'lucide-react';
import { InputUntitled } from '@/components/ui/input-untitled';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { IntegrationCard } from './IntegrationCard';
import type { IntegrationCategory } from '../lib/registry';
import { getCategories } from '../lib/registry';

const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  payment: 'Payment',
  communication: 'Communication',
  email: 'Email & Marketing',
  calendar: 'Calendar',
  crm: 'CRM',
  storage: 'Storage',
  analytics: 'Analytics',
  ecommerce: 'E-commerce',
  video: 'Video',
  productivity: 'Productivity',
  other: 'Other',
};

const CATEGORY_COLORS: Record<IntegrationCategory, string> = {
  payment: 'bg-purple-100 text-purple-700 border-purple-200',
  communication: 'bg-blue-100 text-blue-700 border-blue-200',
  email: 'bg-green-100 text-green-700 border-green-200',
  calendar: 'bg-orange-100 text-orange-700 border-orange-200',
  crm: 'bg-pink-100 text-pink-700 border-pink-200',
  storage: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  analytics: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  ecommerce: 'bg-teal-100 text-teal-700 border-teal-200',
  video: 'bg-red-100 text-red-700 border-red-200',
  productivity: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  other: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const IntegrationRegistry: React.FC = () => {
  const navigate = useNavigate();
  const { data: integrations, isLoading } = useAvailableIntegrations();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | 'all'>('all');
  const categories = getCategories();

  const filteredIntegrations = integrations?.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }) ?? [];

  const handleConnect = (integrationId: string) => {
    navigate(`/integrations/new/${integrationId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Browse Integrations</h2>
        <p className="text-text-secondary">
          Connect your favorite apps and services to automate your workflows
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <InputUntitled
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ButtonUntitled variant="outline" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </ButtonUntitled>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <BadgeUntitled
          variant={selectedCategory === 'all' ? 'primary' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All ({integrations?.length || 0})
        </BadgeUntitled>
        {categories.map((category) => {
          const count = integrations?.filter((i) => i.category === category).length || 0;
          const colorClass = CATEGORY_COLORS[category as IntegrationCategory];

          return (
            <BadgeUntitled
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              className={`cursor-pointer ${selectedCategory === category ? '' : colorClass}`}
              onClick={() => setSelectedCategory(category as IntegrationCategory)}
            >
              {CATEGORY_LABELS[category as IntegrationCategory]} ({count})
            </BadgeUntitled>
          );
        })}
      </div>

      {/* Integrations Grid */}
      {filteredIntegrations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            No integrations found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onConnect={handleConnect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
