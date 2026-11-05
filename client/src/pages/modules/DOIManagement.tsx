import { usePublications } from '../../services/publications'
import { useMintDOI } from '../../services/dois'
import { hasPermission } from '../../permissions/config'
import type { SessionUser } from '../../types/index'
import { useToast } from '../../context/ToastContext'

type VerifyStatus = 'valid' | 'invalid' | 'pending' | 'unset'

type PubDOI = {
  id: number
  title: string
  authors: string
  year: string
  type: string
  doi: string
  status: VerifyStatus
  // Publication workflow status (Draft / Submitted / Published / …); `status`
  // above is the DOI verification state and must not be used for scoping.
  pubStatus: string
}


const statusIcon = {
  valid: (
    <span className="inline-flex w-6 h-6 rounded-full bg-emerald-100 items-center justify-center" title="DOI verified">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2 5l2 2 4-4" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  ),
  invalid: (
    <span className="inline-flex w-6 h-6 rounded-full bg-red-100 items-center justify-center" title="DOI invalid">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  ),
  pending: (
    <span className="inline-flex w-6 h-6 rounded-full bg-amber-100 items-center justify-center" title="Verifying…">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="3.5" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="2 2"/>
      </svg>
    </span>
  ),
  unset: (
    <span className="inline-flex w-6 h-6 rounded-full bg-secondary items-center justify-center" title="No DOI">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <line x1="3" y1="5" x2="7" y2="5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  ),
}

export default function DOIManagement({ user }: { user?: SessionUser } = {}) {
  const { showToast } = useToast()
  const { data: apiPubs = [] } = usePublications()
  const mintMutation = useMintDOI()
  const canMint = hasPermission(user, 'dois.mint')
  const isAdmin = user?.role === 'admin'
  const ownPubIds = user?.publications_ids ?? []

  // Mirror the backend rule in the UI: researchers mint only for their own
  // published work; institutions/admins rely on the server-side scope check.
  const canMintFor = (pub: { id: number; pubStatus: string }) => {
    if (!canMint) return false
    if (isAdmin) return true
    if (user?.role === 'researcher') return ownPubIds.includes(pub.id) && pub.pubStatus === 'Published'
    return true
  }

  // Derive the DOI table from live publication data so edits persist in the DB.
  const pubs: PubDOI[] = apiPubs.map((p) => ({
    id: p.id,
    title: p.title,
    authors: Array.isArray(p.authors) ? p.authors.join(', ') : String(p.authors || ''),
    year: String(p.year ?? ''),
    type: p.type || 'Journal',
    doi: p.doi || '',
    status: p.doi ? (p.doi.startsWith('10.') ? 'valid' : 'invalid') : 'unset',
    pubStatus: p.status,
  }))

  const handleMint = (pub: PubDOI) => {
    if (!canMintFor(pub)) {
      showToast('You can only mint DOIs for your own published publications.', 'error')
      return
    }
    mintMutation.mutate(
      { publicationId: pub.id },
      {
        onSuccess: (res) => {
          showToast(`DOI ${res.doi} minted`, 'success')
        },
        onError: (err: any) => {
          showToast(err?.response?.data?.detail || 'Failed to mint DOI', 'error')
        },
      }
    )
  }

  const handleVerify = (pub: PubDOI) => {
    if (!pub.doi) return
    const valid = pub.doi.startsWith('10.')
    showToast(valid ? `DOI ${pub.doi} is valid` : `DOI ${pub.doi} appears invalid`, valid ? 'success' : 'error')
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">06 — Citation Mgmt / DOI Management</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">DOI Management</h1>
            <p className="text-muted-foreground mt-1">Assign, verify, and fetch metadata for all publication DOIs</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>{pubs.filter(p => p.status === 'valid').length} verified
            <span className="w-2 h-2 rounded-full bg-red-400 ml-2"></span>{pubs.filter(p => p.status === 'invalid').length} invalid
            <span className="w-2 h-2 rounded-full bg-[#CBD5E1] ml-2"></span>{pubs.filter(p => p.status === 'unset').length} unset
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Publications
          </span>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="8" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search publications..." className="pl-8 pr-4 py-2 bg-secondary rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0052FF] w-56" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-border/60 bg-background">
              {['Publication', 'Type / Year', 'DOI', 'Status', 'Actions'].map(col => (
                <th key={col} className="text-left px-5 py-3 text-xs font-mono uppercase tracking-wide text-muted-foreground">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pubs.map((pub) => (
              <tr key={pub.id} className="border-b border-border/60 last:border-0 hover:bg-background transition-colors">
                <td className="px-5 py-4 max-w-[280px]">
                  <p className="text-sm font-medium text-foreground leading-snug">{pub.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{pub.authors}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-muted-foreground">{pub.type}</span>
                  <p className="text-xs text-muted-foreground mt-1">{pub.year}</p>
                </td>
                <td className="px-5 py-4 w-72">
                  <input
                    value={pub.doi}
                    readOnly
                    placeholder="10.xxxx/xxxxxxxx"
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-mono text-foreground placeholder:text-muted-foreground"
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {statusIcon[pub.status]}
                    <span className={`text-xs font-medium ${
                      pub.status === 'valid' ? 'text-emerald-700' :
                      pub.status === 'invalid' ? 'text-red-600' :
                      pub.status === 'pending' ? 'text-amber-600' : 'text-muted-foreground/80'
                    }`}>
                      {pub.status === 'valid' ? 'Verified' : pub.status === 'invalid' ? 'Invalid' : pub.status === 'pending' ? 'Checking…' : 'No DOI'}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(pub)}
                      disabled={!pub.doi}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Verify DOI
                    </button>
                    {canMint && (
                      <button
                        onClick={() => handleMint(pub)}
                        disabled={!!pub.doi || !canMintFor(pub)}
                        title={canMintFor(pub) ? 'Mint DOI' : 'Only your own published publications can receive a DOI'}
                        className="px-3 py-1.5 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Mint DOI
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

