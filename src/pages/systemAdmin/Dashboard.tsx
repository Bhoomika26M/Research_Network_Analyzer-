import { useMemo } from 'react'
import {
  Users, Activity, FolderKanban, Network, UserPlus, BookOpen, Building2, CalendarDays,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAppContext } from '@/contexts/AppContext'
import { dashboardService } from '@/services/dashboardService'
import { useAsyncData } from '@/hooks/useAsyncData'
import { AsyncState } from '@/components/shared/AsyncState'
import { StatCard } from '@/components/shared/StatCard'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

const AMBER = '#F59E0B'

const roleLabel = (role: string) =>
  role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default function SystemAdminDashboard({ onNavigate }: DashboardProps) {
  const { users } = useAppContext()
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.admin())

  const activeUsers = useMemo(() => users.filter((u) => u.status === 'Active').length, [users])
  const roleData = (dash?.usersByRole ?? []).map((row) => ({
    role: roleLabel(row.role),
    count: row.count,
  }))
  const institutionData = (dash?.institutions ?? []).slice(0, 8)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overall reports, institution analytics and user statistics
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onNavigate?.('users')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: AMBER }}
          >
            <UserPlus size={15} /> Manage Users
          </button>
          <button
            onClick={() => onNavigate?.('collaboration')}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Network size={15} /> Collaboration Network
          </button>
        </div>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      {/* Overall reports */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Overall Totals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title="Total Users"
            value={String(dash?.usersCount ?? users.length)}
            subtitle={`${activeUsers} active accounts`}
            icon={Users}
            iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          />
          <StatCard
            title="Researchers"
            value={String(dash?.researchersCount ?? 0)}
            subtitle="Registered profiles"
            icon={Activity}
            iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Publications"
            value={String(dash?.publicationsCount ?? 0)}
            subtitle={`${dash?.citationsCount ?? 0} citations`}
            icon={BookOpen}
            iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Active Projects"
            value={String(dash?.activeProjectsCount ?? 0)}
            subtitle="Platform-wide"
            icon={FolderKanban}
            iconBgColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            title="Conferences"
            value={String(dash?.conferencesCount ?? 0)}
            subtitle="Hosted in platform"
            icon={CalendarDays}
            iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          />
          <StatCard
            title="Institutions"
            value={String(dash?.institutionsCount ?? 0)}
            subtitle="Connected institutions"
            icon={Building2}
            iconBgColor="bg-teal-500/10 text-teal-600 dark:text-teal-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Institution analytics */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Institution Analytics</h2>
            <span className="text-xs text-muted-foreground">
              {dash?.institutions?.length ?? 0} institutions
            </span>
          </div>
          {institutionData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No institutions yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={institutionData}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  stroke="var(--border)"
                  interval={0}
                  tickFormatter={(value: string) => value.split(/\s+/)[0].slice(0, 10)}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="researchers" name="Researchers" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                <Bar dataKey="publications" name="Publications" fill="#2563EB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="projects" name="Projects" fill="#10B981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User statistics */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">User Statistics</h2>
          {roleData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No user accounts yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={roleData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="role" tick={{ fontSize: 10 }} stroke="var(--border)" interval={0} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Users" fill={AMBER} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
