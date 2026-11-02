import { useState } from 'react'
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from '../../services/links'
import { usePublications } from '../../services/publications'
import { useCitations } from '../../services/citations'
import { useToast } from '../../context/ToastContext'

type LinkedPub = {
  id: number | string
  isCitationDb?: boolean
  title: string
  authors: string
  year: string
  type: string
  relation: 'Cites' | 'Related' | 'Extends' | 'Refutes' | 'Cited by'
  context?: string
}

const relationColors: Record<string, string> = {
  Cites: 'bg-blue-50 text-blue-700 border-blue-100',
  'Cited by': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Related: 'bg-violet-50 text-violet-700 border-violet-100',
  Extends: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Refutes: 'bg-red-50 text-red-700 border-red-100',
}

export default function PublicationLinking() {
  const { showToast } = useToast()
  const { data: apiLinks = [] } = useLinks()
  const { data: publications = [], isLoading: pubsLoading } = usePublications()
  const { data: citations = [] } = useCitations()
  const createLinkMutation = useCreateLink()
  const updateLinkMutation = useUpdateLink()
  const deleteLinkMutation = useDeleteLink()

  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingRelation, setPendingRelation] = useState<'Cites' | 'Related' | 'Extends' | 'Refutes'>('Cites')

  // Selected source publication
  const sourcePub = (selectedSourceId !== null ? publications.find(p => p.id === selectedSourceId) : null) || publications[0] || null

  // 1. Current Citation links from PostgreSQL database citations table
  const citationLinks: LinkedPub[] = sourcePub
    ? citations
        .filter((c) => c.sourcePubId === sourcePub.id || c.targetPubId === sourcePub.id)
        .map((c) => {
          const isOutgoing = c.sourcePubId === sourcePub.id
          const otherPubId = isOutgoing ? c.targetPubId : c.sourcePubId
          const otherPub = publications.find((p) => p.id === otherPubId)
          return {
            id: `cit-${c.id}`,
            isCitationDb: true,
            title: otherPub?.title || `Publication #${otherPubId}`,
            authors: otherPub ? (Array.isArray(otherPub.authors) ? otherPub.authors.join(', ') : String(otherPub.authors)) : 'Author unknown',
            year: String(otherPub?.year || c.year),
            type: otherPub?.type || 'Journal',
            relation: isOutgoing ? 'Cites' : 'Cited by',
            context: c.context,
          }
        })
    : []

  // 2. Custom links from PostgreSQL database publication_links table
  const customLinks: LinkedPub[] = sourcePub
    ? apiLinks
        .filter((l) => l.sourceTitle === sourcePub.title || !l.sourceTitle)
        .map((l) => ({
          id: l.id,
          isCitationDb: false,
          title: l.targetTitle,
          authors: l.targetAuthors,
          year: l.targetYear,
          type: l.targetType,
          relation: l.relation as LinkedPub['relation'],
        }))
    : []

  // Combined linked publications
  const allLinked = [...citationLinks, ...customLinks]

  // Filter publications for search — exclude source and already linked
  const filteredResults = query.length > 1
    ? publications.filter(p =>
        p.id !== sourcePub?.id &&
        !allLinked.find(l => l.title.toLowerCase() === p.title.toLowerCase()) &&
        (
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          (Array.isArray(p.authors) ? p.authors.join(', ') : p.authors || '').toLowerCase().includes(query.toLowerCase())
        )
      )
    : []

  const addLink = (pub: typeof publications[0]) => {
    if (!sourcePub) return
    createLinkMutation.mutate(
      {
        sourceTitle: sourcePub.title,
        targetTitle: pub.title,
        targetAuthors: Array.isArray(pub.authors) ? pub.authors.join(', ') : String(pub.authors),
        targetYear: String(pub.year),
        targetType: pub.type,
        relation: pendingRelation,
      },
      {
        onSuccess: () => {
          showToast(`Linked "${pub.title.slice(0, 30)}..." to source`, 'success')
          setQuery('')
          setShowDropdown(false)
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to add link', 'error')
        },
      }
    )
  }

  const removeLink = (item: LinkedPub) => {
    if (typeof item.id === 'number') {
      deleteLinkMutation.mutate(item.id, {
        onSuccess: () => showToast('Link removed', 'success'),
        onError: (err: any) => showToast(err?.response?.data?.detail || 'Failed to remove link', 'error'),
      })
    } else {
      showToast('Database citation record — manage from Citation Management', 'info')
    }
  }

  const cycleRelation = (item: LinkedPub) => {
    if (typeof item.id !== 'number') return
    const link = apiLinks.find((l) => l.id === item.id)
    if (!link) return
    const relations: Array<'Cites' | 'Related' | 'Extends' | 'Refutes'> = ['Cites', 'Related', 'Extends', 'Refutes']
    const idx = relations.indexOf(link.relation as any)
    updateLinkMutation.mutate(
      { id: item.id, data: { relation: relations[(idx + 1) % relations.length] } },
      {
        onSuccess: () => showToast('Relation updated', 'success'),
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
        <p className="text-[#64748B] mt-1">Connect citations, references, and related works to build your interactive research graph</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Source publication selector */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Source Publication
            </span>

            {pubsLoading ? (
              <div className="py-4 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
              </div>
            ) : publications.length > 0 ? (
              <div className="space-y-3">
                <select
                  value={sourcePub?.id ?? ''}
                  onChange={(e) => setSelectedSourceId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-medium focus:outline-none focus:border-[#0052FF] transition-colors"
                >
                  {publications.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title.slice(0, 48)}... ({p.year})
                    </option>
                  ))}
                </select>

                {sourcePub && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border-2 border-[#0052FF]/20">
                    <p className="text-sm font-semibold text-[#0F172A] leading-snug">{sourcePub.title}</p>
                    <p className="text-xs text-[#64748B] mt-1">
                      {Array.isArray(sourcePub.authors) ? sourcePub.authors.join(', ') : sourcePub.authors}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-medium text-blue-700 border border-blue-200">{sourcePub.type}</span>
                      <span className="text-xs text-[#64748B]">{sourcePub.year}</span>
                      <span className="text-xs text-[#64748B] ml-auto">{sourcePub.citations ?? 0} citations</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-[#94A3B8] text-center py-4">No publications available in database</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Relation Legend
            </span>
            <div className="space-y-2">
              {(['Cites', 'Cited by', 'Related', 'Extends', 'Refutes'] as const).map(rel => (
                <div key={rel} className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${relationColors[rel]}`}>{rel}</span>
                  <span className="text-xs text-[#64748B]">
                    {rel === 'Cites' ? 'Direct outgoing citation' :
                     rel === 'Cited by' ? 'Cited by this publication' :
                     rel === 'Related' ? 'Related scientific topic' :
                     rel === 'Extends' ? 'Extends method/theory' :
                     'Contradicts / refutes findings'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linking panel */}
        <div className="col-span-2 space-y-4">
          {/* Search + add link */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Link Publication to Source
            </span>
            <div className="flex gap-3 mb-2">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                  <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  placeholder="Search publications by title or author to link..."
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors"
                />
                {showDropdown && filteredResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto">
                    {filteredResults.map(result => (
                      <button
                        key={result.id}
                        onMouseDown={() => addLink(result)}
                        className="w-full text-left px-4 py-3 hover:bg-[#F1F5F9] transition-colors border-b border-[#F8FAFC] last:border-0 cursor-pointer"
                      >
                        <p className="text-sm font-medium text-[#0F172A] leading-snug">{result.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {Array.isArray(result.authors) ? result.authors.join(', ') : result.authors} · {result.year}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && query.length > 1 && filteredResults.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 text-sm text-[#94A3B8]">No matching publications found</div>
                  </div>
                )}
              </div>
              <select
                value={pendingRelation}
                onChange={(e) => setPendingRelation(e.target.value as any)}
                className="px-3 py-2.5 bg-[#F1F5F9] border-0 rounded-xl text-sm text-[#0F172A] font-medium focus:outline-none"
              >
                <option value="Cites">Cites</option>
                <option value="Related">Related</option>
                <option value="Extends">Extends</option>
                <option value="Refutes">Refutes</option>
              </select>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Select a publication from the search dropdown to instantly link it as {pendingRelation} to the source publication.
            </p>
          </div>

          {/* Current Linked items & citations */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Current Citation Links & References ({allLinked.length})
              </span>
              <span className="text-xs text-[#94A3B8]">
                {citationLinks.length} database citations · {customLinks.length} reference links
              </span>
            </div>

            <div className="space-y-2.5">
              {allLinked.map((pub) => (
                <div key={pub.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAFAFA] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E2E8F0] transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#0F172A] leading-snug truncate">{pub.title}</p>
                    </div>
                    <p className="text-xs text-[#64748B] mt-0.5">{pub.authors} · {pub.year} · {pub.type}</p>
                    {pub.context && (
                      <p className="text-xs text-[#64748B] italic mt-1 bg-white p-2 rounded-lg border border-[#E2E8F0]/60">
                        "{pub.context}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => !pub.isCitationDb && cycleRelation(pub)}
                      title={pub.isCitationDb ? 'Database citation record' : 'Click to cycle relation type'}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-opacity ${pub.isCitationDb ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'} ${relationColors[pub.relation] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {pub.relation}
                    </button>
                    {!pub.isCitationDb && (
                      <button
                        onClick={() => removeLink(pub)}
                        title="Remove link"
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {allLinked.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium text-[#64748B]">No citation links for this publication</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Use the search box above to add references and citations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
