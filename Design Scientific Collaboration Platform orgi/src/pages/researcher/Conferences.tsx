import { useState, useMemo } from 'react'
import { MapPin, Calendar, Users } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import Pagination from '@/components/shared/Pagination'

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Upcoming: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

export default function Conferences() {
  const { conferences, publications, updateConference, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 9

  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitConf, setSubmitConf] = useState<string>('')
  const [selectedPub, setSelectedPub] = useState('')

  const filtered = useMemo(() => {
    let list = [...conferences]
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()))
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter)
    return list
  }, [conferences, search, statusFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleRegister = (id: string, name: string, current: number) => {
    updateConference(id, { attendees: current + 1 })
    showToast(`Registered for ${name}`)
  }

  const handleSubmit = () => {
    if (!selectedPub) { showToast('Please select a publication', 'error'); return }
    showToast(`Paper submitted to ${submitConf}`)
    setSubmitOpen(false)
    setSelectedPub('')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conferences</h1>
        <p className="text-muted-foreground text-sm">{conferences.length} conferences</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search conferences..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="All">All Statuses</option>
          <option>Open</option>
          <option>Closed</option>
          <option>Upcoming</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginated.map(conf => (
          <div key={conf.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-sm leading-snug">{conf.name}</h3>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[conf.status] ?? ''}`}>{conf.status}</span>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><MapPin size={12} /><span>{conf.location}</span></div>
              <div className="flex items-center gap-1.5"><Calendar size={12} /><span>{conf.date}</span></div>
              <div className="flex items-center gap-1.5"><Users size={12} /><span>{conf.attendees.toLocaleString()} attendees</span></div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Submission deadline: <span className="text-foreground font-medium">{conf.deadline}</span></p>
              <p className="text-xs text-muted-foreground">{conf.submissions.toLocaleString()} submissions</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {conf.topics.slice(0, 3).map(t => (
                <span key={t} className="px-2 py-0.5 bg-secondary text-foreground rounded-full text-xs">{t}</span>
              ))}
              {conf.topics.length > 3 && <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs">+{conf.topics.length - 3}</span>}
            </div>
            <div className="flex gap-2 mt-auto pt-1">
              <button
                onClick={() => handleRegister(conf.id, conf.name, conf.attendees)}
                className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Register
              </button>
              <button
                onClick={() => { setSubmitConf(conf.name); setSelectedPub(''); setSubmitOpen(true) }}
                className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors"
              >
                Submit Paper
              </button>
            </div>
          </div>
        ))}
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      {/* Submit Paper Modal */}
      <Modal open={submitOpen} title={`Submit Paper to ${submitConf}`} onClose={() => setSubmitOpen(false)} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Select Publication</label>
            <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={selectedPub} onChange={e => setSelectedPub(e.target.value)}>
              <option value="">— Select a publication —</option>
              {publications.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setSubmitOpen(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
