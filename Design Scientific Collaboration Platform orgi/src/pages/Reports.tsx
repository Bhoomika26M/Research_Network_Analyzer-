import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Download, FileSpreadsheet, FileText, TrendingUp, Filter, Calendar } from 'lucide-react'

const yearlyOutput = [
  { year: '2019', papers: 287, patents: 12, books: 4 },
  { year: '2020', papers: 312, patents: 15, books: 6 },
  { year: '2021', papers: 398, patents: 18, books: 8 },
  { year: '2022', papers: 445, patents: 22, books: 7 },
  { year: '2023', papers: 512, patents: 28, books: 11 },
  { year: '2024', papers: 601, patents: 34, books: 9 },
]

const colStats = [
  { month: 'Jan', domestic: 45, international: 28 },
  { month: 'Feb', domestic: 52, international: 34 },
  { month: 'Mar', domestic: 61, international: 42 },
  { month: 'Apr', domestic: 58, international: 38 },
  { month: 'May', domestic: 74, international: 51 },
  { month: 'Jun', domestic: 82, international: 63 },
]

const radarData = [
  { subject: 'Publications', MIT: 92, Stanford: 88, Oxford: 79 },
  { subject: 'Citations', MIT: 87, Stanford: 91, Oxford: 74 },
  { subject: 'H-index', MIT: 84, Stanford: 86, Oxford: 82 },
  { subject: 'Collaborations', MIT: 78, Stanford: 72, Oxford: 89 },
  { subject: 'Grants', MIT: 95, Stanford: 83, Oxford: 71 },
  { subject: 'Impact', MIT: 89, Stanford: 94, Oxford: 76 },
]

const topResearchers = [
  { name: 'Dr. Priya Sharma', institution: 'NIH', hIndex: 55, papers: 231, citations: 14320 },
  { name: 'Dr. Sarah Chen', institution: 'MIT', hIndex: 42, papers: 187, citations: 8921 },
  { name: 'Prof. Hans Müller', institution: 'ETH', hIndex: 47, papers: 198, citations: 11203 },
  { name: 'Prof. James Okafor', institution: 'Cambridge', hIndex: 38, papers: 143, citations: 6742 },
  { name: 'Dr. Lena García', institution: 'Stanford', hIndex: 36, papers: 156, citations: 7821 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg shadow-black/10 dark:shadow-black/30">
        <p className="text-xs font-semibold text-foreground/80 mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Reports() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <select className="text-sm border border-border bg-card text-foreground rounded-xl px-3 py-2.5 outline-none">
            <option>2024 Annual Report</option>
            <option>2023 Annual Report</option>
            <option>Q3 2024</option>
          </select>
          <select className="text-sm border border-border bg-card text-foreground rounded-xl px-3 py-2.5 outline-none">
            <option>All Institutions</option>
            <option>MIT</option>
            <option>Stanford</option>
          </select>
          <button className="flex items-center gap-1.5 border border-border bg-card rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <button className="flex items-center gap-2 border border-border bg-card text-foreground/80 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-secondary/60 transition-colors">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            Export Excel
          </button>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Output', value: '3,847', sub: 'publications in 2024', color: '#2563EB' },
          { label: 'Growth Rate', value: '+17.4%', sub: 'vs previous year', color: '#10B981' },
          { label: 'Avg Impact Factor', value: '28.6', sub: 'across all journals', color: '#7C3AED' },
          { label: 'Grant Revenue', value: '$284M', sub: 'research funding 2024', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-5">
            <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-semibold text-foreground mb-0.5">{s.label}</p>
            <p className="text-xs text-muted-foreground/70">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Annual Research Output</h3>
              <p className="text-xs text-muted-foreground">Publications, patents, and books</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yearlyOutput}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B820" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="papers" name="Papers" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="patents" name="Patents" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="books" name="Books" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Institution Comparison</h3>
          <p className="text-xs text-muted-foreground mb-4">Research performance radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#94A3B820" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Radar name="MIT" dataKey="MIT" stroke="#2563EB" fill="#2563EB" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Stanford" dataKey="Stanford" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Oxford" dataKey="Oxford" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collaboration trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Collaboration Statistics</h3>
          <p className="text-xs text-muted-foreground mb-5">Domestic vs international partnerships</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={colStats}>
              <defs>
                <linearGradient id="domGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B820" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="domestic" name="Domestic" stroke="#2563EB" strokeWidth={2} fill="url(#domGrad)" />
              <Area type="monotone" dataKey="international" name="International" stroke="#14B8A6" strokeWidth={2} fill="url(#intGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top researchers table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Top Researchers by Impact</h3>
          </div>
          <div className="divide-y divide-border">
            {topResearchers.map((r, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4 hover:bg-secondary/60 transition-colors">
                <span className="text-sm font-bold text-muted-foreground/30 w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.institution}</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-right">
                  <div>
                    <p className="text-xs font-bold text-foreground">{r.hIndex}</p>
                    <p className="text-xs text-muted-foreground/70">h</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{r.papers}</p>
                    <p className="text-xs text-muted-foreground/70">papers</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{(r.citations / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-muted-foreground/70">cites</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
