import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import ExportButtons from '@/components/shared/ExportButtons'
import Pagination from '@/components/shared/Pagination'

type Tab = 'Researchers' | 'Publications' | 'Projects' | 'Financial'

const TABS: Tab[] = ['Researchers', 'Publications', 'Projects', 'Financial']

export default function Reports() {
  const { researchers, publications, projects, departments } = useAppContext()

  const [tab, setTab] = useState<Tab>('Researchers')
  const [search, setSearch] = useState('')
  const [startYear, setStartYear] = useState('')
  const [endYear, setEndYear] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  const filterByYear = (year: number) => {
    const sy = startYear ? parseInt(startYear) : 0
    const ey = endYear ? parseInt(endYear) : 9999
    return year >= sy && year <= ey
  }

  const filteredResearchers = useMemo(() => {
    let list = [...researchers]
    if (search) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [researchers, search])

  const filteredPublications = useMemo(() => {
    let list = [...publications]
    if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.journal.toLowerCase().includes(search.toLowerCase()))
    list = list.filter(p => filterByYear(p.year))
    return list
  }, [publications, search, startYear, endYear])

  const filteredProjects = useMemo(() => {
    let list = [...projects]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.lead.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [projects, search])

  const resExport = filteredResearchers.map(r => ({ Name: r.name, Department: r.dept, Role: r.role, 'h-Index': r.hIndex, Publications: r.publications, Citations: r.citations, Status: r.status }))
  const pubExport = filteredPublications.map(p => ({ Title: p.title, Journal: p.journal, Year: p.year, Type: p.type, Status: p.status, Citations: p.citations }))
  const projExport = filteredProjects.map(p => ({ Name: p.name, Lead: p.lead, Institution: p.institution, Status: p.status, Progress: `${p.progress}%`, Budget: `$${p.budget.toLocaleString()}` }))
  const finExport = departments.map(d => ({ Department: d.name, Head: d.head, Budget: `$${d.budget.toLocaleString()}`, Projects: d.projects, Researchers: d.researchers, Publications: d.publications }))

  const handleTabChange = (t: Tab) => { setTab(t); setSearch(''); setPage(1) }

  const fmt = (n: number) => `$${n.toLocaleString()}`

  // Paginated helpers
  const paginatedRes = filteredResearchers.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const paginatedPub = filteredPublications.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const paginatedProj = filteredProjects.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const currentTotal = tab === 'Researchers' ? filteredResearchers.length
    : tab === 'Publications' ? filteredPublications.length
    : tab === 'Projects' ? filteredProjects.length
    : departments.length

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Export and review institution-wide data</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => handleTabChange(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder={`Search ${tab.toLowerCase()}…`} className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
        </div>
        {(tab === 'Publications') && (
          <>
            <input type="number" placeholder="From year" value={startYear} onChange={e => setStartYear(e.target.value)} className="w-28 px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
            <input type="number" placeholder="To year" value={endYear} onChange={e => setEndYear(e.target.value)} className="w-28 px-3 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40" />
          </>
        )}
        <ExportButtons
          data={tab === 'Researchers' ? resExport : tab === 'Publications' ? pubExport : tab === 'Projects' ? projExport : finExport}
          columns={tab === 'Researchers' ? ['Name', 'Department', 'Role', 'h-Index', 'Publications', 'Citations', 'Status']
            : tab === 'Publications' ? ['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations']
            : tab === 'Projects' ? ['Name', 'Lead', 'Institution', 'Status', 'Progress', 'Budget']
            : ['Department', 'Head', 'Budget', 'Projects', 'Researchers', 'Publications']}
          filename={`report-${tab.toLowerCase()}`}
          title={`${tab} Report`}
        />
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'Researchers' && (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>{['Name', 'Department', 'Role', 'h-Index', 'Publications', 'Citations', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginatedRes.map(r => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: r.color }}>{r.initials}</div>
                        <div>
                          <p className="font-medium text-foreground">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.dept}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.role}</td>
                    <td className="px-4 py-3 text-center text-foreground">{r.hIndex}</td>
                    <td className="px-4 py-3 text-center text-foreground">{r.publications}</td>
                    <td className="px-4 py-3 text-center text-foreground">{r.citations}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>{r.status}</span></td>
                  </tr>
                ))}
                {paginatedRes.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No data.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'Publications' && (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>{['Title', 'Journal', 'Year', 'Type', 'Status', 'Citations'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginatedPub.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 max-w-xs font-medium text-foreground">{p.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.journal}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.year}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{p.type}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'Published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : p.status === 'Submitted' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : p.status === 'Under Review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-center text-foreground">{p.citations}</td>
                  </tr>
                ))}
                {paginatedPub.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No data.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'Projects' && (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>{['Name', 'Lead', 'Institution', 'Status', 'Progress', 'Budget'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {paginatedProj.map(p => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.lead}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.institution}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'On Track' || p.status === 'Ahead' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : p.status === 'At Risk' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.progress}%</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(p.budget)}</td>
                  </tr>
                ))}
                {paginatedProj.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No data.</td></tr>}
              </tbody>
            </table>
          )}

          {tab === 'Financial' && (
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr>{['Department', 'Head', 'Researchers', 'Projects', 'Publications', 'Budget'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium text-foreground">{d.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.head}</td>
                    <td className="px-4 py-3 text-center text-foreground">{d.researchers}</td>
                    <td className="px-4 py-3 text-center text-foreground">{d.projects}</td>
                    <td className="px-4 py-3 text-center text-foreground">{d.publications}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(d.budget)}</td>
                  </tr>
                ))}
                {departments.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No data.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {tab !== 'Financial' && <Pagination total={currentTotal} page={page} perPage={PER_PAGE} onChange={setPage} />}
    </div>
  )
}
