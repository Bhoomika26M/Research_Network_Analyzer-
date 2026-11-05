import { useState, type CSSProperties } from 'react'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import { useToast } from '../../context/ToastContext'
import { useResearchers } from '../../services/researchers'
import { useProjects } from '../../services/projects'
import { useTeams, useCreateTeam, useUpdateTeam, type Team } from '../../services/teams'

const avatarColors = ['gradient-bg', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500']

export default function TeamManagement() {
  const { showToast } = useToast()
  const { data: teams = [] } = useTeams()
  const createTeamMutation = useCreateTeam()
  const updateTeamMutation = useUpdateTeam()

  // Live researchers/projects for the member and project pickers
  const { data: researchers = [] } = useResearchers()
  const { data: projects = [] } = useProjects()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)

  // New Team modal
  const [newTeamOpen, setNewTeamOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamDesc, setNewTeamDesc] = useState('')
  const [newTeamProject, setNewTeamProject] = useState('')
  const [newTeamLead, setNewTeamLead] = useState('')

  // Add Member modal
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [addMemberTeamId, setAddMemberTeamId] = useState<number | null>(null)
  const [newMemberResearcherId, setNewMemberResearcherId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Researcher')

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      showToast('Team name is required', 'error')
      return
    }
    const leadResearcher = researchers.find(r => String(r.id) === newTeamLead)
    createTeamMutation.mutate(
      {
        name: newTeamName,
        project: newTeamProject || 'No project assigned',
        members: leadResearcher
          ? [{ name: leadResearcher.name, role: 'Team Lead', initials: leadResearcher.initials }]
          : [],
      },
      {
        onSuccess: (team) => {
          setNewTeamOpen(false)
          setNewTeamName('')
          setNewTeamDesc('')
          setNewTeamProject('')
          setNewTeamLead('')
          showToast(`Team "${team.name}" created`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to create team', 'error')
        },
      }
    )
  }

  const openAddMember = (teamId: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setAddMemberTeamId(teamId)
    setNewMemberResearcherId('')
    setNewMemberRole('Researcher')
    setAddMemberOpen(true)
  }

  const handleAddMember = () => {
    if (!newMemberResearcherId || addMemberTeamId === null) {
      showToast('Please select a member', 'error')
      return
    }
    const researcher = researchers.find(r => String(r.id) === newMemberResearcherId)
    if (!researcher) return
    const team = teams.find(t => t.id === addMemberTeamId)
    if (!team) return

    updateTeamMutation.mutate(
      {
        id: addMemberTeamId,
        data: {
          members: [...team.members, { name: researcher.name, role: newMemberRole || 'Researcher', initials: researcher.initials }],
        },
      },
      {
        onSuccess: (updated) => {
          if (selectedTeam?.id === addMemberTeamId) {
            setSelectedTeam(updated)
          }
          setAddMemberOpen(false)
          showToast(`${researcher.name} added to ${team.name}`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to add member', 'error')
        },
      }
    )
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">04 — Collaboration Mgmt / Teams</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Team Management</h1>
            <p className="text-[#64748B] mt-1">Manage research teams, members, and project assignments</p>
          </div>
          <button
            onClick={() => setNewTeamOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Team
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Team cards */}
        <div className="flex-1 grid grid-cols-1 gap-4">
          {teams.map((team) => {
            const isSelected = selectedTeam?.id === team.id
            return (
              <div
                key={team.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTeam(isSelected ? null : team)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedTeam(isSelected ? null : team) }}
                className={`text-left p-6 rounded-2xl border-2 bg-white hover:shadow-md transition-all duration-200 cursor-pointer ${
                  isSelected ? '' : 'border-[#E2E8F0] hover:border-[#0052FF]/30'
                }`}
                style={isSelected ? { boxShadow: '0 0 0 2px #0052FF, 0 4px 16px rgba(0,82,255,0.1)' } : {}}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg text-[#0F172A]">{team.name}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5">Project: <span className="text-[#0052FF] font-medium">{team.project}</span></p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl gradient-bg text-white text-xs font-medium">
                    {team.members.length} members
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((m, i) => (
                      <div
                        key={m.name + i}
                        title={m.name}
                        className={`w-9 h-9 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-semibold border-2 border-white avatar-stack-item`}
                        style={{ '--stack': team.members.length - i } as CSSProperties}
                      >
                        {m.initials}
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#64748B] text-xs font-semibold border-2 border-white">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => openAddMember(team.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:border-[#0052FF]/40 hover:text-[#0052FF] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    Add Member
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Side panel */}
        {selectedTeam && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#64748B] mb-0.5">Team</p>
                  <h3 className="font-display text-base text-[#0F172A]">{selectedTeam.name}</h3>
                </div>
                <button onClick={() => setSelectedTeam(null)} className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2l6 6M8 2L2 8" stroke="#64748B" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {selectedTeam.members.map((member, i) => (
                  <div key={member.name + i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAFAFA] transition-colors group">
                    <div className={`w-8 h-8 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{member.name}</p>
                      <p className="text-xs text-[#64748B]">{member.role}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all" title="Remove">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openAddMember(selectedTeam.id)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#0052FF]/30 text-xs font-medium text-[#0052FF] hover:bg-blue-50 hover:border-[#0052FF]/60 transition-all"
              >
                + Add Member
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Team Modal */}
      <FormModal
        open={newTeamOpen}
        onClose={() => setNewTeamOpen(false)}
        title="Create New Team"
        label="Team Management"
        onSubmit={handleCreateTeam}
        submitLabel="Create Team"
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Team Name <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="e.g. Quantum Computing Lab"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Description</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={2}
            placeholder="Team description..."
            value={newTeamDesc}
            onChange={e => setNewTeamDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Project</label>
          <select
            className={inputCls}
            value={newTeamProject}
            onChange={e => setNewTeamProject(e.target.value)}
          >
            <option value="">None</option>
            {projects.map(p => (
              <option key={p.id} value={p.title}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Team Lead</label>
          <select
            className={inputCls}
            value={newTeamLead}
            onChange={e => setNewTeamLead(e.target.value)}
          >
            <option value="">Select team lead...</option>
            {researchers.map(r => (
              <option key={r.id} value={String(r.id)}>{r.name}</option>
            ))}
          </select>
        </div>
      </FormModal>

      {/* Add Member Modal */}
      <FormModal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Add Team Member"
        label="Team Management"
        onSubmit={handleAddMember}
        submitLabel="Add Member"
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Member <span className="text-red-500">*</span></label>
          <select
            className={inputCls}
            value={newMemberResearcherId}
            onChange={e => setNewMemberResearcherId(e.target.value)}
          >
            <option value="">Select researcher...</option>
            {researchers
              .filter(r => {
                const team = teams.find(t => t.id === addMemberTeamId)
                return !team?.members.some(m => m.name === r.name)
              })
              .map(r => (
                <option key={r.id} value={String(r.id)}>{r.name} — {r.institution}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Role</label>
          <input
            className={inputCls}
            placeholder="Researcher"
            value={newMemberRole}
            onChange={e => setNewMemberRole(e.target.value)}
          />
        </div>
      </FormModal>
    </div>
  )
}
