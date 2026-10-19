import { useState } from 'react'
import { Search, Filter, Plus, Mail, ExternalLink, Star, Users, FileText, Quote, X } from 'lucide-react'

const researchers = [
  {
    id: 1, name: 'Dr. Sarah Chen', initials: 'SC', color: '#2563EB',
    role: 'Professor', dept: 'Computer Science', institution: 'MIT',
    interests: ['Quantum Computing', 'ML', 'Drug Discovery'],
    hIndex: 42, publications: 187, collaborators: 34, citations: 8921,
    email: 'sarah.chen@mit.edu', orcid: '0000-0001-2345-6789',
  },
  {
    id: 2, name: 'Prof. James Okafor', initials: 'JO', color: '#7C3AED',
    role: 'Associate Professor', dept: 'Physics', institution: 'Cambridge',
    interests: ['Particle Physics', 'Dark Matter', 'Cosmology'],
    hIndex: 38, publications: 143, collaborators: 28, citations: 6742,
    email: 'j.okafor@cam.ac.uk', orcid: '0000-0002-3456-7890',
  },
  {
    id: 3, name: 'Dr. Priya Sharma', initials: 'PS', color: '#14B8A6',
    role: 'Research Director', dept: 'Biochemistry', institution: 'NIH',
    interests: ['CRISPR', 'Gene Therapy', 'Proteomics'],
    hIndex: 55, publications: 231, collaborators: 52, citations: 14320,
    email: 'p.sharma@nih.gov', orcid: '0000-0003-4567-8901',
  },
  {
    id: 4, name: 'Prof. Hans Müller', initials: 'HM', color: '#F59E0B',
    role: 'Professor', dept: 'Climate Science', institution: 'ETH Zürich',
    interests: ['Climate Modeling', 'Arctic Systems', 'Carbon Capture'],
    hIndex: 47, publications: 198, collaborators: 41, citations: 11203,
    email: 'h.muller@ethz.ch', orcid: '0000-0004-5678-9012',
  },
  {
    id: 5, name: 'Dr. Yuki Tanaka', initials: 'YT', color: '#EC4899',
    role: 'Assistant Professor', dept: 'Electrical Engineering', institution: 'Caltech',
    interests: ['Neuromorphic Computing', 'AI Hardware', 'VLSI'],
    hIndex: 29, publications: 94, collaborators: 18, citations: 3847,
    email: 'y.tanaka@caltech.edu', orcid: '0000-0005-6789-0123',
  },
  {
    id: 6, name: 'Dr. Lena García', initials: 'LG', color: '#10B981',
    role: 'Senior Researcher', dept: 'Molecular Biology', institution: 'Stanford',
    interests: ['Epigenetics', 'Cell Biology', 'Cancer Research'],
    hIndex: 36, publications: 156, collaborators: 29, citations: 7821,
    email: 'l.garcia@stanford.edu', orcid: '0000-0006-7890-1234',
  },
]

const emptyForm = { name: '', role: '', dept: '', institution: '', email: '', orcid: '', interests: '' }
const colors = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#EC4899', '#10B981']

export default function Researchers() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof researchers[0] | null>(null)
  const [filter, setFilter] = useState('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [allResearchers, setAllResearchers] = useState(researchers)

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const color = colors[allResearchers.length % colors.length]
    const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const newResearcher = {
      id: Date.now(),
      name: form.name,
      initials,
      color,
      role: form.role || 'Researcher',
      dept: form.dept || '—',
      institution: form.institution || '—',
      interests: form.interests ? form.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
      hIndex: 0,
      publications: 0,
      collaborators: 0,
      citations: 0,
      email: form.email || '—',
      orcid: form.orcid || '—',
    }
    setAllResearchers(prev => [newResearcher, ...prev])
    setForm(emptyForm)
    setModalOpen(false)
  }

  const filters = ['All', 'MIT', 'Stanford', 'Cambridge', 'NIH', 'Caltech', 'ETH Zürich']
  const filtered = allResearchers.filter(r =>
    (filter === 'All' || r.institution === filter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) ||
     r.institution.toLowerCase().includes(search.toLowerCase()) ||
     r.interests.some(i => i.toLowerCase().includes(search.toLowerCase())))
  )

  return (
    <div className="flex-1 overflow-hidden flex bg-background">
      {/* List */}
      <div className={`flex flex-col ${selected ? 'hidden lg:flex lg:w-96' : 'flex-1'} bg-card border-r border-border`}>
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search researchers..."
                className="w-full bg-background border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary/60 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">Add</span>
            </button>
          </div>
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Researcher cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map(r => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              className={`rounded-2xl border p-4 cursor-pointer transition-all card-hover ${
                selected?.id === r.id ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: r.color }}>
                  {r.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.role} · {r.institution}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {r.interests.slice(0, 2).map(i => (
                      <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">{i}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{r.hIndex}</p>
                  <p className="text-xs text-muted-foreground/70">h-index</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{r.publications}</p>
                  <p className="text-xs text-muted-foreground/70">Papers</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{r.collaborators}</p>
                  <p className="text-xs text-muted-foreground/70">Co-authors</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">No researchers found</p>
              <p className="text-xs text-muted-foreground/70">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          <button onClick={() => setSelected(null)} className="lg:hidden text-sm text-primary font-medium mb-4 flex items-center gap-1">
            ← Back
          </button>
          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
            {/* Cover */}
            <div className="h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500" />
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-8 mb-4">
                <div className="w-16 h-16 rounded-2xl border-4 border-card flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: selected.color }}>
                  {selected.initials}
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 border border-border text-foreground/80 rounded-xl px-3 py-2 text-xs font-medium hover:bg-secondary/60 transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Message
                  </button>
                  <button className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-3 py-2 text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Users className="w-3.5 h-3.5" /> Collaborate
                  </button>
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selected.role} · {selected.dept}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs text-muted-foreground">{selected.institution}</span>
                <a href="#" className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <ExternalLink className="w-3 h-3" /> ORCID
                </a>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'h-index', value: selected.hIndex, icon: Star, color: '#F59E0B' },
              { label: 'Publications', value: selected.publications, icon: FileText, color: '#2563EB' },
              { label: 'Citations', value: selected.citations.toLocaleString(), icon: Quote, color: '#7C3AED' },
              { label: 'Co-authors', value: selected.collaborators, icon: Users, color: '#14B8A6' },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-2xl border border-border p-4 text-center">
                <div className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                  <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Research interests */}
          <div className="bg-card rounded-2xl border border-border p-5 mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Research Interests</h3>
            <div className="flex flex-wrap gap-2">
              {selected.interests.map(i => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  {i}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Contact & Identifiers</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Email</span>
                <span className="text-xs font-medium text-foreground/80">{selected.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">ORCID</span>
                <span className="text-xs font-mono text-foreground/80">{selected.orcid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Institution</span>
                <span className="text-xs font-medium text-foreground/80">{selected.institution}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">Select a researcher to view their profile</p>
          </div>
        </div>
      )}

      {/* Add Researcher Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Add Researcher</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary/60 text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. Jane Smith" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Role / Title</label>
                  <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Professor" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Department</label>
                  <input value={form.dept} onChange={e => setForm(f => ({ ...f, dept: e.target.value }))} placeholder="Computer Science" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Institution</label>
                <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="MIT, Stanford, Cambridge…" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@university.edu" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">ORCID</label>
                  <input value={form.orcid} onChange={e => setForm(f => ({ ...f, orcid: e.target.value }))} placeholder="0000-0000-0000-0000" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Research Interests (comma-separated)</label>
                <input value={form.interests} onChange={e => setForm(f => ({ ...f, interests: e.target.value }))} placeholder="Quantum Computing, ML, Drug Discovery" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary/60 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={!form.name.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Add Researcher</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
