import { useState } from 'react'
import { Search, Filter, Plus, Upload, FileText, BookOpen, Mic, Award, ChevronDown, ExternalLink, X } from 'lucide-react'

const publications = [
  { id: 1, title: 'Quantum Computing Applications in Drug Discovery', authors: 'Chen S., Park J., Williams R.', journal: 'Nature', year: 2024, type: 'Journal', status: 'Published', doi: '10.1038/s41586-024-0001', citations: 47, impact: 64.8 },
  { id: 2, title: 'Deep Learning for Protein Structure Prediction at Scale', authors: 'Kumar P., Zhang W., Anderson T.', journal: 'Science', year: 2024, type: 'Journal', status: 'Published', doi: '10.1126/science.abc1234', citations: 128, impact: 56.9 },
  { id: 3, title: 'Climate Change Impact on Arctic Ecosystems', authors: 'Müller H., Okafor J., Santos M.', journal: 'PNAS', year: 2024, type: 'Journal', status: 'Submitted', doi: null, citations: 0, impact: 12.4 },
  { id: 4, title: 'Neuromorphic Computing: A Decade of Progress', authors: 'Tanaka Y., Cohen D., Patel S.', journal: 'IEEE Transactions', year: 2024, type: 'Journal', status: 'Draft', doi: null, citations: 0, impact: 10.6 },
  { id: 5, title: 'CRISPR-Cas9 Efficiency in Mammalian Gene Editing', authors: 'Garcia L., Kim B., Thompson E.', journal: 'Cell', year: 2024, type: 'Journal', status: 'Published', doi: '10.1016/j.cell.2024.001', citations: 89, impact: 66.9 },
  { id: 6, title: 'Transformer Architectures for Scientific Discovery', authors: 'Patel R., Liu X., Brown M.', journal: 'NeurIPS 2024', year: 2024, type: 'Conference', status: 'Published', doi: '10.5555/neurips2024.001', citations: 34, impact: null },
  { id: 7, title: 'Machine Learning in Genomics: A Comprehensive Review', authors: 'Singh A., Chen S., Park J.', journal: 'Annual Reviews', year: 2023, type: 'Book', status: 'Published', doi: '10.1146/annurev.gen.2023', citations: 201, impact: 18.2 },
  { id: 8, title: 'Novel Catalyst for Green Hydrogen Production (Patent)', authors: 'Weber H., Yamamoto K.', journal: 'USPTO', year: 2024, type: 'Patent', status: 'Published', doi: 'US11234567B2', citations: 0, impact: null },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  Published: { bg: '#ECFDF5', text: '#10B981' },
  Submitted: { bg: '#EFF6FF', text: '#2563EB' },
  Draft: { bg: '#F8FAFC', text: '#94A3B8' },
  Archived: { bg: '#FEF3C7', text: '#B45309' },
}

const typeIcons: Record<string, any> = {
  Journal: FileText,
  Conference: Mic,
  Book: BookOpen,
  Patent: Award,
}

const typeColors: Record<string, string> = {
  Journal: '#2563EB',
  Conference: '#7C3AED',
  Book: '#14B8A6',
  Patent: '#F59E0B',
}

export default function Publications() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [sortBy, setSortBy] = useState('year')

  const statuses = ['All', 'Published', 'Submitted', 'Draft', 'Archived']
  const types = ['All', 'Journal', 'Conference', 'Book', 'Patent']

  const filtered = publications.filter(p =>
    (statusFilter === 'All' || p.status === statusFilter) &&
    (typeFilter === 'All' || p.type === typeFilter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) ||
     p.authors.toLowerCase().includes(search.toLowerCase()) ||
     p.journal.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search publications, authors, journals..."
            className="w-full bg-card border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm border border-border bg-card text-foreground rounded-xl px-3 py-2.5 outline-none"
          >
            <option value="year">Sort by Year</option>
            <option value="citations">Sort by Citations</option>
            <option value="title">Sort by Title</option>
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:block">Upload Paper</span>
          </button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {types.map(t => {
          const Icon = t !== 'All' ? typeIcons[t] : null
          const color = t !== 'All' ? typeColors[t] : '#64748B'
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`flex-shrink-0 flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all ${
                typeFilter === t ? 'text-white shadow-sm' : 'bg-card border border-border text-muted-foreground hover:bg-secondary/60'
              }`}
              style={typeFilter === t ? { backgroundColor: color } : {}}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {t}
            </button>
          )
        })}
      </div>

      {/* Status filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              statusFilter === s ? 'bg-foreground text-card' : 'bg-card border border-border text-muted-foreground hover:bg-secondary/60'
            }`}
          >
            {s}
          </button>
        ))}
        <span className="text-xs text-muted-foreground/70 self-center ml-2">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-6 py-3">Publication</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden md:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Journal/Venue</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Citations</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3 hidden sm:table-cell">Year</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(pub => {
                const sc = statusColors[pub.status]
                const TypeIcon = typeIcons[pub.type]
                const typeColor = typeColors[pub.type]
                return (
                  <tr key={pub.id} className="hover:bg-secondary/60 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {pub.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{pub.authors}</p>
                      {pub.doi && (
                        <p className="text-xs font-mono text-muted-foreground/70 mt-1">{pub.doi}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <TypeIcon className="w-3.5 h-3.5" style={{ color: typeColor }} />
                        <span className="text-xs font-medium" style={{ color: typeColor }}>{pub.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <p className="text-xs text-foreground/80">{pub.journal}</p>
                      {pub.impact && <p className="text-xs text-muted-foreground/70">IF: {pub.impact}</p>}
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm font-semibold text-foreground">{pub.citations > 0 ? pub.citations : '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="badge px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: sc.bg, color: sc.text }}>
                        {pub.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{pub.year}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">No publications found</p>
            <p className="text-xs text-muted-foreground/70">Adjust filters or upload a new paper</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Showing {filtered.length} of {publications.length} publications</p>
          <div className="flex items-center gap-2">
            <button className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-secondary/60 disabled:opacity-40">Previous</button>
            <button className="text-xs bg-primary text-primary-foreground rounded-lg px-3 py-1.5">1</button>
            <button className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-secondary/60">2</button>
            <button className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-secondary/60">Next</button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl shadow-2xl shadow-black/20 w-full max-w-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h2 className="text-lg font-bold text-foreground">Upload Paper</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                <Upload className="w-8 h-8 text-muted-foreground/40 group-hover:text-primary mx-auto mb-3 transition-colors" />
                <p className="text-sm font-medium text-foreground/80">Drop PDF or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">Supports PDF, DOCX, LaTeX</p>
              </div>

              {[
                { label: 'Title', placeholder: 'Paper title...', type: 'text' },
                { label: 'Authors', placeholder: 'Author 1, Author 2...', type: 'text' },
                { label: 'DOI', placeholder: '10.xxxx/xxxxx', type: 'text' },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">{field.label}</label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">Type</label>
                  <select className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary">
                    {['Journal', 'Conference', 'Book', 'Patent'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground/80 mb-1.5 block">Status</label>
                  <select className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary">
                    {['Draft', 'Submitted', 'Published', 'Archived'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-5 border-t border-border bg-secondary/40">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-border bg-card text-foreground/80 rounded-xl py-2.5 text-sm font-medium hover:bg-secondary/60 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
                Upload Publication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
