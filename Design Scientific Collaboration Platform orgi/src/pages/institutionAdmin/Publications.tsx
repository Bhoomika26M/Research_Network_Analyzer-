import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, Search } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'
import type { Publication } from '@/data/mockData'

const STATUS_BADGE: Record<string, string> = {
  Published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Submitted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'Under Review': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
}

const TYPE_BADGE: Record<string, string> = {
  Journal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Conference: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Book Chapter': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Preprint: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

export default function Publications() {
  const { publications, updatePublication, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const [approveTarget, setApproveTarget] = useState<Publication | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Publication | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  const filtered = useMemo(() => {
    let list = [...publications]
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.journal.toLowerCase().includes(search.toLowerCase()) || p.authors.some(a => a.toLowerCase().includes(search.toLowerCase())))
    if (typeFilter !== 'All') list = list.filter(p => p.type === typeFilter)
    if (statusFilter !== 'All') list = list.filter(p => p.status === statusFilter)
    return list
  }, [publications, search, typeFilter, statusFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleApprove = () => {
    if (!approveTarget) return
    updatePublication(approveTarget.id, { status: 'Published' })
    showToast(`"${approveTarget.title}" approved and published`, 'success')
    setApproveTarget(null)
  }

  const openReject = (pub: Publication) => { setRejectTarget(pub); setRejectReason(''); setShowRejectModal(true) }
  const handleReject = () => {
    if (!rejectTarget) return
    updatePublication(rejectTarget.id, { status: 'Draft' })
    showToast(`"${rejectTarget.title}" rejected`, 'warning')
    setShowRejectModal(false)
    setRejectTarget(null)
  }

  const exportData = filtered.map(p => ({ Title: p.title, Authors: p.authors.join(', '), Journal: p.journal, Year: p.year, Type: p.type, Status: p.status, Citations: p.citations }))

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Publications</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} publication{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search publications…" className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        </div>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          <option>Journal</option>
          <option>Conference</option>
          <option>Book Chapter</option>
          <option>Preprint</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40">
          <option>All</option>
          <option>Published</option>
          <option>Submitted</option>
          <option>Under Review</option>
          <option>Draft</option>
        </select>
        <ExportButtons data={exportData} columns={['Title', 'Authors', 'Journal', 'Year', 'Type', 'Status', 'Citations']} filename="publications" title="Publications Export" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/50">
              <tr>
                {['Title', 'Authors', 'Journal', 'Year', 'Type', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No publications found.</td></tr>
              ) : paginated.map(pub => (
                <tr key={pub.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-foreground line-clamp-2">{pub.title}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {pub.authors[0]}{pub.authors.length > 1 ? ` +${pub.authors.length - 1}` : ''}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap max-w-32 truncate">{pub.journal}</td>
                  <td className="px-4 py-3 text-muted-foreground">{pub.year}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[pub.type] || ''}`}>{pub.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[pub.status] || ''}`}>{pub.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(pub.status === 'Submitted' || pub.status === 'Under Review') && (
                        <>
                          <button onClick={() => setApproveTarget(pub)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Approve"><CheckCircle size={14} /></button>
                          <button onClick={() => openReject(pub)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject"><XCircle size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      <ConfirmDialog
        open={!!approveTarget}
        title="Approve Publication"
        message={`Approve "${approveTarget?.title}"? It will be marked as Published.`}
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject modal with reason */}
      <Modal open={showRejectModal} title="Reject Publication" onClose={() => setShowRejectModal(false)} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Rejecting: <span className="font-medium text-foreground">{rejectTarget?.title}</span></p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Reason (optional)</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Provide feedback to the author…" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleReject} className="px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium">Reject</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
