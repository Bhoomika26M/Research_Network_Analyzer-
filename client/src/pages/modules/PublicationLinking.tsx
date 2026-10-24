import { useState } from 'react'
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from '../../services/links'
import { useToast } from '../../context/ToastContext'

type LinkedPub = {
  id: number
  title: string
  authors: string
  year: string
  type: string
  relation: 'Cites' | 'Related' | 'Extends' | 'Refutes'
}

const searchResults = [
  { id: 101, title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: '2017', type: 'Conference' },
  { id: 102, title: 'Semi-Supervised Classification with GCNs', authors: 'Kipf & Welling', year: '2017', type: 'Conference' },
  { id: 103, title: 'Communication-Efficient Learning of Deep Networks', authors: 'McMahan et al.', year: '2017', type: 'Conference' },
  { id: 104, title: 'AlphaFold2: Highly accurate protein structure prediction', authors: 'Jumper et al.', year: '2021', type: 'Journal' },
  { id: 105, title: 'Deep Learning for Drug Discovery', authors: 'Chen, A. et al.', year: '2022', type: 'Journal' },
  { id: 106, title: 'Graph Networks as Learnable Physics Engines', authors: 'Battaglia et al.', year: '2018', type: 'Conference' },
]

const initialLinked: LinkedPub[] = [
  { id: 101, title: 'Attention Is All You Need', authors: 'Vaswani et al.', year: '2017', type: 'Conference', relation: 'Cites' },
  { id: 102, title: 'Semi-Supervised Classification with GCNs', authors: 'Kipf & Welling', year: '2017', type: 'Conference', relation: 'Cites' },
  { id: 104, title: 'AlphaFold2: Highly accurate protein structure prediction', authors: 'Jumper et al.', year: '2021', type: 'Journal', relation: 'Related' },
]

const relationColors: Record<string, string> = {
  Cites: 'bg-blue-50 text-blue-700 border-blue-100',
  Related: 'bg-violet-50 text-violet-700 border-violet-100',
  Extends: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Refutes: 'bg-red-50 text-red-700 border-red-100',
}

const sourcePub = {
  title: 'Graph Neural Networks for Protein Interaction Prediction at Scale',
  authors: 'Chen, S., Torres, E., Tanaka, Y.',
  year: '2024',
  type: 'Journal',
}

export default function PublicationLinking() {
  const { showToast } = useToast()
  const { data: apiLinks = [] } = useLinks()
  const createLinkMutation = useCreateLink()
  const updateLinkMutation = useUpdateLink()
  const deleteLinkMutation = useDeleteLink()

  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingRelation, setPendingRelation] = useState<LinkedPub['relation']>('Cites')

  // Links are loaded from the backend so add/remove/relation-cycle persist.
  const linked: LinkedPub[] = apiLinks.map((l) => ({
    id: l.id,
    title: l.targetTitle,
    authors: l.targetAuthors,
    year: l.targetYear,
    type: l.targetType,
    relation: l.relation as LinkedPub['relation'],
  }))

  const filteredResults = query.length > 1
    ? searchResults.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) &&
        !linked.find(l => l.title === r.title)
      )
    : []

  const addLink = (pub: typeof searchResults[0]) => {
    createLinkMutation.mutate(
      {
        sourceTitle: sourcePub.title,
        targetTitle: pub.title,
        targetAuthors: pub.authors,
        targetYear: pub.year,
        targetType: pub.type,
        relation: pendingRelation,
      },
      {
        onSuccess: () => {
          setQuery('')
          setShowDropdown(false)
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to add link', 'error')
        },
      }
    )
  }

  const removeLink = (id: number) => {
    deleteLinkMutation.mutate(id, {
      onError: (err: any) => showToast(err?.response?.data?.detail || 'Failed to remove link', 'error'),
    })
  }

  const cycleRelation = (id: number) => {
    const link = apiLinks.find((l) => l.id === id)
    if (!link) return
    const relations: LinkedPub['relation'][] = ['Cites', 'Related', 'Extends', 'Refutes']
    const idx = relations.indexOf(link.relation as LinkedPub['relation'])
    updateLinkMutation.mutate(
      { id, data: { relation: relations[(idx + 1) % relations.length] } },
      {
        onError: (err: any) => showToast(err?.response?.data?.detail || 'Failed to update link', 'error'),
      }
    )
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">06 — Citation Mgmt / Publication Linking</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Publication Linking</h1>
        <p className="text-[#64748B] mt-1">Connect citations and related works to build your reference graph</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Source publication */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Source Publication
            </span>
            <div className="p-3 rounded-xl bg-blue-50 border-2 border-[#0052FF]/20">
              <p className="text-sm font-semibold text-[#0F172A] leading-snug">{sourcePub.title}</p>
              <p className="text-xs text-[#64748B] mt-1">{sourcePub.authors}</p>
              <p className="text-xs text-[#64748B]">{sourcePub.type} · {sourcePub.year}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Relation Types
            </span>
            <div className="space-y-2">
              {(['Cites', 'Related', 'Extends', 'Refutes'] as const).map(rel => (
                <div key={rel} className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${relationColors[rel]}`}>{rel}</span>
                  <span className="text-xs text-[#64748B]">
                    {rel === 'Cites' ? 'Direct citation' :
                     rel === 'Related' ? 'Related topic' :
                     rel === 'Extends' ? 'Builds on this' :
                     'Contradicts findings'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[#94A3B8] mt-3">Click a relation chip to cycle through types</p>
          </div>
        </div>

        {/* Linking panel */}
        <div className="col-span-2 space-y-4">
          {/* Search + add */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Link Publication
            </span>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                  <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by title, author, or DOI..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors"
                />
                {showDropdown && filteredResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-20 overflow-hidden">
                    {filteredResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => addLink(result)}
                        className="w-full text-left px-4 py-3 hover:bg-[#F1F5F9] transition-colors border-b border-[#F8FAFC] last:border-0"
                      >
                        <p className="text-sm font-medium text-[#0F172A] leading-snug">{result.title}</p>
                        <p className="text-xs text-[#64748B]">{result.authors} · {result.year}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={pendingRelation}
                onChange={(e) => setPendingRelation(e.target.value as LinkedPub['relation'])}
                className="px-3 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:outline-none border-0 bg-[#F1F5F9]"
              >
                <option>Cites</option>
                <option>Related</option>
                <option>Extends</option>
                <option>Refutes</option>
              </select>
              <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#0052FF] text-[#0052FF] text-sm font-semibold hover:bg-blue-50 transition-all whitespace-nowrap">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Link Publication
              </button>
            </div>
          </div>

          {/* Linked items */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Linked Publications ({linked.length})
              </span>
            </div>

            <div className="space-y-2">
              {linked.map(pub => (
                <div key={pub.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] leading-snug truncate">{pub.title}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">{pub.authors} · {pub.year}</p>
                  </div>
                  <button
                    onClick={() => cycleRelation(pub.id)}
                    title="Click to cycle relation type"
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer ${relationColors[pub.relation]}`}
                  >
                    {pub.relation}
                  </button>
                  <button
                    onClick={() => removeLink(pub.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all flex-shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}

              {linked.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-[#64748B]">No publications linked yet</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Use the search above to link related works</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
