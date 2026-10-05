import { useMemo, useState } from 'react'
import { Users, BookOpen, FolderKanban, DollarSign, CheckCircle, XCircle, UserPlus, BarChart2, ChevronRight } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Modal from '@/components/shared/Modal'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function KPI({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { researchers, projects, publications, departments, users, updateUser, showToast } = useAppContext()
  const currentYear = new Date().getFullYear()

  const [approveTarget, setApproveTarget] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', department: '' })

  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'Delayed').length, [projects])
  const publicationsYTD = useMemo(() => publications.filter(p => p.year === currentYear).length, [publications, currentYear])
  const pendingUsers = useMemo(() => (users ?? []).filter(u => u.status === 'Pending'), [users])
  const budgetUtilized = useMemo(() => {
    const total = projects.reduce((acc, p) => acc + p.budget, 0)
    return total >= 1_000_000 ? `$${(total / 1_000_000).toFixed(1)}M` : `$${(total / 1000).toFixed(0)}K`
  }, [projects])

  // Researcher growth over 12 months (cumulative simulation)
  const researcherGrowth = useMemo(() => {
    const base = Math.max(1, researchers.length - 11)
    return MONTHS.map((month, i) => ({ month, researchers: base + i }))
  }, [researchers.length])

  // Publications by department
  const pubsByDept = useMemo(() => {
    const deptNames = departments.map(d => d.name)
    return deptNames.map(dept => ({
      dept: dept.length > 12 ? dept.slice(0, 12) + '…' : dept,
      publications: departments.find(d => d.name === dept)?.publications ?? 0,
    }))
  }, [departments])

  // Researchers needing attention
  const attention = useMemo(() =>
    researchers.filter(r => r.status !== 'Active' || r.hIndex < 5),
    [researchers]
  )

  const handleApproveUser = () => {
    if (!approveTarget) return
    updateUser(approveTarget, { status: 'Active' })
    showToast('User approved successfully', 'success')
    setApproveTarget(null)
  }

  const handleRejectUser = () => {
    if (!rejectTarget) return
    updateUser(rejectTarget, { status: 'Inactive' })
    showToast('User request rejected', 'warning')
    setRejectTarget(null)
  }

  const handleSendInvite = () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      showToast('Name and email are required', 'error')
      return
    }
    showToast(`Invitation sent to ${inviteForm.email}`, 'success')
    setShowInviteModal(false)
    setInviteForm({ name: '', email: '', department: '' })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Institution Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your institution's research activity</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6d28d9] transition-colors">
            <UserPlus size={15} /> Invite Researcher
          </button>
          <button onClick={() => onNavigate?.('reports')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <BarChart2 size={15} /> Generate Report
          </button>
          <button onClick={() => onNavigate?.('researchers')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Users size={15} /> View All Researchers
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI label="Total Researchers" value={researchers.length} icon={Users} color="bg-[#7C3AED]" />
        <KPI label="Active Projects" value={activeProjects} icon={FolderKanban} color="bg-emerald-600" />
        <KPI label={`Publications ${currentYear}`} value={publicationsYTD} icon={BookOpen} color="bg-blue-600" />
        <KPI label="Budget Utilized" value={budgetUtilized} icon={DollarSign} color="bg-amber-500" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Researcher Growth (12 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={researcherGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="researchers" stroke="#7C3AED" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publications by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pubsByDept} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dept" tick={{ fontSize: 10 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="publications" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Researchers needing attention */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Researchers Needing Attention</h2>
          {attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">All researchers are in good standing.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                    <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">h-Index</th>
                    <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attention.slice(0, 6).map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: r.color }}>{r.initials}</div>
                          <span className="text-foreground font-medium">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-muted-foreground">{r.hIndex}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending user approvals */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Pending Approvals</h2>
            <button onClick={() => onNavigate?.('researchers')} className="flex items-center gap-1 text-xs text-[#7C3AED] hover:underline">
              View all <ChevronRight size={12} />
            </button>
          </div>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending user approvals.</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.slice(0, 5).map(u => (
                <div key={u.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-secondary">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.role} · {u.institution}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setApproveTarget(u.id)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 transition-colors" title="Accept">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => setRejectTarget(u.id)} className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 transition-colors" title="Reject">
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve User"
        message="Are you sure you want to approve this user? Their account will be set to Active."
        confirmLabel="Approve"
        onConfirm={handleApproveUser}
        onCancel={() => setApproveTarget(null)}
      />
      <ConfirmDialog
        open={!!rejectTarget}
        title="Reject User"
        message="Are you sure you want to reject this user request? Their account will be set to Inactive."
        confirmLabel="Reject"
        danger
        onConfirm={handleRejectUser}
        onCancel={() => setRejectTarget(null)}
      />

      {/* Invite Researcher Modal */}
      <Modal open={showInviteModal} title="Invite Researcher" onClose={() => setShowInviteModal(false)}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              value={inviteForm.name}
              onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              value={inviteForm.email}
              onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
              placeholder="researcher@institution.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Department</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              value={inviteForm.department}
              onChange={e => setInviteForm(f => ({ ...f, department: e.target.value }))}
              placeholder="Computer Science"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSendInvite} className="px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6d28d9] transition-colors">Send Invitation</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
