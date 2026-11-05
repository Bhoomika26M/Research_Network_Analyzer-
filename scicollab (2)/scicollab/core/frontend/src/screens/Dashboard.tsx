import { useState } from 'react';
import { TrendingUp, TrendingDown, BookOpen, Users, CalendarDays, Network, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { pubTrend, deptPubs, collabGrowth, researchers, publications, conferences } from '../data/mock';
import { useRole } from '../context/RoleContext';
import Badge from '../components/Badge';

const roles = ['Researcher', 'Institution', 'Admin'];

function StatCard({ label, value, change, positive, icon: Icon, color }: {
  label: string; value: string; change: string; positive: boolean;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} strokeWidth={2} />
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 3,
          fontSize: 12, fontWeight: 600,
          color: positive ? '#1F7A6C' : '#C0392B',
          background: positive ? '#e8f5f3' : '#fdf0ef',
          padding: '2px 7px', borderRadius: 6,
        }}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {change}
        </span>
      </div>
      <div className="stat-card-number" style={{ color: '#1B1F27' }}>{value}</div>
      <div style={{ fontSize: 13, color: '#5B6472', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function ResearcherDashboard() {
  const recentPubs = publications.slice(0, 4);
  const upcomingConfs = conferences.filter(c => c.status === 'Upcoming').slice(0, 3);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Publications" value="42" change="+6 this year" positive={true} icon={BookOpen} color="#16324F" />
        <StatCard label="Active Projects" value="3" change="+1 new" positive={true} icon={Activity} color="#1F7A6C" />
        <StatCard label="Conferences" value="12" change="+2 upcoming" positive={true} icon={CalendarDays} color="#C9A24B" />
        <StatCard label="Collaborators" value="18" change="+3 this year" positive={true} icon={Users} color="#2B6CB0" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0, color: '#1B1F27' }}>Recent Publications</h3>
              <span style={{ fontSize: 12, color: '#16324F', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
            </div>
            <div>
              {recentPubs.map((p, i) => (
                <div key={p.id} style={{
                  padding: '13px 20px',
                  borderBottom: i < recentPubs.length - 1 ? '1px solid #F9FAFB' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={14} color="#5B6472" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#5B6472', marginTop: 2 }}>{p.venue} · {p.year}</div>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
                    background: p.status === 'Published' ? '#e8f5f3' : p.status === 'Submitted' ? '#fef4e8' : '#EBF4FF',
                    color: p.status === 'Published' ? '#1F7A6C' : p.status === 'Submitted' ? '#C9822E' : '#2B6CB0',
                    flexShrink: 0,
                  }}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Publication Trend</h3>
            </div>
            <div style={{ padding: '12px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={pubTrend} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E1E4E8' }} />
                  <Bar dataKey="count" fill="#16324F" radius={[4, 4, 0, 0]} name="Publications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Upcoming Conferences</h3>
              <span style={{ fontSize: 12, color: '#16324F', fontWeight: 600, cursor: 'pointer' }}>View all →</span>
            </div>
            {upcomingConfs.map((c, i) => (
              <div key={c.id} style={{
                padding: '14px 20px',
                borderBottom: i < upcomingConfs.length - 1 ? '1px solid #F9FAFB' : 'none',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: '#EBF4FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CalendarDays size={16} color="#2B6CB0" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', lineHeight: 1.4 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#5B6472', marginTop: 2 }}>{c.dates} · {c.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Active Projects</h3>
            </div>
            {[
              { name: 'FedBio: Privacy-Preserving Biomedical AI', funding: 'NIH R01', progress: 62 },
              { name: 'QuantumSafe: Topological Error Correction', funding: 'DARPA', progress: 78 },
              { name: 'ClimateScope: Sub-Regional Adaptation', funding: 'NSF', progress: 34 },
            ].map((p, i) => (
              <div key={i} style={{ padding: '14px 20px', borderBottom: i < 2 ? '1px solid #F9FAFB' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27' }}>{p.name}</div>
                  <span style={{ fontSize: 12, color: '#5B6472', flexShrink: 0 }}>{p.progress}%</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginBottom: 8 }}>{p.funding}</div>
                <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${p.progress}%`, background: '#16324F', borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InstitutionDashboard() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Departments" value="12" change="+1 this year" positive={true} icon={Activity} color="#16324F" />
        <StatCard label="Total Publications" value="532" change="+67 this year" positive={true} icon={BookOpen} color="#1F7A6C" />
        <StatCard label="Active Projects" value="18" change="+4 new" positive={true} icon={Network} color="#C9A24B" />
        <StatCard label="Collaborations" value="34" change="+7 this year" positive={true} icon={Users} color="#2B6CB0" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Publications by Department</h3>
          </div>
          <div style={{ padding: '12px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={deptPubs} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: '#5B6472' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="pubs" fill="#1F7A6C" radius={[0, 4, 4, 0]} name="Publications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Collaboration Growth</h3>
          </div>
          <div style={{ padding: '12px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={collabGrowth}>
                <defs>
                  <linearGradient id="colorCollabs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16324F" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16324F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="#16324F" strokeWidth={2} fill="url(#colorCollabs)" name="Collaborations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Top Researchers by Output This Year</h3>
        </div>
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>#</th><th>Researcher</th><th>Department</th><th>Publications</th><th>Citations</th><th>h-Index</th>
            </tr>
          </thead>
          <tbody>
            {researchers.sort((a, b) => b.hIndex - a.hIndex).slice(0, 5).map((r, i) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700, color: '#C9A24B', fontFamily: 'Poppins' }}>#{i + 1}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#16324F', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: '#5B6472' }}>{r.institution}</div>
                    </div>
                  </div>
                </td>
                <td style={{ color: '#5B6472' }}>{r.department}</td>
                <td style={{ fontWeight: 600 }}>{r.publications}</td>
                <td style={{ fontWeight: 600, color: '#2B6CB0' }}>{r.citations.toLocaleString()}</td>
                <td>
                  <span style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1F7A6C', fontSize: 14 }}>{r.hIndex}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const userGrowth = [
    { month: 'Jan', users: 142 }, { month: 'Feb', users: 168 }, { month: 'Mar', users: 195 },
    { month: 'Apr', users: 224 }, { month: 'May', users: 258 }, { month: 'Jun', users: 289 },
    { month: 'Jul', users: 312 },
  ];

  const activity = [
    { time: '2 min ago', user: 'Dr. Sarah Chen', action: 'Published a new paper in Nature MI' },
    { time: '14 min ago', user: 'system', action: 'DOI batch resolution completed (14 records)' },
    { time: '1 hr ago', user: 'admin@scna.edu', action: 'Added institution: Max Planck Institute' },
    { time: '2 hr ago', user: 'Prof. James Okafor', action: 'Submitted GenEdit-T project for approval' },
    { time: '3 hr ago', user: 'Dr. Marcus Webb', action: 'Registered for AGU Fall Meeting 2024' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Users" value="312" change="+23 this month" positive={true} icon={Users} color="#16324F" />
        <StatCard label="Institutions" value="9" change="+1 this month" positive={true} icon={Activity} color="#1F7A6C" />
        <StatCard label="Total Publications" value="2,847" change="+127 this month" positive={true} icon={BookOpen} color="#C9A24B" />
        <StatCard label="Active Projects" value="47" change="-2 completed" positive={false} icon={Network} color="#2B6CB0" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>User Growth Over Time</h3>
            </div>
            <div style={{ padding: '12px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="#C9A24B" strokeWidth={2.5} dot={{ r: 4, fill: '#C9A24B' }} name="Users" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Institution Analytics</h3>
            </div>
            <div style={{ padding: '12px 8px 8px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: 'MIT', pubs: 184, researchers: 31 },
                  { name: 'Stanford', pubs: 212, researchers: 29 },
                  { name: 'UC Berkeley', pubs: 256, researchers: 42 },
                  { name: 'Caltech', pubs: 94, researchers: 18 },
                  { name: 'U of Chicago', pubs: 112, researchers: 20 },
                ]} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="pubs" fill="#16324F" radius={[4, 4, 0, 0]} name="Publications" />
                  <Bar dataKey="researchers" fill="#C9A24B" radius={[4, 4, 0, 0]} name="Researchers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Recent System Activity</h3>
          </div>
          <div style={{ padding: '8px 0', overflowY: 'auto', maxHeight: 440 }}>
            {activity.map((a, i) => (
              <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#C9A24B',
                  flexShrink: 0, marginTop: 5,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#1B1F27', lineHeight: 1.4 }}>{a.action}</div>
                  <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 3 }}>
                    <span style={{ color: '#5B6472', fontWeight: 500 }}>{a.user}</span> · {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewerDashboard() {
  const submitted = publications.filter(p => p.status === 'Submitted');

  const reviewActivity = [
    { month: 'Feb', reviews: 3 }, { month: 'Mar', reviews: 5 }, { month: 'Apr', reviews: 4 },
    { month: 'May', reviews: 7 }, { month: 'Jun', reviews: 6 }, { month: 'Jul', reviews: 4 },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Pending Review" value={String(submitted.length)} change="awaiting action" positive={true} icon={BookOpen} color="#6B46C1" />
        <StatCard label="Reviewed This Month" value="4" change="+2 vs last month" positive={true} icon={Activity} color="#1F7A6C" />
        <StatCard label="Avg. Review Time" value="3.2d" change="-0.5d vs last month" positive={true} icon={CalendarDays} color="#C9A24B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        {/* Pending review queue */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Publications Awaiting Review</h3>
            <span style={{ padding: '3px 10px', background: '#f3eeff', color: '#6B46C1', fontSize: 12, fontWeight: 700, borderRadius: 99 }}>
              {submitted.length} pending
            </span>
          </div>
          {submitted.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No publications pending review.</div>
          ) : (
            submitted.map((p, i) => (
              <div key={p.id} style={{
                padding: '14px 20px',
                borderBottom: i < submitted.length - 1 ? '1px solid #F9FAFB' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5, color: '#1B1F27', lineHeight: 1.4, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12.5, color: '#5B6472' }}>{p.venue} · {p.year}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Badge status={p.status} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review activity chart */}
        <div className="card">
          <div style={{ padding: '16px 20px 10px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>My Review Activity</h3>
          </div>
          <div style={{ padding: '12px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={reviewActivity} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="reviews" fill="#6B46C1" radius={[4, 4, 0, 0]} name="Reviews" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: '12px 20px 16px', display: 'flex', gap: 12 }}>
            {[
              { label: 'Approved', val: 18, color: '#1F7A6C', bg: '#e8f5f3' },
              { label: 'Changes Requested', val: 7, color: '#C9822E', bg: '#fef4e8' },
              { label: 'Pending', val: submitted.length, color: '#6B46C1', bg: '#f3eeff' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, padding: '10px 8px', background: s.bg, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: s.color, marginTop: 2, opacity: 0.85 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { role: appRole } = useRole();

  // Reviewer always gets their own dashboard; System Admin can switch views
  const defaultView = appRole === 'System Admin' ? 'Admin'
    : appRole === 'Institution Admin' ? 'Institution'
    : appRole === 'Reviewer' ? 'Reviewer'
    : 'Researcher';
  const [view, setView] = useState(defaultView);

  const effectiveView = appRole === 'System Admin' ? view : defaultView;

  const viewLabel: Record<string, string> = {
    Researcher: 'My Research Overview',
    Institution: 'Institution Analytics',
    Admin: 'System Administration',
    Reviewer: 'Review Queue',
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1B1F27', margin: '0 0 4px' }}>
            {viewLabel[effectiveView]}
          </h2>
          <p style={{ fontSize: 13.5, color: '#5B6472', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {appRole === 'System Admin' && (
          <div style={{ display: 'flex', background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8' }}>
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setView(r)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: view === r ? '#16324F' : 'transparent',
                  color: view === r ? '#fff' : '#5B6472',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {effectiveView === 'Researcher' && <ResearcherDashboard />}
      {effectiveView === 'Institution' && <InstitutionDashboard />}
      {effectiveView === 'Admin' && <AdminDashboard />}
      {effectiveView === 'Reviewer' && <ReviewerDashboard />}
    </div>
  );
}
