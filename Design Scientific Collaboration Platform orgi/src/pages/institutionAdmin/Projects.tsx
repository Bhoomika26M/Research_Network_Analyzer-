import { useState, useMemo } from 'react'
import { Plus, Eye, Pencil, Trash2, Search, CheckCircle, Circle } from 'lucide-react'
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

type FormState = { name: string; desc: string; lead: string; institution: string; start: string; end: string; budget: string; status: Project['status'] }
const empty = (): FormState => ({ name: '', desc: '', lead: '', institution: '', start: '', end: '', budget: '', status: 'On Track' })

export default function Projects() {
  const { projects, addProject, updateProject, deleteProject, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [institutionFilter, setInstitutionFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [viewTarget, setViewTarget] = useState<Project | null>(null)

  const institutionNames = useMemo(() => [...new Set(projects.map(p => p.institution))], [projects])

  const filtered = useMemo(() => {
    let list = [...projects]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.lead.toLowerCase().includes(search.toLowerCase()))
    if (institutionFilter !== 'All') list = list.filter(p => p.institution === institutionFilter)
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter)
    return list
  }, [projects, search, institutionFilter, statusFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.desc.trim()) e.desc = 'Description is required'
    if (!form.lead.trim()) e.lead = 'Lead is required'
    if (!form.institution.trim()) e.institution = 'Institution is required'
    if (!form.start) e.start = 'Start date is required'
    if (!form.end) e.end = 'End date is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => { setEditId(null); setForm(empty()); setErrors({}); setShowModal(true) }
  const openEdit = (p: Project) => {
    setEditId(p.id)
    setForm({ name: p.name, desc: p.desc, lead: p.lead, institution: p.institution, start: p.start, end: p.end, budget: String(p.budget), status: p.status })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!validate()) return
    const payload = { name: form.name, desc: form.desc, lead: form.lead, institution: form.institution, start: form.start, end: form.end, budget: Number(form.budget) || 0, status: form.status, members: [], progress: 0, milestones: [] }
    if (editId) { updateProject(editId, payload); showToast('Project updated', 'success') }
    else { addProject(payload); showToast('Project created', 'success') }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteProject(deleteTarget.id)
    showToast(`"${deleteTarget.name}" deleted`, 'success')
    setDeleteTarget(null)
  }

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`
  const exportData = filtered.map(p => ({ Name: p.name, Lead: p.lead, Institution: p.institution, Status: p.status, Progress: `${p.progress}%`, Budget: fmt(p.budget), Start: p.start, End: p.end }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Institution Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} project{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6d28d9] transition-colors">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search projects…" className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        </div>
        <select value={institutionFilter} onChange={e => { setInstitutionFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          {institutionNames.map(i => <option key={i}>{i}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          <option>On Track</option>
          <option>Ahead</option>
          <option>At Risk</option>
          <option>Delayed</option>
        </select>
        <ExportButtons data={exportData} columns={['Name', 'Lead', 'Institution', 'Status', 'Progress', 'Budget', 'Start', 'End']} filename="projects" title="Projects Export" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Name', 'Lead', 'Institution', 'Progress', 'Status', 'Budget', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No projects found.</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.start} – {p.end}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.lead}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.institution}</td>
                  <td className="px-4 py-3 min-w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${PROGRESS_COLOR[p.status] || 'bg-primary'} rounded-full transition-all`} style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] || ''}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmt(p.budget)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="View"><Eye size={14} /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      {/* View Modal */}
      <Modal open={!!viewTarget} title={viewTarget?.name || ''} onClose={() => setViewTarget(null)} size="lg">
        {viewTarget && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{viewTarget.desc}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Lead:</span> <span className="text-foreground font-medium">{viewTarget.lead}</span></div>
              <div><span className="text-muted-foreground">Institution:</span> <span className="text-foreground font-medium">{viewTarget.institution}</span></div>
              <div><span className="text-muted-foreground">Start:</span> <span className="text-foreground">{viewTarget.start}</span></div>
              <div><span className="text-muted-foreground">End:</span> <span className="text-foreground">{viewTarget.end}</span></div>
              <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground">{fmt(viewTarget.budget)}</span></div>
              <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[viewTarget.status] || ''}`}>{viewTarget.status}</span></div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Milestones</p>
              {viewTarget.milestones.length === 0 ? <p className="text-sm text-muted-foreground">No milestones.</p> : (
                <ul className="space-y-2">
                  {viewTarget.milestones.map((m, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {m.completed ? <CheckCircle size={14} className="text-emerald-500" /> : <Circle size={14} className="text-muted-foreground" />}
                      <span className={m.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{m.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{m.date}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showModal} title={editId ? 'Edit Project' : 'New Project'} onClose={() => setShowModal(false)} size="lg">
        <div className="space-y-4">
          {[
            { field: 'name', label: 'Project Name', required: true },
            { field: 'lead', label: 'Project Lead', required: true },
          ].map(({ field, label, required }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}{required ? ' *' : ''}</label>
              <input value={form[field as keyof FormState] as string} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors[field] ? 'border-red-500' : 'border-border'}`} />
              {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
            <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.desc ? 'border-red-500' : 'border-border'}`} />
            {errors.desc && <p className="text-xs text-red-500 mt-1">{errors.desc}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Institution *</label>
            <select value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.institution ? 'border-red-500' : 'border-border'}`}>
              <option value="">Select institution…</option>
              {institutionNames.map(i => <option key={i}>{i}</option>)}
            </select>
            {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Start Date *</label>
              <input type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.start ? 'border-red-500' : 'border-border'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">End Date *</label>
              <input type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.end ? 'border-red-500' : 'border-border'}`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Budget ($)</label>
              <input type="number" min="0" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Project['status'] }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
                <option>On Track</option>
                <option>Ahead</option>
                <option>At Risk</option>
                <option>Delayed</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-xl hover:bg-[#6d28d9] transition-colors font-medium">{editId ? 'Save Changes' : 'Create Project'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
