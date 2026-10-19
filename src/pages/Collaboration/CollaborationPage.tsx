import { useEffect, useMemo, useState } from 'react'
import type { ElementType, FormEvent } from 'react'
import {
  Network, Users, FolderKanban, Building2, Search, Plus, Pencil, Trash2,
  UserPlus, X, ClipboardList, Layers,
} from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import { apiErrorMessage } from '@/services/apiClient'
import {
  collaborationService,
  COLLAB_STATUSES,
  COLLAB_TYPES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VALUES,
} from '@/services/collaborationService'
import type {
  CoAuthorItem,
  InstitutionalCollaborationItem,
  ProjectItem,
  ResearcherOption,
} from '@/services/collaborationService'
import { useAsyncData } from '@/hooks/useAsyncData'
import { AsyncState } from '@/components/shared/AsyncState'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import { CollaborationGraph } from '@/components/shared/CollaborationGraph'
import type { CoAuthorshipLink, CoAuthorshipNode } from '@/types'

export type CollaborationTab = 'coauthors' | 'projects' | 'mine' | 'institutions' | 'find'

const TABS: { key: CollaborationTab; label: string; icon: ElementType }[] = [
  { key: 'coauthors', label: 'Network & Co-authors', icon: Network },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'mine', label: 'My Projects', icon: ClipboardList },
  { key: 'institutions', label: 'Institutional Collaborations', icon: Building2 },
  { key: 'find', label: 'Find Collaborators', icon: Users },
]

const today = () => new Date().toISOString().slice(0, 10)

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  planned: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  completed: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  cancelled: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  suspended: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

const label = (value: string) =>
  value
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U'

const fieldClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none'
const labelClass = 'block text-sm font-medium text-foreground mb-1'
const primaryButton =
  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-60'
const ghostButton =
  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors'

const emptyProjectForm = () => ({
  title: '',
  description: '',
  institutionId: '',
  fundingAgency: '',
  budget: '',
  startDate: today(),
  endDate: '',
  status: 'active',
})

const emptyMemberForm = () => ({
  researcherId: '',
  role: 'Co-Investigator',
  startDate: today(),
  endDate: '',
})

const emptyCollaborationForm = () => ({
  institutionAId: '',
  institutionBId: '',
  type: COLLAB_TYPES[0],
  status: 'active',
  startDate: today(),
  endDate: '',
  description: '',
})

interface CollaborationPageProps {
  tab?: CollaborationTab
  onTabChange?: (tab: CollaborationTab) => void
}

export default function CollaborationPage({ tab, onTabChange }: CollaborationPageProps) {
  const { user, showToast } = useAppContext()
  const [internalTab, setInternalTab] = useState<CollaborationTab>('coauthors')
  const activeTab = tab ?? internalTab
  const setTab = (next: CollaborationTab) => {
    setInternalTab(next)
    onTabChange?.(next)
  }

  const canCreateProject = user?.role !== 'Reviewer'

  const projectsState = useAsyncData(() => collaborationService.listProjects())
  const myProjectsState = useAsyncData(() => collaborationService.listMyProjects())
  const researchersState = useAsyncData(() => collaborationService.listResearchers())
  const institutionsState = useAsyncData(() => collaborationService.listInstitutions())
  const collaborationsState = useAsyncData(() =>
    collaborationService.listInstitutionalCollaborations()
  )
  const profileState = useAsyncData(() => collaborationService.myProfile())
  const networkState = useAsyncData(() => collaborationService.network())

  const projects = projectsState.data ?? []
  const myProjects = myProjectsState.data ?? []
  const researchers = researchersState.data ?? []
  const institutions = institutionsState.data ?? []
  const collaborations = collaborationsState.data ?? []

  const reloadAll = () => {
    projectsState.reload()
    myProjectsState.reload()
    collaborationsState.reload()
  }

  const run = async (action: () => Promise<unknown>, success: string, after?: () => void) => {
    try {
      await action()
      showToast(success, 'success')
      after?.()
      return true
    } catch (err) {
      showToast(apiErrorMessage(err), 'error')
      return false
    }
  }

  // ---- Co-authors --------------------------------------------------------
  const [coauthorId, setCoauthorId] = useState('')
  useEffect(() => {
    if (coauthorId) return
    const fallback = profileState.data?.researcherId ?? researchers[0]?.id
    if (fallback) setCoauthorId(fallback)
  }, [coauthorId, profileState.data, researchers])

  const coAuthorsState = useAsyncData(
    () => (coauthorId ? collaborationService.coAuthors(coauthorId) : Promise.resolve([] as CoAuthorItem[])),
    [coauthorId]
  )

  const graph = useMemo(() => {
    const nodes: CoAuthorshipNode[] = (networkState.data?.nodes ?? []).map((node, index) => ({
      id: node.id,
      name: node.name,
      institution: node.institution,
      department: '',
      publicationsCount: node.publicationCount,
      citationsCount: 0,
      hIndex: 0,
      avatarUrl: `https://i.pravatar.cc/150?u=${encodeURIComponent(node.id)}`,
      group: index % 6,
    }))
    const links: CoAuthorshipLink[] = (networkState.data?.edges ?? []).map((edge) => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
      publications: edge.publications,
    }))
    return { nodes, links }
  }, [networkState.data])

  // ---- Project create / edit / delete -----------------------------------
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null)
  const [projectForm, setProjectForm] = useState(emptyProjectForm())
  const [deleteProject, setDeleteProject] = useState<ProjectItem | null>(null)
  const [saving, setSaving] = useState(false)

  const openNewProject = () => {
    setEditingProject(null)
    setProjectForm(emptyProjectForm())
    setProjectModalOpen(true)
  }

  const openEditProject = (project: ProjectItem) => {
    setEditingProject(project)
    setProjectForm({
      title: project.title,
      description: project.description,
      institutionId: project.institutionId,
      fundingAgency: project.fundingAgency,
      budget: project.budget ? String(project.budget) : '',
      startDate: project.startDate || today(),
      endDate: project.endDate,
      status: project.status,
    })
    setProjectModalOpen(true)
  }

  const saveProject = async (event: FormEvent) => {
    event.preventDefault()
    if (!projectForm.title.trim()) {
      showToast('Project title is required', 'error')
      return
    }
    setSaving(true)
    const payload = {
      title: projectForm.title.trim(),
      description: projectForm.description,
      institutionId: projectForm.institutionId || null,
      fundingAgency: projectForm.fundingAgency,
      budget: projectForm.budget ? Number(projectForm.budget) : undefined,
      startDate: projectForm.startDate || today(),
      endDate: projectForm.endDate,
      status: projectForm.status,
    }
    const ok = await run(
      () =>
        editingProject
          ? collaborationService.updateProject(editingProject.id, payload)
          : collaborationService.createProject(payload),
      editingProject ? 'Project updated' : 'Project created',
      reloadAll
    )
    setSaving(false)
    if (ok) setProjectModalOpen(false)
  }

  const confirmDeleteProject = async () => {
    if (!deleteProject) return
    const target = deleteProject
    setDeleteProject(null)
    await run(
      () => collaborationService.deleteProject(target.id),
      'Project deleted',
      reloadAll
    )
  }

  // ---- Team management / assignments ------------------------------------
  const [teamProjectId, setTeamProjectId] = useState<string | null>(null)
  const [memberForm, setMemberForm] = useState(emptyMemberForm())
  const [memberSaving, setMemberSaving] = useState(false)

  const teamProject = projects.find((project) => project.id === teamProjectId) ?? null

  const openTeam = (project: ProjectItem) => {
    setTeamProjectId(project.id)
    setMemberForm({ ...emptyMemberForm(), researcherId: researchers[0]?.id ?? '' })
  }

  const addMember = async (event: FormEvent) => {
    event.preventDefault()
    if (!teamProject) return
    if (!memberForm.researcherId) {
      showToast('Select a researcher first', 'error')
      return
    }
    setMemberSaving(true)
    const ok = await run(
      () =>
        collaborationService.addMember(teamProject.id, {
          researcherId: memberForm.researcherId,
          role: memberForm.role,
          startDate: memberForm.startDate || today(),
          endDate: memberForm.endDate,
        }),
      'Researcher added to project',
      () => {
        projectsState.reload()
        myProjectsState.reload()
      }
    )
    setMemberSaving(false)
    if (ok) setMemberForm({ ...emptyMemberForm(), researcherId: researchers[0]?.id ?? '' })
  }

  const removeMember = async (researcherId: string) => {
    if (!teamProject) return
    await run(
      () => collaborationService.removeMember(teamProject.id, researcherId),
      'Researcher removed from project',
      () => {
        projectsState.reload()
        myProjectsState.reload()
      }
    )
  }

  // ---- Institutional collaborations -------------------------------------
  const [collabModalOpen, setCollabModalOpen] = useState(false)
  const [editingCollab, setEditingCollab] = useState<InstitutionalCollaborationItem | null>(null)
  const [collabForm, setCollabForm] = useState(emptyCollaborationForm())
  const [deleteCollab, setDeleteCollab] = useState<InstitutionalCollaborationItem | null>(null)

  const openNewCollab = () => {
    setEditingCollab(null)
    setCollabForm(emptyCollaborationForm())
    setCollabModalOpen(true)
  }

  const openEditCollab = (item: InstitutionalCollaborationItem) => {
    setEditingCollab(item)
    setCollabForm({
      institutionAId: item.institutionAId,
      institutionBId: item.institutionBId,
      type: item.type,
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
      description: item.description,
    })
    setCollabModalOpen(true)
  }

  const saveCollab = async (event: FormEvent) => {
    event.preventDefault()
    if (!editingCollab) {
      if (!collabForm.institutionAId || !collabForm.institutionBId) {
        showToast('Both institutions are required', 'error')
        return
      }
      if (collabForm.institutionAId === collabForm.institutionBId) {
        showToast('An institution cannot collaborate with itself', 'error')
        return
      }
    }
    setSaving(true)
    const payload = {
      institutionAId: collabForm.institutionAId,
      institutionBId: collabForm.institutionBId,
      type: collabForm.type,
      status: collabForm.status,
      startDate: collabForm.startDate || today(),
      endDate: collabForm.endDate,
      description: collabForm.description,
    }
    const ok = await run(
      () =>
        editingCollab
          ? collaborationService.updateInstitutionalCollaboration(editingCollab.id, payload)
          : collaborationService.createInstitutionalCollaboration(payload),
      editingCollab ? 'Collaboration updated' : 'Collaboration added',
      collaborationsState.reload
    )
    setSaving(false)
    if (ok) setCollabModalOpen(false)
  }

  const confirmDeleteCollab = async () => {
    if (!deleteCollab) return
    const target = deleteCollab
    setDeleteCollab(null)
    await run(
      () => collaborationService.deleteInstitutionalCollaboration(target.id),
      'Collaboration removed',
      collaborationsState.reload
    )
  }

  // ---- Find collaborators -> add to project ------------------------------
  const [findSearch, setFindSearch] = useState('')
  const [assignTarget, setAssignTarget] = useState<ResearcherOption | null>(null)
  const [assignForm, setAssignForm] = useState({ projectId: '', role: 'Co-Investigator', startDate: today(), endDate: '' })

  const filteredResearchers = useMemo(() => {
    const query = findSearch.trim().toLowerCase()
    if (!query) return researchers
    return researchers.filter(
      (researcher) =>
        researcher.name.toLowerCase().includes(query) ||
        researcher.institution.toLowerCase().includes(query) ||
        researcher.department.toLowerCase().includes(query) ||
        researcher.title.toLowerCase().includes(query)
    )
  }, [researchers, findSearch])

  const openAssign = (researcher: ResearcherOption) => {
    setAssignTarget(researcher)
    setAssignForm({
      projectId: projects[0]?.id ?? '',
      role: 'Co-Investigator',
      startDate: today(),
      endDate: '',
    })
  }

  const saveAssignment = async (event: FormEvent) => {
    event.preventDefault()
    if (!assignTarget) return
    if (!assignForm.projectId) {
      showToast('Select a project first', 'error')
      return
    }
    setSaving(true)
    const ok = await run(
      () =>
        collaborationService.addMember(assignForm.projectId, {
          researcherId: assignTarget.id,
          role: assignForm.role,
          startDate: assignForm.startDate || today(),
          endDate: assignForm.endDate,
        }),
      `${assignTarget.name} added to the project`,
      () => {
        projectsState.reload()
        myProjectsState.reload()
      }
    )
    setSaving(false)
    if (ok) setAssignTarget(null)
  }

  // ---- My assignments ----------------------------------------------------
  const myAssignments = useMemo(() => {
    const profileId = profileState.data?.researcherId
    return myProjects.map((project) => {
      const membership =
        project.members.find((member) => member.researcherId === profileId) ?? project.members[0]
      return {
        project,
        role: membership?.role ?? 'Researcher',
        startDate: membership?.startDate ?? project.startDate,
        endDate: membership?.endDate ?? project.endDate,
      }
    })
  }, [myProjects, profileState.data])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collaboration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Co-authorship, research projects, institutional partnerships and team assignments
          </p>
        </div>
        {activeTab === 'projects' && canCreateProject && (
          <button onClick={openNewProject} className={primaryButton}>
            <Plus size={16} /> New Project
          </button>
        )}
        {activeTab === 'institutions' && (
          <button onClick={openNewCollab} className={primaryButton}>
            <Plus size={16} /> Add Institutional Collaboration
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map(({ key, label: tabLabel, icon: Icon }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <Icon size={15} /> {tabLabel}
            </button>
          )
        })}
      </div>

      {/* ---------------------------------------------------------------- */}
      {activeTab === 'coauthors' && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-semibold text-foreground">Co-Author Records</h2>
              <select
                value={coauthorId}
                onChange={(event) => setCoauthorId(event.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none min-w-[220px]"
              >
                <option value="">Select a researcher</option>
                {researchers.map((researcher) => (
                  <option key={researcher.id} value={researcher.id}>
                    {researcher.name}
                  </option>
                ))}
              </select>
            </div>

            <AsyncState
              loading={researchersState.loading || coAuthorsState.loading}
              error={researchersState.error ?? coAuthorsState.error}
              onRetry={() => {
                researchersState.reload()
                coAuthorsState.reload()
              }}
            />

            {!coAuthorsState.loading && !coAuthorsState.error && (
              coAuthorsState.data && coAuthorsState.data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {coAuthorsState.data.map((coAuthor) => (
                    <div
                      key={coAuthor.researcherId}
                      className="flex items-center justify-between p-3 rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold bg-primary shrink-0">
                          {initials(coAuthor.fullName)}
                        </div>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {coAuthor.fullName}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-secondary text-foreground whitespace-nowrap">
                        {coAuthor.sharedPublications} shared
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No co-authored publications yet.</p>
              )
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-foreground">Collaboration Network</h2>
              <span className="text-xs text-muted-foreground">
                {graph.nodes.length} researchers · {graph.links.length} co-authorship links
              </span>
            </div>
            <AsyncState
              loading={networkState.loading}
              error={networkState.error}
              onRetry={networkState.reload}
            />
            {!networkState.loading && !networkState.error && (
              graph.nodes.length > 0 ? (
                <CollaborationGraph nodes={graph.nodes} links={graph.links} height={440} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  The network appears once publications have more than one author.
                </p>
              )
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <AsyncState
            loading={projectsState.loading}
            error={projectsState.error}
            onRetry={projectsState.reload}
          />

          {!projectsState.loading && !projectsState.error && (
            projects.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <FolderKanban size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-base font-medium text-foreground">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {canCreateProject
                    ? 'Create the first project to start assigning collaborators.'
                    : 'Projects created by researchers will appear here.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-muted-foreground">{project.code}</p>
                        <h3 className="text-base font-semibold text-foreground truncate">{project.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {project.institutionName || 'No institution'} · {project.members.length} members
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${
                          STATUS_STYLE[project.status] ?? 'bg-secondary text-foreground'
                        }`}
                      >
                        {PROJECT_STATUS_LABELS[project.status] ?? label(project.status)}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    )}

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-secondary rounded-lg py-2 px-2">
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-semibold text-foreground">${project.budget.toLocaleString()}</p>
                      </div>
                      <div className="bg-secondary rounded-lg py-2 px-2">
                        <p className="text-muted-foreground">Start</p>
                        <p className="font-semibold text-foreground">{project.startDate || '—'}</p>
                      </div>
                      <div className="bg-secondary rounded-lg py-2 px-2">
                        <p className="text-muted-foreground">End</p>
                        <p className="font-semibold text-foreground">{project.endDate || '—'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => openTeam(project)} className={ghostButton}>
                        <Layers size={14} /> Team
                      </button>
                      <button onClick={() => openEditProject(project)} className={ghostButton}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteProject(project)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {activeTab === 'mine' && (
        <div className="space-y-4">
          <AsyncState
            loading={myProjectsState.loading || profileState.loading}
            error={myProjectsState.error}
            onRetry={() => {
              myProjectsState.reload()
              profileState.reload()
            }}
          />

          {!myProjectsState.loading && !myProjectsState.error && (
            myAssignments.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <ClipboardList size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-base font-medium text-foreground">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Assignments appear here once you join a project team.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary border-b border-border">
                    <tr>
                      {['Project', 'Role', 'Start', 'End', 'Status'].map((heading) => (
                        <th
                          key={heading}
                          className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {myAssignments.map(({ project, role, startDate, endDate }) => (
                      <tr key={project.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{project.title}</p>
                          <p className="text-xs text-muted-foreground">{project.code}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{role}</td>
                        <td className="px-4 py-3 text-muted-foreground">{startDate || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{endDate || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_STYLE[project.status] ?? 'bg-secondary text-foreground'
                            }`}
                          >
                            {PROJECT_STATUS_LABELS[project.status] ?? label(project.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          <AsyncState
            loading={collaborationsState.loading}
            error={collaborationsState.error}
            onRetry={collaborationsState.reload}
          />

          {!collaborationsState.loading && !collaborationsState.error && (
            collaborations.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <Building2 size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-base font-medium text-foreground">No institutional collaborations</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Record a partnership between two institutions to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {collaborations.map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground truncate">
                          {item.institutionAName} ↔ {item.institutionBName}
                        </h3>
                        <p className="text-xs text-muted-foreground">{label(item.type)}</p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${
                          STATUS_STYLE[item.status] ?? 'bg-secondary text-foreground'
                        }`}
                      >
                        {label(item.status)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>
                        <strong className="text-foreground">Period:</strong> {item.startDate} → {item.endDate || 'ongoing'}
                      </p>
                      {item.description && <p className="line-clamp-2">{item.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditCollab(item)} className={ghostButton}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteCollab(item)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {activeTab === 'find' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={findSearch}
              onChange={(event) => setFindSearch(event.target.value)}
              placeholder="Search researchers by name, institution or department..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none"
            />
          </div>

          <AsyncState
            loading={researchersState.loading}
            error={researchersState.error}
            onRetry={researchersState.reload}
          />

          {!researchersState.loading && !researchersState.error && (
            filteredResearchers.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-10 text-center">
                <Users size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-base font-medium text-foreground">No researchers found</p>
                <p className="text-sm text-muted-foreground mt-1">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredResearchers.map((researcher, index) => (
                  <div
                    key={researcher.id}
                    className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ background: ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B'][index % 4] }}
                      >
                        {initials(researcher.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-snug truncate">
                          {researcher.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {researcher.title || 'Researcher'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="truncate">{researcher.institution || 'No institution'}</p>
                      <p className="truncate">{researcher.department || 'No department'}</p>
                    </div>
                    <div className="bg-secondary rounded-lg py-2 text-center">
                      <p className="text-lg font-bold text-foreground">{researcher.publications}</p>
                      <p className="text-xs text-muted-foreground">Publications</p>
                    </div>
                    <button
                      onClick={() => openAssign(researcher)}
                      className="flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
                    >
                      <UserPlus size={12} /> Add to Project
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* ---- Project modal ---------------------------------------------- */}
      <Modal
        open={projectModalOpen}
        title={editingProject ? 'Edit Project' : 'New Project'}
        onClose={() => setProjectModalOpen(false)}
        size="lg"
      >
        <form onSubmit={saveProject} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input
              required
              value={projectForm.title}
              onChange={(event) => setProjectForm((form) => ({ ...form, title: event.target.value }))}
              className={fieldClass}
              placeholder="Cross-institutional research project"
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm((form) => ({ ...form, description: event.target.value }))
              }
              className={`${fieldClass} resize-none`}
              placeholder="Goals, partners and expected outcomes"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Institution</label>
              <select
                value={projectForm.institutionId}
                onChange={(event) =>
                  setProjectForm((form) => ({ ...form, institutionId: event.target.value }))
                }
                className={fieldClass}
              >
                <option value="">No institution</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Funding Agency</label>
              <input
                value={projectForm.fundingAgency}
                onChange={(event) =>
                  setProjectForm((form) => ({ ...form, fundingAgency: event.target.value }))
                }
                className={fieldClass}
                placeholder="e.g. Horizon Europe"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Budget ($)</label>
              <input
                type="number"
                min="0"
                value={projectForm.budget}
                onChange={(event) =>
                  setProjectForm((form) => ({ ...form, budget: event.target.value }))
                }
                className={fieldClass}
                placeholder="250000"
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={projectForm.status}
                onChange={(event) =>
                  setProjectForm((form) => ({ ...form, status: event.target.value }))
                }
                className={fieldClass}
              >
                {PROJECT_STATUS_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PROJECT_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                type="date"
                required
                value={projectForm.startDate}
                onChange={(event) =>
                  setProjectForm((form) => ({ ...form, startDate: event.target.value }))
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={projectForm.endDate}
                onChange={(event) =>
                  setProjectForm((form) => ({ ...form, endDate: event.target.value }))
                }
                className={fieldClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setProjectModalOpen(false)} className={ghostButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={primaryButton}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---- Team modal -------------------------------------------------- */}
      <Modal
        open={!!teamProject}
        title={teamProject ? `Team · ${teamProject.title}` : 'Team'}
        onClose={() => setTeamProjectId(null)}
        size="lg"
      >
        {teamProject && (
          <div className="space-y-5">
            <div className="space-y-2">
              {teamProject.members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No members on this project yet.</p>
              ) : (
                teamProject.members.map((member) => (
                  <div
                    key={member.researcherId}
                    className="flex items-center justify-between p-3 rounded-xl border border-border"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {member.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role} · {member.startDate || '—'} → {member.endDate || 'ongoing'}
                      </p>
                    </div>
                    <button
                      onClick={() => removeMember(member.researcherId)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove from project"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={addMember} className="space-y-3 border-t border-border pt-4">
              <p className="text-sm font-semibold text-foreground">Add a team member</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Researcher</label>
                  <select
                    value={memberForm.researcherId}
                    onChange={(event) =>
                      setMemberForm((form) => ({ ...form, researcherId: event.target.value }))
                    }
                    className={fieldClass}
                  >
                    <option value="">Select researcher</option>
                    {researchers.map((researcher) => (
                      <option key={researcher.id} value={researcher.id}>
                        {researcher.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <input
                    value={memberForm.role}
                    onChange={(event) =>
                      setMemberForm((form) => ({ ...form, role: event.target.value }))
                    }
                    className={fieldClass}
                    placeholder="Co-Investigator"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    type="date"
                    value={memberForm.startDate}
                    onChange={(event) =>
                      setMemberForm((form) => ({ ...form, startDate: event.target.value }))
                    }
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    type="date"
                    value={memberForm.endDate}
                    onChange={(event) =>
                      setMemberForm((form) => ({ ...form, endDate: event.target.value }))
                    }
                    className={fieldClass}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={memberSaving} className={primaryButton}>
                  <UserPlus size={14} /> Add Member
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* ---- Institutional collaboration modal --------------------------- */}
      <Modal
        open={collabModalOpen}
        title={editingCollab ? 'Edit Collaboration' : 'Add Institutional Collaboration'}
        onClose={() => setCollabModalOpen(false)}
        size="lg"
      >
        <form onSubmit={saveCollab} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Institution A *</label>
              <select
                disabled={!!editingCollab}
                value={collabForm.institutionAId}
                onChange={(event) =>
                  setCollabForm((form) => ({ ...form, institutionAId: event.target.value }))
                }
                className={`${fieldClass} disabled:opacity-60`}
              >
                <option value="">Select institution</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Institution B *</label>
              <select
                disabled={!!editingCollab}
                value={collabForm.institutionBId}
                onChange={(event) =>
                  setCollabForm((form) => ({ ...form, institutionBId: event.target.value }))
                }
                className={`${fieldClass} disabled:opacity-60`}
              >
                <option value="">Select institution</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <select
                value={collabForm.type}
                onChange={(event) => setCollabForm((form) => ({ ...form, type: event.target.value }))}
                className={fieldClass}
              >
                {COLLAB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {label(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={collabForm.status}
                onChange={(event) =>
                  setCollabForm((form) => ({ ...form, status: event.target.value }))
                }
                className={fieldClass}
              >
                {COLLAB_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                type="date"
                required
                value={collabForm.startDate}
                onChange={(event) =>
                  setCollabForm((form) => ({ ...form, startDate: event.target.value }))
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={collabForm.endDate}
                onChange={(event) =>
                  setCollabForm((form) => ({ ...form, endDate: event.target.value }))
                }
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={collabForm.description}
              onChange={(event) =>
                setCollabForm((form) => ({ ...form, description: event.target.value }))
              }
              className={`${fieldClass} resize-none`}
              placeholder="Scope of the partnership"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCollabModalOpen(false)} className={ghostButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={primaryButton}>
              {editingCollab ? 'Save Changes' : 'Add Collaboration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---- Assign researcher to project -------------------------------- */}
      <Modal
        open={!!assignTarget}
        title={assignTarget ? `Add ${assignTarget.name} to a Project` : 'Add to Project'}
        onClose={() => setAssignTarget(null)}
        size="sm"
      >
        <form onSubmit={saveAssignment} className="space-y-4">
          <div>
            <label className={labelClass}>Project *</label>
            <select
              value={assignForm.projectId}
              onChange={(event) =>
                setAssignForm((form) => ({ ...form, projectId: event.target.value }))
              }
              className={fieldClass}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input
              value={assignForm.role}
              onChange={(event) => setAssignForm((form) => ({ ...form, role: event.target.value }))}
              className={fieldClass}
              placeholder="Co-Investigator"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date *</label>
              <input
                type="date"
                required
                value={assignForm.startDate}
                onChange={(event) =>
                  setAssignForm((form) => ({ ...form, startDate: event.target.value }))
                }
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={assignForm.endDate}
                onChange={(event) =>
                  setAssignForm((form) => ({ ...form, endDate: event.target.value }))
                }
                className={fieldClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAssignTarget(null)} className={ghostButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={primaryButton}>
              Add to Project
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteProject?.title ?? ''}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProject(null)}
      />

      <ConfirmDialog
        open={!!deleteCollab}
        title="Remove Collaboration"
        message={
          deleteCollab
            ? `Remove the collaboration between ${deleteCollab.institutionAName} and ${deleteCollab.institutionBName}?`
            : ''
        }
        confirmLabel="Remove"
        danger
        onConfirm={confirmDeleteCollab}
        onCancel={() => setDeleteCollab(null)}
      />
    </div>
  )
}
