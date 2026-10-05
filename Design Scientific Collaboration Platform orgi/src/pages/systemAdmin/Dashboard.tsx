import { useMemo, useState } from 'react'
import { Users, Building2, Activity, Clock, UserPlus, ClipboardList, ChevronRight } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import type { User } from '@/data/mockData'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

const AMBER = '#F59E0B'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SERVICES = [
  { name: 'API Server', status: 'healthy', responseTime: '42ms' },
  { name: 'Database', status: 'healthy', responseTime: '8ms' },
  { name: 'Auth Service', status: 'healthy', responseTime: '15ms' },
  { name: 'Storage', status: 'degraded', responseTime: '210ms' },
  { name: 'Email Service', status: 'healthy', responseTime: '55ms' },
]

function KPI({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color }}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function logTypeBadge(type: string) {
  const map: Record<string, string> = {
    Info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return map[type] ?? 'bg-secondary text-foreground'
}

export default function SystemAdminDashboard({ onNavigate }: DashboardProps) {
  const { users, institutions, auditLogs, addUser, showToast } = useAppContext()

  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [addUserForm, setAddUserForm] = useState<Omit<User, 'id'>>({
    name: '', email: '', role: 'Researcher', institution: '', status: 'Active',
    lastLogin: '', joinDate: new Date().toISOString().slice(0, 10), permissions: [],
  })

  const activeInstitutions = useMemo(() => institutions.filter(i => i.status === 'Active').length, [institutions])
  const pendingApprovals = useMemo(() => users.filter(u => u.status === 'Pending').length, [users])

  const userGrowthData = useMemo(() => {
    const base = Math.max(1, users.length - 11)
    return MONTHS.map((month, i) => ({ month, users: base + i * 2 + Math.floor(Math.random() * 3) }))
  }, [users.length])

  const dailyLoginsData = useMemo(() =>
    DAYS.map(day => ({ day, logins: Math.floor(Math.random() * 60 + 20) })), [])

  const recentLogs = useMemo(() =>
    [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5),
    [auditLogs])

  const handleAddUser = () => {
    if (!addUserForm.name || !addUserForm.email || !addUserForm.role) {
      showToast('Name, email and role are required', 'error')
      return
    }
    addUser(addUserForm)
    showToast('User added successfully', 'success')
    setShowAddUserModal(false)
    setAddUserForm({ name: '', email: '', role: 'Researcher', institution: '', status: 'Active', lastLogin: '', joinDate: new Date().toISOString().slice(0, 10), permissions: [] })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide overview and system health</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowAddUserModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F59E0B' }}>
            <UserPlus size={15} /> Add User
          </button>
          <button onClick={() => onNavigate?.('audit-logs')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <ClipboardList size={15} /> View Logs
          </button>
          <button onClick={() => onNavigate?.('users')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Users size={15} /> View All Users
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI label="Total Users" value={users.length} icon={Users} color={AMBER} />
        <KPI label="Active Institutions" value={activeInstitutions} icon={Building2} color="#10B981" />
        <KPI label="System Uptime" value="99.97%" icon={Activity} color="#2563EB" />
        <KPI label="Pending Approvals" value={pendingApprovals} icon={Clock} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">User Growth (12 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminUserGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke={AMBER} fill="url(#adminUserGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Daily Logins (7 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyLoginsData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="logins" fill={AMBER} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* System health */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">System Health</h2>
            <button onClick={() => onNavigate?.('analytics')} className="flex items-center gap-1 text-xs text-[#F59E0B] hover:underline">
              View Details <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {SERVICES.map(svc => (
              <div key={svc.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${svc.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-sm font-medium text-foreground">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${svc.status === 'healthy' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {svc.status === 'healthy' ? 'Healthy' : 'Degraded'}
                  </span>
                  <span className="text-xs text-muted-foreground">{svc.responseTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit log */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Audit Log</h2>
            <button onClick={() => onNavigate?.('audit-logs')} className="flex items-center gap-1 text-xs text-[#F59E0B] hover:underline">
              View all <ChevronRight size={12} />
            </button>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audit log entries.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${logTypeBadge(log.type)}`}>{log.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium truncate">{log.action}</p>
                    <p className="text-xs text-muted-foreground">{log.user} · {new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Modal open={showAddUserModal} title="Add User" onClose={() => setShowAddUserModal(false)}>
        <div className="space-y-4">
          {[
            { label: 'Full Name', field: 'name', required: true, placeholder: 'Full name' },
            { label: 'Email', field: 'email', required: true, placeholder: 'user@example.com' },
            { label: 'Institution', field: 'institution', placeholder: 'Institution name' },
          ].map(({ label, field, required, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
              <input
                value={(addUserForm as Record<string, unknown>)[field] as string}
                onChange={e => setAddUserForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/40"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Role <span className="text-red-500">*</span></label>
              <select value={addUserForm.role} onChange={e => setAddUserForm(f => ({ ...f, role: e.target.value as User['role'] }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
                {['Researcher', 'Institution Admin', 'Reviewer', 'System Admin'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={addUserForm.status} onChange={e => setAddUserForm(f => ({ ...f, status: e.target.value as User['status'] }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
                <option>Active</option><option>Inactive</option><option>Pending</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleAddUser} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F59E0B' }}>Add User</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
