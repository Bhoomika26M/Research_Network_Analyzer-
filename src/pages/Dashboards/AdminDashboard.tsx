import React from 'react';
import { Users, FolderKanban, Network } from 'lucide-react';
import { StatCard } from '../../components/shared/StatCard';
import { AsyncState } from '../../components/shared/AsyncState';
import { dashboardService } from '../../services/dashboardService';
import { useAsyncData } from '../../hooks/useAsyncData';

export const AdminDashboard: React.FC = () => {
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.admin());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-foreground">System Governance</h2>
          <p className="text-xs text-muted-foreground">User Management &amp; Collaboration Overview</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          System Admin
        </span>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Active Users" value={String(dash?.usersCount ?? 0)} subtitle="Users in system" icon={Users} iconBgColor="bg-blue-500/10 text-blue-600" />
        <StatCard title="Active Projects" value={String(dash?.activeProjectsCount ?? 0)} subtitle="In progress" icon={FolderKanban} iconBgColor="bg-emerald-500/10 text-emerald-600" />
        <StatCard title="Network Summary" value={String(dash?.institutionsCount ?? 0)} subtitle={`${dash?.institutionsCount ?? 0} institutions`} icon={Network} iconBgColor="bg-purple-500/10 text-purple-600" />
      </div>
    </div>
  );
};
