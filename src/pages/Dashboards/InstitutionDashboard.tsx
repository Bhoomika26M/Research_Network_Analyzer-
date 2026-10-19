import React from 'react';
import { FolderKanban, Network, Building2 } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { AsyncState } from '../../components/shared/AsyncState';
import { dashboardService } from '../../services/dashboardService';
import { useAsyncData } from '../../hooks/useAsyncData';

export const InstitutionDashboard: React.FC = () => {
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.institution());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">Institutional Overview</h2>
          <p className="text-xs text-muted-foreground">{dash?.institutionId ?? 'No institution linked'}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
          Institution Admin
        </span>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Projects" value={String(dash?.activeProjectsCount ?? 0)} subtitle="Ongoing projects" icon={FolderKanban} iconBgColor="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Collaborations" value={String(dash?.collaborationsCount ?? 0)} subtitle="Institutional" icon={Network} iconBgColor="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Network Summary" value={String(dash?.collaborationsCount ?? 0)} subtitle={`${dash?.researchersCount ?? 0} researchers, ${dash?.activeProjectsCount ?? 0} projects`} icon={Building2} iconBgColor="bg-purple-500/10 text-purple-600" />
      </div>
    </div>
  );
};
