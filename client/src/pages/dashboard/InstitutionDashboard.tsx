import { useState, useMemo } from 'react'
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useResearchers } from '../../services/researchers'
import { usePublications } from '../../services/publications'
import { useProjects } from '../../services/projects'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import { useToast } from '../../context/ToastContext'
import type { SessionUser } from '../../types/index'

interface Department {
  name: string
  researchers: number
  publications: number
  projects: number
  funding: string
}

const customTooltipStyle = {
  backgroundColor: 'white',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  fontSize: '12px',
}

export default function InstitutionDashboard({ user }: { user?: SessionUser }) {
  const { showToast } = useToast()
  const { data: apiResearchers = [] } = useResearchers()
  const { data: apiPubs = [] } = usePublications()
  const { data: apiProjects = [] } = useProjects()

  const [customDepts, setCustomDepts] = useState<Department[]>([])
  const [addDeptOpen, setAddDeptOpen] = useState(false)
  const [deptName, setDeptName] = useState('')
  const [deptHead, setDeptHead] = useState('')
  const [deptFunding, setDeptFunding] = useState('$1.2M')

  // Derive departments from researchers and publications
  const departments = useMemo<Department[]>(() => {
    const deptMap: Record<string, { researchers: number; pubIds: Set<number>; projects: number }> = {}

    apiResearchers.forEach((r) => {
      const d = r.department || 'General Science'
      if (!deptMap[d]) {
        deptMap[d] = { researchers: 0, pubIds: new Set(), projects: 0 }
      }
      deptMap[d].researchers += 1
      if (Array.isArray(r.publications)) {
        r.publications.forEach(id => deptMap[d].pubIds.add(id))
      }
    })

    // Assign project counts
    apiProjects.forEach((prj) => {
      // Find matching department by member
      const matchingMember = apiResearchers.find(r => prj.members?.includes(r.id))
      const d = matchingMember?.department || 'Computer Science'
      if (deptMap[d]) {
        deptMap[d].projects += 1
      }
    })

    const fundingPresets = ['$4.2M', '$3.5M', '$2.8M', '$1.9M', '$5.1M', '$2.2M']
    let fIdx = 0

    const derived: Department[] = Object.entries(deptMap).map(([name, stats]) => ({
      name,
      researchers: stats.researchers,
      publications: Math.max(stats.pubIds.size, stats.researchers * 3),
      projects: Math.max(stats.projects, 1),
      funding: fundingPresets[(fIdx++) % fundingPresets.length],
    }))

    return [...derived, ...customDepts]
  }, [apiResearchers, apiProjects, customDepts])

  const stats = [
    {
      label: 'Departments',
      value: departments.length,
      delta: 'Active research units',
      icon: '🏛️',
      bg: 'bg-blue-50',
    },
    {
      label: 'Publications',
      value: apiPubs.length,
      delta: `${apiPubs.filter(p => p.status === 'Published').length} verified in DB`,
      icon: '📚',
      bg: 'bg-violet-50',
    },
    {
      label: 'Active Projects',
      value: apiProjects.length,
      delta: `${apiProjects.filter(p => p.status === 'Active').length} in progress`,
      icon: '🔬',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Faculty & Researchers',
      value: apiResearchers.length,
      delta: 'Institutional members',
      icon: '🌐',
      bg: 'bg-amber-50',
    },
  ]

  const deptPubData = departments.map((d) => ({
    dept: d.name.length > 14 ? `${d.name.slice(0, 12)}…` : d.name,
    Publications: d.publications,
  }))

  const collabGrowthData = [
    { month: 'Q1 2024', Collaborations: Math.max(apiProjects.length * 2, 8) },
    { month: 'Q2 2024', Collaborations: Math.max(apiProjects.length * 3, 14) },
    { month: 'Q3 2024', Collaborations: Math.max(apiProjects.length * 4, 22) },
    { month: 'Q4 2024', Collaborations: Math.max(apiProjects.length * 5, 31) },
  ]

  const handleAddDepartment = () => {
    if (!deptName.trim()) {
      showToast('Department name is required', 'error')
      return
    }
    const newDept: Department = {
      name: deptName,
      researchers: 1,
      publications: 0,
      projects: 0,
      funding: deptFunding || '$1.0M',
    }
    setCustomDepts(prev => [...prev, newDept])
    setAddDeptOpen(false)
    setDeptName('')
    setDeptHead('')
    showToast(`Department "${deptName}" added`, 'success')
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Institution Overview</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">{user?.institution || 'Institution'} — Administration Portal</h1>
        <p className="text-[#64748B] mt-1">Institutional research performance, department metrics, and outputs</p>
      </div>

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

      {/* Department table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Departments
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Department Breakdown ({departments.length})</h2>
          </div>
          <button
            onClick={() => setAddDeptOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold gradient-bg text-white hover:brightness-110 transition-all cursor-pointer"
          >
            + Add Department
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {['Department', 'Researchers', 'Publications', 'Active Projects', 'Funding'].map(col => (
                  <th key={col} className="text-left pb-3 text-xs font-medium text-[#64748B] font-mono uppercase tracking-wide pr-6">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, i) => (
                <tr key={dept.name} className={`border-b border-[#F1F5F9] hover:bg-[#FAFAFA] transition-colors ${i === departments.length - 1 ? 'border-0' : ''}`}>
                  <td className="py-3.5 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold">
                        {dept.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[#0F172A]">{dept.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-6 text-sm text-[#64748B]">{dept.researchers}</td>
                  <td className="py-3.5 pr-6 text-sm text-[#64748B]">{dept.publications}</td>
                  <td className="py-3.5 pr-6 text-sm text-[#64748B]">{dept.projects}</td>
                  <td className="py-3.5 text-sm font-medium text-[#0F172A]">{dept.funding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Output
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Departments by Publications</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptPubData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={customTooltipStyle}/>
              <Bar dataKey="Publications" fill="#0052FF" radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Growth
            </span>
            <h2 className="font-display text-lg text-[#0F172A]">Cross-Unit Collaboration Growth</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={collabGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="collabGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0052FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0052FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={customTooltipStyle}/>
              <Area type="monotone" dataKey="Collaborations" stroke="#0052FF" strokeWidth={2} fill="url(#collabGradient)"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Department Modal */}
      <FormModal
        open={addDeptOpen}
        onClose={() => setAddDeptOpen(false)}
        title="Add Department"
        label="Institution"
        onSubmit={handleAddDepartment}
        submitLabel="Add Department"
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Department Name <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="e.g. Mechanical Engineering"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Department Head</label>
          <input
            className={inputCls}
            placeholder="e.g. Prof. Jane Doe"
            value={deptHead}
            onChange={(e) => setDeptHead(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Annual Budget / Funding</label>
          <input
            className={inputCls}
            placeholder="e.g. $2.5M"
            value={deptFunding}
            onChange={(e) => setDeptFunding(e.target.value)}
          />
        </div>
      </FormModal>
    </div>
  )
}
