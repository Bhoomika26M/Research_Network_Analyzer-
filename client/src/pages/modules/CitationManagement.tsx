import { useState } from 'react'
import type { Citation, Publication } from '../../types/index'
import { useCitations, useCreateCitation, useUpdateCitation, useDeleteCitation } from '../../services/citations'
import { usePublications } from '../../services/publications'
import Drawer from '../../layout/Drawer'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

function CitationDrawerContent({ citation, pubs }: { citation: Citation; pubs: Publication[] }) {
  const sourcePub = pubs.find((p) => p.id === citation.sourcePubId)
  const targetPub = pubs.find((p) => p.id === citation.targetPubId)

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Year</p>
        <p className="text-sm font-medium text-[#0F172A]">{citation.year}</p>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1.5">Context</p>
        <p className="text-sm text-[#64748B] leading-relaxed italic">"{citation.context}"</p>
      </div>

      <div className="pt-4 border-t border-[#F1F5F9]">
        <div className="space-y-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 mb-2">
              Citing Publication
            </span>
            {sourcePub ? (
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
                <p className="text-sm font-semibold text-[#0F172A] leading-snug mb-1">{sourcePub.title}</p>
                <p className="text-xs text-[#64748B]">{Array.isArray(sourcePub.authors) ? sourcePub.authors.join(', ') : sourcePub.authors || ''}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{sourcePub.journal} · {sourcePub.year}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">{sourcePub.type}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">{sourcePub.status}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8]">Publication not found</p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-[#64748B] font-medium">cites</span>
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <line x1="12" y1="0" x2="12" y2="10" stroke="#94A3B8" strokeWidth="1.5"/>
                <path d="M7 8l5 6 5-6" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 mb-2">
              Cited Publication
            </span>
            {targetPub ? (
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
                <p className="text-sm font-semibold text-[#0F172A] leading-snug mb-1">{targetPub.title}</p>
                <p className="text-xs text-[#64748B]">{Array.isArray(targetPub.authors) ? targetPub.authors.join(', ') : targetPub.authors || ''}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{targetPub.journal} · {targetPub.year}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">{targetPub.type}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F1F5F9] text-[#64748B]">{targetPub.citations || 0} citations</span>
                </div>
                {targetPub.doi && (
                  <p className="text-xs font-mono text-[#0052FF] mt-2">{targetPub.doi}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8]">Publication not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NewCitation {
  sourcePubId: string
  targetPubId: string
  relation: string
  context: string
}

export default function CitationManagement() {
  const { showToast } = useToast()
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)
  
  // Query backend PostgreSQL database strictly
  const { data: activeCitations = [], isLoading } = useCitations()
  const { data: activePubs = [] } = usePublications()
  const createCitMutation = useCreateCitation()
  const updateCitMutation = useUpdateCitation()
  const deleteCitMutation = useDeleteCitation()

  const [modalOpen, setModalOpen] = useState(false)
  const [newCit, setNewCit] = useState<NewCitation>({
    sourcePubId: '', targetPubId: '', relation: 'Cites', context: '',
  })

  // Edit / delete state
  const [editingCit, setEditingCit] = useState<Citation | null>(null)
  const [editForm, setEditForm] = useState({ sourcePubId: '', targetPubId: '', context: '' })
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = activeCitations.filter(c => {
    if (!c) return false
    const sourcePub = activePubs.find(p => p.id === c.sourcePubId)
    const targetPub = activePubs.find(p => p.id === c.targetPubId)
    const matchSearch = searchQuery === '' || (
      (sourcePub?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (targetPub?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchSearch
  })

  const handleAddCitation = () => {
    if (!newCit.sourcePubId || !newCit.targetPubId) {
      showToast('Source and target publications are required', 'error')
      return
    }
    if (newCit.sourcePubId === newCit.targetPubId) {
      showToast('Source and target must be different publications', 'error')
      return
    }
    
    // Payload sent to backend database (no manual client-side ID)
    const payload = {
      sourcePubId: parseInt(newCit.sourcePubId),
      targetPubId: parseInt(newCit.targetPubId),
      year: new Date().getFullYear(),
      context: newCit.context || `${newCit.relation} relationship.`,
    }

    createCitMutation.mutate(payload, {
      onSuccess: () => {
        showToast('Citation link saved to database!', 'success')
        setModalOpen(false)
        setNewCit({ sourcePubId: '', targetPubId: '', relation: 'Cites', context: '' })
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || 'Failed to save citation to database', 'error')
      }
    })
  }

  const openEditCitation = (c: Citation) => {
    setEditingCit(c)
    setEditForm({
      sourcePubId: String(c.sourcePubId),
      targetPubId: String(c.targetPubId),
      context: c.context,
    })
  }

  const handleUpdateCitation = () => {
    if (!editingCit) return
    if (!editForm.sourcePubId || !editForm.targetPubId) {
      showToast('Source and target publications are required', 'error')
      return
    }
    updateCitMutation.mutate(
      {
        id: editingCit.id,
        data: {
          sourcePubId: parseInt(editForm.sourcePubId),
          targetPubId: parseInt(editForm.targetPubId),
          context: editForm.context || 'Citation relationship.',
        },
      },
      {
        onSuccess: () => {
          showToast('Citation updated', 'success')
          setEditingCit(null)
        },
        onError: (err: any) => {
          showToast(err.response?.data?.detail || 'Failed to update citation', 'error')
        },
      }
    )
  }

  const handleDeleteCitation = (c: Citation) => {
    if (!window.confirm('Delete this citation link? This cannot be undone.')) return
    deleteCitMutation.mutate(c.id, {
      onSuccess: () => {
        showToast('Citation deleted', 'success')
        if (selectedCitation?.id === c.id) setSelectedCitation(null)
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || 'Failed to delete citation', 'error')
      },
    })
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">06 — Citation Mgmt</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Citations & References</h1>
            <p className="text-[#64748B] mt-1">Track citation relationships between publications in PostgreSQL network</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Link Citation
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by publication title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF]"
          />
        </div>
      </div>

      {/* Citation list */}
      <div className="space-y-3">
        {isLoading && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-sm text-[#64748B]">
            Loading citations from database...
          </div>
        )}
        {!isLoading && filtered.map(c => {
          const sPub = activePubs.find(p => p.id === c.sourcePubId)
          const tPub = activePubs.find(p => p.id === c.targetPubId)
          return (
            <div
              key={c.id}
              onClick={() => setSelectedCitation(c)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-[#0052FF] mb-1">Citing Paper</p>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{sPub?.title || `Publication #${c.sourcePubId}`}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{sPub ? (Array.isArray(sPub.authors) ? sPub.authors.join(', ') : sPub.authors) : ''}</p>
                </div>
                
                <div className="flex flex-col items-center flex-shrink-0 px-4">
                  <span className="text-xs text-[#64748B] font-medium mb-1">cites</span>
                  <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                    <line x1="0" y1="8" x2="18" y2="8" stroke="#0052FF" strokeWidth="1.5"/>
                    <path d="M14 4l4 4-4 4" stroke="#0052FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[10px] text-[#94A3B8] mt-1">{c.year}</span>
                </div>

                <div className="flex-1 min-w-0 text-right">
                  <p className="text-xs font-mono text-emerald-600 mb-1">Cited Paper</p>
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{tPub?.title || `Publication #${c.targetPubId}`}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{tPub ? (Array.isArray(tPub.authors) ? tPub.authors.join(', ') : tPub.authors) : ''}</p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditCitation(c) }}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF] transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteCitation(c) }}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {!isLoading && filtered.length === 0 && (
          <EmptyState icon="🔗" title="No citations found" subtitle="Try adjusting your search criteria" />
        )}
      </div>

      <Drawer
        open={selectedCitation !== null}
        onClose={() => setSelectedCitation(null)}
        title="Citation Detail"
      >
        {selectedCitation && <CitationDrawerContent citation={selectedCitation} pubs={activePubs} />}
      </Drawer>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Link Citation"
        label="Citation Mgmt"
        onSubmit={handleAddCitation}
        submitLabel={createCitMutation.isPending ? "Saving to Database..." : "Link Citation"}
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Source (Citing Paper) <span className="text-red-500">*</span></label>
          <select
            className={inputCls}
            value={newCit.sourcePubId}
            onChange={e => setNewCit({ ...newCit, sourcePubId: e.target.value })}
          >
            <option value="">Select source publication...</option>
            {activePubs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Target (Cited Paper) <span className="text-red-500">*</span></label>
          <select
            className={inputCls}
            value={newCit.targetPubId}
            onChange={e => setNewCit({ ...newCit, targetPubId: e.target.value })}
          >
            <option value="">Select target publication...</option>
            {activePubs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Citation Context</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            placeholder="e.g. We adapt the federated learning protocol from..."
            value={newCit.context}
            onChange={e => setNewCit({ ...newCit, context: e.target.value })}
          />
        </div>
      </FormModal>

      <FormModal
        open={editingCit !== null}
        onClose={() => setEditingCit(null)}
        title="Edit Citation"
        label="Citation Mgmt"
        onSubmit={handleUpdateCitation}
        submitLabel={updateCitMutation.isPending ? "Saving..." : "Save Changes"}
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Source (Citing Paper) <span className="text-red-500">*</span></label>
          <select
            className={inputCls}
            value={editForm.sourcePubId}
            onChange={e => setEditForm({ ...editForm, sourcePubId: e.target.value })}
          >
            <option value="">Select source publication...</option>
            {activePubs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Target (Cited Paper) <span className="text-red-500">*</span></label>
          <select
            className={inputCls}
            value={editForm.targetPubId}
            onChange={e => setEditForm({ ...editForm, targetPubId: e.target.value })}
          >
            <option value="">Select target publication...</option>
            {activePubs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Citation Context</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            value={editForm.context}
            onChange={e => setEditForm({ ...editForm, context: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  )
}
