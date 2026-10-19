import { useState, useMemo } from 'react'
import { Search, Download } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Pagination from '@/components/shared/Pagination'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const PAGE_SIZE = 15

function typeBadge(type: string) {
  const map: Record<string, string> = {
    Info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return map[type] ?? 'bg-secondary text-foreground'
}

export default function AdminAuditLogs() {
  const { auditLogs, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [clearOpen, setClearOpen] = useState(false)
  const [clearConfirm2, setClearConfirm2] = useState(false)

  // Local clearable state
  const [cleared, setCleared] = useState(false)

  const logs = cleared ? [] : auditLogs

  const filtered = useMemo(() => {
    let data = logs
    if (search) data = data.filter(l => l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') data = data.filter(l => l.type === typeFilter)
    return [...data].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [logs, search, typeFilter])

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const handleExportAll = () => {
    try {
      const rows = filtered.map(l => ({
        User: l.user, Action: l.action, Resource: l.resource,
        Type: l.type, Timestamp: l.timestamp, IP: l.ip, Details: l.details,
      }))
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs')
      XLSX.writeFile(wb, 'audit-logs.xlsx')
      showToast('Audit logs exported', 'success')
    } catch {
      showToast('Export failed', 'error')
    }
  }

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Audit Logs', 14, 20)
      autoTable(doc, {
        head: [['User', 'Action', 'Type', 'Timestamp', 'IP']],
        body: filtered.map(l => [l.user, l.action, l.type, new Date(l.timestamp).toLocaleString(), l.ip]),
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] },
      })
      doc.save('audit-logs.pdf')
      showToast('PDF exported', 'success')
    } catch {
      showToast('Export failed', 'error')
    }
  }

  const handleClearConfirm1 = () => { setClearOpen(false); setClearConfirm2(true) }
  const handleClearConfirm2 = () => { setCleared(true); showToast('All audit logs cleared', 'warning'); setClearConfirm2(false) }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete platform activity history</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">
            <Download size={14} /> Export Excel
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">
            <Download size={14} /> Export PDF
          </button>
          <button onClick={() => setClearOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
            Clear All Logs
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Info', 'Warning', 'Critical'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Type', 'User', 'Action', 'Resource', 'Timestamp', 'IP'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No audit logs found</td></tr>
              ) : paginated.map(log => (
                <tr key={log.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(log.type)}`}>{log.type}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{log.user}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px]"><p className="truncate">{log.action}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{log.resource}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <Pagination page={page} total={filtered.length} perPage={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      <ConfirmDialog
        open={clearOpen}
        title="Clear All Logs"
        message="Are you sure you want to clear all audit logs? This action is permanent and cannot be undone."
        confirmLabel="Yes, Clear Logs"
        danger
        onConfirm={handleClearConfirm1}
        onCancel={() => setClearOpen(false)}
      />
      <ConfirmDialog
        open={clearConfirm2}
        title="Confirm Clear All Logs"
        message="This is your final warning. All audit logs will be permanently deleted. Are you absolutely sure?"
        confirmLabel="Permanently Delete All"
        danger
        onConfirm={handleClearConfirm2}
        onCancel={() => setClearConfirm2(false)}
      />
    </div>
  )
}
