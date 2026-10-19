import { useState, useMemo } from 'react'
import { Search, CheckCircle, Flag, Trash2, UserPlus } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'

const PAGE_SIZE = 10

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  }
  return map[status] ?? 'bg-secondary text-foreground'
}

export default function AdminPublications() {
  const { publications, users, updatePublication, deletePublication, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)

  const [flagTarget, setFlagTarget] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [assignModal, setAssignModal] = useState<{ open: boolean; id: string } | null>(null)
  const [selectedReviewer, setSelectedReviewer] = useState('')

  const reviewers = useMemo(() => users.filter(u => u.role === 'Reviewer'), [users])

  const filtered = useMemo(() => {
    let data = publications
    if (search) data = data.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.journal.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') data = data.filter(p => p.type === typeFilter)
    if (statusFilter !== 'All') data = data.filter(p => p.status === statusFilter)
    return data
  }, [publications, search, typeFilter, statusFilter])

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page])

  const handleApprove = (id: string) => {
    updatePublication(id, { status: 'Published' })
    showToast('Publication approved and published', 'success')
  }

  const handleFlag = () => {
    if (!flagTarget) return
    updatePublication(flagTarget, { status: 'Draft' })
    showToast('Publication flagged and moved to Draft', 'warning')
    setFlagTarget(null)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePublication(deleteTarget)
    showToast('Publication deleted', 'success')
    setDeleteTarget(null)
  }

  const handleAssignReviewer = () => {
    if (!assignModal || !selectedReviewer) { showToast('Please select a reviewer', 'error'); return }
    showToast(`Reviewer assigned: ${selectedReviewer}`, 'success')
    setAssignModal(null)
    setSelectedReviewer('')
  }

  const exportData = filtered.map(p => ({
    Title: p.title,
    Authors: p.authors.join(', '),
    Journal: p.journal,
    Year: p.year,
    Type: p.type,
    Status: p.status,
  }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publications</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all platform publications</p>
        </div>
        <ExportButtons data={exportData} columns={['Title', 'Authors', 'Journal', 'Year', 'Type', 'Status']} filename="all-publications" title="All Publications" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search publications..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Journal', 'Conference', 'Book Chapter', 'Preprint'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
          {['All', 'Published', 'Submitted', 'Draft', 'Under Review'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Title', 'Authors', 'Journal', 'Year', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No publications found</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-[220px]"><p className="font-medium text-foreground truncate">{p.title}</p></td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[150px]"><p className="truncate">{p.authors.join(', ')}</p></td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.journal}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.year}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">{p.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {p.status !== 'Published' && (
                        <button onClick={() => handleApprove(p.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors border border-border" title="Approve">
                          <CheckCircle size={13} />
                        </button>
                      )}
                      <button onClick={() => setFlagTarget(p.id)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border border-border" title="Flag">
                        <Flag size={13} />
                      </button>
                      <button onClick={() => setAssignModal({ open: true, id: p.id })} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-border" title="Assign Reviewer">
                        <UserPlus size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-border" title="Delete">
                        <Trash2 size={13} />
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

      <ConfirmDialog open={!!flagTarget} title="Flag Publication" message="Flag this publication and move it back to Draft status?" confirmLabel="Flag" danger onConfirm={handleFlag} onCancel={() => setFlagTarget(null)} />
      <ConfirmDialog open={!!deleteTarget} title="Delete Publication" message="Permanently delete this publication? This cannot be undone." confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      <Modal open={!!assignModal?.open} title="Assign Reviewer" onClose={() => setAssignModal(null)} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Select Reviewer</label>
            <select value={selectedReviewer} onChange={e => setSelectedReviewer(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none">
              <option value="">-- Choose reviewer --</option>
              {reviewers.map(r => <option key={r.id} value={r.name}>{r.name} ({r.institution})</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setAssignModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleAssignReviewer} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: '#F59E0B' }}>Assign</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
