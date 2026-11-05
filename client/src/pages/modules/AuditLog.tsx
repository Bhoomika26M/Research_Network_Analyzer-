import { useState } from 'react'
import * as XLSX from 'xlsx'
import { AuditLog as AuditLogEntry } from '../../types/index'
import { useAuditLogs } from '../../services/auditLogs'
import { hasPermission } from '../../permissions/config'
import type { SessionUser } from '../../types/index'
import Drawer from '../../layout/Drawer'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const categoryColors: Record<string, string> = {
  Auth: 'bg-red-50 text-red-700',
  Data: 'bg-blue-50 text-blue-700',
  Admin: 'bg-violet-50 text-violet-700',
  Export: 'bg-emerald-50 text-emerald-700',
}

const categoryDot: Record<string, string> = {
  Auth: 'bg-red-500',
  Data: 'bg-blue-500',
  Admin: 'bg-violet-500',
  Export: 'bg-emerald-500',
}

function AuditDrawerContent({ log, onFlag }: { log: AuditLogEntry; onFlag: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {log.actor === 'System' || log.actor === 'Security System' ? '⚙' : log.actor.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{log.actor}</p>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[log.category]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${categoryDot[log.category]}`}></span>
            {log.category}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border/60">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Action</p>
        <p className="text-sm text-foreground leading-relaxed">{log.action}</p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1.5">Target Resource</p>
        <p className="text-sm text-primary font-medium">{log.target}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Timestamp</p>
          <p className="text-sm font-mono text-foreground">{log.timestamp}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">IP Address</p>
          <p className="text-sm font-mono text-foreground">{log.ip}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-border/60">
        <button
          onClick={onFlag}
          className="w-full py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          🚩 Flag Event for Review
        </button>
      </div>
    </div>
  )
}

export default function AuditLog({ user }: { user?: SessionUser }) {
  const { showToast } = useToast()

  // Connect live API hook
  const { data: apiLogs } = useAuditLogs()
  const activeLogs = apiLogs || []

  if (!hasPermission(user, 'analytics.viewAuditLogs')) {
    return (
      <div className="p-8 flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-3xl">🔒</div>
        <h2 className="font-display font-bold text-xl text-foreground mb-2">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">You don&apos;t have permission to view audit logs.</p>
        <p className="text-xs text-muted-foreground/80 mt-1">Contact your System Administrator for access.</p>
      </div>
    )
  }
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [search, setSearch] = useState('')

  const filtered = activeLogs.filter((l) => {
    const catMatch = activeFilter === 'All' || l.category === activeFilter
    const searchMatch = search === '' ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.target.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  const filters = ['All', 'Auth', 'Data', 'Admin', 'Export']

  const handleExport = () => {
    const data = filtered.map(l => ({
      Timestamp: l.timestamp,
      Actor: l.actor,
      Action: l.action,
      Target: l.target,
      Category: l.category,
      IP: l.ip,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Log')
    XLSX.writeFile(wb, `audit-log-${new Date().toISOString().split('T')[0]}.xlsx`)
    showToast(`Audit log exported (${filtered.length} events)`, 'success')
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">08 — Audit</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">Audit Log</h1>
            <p className="text-muted-foreground mt-1">Complete activity history with actor, action, and timestamp</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v7M4 7l3 3 3-3M2 11v1a1 1 0 001 1h8a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export Logs
          </button>
        </div>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Events', value: activeLogs.length.toString(), color: 'text-foreground' },
          { label: 'Auth Events', value: activeLogs.filter(l => l.category === 'Auth').length.toString(), color: 'text-red-600' },
          { label: 'Data Events', value: activeLogs.filter(l => l.category === 'Data').length.toString(), color: 'text-blue-600' },
          { label: 'Unique Actors', value: String(new Set(activeLogs.map(l => l.actor)).size), color: 'text-foreground' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4">
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-secondary p-1 rounded-xl w-fit">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeFilter === f ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log table */}
      <div className="bg-card rounded-2xl border border-border">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="8" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter events by actor, action, or target..."
              className="pl-8 pr-4 py-2 bg-secondary rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0052FF] w-72"
            />
          </div>
          {(search || activeFilter !== 'All') && (
            <p className="text-xs text-muted-foreground">{filtered.length} of {activeLogs.length} events</p>
          )}
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60">
              {['Timestamp', 'Actor', 'Action', 'Target', 'Category'].map(col => (
                <th key={col} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground font-mono uppercase tracking-wide">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="border-b border-border/60 last:border-0 transition-colors hover:bg-background cursor-pointer"
              >
                <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                      {log.actor === 'System' || log.actor === 'Security System' ? '⚙' : log.actor.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-xs text-foreground font-medium whitespace-nowrap">{log.actor}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-xs">{log.action.slice(0, 70)}{log.action.length > 70 ? '…' : ''}</td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[140px] truncate">{log.target}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${categoryColors[log.category]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${categoryDot[log.category]}`}></span>
                    {log.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8">
            <EmptyState icon="🛡️" title="No audit events found" subtitle="Try adjusting your search or category filter" />
          </div>
        )}
      </div>

      <Drawer
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details"
      >
        {selectedLog && (
          <AuditDrawerContent
            log={selectedLog}
            onFlag={() => showToast('Event flagged for review', 'success')}
          />
        )}
      </Drawer>
    </div>
  )
}

