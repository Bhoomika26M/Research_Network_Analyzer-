import { usePublications } from '../../services/publications'
import { useMintDOI } from '../../services/dois'
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
    <span className="inline-flex w-6 h-6 rounded-full bg-[#F1F5F9] items-center justify-center" title="No DOI">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <line x1="3" y1="5" x2="7" y2="5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </span>
  ),
}

export default function DOIManagement() {
  const { showToast } = useToast()
  const { data: apiPubs = [] } = usePublications()
  const mintMutation = useMintDOI()

  // Derive the DOI table from live publication data so edits persist in the DB.
  const pubs: PubDOI[] = apiPubs.map((p) => ({
    id: p.id,
    title: p.title,
    authors: Array.isArray(p.authors) ? p.authors.join(', ') : String(p.authors || ''),
    year: String(p.year ?? ''),
    type: p.type || 'Journal',
    doi: p.doi || '',
    status: p.doi ? (p.doi.startsWith('10.') ? 'valid' : 'invalid') : 'unset',
  }))

  const handleMint = (pub: PubDOI) => {
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">06 — Citation Mgmt / DOI Management</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">DOI Management</h1>
            <p className="text-[#64748B] mt-1">Assign, verify, and fetch metadata for all publication DOIs</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F1F5F9] text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>{pubs.filter(p => p.status === 'valid').length} verified
            <span className="w-2 h-2 rounded-full bg-red-400 ml-2"></span>{pubs.filter(p => p.status === 'invalid').length} invalid
            <span className="w-2 h-2 rounded-full bg-[#CBD5E1] ml-2"></span>{pubs.filter(p => p.status === 'unset').length} unset
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Publications
          </span>
          <div className="relative ml-auto">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="8" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input placeholder="Search publications..." className="pl-8 pr-4 py-2 bg-[#F1F5F9] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0052FF] w-56" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#FAFAFA]">
              {['Publication', 'Type / Year', 'DOI', 'Status', 'Actions'].map(col => (
                <th key={col} className="text-left px-5 py-3 text-xs font-mono uppercase tracking-wide text-[#64748B]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pubs.map((pub) => (
              <tr key={pub.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-4 max-w-[280px]">
                  <p className="text-sm font-medium text-[#0F172A] leading-snug">{pub.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{pub.authors}</p>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">{pub.type}</span>
                  <p className="text-xs text-[#64748B] mt-1">{pub.year}</p>
                </td>
                <td className="px-5 py-4 w-72">
                  <input
                    value={pub.doi}
                    readOnly
                    placeholder="10.xxxx/xxxxxxxx"
                    className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-xs font-mono text-[#0F172A] placeholder-[#94A3B8]"
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {statusIcon[pub.status]}
                    <span className={`text-xs font-medium ${
                      pub.status === 'valid' ? 'text-emerald-700' :
                      pub.status === 'invalid' ? 'text-red-600' :
                      pub.status === 'pending' ? 'text-amber-600' : 'text-[#94A3B8]'
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
                      className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Verify DOI
                    </button>
                    <button
                      onClick={() => handleMint(pub)}
                      disabled={!!pub.doi}
                      className="px-3 py-1.5 rounded-xl gradient-bg text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      Mint DOI
                    </button>
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
