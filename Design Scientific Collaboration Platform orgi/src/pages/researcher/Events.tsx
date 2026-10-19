import { useState, useMemo } from 'react'
import { MapPin, Users, CheckCircle } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'
import Modal from '@/components/shared/Modal'
import Pagination from '@/components/shared/Pagination'
import type { Event } from '@/data/mockData'

const TYPE_BADGE: Record<string, string> = {
  Workshop: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Seminar: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Conference: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Webinar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
}

const TYPE_DATE_COLOR: Record<string, string> = {
  Workshop: 'bg-violet-600',
  Seminar: 'bg-teal-600',
  Conference: 'bg-blue-600',
  Webinar: 'bg-amber-500',
}

export default function Events() {
  const { events, updateEvent, showToast } = useAppContext()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [page, setPage] = useState(1)
  const PER_PAGE = 6
  const [viewTarget, setViewTarget] = useState<Event | null>(null)

  const filtered = useMemo(() => {
    let list = [...events]
    if (search) list = list.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter !== 'All') list = list.filter(e => e.type === typeFilter)
    return list
  }, [events, search, typeFilter])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const handleRegister = (ev: Event) => {
    updateEvent(ev.id, { attendees: ev.attendees + 1, registered: true })
    showToast(`Registered for ${ev.title}`)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return { day: d.getDate(), month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear() }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground text-sm">{events.length} upcoming events</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground w-64" placeholder="Search events..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        <select className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
          <option value="All">All Types</option>
          <option>Workshop</option>
          <option>Seminar</option>
          <option>Conference</option>
          <option>Webinar</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {paginated.map(ev => {
          const { day, month, year } = formatDate(ev.date)
          return (
            <div key={ev.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
              <div className={`${TYPE_DATE_COLOR[ev.type] ?? 'bg-primary'} text-white px-5 py-4 flex items-center gap-4`}>
                <div className="text-center">
                  <p className="text-3xl font-bold leading-none">{day}</p>
                  <p className="text-sm uppercase tracking-wider mt-0.5">{month}</p>
                  <p className="text-xs opacity-80">{year}</p>
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[ev.type] ?? ''}`}>{ev.type}</span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1 gap-3">
                <h3 className="font-semibold text-foreground text-sm leading-snug">{ev.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={12} /><span className="truncate">{ev.location}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users size={12} />
                  <span>{ev.attendees}/{ev.maxAttendees} attendees</span>
                </div>
                <div className="flex gap-2 mt-auto pt-1">
                  {ev.registered ? (
                    <button disabled className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium cursor-default">
                      <CheckCircle size={13} /> Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(ev)}
                      disabled={ev.attendees >= ev.maxAttendees}
                      className="flex-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {ev.attendees >= ev.maxAttendees ? 'Full' : 'Register'}
                    </button>
                  )}
                  <button onClick={() => setViewTarget(ev)} className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-accent transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onChange={setPage} />

      {/* View Details Modal */}
      {viewTarget && (
        <Modal open={!!viewTarget} title="Event Details" onClose={() => setViewTarget(null)} size="md">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground text-base leading-snug">{viewTarget.title}</h3>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[viewTarget.type] ?? ''}`}>{viewTarget.type}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Date</p><p className="text-foreground mt-0.5">{viewTarget.date}</p></div>
              <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Location</p><p className="text-foreground mt-0.5">{viewTarget.location}</p></div>
              <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Attendees</p><p className="text-foreground mt-0.5">{viewTarget.attendees} / {viewTarget.maxAttendees}</p></div>
              <div><p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Status</p><p className="text-foreground mt-0.5">{viewTarget.registered ? 'Registered' : 'Not Registered'}</p></div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{viewTarget.description}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setViewTarget(null)} className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-accent transition-colors">Close</button>
              {!viewTarget.registered && (
                <button onClick={() => { handleRegister(viewTarget); setViewTarget(null) }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Register</button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
