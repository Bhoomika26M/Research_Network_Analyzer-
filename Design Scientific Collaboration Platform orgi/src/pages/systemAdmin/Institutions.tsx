import { useState, useMemo } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { Institution } from '@/data/mockData'

const PAGE_SIZE = 10

function typeBadge(type: string) {
  const map: Record<string, string> = {
    University: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'Research Lab': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Government: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  }
  return map[type] ?? 'bg-secondary text-foreground'
}

const EMPTY: Omit<Institution, 'id'> = {
  name: '', country: '', type: 'University', researchers: 0, projects: 0,
  budget: 0, status: 'Active', established: 2000, website: '',
}

export default function AdminInstitutions() {
  const { institutions, addInstitution, updateInstitution, deleteInstitution, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Institution | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [detailTarget, setDetailTarget] = useState<Institution | null>(null)
  const [form, setForm] = useState<Omit<Institution, 'id'>>(EMPTY)

  const filtered = useMemo(() => {
    let data = institutions
    if (search) data = data.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.country.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') data = data.filter(i => i.type === typeFilter)
    if (statusFilter !== 'All') data = data.filter(i => i.status === statusFilter)
    return data
  }, [institutions, search, typeFilter, statusFilter])

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const openAdd = () => { setForm(EMPTY); setAddOpen(true) }
  const openEdit = (inst: Institution) => { setEditTarget(inst); setForm({ name: inst.name, country: inst.country, type: inst.type, researchers: inst.researchers, projects: inst.projects, budget: inst.budget, status: inst.status, established: inst.established, website: inst.website }) }

  const handleSave = () => {
    if (!form.name || !form.country || !form.type) { showToast('Name, country and type are required', 'error'); return }
    if (editTarget) {
      updateInstitution(editTarget.id, form)
      showToast('Institution updated', 'success')
      setEditTarget(null)
    } else {
      addInstitution(form)
      showToast('Institution added', 'success')
      setAddOpen(false)
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteInstitution(deleteTarget)
    showToast('Institution deleted', 'success')
    setDeleteTarget(null)
  }

  const handleToggleStatus = (inst: Institution) => {
    updateInstitution(inst.id, { status: inst.status === 'Active' ? 'Inactive' : 'Active' })
    showToast(`Institution ${inst.status === 'Active' ? 'deactivated' : 'activated'}`, 'success')
  }

  const exportData = filtered.map(i => ({
    Name: i.name, Country: i.country, Type: i.type,
    Researchers: i.researchers, Projects: i.projects,
    Budget: `$${(i.budget / 1e6).toFixed(1)}M`, Status: i.status,
  }))

  const FormFields = () => (
    <div className="space-y-4">
      {[
        { label: 'Name', field: 'name', required: true, placeholder: 'Institution name' },
        { label: 'Country', field: 'country', required: true, placeholder: 'Country' },
        { label: 'Website', field: 'website', placeholder: 'https://...' },
      ].map(({ label, field, required, placeholder }) => (
        <div key={field}>
          <label className="block text-sm font-medium text-foreground mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
          <input
            value={(form as Record<string, unknown>)[field] as string}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]"
          />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Type <span className="text-red-500">*</span></label>
        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Institution['type'] }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['University', 'Research Lab', 'Government'].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Established</label>
          <input type="number" value={form.established} onChange={e => setForm(f => ({ ...f, established: Number(e.target.value) }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'Active' | 'Inactive' }))} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
            <option>Active</option><option>Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={() => { setAddOpen(false); setEditTarget(null) }} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: '#F59E0B' }}>{editTarget ? 'Save Changes' : 'Add Institution'}</button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Institutions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform institutions</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButtons data={exportData} columns={['Name', 'Country', 'Type', 'Researchers', 'Projects', 'Budget', 'Status']} filename="institutions" title="Institutions" />
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: '#F59E0B' }}>
            <Plus size={15} /> Add Institution
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search institutions..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'University', 'Research Lab', 'Government'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Active', 'Inactive'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Name', 'Country', 'Type', 'Researchers', 'Projects', 'Budget', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No institutions found</td></tr>
              ) : paginated.map(inst => (
                <tr key={inst.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground max-w-[200px]"><p className="truncate">{inst.name}</p></td>
                  <td className="px-4 py-3 text-muted-foreground">{inst.country}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge(inst.type)}`}>{inst.type}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{inst.researchers}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inst.projects}</td>
                  <td className="px-4 py-3 text-muted-foreground">${(inst.budget / 1e6).toFixed(1)}M</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${inst.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{inst.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setDetailTarget(inst)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="View Details"><Eye size={13} /></button>
                      <button onClick={() => openEdit(inst)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit"><Edit2 size={13} /></button>
                      <button onClick={() => setDeleteTarget(inst.id)} className="p-1.5 rounded-lg border border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 size={13} /></button>
                      <button onClick={() => handleToggleStatus(inst)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Toggle Status">
                        {inst.status === 'Active' ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border">
          <Pagination page={page} total={filtered.length} perPage={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>

      <Modal open={addOpen} title="Add Institution" onClose={() => setAddOpen(false)}><FormFields /></Modal>
      <Modal open={!!editTarget} title="Edit Institution" onClose={() => setEditTarget(null)}><FormFields /></Modal>

      <Modal open={!!detailTarget} title={detailTarget?.name ?? ''} onClose={() => setDetailTarget(null)}>
        {detailTarget && (
          <div className="space-y-3">
            {[
              ['Country', detailTarget.country],
              ['Type', detailTarget.type],
              ['Established', detailTarget.established],
              ['Website', detailTarget.website || 'N/A'],
              ['Researchers', detailTarget.researchers],
              ['Projects', detailTarget.projects],
              ['Budget', `$${(detailTarget.budget / 1e6).toFixed(1)}M`],
              ['Status', detailTarget.status],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteTarget} title="Delete Institution" message="Are you sure you want to delete this institution? This action cannot be undone." confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
