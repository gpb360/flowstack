import { Link } from 'react-router-dom';
import { Plus, LayoutDashboard } from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { CardUntitled } from '@/components/ui/card-untitled';
import { BadgeUntitled } from '@/components/ui/badge-untitled';
import { EmptyStateUntitled } from '@/components/ui/empty-state-untitled';
import { dashboardTemplates } from './templates';

export function DashboardList() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Dashboards</h2>
          <p className="text-text-muted">
            Create and manage custom dashboards for your analytics
          </p>
        </div>
        <Link to="/analytics/dashboards/new">
          <ButtonUntitled
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Dashboard
          </ButtonUntitled>
        </Link>
      </div>

      {/* Pre-built Templates */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Pre-built Dashboards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <CardUntitled
                key={template.id}
                variant="elevated"
                size="md"
                interactive
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {Icon && <Icon className="h-5 w-5 text-primary" />}
                    <h4 className="text-base font-semibold text-text-primary">{template.name}</h4>
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2">
                    {template.tags?.slice(0, 3).map((tag: string) => (
                      <BadgeUntitled
                        key={tag}
                        variant="outline"
                      >
                        {tag}
                      </BadgeUntitled>
                    ))}
                  </div>
                </div>
              </CardUntitled>
            );
          })}
        </div>
      </div>

      {/* Custom Dashboards Section */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">Your Dashboards</h3>
        <CardUntitled variant="default" size="lg">
          <EmptyStateUntitled
            icon={<LayoutDashboard />}
            title="No custom dashboards yet"
            description="Create your first dashboard to visualize your analytics"
            action={
              <Link to="/analytics/dashboards/new">
                <ButtonUntitled
                  variant="secondary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Create Dashboard
                </ButtonUntitled>
              </Link>
            }
          />
        </CardUntitled>
      </div>
    </div>
  );
}
