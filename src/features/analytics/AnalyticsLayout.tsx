import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileBarChart,
  Calendar,
} from 'lucide-react';
import { ButtonUntitled } from '@/components/ui/button-untitled';
import { SidebarUntitled, type SidebarSection } from '@/components/ui/sidebar-untitled';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AnalyticsLayout() {
  const location = useLocation();
  const [timeRange, setTimeRange] = useState('last_30_days');

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const timeRanges = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
  ];

  const sidebarSections: SidebarSection[] = [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/analytics',
          active: isActive('/analytics') &&
                 !isActive('/analytics/dashboards') &&
                 !isActive('/analytics/reports'),
        },
        {
          id: 'dashboards',
          label: 'All Dashboards',
          icon: LayoutDashboard,
          href: '/analytics/dashboards',
          active: isActive('/analytics/dashboards'),
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: FileBarChart,
          href: '/analytics/reports',
          active: isActive('/analytics/reports'),
        },
      ],
    },
  ];

  const getActiveItemId = () => {
    if (isActive('/analytics/dashboards')) return 'dashboards';
    if (isActive('/analytics/reports')) return 'reports';
    return 'dashboard';
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <SidebarUntitled
        sections={sidebarSections}
        activeItemId={getActiveItemId()}
        collapsed={false}
        width="md"
        variant="default"
        position="left"
        logo={
          <div className="px-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileBarChart className="h-6 w-6 text-primary" />
              <span className="text-text-primary">Analytics</span>
            </h1>
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-surface px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                {isActive('/analytics/dashboards') && 'Dashboards'}
                {isActive('/analytics/dashboards/new') && 'Create Dashboard'}
                {isActive('/analytics/reports') && 'Reports'}
                {isActive('/analytics/reports/new') && 'Create Report'}
                {!isActive('/analytics/dashboards') &&
                  !isActive('/analytics/reports') &&
                  'Overview'}
              </h2>
            </div>

            {/* Time Range Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ButtonUntitled variant="secondary" size="sm" leftIcon={<Calendar className="h-4 w-4" />}>
                  {timeRanges.find((r) => r.value === timeRange)?.label ||
                    'Time Range'}
                </ButtonUntitled>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {timeRanges.map((range) => (
                  <DropdownMenuItem
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={timeRange === range.value ? 'bg-accent' : ''}
                  >
                    {range.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet context={{ timeRange }} />
        </div>
      </main>
    </div>
  );
}
