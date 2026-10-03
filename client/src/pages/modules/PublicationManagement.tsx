import { useState } from 'react'
import { jsPDF } from 'jspdf'
import { hasPermission } from '../../permissions/config'
import type { SessionUser } from '../../types/index'
import type { Publication } from '../../types/index'
import { usePublications, useCreatePublication, useUpdatePublication, useDeletePublication } from '../../services/publications'
import Drawer from '../../layout/Drawer'
import FormModal, { inputCls, TagInput } from '../../components/Modals/FormModal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const categories = [
  { id: 'all', label: 'All Publications' },
  { id: 'Journal', label: 'Journal Papers' },
  { id: 'Conference', label: 'Conference Papers' },
  { id: 'Book', label: 'Books' },
  { id: 'Patent', label: 'Patents' },
  { id: 'Report', label: 'Technical Reports' },
]

const statusStyles: Record<string, string> = {
  Draft: 'bg-[#F1F5F9] text-[#64748B]',
  'Under Review': 'bg-amber-50 text-amber-700',
  Published: 'gradient-bg text-white',
  Rejected: 'bg-red-50 text-red-700',
}

function PubDrawerContent({ pub, onCopyDOI, onDownloadPDF }: { pub: Publication; onCopyDOI: () => void; onDownloadPDF: () => void }) {
  return (
    <div className="space-y-5">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[pub.status] || 'bg-[#F1F5F9] text-[#64748B]'}`}>{pub.status}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{pub.type}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">{pub.year}</span>
      </div>

      {/* Title */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Title</p>
        <h3 className="font-display text-xl text-[#0F172A] leading-snug">{pub.title}</h3>
      </div>

      {/* Authors */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Authors</p>
        <p className="text-sm text-[#64748B]">{Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || ''}</p>
      </div>

      {/* Abstract */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Abstract</p>
        <p className="text-sm text-[#64748B] leading-relaxed">{pub.abstract}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F1F5F9]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Journal / Venue</p>
          <p className="text-sm font-medium text-[#0F172A]">{pub.journal}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Citations</p>
          <p className="font-display text-2xl text-[#0F172A]">{pub.citations ?? 0}</p>
        </div>
      </div>

      {/* DOI */}
      {pub.doi && (
        <div className="pt-2 border-t border-[#F1F5F9]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">DOI</p>
          <div className="flex items-center gap-2">
            <p className="text-xs font-mono text-[#0052FF] flex-1">{pub.doi}</p>
            <button
              onClick={onCopyDOI}
              className="px-2.5 py-1 text-xs border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#F1F5F9]">
        <button
          onClick={onDownloadPDF}
          className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 transition-all"
        >
          Download PDF (Demo)
        </button>
      </div>
    </div>
  )
}

interface NewPub {
  title: string
  authors: string[]
  journal: string
  year: string
  type: string
  status: string
  doi: string
  abstract: string
}

export default function PublicationManagement({ user }: { user?: SessionUser }) {
  const { showToast } = useToast()
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeStatus, setActiveStatus] = useState('all')
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null)
  
  // Live API query and mutation strictly from PostgreSQL database
  const { data: activePubs = [], isLoading } = usePublications()
  const createPubMutation = useCreatePublication()
  const updatePubMutation = useUpdatePublication()
  const deletePubMutation = useDeletePublication()

  const [modalOpen, setModalOpen] = useState(false)
  const [newPub, setNewPub] = useState<NewPub>({
    title: '', authors: [], journal: '', year: String(new Date().getFullYear()),
    type: 'Journal', status: 'Draft', doi: '', abstract: '',
  })

  // Edit / delete state
  const [editingPub, setEditingPub] = useState<Publication | null>(null)
  const [editForm, setEditForm] = useState<NewPub>({
    title: '', authors: [], journal: '', year: '', type: 'Journal', status: 'Draft', doi: '', abstract: '',
  })

  const filtered = activePubs.filter((p) => {
    if (!p) return false
    const typeMatch = activeCategory === 'all' || p.type === activeCategory
    const statusMatch = activeStatus === 'all' || p.status === activeStatus
    return typeMatch && statusMatch
  })

  const handleCopyDOI = (pub: Publication) => {
    if (pub.doi) {
      navigator.clipboard.writeText(pub.doi).catch(() => {})
      showToast('DOI copied to clipboard', 'success')
    }
  }

  const handleDownloadPDF = (pub: Publication) => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text((pub.title || 'Publication').slice(0, 80), 14, 20)
      doc.setFontSize(10)
      doc.setTextColor(100)
      const authorsStr = Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || 'Unknown'
      doc.text(`Authors: ${authorsStr}`, 14, 32)
      doc.text(`Journal: ${pub.journal} | Year: ${pub.year} | Type: ${pub.type}`, 14, 39)
      doc.text(`Status: ${pub.status} | Citations: ${pub.citations || 0}`, 14, 46)
      if (pub.doi) doc.text(`DOI: ${pub.doi}`, 14, 53)
      doc.setFontSize(9)
      doc.setTextColor(60)
      const abstractLines = doc.splitTextToSize((pub.abstract || 'No abstract').slice(0, 300), 180)
      doc.text(abstractLines, 14, 65)
      doc.save(`pub-${pub.id}-${pub.year}.pdf`)
      showToast('PDF downloaded', 'success')
    } catch {
      showToast('Downloaded publication summary', 'success')
    }
  }

  const handleAddPub = () => {
    if (!newPub.title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    
    // Payload sent to backend database (no manual client-side ID)
    const payload = {
      title: newPub.title,
      authors: newPub.authors.length ? newPub.authors : ['Unknown Author'],
      journal: newPub.journal || 'Unpublished',
      year: parseInt(newPub.year) || new Date().getFullYear(),
      type: newPub.type as Publication['type'],
      status: newPub.status as Publication['status'],
      doi: newPub.doi || null,
      citations: 0,
      abstract: newPub.abstract || 'No abstract provided.',
    }

    createPubMutation.mutate(payload, {
      onSuccess: (savedPub) => {
        showToast(`Publication "${savedPub.title.slice(0, 35)}..." saved to database!`, 'success')
        setModalOpen(false)
        setNewPub({ title: '', authors: [], journal: '', year: String(new Date().getFullYear()), type: 'Journal', status: 'Draft', doi: '', abstract: '' })
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || 'Failed to save publication to database', 'error')
      }
    })
  }

  const openEdit = (pub: Publication) => {
    setEditingPub(pub)
    setEditForm({
      title: pub.title,
      authors: Array.isArray(pub.authors) ? pub.authors : [],
      journal: pub.journal,
      year: String(pub.year),
      type: pub.type,
      status: pub.status,
      doi: pub.doi || '',
      abstract: pub.abstract || '',
    })
  }

  const handleUpdatePub = () => {
    if (!editingPub) return
    if (!editForm.title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    updatePubMutation.mutate(
      {
        id: editingPub.id,
        data: {
          title: editForm.title,
          authors: editForm.authors.length ? editForm.authors : ['Unknown Author'],
          journal: editForm.journal || 'Unpublished',
          year: parseInt(editForm.year) || editingPub.year,
          type: editForm.type as Publication['type'],
          status: editForm.status as Publication['status'],
          doi: editForm.doi || null,
          abstract: editForm.abstract || 'No abstract provided.',
        },
      },
      {
        onSuccess: (saved) => {
          showToast(`Publication "${saved.title.slice(0, 35)}..." updated`, 'success')
          setEditingPub(null)
        },
        onError: (err: any) => {
          showToast(err.response?.data?.detail || 'Failed to update publication', 'error')
        },
      }
    )
  }

  const handleDeletePub = (pub: Publication) => {
    if (!window.confirm(`Delete publication "${pub.title.slice(0, 60)}"? This cannot be undone.`)) return
    deletePubMutation.mutate(pub.id, {
      onSuccess: () => {
        showToast('Publication deleted', 'success')
        if (selectedPub?.id === pub.id) setSelectedPub(null)
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || 'Failed to delete publication', 'error')
      },
    })
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">03 — Publication Mgmt</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Publications</h1>
            <p className="text-[#64748B] mt-1">Manage your research output directly from PostgreSQL database</p>
          </div>
          {hasPermission(user, 'publications.create') && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New Publication
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar */}
        <aside className="w-52 flex-shrink-0 space-y-3">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] px-2 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Filter by Type
            </p>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-50 text-[#0052FF] font-medium'
                    : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id ? 'gradient-bg text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}>
                  {cat.id === 'all' ? activePubs.length : activePubs.filter(p => p && p.type === cat.id).length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] px-2 py-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Filter by Status
            </p>
            {['all', 'Published', 'Under Review', 'Draft', 'Rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setActiveStatus(s)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all mb-0.5 cursor-pointer ${
                  activeStatus === s
                    ? 'bg-blue-50 text-[#0052FF] font-medium'
                    : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                }`}
              >
                <span className="capitalize">{s === 'all' ? 'All Statuses' : s}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Publication list */}
        <div className="flex-1 space-y-3">
          {isLoading && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-sm text-[#64748B]">
              Loading publications from database...
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <EmptyState icon="📚" title="No publications found" subtitle="Try adjusting your filters or click 'New Publication' to save one into PostgreSQL database." />
          )}
          {!isLoading && filtered.map((pub) => (
            <div
              key={pub.id}
              onClick={() => setSelectedPub(pub)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[pub.status] || 'bg-[#F1F5F9] text-[#64748B]'}`}>
                      {pub.status}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{pub.type}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#0F172A] leading-snug mb-1">{pub.title}</h3>
                  <p className="text-xs text-[#64748B]">{Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors || ''}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{pub.journal} · {pub.year}</p>
                  {pub.doi && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-wide text-[#94A3B8]">DOI</span>
                      <span className="text-xs font-mono text-[#0052FF]">{pub.doi}</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {(pub.citations || 0) > 0 && (
                    <div>
                      <p className="font-display text-xl text-[#0F172A]">{pub.citations}</p>
                      <p className="text-xs text-[#64748B]">citations</p>
                    </div>
                  )}
                  {(hasPermission(user, 'publications.approve') || hasPermission(user, 'publications.archive')) && (
                    <div className="flex gap-2 mt-3 justify-end">
                      {hasPermission(user, 'publications.approve') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(pub) }}
                          className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF] transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission(user, 'publications.archive') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePub(pub) }}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Drawer
        open={selectedPub !== null}
        onClose={() => setSelectedPub(null)}
        title="Publication Details"
      >
        {selectedPub && (
          <PubDrawerContent
            pub={selectedPub}
            onCopyDOI={() => handleCopyDOI(selectedPub)}
            onDownloadPDF={() => handleDownloadPDF(selectedPub)}
          />
        )}
      </Drawer>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Publication"
        label="Publication Mgmt"
        onSubmit={handleAddPub}
        submitLabel={createPubMutation.isPending ? "Saving to Database..." : "Add Publication"}
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Title <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="Enter publication title"
            value={newPub.title}
            onChange={(e) => setNewPub({ ...newPub, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Authors</label>
          <TagInput
            tags={newPub.authors}
            onChange={(authors) => setNewPub({ ...newPub, authors })}
            placeholder="Type name and press Enter"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Journal / Conference</label>
            <input
              className={inputCls}
              placeholder="e.g. Nature Methods"
              value={newPub.journal}
              onChange={(e) => setNewPub({ ...newPub, journal: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Year</label>
            <input
              className={inputCls}
              type="number"
              placeholder="2024"
              value={newPub.year}
              onChange={(e) => setNewPub({ ...newPub, year: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Type</label>
            <select
              className={inputCls}
              value={newPub.type}
              onChange={(e) => setNewPub({ ...newPub, type: e.target.value })}
            >
              {['Journal', 'Conference', 'Book', 'Patent', 'Report'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
            <select
              className={inputCls}
              value={newPub.status}
              onChange={(e) => setNewPub({ ...newPub, status: e.target.value })}
            >
              {['Draft', 'Under Review', 'Published', 'Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">DOI</label>
          <input
            className={inputCls}
            placeholder="10.xxxx/xxxxx (optional)"
            value={newPub.doi}
            onChange={(e) => setNewPub({ ...newPub, doi: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Abstract</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={4}
            placeholder="Enter abstract..."
            value={newPub.abstract}
            onChange={(e) => setNewPub({ ...newPub, abstract: e.target.value })}
          />
        </div>
      </FormModal>

      <FormModal
        open={editingPub !== null}
        onClose={() => setEditingPub(null)}
        title="Edit Publication"
        label="Publication Mgmt"
        onSubmit={handleUpdatePub}
        submitLabel={updatePubMutation.isPending ? "Saving..." : "Save Changes"}
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Title <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Authors</label>
          <TagInput
            tags={editForm.authors}
            onChange={(authors) => setEditForm({ ...editForm, authors })}
            placeholder="Type name and press Enter"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Journal / Conference</label>
            <input
              className={inputCls}
              value={editForm.journal}
              onChange={(e) => setEditForm({ ...editForm, journal: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Year</label>
            <input
              className={inputCls}
              type="number"
              value={editForm.year}
              onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Type</label>
            <select
              className={inputCls}
              value={editForm.type}
              onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
            >
              {['Journal', 'Conference', 'Book', 'Patent', 'Report'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
            <select
              className={inputCls}
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              {['Draft', 'Under Review', 'Published', 'Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">DOI</label>
          <input
            className={inputCls}
            value={editForm.doi}
            onChange={(e) => setEditForm({ ...editForm, doi: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Abstract</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={4}
            value={editForm.abstract}
            onChange={(e) => setEditForm({ ...editForm, abstract: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  )
}
