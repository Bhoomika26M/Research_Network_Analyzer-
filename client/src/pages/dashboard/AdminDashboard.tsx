import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { CSSProperties } from 'react'
import { useNavigate } from '../../context/NavigationContext'

const systemStats = [
  { label: 'Total Researchers', value: '3,847', delta: '+142 this month' },
  { label: 'Institutions', value: '127', delta: '12 countries' },
  { label: 'Publications', value: '24,891', delta: '+2,134 this year' },
  { label: 'Active Sessions', value: '284', delta: 'Right now' },
]

const activityFeed = [
  { user: 'Dr. Amir Khan', action: 'Submitted publication for review', time: '2 min ago', type: 'pub' },
  { user: 'MIT Admin', action: 'Onboarded 8 new researchers to CS Department', time: '14 min ago', type: 'user' },
  { user: 'System', action: 'Automated backup completed successfully', time: '1 hour ago', type: 'system' },
  { user: 'Dr. Yuki Tanaka', action: 'Created cross-institution project with Oxford', time: '2 hours ago', type: 'collab' },
  { user: 'Security System', action: 'Detected and blocked 3 suspicious login attempts', time: '3 hours ago', type: 'security' },
  { user: 'Stanford Admin', action: 'Exported Q3 collaboration report', time: '4 hours ago', type: 'report' },
  { user: 'Dr. Priya Sharma', action: 'Updated institutional affiliation — MIT → Cambridge', time: '5 hours ago', type: 'user' },
]

const typeColors: Record<string, string> = {
  pub: 'bg-blue-100 text-blue-700',
  user: 'bg-violet-100 text-violet-700',
  system: 'bg-emerald-100 text-emerald-700',
  collab: 'bg-amber-100 text-amber-700',
  security: 'bg-red-100 text-red-700',
  report: 'bg-slate-100 text-slate-600',
}

const userGrowthData = [
  { month: 'Sep', Researchers: 45, Reviewers: 12, Admins: 3 },
  { month: 'Oct', Researchers: 52, Reviewers: 15, Admins: 3 },
  { month: 'Nov', Researchers: 60, Reviewers: 18, Admins: 4 },
  { month: 'Dec', Researchers: 68, Reviewers: 22, Admins: 4 },
  { month: 'Jan', Researchers: 74, Reviewers: 25, Admins: 5 },
  { month: 'Feb', Researchers: 82, Reviewers: 28, Admins: 5 },
]

const activityData = [
  { month: 'Sep', Activity: 280 },
  { month: 'Oct', Activity: 310 },
  { month: 'Nov', Activity: 295 },
  { month: 'Dec', Activity: 380 },
  { month: 'Jan', Activity: 420 },
  { month: 'Feb', Activity: 465 },
]

const customTooltipStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '12px',
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  return (
    <div className="p-0">
      {/* Inverted dark stats band */}
      <div className="bg-[#0F172A] px-8 pt-8 pb-8">
        <div className="max-w-[1200px]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/70">System Administration</span>
          </span>
          <h1 className="font-display text-3xl text-white mb-1">System Overview</h1>
          <p className="text-white/50 mb-8">Global platform health and activity metrics</p>

          <div className="grid grid-cols-4 gap-4">
            {systemStats.map((stat) => (
              <div key={stat.label} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
                <p className="font-display text-3xl text-white">{stat.value}</p>
                <p className="text-sm font-medium text-white/80 mt-0.5">{stat.label}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.delta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1200px]">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Activity feed */}
          <div className="col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                  Real-time
                </span>
                <h2 className="font-display text-lg text-[#0F172A]">System-wide Activity</h2>
              </div>
              <button onClick={() => navigate('audit')} className="text-xs text-[#0052FF] font-medium hover:text-[#4D7CFF]">View full audit →</button>
            </div>
            <div className="space-y-2">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-[#FAFAFA] transition-colors">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {item.user === 'System' || item.user === 'Security System' ? '⚙' : item.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#0F172A]">{item.user}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[item.type]}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{item.action}</p>
                  </div>
                  <span className="text-[10px] text-[#64748B] flex-shrink-0 mt-1">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Platform Health
              </span>
              {[
                { label: 'API Uptime', value: '99.97%', color: 'text-emerald-600' },
                { label: 'DB Response', value: '12ms', color: 'text-blue-600' },
                { label: 'Storage Used', value: '67%', color: 'text-amber-600' },
                { label: 'Errors (24h)', value: '3', color: 'text-red-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
                  <span className="text-xs text-[#64748B]">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                User Distribution
              </span>
              {[
                { role: 'Researchers', count: 3421, pct: 89 },
                { role: 'Institution Admins', count: 254, pct: 7 },
                { role: 'Reviewers', count: 148, pct: 3.8 },
                { role: 'System Admins', count: 24, pct: 0.6 },
              ].map((item) => (
                <div key={item.role} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B]">{item.role}</span>
                    <span className="font-medium text-[#0F172A]">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full">
                    <div className="progress-fill" style={{ '--pct': `${item.pct}%` } as CSSProperties} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6">
          {/* User Growth by Role — Grouped BarChart */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Growth
              </span>
              <h2 className="font-display text-lg text-[#0F172A]">User Growth by Role</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={customTooltipStyle}/>
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }}/>
                <Bar dataKey="Researchers" fill="#0052FF" radius={[4, 4, 0, 0]}/>
                <Bar dataKey="Reviewers" fill="#4D7CFF" radius={[4, 4, 0, 0]}/>
                <Bar dataKey="Admins" fill="#94A3B8" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Activity — LineChart */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Engagement
              </span>
              <h2 className="font-display text-lg text-[#0F172A]">Platform Activity</h2>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={customTooltipStyle}/>
                <Line type="monotone" dataKey="Activity" stroke="#0052FF" strokeWidth={2} dot={{ fill: '#0052FF', r: 3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
