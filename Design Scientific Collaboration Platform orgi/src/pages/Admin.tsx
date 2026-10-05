import { useState } from 'react'
import { Users, Building2, Shield, Activity, AlertTriangle, CheckCircle2, Clock, Settings, Search, MoreVertical, Trash2, Edit3, Eye } from 'lucide-react'

const users = [
  { id: 1, name: 'Dr. Sarah Chen', email: 'sarah.chen@mit.edu', role: 'Admin', institution: 'MIT', status: 'Active', lastLogin: '2 min ago', joined: 'Mar 2022' },
  { id: 2, name: 'Prof. James Okafor', email: 'j.okafor@cam.ac.uk', role: 'Researcher', institution: 'Cambridge', status: 'Active', lastLogin: '1 hr ago', joined: 'Jan 2023' },
  { id: 3, name: 'Dr. Priya Sharma', email: 'p.sharma@nih.gov', role: 'Moderator', institution: 'NIH', status: 'Active', lastLogin: '3 hr ago', joined: 'Jun 2022' },
  { id: 4, name: 'Dr. Yuki Tanaka', email: 'y.tanaka@caltech.edu', role: 'Researcher', institution: 'Caltech', status: 'Inactive', lastLogin: '5 days ago', joined: 'Sep 2023' },
  { id: 5, name: 'Prof. Hans Müller', email: 'h.muller@ethz.ch', role: 'Researcher', institution: 'ETH', status: 'Active', lastLogin: '1 day ago', joined: 'Dec 2021' },
]

const activityLogs = [
  { icon: Users, color: '#10B981', action: 'New researcher registered', user: 'Dr. Liu Wei (Peking University)', time: '4 min ago' },
  { icon: CheckCircle2, color: '#2563EB', action: 'Publication approved', user: 'Quantum ML paper by Chen et al.', time: '18 min ago' },
  { icon: Building2, color: '#7C3AED', action: 'Institution added', user: 'Seoul National University onboarded', time: '1 hr ago' },
  { icon: AlertTriangle, color: '#F59E0B', action: 'Duplicate DOI flagged', user: '10.1038/s41586-2024-0001 conflict', time: '2 hr ago' },
  { icon: Shield, color: '#EC4899', action: 'Security alert resolved', user: 'Failed login attempts blocked (IP: 203.0.113.x)', time: '4 hr ago' },
  { icon: Settings, color: '#94A3B8', action: 'System backup completed', user: 'Full database snapshot — 2.4TB', time: '6 hr ago' },
]

const systemStats = [
  { label: 'Total Users', value: '48,291', sub: '↑ 234 this week', color: '#2563EB' },
  { label: 'Active Sessions', value: '1,847', sub: 'right now', color: '#10B981' },
  { label: 'Pending Reviews', value: '142', sub: 'publications', color: '#F59E0B' },
  { label: 'Storage Used', value: '18.4 TB', sub: '74% of quota', color: '#7C3AED' },
]

const roleColors: Record<string, { bg: string; text: string }> = {
  Admin: { bg: '#EFF6FF', text: '#2563EB' },
  Moderator: { bg: '#F5F3FF', text: '#7C3AED' },
  Researcher: { bg: '#F8FAFC', text: '#64748B' },
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: '#ECFDF5', text: '#10B981' },
  Inactive: { bg: '#FEF2F2', text: '#EF4444' },
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'users' | 'institutions' | 'logs' | 'security'>('users')
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<number | null>(null)

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.institution.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* System stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {systemStats.map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
            <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold text-foreground mb-0.5">{s.label}</p>
            <p className="text-xs text-muted-foreground/70">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-2xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full bg-background border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              <Users className="w-4 h-4" /> Invite User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['User', 'Role', 'Institution', 'Status', 'Last Active', 'Joined', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(user => {
                  const rc = roleColors[user.role]
                  const sc = statusColors[user.status]
                  return (
                    <tr key={user.id} className="hover:bg-secondary/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {user.name.split(' ').map(w => w[0]).slice(1, 3).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: rc.bg, color: rc.text }}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground/80">{user.institution}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />{user.lastLogin}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground">{user.joined}</span>
                      </td>
                      <td className="px-6 py-4 relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {openMenu === user.id && (
                          <div className="absolute right-6 top-12 w-40 bg-card rounded-xl border border-border shadow-xl shadow-black/10 dark:shadow-black/30 z-10 overflow-hidden">
                            {[
                              { label: 'View Profile', icon: Eye },
                              { label: 'Edit User', icon: Edit3 },
                              { label: 'Deactivate', icon: Trash2, danger: true },
                            ].map(action => (
                              <button
                                key={action.label}
                                onClick={() => setOpenMenu(null)}
                                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors ${
                                  action.danger ? 'text-red-500 hover:bg-red-500/10' : 'text-foreground/80 hover:bg-secondary/60'
                                }`}
                              >
                                <action.icon className="w-3.5 h-3.5" />
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity Logs tab */}
      {activeTab === 'logs' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">System Activity Log</h3>
            <button className="text-xs text-primary font-medium">Export logs</button>
          </div>
          <div className="divide-y divide-border">
            {activityLogs.map((log, i) => (
              <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-secondary/60 transition-colors">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: log.color + '15' }}>
                  <log.icon className="w-4 h-4" style={{ color: log.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{log.user}</p>
                </div>
                <span className="text-xs text-muted-foreground/70 flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Security Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Two-factor auth enabled', value: '94%', status: 'good' },
                { label: 'Failed logins (24h)', value: '23', status: 'warn' },
                { label: 'Blocked IPs', value: '7', status: 'warn' },
                { label: 'Active API tokens', value: '184', status: 'good' },
                { label: 'Last full audit', value: '2024-11-01', status: 'good' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    {item.status === 'good'
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    }
                    <span className="text-sm text-foreground/80">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${item.status === 'good' ? 'text-foreground' : 'text-amber-500'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Security Settings</h3>
            <div className="space-y-4">
              {[
                { label: 'Enforce 2FA for all users', desc: 'Require two-factor authentication', enabled: true },
                { label: 'Auto-lock inactive sessions', desc: 'Lock after 30 minutes of inactivity', enabled: true },
                { label: 'IP allowlisting', desc: 'Restrict access to approved IPs only', enabled: false },
                { label: 'Audit trail logging', desc: 'Log all user actions to immutable store', enabled: true },
              ].map(setting => (
                <div key={setting.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{setting.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                  </div>
                  <button className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${setting.enabled ? 'bg-primary' : 'bg-secondary'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Institutions tab */}
      {activeTab === 'institutions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'MIT', country: 'USA', users: 8420, type: 'University', tier: 'Platinum' },
            { name: 'Stanford University', country: 'USA', users: 7890, type: 'University', tier: 'Platinum' },
            { name: 'University of Oxford', country: 'UK', users: 6340, type: 'University', tier: 'Gold' },
            { name: 'ETH Zürich', country: 'Switzerland', users: 5120, type: 'University', tier: 'Gold' },
            { name: 'NIH', country: 'USA', users: 4230, type: 'Government', tier: 'Gold' },
            { name: 'Caltech', country: 'USA', users: 3780, type: 'University', tier: 'Silver' },
          ].map(inst => (
            <div key={inst.name} className="bg-card rounded-2xl border border-border p-5 card-hover cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  inst.tier === 'Platinum' ? 'bg-primary/10 text-primary' :
                  inst.tier === 'Gold' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-secondary text-muted-foreground'
                }`}>{inst.tier}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{inst.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{inst.country} · {inst.type}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{inst.users.toLocaleString()} users</span>
                <button className="text-xs text-primary font-medium hover:text-primary/80">Manage →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
