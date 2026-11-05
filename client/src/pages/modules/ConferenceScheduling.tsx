import { useMemo, useState } from 'react'
import type { Conference, SessionUser } from '../../types/index'
import { useConferences, useCreateConference, useDeleteConference } from '../../services/conferences'
import { usePublications } from '../../services/publications'
import { hasPermission } from '../../permissions/config'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const typeColors: Record<string, string> = {
  International: 'gradient-bg text-white',
  Workshop: 'bg-violet-50 text-violet-700',
  Symposium: 'bg-amber-50 text-amber-700',
}

const typeDots: Record<string, string> = {
  International: 'bg-primary',
  Workshop: 'bg-violet-400',
  Symposium: 'bg-amber-400',
}

const toDateKey = (d: Date) => {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

const parseDate = (value: string) => new Date(`${value}T00:00:00`)

export default function ConferenceScheduling({ user }: { user?: SessionUser } = {}) {
  const { showToast } = useToast()
  const canManage = hasPermission(user, 'conferences.manage')
  const { data: confs = [], isLoading } = useConferences()
  const { data: pubs = [] } = usePublications()
  const createConfMutation = useCreateConference()
  const deleteConfMutation = useDeleteConference()

  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))
  const [modalOpen, setModalOpen] = useState(false)

  const ownPubIds = user?.publications_ids ?? []
  const schedulablePubs = user?.role === 'researcher'
    ? pubs.filter(p => ownPubIds.includes(p.id))
    : pubs

  const [sessionTitle, setSessionTitle] = useState('')
  const [shortName, setShortName] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [confType, setConfType] = useState<Conference['type']>('International')
  const [presentationId, setPresentationId] = useState('')

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const confsByDay = useMemo(() => {
    const map: Record<string, Conference[]> = {}
    for (const conf of confs) {
      if (!conf.startDate) continue
      const start = parseDate(conf.startDate)
      const end = conf.endDate ? parseDate(conf.endDate) : start
      const current = new Date(start)
      let guard = 0
      while (current <= end && guard < 90) {
        const key = toDateKey(current)
        map[key] = [...(map[key] || []), conf]
        current.setDate(current.getDate() + 1)
        guard += 1
      }
    }
    return map
  }, [confs])

  const dayEvents = confsByDay[selectedDate] || []
  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const clearForm = () => {
    setSessionTitle('')
    setShortName('')
    setLocation('')
    setWebsite('')
    setConfType('International')
    setPresentationId('')
  }

  const handleAddEvent = () => {
    if (!sessionTitle.trim()) {
      showToast('Session title is required', 'error')
      return
    }
    const payload = {
      name: sessionTitle,
      shortName: shortName || sessionTitle.slice(0, 12),
      location: location || 'Online',
      startDate: selectedDate,
      endDate: selectedDate,
      type: confType,
      website: website || '#',
      presentations: presentationId ? [Number(presentationId)] : [],
    }
    createConfMutation.mutate(payload, {
      onSuccess: (conf) => {
        showToast(`Event "${conf.shortName}" scheduled for ${selectedDate}`, 'success')
        setModalOpen(false)
        clearForm()
      },
      onError: (err: any) => {
        showToast(err?.response?.data?.detail || 'Failed to schedule the event', 'error')
      },
    })
  }

  const handleDeleteEvent = (conf: Conference) => {
    if (!window.confirm(`Remove "${conf.shortName}" from the schedule?`)) return
    deleteConfMutation.mutate(conf.id, {
      onSuccess: () => showToast('Event removed', 'success'),
      onError: (err: any) => {
        showToast(err?.response?.data?.detail || 'Failed to remove the event', 'error')
      },
    })
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">05 — Conference Mgmt / Scheduling</span>
        </span>
        <h1 className="font-display font-bold text-3xl text-foreground">Conference Scheduling</h1>
        <p className="text-muted-foreground mt-1">Browse and manage your conference calendar and session schedule</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Calendar — left */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-lg text-foreground">{monthLabel}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-[#E2E8F0] transition-colors text-muted-foreground font-medium"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                onClick={() => setCursor(new Date())}
                className="px-3 h-8 rounded-xl bg-secondary text-xs font-medium text-muted-foreground hover:bg-[#E2E8F0] transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center hover:bg-[#E2E8F0] transition-colors text-muted-foreground font-medium"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {weekdayLabels.map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground font-mono uppercase pb-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="aspect-square" />
              }
              const key = toDateKey(new Date(year, month, day))
              const hasEvent = (confsByDay[key] || []).length > 0
              const isSelected = key === selectedDate
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm transition-all ${
                    isSelected
                      ? 'gradient-bg text-white font-semibold shadow-xs'
                      : 'hover:bg-secondary text-muted-foreground cursor-pointer'
                  }`}
                >
                  {day}
                  {hasEvent && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-card opacity-80' : 'bg-primary opacity-70'}`} />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-3">
            {Object.entries(typeDots).map(([type, dot]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dot}`}></span>
                <span className="text-xs text-muted-foreground">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Events list — right */}
        <div className="bg-card rounded-2xl border border-border flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
                Selected Day
              </span>
              <h3 className="font-display font-bold text-lg text-foreground">
                {parseDate(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled</p>
            </div>
            {canManage && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Add Event
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading the schedule...</div>
            ) : dayEvents.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No events on this day"
                subtitle={canManage ? 'Click "Add Event" to schedule one' : 'Your role cannot schedule events'}
              />
            ) : (
              <div className="space-y-3">
                {dayEvents.map((evt) => {
                  const presentationTitles = (evt.presentations || [])
                    .map(id => pubs.find(p => p.id === id)?.title)
                    .filter(Boolean) as string[]
                  return (
                    <div key={evt.id} className="p-4 rounded-2xl bg-background border border-border/60 hover:shadow-xs hover:border-border transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[evt.type] || 'bg-secondary text-muted-foreground'}`}>
                          {evt.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{evt.startDate}</span>
                          {canManage && (
                            <button
                              onClick={() => handleDeleteEvent(evt)}
                              className="text-[10px] text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground leading-snug mb-2">{evt.name}</h4>
                      <p className="text-xs text-muted-foreground">📍 {evt.location} · {evt.shortName}</p>
                      {presentationTitles.length > 0 && (
                        <ul className="mt-2 space-y-0.5">
                          {presentationTitles.map(t => (
                            <li key={t} className="text-xs text-muted-foreground truncate">🎤 {t}</li>
                          ))}
                        </ul>
                      )}
                      {presentationTitles.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/80 mt-1">No presentation linked</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Event"
        label="Conference Scheduling"
        onSubmit={handleAddEvent}
        submitLabel={createConfMutation.isPending ? 'Scheduling...' : 'Add Event'}
      >
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Session Title <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="e.g. Oral: Graph Learning for Science"
            value={sessionTitle}
            onChange={e => setSessionTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Short Name</label>
            <input className={inputCls} placeholder="NeurIPS 2024" value={shortName} onChange={e => setShortName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Type</label>
            <select className={inputCls} value={confType} onChange={e => setConfType(e.target.value as Conference['type'])}>
              {['International', 'Workshop', 'Symposium'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Date</label>
            <input className={inputCls} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Location</label>
            <input className={inputCls} placeholder="Hall A / Virtual" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Website</label>
          <input className={inputCls} placeholder="https://neurips.cc" value={website} onChange={e => setWebsite(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Presentation</label>
          <select className={inputCls} value={presentationId} onChange={e => setPresentationId(e.target.value)}>
            <option value="">Select publication...</option>
            {schedulablePubs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <p className="text-[10px] text-muted-foreground/80 mt-1">
            Researchers and institutions can only schedule their own (or their institution's) publications.
          </p>
        </div>
      </FormModal>
    </div>
  )
}
