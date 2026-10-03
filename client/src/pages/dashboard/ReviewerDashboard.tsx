import { useState } from 'react'
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface ReviewerDashboardProps {
  onOpenReview: (pubId: number) => void
}

const stats = [
  { label: 'Assigned Reviews', value: '14', delta: 'Total assignments', icon: '📋', bg: 'bg-blue-50' },
  { label: 'Pending', value: '6', delta: 'Awaiting action', icon: '⏳', bg: 'bg-amber-50' },
  { label: 'Completed', value: '7', delta: 'This quarter', icon: '✅', bg: 'bg-emerald-50' },
  { label: 'Overdue', value: '1', delta: 'Requires attention', icon: '🔴', bg: 'bg-red-50' },
]

const reviews = [
  {
    id: 1,
    title: 'Transformer Models for Scientific Graph Embeddings',
    author: 'Zhang, L. et al.',
    institution: 'Tsinghua University',
    submitted: 'Nov 25, 2024',
    deadline: 'Dec 10, 2024',
    status: 'Pending',
  },
  {
    id: 2,
    title: 'Privacy Challenges in Cross-Silo Federated Learning',
    author: 'Torres, E., Nakamura, R.',
    institution: 'Oxford University',
    submitted: 'Nov 22, 2024',
    deadline: 'Dec 7, 2024',
    status: 'In Progress',
  },
  {
    id: 3,
    title: 'Distributed Machine Learning at Petascale',
    author: 'Okafor, J., Williams, S.',
    institution: 'Cambridge University',
    submitted: 'Nov 18, 2024',
    deadline: 'Dec 3, 2024',
    status: 'Overdue',
  },
  {
    id: 4,
    title: 'Advances in Quantum Error Correction via Neural Decoders',
    author: 'IBM Research Team',
    institution: 'IBM Research',
    submitted: 'Nov 15, 2024',
    deadline: 'Nov 30, 2024',
    status: 'Completed',
  },
  {
    id: 5,
    title: 'Large Language Models for Biochemical Property Prediction',
    author: 'Sharma, P., Mehta, V.',
    institution: 'IIT Bombay',
    submitted: 'Nov 12, 2024',
    deadline: 'Nov 27, 2024',
    status: 'Completed',
  },
  {
    id: 6,
    title: 'Climate Model Calibration Using Ensemble Neural Networks',
    author: 'Tanaka, Y. et al.',
    institution: 'University of Tokyo',
    submitted: 'Nov 28, 2024',
    deadline: 'Dec 14, 2024',
    status: 'Pending',
  },
]

const statusStyles: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  Overdue: 'bg-red-50 text-red-700',
  Completed: 'bg-emerald-50 text-emerald-700',
}

const reviewsByMonthData = [
  { month: 'Jan', Completed: 2, Pending: 1 },
  { month: 'Feb', Completed: 3, Pending: 2 },
  { month: 'Mar', Completed: 1, Pending: 3 },
  { month: 'Apr', Completed: 4, Pending: 2 },
  { month: 'May', Completed: 2, Pending: 1 },
  { month: 'Jun', Completed: 3, Pending: 2 },
]

const customTooltipStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '12px',
}

export default function ReviewerDashboard({ onOpenReview }: ReviewerDashboardProps) {
  const [statusFilter, setStatusFilter] = useState('all')
  const filteredReviews = statusFilter === 'all' ? reviews : reviews.filter(r => r.status === statusFilter)

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
                  <p className="text-sm font-medium text-[#0F172A] leading-snug">{r.title}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-[#0F172A]">{r.author}</p>
                  <p className="text-xs text-[#64748B]">{r.institution}</p>
                </td>
                <td className="px-5 py-4 text-sm text-[#64748B] whitespace-nowrap">{r.submitted}</td>
                <td className="px-5 py-4">
                  <span className={`text-sm whitespace-nowrap ${r.status === 'Overdue' ? 'text-red-600 font-medium' : 'text-[#64748B]'}`}>
                    {r.deadline}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[r.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      r.status === 'Pending' ? 'bg-amber-500' :
                      r.status === 'In Progress' ? 'bg-blue-500' :
                      r.status === 'Overdue' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}></span>
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
                    <button className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors whitespace-nowrap">
                      View Result
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={reviewsByMonthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={customTooltipStyle}/>
            <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }}/>
            <Bar dataKey="Completed" fill="#10B981" radius={[4, 4, 0, 0]}/>
            <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
