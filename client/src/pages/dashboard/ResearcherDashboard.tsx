import { useState } from 'react'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Publication, SessionUser } from '../../types/index'
import { usePublications } from '../../services/publications'
import { useNavigate } from '../../context/NavigationContext'
import Drawer from '../../layout/Drawer'

const stats = [
  { label: 'Publications', value: '47', delta: '+3 this month', icon: '📄', color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Projects', value: '8', delta: '2 deadlines soon', icon: '🔬', color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Conferences', value: '12', delta: '1 upcoming', icon: '🎓', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Collaborators', value: '34', delta: '+2 this week', icon: '🤝', color: 'text-amber-600', bg: 'bg-amber-50' },
]

const activity = [
  { time: '2 hours ago', action: 'New citation on "Graph Neural Networks for Protein Folding"', type: 'citation' },
  { time: '1 day ago', action: 'Co-author Dr. Emma Torres accepted collaboration request', type: 'collab' },
  { time: '2 days ago', action: 'Publication "Quantum Error Correction Methods" status changed to Published', type: 'pub' },
  { time: '3 days ago', action: 'Abstract accepted at NeurIPS 2024', type: 'conf' },
  { time: '5 days ago', action: 'New project "Federated Learning Architectures" created', type: 'project' },
  { time: '1 week ago', action: 'Annual report generated for MIT Computer Science Department', type: 'report' },
]

const pubMonthData = [
  { month: 'Jan', Publications: 12 },
  { month: 'Feb', Publications: 8 },
  { month: 'Mar', Publications: 15 },
  { month: 'Apr', Publications: 10 },
  { month: 'May', Publications: 18 },
  { month: 'Jun', Publications: 22 },
  { month: 'Jul', Publications: 14 },
  { month: 'Aug', Publications: 19 },
  { month: 'Sep', Publications: 25 },
  { month: 'Oct', Publications: 17 },
  { month: 'Nov', Publications: 21 },
  { month: 'Dec', Publications: 28 },
]

const pieData = [
  { name: 'Journal', value: 8 },
  { name: 'Conference', value: 5 },
  { name: 'Book', value: 1 },
  { name: 'Patent', value: 3 },
  { name: 'Report', value: 3 },
]

const PIE_COLORS = ['#0052FF', '#4D7CFF', '#7B9CC0', '#10B981', '#F59E0B']

const statusStyles: Record<string, string> = {
  Draft: 'bg-[#F1F5F9] text-[#64748B]',
  'Under Review': 'bg-amber-50 text-amber-700',
  Published: 'gradient-bg text-white',
  Rejected: 'bg-red-50 text-red-700',
}

const customTooltipStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '12px',
}

function PubMiniDetail({ pub }: { pub: Publication }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[pub.status]}`}>{pub.status}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">{pub.type}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">{pub.year}</span>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Title</p>
        <h3 className="font-display text-base text-[#0F172A] leading-snug">{pub.title}</h3>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Authors</p>
        <div className="flex flex-wrap gap-1.5">
          {pub.authors.map((a) => (
            <span key={a} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">{a}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Abstract</p>
        <p className="text-sm text-[#64748B] leading-relaxed">{pub.abstract}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F1F5F9]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Journal / Venue</p>
          <p className="text-sm font-medium text-[#0F172A]">{pub.journal}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Citations</p>
          <p className="font-display text-xl text-[#0F172A]">{pub.citations}</p>
        </div>
      </div>
      {pub.doi && (
        <div className="pt-2 border-t border-[#F1F5F9]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">DOI</p>
          <p className="text-sm font-mono text-[#0052FF]">{pub.doi}</p>
        </div>
      )}
    </div>
  )
}

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function ResearcherDashboard({ user }: { user?: SessionUser }) {
  const navigate = useNavigate()
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null)

  const { data: apiPubs } = usePublications()
  const recentPubs = (apiPubs || []).slice(0, 4)

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Overview</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">{timeGreeting()}{user?.name ? `, ${user.name}` : ''}</h1>
        <p className="text-[#64748B] mt-1">{"Here's what's happening with your research network today."}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
            </div>
            <p className="font-display text-3xl text-[#0F172A]">{stat.value}</p>
            <p className="text-sm font-medium text-[#0F172A] mt-0.5">{stat.label}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Recent publications */}
        <div className="col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Recent Work
              </span>
              <h2 className="font-display text-lg text-[#0F172A]">Publications</h2>
            </div>
            <button
              onClick={() => navigate('publications')}
              className="text-xs text-[#0052FF] font-medium hover:text-[#4D7CFF] transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentPubs.map((pub) => (
              <div
                key={pub.id}
                onClick={() => setSelectedPub(pub)}
                className="flex items-start gap-4 p-4 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg gradient-bg flex-shrink-0 flex items-center justify-center mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="1" width="7" height="10" rx="1.5" stroke="white" strokeWidth="1.2"/>
                    <line x1="4" y1="4" x2="7" y2="4" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <line x1="4" y1="6" x2="7" y2="6" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                    <line x1="4" y1="8" x2="6" y2="8" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] leading-snug mb-0.5 truncate">{pub.title}</p>
                  <p className="text-xs text-[#64748B]">{pub.journal} · {pub.year} · {pub.citations} citations</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusStyles[pub.status]}`}>
                  {pub.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="mb-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Live Feed
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Recent Activity</h2>
          </div>
          <div className="space-y-4">
            {activity.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 flex-shrink-0 flex flex-col items-center">
                  <div className="w-1.5 h-1.5 rounded-full gradient-bg mt-1.5 flex-shrink-0"></div>
                  {i < activity.length - 1 && <div className="w-px flex-1 bg-[#E2E8F0] mt-1"></div>}
                </div>
                <div className="pb-3">
                  <p className="text-xs text-[#0F172A] leading-relaxed">{item.action}</p>
                  <p className="text-[10px] text-[#64748B] mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Publications over time */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Trend
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Publications Over Time</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pubMonthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pubGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={customTooltipStyle}/>
              <Area type="monotone" dataKey="Publications" stroke="#0052FF" strokeWidth={2} fill="url(#pubGradient)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Publication Types */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Breakdown
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Publication Types</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]}/>
                ))}
              </Pie>
              <Legend
                iconSize={8}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', color: '#64748B' }}
              />
              <Tooltip contentStyle={customTooltipStyle}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Drawer
        open={selectedPub !== null}
        onClose={() => setSelectedPub(null)}
        title="Publication Details"
      >
        {selectedPub && <PubMiniDetail pub={selectedPub} />}
      </Drawer>
    </div>
  )
}
