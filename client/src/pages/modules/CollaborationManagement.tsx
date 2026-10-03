import { useState } from 'react'
import { Project, Researcher } from '../../types/index'
import type { SessionUser } from '../../types/index'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../../services/projects'
import { useResearchers } from '../../services/researchers'
import { useTasks, useCreateTask, useUpdateTask } from '../../services/tasks'
import type { ProjectTask } from '../../services/tasks'
import { hasPermission } from '../../permissions/config'
import Drawer from '../../layout/Drawer'
import FormModal, { inputCls, TagInput } from '../../components/Modals/FormModal'
import NetworkGraph from '../../components/NetworkGraph'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const statusColors: Record<string, string> = {
  Active: 'gradient-bg text-white',
  Completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Paused: 'bg-amber-50 text-amber-700 border border-amber-200',
}

interface CoAuthor {
  name: string
  institution: string
  papers: number
  lastCollab: string
  status: string
}

interface InstCollab {
  name: string
  type: string
  since: string
  projects: number
  pubs: number
  leadContact: string
  email: string
  focusAreas: string[]
  agreementStatus: 'Active' | 'Under Renewal' | 'Pending'
  keyInitiatives: string[]
}

const coauthors: CoAuthor[] = []

const instCollabs: InstCollab[] = []


function ResearcherDrawerContent({ researcher }: { researcher: Researcher }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {researcher.initials}
        </div>
        <div>
          <h3 className="font-display text-lg text-[#0F172A]">{researcher.name}</h3>
          <p className="text-sm text-[#64748B]">{researcher.role}</p>
          <p className="text-xs text-[#64748B]">{researcher.email}</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Institution / Department</p>
        <p className="text-sm font-medium text-[#0F172A]">{researcher.institution}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{researcher.department}</p>
      </div>

      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Biography</p>
        <p className="text-xs text-[#64748B] leading-relaxed">{researcher.bio}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{researcher.h_index}</p>
          <p className="text-[10px] text-[#64748B]">h-index</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{researcher.citations_total.toLocaleString()}</p>
          <p className="text-[10px] text-[#64748B]">Citations</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{researcher.publications.length}</p>
          <p className="text-[10px] text-[#64748B]">Publications</p>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-2">Specializations</p>
        <div className="flex flex-wrap gap-1.5">
          {researcher.skills.map((skill) => (
            <span key={skill} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProjectDrawerContent({
  project,
  onEdit,
  onViewTasks,
  onDelete,
  researchers,
}: {
  project: Project
  onEdit: () => void
  onViewTasks: () => void
  onDelete: () => void
  researchers: Researcher[]
}) {
  const members = researchers.filter((r) => project.members.includes(r.id))

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
          {project.status}
        </span>
        <span className="text-xs text-[#64748B] font-mono">ID: PROJ-{project.id}</span>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Title</p>
        <h3 className="font-display text-xl text-[#0F172A] leading-snug">{project.title}</h3>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Description</p>
        <p className="text-sm text-[#64748B] leading-relaxed">{project.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F1F5F9]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Principal Investigator</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {project.pi.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <p className="text-sm font-medium text-[#0F172A]">{project.pi}</p>
          </div>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Start Date</p>
          <p className="text-sm font-medium text-[#0F172A]">{project.startDate}</p>
        </div>
        {project.endDate && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Target Completion</p>
            <p className="text-sm font-medium text-[#0F172A]">{project.endDate}</p>
          </div>
        )}
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-2">Research Domains</p>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{tag}</span>
          ))}
        </div>
      </div>

      {members.length > 0 && (
        <div className="pt-4 border-t border-[#F1F5F9]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-3">Team Members ({members.length})</p>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{member.name}</p>
                    <p className="text-xs text-[#64748B]">{member.institution} · {member.role}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-full text-[#64748B]">h-index {member.h_index}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-[#F1F5F9]">
        <button
          onClick={onEdit}
          className="flex-1 py-2.5 rounded-xl border border-[#0052FF] text-sm font-semibold text-[#0052FF] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit Project
        </button>
        <button
          onClick={onViewTasks}
          className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          View Tasks
        </button>
        <button
          onClick={onDelete}
          className="py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
          title="Delete project"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  )
}

function InstCollabDrawerContent({ partner }: { partner: InstCollab }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {partner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </div>
        <div>
          <h3 className="font-display text-lg text-[#0F172A]">{partner.name}</h3>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {partner.type} Agreement
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{partner.since}</p>
          <p className="text-[10px] text-[#64748B]">Partner Since</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{partner.projects}</p>
          <p className="text-[10px] text-[#64748B]">Active Projects</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{partner.pubs}</p>
          <p className="text-[10px] text-[#64748B]">Joint Papers</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Lead Institutional Contact</p>
        <p className="text-sm font-semibold text-[#0F172A]">{partner.leadContact}</p>
        <p className="text-xs text-[#0052FF] font-medium mt-0.5">{partner.email}</p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-2">Primary Focus Areas</p>
        <div className="flex flex-wrap gap-1.5">
          {partner.focusAreas.map(area => (
            <span key={area} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
              {area}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-2">Key Joint Initiatives</p>
        <ul className="space-y-2">
          {partner.keyInitiatives.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-[#0F172A] bg-white border border-[#E2E8F0] p-2.5 rounded-xl">
              <span className="text-[#0052FF] font-bold">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
        <span>Agreement Status:</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${partner.agreementStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
          {partner.agreementStatus}
        </span>
      </div>
    </div>
  )
}

interface NewProject {
  title: string
  description: string
  status: string
  pi: string
  tags: string[]
  startDate: string
  endDate: string
}

export default function CollaborationManagement({ user }: { user?: SessionUser }) {
  const { showToast } = useToast()
  const [viewMode, setViewMode] = useState<'list' | 'network'>('list')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null)
  const [selectedInstCollab, setSelectedInstCollab] = useState<InstCollab | null>(null)

  const { data: apiProjects } = useProjects()
  const { data: apiResearchers } = useResearchers()
  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()

  const localProjects = apiProjects || []
  const researchers = apiResearchers || []

  const { data: apiTasks = [] } = useTasks()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const activeTasks = apiTasks

  // Modals & Drawers state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [tasksDrawerOpen, setTasksDrawerOpen] = useState(false)
  const [tasksProject, setTasksProject] = useState<Project | null>(null)

  // Form states
  const [newP, setNewP] = useState<NewProject>({
    title: '', description: '', status: 'Active', pi: '', tags: [], startDate: '', endDate: ''
  })
  const [editP, setEditP] = useState<Project | null>(null)

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskAssignee, setNewTaskAssignee] = useState(researchers[0].name)
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')

  const [filterStatus, setFilterStatus] = useState('All')
  const [filterMember, setFilterMember] = useState('All')

  const filteredProjects = localProjects.filter((p) => {
    const statusMatch = filterStatus === 'All' || p.status === filterStatus
    const memberMatch = filterMember === 'All' || p.members.some(
      (mid) => researchers.find(r => r.id === mid)?.name === filterMember
    )
    return statusMatch && memberMatch
  })

  // Create Project
  const handleAddProject = () => {
    if (!newP.title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    createProjectMutation.mutate(
      {
        title: newP.title,
        description: newP.description || 'No description provided',
        status: newP.status as Project['status'],
        pi: newP.pi || 'Dr. Sarah Chen',
        members: [1, 2],
        startDate: newP.startDate || new Date().toISOString().split('T')[0],
        endDate: newP.endDate || undefined,
        tags: newP.tags.length > 0 ? newP.tags : ['Research'],
      },
      {
        onSuccess: (project) => {
          setCreateModalOpen(false)
          setNewP({ title: '', description: '', status: 'Active', pi: '', tags: [], startDate: '', endDate: '' })
          showToast(`Project "${project.title}" created successfully!`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to create project', 'error')
        },
      }
    )
  }

  // Edit Project
  const openEditModal = (proj: Project) => {
    setEditP(proj)
    setEditModalOpen(true)
  }

  const handleUpdateProject = () => {
    if (!editP || !editP.title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    const { id, ...data } = editP
    updateProjectMutation.mutate(
      { id, data: { ...data, status: editP.status as Project['status'] } },
      {
        onSuccess: (project) => {
          if (selectedProject?.id === project.id) {
            setSelectedProject(project)
          }
          setEditModalOpen(false)
          showToast(`Project "${project.title}" updated`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to update project', 'error')
        },
      }
    )
  }

  // Delete Project
  const handleDeleteProject = (proj: Project) => {
    if (!window.confirm(`Delete project "${proj.title.slice(0, 60)}"? This cannot be undone.`)) return
    deleteProjectMutation.mutate(proj.id, {
      onSuccess: () => {
        if (selectedProject?.id === proj.id) setSelectedProject(null)
        showToast(`Project "${proj.title}" deleted`, 'success')
      },
      onError: (err: any) => {
        showToast(err?.response?.data?.detail || 'Failed to delete project', 'error')
      },
    })
  }

  // View Tasks
  const openTasksDrawer = (proj: Project) => {
    setTasksProject(proj)
    setTasksDrawerOpen(true)
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !tasksProject) {
      showToast('Task title is required', 'error')
      return
    }
    createTaskMutation.mutate(
      {
        projectId: tasksProject.id,
        title: newTaskTitle,
        assignee: newTaskAssignee,
        dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
        status: 'In Progress',
        priority: newTaskPriority,
      },
      {
        onSuccess: () => {
          setNewTaskTitle('')
          showToast('Task added to project', 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to add task', 'error')
        },
      }
    )
  }

  const toggleTaskStatus = (taskId: number) => {
    const task = activeTasks.find(t => t.id === taskId)
    if (!task) return
    updateTaskMutation.mutate(
      { id: taskId, data: { status: task.status === 'Completed' ? 'In Progress' : 'Completed' } },
      {
        onSuccess: () => showToast('Task status updated', 'info'),
        onError: (err: any) => showToast(err?.response?.data?.detail || 'Failed to update task', 'error'),
      }
    )
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3 border border-[#E2E8F0]">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Collaboration Management Module</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Collaboration Network</h1>
        <p className="text-[#64748B] mt-1">Co-author records, joint research projects, and institutional partnerships</p>
      </div>

      {/* View mode toggle */}
      <div className="flex gap-1 mb-6 bg-[#F1F5F9] p-1 rounded-xl w-fit border border-[#E2E8F0]">
        {(['list', 'network'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${viewMode === mode ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
          >
            {mode === 'list' ? ' List View' : ' Network View'}
          </button>
        ))}
      </div>

      {viewMode === 'network' && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] mb-6 shadow-sm network-card">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#F1F5F9]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Network Graph
              </span>
              <p className="text-xs text-[#64748B]">Hover nodes to explore connections. Click to view researcher profile.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full gradient-bg inline-block"></span> Lead Researchers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#E2E8F0] border border-[#94A3B8] inline-block"></span> Collaborators
              </span>
            </div>
          </div>
          <div className="network-card-body">
            <NetworkGraph
              researchers={researchers}
              projects={localProjects}
              onNodeClick={(id) => {
                const r = researchers.find(res => res.id === id)
                if (r) setSelectedResearcher(r)
              }}
            />
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Co-authors */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Co-authors
                  </span>
                  <h3 className="font-display text-base text-[#0F172A]">Co-author Records</h3>
                </div>
                <button
                  onClick={() => setViewMode('network')}
                  className="text-xs text-[#0052FF] font-semibold hover:underline"
                >
                  View network →
                </button>
              </div>
              <div className="space-y-2">
                {coauthors.map((ca) => (
                  <div
                    key={ca.name}
                    onClick={() => {
                      const found = researchers.find(r => r.name === ca.name)
                      if (found) setSelectedResearcher(found)
                      else showToast(`Co-author profile for ${ca.name}`, 'info')
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer border border-transparent hover:border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                        {ca.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{ca.name}</p>
                        <p className="text-xs text-[#64748B]">{ca.institution} · {ca.papers} joint papers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${ca.status === 'Active' ? 'gradient-bg text-white' : 'bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]'
                        }`}>{ca.status}</span>
                      <p className="text-[10px] text-[#64748B] mt-0.5">Last: {ca.lastCollab}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Research projects */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Projects
                  </span>
                  <h3 className="font-display text-base text-[#0F172A]">Research Projects</h3>
                </div>
                {hasPermission(user, 'research.createCollaboration') && (
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 shadow-sm transition-all flex items-center gap-1"
                  >
                    + New Project
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-3">
                <select
                  className="flex-1 px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-xs text-[#64748B] focus:outline-none border border-[#E2E8F0]"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Paused">Paused</option>
                </select>
                <select
                  className="flex-1 px-3 py-1.5 bg-[#F1F5F9] rounded-lg text-xs text-[#64748B] focus:outline-none border border-[#E2E8F0]"
                  value={filterMember}
                  onChange={e => setFilterMember(e.target.value)}
                >
                  <option value="All">All members</option>
                  {researchers.map(r => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {filteredProjects.length === 0 && (
                  <EmptyState icon="🔬" title="No projects found" subtitle="Try adjusting your filters" />
                )}
                {filteredProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className="p-4 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors cursor-pointer border border-[#F1F5F9] hover:border-[#E2E8F0]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-[#0F172A] leading-snug flex-1 pr-3">{proj.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${statusColors[proj.status]}`}>
                        {proj.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mb-2">PI: <span className="font-medium text-[#0F172A]">{proj.pi}</span></p>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="flex flex-wrap gap-1">
                        {proj.tags.slice(0, 3).map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md text-[10px] bg-blue-50 text-blue-700 font-medium border border-blue-100">{t}</span>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#0052FF] font-semibold hover:underline">View details →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Institutional collaborations */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>Institutional
                </span>
                <h3 className="font-display text-base text-[#0F172A]">Institutional Partnerships</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0]">
                    {['Institution', 'Agreement Type', 'Since', 'Active Projects', 'Joint Publications', 'Action'].map(col => (
                      <th key={col} className="text-left pb-3 pr-6 text-xs font-mono uppercase tracking-wide text-[#64748B]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instCollabs.map((ic) => (
                    <tr key={ic.name} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                            {ic.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#0F172A] block">{ic.name}</span>
                            <span className="text-[10px] text-[#64748B]">Contact: {ic.leadContact}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">{ic.type}</span>
                      </td>
                      <td className="py-3.5 pr-6 text-sm text-[#64748B]">{ic.since}</td>
                      <td className="py-3.5 pr-6 text-sm font-semibold text-[#0F172A]">{ic.projects}</td>
                      <td className="py-3.5 pr-6 text-sm font-semibold text-[#0F172A]">{ic.pubs}</td>
                      <td className="py-3.5">
                        <button
                          onClick={() => setSelectedInstCollab(ic)}
                          className="px-3 py-1 rounded-lg text-xs text-[#0052FF] font-semibold hover:bg-blue-50 border border-blue-200 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Researcher drawer */}
      <Drawer
        open={selectedResearcher !== null}
        onClose={() => setSelectedResearcher(null)}
        title="Researcher Profile"
      >
        {selectedResearcher && <ResearcherDrawerContent researcher={selectedResearcher} />}
      </Drawer>

      {/* Project Details drawer */}
      <Drawer
        open={selectedProject !== null}
        onClose={() => setSelectedProject(null)}
        title="Project Details"
      >
        {selectedProject && (
          <ProjectDrawerContent
            project={selectedProject}
            onEdit={() => {
              openEditModal(selectedProject)
            }}
            onViewTasks={() => {
              openTasksDrawer(selectedProject)
            }}
            onDelete={() => {
              handleDeleteProject(selectedProject)
            }}
            researchers={researchers}
          />
        )}
      </Drawer>

      {/* Institutional Partnership Details drawer */}
      <Drawer
        open={selectedInstCollab !== null}
        onClose={() => setSelectedInstCollab(null)}
        title="Institutional Partnership Details"
      >
        {selectedInstCollab && <InstCollabDrawerContent partner={selectedInstCollab} />}
      </Drawer>

      {/* View/Manage Project Tasks Drawer */}
      <Drawer
        open={tasksDrawerOpen}
        onClose={() => setTasksDrawerOpen(false)}
        title={tasksProject ? `Tasks — ${tasksProject.title}` : 'Project Tasks'}
      >
        {tasksProject && (
          <div className="space-y-6">
            {/* Task summary */}
            <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded-xl border border-[#E2E8F0]">
              <div>
                <p className="text-xs text-[#64748B]">Total Tasks</p>
                <p className="text-xl font-bold text-[#0F172A]">
                  {activeTasks.filter(t => t.projectId === tasksProject.id).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Completed</p>
                <p className="text-xl font-bold text-emerald-600">
                  {activeTasks.filter(t => t.projectId === tasksProject.id && t.status === 'Completed').length}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">In Progress</p>
                <p className="text-xl font-bold text-blue-600">
                  {activeTasks.filter(t => t.projectId === tasksProject.id && t.status === 'In Progress').length}
                </p>
              </div>
            </div>

            {/* Task list */}
            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-3">Task Deliverables</h4>
              <div className="space-y-2.5">
                {activeTasks.filter(t => t.projectId === tasksProject.id).length === 0 ? (
                  <p className="text-xs text-[#94A3B8] italic p-4 text-center border border-dashed rounded-xl">No tasks created for this project yet.</p>
                ) : (
                  activeTasks
                    .filter(t => t.projectId === tasksProject.id)
                    .map(task => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-xl border transition-all ${task.status === 'Completed' ? 'bg-[#FAFAFA] border-[#E2E8F0] opacity-75' : 'bg-white border-[#E2E8F0] shadow-sm'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.status === 'Completed'}
                            onChange={() => toggleTaskStatus(task.id)}
                            className="mt-1 h-4 w-4 rounded border-[#E2E8F0] text-[#0052FF] focus:ring-[#0052FF] cursor-pointer"
                          />
                          <div className="flex-1">
                            <p className={`text-xs font-semibold ${task.status === 'Completed' ? 'line-through text-[#64748B]' : 'text-[#0F172A]'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center justify-between mt-2 text-[10px] text-[#64748B]">
                              <span>Assignee: <strong className="text-[#0F172A]">{task.assignee}</strong></span>
                              <span>Due: {task.dueDate}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Add task form */}
            <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Add New Task</h4>
              <div>
                <input
                  type="text"
                  placeholder="Task title..."
                  className={inputCls}
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#64748B] uppercase font-mono mb-1">Assignee</label>
                  <select
                    className={inputCls}
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                  >
                    {researchers.map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#64748B] uppercase font-mono mb-1">Priority</label>
                  <select
                    className={inputCls}
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-[#64748B] uppercase font-mono mb-1">Due Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                />
              </div>
              <button
                onClick={handleAddTask}
                className="w-full py-2.5 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 transition-all shadow-sm"
              >
                + Add Task to Project
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* New Project Modal */}
      <FormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="New Research Project"
        label="Collaboration Mgmt"
        onSubmit={handleAddProject}
        submitLabel="Create Project"
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Project Title <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="e.g. Federated Graph Learning for Genomic Data"
            value={newP.title}
            onChange={(e) => setNewP({ ...newP, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Description</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="Project objective, methodology, and expected outcomes..."
            value={newP.description}
            onChange={(e) => setNewP({ ...newP, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
            <select
              className={inputCls}
              value={newP.status}
              onChange={(e) => setNewP({ ...newP, status: e.target.value })}
            >
              {['Active', 'Paused', 'Completed'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Start Date</label>
            <input
              className={inputCls}
              type="date"
              value={newP.startDate}
              onChange={(e) => setNewP({ ...newP, startDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Principal Investigator</label>
          <input
            className={inputCls}
            placeholder="Dr. Sarah Chen"
            value={newP.pi}
            onChange={(e) => setNewP({ ...newP, pi: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Tags & Domains</label>
          <TagInput
            tags={newP.tags}
            onChange={(tags) => setNewP({ ...newP, tags })}
            placeholder="e.g. Federated Learning, Graph AI"
          />
        </div>
      </FormModal>

      {/* Edit Project Modal */}
      {editP && (
        <FormModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Research Project"
          label="Collaboration Mgmt"
          onSubmit={handleUpdateProject}
          submitLabel="Save Changes"
        >
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Project Title <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              value={editP.title}
              onChange={(e) => setEditP({ ...editP, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={editP.description}
              onChange={(e) => setEditP({ ...editP, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
              <select
                className={inputCls}
                value={editP.status}
                onChange={(e) => setEditP({ ...editP, status: e.target.value as Project['status'] })}
              >
                {['Active', 'Paused', 'Completed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Start Date</label>
              <input
                className={inputCls}
                type="date"
                value={editP.startDate}
                onChange={(e) => setEditP({ ...editP, startDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Principal Investigator</label>
            <input
              className={inputCls}
              value={editP.pi}
              onChange={(e) => setEditP({ ...editP, pi: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Tags & Domains</label>
            <TagInput
              tags={editP.tags}
              onChange={(tags) => setEditP({ ...editP, tags })}
              placeholder="Add tags..."
            />
          </div>
        </FormModal>
      )}
    </div>
  )
}
