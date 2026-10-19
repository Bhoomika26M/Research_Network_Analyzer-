import React from 'react';
import { FolderKanban, Users, Network } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { AsyncState } from '../../components/shared/AsyncState';
import { dashboardService } from '../../services/dashboardService';
import { useAsyncData } from '../../hooks/useAsyncData';

export const ReviewerDashboard: React.FC = () => {
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.researcher());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Reviewer Portal</h2>
          <p className="text-xs text-muted-foreground">Collaboration overview</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-600 border border-teal-500/20">
          Reviewer Role
        </span>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Projects" value={String(dash?.projectsCount ?? 0)} subtitle="Memberships" icon={FolderKanban} iconBgColor="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Co-Authors" value={String(dash?.collaboratorsCount ?? 0)} subtitle="Across institutions" icon={Users} iconBgColor="bg-amber-500/10 text-amber-600" />
        <StatCard title="Network Summary" value={String(dash?.publicationsCount ?? 0)} subtitle={`${dash?.projectsCount ?? 0} projects, ${dash?.collaboratorsCount ?? 0} co-authors`} icon={Network} iconBgColor="bg-purple-500/10 text-purple-600" />
      </div>
    </div>
  );
};
