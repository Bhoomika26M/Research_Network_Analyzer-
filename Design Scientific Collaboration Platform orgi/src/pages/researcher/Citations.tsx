import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAppContext } from '@/contexts/AppContext'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'

export default function Citations() {
  const { citations } = useAppContext()

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'count' | 'year'>('count')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const filtered = useMemo(() => {
    let list = [...citations]
    if (search) list = list.filter(c =>
      c.paperTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.citedBy.toLowerCase().includes(search.toLowerCase())
    )
    list.sort((a, b) => sortBy === 'count' ? b.count - a.count : b.year - a.year)
    return list
  }, [citations, search, sortBy])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Top 10 for chart
  const top10 = [...citations].sort((a, b) => b.count - a.count).slice(0, 10).map(c => ({
    name: c.paperTitle.length > 35 ? c.paperTitle.slice(0, 35) + '…' : c.paperTitle,
    count: c.count,
    full: c.paperTitle,
  }))

  const COLORS = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#6366F1']

  const exportData = filtered.map(c => ({ 'Paper Title': c.paperTitle, 'Cited By': c.citedBy, Journal: c.journal, Year: c.year, Citations: c.count }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Citations</h1>
          <p className="text-muted-foreground text-sm">{citations.length} citation records</p>
        </div>
        <ExportButtons data={exportData} columns={['Paper Title', 'Cited By', 'Journal', 'Year', 'Citations']} filename="citations" title="Citations Report" />
      </div>

      {/* Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Top 10 Cited Papers</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={top10} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={220} />
            <Tooltip
              contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }}
              formatter={(value) => [value, 'Citations']}
              labelFormatter={(label) => top10.find(t => t.name === label)?.full ?? String(label)}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {top10.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search citations..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
          <option value="count">Sort by Count</option>
          <option value="year">Sort by Year</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paper Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cited By</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Journal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Citations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No citations found.</td></tr>
            ) : paginated.map(c => (
              <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground max-w-[240px]"><span className="block truncate" title={c.paperTitle}>{c.paperTitle}</span></td>
                <td className="px-4 py-3 text-muted-foreground max-w-[200px]"><span className="block truncate" title={c.citedBy}>{c.citedBy}</span></td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.journal}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.year}</td>
                <td className="px-4 py-3 font-bold text-foreground">{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border">
          <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
