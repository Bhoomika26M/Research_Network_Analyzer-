import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import ExportButtons from '@/components/shared/ExportButtons'

type Tab = 'users' | 'institutions' | 'publications' | 'system'

function roleBadge(role: string) {
  const map: Record<string, string> = {
    Researcher: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Institution Admin': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Reviewer: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'System Admin': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }
  return map[role] ?? 'bg-secondary text-foreground'
}

function logTypeBadge(type: string) {
  const map: Record<string, string> = {
    Info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return map[type] ?? 'bg-secondary text-foreground'
}

export default function AdminReports() {
  const { users, institutions, publications, auditLogs } = useAppContext()
  const [tab, setTab] = useState<Tab>('users')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredUsers = useMemo(() => {
    if (!dateFrom && !dateTo) return users
    return users.filter(u => {
      const d = new Date(u.joinDate)
      if (dateFrom && d < new Date(dateFrom)) return false
      if (dateTo && d > new Date(dateTo)) return false
      return true
    })
  }, [users, dateFrom, dateTo])

  const filteredLogs = useMemo(() => {
    if (!dateFrom && !dateTo) return auditLogs
    return auditLogs.filter(l => {
      const d = new Date(l.timestamp)
      if (dateFrom && d < new Date(dateFrom)) return false
      if (dateTo && d > new Date(dateTo)) return false
      return true
    })
  }, [auditLogs, dateFrom, dateTo])

  const userExport = filteredUsers.map(u => ({ Name: u.name, Email: u.email, Role: u.role, Institution: u.institution, Status: u.status, 'Join Date': u.joinDate, 'Last Login': u.lastLogin }))
  const instExport = institutions.map(i => ({ Name: i.name, Country: i.country, Type: i.type, Researchers: i.researchers, Projects: i.projects, Status: i.status }))
  const pubExport = publications.map(p => ({ Title: p.title, Journal: p.journal, Year: p.year, Type: p.type, Status: p.status, Citations: p.citations }))
  const logExport = filteredLogs.map(l => ({ User: l.user, Action: l.action, Resource: l.resource, Type: l.type, Timestamp: l.timestamp, IP: l.ip }))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform-wide reports and analytics</p>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-sm text-muted-foreground">Date range:</span>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none" />
        <span className="text-sm text-muted-foreground">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none" />
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo('') }} className="px-3 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Clear</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {([['users', 'User Report'], ['institutions', 'Institution Report'], ['publications', 'Publication Report'], ['system', 'System Report']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-[#F59E0B] text-[#F59E0B]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{label}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex justify-end"><ExportButtons data={userExport} columns={['Name', 'Email', 'Role', 'Institution', 'Status', 'Join Date', 'Last Login']} filename="user-report" title="User Report" /></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>{['Name', 'Email', 'Role', 'Institution', 'Status', 'Join Date', 'Last Login'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span></td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[140px]"><p className="truncate">{u.institution}</p></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{u.status}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{u.joinDate}</td>
                      <td className="px-4 py-3 text-muted-foreground">{u.lastLogin || 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'institutions' && (
        <div className="space-y-3">
          <div className="flex justify-end"><ExportButtons data={instExport} columns={['Name', 'Country', 'Type', 'Researchers', 'Projects', 'Status']} filename="institution-report" title="Institution Report" /></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>{['Name', 'Country', 'Type', 'Researchers', 'Projects', 'Budget', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {institutions.map(i => (
                    <tr key={i.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[180px]"><p className="truncate">{i.name}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{i.country}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.researchers}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.projects}</td>
                      <td className="px-4 py-3 text-muted-foreground">${(i.budget / 1e6).toFixed(1)}M</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${i.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'publications' && (
        <div className="space-y-3">
          <div className="flex justify-end"><ExportButtons data={pubExport} columns={['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations']} filename="publication-report" title="Publication Report" /></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>{['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {publications.map(p => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 max-w-[220px]"><p className="font-medium text-foreground truncate">{p.title}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.journal}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.year}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : p.status === 'Submitted' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{p.status}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.citations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'system' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Total Logs', value: filteredLogs.length },
              { label: 'Warnings', value: filteredLogs.filter(l => l.type === 'Warning').length },
              { label: 'Critical', value: filteredLogs.filter(l => l.type === 'Critical').length },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end"><ExportButtons data={logExport} columns={['User', 'Action', 'Resource', 'Type', 'Timestamp', 'IP']} filename="system-report" title="System Report" /></div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>{['User', 'Action', 'Resource', 'Type', 'Timestamp', 'IP'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 50).map(l => (
                    <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[180px]"><p className="truncate">{l.action}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{l.resource}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${logTypeBadge(l.type)}`}>{l.type}</span></td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
