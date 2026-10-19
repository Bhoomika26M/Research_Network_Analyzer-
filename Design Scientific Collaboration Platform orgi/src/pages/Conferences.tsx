import { useState } from 'react'
import { Calendar, MapPin, Clock, Users, ChevronRight, ExternalLink, CheckCircle2, AlertCircle, Circle } from 'lucide-react'

const conferences = [
  {
    id: 1, name: 'NeurIPS 2024', full: 'Neural Information Processing Systems',
    location: 'Vancouver, Canada', dates: 'Dec 9–15, 2024',
    deadline: 'Nov 15, 2024', daysLeft: 3, attendees: 12000,
    status: 'deadline-soon', color: '#7C3AED', tags: ['ML', 'AI', 'Deep Learning'],
    submissions: 2, accepted: 1, presenting: true
  },
  {
    id: 2, name: 'ICML 2025', full: 'International Conference on Machine Learning',
    location: 'Vienna, Austria', dates: 'Jul 13–19, 2025',
    deadline: 'Jan 26, 2025', daysLeft: 45, attendees: 8500,
    status: 'open', color: '#2563EB', tags: ['ML', 'Theory', 'Optimization'],
    submissions: 1, accepted: 0, presenting: false
  },
  {
    id: 3, name: 'ICLR 2025', full: 'International Conference on Learning Representations',
    location: 'Singapore', dates: 'Apr 24–28, 2025',
    deadline: 'Oct 7, 2024', daysLeft: 120, attendees: 6000,
    status: 'open', color: '#14B8A6', tags: ['Representation Learning', 'Deep Learning'],
    submissions: 0, accepted: 0, presenting: false
  },
  {
    id: 4, name: 'Nature Symposium 2024', full: 'Nature Research Symposium',
    location: 'London, UK', dates: 'Nov 20–22, 2024',
    deadline: 'Sep 30, 2024', daysLeft: -5, attendees: 800,
    status: 'closed', color: '#EC4899', tags: ['Biology', 'Chemistry', 'Physics'],
    submissions: 1, accepted: 1, presenting: true
  },
  {
    id: 5, name: 'ACL 2025', full: 'Association for Computational Linguistics',
    location: 'Tokyo, Japan', dates: 'Jul 27 – Aug 1, 2025',
    deadline: 'Feb 15, 2025', daysLeft: 65, attendees: 5000,
    status: 'open', color: '#F59E0B', tags: ['NLP', 'Linguistics', 'LLMs'],
    submissions: 0, accepted: 0, presenting: false
  },
]

const calendarDays = [
  { day: 1, events: [] },
  { day: 2, events: [] },
  { day: 3, events: [] },
  { day: 4, events: [] },
  { day: 5, events: [] },
  { day: 6, events: [] },
  { day: 7, events: [] },
  { day: 8, events: [] },
  { day: 9, events: [{ name: 'NeurIPS', color: '#7C3AED' }] },
  { day: 10, events: [{ name: 'NeurIPS', color: '#7C3AED' }] },
  { day: 11, events: [{ name: 'NeurIPS', color: '#7C3AED' }] },
  { day: 12, events: [{ name: 'NeurIPS', color: '#7C3AED' }] },
  { day: 13, events: [{ name: 'NeurIPS', color: '#7C3AED' }] },
  { day: 14, events: [] },
  { day: 15, events: [{ name: 'Deadline', color: '#EF4444' }] },
  ...Array.from({ length: 16 }, (_, i) => ({ day: i + 16, events: [] })),
]

export default function Conferences() {
  const [view, setView] = useState<'cards' | 'calendar'>('cards')
  const [selected, setSelected] = useState<typeof conferences[0] | null>(null)

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    'deadline-soon': { label: 'Deadline Soon', color: '#EF4444', bg: '#FEF2F2' },
    open: { label: 'Open', color: '#10B981', bg: '#ECFDF5' },
    closed: { label: 'Closed', color: '#94A3B8', bg: '#F8FAFC' },
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      {/* View toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {(['cards', 'calendar'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                view === v ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v === 'cards' ? 'Conference Cards' : 'Calendar View'}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
          <Calendar className="w-4 h-4" />
          Register for Event
        </button>
      </div>

      {view === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {conferences.map(conf => {
            const s = statusLabel[conf.status]
            return (
              <div
                key={conf.id}
                onClick={() => setSelected(selected?.id === conf.id ? null : conf)}
                className={`bg-card rounded-2xl border overflow-hidden cursor-pointer card-hover transition-all ${
                  selected?.id === conf.id ? 'border-primary/30 shadow-md shadow-primary/10' : 'border-border'
                }`}
              >
                {/* Top accent */}
                <div className="h-1.5" style={{ backgroundColor: conf.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{conf.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{conf.full}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ml-2" style={{ backgroundColor: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {conf.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" /> {conf.dates}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" /> {conf.attendees.toLocaleString()} expected attendees
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {conf.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: conf.color + '12', color: conf.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{conf.submissions}</p>
                        <p className="text-xs text-muted-foreground/70">Submitted</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-foreground">{conf.accepted}</p>
                        <p className="text-xs text-muted-foreground/70">Accepted</p>
                      </div>
                    </div>
                    {conf.presenting && (
                      <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Presenting
                      </span>
                    )}
                    {conf.daysLeft > 0 && conf.daysLeft <= 7 && (
                      <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {conf.daysLeft}d left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'calendar' && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">December 2024</h3>
            <div className="flex items-center gap-2">
              <button className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-secondary/60">Previous</button>
              <button className="text-xs border border-border rounded-lg px-3 py-1.5 text-muted-foreground hover:bg-secondary/60">Next</button>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground/70 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ day, events }) => (
                <div
                  key={day}
                  className={`min-h-16 p-2 rounded-xl border transition-colors cursor-pointer ${
                    day === 9 || day === 15 ? 'border-purple-500/30 bg-purple-500/10' :
                    events.length > 0 ? 'border-border bg-secondary/40' :
                    'border-transparent hover:bg-secondary/60'
                  }`}
                >
                  <p className={`text-xs font-semibold mb-1 ${day === 9 || day === 15 ? 'text-purple-400' : 'text-muted-foreground'}`}>{day}</p>
                  {events.map((e, i) => (
                    <div key={i} className="text-xs font-medium truncate px-1 py-0.5 rounded" style={{ backgroundColor: e.color + '20', color: e.color }}>
                      {e.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-purple-500/30" />
              <span className="text-xs text-muted-foreground">Conference</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500/30" />
              <span className="text-xs text-muted-foreground">Deadline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
