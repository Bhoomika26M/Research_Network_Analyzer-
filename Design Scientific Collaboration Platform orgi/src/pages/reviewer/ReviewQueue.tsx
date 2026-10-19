import { useState, useMemo } from 'react'
import { Search, CheckCircle, XCircle } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const TEAL = '#14B8A6'

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    High: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }
  return map[priority] ?? 'bg-secondary text-foreground'
}

export default function ReviewQueue() {
  const { reviews, updateReview, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [declineTarget, setDeclineTarget] = useState<string | null>(null)

  const queue = useMemo(() => {
    let data = reviews.filter(r => r.status === 'Pending')
    if (search) data = data.filter(r => r.paperTitle.toLowerCase().includes(search.toLowerCase()) || r.journal.toLowerCase().includes(search.toLowerCase()))
    if (priorityFilter !== 'All') data = data.filter(r => r.priority === priorityFilter)
    return data
  }, [reviews, search, priorityFilter])

  const handleAccept = (id: string) => {
    updateReview(id, { status: 'In Progress' })
    showToast('Review accepted and started', 'success')
  }

  const handleDecline = () => {
    if (!declineTarget) return
    showToast('Review declined', 'warning')
    setDeclineTarget(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Review Queue</h1>
        <p className="text-sm text-muted-foreground mt-1">Papers awaiting your acceptance</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search papers..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Title', 'Journal', 'Priority', 'Submitted Date', 'Keywords', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No papers in queue</td></tr>
              ) : queue.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="font-medium text-foreground truncate">{r.paperTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.journal}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge(r.priority)}`}>{r.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.assignedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex flex-wrap gap-1">
                      {['peer review', r.priority.toLowerCase()].map((kw, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-secondary text-muted-foreground">{kw}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleAccept(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors" style={{ background: TEAL }}>
                        <CheckCircle size={12} /> Accept
                      </button>
                      <button onClick={() => setDeclineTarget(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200 transition-colors">
                        <XCircle size={12} /> Decline
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!declineTarget}
        title="Decline Review"
        message="Are you sure you want to decline this review assignment? It will be reassigned to another reviewer."
        confirmLabel="Decline"
        danger
        onConfirm={handleDecline}
        onCancel={() => setDeclineTarget(null)}
      />
    </div>
  )
}
