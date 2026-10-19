import { useState, useMemo } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'

const TYPE_BADGE: Record<string, string> = {
  Info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

export default function AuditLogs() {
  const { auditLogs, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [logs, setLogs] = useState(auditLogs)
  const PER_PAGE = 15

  const filtered = useMemo(() => {
    let list = [...logs]
    if (search) list = list.filter(l => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') list = list.filter(l => l.type === typeFilter)
    if (startDate) list = list.filter(l => new Date(l.timestamp) >= new Date(startDate))
    if (endDate) list = list.filter(l => new Date(l.timestamp) <= new Date(endDate + 'T23:59:59'))
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, search, typeFilter, startDate, endDate])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleClearOld = () => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const before = logs.length
    setLogs(prev => prev.filter(l => new Date(l.timestamp) > cutoff))
    const removed = before - logs.filter(l => new Date(l.timestamp) > cutoff).length
    showToast(`Cleared ${removed} log entries older than 30 days`, 'success')
    setShowClearDialog(false)
  }

  const exportData = filtered.map(l => ({ Timestamp: l.timestamp, User: l.user, Action: l.action, Resource: l.resource, Type: l.type, IP: l.ip, Details: l.details }))

  const formatTime = (ts: string) => {
    try { return new Date(ts).toLocaleString() } catch { return ts }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} log entries</p>
        </div>
        <div className="flex gap-2">
          <ExportButtons data={exportData} columns={['Timestamp', 'User', 'Action', 'Resource', 'Type', 'IP', 'Details']} filename="audit-logs" title="Audit Logs Export" />
          <button onClick={() => setShowClearDialog(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors">
            <Trash2 size={14} /> Clear Old Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs…" className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          <option>Info</option>
          <option>Warning</option>
          <option>Critical</option>
        </select>
        <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Timestamp', 'User', 'Action', 'Resource', 'Type', 'IP', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No audit logs found.</td></tr>
              ) : paginated.map(log => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatTime(log.timestamp)}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap font-medium">{log.user}</td>
                  <td className="px-4 py-3 text-muted-foreground">{log.action}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.resource}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[log.type] || ''}`}>{log.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">{log.ip}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-48 truncate" title={log.details}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      <ConfirmDialog
        open={showClearDialog}
        title="Clear Old Audit Logs"
        message="This will permanently delete all audit log entries older than 30 days. This action cannot be undone."
        confirmLabel="Clear Logs"
        danger
        onConfirm={handleClearOld}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  )
}
