import { useState, useMemo } from 'react'
import { Search, Star, Eye } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PAGE_SIZE = 10

function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">N/A</span>
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={13} fill={n <= value ? '#F59E0B' : 'none'} stroke={n <= value ? '#F59E0B' : '#9CA3AF'} />
      ))}
    </div>
  )
}

export default function ReviewHistory() {
  const { reviews } = useAppContext()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [page, setPage] = useState(1)
  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; title: string; feedback: string } | null>(null)

  const completed = useMemo(() => {
    let data = reviews.filter(r => r.status === 'Completed')
    if (search) data = data.filter(r => r.paperTitle.toLowerCase().includes(search.toLowerCase()))
    if (sortBy === 'date') data = [...data].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
    if (sortBy === 'score') data = [...data].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    return data
  }, [reviews, search, sortBy])

  const paginated = useMemo(() => completed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [completed, page])

  const scoreDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    completed.forEach(r => { if (r.score) counts[r.score - 1]++ })
    return counts.map((count, i) => ({ score: `${i + 1}★`, count }))
  }, [completed])

  const exportData = completed.map(r => ({
    Title: r.paperTitle,
    Journal: r.journal,
    'Due Date': r.dueDate,
    Score: r.score ?? 'N/A',
    Recommendation: r.feedback?.split('Recommendation: ')[1] ?? '',
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Review History</h1>
          <p className="text-sm text-muted-foreground mt-1">All completed reviews</p>
        </div>
        <ExportButtons data={exportData} columns={['Title', 'Journal', 'Due Date', 'Score', 'Recommendation']} filename="review-history" title="Review History" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Score Distribution</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={scoreDistribution} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="score" tick={{ fontSize: 11 }} stroke="var(--border)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search reviews..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          <option value="date">Sort by Date</option>
          <option value="score">Sort by Score</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Title', 'Journal', 'Date Submitted', 'Score', 'Recommendation', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No completed reviews</td></tr>
              ) : paginated.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-[260px]">
                    <p className="font-medium text-foreground truncate">{r.paperTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.journal}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(r.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><Stars value={r.score} /></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {r.feedback?.split('Recommendation: ')[1] ?? 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setFeedbackModal({ open: true, title: r.paperTitle, feedback: r.feedback ?? 'No feedback provided.' })}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="View Feedback"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <Pagination page={page} total={completed.length} perPage={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      <Modal open={!!feedbackModal?.open} title={feedbackModal?.title ?? ''} onClose={() => setFeedbackModal(null)} size="lg">
        <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{feedbackModal?.feedback}</pre>
      </Modal>
    </div>
  )
}
