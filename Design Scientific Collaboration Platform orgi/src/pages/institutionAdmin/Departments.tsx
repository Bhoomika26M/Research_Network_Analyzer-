import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Users, FolderKanban, BookOpen, DollarSign, Search } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import type { Department } from '@/data/mockData'

type FormState = { name: string; head: string; institution: string; researchers: string; projects: string; budget: string; publications: string }
const empty = (): FormState => ({ name: '', head: '', institution: '', researchers: '0', projects: '0', budget: '0', publications: '0' })

export default function Departments() {
  const { departments, institutions, addDepartment, updateDepartment, deleteDepartment, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)

  const filtered = useMemo(() => {
    if (!search) return departments
    const q = search.toLowerCase()
    return departments.filter(d => d.name.toLowerCase().includes(q) || d.head.toLowerCase().includes(q))
  }, [departments, search])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.head.trim()) e.head = 'Head is required'
    if (!form.institution.trim()) e.institution = 'Institution is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => { setEditId(null); setForm(empty()); setErrors({}); setShowModal(true) }
  const openEdit = (d: Department) => {
    setEditId(d.id)
    setForm({ name: d.name, head: d.head, institution: d.institution, researchers: String(d.researchers), projects: String(d.projects), budget: String(d.budget), publications: String(d.publications) })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!validate()) return
    const payload = { name: form.name, head: form.head, institution: form.institution, researchers: Number(form.researchers) || 0, projects: Number(form.projects) || 0, budget: Number(form.budget) || 0, publications: Number(form.publications) || 0 }
    if (editId) { updateDepartment(editId, payload); showToast('Department updated', 'success') }
    else { addDepartment(payload); showToast('Department created', 'success') }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteDepartment(deleteTarget.id)
    showToast(`${deleteTarget.name} deleted`, 'success')
    setDeleteTarget(null)
  }

  const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} department{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6d28d9] transition-colors">
          <Plus size={16} /> New Department
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments…" className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(d => (
          <div key={d.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{d.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{d.head} · {d.institution}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Users size={14} className="text-[#7C3AED]" />
                <span className="text-muted-foreground">{d.researchers} Researchers</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FolderKanban size={14} className="text-blue-500" />
                <span className="text-muted-foreground">{d.projects} Projects</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <BookOpen size={14} className="text-emerald-500" />
                <span className="text-muted-foreground">{d.publications} Pubs</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={14} className="text-amber-500" />
                <span className="text-muted-foreground">{fmt(d.budget)}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-3 text-center text-muted-foreground py-10">No departments found.</p>}
      </div>

      {/* Summary table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Department Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Department', 'Head', 'Institution', 'Researchers', 'Projects', 'Publications', 'Budget'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.head}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.institution}</td>
                  <td className="px-4 py-3 text-center text-foreground">{d.researchers}</td>
                  <td className="px-4 py-3 text-center text-foreground">{d.projects}</td>
                  <td className="px-4 py-3 text-center text-foreground">{d.publications}</td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(d.budget)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} title={editId ? 'Edit Department' : 'New Department'} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          {[
            { field: 'name', label: 'Department Name', required: true },
            { field: 'head', label: 'Department Head', required: true },
          ].map(({ field, label, required }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}{required ? ' *' : ''}</label>
              <input value={form[field as keyof FormState]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors[field] ? 'border-red-500' : 'border-border'}`} />
              {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Institution *</label>
            <select value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.institution ? 'border-red-500' : 'border-border'}`}>
              <option value="">Select institution…</option>
              {institutions.map(i => <option key={i.id}>{i.name}</option>)}
            </select>
            {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
          </div>
          {[
            { field: 'researchers', label: 'Researchers' },
            { field: 'projects', label: 'Projects' },
            { field: 'budget', label: 'Budget ($)' },
            { field: 'publications', label: 'Publications' },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
              <input type="number" min="0" value={form[field as keyof FormState]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-xl hover:bg-[#6d28d9] transition-colors font-medium">{editId ? 'Save Changes' : 'Create Department'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
