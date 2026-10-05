import { useState, useMemo } from 'react'
import { Search, Star, Eye, Play, Send } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'

const TEAL = '#14B8A6'
const PAGE_SIZE = 10

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return map[status] ?? 'bg-secondary text-foreground'
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    High: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }
  return map[priority] ?? 'bg-secondary text-foreground'
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star
            size={24}
            fill={n <= value ? '#F59E0B' : 'none'}
            stroke={n <= value ? '#F59E0B' : '#9CA3AF'}
          />
        </button>
      ))}
    </div>
  )
}

export default function AssignedPapers() {
  const { reviews, publications, updateReview, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [abstractModal, setAbstractModal] = useState<{ open: boolean; title: string; abstract: string }>({ open: false, title: '', abstract: '' })
  const [submitModal, setSubmitModal] = useState<{ open: boolean; id: string; title: string } | null>(null)
  const [score, setScore] = useState(0)
  const [summary, setSummary] = useState('')
  const [detailedFeedback, setDetailedFeedback] = useState('')
  const [recommendation, setRecommendation] = useState('Accept')

  const filtered = useMemo(() => {
    let data = reviews
    if (search) data = data.filter(r => r.paperTitle.toLowerCase().includes(search.toLowerCase()) || r.journal.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All') data = data.filter(r => r.status === statusFilter)
    if (priorityFilter !== 'All') data = data.filter(r => r.priority === priorityFilter)
    return data
  }, [reviews, search, statusFilter, priorityFilter])

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const handleStartReview = (id: string) => {
    updateReview(id, { status: 'In Progress' })
    showToast('Review started', 'success')
  }

  const handleSubmitReview = () => {
    if (!submitModal) return
    if (!summary.trim() || !detailedFeedback.trim()) {
      showToast('Summary and detailed feedback are required', 'error')
      return
    }
    if (score === 0) {
      showToast('Please provide a score', 'error')
      return
    }
    updateReview(submitModal.id, { status: 'Completed', score, feedback: `Summary: ${summary}\n\nDetailed: ${detailedFeedback}\n\nRecommendation: ${recommendation}` })
    showToast('Review submitted successfully', 'success')
    setSubmitModal(null)
    setScore(0)
    setSummary('')
    setDetailedFeedback('')
    setRecommendation('Accept')
  }

  const handleViewAbstract = (paperId: string, title: string) => {
    const pub = publications.find(p => p.id === paperId || p.title === title)
    setAbstractModal({ open: true, title, abstract: pub?.abstract ?? 'Abstract not available.' })
  }

  const exportData = filtered.map(r => ({
    Title: r.paperTitle,
    Journal: r.journal,
    Priority: r.priority,
    'Due Date': r.dueDate,
    Status: r.status,
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assigned Papers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your review assignments</p>
        </div>
        <ExportButtons data={exportData} columns={['Title', 'Journal', 'Priority', 'Due Date', 'Status']} filename="assigned-papers" title="Assigned Papers" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search papers..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Pending', 'In Progress', 'Completed', 'Overdue'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Title', 'Journal', 'Priority', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No papers found</td></tr>
              ) : paginated.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-[280px]">
                    <p className="font-medium text-foreground truncate">{r.paperTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.journal}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge(r.priority)}`}>{r.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewAbstract(r.paperId, r.paperTitle)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="View Abstract">
                        <Eye size={14} />
                      </button>
                      {r.status === 'Pending' && (
                        <button onClick={() => handleStartReview(r.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors" style={{ background: TEAL }} title="Start Review">
                          <Play size={12} /> Start
                        </button>
                      )}
                      {r.status === 'In Progress' && (
                        <button onClick={() => setSubmitModal({ open: true, id: r.id, title: r.paperTitle })} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors" title="Submit Review">
                          <Send size={12} /> Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <Pagination page={page} total={filtered.length} perPage={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      {/* Abstract Modal */}
      <Modal open={abstractModal.open} title={abstractModal.title} onClose={() => setAbstractModal(a => ({ ...a, open: false }))} size="lg">
        <p className="text-sm text-muted-foreground leading-relaxed">{abstractModal.abstract}</p>
      </Modal>

      {/* Submit Review Modal */}
      <Modal open={!!submitModal?.open} title="Submit Review" onClose={() => setSubmitModal(null)} size="lg">
        {submitModal && (
          <div className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Paper</p>
              <p className="text-sm font-medium text-foreground">{submitModal.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Score</label>
              <StarRating value={score} onChange={setScore} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Summary <span className="text-red-500">*</span></label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                rows={3}
                placeholder="Brief summary of the paper..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Detailed Feedback <span className="text-red-500">*</span></label>
              <textarea
                value={detailedFeedback}
                onChange={e => setDetailedFeedback(e.target.value)}
                rows={5}
                placeholder="Detailed comments, strengths, weaknesses..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Recommendation</label>
              <select value={recommendation} onChange={e => setRecommendation(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
                {['Accept', 'Minor Revision', 'Major Revision', 'Reject'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSubmitModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSubmitReview} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: TEAL }}>Submit Review</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
