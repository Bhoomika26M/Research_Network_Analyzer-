import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { Conference } from '@/data/mockData'

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

type FormState = { name: string; location: string; date: string; deadline: string; status: Conference['status']; website: string; topics: string }
const empty = (): FormState => ({ name: '', location: '', date: '', deadline: '', status: 'Upcoming', website: '', topics: '' })

export default function Conferences() {
  const { conferences, publications, addConference, updateConference, deleteConference, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteTarget, setDeleteTarget] = useState<Conference | null>(null)
  const [viewTarget, setViewTarget] = useState<Conference | null>(null)

  const filtered = useMemo(() => {
    let list = [...conferences]
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter)
    return list
  }, [conferences, search, statusFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Get publications submitted to a conference (simulated by matching type='Conference')
  const getConferenceSubmissions = (_conf: Conference) =>
    publications.filter(p => p.type === 'Conference')

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.deadline) e.deadline = 'Deadline is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const openAdd = () => { setEditId(null); setForm(empty()); setErrors({}); setShowModal(true) }
  const openEdit = (c: Conference) => {
    setEditId(c.id)
    setForm({ name: c.name, location: c.location, date: c.date, deadline: c.deadline, status: c.status, website: c.website, topics: c.topics.join(', ') })
    setErrors({})
    setShowModal(true)
  }

  const handleSave = () => {
    if (!validate()) return
    const payload = { name: form.name, location: form.location, date: form.date, deadline: form.deadline, status: form.status, website: form.website, topics: form.topics.split(',').map(t => t.trim()).filter(Boolean), submissions: 0, attendees: 0 }
    if (editId) { updateConference(editId, payload); showToast('Conference updated', 'success') }
    else { addConference(payload); showToast('Conference created', 'success') }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteConference(deleteTarget.id)
    showToast(`"${deleteTarget.name}" deleted`, 'success')
    setDeleteTarget(null)
  }

  const exportData = filtered.map(c => ({ Name: c.name, Location: c.location, Date: c.date, Deadline: c.deadline, Submissions: c.submissions, Status: c.status }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Conferences</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} conference{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-sm font-medium hover:bg-[#6d28d9] transition-colors">
          <Plus size={16} /> Add Conference
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search conferences…" className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          <option>Open</option>
          <option>Upcoming</option>
          <option>Closed</option>
        </select>
        <ExportButtons data={exportData} columns={['Name', 'Location', 'Date', 'Deadline', 'Submissions', 'Status']} filename="conferences" title="Conferences Export" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Name', 'Location', 'Date', 'Deadline', 'Submissions', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No conferences found.</td></tr>
              ) : paginated.map(c => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{c.name}</p>
                    {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="text-xs text-[#7C3AED] hover:underline">Website</a>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.location}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.date}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.deadline}</td>
                  <td className="px-4 py-3 text-center text-foreground">{c.submissions}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[c.status] || ''}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewTarget(c)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="View Submissions"><Eye size={14} /></button>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Edit"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      {/* View Submissions Modal */}
      <Modal open={!!viewTarget} title={`Submissions — ${viewTarget?.name}`} onClose={() => setViewTarget(null)} size="lg">
        {viewTarget && (() => {
          const subs = getConferenceSubmissions(viewTarget)
          return (
            <div>
              {subs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No submissions found for this conference.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                      <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Authors</th>
                      <th className="text-left pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0">
                        <td className="py-2 text-foreground font-medium">{p.title}</td>
                        <td className="py-2 text-muted-foreground">{p.authors[0]}{p.authors.length > 1 ? ` +${p.authors.length - 1}` : ''}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })()}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal open={showModal} title={editId ? 'Edit Conference' : 'Add Conference'} onClose={() => setShowModal(false)} size="lg">
        <div className="space-y-4">
          {[
            { field: 'name', label: 'Conference Name', required: true },
            { field: 'location', label: 'Location', required: true },
            { field: 'website', label: 'Website URL', required: false },
          ].map(({ field, label, required }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-foreground mb-1">{label}{required ? ' *' : ''}</label>
              <input value={form[field as keyof FormState] as string} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors[field] ? 'border-red-500' : 'border-border'}`} />
              {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Conference Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.date ? 'border-red-500' : 'border-border'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Submission Deadline *</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className={`w-full px-3 py-2 text-sm bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${errors.deadline ? 'border-red-500' : 'border-border'}`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Conference['status'] }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
              <option>Open</option>
              <option>Upcoming</option>
              <option>Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Topics (comma-separated)</label>
            <input value={form.topics} onChange={e => setForm(f => ({ ...f, topics: e.target.value }))} placeholder="e.g. AI, Machine Learning, NLP" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm bg-[#7C3AED] text-white rounded-xl hover:bg-[#6d28d9] transition-colors font-medium">{editId ? 'Save Changes' : 'Create Conference'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Conference"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
