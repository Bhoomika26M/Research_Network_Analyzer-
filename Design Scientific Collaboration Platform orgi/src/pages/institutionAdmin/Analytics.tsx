import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import ExportButtons from '@/components/shared/ExportButtons'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']

export default function Analytics() {
  const { researchers, publications, projects, departments } = useAppContext()

  const currentYear = new Date().getFullYear()
  const [startYear, setStartYear] = useState(String(currentYear - 3))
  const [endYear, setEndYear] = useState(String(currentYear))

  const filteredPubs = useMemo(() => {
    const sy = parseInt(startYear) || 0
    const ey = parseInt(endYear) || 9999
    return publications.filter(p => p.year >= sy && p.year <= ey)
  }, [publications, startYear, endYear])

  // Researcher growth — 12 month cumulative
  const researcherGrowth = useMemo(() => {
    const base = Math.max(1, researchers.length - 11)
    return MONTHS.map((month, i) => ({ month, researchers: base + i }))
  }, [researchers.length])

  // Publication trend by year
  const pubTrend = useMemo(() => {
    const sy = parseInt(startYear) || currentYear - 3
    const ey = parseInt(endYear) || currentYear
    const map: Record<number, number> = {}
    for (let y = sy; y <= ey; y++) map[y] = 0
    publications.forEach(p => { if (p.year >= sy && p.year <= ey) map[p.year] = (map[p.year] || 0) + 1 })
    return Object.entries(map).map(([year, count]) => ({ year, count }))
  }, [publications, startYear, endYear, currentYear])

  // Publications by department
  const pubsByDept = useMemo(() => departments.map(d => ({
    dept: d.name.length > 14 ? d.name.slice(0, 14) + '…' : d.name,
    publications: d.publications,
  })), [departments])

  // Project status distribution
  const projStatusDist = useMemo(() => {
    const counts: Record<string, number> = { 'On Track': 0, Ahead: 0, 'At Risk': 0, Delayed: 0 }
    projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1 })
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
  }, [projects])

  // KPIs
  const totalPubs = filteredPubs.length
  const avgCitations = filteredPubs.length > 0 ? Math.round(filteredPubs.reduce((a, p) => a + p.citations, 0) / filteredPubs.length) : 0
  const topResearcher = useMemo(() => researchers.reduce((best, r) => r.hIndex > (best?.hIndex ?? -1) ? r : best, researchers[0]), [researchers])
  const activeProjectsPct = projects.length > 0 ? Math.round(projects.filter(p => p.status !== 'Delayed').length / projects.length * 100) : 0

  const exportData = filteredPubs.map(p => ({ Title: p.title, Journal: p.journal, Year: p.year, Type: p.type, Status: p.status, Citations: p.citations }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Institution-wide research insights</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">From</label>
            <input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} placeholder="Year" className="w-24 px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">To</label>
            <input type="number" value={endYear} onChange={e => setEndYear(e.target.value)} placeholder="Year" className="w-24 px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
          </div>
          <ExportButtons data={exportData} columns={['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations']} filename="analytics-export" title="Analytics Data Export" />
        </div>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Publications', value: totalPubs, color: 'text-[#7C3AED]' },
          { label: 'Avg Citations', value: avgCitations, color: 'text-blue-600' },
          { label: 'Top Researcher', value: topResearcher?.name?.split(' ').slice(-1)[0] ?? '—', color: 'text-emerald-600' },
          { label: 'Active Projects', value: `${activeProjectsPct}%`, color: 'text-amber-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Area + Line */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Researcher Growth (12 months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={researcherGrowth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="researchers" stroke="#7C3AED" strokeWidth={2} fill="url(#rGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publication Trend by Year</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pubTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Bar + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publications by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pubsByDept} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dept" tick={{ fontSize: 10 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="publications" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Project Status Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={projStatusDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={false} labelLine={false}>
                {projStatusDist.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
