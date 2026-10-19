import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Building2, BookOpen, FolderKanban, Network, UserPlus, ArrowRight,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppContext } from '@/contexts/AppContext'
import { dashboardService } from '@/services/dashboardService'
import { useAsyncData } from '@/hooks/useAsyncData'
import { AsyncState } from '@/components/shared/AsyncState'
import { StatCard } from '@/components/shared/StatCard'
import Modal from '@/components/shared/Modal'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

export default function InstitutionAdminDashboard({ onNavigate }: DashboardProps) {
  const { showToast } = useAppContext()
  const { data: dash, loading, error, reload } = useAsyncData(() => dashboardService.institution())

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', department: '' })

  const handleInviteSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!inviteForm.name || !inviteForm.email) {
      showToast('Name and email are required', 'error')
      return
    }
    showToast(`Invitation sent to ${inviteForm.email}`, 'success')
    setShowInviteModal(false)
    setInviteForm({ name: '', email: '', department: '' })
  }

  const yearData = dash?.publicationsPerYear ?? []
  const typeData = dash?.publicationsByType ?? []
  const maxType = Math.max(1, ...typeData.map((row) => row.count))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Institution Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Departments, publications, active projects and collaboration statistics
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: '#7C3AED' }}
          >
            <UserPlus size={15} /> Invite Collaborator
          </button>
          <button
            onClick={() => onNavigate?.('collaboration')}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            <Network size={15} /> View Collaboration
          </button>
        </div>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Departments"
          value={String(dash?.departmentsCount ?? 0)}
          subtitle={`${dash?.researchersCount ?? 0} researchers`}
          icon={Building2}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Publications"
          value={String(dash?.publicationsCount ?? 0)}
          subtitle="Institution-wide"
          icon={BookOpen}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Active Projects"
          value={String(dash?.activeProjectsCount ?? 0)}
          subtitle="Ongoing research"
          icon={FolderKanban}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Collaboration Statistics"
          value={String(dash?.collaborationsCount ?? 0)}
          subtitle="Institutional partnerships"
          icon={Network}
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
                <Bar dataKey="count" name="Publications" fill="#7C3AED" radius={[4, 4, 0, 0]} />
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
                        background: '#7C3AED',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Collaboration overview</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {dash?.institutionId
              ? `${dash?.collaborationsCount ?? 0} partnerships · ${dash?.activeProjectsCount ?? 0} active projects`
              : 'No institution is linked to this account yet.'}
          </p>
        </div>
        <button
          onClick={() => onNavigate?.('collaboration')}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Open Collaboration module <ArrowRight size={12} />
        </button>
      </div>

      <Modal open={showInviteModal} title="Invite Collaborator" onClose={() => setShowInviteModal(false)}>
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
            <input
              type="email"
              required
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
              placeholder="jane.smith@institution.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Department</label>
            <input
              type="text"
              value={inviteForm.department}
              onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
              placeholder="Computer Science"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: '#7C3AED' }}
            >
              Send Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
