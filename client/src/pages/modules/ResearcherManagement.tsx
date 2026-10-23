import { useState } from 'react'
import type { Publication, Researcher } from '../../types/index'
import { useResearchers, useCreateResearcher, useUpdateResearcher, useDeleteResearcher } from '../../services/researchers'
import { usePublications } from '../../services/publications'
import { hasPermission } from '../../permissions/config'
import Drawer from '../../layout/Drawer'
import type { SessionUser } from '../../types/index'
import FormModal, { inputCls, TagInput } from '../../components/Modals/FormModal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

function ResearcherDrawerContent({ researcher, pubs }: { researcher: Researcher; pubs: Publication[] }) {
  const researcherPubs = pubs.filter((p) => researcher.publications?.includes(p.id))

  return (
    <div className="space-y-5">
      {/* Avatar header */}
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

      {/* Institution */}
      <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Institution / Department</p>
        <p className="text-sm font-medium text-[#0F172A]">{researcher.institution}</p>
        <p className="text-xs text-[#64748B] mt-0.5">{researcher.department}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{researcher.h_index}</p>
          <p className="text-[10px] text-[#64748B]">h-index</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{researcher.citations_total?.toLocaleString() ?? 0}</p>
          <p className="text-[10px] text-[#64748B]">Citations</p>
        </div>
        <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0] text-center">
          <p className="font-display text-xl text-[#0F172A]">{researcher.publications?.length ?? 0}</p>
          <p className="text-[10px] text-[#64748B]">Publications</p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Bio</p>
        <p className="text-sm text-[#64748B] leading-relaxed">{researcher.bio}</p>
      </div>

      {/* Skills */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-2">Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {researcher.skills?.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{s}</span>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-2">Research Interests</p>
        <div className="flex flex-wrap gap-1.5">
          {researcher.interests?.map((i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] text-[#64748B] text-xs font-medium">{i}</span>
          ))}
        </div>
      </div>

      {/* Publications */}
      {researcherPubs.length > 0 && (
        <div className="pt-4 border-t border-[#F1F5F9]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-3">Publications</p>
          <div className="space-y-2">
            {researcherPubs.map((pub) => (
              <div key={pub.id} className="p-3 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] transition-colors">
                <p className="text-sm font-medium text-[#0F172A] leading-snug">{pub.title}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{pub.journal} · {pub.year} · {pub.citations} citations</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface NewResearcher {
  name: string
  email: string
  institution: string
  department: string
  role: string
  skills: string[]
  interests: string[]
}

export default function ResearcherManagement({ user }: { user?: SessionUser }) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null)
  
  // Connect live API hook
  const { data: apiResearchers } = useResearchers({ search })
  const createResearcherMutation = useCreateResearcher()
  const updateResearcherMutation = useUpdateResearcher()
  const deleteResearcherMutation = useDeleteResearcher()
  const activeResearchers = apiResearchers ?? []
  const { data: activePubs = [] } = usePublications()

  const [modalOpen, setModalOpen] = useState(false)
  const [newR, setNewR] = useState<NewResearcher>({
    name: '', email: '', institution: '', department: '', role: 'Researcher', skills: [], interests: [],
  })

  // Edit state
  const [editingR, setEditingR] = useState<Researcher | null>(null)
  const [editForm, setEditForm] = useState<NewResearcher>({
    name: '', email: '', institution: '', department: '', role: 'Researcher', skills: [], interests: [],
  })

  const roleOptions = ['Researcher', 'Reviewer', 'Admin', 'Associate Professor', 'Assistant Professor', 'Professor', 'Postdoctoral Researcher', 'Senior Researcher']

  const openEdit = (r: Researcher) => {
    const roleMatch = roleOptions.find(o => o.toLowerCase() === r.role.toLowerCase()) || r.role
    setEditingR(r)
    setEditForm({
      name: r.name,
      email: r.email,
      institution: r.institution,
      department: r.department,
      role: roleMatch,
      skills: r.skills ?? [],
      interests: r.interests ?? [],
    })
  }

  const handleUpdateResearcher = () => {
    if (!editingR) return
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.institution.trim()) {
      showToast('Name, email, and institution are required', 'error')
      return
    }
    updateResearcherMutation.mutate(
      {
        id: editingR.id,
        data: {
          name: editForm.name,
          initials: editForm.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          email: editForm.email,
          institution: editForm.institution,
          department: editForm.department || 'N/A',
          role: editForm.role.toLowerCase(),
          skills: editForm.skills,
          interests: editForm.interests,
        },
      },
      {
        onSuccess: (researcher) => {
          if (selectedResearcher?.id === researcher.id) setSelectedResearcher(researcher)
          setEditingR(null)
          showToast(`Researcher ${researcher.name} updated`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to update researcher', 'error')
        },
      }
    )
  }

  const handleDeleteResearcher = (r: Researcher) => {
    if (!window.confirm(`Delete researcher "${r.name}"? This cannot be undone.`)) return
    deleteResearcherMutation.mutate(r.id, {
      onSuccess: () => {
        if (selectedResearcher?.id === r.id) setSelectedResearcher(null)
        showToast(`Researcher ${r.name} removed`, 'success')
      },
      onError: (err: any) => {
        showToast(err?.response?.data?.detail || 'Failed to delete researcher', 'error')
      },
    })
  }

  const filtered = activeResearchers.filter((r) => {
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.institution.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)
  })

  const handleAddResearcher = () => {
    if (!newR.name.trim() || !newR.email.trim() || !newR.institution.trim()) {
      showToast('Name, email, and institution are required', 'error')
      return
    }
    createResearcherMutation.mutate(
      {
        name: newR.name,
        initials: newR.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        email: newR.email,
        institution: newR.institution,
        department: newR.department || 'N/A',
        role: newR.role.toLowerCase(),
        bio: '',
        skills: newR.skills,
        interests: newR.interests,
        publications: [],
        h_index: 0,
        citations_total: 0,
      },
      {
        onSuccess: (researcher) => {
          setModalOpen(false)
          setNewR({ name: '', email: '', institution: '', department: '', role: 'Researcher', skills: [], interests: [] })
          showToast(`Researcher ${researcher.name} added`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to add researcher', 'error')
        },
      }
    )
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">02 — Researcher Mgmt</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Researcher Profiles</h1>
            <p className="text-[#64748B] mt-1">View and manage researcher profiles, skills, and affiliations</p>
          </div>
          {hasPermission(user, 'admin.manageUsers') && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 transition-all"
            >
              + Add Researcher
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <line x1="9" y1="9" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, institution, or department..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
          />
        </div>
      </div>

      {/* Researcher grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((researcher) => {
          const researcherPubs = activePubs.filter((p) => researcher.publications.includes(p.id))
          const totalCitations = researcherPubs.reduce((sum, p) => sum + p.citations, 0)
          return (
            <div
              key={researcher.id}
              onClick={() => setSelectedResearcher(researcher)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {researcher.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#0F172A] text-sm leading-snug">{researcher.name}</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">{researcher.role}</p>
                  <p className="text-xs text-[#64748B]">{researcher.institution} · {researcher.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#F1F5F9]">
                <div className="text-center">
                  <p className="font-display text-lg text-[#0F172A]">{researcher.h_index}</p>
                  <p className="text-[10px] text-[#64748B]">h-index</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg text-[#0F172A]">{totalCitations || researcher.citations_total}</p>
                  <p className="text-[10px] text-[#64748B]">citations</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-lg text-[#0F172A]">{researcherPubs.length}</p>
                  <p className="text-[10px] text-[#64748B]">pubs</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mt-3">
                {researcher.skills.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">{s}</span>
                ))}
                {researcher.skills.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">+{researcher.skills.length - 3}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState icon="🔍" title="No researchers found" subtitle="Try adjusting your search" />
      )}

      <Drawer
        open={selectedResearcher !== null}
        onClose={() => setSelectedResearcher(null)}
        title="Researcher Profile"
      >
        {selectedResearcher && <ResearcherDrawerContent researcher={selectedResearcher} pubs={activePubs} />}
        {selectedResearcher && hasPermission(user, 'admin.manageUsers') && (
          <div className="flex gap-3 pt-5 mt-5 border-t border-[#F1F5F9]">
            <button
              onClick={() => openEdit(selectedResearcher)}
              className="flex-1 py-2.5 rounded-xl border border-[#0052FF] text-sm font-semibold text-[#0052FF] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </button>
            <button
              onClick={() => handleDeleteResearcher(selectedResearcher)}
              className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
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
        )}
      </Drawer>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Researcher"
        label="Researcher Mgmt"
        onSubmit={handleAddResearcher}
        submitLabel="Add Researcher"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              placeholder="Dr. Jane Smith"
              value={newR.name}
              onChange={(e) => setNewR({ ...newR, name: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              type="email"
              placeholder="j.smith@university.edu"
              value={newR.email}
              onChange={(e) => setNewR({ ...newR, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Institution <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              placeholder="MIT"
              value={newR.institution}
              onChange={(e) => setNewR({ ...newR, institution: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Department</label>
            <input
              className={inputCls}
              placeholder="Computer Science"
              value={newR.department}
              onChange={(e) => setNewR({ ...newR, department: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Role</label>
            <select
              className={inputCls}
              value={newR.role}
              onChange={(e) => setNewR({ ...newR, role: e.target.value })}
            >
              {['Researcher', 'Reviewer', 'Admin', 'Associate Professor', 'Assistant Professor', 'Professor', 'Postdoctoral Researcher', 'Senior Researcher'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Skills</label>
          <TagInput
            tags={newR.skills}
            onChange={(skills) => setNewR({ ...newR, skills })}
            placeholder="e.g. Machine Learning, Python"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Research Interests</label>
          <TagInput
            tags={newR.interests}
            onChange={(interests) => setNewR({ ...newR, interests })}
            placeholder="e.g. AI for Science, Climate ML"
          />
        </div>
      </FormModal>

      {/* Edit Researcher Modal */}
      {editingR && (
        <FormModal
          open={editingR !== null}
          onClose={() => setEditingR(null)}
          title="Edit Researcher"
          label="Researcher Mgmt"
          onSubmit={handleUpdateResearcher}
          submitLabel="Save Changes"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input
                className={inputCls}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Email <span className="text-red-500">*</span></label>
              <input
                className={inputCls}
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Institution <span className="text-red-500">*</span></label>
              <input
                className={inputCls}
                value={editForm.institution}
                onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Department</label>
              <input
                className={inputCls}
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Role</label>
              <select
                className={inputCls}
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                {roleOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Skills</label>
            <TagInput
              tags={editForm.skills}
              onChange={(skills) => setEditForm({ ...editForm, skills })}
              placeholder="e.g. Machine Learning, Python"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Research Interests</label>
            <TagInput
              tags={editForm.interests}
              onChange={(interests) => setEditForm({ ...editForm, interests })}
              placeholder="e.g. AI for Science, Climate ML"
            />
          </div>
        </FormModal>
      )}
    </div>
  )
}
