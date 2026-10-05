import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import Pagination from '@/components/shared/Pagination'
import ExportButtons from '@/components/shared/ExportButtons'

type Tab = 'Publications' | 'Citations' | 'Collaborations' | 'Projects'

const TABS: Tab[] = ['Publications', 'Citations', 'Collaborations', 'Projects']

const STATUS_BADGE: Record<string, string> = {
  Published: 'bg-emerald-100 text-emerald-700',
  Draft: 'bg-amber-100 text-amber-700',
  Submitted: 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-blue-100 text-blue-700',
  Active: 'bg-emerald-100 text-emerald-700',
  Inactive: 'bg-gray-100 text-gray-700',
  'On Track': 'bg-emerald-100 text-emerald-700',
  Ahead: 'bg-blue-100 text-blue-700',
  'At Risk': 'bg-amber-100 text-amber-700',
  Delayed: 'bg-red-100 text-red-700',
}

export default function Reports() {
  const { publications, citations, researchers, projects } = useAppContext()
  const [tab, setTab] = useState<Tab>('Publications')
  const [searches, setSearches] = useState<Record<Tab, string>>({ Publications: '', Citations: '', Collaborations: '', Projects: '' })
  const [pages, setPages] = useState<Record<Tab, number>>({ Publications: 1, Citations: 1, Collaborations: 1, Projects: 1 })
  const PER_PAGE = 10

  const setSearch = (t: Tab, v: string) => { setSearches(s => ({ ...s, [t]: v })); setPages(p => ({ ...p, [t]: 1 })) }
  const setPage = (t: Tab, v: number) => setPages(p => ({ ...p, [t]: v }))

  const filteredPubs = useMemo(() => {
    const q = searches.Publications.toLowerCase()
    return publications.filter(p => !q || p.title.toLowerCase().includes(q) || p.journal.toLowerCase().includes(q))
  }, [publications, searches.Publications])

  const filteredCitations = useMemo(() => {
    const q = searches.Citations.toLowerCase()
    return citations.filter(c => !q || c.paperTitle.toLowerCase().includes(q) || c.citedBy.toLowerCase().includes(q))
  }, [citations, searches.Citations])

  const filteredResearchers = useMemo(() => {
    const q = searches.Collaborations.toLowerCase()
    return researchers.filter(r => !q || r.name.toLowerCase().includes(q) || r.institution.toLowerCase().includes(q))
  }, [researchers, searches.Collaborations])

  const filteredProjects = useMemo(() => {
    const q = searches.Projects.toLowerCase()
    return projects.filter(p => !q || p.name.toLowerCase().includes(q) || p.lead.toLowerCase().includes(q))
  }, [projects, searches.Projects])

  const pubExport = filteredPubs.map(p => ({ Title: p.title, Journal: p.journal, Year: p.year, Type: p.type, Status: p.status, Citations: p.citations }))
  const citExport = filteredCitations.map(c => ({ 'Paper Title': c.paperTitle, 'Cited By': c.citedBy, Journal: c.journal, Year: c.year, Count: c.count }))
  const collabExport = filteredResearchers.map(r => ({ Name: r.name, Institution: r.institution, Department: r.dept, 'h-Index': r.hIndex, Publications: r.publications, Citations: r.citations, Status: r.status }))
  const projExport = filteredProjects.map(p => ({ Name: p.name, Lead: p.lead, Institution: p.institution, Status: p.status, Progress: `${p.progress}%`, Budget: `$${p.budget.toLocaleString()}` }))

  const paginatePubs = filteredPubs.slice((pages.Publications - 1) * PER_PAGE, pages.Publications * PER_PAGE)
  const paginateCit = filteredCitations.slice((pages.Citations - 1) * PER_PAGE, pages.Citations * PER_PAGE)
  const paginateCollab = filteredResearchers.slice((pages.Collaborations - 1) * PER_PAGE, pages.Collaborations * PER_PAGE)
  const paginateProj = filteredProjects.slice((pages.Projects - 1) * PER_PAGE, pages.Projects * PER_PAGE)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm">Export and review all research data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Publications Tab */}
      {tab === 'Publications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search publications..." value={searches.Publications} onChange={e => setSearch('Publications', e.target.value)} />
            <ExportButtons data={pubExport} columns={['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations']} filename="publications-report" title="Publications Report" />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatePubs.map(p => (
                  <tr key={p.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium text-foreground max-w-[220px]"><span className="block truncate" title={p.title}>{p.title}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.journal}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.year}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] ?? ''}`}>{p.status}</span></td>
                    <td className="px-4 py-3 font-semibold text-foreground">{p.citations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-border">
              <Pagination total={filteredPubs.length} page={pages.Publications} perPage={PER_PAGE} onChange={v => setPage('Publications', v)} />
            </div>
          </div>
        </div>
      )}

      {/* Citations Tab */}
      {tab === 'Citations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search citations..." value={searches.Citations} onChange={e => setSearch('Citations', e.target.value)} />
            <ExportButtons data={citExport} columns={['Paper Title', 'Cited By', 'Journal', 'Year', 'Count']} filename="citations-report" title="Citations Report" />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Paper Title', 'Cited By', 'Journal', 'Year', 'Count'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginateCit.map(c => (
                  <tr key={c.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px]"><span className="block truncate" title={c.paperTitle}>{c.paperTitle}</span></td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px]"><span className="block truncate" title={c.citedBy}>{c.citedBy}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{c.journal}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.year}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-border">
              <Pagination total={filteredCitations.length} page={pages.Citations} perPage={PER_PAGE} onChange={v => setPage('Citations', v)} />
            </div>
          </div>
        </div>
      )}

      {/* Collaborations Tab */}
      {tab === 'Collaborations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search researchers..." value={searches.Collaborations} onChange={e => setSearch('Collaborations', e.target.value)} />
            <ExportButtons data={collabExport} columns={['Name', 'Institution', 'Department', 'h-Index', 'Publications', 'Citations', 'Status']} filename="collaborations-report" title="Collaborations Report" />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Name', 'Institution', 'Department', 'h-Index', 'Publications', 'Citations', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginateCollab.map(r => (
                  <tr key={r.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.institution}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.dept}</td>
                    <td className="px-4 py-3 text-foreground">{r.hIndex}</td>
                    <td className="px-4 py-3 text-foreground">{r.publications}</td>
                    <td className="px-4 py-3 text-foreground">{r.citations.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[r.status] ?? ''}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-border">
              <Pagination total={filteredResearchers.length} page={pages.Collaborations} perPage={PER_PAGE} onChange={v => setPage('Collaborations', v)} />
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {tab === 'Projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search projects..." value={searches.Projects} onChange={e => setSearch('Projects', e.target.value)} />
            <ExportButtons data={projExport} columns={['Name', 'Lead', 'Institution', 'Status', 'Progress', 'Budget']} filename="projects-report" title="Projects Report" />
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  {['Name', 'Lead', 'Institution', 'Status', 'Progress', 'Budget'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginateProj.map(p => (
                  <tr key={p.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px]"><span className="block truncate" title={p.name}>{p.name}</span></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.lead}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.institution}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] ?? ''}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-foreground">{p.progress}%</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">${p.budget.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-border">
              <Pagination total={filteredProjects.length} page={pages.Projects} perPage={PER_PAGE} onChange={v => setPage('Projects', v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
