import { useMemo } from 'react'
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const TEAL = '#14B8A6'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PIE_COLORS = ['#14B8A6', '#2563EB', '#7C3AED', '#F59E0B', '#EF4444', '#10B981']

interface DashboardProps {
  onNavigate?: (page: string) => void
}

function KPI({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color }}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }
  return map[status] ?? 'bg-secondary text-foreground'
}

export default function ReviewerDashboard({ onNavigate }: DashboardProps) {
  const { reviews } = useAppContext()

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 3600 * 1000)

  const pending = useMemo(() => reviews.filter(r => r.status === 'Pending').length, [reviews])
  const completed = useMemo(() => reviews.filter(r => r.status === 'Completed').length, [reviews])
  const overdue = useMemo(() => reviews.filter(r => r.status === 'Overdue').length, [reviews])
  const dueToday = useMemo(() =>
    reviews.filter(r => {
      const d = new Date(r.dueDate)
      return d >= now && d <= in24h && r.status !== 'Completed'
    }).length, [reviews])

  const weeklyData = useMemo(() =>
    DAYS.map((day, i) => ({
      day,
      completed: Math.floor(Math.random() * 4 + (i === 2 || i === 4 ? 2 : 0)),
    })), [])

  const journalData = useMemo(() => {
    const counts: Record<string, number> = {}
    reviews.forEach(r => {
      counts[r.journal] = (counts[r.journal] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [reviews])

  const urgentReviews = useMemo(() =>
    reviews.filter(r => r.status === 'Overdue' || r.status === 'Pending').slice(0, 5),
    [reviews])

  const recentActivity = useMemo(() =>
    [...reviews].sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()).slice(0, 6),
    [reviews])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reviewer Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your review assignments and performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI label="Pending Reviews" value={pending} icon={ClipboardList} color={TEAL} />
        <KPI label="Completed Reviews" value={completed} icon={CheckCircle2} color="#10B981" />
        <KPI label="Overdue Reviews" value={overdue} icon={AlertTriangle} color="#EF4444" />
        <KPI label="Due Today" value={dueToday} icon={Clock} color="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Review Completions</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="completed" fill={TEAL} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Reviews by Journal</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={journalData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {journalData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Urgent Deadlines</h2>
            <button onClick={() => onNavigate?.('review-queue')} className="flex items-center gap-1 text-xs text-[#14B8A6] hover:underline">
              View Queue <ChevronRight size={12} />
            </button>
          </div>
          {urgentReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No urgent reviews at this time.</p>
          ) : (
            <div className="space-y-3">
              {urgentReviews.map(r => (
                <div key={r.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-secondary">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.paperTitle}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.journal}</p>
                    <p className="text-xs text-muted-foreground">Due: {new Date(r.dueDate).toLocaleDateString()}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{r.status}</span>
                  </div>
                  <button onClick={() => onNavigate?.('assigned-papers')} className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: TEAL }}>
                    Start Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <button onClick={() => onNavigate?.('review-history')} className="flex items-center gap-1 text-xs text-[#14B8A6] hover:underline">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map(r => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: TEAL }}>
                  {r.reviewer.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.paperTitle}</p>
                  <p className="text-xs text-muted-foreground">{r.journal} · Assigned {new Date(r.assignedDate).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
