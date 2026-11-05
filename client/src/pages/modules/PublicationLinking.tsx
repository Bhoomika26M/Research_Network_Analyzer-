import { useState } from 'react'
import { useLinks, useCreateLink, useUpdateLink, useDeleteLink } from '../../services/links'
import { usePublications } from '../../services/publications'
import { hasPermission } from '../../permissions/config'
import type { SessionUser } from '../../types/index'
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

export default function PublicationLinking({ user }: { user?: SessionUser } = {}) {
  const { showToast } = useToast()
  const canLink = hasPermission(user, 'publications.link')
  const { data: apiLinks = [] } = useLinks()
  const { data: apiPubs = [] } = usePublications()
  const createLinkMutation = useCreateLink()
  const updateLinkMutation = useUpdateLink()
  const deleteLinkMutation = useDeleteLink()

  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [pendingRelation, setPendingRelation] = useState<LinkedPub['relation']>('Cites')

  // Only publications the role may manage can act as the citation source.
  // The backend re-checks ownership of the chosen source title.
  const ownPubIds = user?.publications_ids ?? []
  const sourcePubs = user?.role === 'researcher'
    ? apiPubs.filter((p) => ownPubIds.includes(p.id))
    : apiPubs
  const [sourceId, setSourceId] = useState<number | null>(null)
  const sourcePub = sourcePubs.find((p) => p.id === sourceId) ?? sourcePubs[0] ?? null

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
    if (!canLink) {
      showToast('Your role cannot link publications.', 'error')
      return
    }
    if (!sourcePub) {
      showToast('Select a source publication you own first.', 'error')
      return
    }
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
          showToast(`Linked "${pub.title}"`, 'success')
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">06 — Citation Mgmt / Publication Linking</span>
        </span>
        <h1 className="font-display font-bold text-3xl text-foreground">Publication Linking</h1>
        <p className="text-muted-foreground mt-1">Connect citations and related works to build your reference graph</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Source publication */}
        <div className="col-span-1">
          <div className="bg-card rounded-2xl border border-border p-5 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Source Publication
            </span>
            {sourcePubs.length > 0 ? (
              <>
                <select
                  value={sourcePub?.id ?? ''}
                  onChange={(e) => setSourceId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary mb-2"
                >
                  {sourcePubs.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                {sourcePub && (
                  <div className="p-3 rounded-xl bg-blue-50 border-2 border-primary/20">
                    <p className="text-sm font-semibold text-foreground leading-snug">{sourcePub.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Array.isArray(sourcePub.authors) ? sourcePub.authors.join(', ') : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{sourcePub.type} · {sourcePub.year}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-3 rounded-xl bg-secondary text-xs text-muted-foreground">
                No publication you own is available as a source.
              </div>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Relation Types
            </span>
            <div className="space-y-2">
              {(['Cites', 'Related', 'Extends', 'Refutes'] as const).map(rel => (
                <div key={rel} className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${relationColors[rel]}`}>{rel}</span>
                  <span className="text-xs text-muted-foreground">
                    {rel === 'Cites' ? 'Direct citation' :
                     rel === 'Related' ? 'Related topic' :
                     rel === 'Extends' ? 'Builds on this' :
                     'Contradicts findings'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/80 mt-3">Click a relation chip to cycle through types</p>
          </div>
        </div>

        {/* Linking panel */}
        <div className="col-span-2 space-y-4">
          {/* Search + add */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
              Link Publication
            </span>
            <div className="flex gap-3 mb-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="6" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                  <line x1="8.5" y1="8.5" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search by title, author, or DOI..."
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-card transition-colors"
                />
                {showDropdown && filteredResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-lg z-20 overflow-hidden">
                    {filteredResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => addLink(result)}
                        className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b border-[#F8FAFC] last:border-0"
                      >
                        <p className="text-sm font-medium text-foreground leading-snug">{result.title}</p>
                        <p className="text-xs text-muted-foreground">{result.authors} · {result.year}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <select
                value={pendingRelation}
                onChange={(e) => setPendingRelation(e.target.value as LinkedPub['relation'])}
                className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-muted-foreground focus:outline-none border-0 bg-secondary"
              >
                <option>Cites</option>
                <option>Related</option>
                <option>Extends</option>
                <option>Refutes</option>
              </select>
              {canLink && (
                <button
                  onClick={() => {
                    if (filteredResults.length > 0) addLink(filteredResults[0])
                    else showToast('Search for a publication to link first.', 'info')
                  }}
                  disabled={!sourcePub}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-blue-50 transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Link Publication
                </button>
              )}
            </div>
          </div>

          {/* Linked items */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Linked Publications ({linked.length})
              </span>
            </div>

            <div className="space-y-2">
              {linked.map(pub => (
                <div key={pub.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-background hover:bg-secondary border border-transparent hover:border-border transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug truncate">{pub.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{pub.authors} · {pub.year}</p>
                  </div>
                  <button
                    onClick={() => cycleRelation(pub.id)}
                    disabled={!canLink}
                    title={canLink ? 'Click to cycle relation type' : 'Your role cannot link publications'}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer disabled:cursor-not-allowed ${relationColors[pub.relation]}`}
                  >
                    {pub.relation}
                  </button>
                  {canLink && (
                    <button
                      onClick={() => removeLink(pub.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg hover:bg-red-50 flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {linked.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No publications linked yet</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">Use the search above to link related works</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

