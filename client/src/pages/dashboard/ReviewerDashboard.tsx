import { useState, useMemo } from 'react'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useReviews } from '../../services/reviews'

interface ReviewerDashboardProps {
  onOpenReview: (reviewId: number) => void
}

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  Overdue: 'bg-red-50 text-red-700',
  Completed: 'bg-emerald-50 text-emerald-700',
}

const dotColors: Record<string, string> = {
  Pending: 'bg-amber-500',
  'In Progress': 'bg-blue-500',
  Overdue: 'bg-red-500',
  Completed: 'bg-emerald-500',
}

const customTooltipStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '12px',
}

export default function ReviewerDashboard({ onOpenReview }: ReviewerDashboardProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: reviews = [], isLoading } = useReviews()

  const filteredReviews = statusFilter === 'all'
    ? reviews
    : reviews.filter(r => r.status === statusFilter)

  const stats = useMemo(() => [
    {
      label: 'Assigned Reviews',
      value: reviews.length,
      delta: 'Total assignments',
      icon: '📋',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: reviews.filter(r => r.status === 'Pending').length,
      delta: 'Awaiting action',
      icon: '⏳',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: reviews.filter(r => r.status === 'Completed').length,
      delta: 'This quarter',
      icon: '✅',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Overdue',
      value: reviews.filter(r => r.status === 'Overdue').length,
      delta: 'Requires attention',
      icon: '🔴',
      bg: 'bg-red-50',
    },
  ], [reviews])

  // Build chart data dynamically from reviews (group by month of deadline)
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const map: Record<string, { Completed: number; Pending: number }> = {}
    reviews.forEach(r => {
      const date = r.submitted_date || ''
      const parts = date.split(' ')
      const month = parts[0] || ''
      if (!map[month]) map[month] = { Completed: 0, Pending: 0 }
      if (r.status === 'Completed') map[month].Completed += 1
      else map[month].Pending += 1
    })
    // Return sorted by month order
    return Object.entries(map)
      .sort(([a], [b]) => months.indexOf(a) - months.indexOf(b))
      .map(([month, counts]) => ({ month, ...counts }))
  }, [reviews])

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Reviewer Dashboard</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Review Queue</h1>
        <p className="text-[#64748B] mt-1">Manage your assigned publication reviews and track deadlines</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-lg mb-3`}>
              {stat.icon}
            </div>
            <p className="font-display text-3xl text-[#0F172A]">{stat.value}</p>
            <p className="text-sm font-medium text-[#0F172A] mt-0.5">{stat.label}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{stat.delta}</p>
          </div>
        ))}
      </div>

      {/* Review table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] mb-6">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Assignments
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Assigned Reviews</h2>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] rounded-xl text-xs text-[#64748B] focus:outline-none border-0"
            >
              <option value="all">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 rounded-full border-2 border-[#E2E8F0] border-t-[#0052FF] animate-spin mx-auto mb-3" />
            <p className="text-sm text-[#64748B]">Loading reviews…</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9]">
                {['Publication Title', 'Author / Institution', 'Submitted', 'Deadline', 'Status', ''].map(col => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-medium text-[#64748B] font-mono uppercase tracking-wide">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-[#64748B]">No reviews found for "{statusFilter}"</p>
                    <p className="text-xs text-[#94A3B8] mt-1">Try selecting a different status</p>
                  </td>
                </tr>
              )}
              {filteredReviews.map((r) => (
                <tr key={r.id} className={`border-b border-[#F1F5F9] last:border-0 transition-colors hover:bg-[#FAFAFA] ${r.status === 'Overdue' ? 'bg-red-50/30' : ''}`}>
                  <td className="px-5 py-4 max-w-[280px]">
                    <p className="text-sm font-medium text-[#0F172A] leading-snug">{r.pub_title}</p>
                    {r.pub_venue && (
                      <p className="text-xs text-[#64748B] mt-0.5">{r.pub_venue}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-[#0F172A]">{r.pub_author}</p>
                    <p className="text-xs text-[#64748B]">{r.pub_institution}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#64748B] whitespace-nowrap">{r.submitted_date ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`text-sm whitespace-nowrap ${r.status === 'Overdue' ? 'text-red-600 font-medium' : 'text-[#64748B]'}`}>
                      {r.deadline ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[r.status] ?? 'bg-gray-400'}`}></span>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {r.status !== 'Completed' && (
                      <button
                        onClick={() => onOpenReview(r.id)}
                        className="px-3 py-1.5 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 hover:shadow-sm transition-all whitespace-nowrap"
                      >
                        Open Review
                      </button>
                    )}
                    {r.status === 'Completed' && (
                      <button
                        onClick={() => onOpenReview(r.id)}
                        className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap"
                      >
                        View Result
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reviews by Month chart */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Cadence
          </span>
          <h2 className="font-display text-lg text-[#0F172A]">Reviews by Month</h2>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={customTooltipStyle}/>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }}/>
              <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]}/>
              <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-sm text-[#94A3B8]">No review data available for chart</p>
          </div>
        )}
      </div>
    </div>
  )
}
