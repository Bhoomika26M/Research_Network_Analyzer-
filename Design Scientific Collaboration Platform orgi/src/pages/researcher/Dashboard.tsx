import { useState, useMemo } from 'react'
import { BookOpen, Quote, TrendingUp, Users, Plus, Search, CalendarDays, X } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import type { Publication } from '@/data/mockData'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

const COLORS = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#EF4444']

const STATUS_BADGE: Record<string, string> = {
  Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { publications, researchers, conferences, addPublication, showToast } = useAppContext()

  const [showAddModal, setShowAddModal] = useState(false)
  const [viewPub, setViewPub] = useState<Publication | null>(null)
  const [form, setForm] = useState({
    title: '', abstract: '', keywords: '', journal: '',
    year: new Date().getFullYear(), type: 'Journal' as const, status: 'Draft' as const,
    doi: '', authors: '',
  })

  const researcher = researchers[0] // Dr. Sarah Chen as default user

  const totalCitations = publications.reduce((sum, p) => sum + p.citations, 0)
  const activeCollabs = researchers.filter(r => r.status === 'Active').length

  // Monthly citation data (last 12 months)
  const citationData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const base = Math.floor(totalCitations / 12)
    return months.map((month, i) => ({
      month,
      citations: base + Math.floor(Math.sin(i * 0.8) * base * 0.3 + Math.random() * base * 0.2),
    }))
  }, [totalCitations])

  // Publication types for donut
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {}
    publications.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [publications])

  const recentPubs = [...publications].sort((a, b) => b.year - a.year).slice(0, 5)
  const upcomingConferences = conferences
    .filter(c => c.status === 'Open' || c.status === 'Upcoming')
    .slice(0, 4)

  const handleAddPublication = () => {
    if (!form.title.trim() || !form.journal.trim()) {
      showToast('Please fill in required fields', 'error')
      return
    }
    addPublication({
      title: form.title,
      abstract: form.abstract,
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      journal: form.journal,
      year: form.year,
      type: form.type,
      status: form.status,
      doi: form.doi,
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      citations: 0,
    })
    showToast('Publication added successfully')
    setShowAddModal(false)
    setForm({ title: '', abstract: '', keywords: '', journal: '', year: new Date().getFullYear(), type: 'Journal', status: 'Draft', doi: '', authors: '' })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Welcome back, {researcher?.name ?? 'Researcher'}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Submit Paper
          </button>
          <button onClick={() => onNavigate?.('collaborations')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Search size={16} /> Find Collaborators
          </button>
          <button onClick={() => onNavigate?.('events')} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <CalendarDays size={16} /> Register Event
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'h-Index', value: researcher?.hIndex ?? 0, trend: '+2 this year', icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Total Citations', value: totalCitations.toLocaleString(), trend: '+12% vs last year', icon: Quote, color: 'text-violet-500' },
          { label: 'Publications', value: publications.length, trend: `${publications.filter(p => p.status === 'Published').length} published`, icon: BookOpen, color: 'text-teal-500' },
          { label: 'Active Collaborations', value: activeCollabs, trend: 'across institutions', icon: Users, color: 'text-amber-500' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.trend}</p>
              </div>
              <div className={`p-2 rounded-lg bg-secondary ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Citations Over 12 Months</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={citationData}>
              <defs>
                <linearGradient id="citGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="citations" stroke="#2563EB" fill="url(#citGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publication Types</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {typeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {typeData.map((t, i) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{t.name}</span>
                </div>
                <span className="font-semibold text-foreground">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Publications + Upcoming Conferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Publications</h2>
            <button onClick={() => onNavigate?.('publications')} className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Journal</th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPubs.map(pub => (
                  <tr key={pub.id} className="hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => setViewPub(pub)}>
                    <td className="py-2.5 pr-4 font-medium text-foreground max-w-[240px]">
                      <span className="block truncate" title={pub.title}>{pub.title}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground whitespace-nowrap">{pub.journal}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{pub.year}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[pub.status] ?? ''}`}>
                        {pub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Upcoming Conferences</h2>
          <div className="space-y-3">
            {upcomingConferences.map(conf => (
              <div key={conf.id} className="border border-border rounded-lg p-3">
                <p className="text-sm font-medium text-foreground leading-snug">{conf.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{conf.location}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">Deadline: {conf.deadline}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${conf.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {conf.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publication Detail Panel */}
      {viewPub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewPub(null)} />
          <div className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground">Publication Details</h2>
              <button onClick={() => setViewPub(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <h3 className="text-base font-bold text-foreground leading-snug">{viewPub.title}</h3>
              <div className="flex gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[viewPub.status] ?? ''}`}>{viewPub.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Journal</p><p className="text-foreground mt-0.5">{viewPub.journal}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Year</p><p className="text-foreground mt-0.5">{viewPub.year}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Citations</p><p className="text-foreground font-bold mt-0.5">{viewPub.citations}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">DOI</p><p className="text-foreground mt-0.5 break-all">{viewPub.doi || '—'}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Abstract</p>
                <p className="text-sm text-foreground leading-relaxed">{viewPub.abstract}</p>
              </div>
              {viewPub.keywords.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {viewPub.keywords.map(k => <span key={k} className="px-2 py-0.5 bg-secondary text-foreground rounded-full text-xs">{k}</span>)}
                  </div>
                </div>
              )}
              {viewPub.authors.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">Authors</p>
                  {viewPub.authors.map(a => <p key={a} className="text-sm text-foreground">{a}</p>)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Publication Modal */}
      <Modal open={showAddModal} title="Submit New Paper" onClose={() => setShowAddModal(false)} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Abstract *</label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none"
              value={form.abstract}
              onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Journal *</label>
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                value={form.journal}
                onChange={e => setForm(f => ({ ...f, journal: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Year *</label>
              <input
                type="number"
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                value={form.year}
                onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof form.type }))}
              >
                <option>Journal</option>
                <option>Conference</option>
                <option>Book Chapter</option>
                <option>Preprint</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as typeof form.status }))}
              >
                <option>Draft</option>
                <option>Submitted</option>
                <option>Under Review</option>
                <option>Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Authors (comma-separated)</label>
            <input
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={form.authors}
              onChange={e => setForm(f => ({ ...f, authors: e.target.value }))}
              placeholder="Author One, Author Two"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleAddPublication} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
