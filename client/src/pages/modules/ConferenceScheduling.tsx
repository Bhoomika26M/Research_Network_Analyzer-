import { useState } from 'react'

const MONTH_DAYS = 31 // December 2024; starts on Sunday (offset 0 on Mon-start = offset 6)
const START_OFFSET = 6 // Dec 1 2024 is a Sunday; Mon-start grid offset = 6

type DayEvent = {
  id: number
  day: number
  time: string
  session: string
  location: string
  presenter: string
  type: 'Keynote' | 'Presentation' | 'Workshop' | 'Panel'
}

const allEvents: DayEvent[] = [
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
  Presentation: 'bg-blue-50 text-blue-700',
  Workshop: 'bg-violet-50 text-violet-700',
  Panel: 'bg-amber-50 text-amber-700',
}

const typeDots: Record<string, string> = {
  Keynote: 'bg-[#0052FF]',
  Presentation: 'bg-blue-400',
  Workshop: 'bg-violet-400',
  Panel: 'bg-amber-400',
}

export default function ConferenceScheduling() {
  const [selectedDay, setSelectedDay] = useState<number>(10)
  const [showAddModal, setShowAddModal] = useState(false)

  const dayEvents = allEvents.filter(e => e.day === selectedDay)
  const daysWithEvents = new Set(allEvents.map(e => e.day))

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">05 — Conference Mgmt / Scheduling</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Conference Scheduling</h1>
        <p className="text-[#64748B] mt-1">Browse and manage your conference calendar and session schedule</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Calendar — left */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg text-[#0F172A]">December 2024</h2>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-xl bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors text-[#64748B] font-medium">‹</button>
              <button className="w-8 h-8 rounded-xl bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors text-[#64748B] font-medium">›</button>
            </div>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-[#64748B] font-mono uppercase pb-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }, (_, i) => {
              const day = i - START_OFFSET + 1
              const valid = day >= 1 && day <= MONTH_DAYS
              const hasEvent = valid && daysWithEvents.has(day)
              const isSelected = valid && day === selectedDay
              const isToday = day === 5

              return (
                <button
                  key={i}
                  disabled={!valid}
                  onClick={() => valid && setSelectedDay(day)}
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-all ${
                    !valid ? 'invisible' :
                    isSelected ? 'gradient-bg text-white font-semibold shadow-sm' :
                    isToday ? 'ring-2 ring-[#0052FF] text-[#0052FF] font-semibold' :
                    'hover:bg-[#F1F5F9] text-[#64748B] cursor-pointer'
                  }`}
                >
                  {valid && day}
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0052FF] opacity-70"></span>
                  )}
                  {hasEvent && isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white opacity-80"></span>
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
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Event
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {dayEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-3 text-xl">📅</div>
                <p className="text-sm font-medium text-[#64748B]">No events on this day</p>
                <p className="text-xs text-[#94A3B8] mt-1">Click "Add Event" to schedule something</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#F1F5F9] hover:shadow-sm hover:border-[#E2E8F0] transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[evt.type]}`}>
                        {evt.type}
                      </span>
                      <span className="font-mono text-xs text-[#64748B]">{evt.time}</span>
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
              <h2 className="font-display text-xl text-[#0F172A]">Add Event</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Session Title</label>
                <input className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors" placeholder="e.g. Oral Presentation: Graph Learning" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Date</label>
                  <input type="date" defaultValue={`2024-12-${String(selectedDay).padStart(2, '0')}`} className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Time</label>
                  <input type="time" className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Type</label>
                <select className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors">
                  <option>Keynote</option>
                  <option>Presentation</option>
                  <option>Workshop</option>
                  <option>Panel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Location</label>
                <input className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#0052FF] transition-colors" placeholder="Hall A, Room 203 / Virtual" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors">Cancel</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 transition-all">Add Event</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
