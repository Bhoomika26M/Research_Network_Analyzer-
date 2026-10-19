import { useState, useMemo } from 'react'
import { Search, Calendar, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'

function daysUntil(dateStr: string): number {
  const now = new Date()
  const due = new Date(dateStr)
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24))
}

function daysColor(days: number) {
  if (days < 3) return 'text-red-600 dark:text-red-400'
  if (days < 7) return 'text-amber-600 dark:text-amber-400'
  return 'text-emerald-600 dark:text-emerald-400'
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    High: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }
  return map[priority] ?? 'bg-secondary text-foreground'
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return map[status] ?? 'bg-secondary text-foreground'
}

export default function Deadlines() {
  const { reviews, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [extModal, setExtModal] = useState<{ open: boolean; id: string; title: string } | null>(null)
  const [newDate, setNewDate] = useState('')
  const [reason, setReason] = useState('')

  const filtered = useMemo(() => {
    let data = reviews.filter(r => r.status !== 'Completed')
    if (search) data = data.filter(r => r.paperTitle.toLowerCase().includes(search.toLowerCase()))
    return data
  }, [reviews, search])

  const grouped = useMemo(() => {
    const now = new Date()
    const endOfThisWeek = new Date(now); endOfThisWeek.setDate(now.getDate() + 7)
    const endOfNextWeek = new Date(now); endOfNextWeek.setDate(now.getDate() + 14)

    const thisWeek = filtered.filter(r => new Date(r.dueDate) <= endOfThisWeek)
    const nextWeek = filtered.filter(r => new Date(r.dueDate) > endOfThisWeek && new Date(r.dueDate) <= endOfNextWeek)
    const later = filtered.filter(r => new Date(r.dueDate) > endOfNextWeek)
    return { thisWeek, nextWeek, later }
  }, [filtered])

  const handleRequestExtension = () => {
    if (!newDate || !reason.trim()) {
      showToast('Please provide a new date and reason', 'error')
      return
    }
    showToast('Extension request submitted', 'success')
    setExtModal(null)
    setNewDate('')
    setReason('')
  }

  const renderGroup = (label: string, items: typeof filtered) => {
    if (items.length === 0) return null
    return (
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{label} ({items.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(r => {
            const days = daysUntil(r.dueDate)
            return (
              <div key={r.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground leading-snug flex-1">{r.paperTitle}</p>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge(r.priority)}`}>{r.priority}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.journal}</p>
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Due: {new Date(r.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} className={daysColor(days)} />
                  <span className={`text-xs font-semibold ${daysColor(days)}`}>
                    {days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days remaining`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{r.status}</span>
                  <button
                    onClick={() => setExtModal({ open: true, id: r.id, title: r.paperTitle })}
                    className="text-xs text-[#14B8A6] hover:underline font-medium"
                  >
                    Request Extension
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Deadlines</h1>
        <p className="text-sm text-muted-foreground mt-1">Upcoming review deadlines grouped by week</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search papers..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
        />
      </div>

      <div className="space-y-8">
        {renderGroup('This Week', grouped.thisWeek)}
        {renderGroup('Next Week', grouped.nextWeek)}
        {renderGroup('Later', grouped.later)}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No pending deadlines</p>
        )}
      </div>

      <Modal open={!!extModal?.open} title="Request Extension" onClose={() => setExtModal(null)} size="sm">
        {extModal && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">{extModal.title}</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">New Due Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Explain why you need an extension..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6] resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setExtModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleRequestExtension} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#14B8A6' }}>Submit Request</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
