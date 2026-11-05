import { useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useNavigate } from '../../context/NavigationContext'
import { useToast } from '../../context/ToastContext'
import { usePublications } from '../../services/publications'

interface ReviewerDashboardProps {
  onOpenReview: (pubId: number) => void
}

// Exact stat cards as seen in Screenshot 2
const stats = [
  {
    label: 'PENDING REVIEWS',
    value: '5',
    iconBg: 'bg-teal-500 text-white',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    label: 'COMPLETED REVIEWS',
    value: '4',
    iconBg: 'bg-emerald-500 text-white',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    label: 'OVERDUE REVIEWS',
    value: '2',
    iconBg: 'bg-rose-500 text-white',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    label: 'DUE TODAY',
    value: '0',
    iconBg: 'bg-amber-500 text-white',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

// Weekly Review Completions teal bar chart matching Screenshot 2
const weeklyData = [
  { day: 'Mon', completed: 2 },
  { day: 'Tue', completed: 2 },
  { day: 'Wed', completed: 3 },
  { day: 'Thu', completed: 2 },
  { day: 'Fri', completed: 3 },
  { day: 'Sat', completed: 2 },
  { day: 'Sun', completed: 0 },
]

// Reviews by Journal multicolor donut ring matching Screenshot 2
const journalDonutData = [
  { name: 'ACS Nano', value: 8, color: '#2563EB' },
  { name: 'Cell Reports Medicine', value: 6, color: '#F59E0B' },
  { name: 'Geophysical Research Letters', value: 10, color: '#10B981' },
  { name: 'ICML 2025', value: 7, color: '#06B6D4' },
  { name: 'IEEE Transactions on Neural Networks', value: 9, color: '#4F46E5' },
  { name: 'Journal of the American Chemical Society', value: 5, color: '#7C3AED' },
  { name: 'Nature Biotechnology', value: 11, color: '#0EA5E9' },
  { name: 'Nature Climate Change', value: 8, color: '#0D9488' },
  { name: 'Nature Structural & Molecular Biology', value: 6, color: '#F97316' },
  { name: 'NeurIPS 2025', value: 12, color: '#059669' },
  { name: 'Neuron', value: 7, color: '#3B82F6' },
  { name: 'Physical Review D', value: 9, color: '#EF4444' },
  { name: 'Physical Review Research', value: 8, color: '#8B5CF6' },
  { name: 'Physical Review X', value: 10, color: '#0284C7' },
  { name: 'The Astrophysical Journal', value: 7, color: '#14B8A6' },
]

export default function ReviewerDashboard({ onOpenReview }: ReviewerDashboardProps) {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: publications = [] } = usePublications()
  const pendingReviews = publications
    .filter((p) => p.status === 'Submitted' || p.status === 'Under Review')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Top Header matching Screenshot 2 */}
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground tracking-tight">Reviewer Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your review assignments and performance overview
        </p>
      </div>

      {/* 4 Stat Cards Row matching Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-2xs"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0 ${s.iconBg}`}>
              {s.iconSvg}
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
                {s.label}
              </p>
              <p className="font-display font-bold text-2xl text-foreground mt-0.5">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Review Completions (Teal Bars) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <h2 className="font-display font-bold text-sm text-foreground mb-4">Weekly Review Completions</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 3]} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="completed" fill="#14B8A6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reviews by Journal (Multi-color donut ring) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <h2 className="font-display font-bold text-sm text-foreground mb-2">Reviews by Journal</h2>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={journalDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {journalDonutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Scrollable / small legend tags */}
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60 text-[9px] max-h-16 overflow-y-auto">
            {journalDonutData.map((j) => (
              <span key={j.name} className="flex items-center gap-1 text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: j.color }} />
                {j.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Urgent Deadlines & Recent Activity matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Deadlines */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Urgent Deadlines</h2>
            <button
              onClick={() => navigate('publications')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              View Queue ›
            </button>
          </div>
          <div className="space-y-3">
            {pendingReviews.map((pub) => (
              <div key={pub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-background border border-border/60">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-foreground truncate">{pub.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{pub.journal} · {pub.status}</p>
                </div>
                <button
                  onClick={() => onOpenReview(pub.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-center"
                >
                  Start Review
                </button>
              </div>
            ))}
            {pendingReviews.length === 0 && (
              <p className="text-xs text-muted-foreground">No submitted publications are waiting for review.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-sm text-foreground">Recent Activity</h2>
            <button
              onClick={() => navigate('audit')}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              View all ›
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-teal-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  DW
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">
                    Topological Invariants of Non-Hermitian Hamiltonians
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Physical Review Research • Assigned 8/7/2025
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 flex-shrink-0">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
