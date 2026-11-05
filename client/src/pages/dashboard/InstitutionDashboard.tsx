import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useResearchers } from '../../services/researchers'
import { useNavigate } from '../../context/NavigationContext'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import { useToast } from '../../context/ToastContext'
import type { SessionUser } from '../../types/index'

// Exact Stat Cards matching Screenshot 3
const stats = [
  {
    label: 'TOTAL RESEARCHERS',
    value: '15',
    iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'ACTIVE PROJECTS',
    value: '11',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'PUBLICATIONS 2026',
    value: '0',
    iconBg: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'BUDGET UTILIZED',
    value: '$209.3M',
    iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
]

// Researcher Growth (12 months) line matching Screenshot 3
const growth12MonthData = [
  { month: 'Jan', researchers: 4 },
  { month: 'Feb', researchers: 5 },
  { month: 'Mar', researchers: 6 },
  { month: 'Apr', researchers: 7 },
  { month: 'May', researchers: 8 },
  { month: 'Jun', researchers: 9 },
  { month: 'Jul', researchers: 10 },
  { month: 'Aug', researchers: 11 },
  { month: 'Sep', researchers: 12 },
  { month: 'Oct', researchers: 13 },
  { month: 'Nov', researchers: 14 },
  { month: 'Dec', researchers: 15 },
]

// Publications by Department purple bars matching Screenshot 3
const deptPubData = [
  { department: 'Physics', count: 195 },
  { department: 'Biomedical E...', count: 220 },
  { department: 'Computer Sci', count: 160 },
  { department: 'Electrical E...', count: 145 },
  { department: 'Chemistry', count: 110 },
  { department: 'Neuroscience', count: 180 },
  { department: 'Materials Sci', count: 280 },
  { department: 'Cancer Biolo...', count: 330 },
]

export default function InstitutionDashboard({ user }: { user?: SessionUser }) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const handleSendInvite = () => {
    if (!inviteEmail) return
    showToast(`Invitation sent to ${inviteEmail}`, 'success')
    setInviteModalOpen(false)
    setInviteEmail('')
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Buttons matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">Institution Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Overview of your institution's research activity
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>+</span>
            <span>Invite Researcher</span>
          </button>
          <button
            onClick={() => navigate('reports')}
            className="flex items-center gap-1.5 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Generate Report</span>
          </button>
          <button
            onClick={() => navigate('researchers')}
            className="flex items-center gap-1.5 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>View All Researchers</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between shadow-2xs"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                {s.label}
              </p>
              <p className="font-display font-bold text-3xl text-foreground mt-2">{s.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.iconBg}`}>{s.iconSvg}</div>
          </div>
        ))}
      </div>

      {/* Charts Row matching Screenshot 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Researcher Growth (12 months) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Researcher Growth (12 months)</h2>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={growth12MonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={true} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 16]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="researchers" stroke="#7C3AED" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Publications by Department */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Publications by Department</h2>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={deptPubData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 360]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="count" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Researchers Needing Attention & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Researchers Needing Attention */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <h2 className="font-display font-bold text-sm text-foreground mb-4">Researchers Needing Attention</h2>
          <div className="py-8 text-center text-xs text-muted-foreground bg-background rounded-xl border border-border/50">
            All researchers are in good standing.
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Pending Approvals</h2>
            <button
              onClick={() => navigate('users')}
              className="text-xs font-semibold text-purple-600 hover:underline"
            >
              View all ›
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
              <div>
                <p className="font-bold text-xs text-foreground">Ms. Clara Novak</p>
                <p className="text-[11px] text-muted-foreground">c.novak@scientific.app</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Approved Clara Novak', 'success')}
                  className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  title="Approve"
                >
                  ✓
                </button>
                <button
                  onClick={() => showToast('Rejected application', 'info')}
                  className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-600 flex items-center justify-center hover:bg-rose-500/25 transition-colors cursor-pointer"
                  title="Reject"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <FormModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Researcher"
        label="Faculty Onboarding"
        onSubmit={handleSendInvite}
        submitLabel="Send Invitation"
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-foreground">Researcher Email Address</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@institution.edu"
            className={inputCls}
          />
        </div>
      </FormModal>
    </div>
  )
}
