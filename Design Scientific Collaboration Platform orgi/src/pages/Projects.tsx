import { useState } from 'react'
import { FolderOpen, Users, Calendar, TrendingUp, Plus, ChevronRight, Clock, Target, X } from 'lucide-react'

const projects = [
  {
    id: 1, name: 'Quantum Biology Initiative',
    desc: 'Exploring quantum mechanical effects in biological systems using advanced spectroscopy.',
    lead: 'Dr. Sarah Chen', institution: 'MIT',
    members: ['SC', 'JP', 'RW', 'TL'],
    progress: 72, status: 'On Track', color: '#2563EB',
    start: 'Jan 2023', end: 'Dec 2025', budget: '$4.2M',
    milestones: [
      { label: 'Initial spectroscopy study', done: true },
      { label: 'Quantum coherence model', done: true },
      { label: 'In-vitro experiments', done: false },
      { label: 'Publication — Nature', done: false },
    ],
    tags: ['Quantum', 'Biology', 'Spectroscopy'],
  },
  {
    id: 2, name: 'Arctic Climate Modeling Framework',
    desc: 'Building high-resolution climate models to predict Arctic ecosystem changes over 50 years.',
    lead: 'Prof. Hans Müller', institution: 'ETH Zürich',
    members: ['HM', 'JO', 'MS', 'KJ'],
    progress: 45, status: 'At Risk', color: '#F59E0B',
    start: 'Mar 2023', end: 'Mar 2026', budget: '$6.8M',
    milestones: [
      { label: 'Data collection phase', done: true },
      { label: 'Baseline model v1', done: true },
      { label: 'High-res simulation', done: false },
      { label: 'Policy report delivery', done: false },
    ],
    tags: ['Climate', 'ML', 'Arctic'],
  },
  {
    id: 3, name: 'Neuromorphic AI Systems',
    desc: 'Designing brain-inspired computing architectures for energy-efficient AI at the edge.',
    lead: 'Dr. Yuki Tanaka', institution: 'Caltech',
    members: ['YT', 'DC', 'SP'],
    progress: 89, status: 'Ahead', color: '#10B981',
    start: 'Jun 2022', end: 'Jun 2025', budget: '$3.1M',
    milestones: [
      { label: 'Architecture design', done: true },
      { label: 'Prototype chip fab', done: true },
      { label: 'Benchmark suite', done: true },
      { label: 'Final paper submission', done: false },
    ],
    tags: ['Neuromorphic', 'AI', 'VLSI'],
  },
  {
    id: 4, name: 'CRISPR Therapeutic Pipeline',
    desc: 'Developing next-generation CRISPR-Cas12 tools for targeted gene therapy in rare diseases.',
    lead: 'Dr. Priya Sharma', institution: 'NIH',
    members: ['PS', 'LG', 'BK'],
    progress: 33, status: 'On Track', color: '#7C3AED',
    start: 'Sep 2024', end: 'Sep 2027', budget: '$9.4M',
    milestones: [
      { label: 'Target identification', done: true },
      { label: 'In-vitro validation', done: false },
      { label: 'Animal studies', done: false },
      { label: 'IND filing', done: false },
    ],
    tags: ['CRISPR', 'Gene Therapy', 'Rare Disease'],
  },
]

const statusConfig: Record<string, { bg: string; text: string }> = {
  'On Track': { bg: '#ECFDF5', text: '#10B981' },
  'At Risk': { bg: '#FFFBEB', text: '#D97706' },
  Ahead: { bg: '#EFF6FF', text: '#2563EB' },
  Delayed: { bg: '#FEF2F2', text: '#EF4444' },
}

const emptyForm = { name: '', desc: '', lead: '', institution: '', start: '', end: '', budget: '', tags: '' }

export default function Projects() {
  const [selected, setSelected] = useState<typeof projects[0] | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [allProjects, setAllProjects] = useState(projects)

  const handleSubmit = () => {
    if (!form.name.trim()) return
    const newProject = {
      id: Date.now(),
      name: form.name,
      desc: form.desc || 'No description provided.',
      lead: form.lead || 'Unknown',
      institution: form.institution || '—',
      members: [form.lead ? form.lead.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'NA'],
      progress: 0,
      status: 'On Track' as const,
      color: '#2563EB',
      start: form.start || '—',
      end: form.end || '—',
      budget: form.budget || '—',
      milestones: [],
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }
    setAllProjects(prev => [newProject, ...prev])
    setForm(emptyForm)
    setModalOpen(false)
  }

  return (
    <div className="flex-1 overflow-hidden flex bg-background">
      <div className={`flex flex-col ${selected ? 'hidden lg:flex lg:w-96' : 'flex-1'} overflow-y-auto p-5`}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground font-medium">{allProjects.length} active projects</p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-3 py-2 text-xs font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </button>
        </div>
        <div className="space-y-3">
          {allProjects.map(project => {
            const sc = statusConfig[project.status]
            return (
              <div
                key={project.id}
                onClick={() => setSelected(selected?.id === project.id ? null : project)}
                className={`bg-card rounded-2xl border p-5 cursor-pointer card-hover transition-all ${
                  selected?.id === project.id ? 'border-primary/30 bg-primary/5' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: project.color + '15' }}>
                      <FolderOpen className="w-4 h-4" style={{ color: project.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
                      <p className="text-xs text-muted-foreground">{project.lead} · {project.institution}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2" style={{ backgroundColor: sc.bg, color: sc.text }}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{project.desc}</p>

                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.color }} />
                  </div>
                  <span className="text-xs font-bold text-foreground/80 ml-1">{project.progress}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {project.members.slice(0, 3).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold border border-card" style={{ backgroundColor: project.color, marginLeft: i > 0 ? -6 : 0 }}>
                        {m[0]}
                      </div>
                    ))}
                    {project.members.length > 3 && <span className="text-xs text-muted-foreground/70">+{project.members.length - 3}</span>}
                  </div>
                  <div className="flex gap-1.5">
                    {project.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: project.color + '12', color: project.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-6 bg-background border-l border-border">
          <button onClick={() => setSelected(null)} className="lg:hidden text-sm text-primary font-medium mb-4">← Back</button>

          <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
            <div className="h-2" style={{ backgroundColor: selected.color }} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selected.lead} · {selected.institution}</p>
                </div>
                <span className="text-sm font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: statusConfig[selected.status].bg, color: statusConfig[selected.status].text }}>
                  {selected.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{selected.desc}</p>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground/80">Overall Progress</span>
                  <span className="text-sm font-bold" style={{ color: selected.color }}>{selected.progress}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${selected.progress}%`, backgroundColor: selected.color }} />
                </div>
              </div>

              {/* Key info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" />Timeline</p>
                  <p className="text-xs font-semibold text-foreground">{selected.start} – {selected.end}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1 flex items-center gap-1"><Target className="w-3 h-3" />Budget</p>
                  <p className="text-xs font-semibold text-foreground">{selected.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1 flex items-center gap-1"><Users className="w-3 h-3" />Team</p>
                  <p className="text-xs font-semibold text-foreground">{selected.members.length} researchers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Project Milestones</h3>
            <div className="space-y-3">
              {selected.milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${m.done ? '' : 'border-2 border-border'}`} style={m.done ? { backgroundColor: selected.color } : {}}>
                    {m.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <p className={`text-sm ${m.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">Select a project to view details</p>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">New Project</h3>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary/60 text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Project Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Quantum Biology Initiative" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
                <textarea rows={2} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} placeholder="Brief description of the project..." className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Principal Investigator</label>
                  <input value={form.lead} onChange={e => setForm(f => ({ ...f, lead: e.target.value }))} placeholder="Dr. Name" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Institution</label>
                  <input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} placeholder="MIT, Stanford…" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Start Date</label>
                  <input type="month" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">End Date</label>
                  <input type="month" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Budget</label>
                  <input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="$2.5M" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="AI, Climate, Biology" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 transition" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary/60 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={!form.name.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
