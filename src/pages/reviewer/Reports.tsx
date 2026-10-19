import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import ExportButtons from '@/components/shared/ExportButtons'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function Stars({ value }: { value: number | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">N/A</span>
  return <span className="text-sm">{'★'.repeat(value)}{'☆'.repeat(5 - value)}</span>
}

type Tab = 'summary' | 'completed' | 'overdue'

export default function ReviewerReports() {
  const { reviews } = useAppContext()
  const [tab, setTab] = useState<Tab>('summary')

  const stats = useMemo(() => {
    const total = reviews.length
    const completed = reviews.filter(r => r.status === 'Completed')
    const overdue = reviews.filter(r => r.status === 'Overdue')
    const avgScore = completed.length
      ? (completed.reduce((s, r) => s + (r.score ?? 0), 0) / completed.length).toFixed(1)
      : 'N/A'
    const completionRate = total ? Math.round((completed.length / total) * 100) : 0
    return { total, completedCount: completed.length, overdueCount: overdue.length, avgScore, completionRate }
  }, [reviews])

  const monthlyData = useMemo(() =>
    MONTHS.map((month, i) => ({
      month,
      completed: i < 8 ? Math.floor(Math.random() * 5 + 1) : 0,
      assigned: i < 8 ? Math.floor(Math.random() * 7 + 2) : 0,
    })), [])

  const completedReviews = useMemo(() => reviews.filter(r => r.status === 'Completed'), [reviews])
  const overdueReviews = useMemo(() => reviews.filter(r => r.status === 'Overdue'), [reviews])

  const summaryExport = reviews.map(r => ({
    Title: r.paperTitle,
    Journal: r.journal,
    Status: r.status,
    Priority: r.priority,
    'Due Date': r.dueDate,
    Score: r.score ?? 'N/A',
  }))

  const completedExport = completedReviews.map(r => ({
    Title: r.paperTitle,
    Journal: r.journal,
    'Due Date': r.dueDate,
    Score: r.score ?? 'N/A',
  }))

  const overdueExport = overdueReviews.map(r => ({
    Title: r.paperTitle,
    Journal: r.journal,
    'Due Date': r.dueDate,
    Priority: r.priority,
  }))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Your review performance and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned', value: stats.total },
          { label: 'Completed', value: stats.completedCount },
          { label: 'Avg Score', value: stats.avgScore },
          { label: 'Completion Rate', value: `${stats.completionRate}%` },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly performance chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Monthly Performance</h2>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--border)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
            <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="completed" stroke="#14B8A6" strokeWidth={2} dot={false} name="Completed" />
            <Line type="monotone" dataKey="assigned" stroke="#2563EB" strokeWidth={2} dot={false} name="Assigned" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {([['summary', 'Review Summary'], ['completed', 'Completed Reviews'], ['overdue', 'Overdue Reviews']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-[#14B8A6] text-[#14B8A6]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportButtons data={summaryExport} columns={['Title', 'Journal', 'Status', 'Priority', 'Due Date', 'Score']} filename="review-summary" title="Review Summary" />
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>
                    {['Title', 'Journal', 'Status', 'Priority', 'Due Date', 'Score'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 max-w-[220px]"><p className="truncate font-medium text-foreground">{r.paperTitle}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.journal}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : r.status === 'Overdue' ? 'bg-red-100 text-red-700' : r.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.priority}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Stars value={r.score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'completed' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportButtons data={completedExport} columns={['Title', 'Journal', 'Due Date', 'Score']} filename="completed-reviews" title="Completed Reviews" />
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>
                    {['Title', 'Journal', 'Date', 'Score'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {completedReviews.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No completed reviews</td></tr>
                  ) : completedReviews.map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 max-w-[260px]"><p className="truncate font-medium text-foreground">{r.paperTitle}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.journal}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3"><Stars value={r.score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'overdue' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <ExportButtons data={overdueExport} columns={['Title', 'Journal', 'Due Date', 'Priority']} filename="overdue-reviews" title="Overdue Reviews" />
          </div>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-secondary/50">
                  <tr>
                    {['Title', 'Journal', 'Due Date', 'Priority'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overdueReviews.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No overdue reviews</td></tr>
                  ) : overdueReviews.map(r => (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-4 py-3 max-w-[260px]"><p className="truncate font-medium text-foreground">{r.paperTitle}</p></td>
                      <td className="px-4 py-3 text-muted-foreground">{r.journal}</td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400">{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.priority}</td>
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
