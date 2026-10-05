import { useState, useMemo } from 'react'
import { Users, BookOpen, UserPlus, Clock, Download } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import * as XLSX from 'xlsx'

const AMBER = '#F59E0B'
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PIE_COLORS = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B']
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKS = ['W1', 'W2', 'W3', 'W4']

function KPI({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white" style={{ background: AMBER }}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function heatmapColor(count: number, max: number) {
  if (count === 0) return 'var(--border)'
  const intensity = count / max
  if (intensity < 0.25) return '#FEF3C7'
  if (intensity < 0.5) return '#FDE68A'
  if (intensity < 0.75) return '#FCD34D'
  return AMBER
}

export default function Analytics() {
  const { users, publications, institutions } = useAppContext()

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const activeUsers = useMemo(() => users.filter(u => u.status === 'Active').length, [users])
  const pubsThisMonth = useMemo(() => {
    const now = new Date()
    return publications.filter(p => p.year === now.getFullYear()).length
  }, [publications])
  const newRegistrations = useMemo(() => Math.floor(users.length * 0.15), [users.length])

  const userGrowthData = useMemo(() => {
    const base = Math.max(1, users.length - 11)
    return MONTHS.map((month, i) => ({ month, users: base + i * 2 + Math.floor(i * 1.5) }))
  }, [users.length])

  const pubTrendData = useMemo(() =>
    MONTHS.map((month, i) => ({
      month,
      publications: i < 8 ? Math.floor(Math.random() * 8 + 2) : 0,
    })), [])

  const loginsByInst = useMemo(() =>
    institutions.slice(0, 6).map(inst => ({
      name: inst.name.length > 15 ? inst.name.slice(0, 15) + '…' : inst.name,
      logins: Math.floor(Math.random() * 200 + 50),
    })), [institutions])

  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    users.forEach(u => { counts[u.role] = (counts[u.role] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [users])

  const heatmapData = useMemo(() => {
    return DAYS_SHORT.map(day => ({
      day,
      values: WEEKS.map(() => Math.floor(Math.random() * 100)),
    }))
  }, [])

  const heatmapMax = useMemo(() => Math.max(...heatmapData.flatMap(d => d.values)), [heatmapData])

  const handleExport = () => {
    try {
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(userGrowthData), 'User Growth')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pubTrendData), 'Publications')
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(loginsByInst), 'Logins by Institution')
      XLSX.writeFile(wb, 'analytics.xlsx')
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform-wide analytics and trends</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none" />
          <span className="text-sm text-muted-foreground">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none" />
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">
            <Download size={14} /> Export Data
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI label="Active Users" value={activeUsers} icon={Users} />
        <KPI label="Publications This Year" value={pubsThisMonth} icon={BookOpen} />
        <KPI label="New Registrations" value={newRegistrations} icon={UserPlus} />
        <KPI label="Avg Session" value="24m 13s" icon={Clock} />
      </div>

      {/* Row 1: Area + Line */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsUserGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={AMBER} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke={AMBER} fill="url(#analyticsUserGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Publication Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pubTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--border)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="publications" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Bar + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Logins by Institution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={loginsByInst} margin={{ top: 5, right: 10, left: -20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--border)" angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--border)" />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="logins" fill={AMBER} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">User Role Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={roleDistribution} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                {roleDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Activity heatmap */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">Login Activity Heatmap (7 days × 4 weeks)</h2>
        <div className="overflow-x-auto">
          <table className="text-xs">
            <thead>
              <tr>
                <th className="pr-3 text-right font-semibold text-muted-foreground pb-2 w-10" />
                {WEEKS.map(w => (
                  <th key={w} className="px-2 pb-2 font-semibold text-muted-foreground text-center w-16">{w}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map(row => (
                <tr key={row.day}>
                  <td className="pr-3 text-right font-medium text-muted-foreground py-1">{row.day}</td>
                  {row.values.map((count, wi) => (
                    <td key={wi} className="px-2 py-1">
                      <div
                        className="w-12 h-8 rounded flex items-center justify-center text-xs font-medium"
                        style={{ background: heatmapColor(count, heatmapMax), color: count > heatmapMax * 0.5 ? '#78350F' : 'var(--muted-foreground)' }}
                        title={`${count} logins`}
                      >
                        {count}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Low</span>
            {[0, 25, 50, 75, 100].map(v => (
              <div key={v} className="w-6 h-4 rounded" style={{ background: heatmapColor(v, 100) }} />
            ))}
            <span className="text-xs text-muted-foreground">High</span>
          </div>
        </div>
      </div>
    </div>
  )
}
