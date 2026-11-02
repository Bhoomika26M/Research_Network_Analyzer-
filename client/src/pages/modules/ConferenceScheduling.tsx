import { useState, useMemo } from 'react'
import { useConferences } from '../../services/conferences'
import { useToast } from '../../context/ToastContext'

const MONTH_DAYS = 31 // December 2024; starts on Sunday
const START_OFFSET = 6 // Dec 1 2024 is a Sunday; Mon-start grid offset = 6

export type DayEvent = {
  id: number
  day: number
  time: string
  session: string
  location: string
  presenter: string
  type: 'Keynote' | 'Presentation' | 'Workshop' | 'Panel'
}

const initialSeedEvents: DayEvent[] = [
  { id: 1,  day: 5,  time: '10:00 GMT', session: 'AAAI Workshop: AI for Scientific Discovery', location: 'Virtual', presenter: 'Dr. Sarah Chen', type: 'Workshop' },
  { id: 2,  day: 10, time: '09:00 PST', session: 'NeurIPS 2024 Opening Keynote', location: 'Vancouver Convention Centre', presenter: 'Conference Organizers', type: 'Keynote' },
  { id: 3,  day: 10, time: '14:30 PST', session: 'Oral: Federated Graph Learning for Scientific Discovery', location: 'Hall A, Room 203', presenter: 'Dr. Sarah Chen', type: 'Presentation' },
  { id: 4,  day: 11, time: '11:00 PST', session: 'Workshop on Graph Neural Networks', location: 'Hall B, Room 105', presenter: 'Dr. Emma Torres', type: 'Workshop' },
  { id: 5,  day: 11, time: '16:00 PST', session: 'Poster Session: Privacy-Preserving ML', location: 'Main Hall Poster Area', presenter: 'Dr. Amir Khan', type: 'Presentation' },
  { id: 6,  day: 12, time: '10:00 PST', session: 'Invited Talk: Quantum-Classical Hybrid Methods', location: 'Plenary Hall', presenter: 'Dr. Sarah Chen', type: 'Keynote' },
  { id: 7,  day: 13, time: '13:00 PST', session: 'Panel: Future Directions in Scientific AI', location: 'Hall C', presenter: 'Multiple Presenters', type: 'Panel' },
  { id: 8,  day: 15, time: '09:00 PST', session: 'Social: NeurIPS Closing Dinner', location: 'Vancouver Marriott', presenter: '—', type: 'Workshop' },
  { id: 9,  day: 20, time: '15:00 GMT', session: 'ICLR 2025 Paper Review Kickoff', location: 'Virtual', presenter: 'PC Chair', type: 'Panel' },
]

const typeColors: Record<string, string> = {
  Keynote: 'gradient-bg text-white',
  Presentation: 'bg-blue-50 text-blue-700 border border-blue-200',
  Workshop: 'bg-violet-50 text-violet-700 border border-violet-200',
  Panel: 'bg-amber-50 text-amber-700 border border-amber-200',
}

const typeDots: Record<string, string> = {
  Keynote: 'bg-[#0052FF]',
  Presentation: 'bg-blue-400',
  Workshop: 'bg-violet-400',
  Panel: 'bg-amber-400',
}

const STORAGE_KEY = 'scicollab_conference_events'

export default function ConferenceScheduling() {
  const { showToast } = useToast()
  const { data: conferences = [] } = useConferences()

  const [selectedDay, setSelectedDay] = useState<number>(10)
  const [showAddModal, setShowAddModal] = useState(false)

  // Custom user-added events stored in state & localStorage
  const [customEvents, setCustomEvents] = useState<DayEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // fallback
    }
    return []
  })

  // New event form state
  const [formTitle, setFormTitle] = useState('')
  const [formDay, setFormDay] = useState(10)
  const [formTime, setFormTime] = useState('10:00 PST')
  const [formType, setFormType] = useState<DayEvent['type']>('Presentation')
  const [formLocation, setFormLocation] = useState('Hall A, Room 203')
  const [formPresenter, setFormPresenter] = useState('Dr. Sarah Chen')

  // Derive conference calendar events from live database conferences
  const conferenceDerivedEvents: DayEvent[] = useMemo(() => {
    const list: DayEvent[] = []
    conferences.forEach((c, idx) => {
      // Parse day from startDate e.g. "Dec 10, 2024" or "2024-12-10"
      let day = 10 + (idx * 3) % 20
      const match = c.startDate?.match(/\b(\d{1,2})\b/)
      if (match) {
        const parsed = parseInt(match[1])
        if (parsed >= 1 && parsed <= 31) day = parsed
      }
      list.push({
        id: 1000 + c.id,
        day,
        time: '09:30 PST',
        session: `${c.shortName || c.name}: Plenary Session`,
        location: c.location || 'Main Auditorium',
        presenter: 'Keynote Speaker',
        type: c.type === 'Workshop' ? 'Workshop' : c.type === 'Symposium' ? 'Panel' : 'Keynote',
      })
    })
    return list
  }, [conferences])

  // All combined live events
  const allEvents = useMemo(() => {
    const combined = [...initialSeedEvents, ...conferenceDerivedEvents, ...customEvents]
    // Deduplicate by session title & day
    const seen = new Set<string>()
    return combined.filter(e => {
      const key = `${e.day}-${e.session}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [conferenceDerivedEvents, customEvents])

  const dayEvents = allEvents.filter(e => e.day === selectedDay)
  const daysWithEvents = new Set(allEvents.map(e => e.day))

  const handleCreateEvent = () => {
    if (!formTitle.trim()) {
      showToast('Session title is required', 'error')
      return
    }
    const newEvt: DayEvent = {
      id: Date.now(),
      day: formDay,
      time: formTime || '10:00 PST',
      session: formTitle.trim(),
      location: formLocation.trim() || 'Auditorium',
      presenter: formPresenter.trim() || 'Session Presenter',
      type: formType,
    }
    const updated = [...customEvents, newEvt]
    setCustomEvents(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    setSelectedDay(formDay)
    setShowAddModal(false)
    setFormTitle('')
    showToast(`Session "${newEvt.session.slice(0, 30)}..." scheduled!`, 'success')
  }

  const handleDeleteCustomEvent = (id: number) => {
    const updated = customEvents.filter(e => e.id !== id)
    setCustomEvents(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
    showToast('Session removed from schedule', 'info')
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">05 — Conference Mgmt / Scheduling</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Conference Scheduling</h1>
        <p className="text-[#64748B] mt-1">Browse, inspect, and manage conference presentations, keynotes, and workshops</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Calendar grid — left */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Calendar
              </span>
              <h2 className="font-display text-lg text-[#0F172A]">December 2024</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {allEvents.length} Total Sessions
            </span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <span key={d} className="text-[10px] font-mono text-[#94A3B8] font-medium py-1">{d}</span>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: START_OFFSET }, (_, i) => (
              <div key={`offset-${i}`} className="h-10" />
            ))}

            {Array.from({ length: MONTH_DAYS }, (_, i) => {
              const day = i + 1
              const hasEvent = daysWithEvents.has(day)
              const isSelected = selectedDay === day
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-10 rounded-xl text-xs font-medium relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'gradient-bg text-white shadow-sm font-semibold'
                      : hasEvent
                      ? 'bg-blue-50 text-[#0052FF] font-semibold hover:bg-blue-100'
                      : 'hover:bg-[#F1F5F9] text-[#0F172A]'
                  }`}
                >
                  <span>{day}</span>
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#0052FF]"></span>
                  )}
                  {hasEvent && isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Event type legend */}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex flex-wrap gap-3">
            {Object.entries(typeDots).map(([type, dot]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dot}`}></span>
                <span className="text-xs text-[#64748B]">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events list — right */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] flex flex-col">
          <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Selected Day
              </span>
              <h3 className="font-display text-lg text-[#0F172A]">
                {selectedDay ? `December ${selectedDay}, 2024` : 'Select a day'}
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            <button
              onClick={() => {
                setFormDay(selectedDay)
                setShowAddModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Event
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-3 text-xl">📅</div>
                <p className="text-sm font-medium text-[#64748B]">No events scheduled on December {selectedDay}</p>
                <p className="text-xs text-[#94A3B8] mt-1">Click "Add Event" to schedule a conference presentation</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#F1F5F9] hover:shadow-sm hover:border-[#E2E8F0] transition-all group">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[evt.type]}`}>
                        {evt.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#64748B]">{evt.time}</span>
                        {customEvents.some(ce => ce.id === evt.id) && (
                          <button
                            onClick={() => handleDeleteCustomEvent(evt.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs transition-opacity cursor-pointer ml-1"
                            title="Remove session"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <h4 className="text-sm font-semibold text-[#0F172A] leading-snug mb-2">{evt.session}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <circle cx="5.5" cy="4.5" r="2" stroke="#94A3B8" strokeWidth="1.2"/>
                          <path d="M5.5 1C3.29 1 1.5 2.79 1.5 5S4 9.5 5.5 10.5C7 9.5 9.5 7.21 9.5 5S7.71 1 5.5 1z" stroke="#94A3B8" strokeWidth="1.2"/>
                        </svg>
                        <span className="text-xs text-[#64748B]">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <circle cx="5.5" cy="3.5" r="2" stroke="#94A3B8" strokeWidth="1.2"/>
                          <path d="M1.5 9.5c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-xs text-[#64748B]">{evt.presenter}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-[#0F172A]">Schedule Conference Session</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Session Title <span className="text-red-500">*</span></label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
                  placeholder="e.g. Oral Presentation: Quantum Algorithms"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Day (Dec 1-31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formDay}
                    onChange={e => setFormDay(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Time</label>
                  <input
                    value={formTime}
                    onChange={e => setFormTime(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
                    placeholder="10:00 PST"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
                  >
                    <option value="Keynote">Keynote</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Panel">Panel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Presenter</label>
                  <input
                    value={formPresenter}
                    onChange={e => setFormPresenter(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
                    placeholder="Speaker name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1.5">Location / Venue Room</label>
                <input
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
                  placeholder="e.g. Hall A, Room 203 / Virtual"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 shadow-sm transition-all cursor-pointer"
                >
                  Schedule Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
