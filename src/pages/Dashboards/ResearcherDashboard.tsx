import React from 'react';
import { FolderKanban, Users, Network } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { AsyncState } from '../../components/shared/AsyncState';
import { dashboardService } from '../../services/dashboardService';
import { useAsyncData } from '../../hooks/useAsyncData';

export const ResearcherDashboard: React.FC = () => {
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.researcher());

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md">
        <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
          Researcher Workspace
        </span>
        <h2 className="text-xl font-bold">Welcome back</h2>
        <p className="text-xs text-blue-100 mt-1">Your collaboration and project overview.</p>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Projects" value={String(dash?.projectsCount ?? 0)} subtitle="Memberships" icon={FolderKanban} iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <StatCard title="Co-Authors" value={String(dash?.collaboratorsCount ?? 0)} subtitle="Across institutions" icon={Users} iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
        <StatCard title="Network Summary" value={String(dash?.publicationsCount ?? 0)} subtitle={`${dash?.projectsCount ?? 0} projects, ${dash?.collaboratorsCount ?? 0} co-authors`} icon={Network} iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
      </div>
    </div>
  );
};
