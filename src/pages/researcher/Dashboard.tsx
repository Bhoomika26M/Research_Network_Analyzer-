import { BookOpen, FolderKanban, CalendarDays, Users, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '@/services/dashboardService'
import { useAsyncData } from '@/hooks/useAsyncData'
import { AsyncState } from '@/components/shared/AsyncState'
import { StatCard } from '@/components/shared/StatCard'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

export default function ResearcherDashboard({ onNavigate }: DashboardProps) {
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.researcher())

  const yearData = dash?.publicationsPerYear ?? []
  const typeData = dash?.publicationsByType ?? []
  const maxType = Math.max(1, ...typeData.map((row) => row.count))
  const recentProjects = dash?.recentProjects ?? []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Researcher Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publications, projects, conferences and collaborators at a glance
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onNavigate?.('find')}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Users size={15} /> Find Collaborators
          </button>
          <button
            onClick={() => onNavigate?.('my-projects')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: '#2563EB' }}
          >
            <FolderKanban size={15} /> My Projects
          </button>
        </div>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Publications"
          value={String(dash?.publicationsCount ?? 0)}
          subtitle={`${dash?.citationsIncoming ?? 0} incoming citations`}
          icon={BookOpen}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Projects"
          value={String(dash?.projectsCount ?? 0)}
          subtitle="Active memberships"
          icon={FolderKanban}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Conferences"
          value={String(dash?.conferencesCount ?? 0)}
          subtitle="Participations"
          icon={CalendarDays}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Collaborators"
          value={String(dash?.collaboratorsCount ?? 0)}
          subtitle="Co-authors across institutions"
          icon={Users}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publications per Year</h2>
          {yearData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">
              No publications recorded yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={yearData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--border)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Publications" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publications by Type</h2>
          {typeData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No publication types yet.</p>
          ) : (
            <div className="space-y-3 py-2">
              {typeData.map((row) => (
                <div key={row.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-medium">{row.type}</span>
                    <span className="text-muted-foreground">{row.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.round((row.count / maxType) * 100)}%`,
                        background: '#2563EB',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Projects</h2>
          <button
            onClick={() => onNavigate?.('my-projects')}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        {recentProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No project assignments yet.</p>
        ) : (
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Lead: {project.lead || '—'} · {project.institution || 'No institution'}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary whitespace-nowrap">
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
