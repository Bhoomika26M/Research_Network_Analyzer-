import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, UserCheck, UserX, Search } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { Researcher } from '@/data/mockData'

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

type FormState = { name: string; email: string; dept: string; role: string; institution: string }
const empty = (): FormState => ({ name: '', email: '', dept: '', role: '', institution: '' })

export default function Researchers() {
  const { researchers, departments, addResearcher, updateResearcher, deleteResearcher, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Researcher | null>(null)
  const [toggleTarget, setToggleTarget] = useState<Researcher | null>(null)

  const deptNames = useMemo(() => [...new Set(departments.map(d => d.name))], [departments])

  const filtered = useMemo(() => {
    let list = [...researchers]
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()))
    if (deptFilter !== 'All') list = list.filter(r => r.dept === deptFilter)
    if (statusFilter !== 'All') list = list.filter(r => r.status === statusFilter)
    return list
  }, [researchers, search, deptFilter, statusFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.dept) e.dept = 'Department is required'
    if (!form.role) e.role = 'Role is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => { setEditId(null); setForm(empty()); setErrors({}); setShowModal(true) }
  const openEdit = (r: Researcher) => {
    setEditId(r.id)
    setForm({ name: r.name, email: r.email, dept: r.dept, role: r.role, institution: r.institution })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!validate()) return
    const initials = form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    if (editId) {
      updateResearcher(editId, { name: form.name, email: form.email, dept: form.dept, role: form.role, institution: form.institution, initials })
      showToast('Researcher updated', 'success')
    } else {
      addResearcher({
        name: form.name, email: form.email, dept: form.dept, role: form.role,
        institution: form.institution || 'Unknown', initials, color: '#7C3AED',
        interests: [], hIndex: 0, publications: 0, collaborators: 0, citations: 0,
        orcid: '', status: 'Active', joinDate: new Date().toISOString().slice(0, 10),
      })
      showToast('Researcher invited', 'success')
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteResearcher(deleteTarget.id)
    showToast(`${deleteTarget.name} deleted`, 'success')
    setDeleteTarget(null)
  }

  const handleToggle = () => {
    if (!toggleTarget) return
    const newStatus = toggleTarget.status === 'Active' ? 'Inactive' : 'Active'
    updateResearcher(toggleTarget.id, { status: newStatus })
    showToast(`${toggleTarget.name} set to ${newStatus}`, 'info')
    setToggleTarget(null)
  }

  const exportData = filtered.map(r => ({ Name: r.name, Email: r.email, Department: r.dept, Role: r.role, Institution: r.institution, 'h-Index': r.hIndex, Publications: r.publications, Status: r.status }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Researchers</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} researcher{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6d28d9] transition-colors">
          <Plus size={16} /> Invite Researcher
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name or email…" className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        </div>
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          {deptNames.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <ExportButtons data={exportData} columns={Object.keys(exportData[0] || {})} filename="researchers" title="Researchers Export" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Name', 'Role', 'Department', 'Institution', 'h-Index', 'Pubs', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground">No researchers found.</td></tr>
              ) : paginated.map(r => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: r.color }}>{r.initials}</div>
                      <div>
                        <p className="font-medium text-foreground">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.role}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.dept}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.institution}</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium">{r.hIndex}</td>
                  <td className="px-4 py-3 text-center text-foreground">{r.publications}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setToggleTarget(r)} className={`p-1.5 rounded-lg transition-colors ${r.status === 'Active' ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`} title={r.status === 'Active' ? 'Deactivate' : 'Activate'}>
                        {r.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      {/* Add/Edit Modal */}
      <Modal open={showModal} title={editId ? 'Edit Researcher' : 'Invite Researcher'} onClose={() => setShowModal(false)}>
        <div className="space-y-4">
          {(['name', 'email'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1 capitalize">{field} *</label>
              <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors[field] ? 'border-red-500' : 'border-border'}`} />
              {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Department *</label>
            <select value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.dept ? 'border-red-500' : 'border-border'}`}>
              <option value="">Select department…</option>
              {deptNames.map(d => <option key={d}>{d}</option>)}
            </select>
            {errors.dept && <p className="text-xs text-red-500 mt-1">{errors.dept}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Role *</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.role ? 'border-red-500' : 'border-border'}`}>
              <option value="">Select role…</option>
              {['Researcher', 'Senior Researcher', 'Principal Investigator', 'Postdoc', 'PhD Student'].map(r => <option key={r}>{r}</option>)}
            </select>
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Institution</label>
            <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-xl hover:bg-[#6d28d9] transition-colors font-medium">{editId ? 'Save Changes' : 'Send Invite'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Researcher"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.status === 'Active' ? 'Deactivate Researcher' : 'Activate Researcher'}
        message={`Are you sure you want to ${toggleTarget?.status === 'Active' ? 'deactivate' : 'activate'} "${toggleTarget?.name}"?`}
        confirmLabel={toggleTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
        danger={toggleTarget?.status === 'Active'}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  )
}
