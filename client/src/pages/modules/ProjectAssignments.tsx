import { useState } from 'react'
import { useProjects } from '../../services/projects'
import { useResearchers } from '../../services/researchers'
import { useAssignments, useUpsertAssignment, useDeleteAssignment } from '../../services/assignments'
import { useToast } from '../../context/ToastContext'

const fallbackMembers = [
  { name: 'Dr. Sarah Chen', initials: 'SC', role: 'PI' },
  { name: 'Dr. Emma Torres', initials: 'ET', role: 'Co-PI' },
  { name: 'Dr. Amir Khan', initials: 'AK', role: 'Researcher' },
  { name: 'Dr. Priya Sharma', initials: 'PS', role: 'Researcher' },
  { name: 'Dr. Yuki Tanaka', initials: 'YT', role: 'Researcher' },
  { name: 'Tom Nakamura', initials: 'TN', role: 'PhD Student' },
  { name: 'Alice Müller', initials: 'AM', role: 'PhD Student' },
]

const fallbackProjects = [
  { id: 'fedgraph', label: 'FedGraph' },
  { id: 'quantumbio', label: 'Quantum Bio' },
  { id: 'climateai', label: 'Climate AI' },
  { id: 'knowledgegraph', label: 'Knowledge Graph' },
]

type Status = 'Assigned' | 'In Progress' | 'Complete' | null

const initialMatrix: Record<string, Record<string, Status>> = {
  'Dr. Sarah Chen':  { fedgraph: 'In Progress', quantumbio: 'Assigned', climateai: 'Assigned', knowledgegraph: 'In Progress' },
  'Dr. Emma Torres': { fedgraph: 'In Progress', quantumbio: null,       climateai: null,        knowledgegraph: 'Assigned' },
  'Dr. Amir Khan':   { fedgraph: 'Assigned',    quantumbio: null,       climateai: null,        knowledgegraph: 'In Progress' },
  'Dr. Priya Sharma':{ fedgraph: 'Complete',    quantumbio: null,       climateai: null,        knowledgegraph: null },
  'Dr. Yuki Tanaka': { fedgraph: null,          quantumbio: 'In Progress', climateai: 'Assigned', knowledgegraph: null },
  'Tom Nakamura':    { fedgraph: 'Assigned',    quantumbio: 'Assigned', climateai: null,        knowledgegraph: null },
  'Alice Müller':    { fedgraph: null,          quantumbio: null,       climateai: 'In Progress', knowledgegraph: null },
}

const statusStyles: Record<string, string> = {
  Assigned: 'bg-blue-50 text-blue-700 border-blue-100',
  'In Progress': 'gradient-bg text-white border-transparent',
  Complete: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

const nextStatus: Record<string, Status> = {
  Assigned: 'In Progress',
  'In Progress': 'Complete',
  Complete: null,
}

export default function ProjectAssignments() {
  const { showToast } = useToast()
  const { data: apiProjects } = useProjects()
  const { data: apiResearchers } = useResearchers()
  const { data: apiAssignments = [] } = useAssignments()
  const upsertAssignmentMutation = useUpsertAssignment()
  const deleteAssignmentMutation = useDeleteAssignment()

  const projects = apiProjects && apiProjects.length > 0
    ? apiProjects.map(p => ({ id: String(p.id), label: p.title }))
    : fallbackProjects

  const members = apiResearchers && apiResearchers.length > 0
    ? apiResearchers.map(r => ({ name: r.name, initials: r.initials, role: r.role }))
    : fallbackMembers

  // Local fallback only used when the backend is unreachable (fallback members have no ids).
  const [localMatrix, setLocalMatrix] = useState(initialMatrix)
  const [filterProject, setFilterProject] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const researcherIdByName = new Map(apiResearchers?.map(r => [r.name, r.id]) ?? [])
  const assignmentByKey = new Map(
    apiAssignments.map(a => [`${a.researcherId}:${a.projectId}`, a])
  )

  // Matrix is derived from the assignments API so cell edits persist in the DB.
  const matrix: Record<string, Record<string, Status>> = {}
  for (const member of members) {
    matrix[member.name] = {}
    const researcherId = researcherIdByName.get(member.name)
    for (const proj of projects) {
      const status = researcherId
        ? (assignmentByKey.get(`${researcherId}:${Number(proj.id)}`)?.status as Status | undefined) ?? null
        : localMatrix[member.name]?.[proj.id] ?? null
      matrix[member.name][proj.id] = status
    }
  }

  const toggleCell = (memberName: string, projectId: string) => {
    const current = matrix[memberName]?.[projectId] ?? null
    const next = current ? nextStatus[current] : 'Assigned'
    const researcherId = researcherIdByName.get(memberName)

    if (!researcherId) {
      // Backend down / fallback member — keep local-only cycle.
      setLocalMatrix(prev => ({
        ...prev,
        [memberName]: { ...prev[memberName], [projectId]: next },
      }))
      return
    }

    const existing = assignmentByKey.get(`${researcherId}:${Number(projectId)}`)
    if (next === null) {
      if (existing) {
        deleteAssignmentMutation.mutate(existing.id, {
          onSuccess: () => showToast('Assignment removed', 'info'),
          onError: (err: any) => showToast(err?.response?.data?.detail || 'Failed to remove assignment', 'error'),
        })
      }
      return
    }
    upsertAssignmentMutation.mutate(
      {
        projectId: Number(projectId),
        researcherId,
        role: members.find(m => m.name === memberName)?.role ?? 'Researcher',
        status: next,
      },
      {
        onSuccess: () => showToast(`Marked ${next}`, 'info'),
        onError: (err: any) => showToast(err?.response?.data?.detail || 'Failed to update assignment', 'error'),
      }
    )
  }

  const filteredProjects = filterProject === 'all' ? projects : projects.filter(p => p.id === filterProject)
  const filteredMembers = members.filter(m => {
    if (filterStatus === 'all') return true
    return Object.values(matrix[m.name]).some(s => s === filterStatus)
  })

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">04 — Collaboration Mgmt / Assignments</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Project Assignments</h1>
        <p className="text-[#64748B] mt-1">View and update team member assignments across active projects</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mr-2">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Filters
          </span>
          <div>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] rounded-xl text-xs text-[#64748B] focus:outline-none border-0"
            >
              <option value="all">All projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-[#F1F5F9] rounded-xl text-xs text-[#64748B] focus:outline-none border-0"
            >
              <option value="all">All statuses</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
          <p className="text-xs text-[#64748B] ml-auto">Click a cell to cycle status: Assigned → In Progress → Complete → Unassigned</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
                <th className="text-left px-6 py-4 w-56">
                  <span className="font-mono text-[10px] uppercase tracking-wide text-[#64748B]">Team Member</span>
                </th>
                {filteredProjects.map((proj) => (
                  <th key={proj.id} className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-[#0F172A]">{proj.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.name} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">{member.name}</p>
                        <p className="text-xs text-[#64748B]">{member.role}</p>
                      </div>
                    </div>
                  </td>
                  {filteredProjects.map((proj) => {
                    const status = matrix[member.name]?.[proj.id] ?? null
                    return (
                      <td key={proj.id} className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleCell(member.name, proj.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all hover:opacity-80 ${
                            status ? statusStyles[status] : 'border-dashed border-[#E2E8F0] text-[#94A3B8] hover:border-[#0052FF]/40 hover:text-[#0052FF]'
                          }`}
                        >
                          {status ?? '—'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-[#FAFAFA] flex items-center gap-5">
          <span className="font-mono text-[10px] uppercase tracking-wide text-[#94A3B8]">Status</span>
          {(['Assigned', 'In Progress', 'Complete'] as const).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${statusStyles[s]}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
