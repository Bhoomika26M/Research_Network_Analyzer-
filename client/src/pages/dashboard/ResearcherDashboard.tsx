import { useState } from 'react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { Publication, SessionUser } from '../../types/index'
import { usePublications } from '../../services/publications'
import { useNavigate } from '../../context/NavigationContext'
import Drawer from '../../layout/Drawer'

// Exact stat cards as shown in Screenshot 4
const stats = [
  {
    label: 'H-INDEX',
    value: '38',
    delta: '+2 this year',
    iconColor: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: 'TOTAL CITATIONS',
    value: '4,169',
    delta: '+12% vs last year',
    iconColor: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    label: 'PUBLICATIONS',
    value: '20',
    delta: '16 published',
    iconColor: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: 'ACTIVE COLLABORATIONS',
    value: '15',
    delta: 'across institutions',
    iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    iconSvg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
]

// Citations 12-Month curve matching Screenshot 4
const citations12MonthData = [
  { month: 'Jan', citations: 390 },
  { month: 'Feb', citations: 430 },
  { month: 'Mar', citations: 480 },
  { month: 'Apr', citations: 470 },
  { month: 'May', citations: 390 },
  { month: 'Jun', citations: 340 },
  { month: 'Jul', citations: 260 },
  { month: 'Aug', citations: 330 },
  { month: 'Sep', citations: 380 },
  { month: 'Oct', citations: 430 },
  { month: 'Nov', citations: 500 },
  { month: 'Dec', citations: 450 },
]

// Donut data matching Screenshot 4
const pieData = [
  { name: 'Journal', value: 19, color: '#2563EB' },
  { name: 'Conference', value: 1, color: '#7C3AED' },
]

const upcomingConferences = [
  { name: 'NeurIPS 2024', location: 'Vancouver, Canada', date: 'Dec 9–15', deadline: '3 days', badgeColor: 'bg-purple-100 text-purple-700' },
  { name: 'ICML 2025', location: 'Vienna, Austria', date: 'Jul 13–19', deadline: '45 days', badgeColor: 'bg-blue-100 text-blue-700' },
  { name: 'ICLR 2025', location: 'Singapore', date: 'Apr 24–28', deadline: '120 days', badgeColor: 'bg-teal-100 text-teal-700' },
]

export default function ResearcherDashboard({ user }: { user?: SessionUser }) {
  const navigate = useNavigate()
  const { data: apiPubs = [] } = usePublications()
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null)

  const recentPubs = apiPubs.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header and Quick Action Buttons matching Screenshot 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Welcome back, {user?.name || 'Dr. Sarah Chen'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('publications')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>+</span>
            <span>Submit Paper</span>
          </button>
          <button
            onClick={() => navigate('collaborations')}
            className="flex items-center gap-1.5 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Find Collaborators</span>
          </button>
          <button
            onClick={() => navigate('conferences')}
            className="flex items-center gap-1.5 px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Register Event</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards Row matching Screenshot 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-5 flex items-start justify-between shadow-2xs"
          >
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                {s.label}
              </p>
              <p className="font-display font-bold text-3xl text-foreground mt-2">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.delta}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.iconColor}`}>{s.iconSvg}</div>
          </div>
        ))}
      </div>

      {/* Charts Row matching Screenshot 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Citations Over 12 Months (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Citations Over 12 Months</h2>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={citations12MonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={true} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="citations" stroke="#2563EB" strokeWidth={2.5} fill="url(#citationGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Publication Types Donut (1 col) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="font-display font-bold text-sm text-foreground">Publication Types</h2>
          </div>
          <div className="relative flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 pt-2 border-t border-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Journal
              </span>
              <span className="font-semibold text-foreground">19</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                Conference
              </span>
              <span className="font-semibold text-foreground">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Publications & Upcoming Conferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Publications Table (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Recent Publications</h2>
            <button
              onClick={() => navigate('publications')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View all ›
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="pb-2 font-semibold">Title</th>
                  <th className="pb-2 font-semibold">Journal</th>
                  <th className="pb-2 font-semibold">Year</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPubs.map((pub) => (
                  <tr
                    key={pub.id}
                    onClick={() => setSelectedPub(pub)}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 font-medium text-foreground max-w-xs truncate pr-4">
                      {pub.title}
                    </td>
                    <td className="py-3 text-muted-foreground">{pub.journal}</td>
                    <td className="py-3 text-muted-foreground">{pub.year}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          pub.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : pub.status === 'Under Review'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {pub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Conferences (1 col) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-sm text-foreground">Upcoming Conferences</h2>
              <button
                onClick={() => navigate('conferences')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View all ›
              </button>
            </div>
            <div className="space-y-3.5">
              {upcomingConferences.map((conf) => (
                <div key={conf.name} className="flex items-start justify-between p-3 rounded-xl bg-background border border-border/60">
                  <div>
                    <p className="font-bold text-xs text-foreground">{conf.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{conf.location}</p>
                    <p className="text-[10px] text-muted-foreground">{conf.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${conf.badgeColor}`}>
                    {conf.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <Drawer open={selectedPub !== null} onClose={() => setSelectedPub(null)} title="Publication Details">
        {selectedPub && (
          <div className="space-y-4 text-xs">
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground font-semibold">Title</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{selectedPub.title}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground font-semibold">Authors</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Array.isArray(selectedPub.authors) ? selectedPub.authors.join(', ') : selectedPub.authors}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase text-muted-foreground font-semibold">Abstract</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{selectedPub.abstract}</p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
