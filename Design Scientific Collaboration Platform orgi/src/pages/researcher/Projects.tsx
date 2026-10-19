import { useState, useMemo } from 'react'
import { Plus, Eye, Pencil, Trash2, X, CheckCircle, Circle } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { Project } from '@/data/mockData'

const STATUS_BADGE: Record<string, string> = {
  'On Track': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Ahead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'At Risk': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Delayed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const PROGRESS_COLOR: Record<string, string> = {
  'On Track': 'bg-emerald-500',
  Ahead: 'bg-blue-500',
  'At Risk': 'bg-amber-500',
  Delayed: 'bg-red-500',
}

type FormState = {
  name: string; description: string; lead: string; institution: string
  start: string; end: string; budget: string; status: Project['status']
}
const emptyForm = (): FormState => ({ name: '', description: '', lead: '', institution: '', start: '', end: '', budget: '', status: 'On Track' })

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'progress' | 'budget'>('progress')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [viewTarget, setViewTarget] = useState<Project | null>(null)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.lead.trim()) e.lead = 'Lead is required'
    if (!form.institution.trim()) e.institution = 'Institution is required'
    if (!form.start) e.start = 'Start date is required'
    if (!form.end) e.end = 'End date is required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  const filtered = useMemo(() => {
    let list = [...projects]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.lead.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter)
    list.sort((a, b) => sortBy === 'progress' ? b.progress - a.progress : b.budget - a.budget)
    return list
  }, [projects, search, statusFilter, sortBy])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setFormErrors({}); setShowModal(true) }
  const openEdit = (p: Project) => {
    setEditId(p.id)
    setForm({ name: p.name, description: p.desc, lead: p.lead, institution: p.institution, start: p.start, end: p.end, budget: String(p.budget), status: p.status })
    setFormErrors({})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!validate()) return
    const payload = { name: form.name, desc: form.description, lead: form.lead, institution: form.institution, start: form.start, end: form.end, budget: Number(form.budget) || 0, status: form.status, members: [], progress: 0, milestones: [] }
    if (editId) { updateProject(editId, payload); showToast('Project updated successfully') }
    else { addProject(payload); showToast('Project created successfully') }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteProject(deleteTarget.id)
    showToast('Project deleted', 'warning')
    setDeleteTarget(null)
  }

  const exportData = filtered.map(p => ({ Name: p.name, Lead: p.lead, Institution: p.institution, Status: p.status, Progress: `${p.progress}%`, Budget: `$${p.budget.toLocaleString()}`, Start: p.start, End: p.end }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground text-sm">{projects.length} research projects</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <ExportButtons data={exportData} columns={['Name', 'Lead', 'Institution', 'Status', 'Progress', 'Budget', 'Start', 'End']} filename="projects" title="Projects Report" />
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search projects..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="All">All Statuses</option>
          <option>On Track</option>
          <option>Ahead</option>
          <option>At Risk</option>
          <option>Delayed</option>
        </select>
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
          <option value="progress">Sort by Progress</option>
          <option value="budget">Sort by Budget</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Institution</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No projects found.</td></tr>
            ) : paginated.map(proj => (
              <tr key={proj.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground max-w-[200px]"><span className="block truncate" title={proj.name}>{proj.name}</span></td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{proj.institution}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{proj.lead}</td>
                <td className="px-4 py-3 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div className={`h-2 rounded-full ${PROGRESS_COLOR[proj.status] ?? 'bg-primary'}`} style={{ width: `${proj.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{proj.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[proj.status] ?? ''}`}>{proj.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">${proj.budget.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewTarget(proj)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Eye size={15} /></button>
                    <button onClick={() => openEdit(proj)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(proj)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-border">
          <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} title={editId ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
            <input className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${formErrors.name ? 'border-red-500' : 'border-border'}`} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
            <textarea rows={3} className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none ${formErrors.description ? 'border-red-500' : 'border-border'}`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Lead Researcher *</label>
              <input className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${formErrors.lead ? 'border-red-500' : 'border-border'}`} value={form.lead} onChange={e => setForm(f => ({ ...f, lead: e.target.value }))} />
              {formErrors.lead && <p className="text-red-500 text-xs mt-1">{formErrors.lead}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Institution *</label>
              <input className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${formErrors.institution ? 'border-red-500' : 'border-border'}`} value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} />
              {formErrors.institution && <p className="text-red-500 text-xs mt-1">{formErrors.institution}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date *</label>
              <input type="date" className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${formErrors.start ? 'border-red-500' : 'border-border'}`} value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
              {formErrors.start && <p className="text-red-500 text-xs mt-1">{formErrors.start}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Date *</label>
              <input type="date" className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${formErrors.end ? 'border-red-500' : 'border-border'}`} value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
              {formErrors.end && <p className="text-red-500 text-xs mt-1">{formErrors.end}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Budget ($)</label>
              <input type="number" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Project['status'] }))}>
                <option>On Track</option>
                <option>Ahead</option>
                <option>At Risk</option>
                <option>Delayed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">{editId ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Project" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {/* View Side Panel */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewTarget(null)} />
          <div className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground">Project Details</h2>
              <button onClick={() => setViewTarget(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-foreground">{viewTarget.name}</h3>
                <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[viewTarget.status] ?? ''}`}>{viewTarget.status}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{viewTarget.desc}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Lead</p><p className="text-foreground mt-0.5">{viewTarget.lead}</p></div>
                <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Institution</p><p className="text-foreground mt-0.5">{viewTarget.institution}</p></div>
                <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Budget</p><p className="text-foreground mt-0.5">${viewTarget.budget.toLocaleString()}</p></div>
                <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Progress</p><p className="text-foreground font-bold mt-0.5">{viewTarget.progress}%</p></div>
                <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Start</p><p className="text-foreground mt-0.5">{viewTarget.start}</p></div>
                <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">End</p><p className="text-foreground mt-0.5">{viewTarget.end}</p></div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Milestones</p>
                <div className="space-y-2">
                  {viewTarget.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-3">
                      {m.completed ? <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" /> : <Circle size={16} className="text-muted-foreground mt-0.5 shrink-0" />}
                      <div>
                        <p className={`text-sm ${m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
