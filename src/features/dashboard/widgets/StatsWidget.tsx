import { WidgetWrapper } from '../components/WidgetWrapper';
import { useStatsQuery } from '../hooks/useStatsQuery';
import { Users, Building2, GitBranch, Mail } from 'lucide-react';

const StatItem = ({ label, value, icon: Icon, colorClass }: { label: string, value: number | string, icon: any, colorClass: string }) => (
  <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-sm transition-shadow">
    <div className={`absolute top-2 right-2 p-1.5 rounded-full ${colorClass} bg-opacity-10 text-opacity-80`}>
      <Icon size={14} className={colorClass.replace('bg-', 'text-')} />
    </div>
    <span className="text-2xl font-bold text-gray-800 mt-2">{value}</span>
    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
  </div>
);

export const StatsWidget = () => {
  const { data: stats, isLoading } = useStatsQuery();

  return (
    <WidgetWrapper title="Overview">
      <div className="grid grid-cols-2 gap-3 h-full">
        <StatItem 
          label="Contacts" 
          value={isLoading ? '-' : stats?.contacts || 0} 
          icon={Users}
          colorClass="bg-blue-500 text-blue-600"
        />
        <StatItem 
          label="Companies" 
          value={isLoading ? '-' : stats?.companies || 0} 
          icon={Building2}
          colorClass="bg-indigo-500 text-indigo-600"
        />
        <StatItem 
          label="Active Flows" 
          value={isLoading ? '-' : stats?.activeWorkflows || 0} 
          icon={GitBranch}
          colorClass="bg-emerald-500 text-emerald-600"
        />
        <StatItem 
          label="Campaigns" 
          value={isLoading ? '-' : stats?.completedCampaigns || 0} 
          icon={Mail}
          colorClass="bg-purple-500 text-purple-600"
        />
      </div>
    </WidgetWrapper>
  );
};
