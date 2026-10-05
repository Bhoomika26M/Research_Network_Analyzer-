import { useState, useMemo } from 'react'
import { Plus, Eye, Pencil, Trash2, X } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { Publication } from '@/data/mockData'

const STATUS_BADGE: Record<string, string> = {
  Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}
const TYPE_BADGE: Record<string, string> = {
  Journal: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Conference: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'Book Chapter': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Preprint: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

type FormState = {
  title: string; abstract: string; keywords: string; journal: string
  year: number; type: Publication['type']; status: Publication['status']
  doi: string; authors: string
}

const emptyForm = (): FormState => ({
  title: '', abstract: '', keywords: '', journal: '',
  year: new Date().getFullYear(), type: 'Journal', status: 'Draft',
  doi: '', authors: '',
})

export default function Publications() {
  const { publications, addPublication, updatePublication, deletePublication, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState<'year' | 'citations'>('year')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [deleteTarget, setDeleteTarget] = useState<Publication | null>(null)
  const [viewTarget, setViewTarget] = useState<Publication | null>(null)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.journal.trim()) errs.journal = 'Journal is required'
    if (!form.year) errs.year = 'Year is required'
    if (!form.type) errs.type = 'Type is required'
    if (!form.abstract.trim()) errs.abstract = 'Abstract is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const filtered = useMemo(() => {
    let list = [...publications]
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.journal.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') list = list.filter(p => p.type === typeFilter)
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter)
    list.sort((a, b) => sortBy === 'year' ? b.year - a.year : b.citations - a.citations)
    return list
  }, [publications, search, typeFilter, statusFilter, sortBy])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setErrors({}); setShowModal(true) }
  const openEdit = (p: Publication) => {
    setEditId(p.id)
    setForm({ title: p.title, abstract: p.abstract, keywords: p.keywords.join(', '), journal: p.journal, year: p.year, type: p.type, status: p.status, doi: p.doi, authors: p.authors.join(', ') })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!validate()) return
    const payload = {
      title: form.title, abstract: form.abstract, journal: form.journal, year: form.year,
      type: form.type, status: form.status, doi: form.doi,
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      citations: 0,
    }
    if (editId) {
      updatePublication(editId, payload)
      showToast('Publication updated successfully')
    } else {
      addPublication(payload)
      showToast('Publication added successfully')
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePublication(deleteTarget.id)
    showToast('Publication deleted', 'warning')
    setDeleteTarget(null)
  }

  const exportData = filtered.map(p => ({
    Title: p.title, Journal: p.journal, Year: p.year, Type: p.type,
    Status: p.status, Citations: p.citations, DOI: p.doi,
  }))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publications</h1>
          <p className="text-muted-foreground text-sm">{publications.length} total publications</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <ExportButtons data={exportData} columns={['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations', 'DOI']} filename="publications" title="Publications Report" />
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> New Publication
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64"
          placeholder="Search publications..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          <option value="All">All Types</option>
          <option>Journal</option>
          <option>Conference</option>
          <option>Book Chapter</option>
          <option>Preprint</option>
        </select>
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="All">All Statuses</option>
          <option>Published</option>
          <option>Draft</option>
          <option>Submitted</option>
          <option>Under Review</option>
        </select>
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
          <option value="year">Sort by Year</option>
          <option value="citations">Sort by Citations</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Journal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Citations</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No publications found.</td></tr>
            ) : paginated.map(pub => (
              <tr key={pub.id} className="hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground max-w-[260px]">
                  <span className="block truncate" title={pub.title}>{pub.title}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{pub.journal}</td>
                <td className="px-4 py-3 text-muted-foreground">{pub.year}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[pub.type] ?? ''}`}>{pub.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[pub.status] ?? ''}`}>{pub.status}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-foreground">{pub.citations}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewTarget(pub)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Eye size={15} /></button>
                    <button onClick={() => openEdit(pub)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => setDeleteTarget(pub)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
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
      <Modal open={showModal} title={editId ? 'Edit Publication' : 'New Publication'} onClose={() => setShowModal(false)} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
            <input className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${errors.title ? 'border-red-500' : 'border-border'}`}
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Abstract *</label>
            <textarea rows={3} className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground resize-none ${errors.abstract ? 'border-red-500' : 'border-border'}`}
              value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} />
            {errors.abstract && <p className="text-red-500 text-xs mt-1">{errors.abstract}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Keywords (comma-separated)</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} placeholder="quantum, computing, ..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Journal *</label>
              <input className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${errors.journal ? 'border-red-500' : 'border-border'}`}
                value={form.journal} onChange={e => setForm(f => ({ ...f, journal: e.target.value }))} />
              {errors.journal && <p className="text-red-500 text-xs mt-1">{errors.journal}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Year *</label>
              <input type="number" className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${errors.year ? 'border-red-500' : 'border-border'}`}
                value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type *</label>
              <select className={`w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground ${errors.type ? 'border-red-500' : 'border-border'}`}
                value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Publication['type'] }))}>
                <option>Journal</option>
                <option>Conference</option>
                <option>Book Chapter</option>
                <option>Preprint</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Publication['status'] }))}>
                <option>Draft</option>
                <option>Submitted</option>
                <option>Under Review</option>
                <option>Published</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">DOI</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.xxxx/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Authors (comma-separated)</label>
            <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
              value={form.authors} onChange={e => setForm(f => ({ ...f, authors: e.target.value }))} placeholder="Author One, Author Two" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              {editId ? 'Save Changes' : 'Add Publication'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Publication"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* View Side Panel */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewTarget(null)} />
          <div className="relative w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground">Publication Details</h2>
              <button onClick={() => setViewTarget(null)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">{viewTarget.title}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[viewTarget.type] ?? ''}`}>{viewTarget.type}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[viewTarget.status] ?? ''}`}>{viewTarget.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Journal</p><p className="text-foreground mt-0.5">{viewTarget.journal}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Year</p><p className="text-foreground mt-0.5">{viewTarget.year}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Citations</p><p className="text-foreground font-bold mt-0.5">{viewTarget.citations}</p></div>
                <div><p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">DOI</p><p className="text-foreground mt-0.5 break-all">{viewTarget.doi || '—'}</p></div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-1">Abstract</p>
                <p className="text-sm text-foreground leading-relaxed">{viewTarget.abstract}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {viewTarget.keywords.map(k => (
                    <span key={k} className="px-2 py-0.5 bg-secondary text-foreground rounded-full text-xs">{k}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-2">Authors</p>
                <div className="space-y-1">
                  {viewTarget.authors.map(a => (
                    <p key={a} className="text-sm text-foreground">{a}</p>
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
