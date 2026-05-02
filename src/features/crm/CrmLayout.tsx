import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Plus, Phone, Mail, Calendar, FileText, Users, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchCRMMetrics } from './lib/supabase';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { MetricCardUntitled, MetricGrid, DataCard } from '@/components/ui';
import { PageHeaderWithTabs } from '@/components/ui';
import { ActivityForm } from './activities/ActivityForm';
import { ContactForm } from './contacts/ContactForm';

export const CrmLayout: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (currentOrganization) {
      fetchCRMMetrics(currentOrganization.id).then(setMetrics);
    }
  }, [currentOrganization]);

  const navigation = [
    { name: 'Dashboard', href: '/crm', icon: TrendingUp },
    { name: 'Contacts', href: '/crm/contacts', icon: Users },
    { name: 'Companies', href: '/crm/companies', icon: Building2 },
    { name: 'Deals', href: '/crm/deals', icon: TrendingUp },
    { name: 'Activities', href: '/crm/activities', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <PageHeaderWithTabs
        title="CRM"
        description="Manage your customer relationships"
        icon={TrendingUp}
        tabs={navigation.map((item) => ({
          id: item.name.toLowerCase(),
          label: item.name,
          icon: item.icon,
        }))}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
          const nav = navigation.find(n => n.name.toLowerCase() === tabId);
          if (nav) navigate(nav.href);
        }}
        actions={
          <div className="flex items-center gap-2">
            <ButtonUntitled variant="secondary" size="sm" leftIcon={<FileText size={16} />} onClick={() => setActivityFormOpen(true)}>
              Log Activity
            </ButtonUntitled>
            <ButtonUntitled variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={() => setContactFormOpen(true)}>
              New Contact
            </ButtonUntitled>
          </div>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>

      {/* Quick Activity Form */}
      {activityFormOpen && (
        <ActivityForm onClose={() => setActivityFormOpen(false)} />
      )}

      {/* Quick Contact Form */}
      {contactFormOpen && (
        <ContactForm onClose={() => setContactFormOpen(false)} />
      )}
    </div>
  );
};

// Dashboard component for CRM home
export const CrmDashboard: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (currentOrganization) {
      fetchCRMMetrics(currentOrganization.id).then(setMetrics);
    }
  }, [currentOrganization]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-muted">Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">CRM Overview</h2>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataCard
          icon={<Users />}
          title="Total Contacts"
          value={metrics.totalContacts || 0}
        />
        <DataCard
          icon={<Building2 />}
          title="Total Companies"
          value={metrics.totalCompanies || 0}
        />
        <DataCard
          icon={<TrendingUp />}
          title="Open Deals"
          value={metrics.openDeals || 0}
        />
        <DataCard
          icon={<FileText />}
          title="Recent Activities"
          value={metrics.recentActivities || 0}
        />
      </div>

      {/* Pipeline Value */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DataCard
          icon={<TrendingUp />}
          title="Total Pipeline Value"
          value={`$${metrics.totalValue?.toLocaleString() || 0}`}
        />
        <DataCard
          icon={<TrendingUp />}
          title="Won Deals"
          value={metrics.wonDeals || 0}
        />
      </div>
    </div>
  );
};
