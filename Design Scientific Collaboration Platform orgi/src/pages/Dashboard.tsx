import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { FileText, Users, FolderOpen, Network, TrendingUp, TrendingDown, ExternalLink, Clock, MapPin } from 'lucide-react'

const publicationData = [
  { month: 'Jan', publications: 142, collaborations: 89 },
  { month: 'Feb', publications: 168, collaborations: 112 },
  { month: 'Mar', publications: 195, collaborations: 134 },
  { month: 'Apr', publications: 221, collaborations: 158 },
  { month: 'May', publications: 247, collaborations: 182 },
  { month: 'Jun', publications: 289, collaborations: 204 },
  { month: 'Jul', publications: 312, collaborations: 231 },
  { month: 'Aug', publications: 298, collaborations: 219 },
  { month: 'Sep', publications: 334, collaborations: 256 },
  { month: 'Oct', publications: 378, collaborations: 278 },
  { month: 'Nov', publications: 401, collaborations: 301 },
  { month: 'Dec', publications: 445, collaborations: 334 },
]

const pieData = [
  { name: 'MIT', value: 28, color: '#2563EB' },
  { name: 'Stanford', value: 22, color: '#7C3AED' },
  { name: 'Oxford', value: 18, color: '#14B8A6' },
  { name: 'ETH Zürich', value: 15, color: '#F59E0B' },
  { name: 'Caltech', value: 10, color: '#EC4899' },
  { name: 'Others', value: 7, color: '#94A3B8' },
]

const recentPublications = [
  { id: 1, title: 'Quantum Computing Applications in Drug Discovery', authors: 'Chen S., Park J., Williams R.', journal: 'Nature', year: 2024, status: 'Published', citations: 47 },
  { id: 2, title: 'Deep Learning for Protein Structure Prediction at Scale', authors: 'Kumar P., Zhang W., Anderson T.', journal: 'Science', year: 2024, status: 'Published', citations: 128 },
  { id: 3, title: 'Climate Change Impact on Arctic Ecosystems', authors: 'Müller H., Okafor J., Santos M.', journal: 'PNAS', year: 2024, status: 'Submitted', citations: 0 },
  { id: 4, title: 'Neuromorphic Computing: A Decade of Progress', authors: 'Tanaka Y., Cohen D., Patel S.', journal: 'IEEE Trans.', year: 2024, status: 'Draft', citations: 0 },
  { id: 5, title: 'CRISPR-Cas9 Efficiency in Mammalian Gene Editing', authors: 'Garcia L., Kim B., Thompson E.', journal: 'Cell', year: 2024, status: 'Published', citations: 89 },
]

const upcomingConferences = [
  { name: 'NeurIPS 2024', location: 'Vancouver, Canada', date: 'Dec 9–15', deadline: '3 days', color: '#7C3AED' },
  { name: 'ICML 2025', location: 'Vienna, Austria', date: 'Jul 13–19', deadline: '45 days', color: '#2563EB' },
  { name: 'ICLR 2025', location: 'Singapore', date: 'Apr 24–28', deadline: '120 days', color: '#14B8A6' },
]

const activeProjects = [
  { name: 'Quantum Biology Initiative', progress: 72, team: 8, lead: 'Dr. Chen', status: 'On Track' },
  { name: 'Climate Modeling Framework', progress: 45, team: 12, lead: 'Prof. Müller', status: 'At Risk' },
  { name: 'Neuromorphic AI Systems', progress: 89, team: 6, lead: 'Dr. Tanaka', status: 'Ahead' },
]

const kpis = [
  { label: 'Publications', value: '3,847', change: '+12.4%', up: true, icon: FileText, color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Researchers', value: '48,291', change: '+8.1%', up: true, icon: Users, color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Active Projects', value: '1,204', change: '+3.7%', up: true, icon: FolderOpen, color: '#14B8A6', bg: '#F0FDFA' },
  { label: 'Collaborations', value: '24,891', change: '-1.2%', up: false, icon: Network, color: '#F59E0B', bg: '#FFFBEB' },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  Published: { bg: '#ECFDF5', text: '#10B981' },
  Submitted: { bg: '#EFF6FF', text: '#2563EB' },
  Draft: { bg: '#F8FAFC', text: '#94A3B8' },
  Archived: { bg: '#FEF3C7', text: '#92400E' },
}

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

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-card rounded-2xl p-5 border border-border card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${kpi.up ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Publication growth */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Publication & Collaboration Growth</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Year-to-date trends</p>
            </div>
            <select className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground outline-none bg-background">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={publicationData}>
              <defs>
                <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94A3B820" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="publications" stroke="#2563EB" strokeWidth={2} fill="url(#pubGrad)" name="Publications" />
              <Area type="monotone" dataKey="collaborations" stroke="#14B8A6" strokeWidth={2} fill="url(#colGrad)" name="Collaborations" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Institution pie */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-1">Institution Contributions</h3>
          <p className="text-xs text-muted-foreground mb-4">By publication share</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" strokeWidth={2} stroke="transparent">
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent publications */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Recent Publications</h3>
            <button className="text-xs text-primary font-medium flex items-center gap-1 hover:text-primary/80">
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentPublications.map(pub => {
              const sc = statusColors[pub.status]
              return (
                <div key={pub.id} className="px-6 py-3.5 hover:bg-secondary/60 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate mb-1">{pub.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{pub.authors}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold badge px-2 py-0.5 rounded-lg" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {pub.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground/70">{pub.journal} · {pub.year}</span>
                    {pub.citations > 0 && <span className="text-xs text-muted-foreground/70">{pub.citations} citations</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Upcoming conferences */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Upcoming Conferences</h3>
            </div>
            <div className="divide-y divide-border">
              {upcomingConferences.map(conf => (
                <div key={conf.name} className="px-5 py-3.5 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: conf.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{conf.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{conf.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{conf.date}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: conf.color }}>
                          Deadline: {conf.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active projects */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Active Projects</h3>
            </div>
            <div className="divide-y divide-border">
              {activeProjects.map(project => (
                <div key={project.name} className="px-5 py-3.5 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground truncate flex-1">{project.name}</p>
                    <span className={`text-xs font-medium ml-2 flex-shrink-0 ${
                      project.status === 'On Track' ? 'text-emerald-500' :
                      project.status === 'At Risk' ? 'text-amber-500' : 'text-blue-500'
                    }`}>{project.status}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: project.status === 'On Track' ? '#10B981' : project.status === 'At Risk' ? '#F59E0B' : '#2563EB'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground/70">{project.lead}</span>
                    <span className="text-xs text-muted-foreground/70">{project.progress}% · {project.team} members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
