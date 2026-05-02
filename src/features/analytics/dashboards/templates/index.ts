import { crmDashboardTemplate } from './crmDashboard';
import { marketingDashboardTemplate } from './marketingDashboard';
import { formsDashboardTemplate } from './formsDashboard';
import { revenueDashboardTemplate } from './revenueDashboard';
import { workflowDashboardTemplate } from './workflowDashboard';

export const dashboardTemplates = [
  crmDashboardTemplate,
  marketingDashboardTemplate,
  formsDashboardTemplate,
  revenueDashboardTemplate,
  workflowDashboardTemplate,
];

export const getTemplateById = (id: string) => {
  return dashboardTemplates.find((template) => template.id === id);
};

export const getTemplatesByCategory = (category: string) => {
  return dashboardTemplates.filter((template) => template.category === category);
};

export const getTemplatesByTag = (tag: string) => {
  return dashboardTemplates.filter((template) =>
    template.tags?.includes(tag)
  );
};

// Re-export types
export type { DashboardTemplate } from '../../types';
