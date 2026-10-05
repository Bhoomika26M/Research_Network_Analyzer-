import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Quote, TrendingUp, Star, ExternalLink, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

const citationTimeline = [
  { year: '2018', citations: 12 },
  { year: '2019', citations: 34 },
  { year: '2020', citations: 67 },
  { year: '2021', citations: 128 },
  { year: '2022', citations: 241 },
  { year: '2023', citations: 389 },
  { year: '2024', citations: 521 },
]

const topCited = [
  { title: 'Deep Learning for Protein Structure', citations: 2341, year: 2022, journal: 'Nature', doi: '10.1038/s41586-2022-001' },
  { title: 'CRISPR-Cas9 Gene Editing Review', citations: 1892, year: 2021, journal: 'Cell', doi: '10.1016/j.cell.2021.001' },
  { title: 'Transformer Models in Genomics', citations: 1456, year: 2023, journal: 'Science', doi: '10.1126/science.2023.001' },
  { title: 'Quantum ML Drug Discovery', citations: 987, year: 2024, journal: 'Nature', doi: '10.1038/s41586-2024-001' },
  { title: 'Arctic Ecosystem Climate Impact', citations: 743, year: 2023, journal: 'PNAS', doi: '10.1073/pnas.2023.001' },
]

const byPaperData = topCited.map(p => ({ name: p.title.slice(0, 20) + '...', citations: p.citations, year: p.year }))

const recentCiters = [
  { paper: 'Advances in Quantum Computing', authors: 'Zhang et al.', journal: 'IEEE Trans.', date: '2024-11-12', yourPaper: 'Quantum ML Drug Discovery' },
  { paper: 'Neural Protein Folding Methods', authors: 'Park & Liu', journal: 'Nature Methods', date: '2024-11-10', yourPaper: 'Deep Learning for Protein Structure' },
  { paper: 'CRISPR Therapeutics Pipeline', authors: 'Johnson et al.', journal: 'Lancet', date: '2024-11-08', yourPaper: 'CRISPR-Cas9 Gene Editing Review' },
  { paper: 'Climate Tipping Points 2024', authors: 'Müller & Chen', journal: 'Nature Climate', date: '2024-11-05', yourPaper: 'Arctic Ecosystem Climate Impact' },
]

export default function Citations() {
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null)

  const copyDoi = (doi: string) => {
    navigator.clipboard.writeText(doi)
    setCopiedDoi(doi)
    setTimeout(() => setCopiedDoi(null), 2000)
  }

  const metrics = [
    { label: 'Total Citations', value: '8,921', icon: Quote, color: '#7C3AED', change: '+521 this year' },
    { label: 'h-index', value: '42', icon: Star, color: '#2563EB', change: '+3 this year' },
    { label: 'i10-index', value: '87', icon: TrendingUp, color: '#14B8A6', change: '+12 this year' },
    { label: 'Citing Journals', value: '234', icon: ExternalLink, color: '#F59E0B', change: 'across 48 countries' },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map(m => (
          <div key={m.label} className="bg-card rounded-2xl border border-border p-5 card-hover">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: m.color + '15' }}>
              <m.icon className="w-5 h-5" style={{ color: m.color }} />
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{m.value}</p>
            <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
            <p className="text-xs font-medium" style={{ color: m.color }}>{m.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Citation Timeline</h3>
          <p className="text-xs text-muted-foreground mb-5">Total citations per year</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={citationTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B820" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1E3050', fontSize: '12px', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
              <Line type="monotone" dataKey="citations" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: '#7C3AED', stroke: 'white', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Citations by Paper</h3>
          <p className="text-xs text-muted-foreground mb-5">Top 5 most cited publications</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byPaperData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B820" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1E3050', fontSize: '12px', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }} />
              <Bar dataKey="citations" fill="#2563EB" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top cited papers */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Most Cited Papers</h3>
        </div>
        <div className="divide-y divide-border">
          {topCited.map((paper, i) => (
            <div key={i} className="px-6 py-4 hover:bg-secondary/60 transition-colors flex items-center gap-4">
              <span className="text-lg font-bold text-muted-foreground/30 w-8 flex-shrink-0">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{paper.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{paper.journal} · {paper.year}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-foreground">{paper.citations.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground/70">citations</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyDoi(paper.doi)}
                  className="flex items-center gap-1 text-xs border border-border rounded-lg px-2 py-1.5 hover:bg-secondary/60 transition-colors text-muted-foreground"
                >
                  {copiedDoi === paper.doi ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  DOI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent citers */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Citations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Papers that recently cited your work</p>
        </div>
        <div className="divide-y divide-border">
          {recentCiters.map((citer, i) => (
            <div key={i} className="px-6 py-4 hover:bg-secondary/60 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{citer.paper}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{citer.authors} · {citer.journal}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground/70">Cited your:</span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">{citer.yourPaper}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground/70 flex-shrink-0">{citer.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
