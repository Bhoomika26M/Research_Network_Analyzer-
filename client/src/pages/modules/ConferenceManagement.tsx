import { useState } from 'react'
import type { Conference, Publication } from '../../types/index'
import { useConferences, useCreateConference, useUpdateConference, useDeleteConference } from '../../services/conferences'
import { usePublications } from '../../services/publications'
import Drawer from '../../layout/Drawer'
import FormModal, { inputCls } from '../../components/Modals/FormModal'
import EmptyState from '../../components/EmptyState'
import { useToast } from '../../context/ToastContext'

const upcoming = [
  { title: 'NeurIPS 2024 Presentation Rehearsal', date: 'Dec 5, 2024', time: '14:00 GMT', type: 'Preparation' },
  { title: 'ICLR 2025 Paper Review Deadline', date: 'Jan 15, 2025', time: '23:59 AoE', type: 'Deadline' },
  { title: 'ACM KDD 2025 Paper Submission', date: 'Feb 10, 2025', time: '23:59 AoE', type: 'Deadline' },
  { title: 'NeurIPS 2024 — Main Conference', date: 'Dec 10, 2024', time: '09:00 PST', type: 'Event' },
]

const typeColors: Record<string, string> = {
  Preparation: 'bg-violet-50 text-violet-700',
  Deadline: 'bg-red-50 text-red-700',
  Event: 'bg-emerald-50 text-emerald-700',
}

const confTypeColors: Record<string, string> = {
  International: 'gradient-bg text-white',
  Workshop: 'bg-violet-50 text-violet-700',
  Symposium: 'bg-amber-50 text-amber-700',
}

function CalendarView({ confs, onSelect }: { confs: Conference[]; onSelect: (c: Conference) => void }) {
  const [cursor, setCursor] = useState(() => new Date())
  const todayStr = new Date().toDateString()

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Map conferences onto every day they span within the visible month
  const confByDay: Record<number, Conference[]> = {}
  for (const c of confs) {
    if (!c.startDate) continue
    const start = new Date(c.startDate + 'T00:00:00')
    const end = c.endDate ? new Date(c.endDate + 'T00:00:00') : start
    
    let current = new Date(start)
    while (current <= end) {
      if (current.getFullYear() === year && current.getMonth() === month) {
        const day = current.getDate()
        ;(confByDay[day] = confByDay[day] || []).push(c)
      }
      current.setDate(current.getDate() + 1)
    }
  }

  const monthLabel = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-[#0F172A]">{monthLabel}</h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF] transition-all cursor-pointer"
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            onClick={() => setCursor(new Date())}
            className="px-3 h-8 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF] transition-all cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-lg border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF] transition-all cursor-pointer"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {weekdayLabels.map(w => (
          <div key={w} className="text-center text-[10px] font-mono uppercase tracking-[0.15em] text-[#64748B] py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="min-h-[84px] rounded-xl bg-[#FAFAFA]" />
          }
          const dayConfs = confByDay[day] || []
          const isToday = new Date(year, month, day).toDateString() === todayStr
          return (
            <div
              key={day}
              className={`min-h-[84px] rounded-xl border p-1.5 flex flex-col gap-1 ${
                isToday ? 'border-[#0052FF]/40 bg-blue-50/50' : 'border-[#F1F5F9] bg-white hover:border-[#E2E8F0]'
              }`}
            >
              <span
                className={`text-[11px] font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'gradient-bg text-white' : 'text-[#64748B]'
                }`}
              >
                {day}
              </span>
              {dayConfs.slice(0, 2).map(c => (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className="text-left text-[10px] leading-tight px-1.5 py-1 rounded-md bg-blue-50 text-[#0052FF] hover:bg-blue-100 transition-colors cursor-pointer truncate"
                  title={`${c.name} — ${c.startDate} to ${c.endDate}`}
                >
                  {c.shortName}
                </button>
              ))}
              {dayConfs.length > 2 && (
                <span className="text-[10px] text-[#64748B] px-1">+{dayConfs.length - 2} more</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ConferenceDrawerContent({ conf, pubs, onRegister }: { conf: Conference; pubs: Publication[]; onRegister: () => void }) {
  const presenterPubs = pubs.filter(p => (conf.presentations || []).includes(p.id))

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
    catch { return d }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${confTypeColors[conf.type] || 'bg-[#F1F5F9] text-[#64748B]'}`}>{conf.type}</span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F5F9] text-[#64748B]">{conf.shortName}</span>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Conference</p>
        <h3 className="font-display text-xl text-[#0F172A] leading-snug">{conf.name}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#F1F5F9]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Location</p>
          <p className="text-sm font-medium text-[#0F172A]">{conf.location}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Dates</p>
          <p className="text-sm font-medium text-[#0F172A]">{formatDate(conf.startDate)} – {formatDate(conf.endDate)}</p>
        </div>
        <div className="col-span-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-1">Website</p>
          <a
            href={conf.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0052FF] hover:underline break-all"
          >
            {conf.website}
          </a>
        </div>
      </div>

      {presenterPubs.length > 0 && (
        <div className="pt-4 border-t border-[#F1F5F9]">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] mb-3">Presentations</p>
          <div className="space-y-2">
            {presenterPubs.map(pub => (
              <div key={pub.id} className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E2E8F0]">
                <p className="text-sm font-medium text-[#0F172A] leading-snug">{pub.title}</p>
                <p className="text-xs text-[#64748B] mt-0.5">{Array.isArray(pub.authors) ? pub.authors.join(', ') : pub.authors} · {pub.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[#F1F5F9]">
        <button
          onClick={onRegister}
          className="w-full py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
        >
          Register
        </button>
      </div>
    </div>
  )
}

interface NewConf {
  name: string
  shortName: string
  location: string
  startDate: string
  endDate: string
  type: string
  website: string
}

export default function ConferenceManagement() {
  const { showToast } = useToast()
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null)
  
  // Live Query from PostgreSQL database
  const { data: localConfs = [], isLoading } = useConferences()
  const { data: pubs = [] } = usePublications()
  const createConfMutation = useCreateConference()
  const updateConfMutation = useUpdateConference()
  const deleteConfMutation = useDeleteConference()

  const [modalOpen, setModalOpen] = useState(false)
  const [newC, setNewC] = useState<NewConf>({
    name: '', shortName: '', location: '', startDate: '', endDate: '', type: 'International', website: '',
  })

  // Edit / delete state
  const [editingConf, setEditingConf] = useState<Conference | null>(null)
  const [editForm, setEditForm] = useState<NewConf>({
    name: '', shortName: '', location: '', startDate: '', endDate: '', type: 'International', website: '',
  })

  const handleAddConf = () => {
    if (!newC.name.trim()) {
      showToast('Conference name is required', 'error')
      return
    }
    
    // Payload sent to backend database (no manual client-side ID)
    const payload = {
      name: newC.name,
      shortName: newC.shortName || newC.name.slice(0, 10),
      location: newC.location || 'Online',
      startDate: newC.startDate || new Date().toISOString().split('T')[0],
      endDate: newC.endDate || new Date().toISOString().split('T')[0],
      type: newC.type as Conference['type'],
      website: newC.website || '#',
      presentations: [],
    }

    createConfMutation.mutate(payload, {
      onSuccess: () => {
        showToast(`Conference "${payload.shortName}" saved to database!`, 'success')
        setModalOpen(false)
        setNewC({ name: '', shortName: '', location: '', startDate: '', endDate: '', type: 'International', website: '' })
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || 'Failed to save conference to database', 'error')
      }
    })
  }

  const openEditConf = (conf: Conference) => {
    setEditingConf(conf)
    setEditForm({
      name: conf.name,
      shortName: conf.shortName,
      location: conf.location,
      startDate: conf.startDate,
      endDate: conf.endDate,
      type: conf.type,
      website: conf.website,
    })
  }

  const handleUpdateConf = () => {
    if (!editingConf) return
    if (!editForm.name.trim()) {
      showToast('Conference name is required', 'error')
      return
    }
    updateConfMutation.mutate(
      {
        id: editingConf.id,
        data: {
          name: editForm.name,
          shortName: editForm.shortName || editForm.name.slice(0, 10),
          location: editForm.location || 'Online',
          startDate: editForm.startDate || editingConf.startDate,
          endDate: editForm.endDate || editingConf.endDate,
          type: editForm.type as Conference['type'],
          website: editForm.website || '#',
        },
      },
      {
        onSuccess: () => {
          showToast('Conference updated', 'success')
          setEditingConf(null)
        },
        onError: (err: any) => {
          showToast(err.response?.data?.detail || 'Failed to update conference', 'error')
        },
      }
    )
  }

  const handleDeleteConf = (conf: Conference) => {
    if (!window.confirm(`Delete conference "${conf.shortName}"? This cannot be undone.`)) return
    deleteConfMutation.mutate(conf.id, {
      onSuccess: () => {
        showToast('Conference deleted', 'success')
        if (selectedConf?.id === conf.id) setSelectedConf(null)
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || 'Failed to delete conference', 'error')
      },
    })
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">05 — Conference Mgmt</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Conferences</h1>
            <p className="text-[#64748B] mt-1">Registrations and participation history directly from PostgreSQL database</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl">
              {(['list', 'calendar'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all cursor-pointer ${view === v ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]'}`}>
                  {v}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer"
            >
              + Add Conference
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main list / calendar */}
        <div className="col-span-2 space-y-4">
          {view === 'calendar' ? (
            <CalendarView confs={localConfs} onSelect={(c) => setSelectedConf(c)} />
          ) : (
          <>
          {isLoading && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 text-center text-sm text-[#64748B]">
              Loading conferences from database...
            </div>
          )}
          {!isLoading && localConfs.length === 0 && (
            <EmptyState icon="🏛️" title="No conferences found" subtitle="Click '+ Add Conference' to add one to the PostgreSQL database" />
          )}
          {!isLoading && localConfs.map((conf) => (
            <div
              key={conf.id}
              onClick={() => setSelectedConf(conf)}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${confTypeColors[conf.type] || 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    {conf.type}
                  </span>
                  <h3 className="font-display text-lg text-[#0F172A] mt-2 leading-snug">{conf.name}</h3>
                </div>
                <span className="font-mono text-xs text-[#0052FF] bg-blue-50 px-2.5 py-1 rounded-lg font-medium">
                  {conf.shortName}
                </span>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#64748B] pt-3 border-t border-[#F1F5F9]">
                <span className="flex items-center gap-1">📍 {conf.location}</span>
                <span className="flex items-center gap-1">📅 {conf.startDate} – {conf.endDate}</span>
                <span className="ml-auto text-[#0052FF] font-medium">
                  {(conf.presentations || []).length} Presentations
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditConf(conf) }}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0052FF] transition-all cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteConf(conf) }}
                    className="px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          </>
          )}
        </div>

        {/* Sidebar deadlines */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
            <h3 className="font-display text-sm text-[#0F172A] mb-3 flex items-center justify-between">
              <span>Upcoming Deadlines</span>
              <span className="w-2 h-2 rounded-full gradient-bg"></span>
            </h3>
            <div className="space-y-3">
              {upcoming.map((u, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FAFAFA] border border-[#F1F5F9]">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[u.type]}`}>{u.type}</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{u.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#0F172A] leading-tight mb-1">{u.title}</p>
                  <p className="text-[10px] text-[#64748B]">📅 {u.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={selectedConf !== null}
        onClose={() => setSelectedConf(null)}
        title="Conference Detail"
      >
        {selectedConf && (
          <ConferenceDrawerContent
            conf={selectedConf}
            pubs={pubs}
            onRegister={() => {
              showToast(`Registered for ${selectedConf.shortName}!`, 'success')
              setSelectedConf(null)
            }}
          />
        )}
      </Drawer>

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Conference"
        label="Conference Mgmt"
        onSubmit={handleAddConf}
        submitLabel={createConfMutation.isPending ? "Saving..." : "Add Conference"}
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="e.g. Neural Information Processing Systems"
            value={newC.name}
            onChange={e => setNewC({ ...newC, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Short Name</label>
            <input
              className={inputCls}
              placeholder="NeurIPS 2024"
              value={newC.shortName}
              onChange={e => setNewC({ ...newC, shortName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Type</label>
            <select
              className={inputCls}
              value={newC.type}
              onChange={e => setNewC({ ...newC, type: e.target.value })}
            >
              {['International', 'Workshop', 'Symposium'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Location</label>
          <input
            className={inputCls}
            placeholder="Vancouver, Canada"
            value={newC.location}
            onChange={e => setNewC({ ...newC, location: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Start Date</label>
            <input
              className={inputCls}
              type="date"
              value={newC.startDate}
              onChange={e => setNewC({ ...newC, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">End Date</label>
            <input
              className={inputCls}
              type="date"
              value={newC.endDate}
              onChange={e => setNewC({ ...newC, endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Website</label>
          <input
            className={inputCls}
            placeholder="https://neurips.cc"
            value={newC.website}
            onChange={e => setNewC({ ...newC, website: e.target.value })}
          />
        </div>
      </FormModal>

      <FormModal
        open={editingConf !== null}
        onClose={() => setEditingConf(null)}
        title="Edit Conference"
        label="Conference Mgmt"
        onSubmit={handleUpdateConf}
        submitLabel={updateConfMutation.isPending ? "Saving..." : "Save Changes"}
      >
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Full Name <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Short Name</label>
            <input
              className={inputCls}
              value={editForm.shortName}
              onChange={e => setEditForm({ ...editForm, shortName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Type</label>
            <select
              className={inputCls}
              value={editForm.type}
              onChange={e => setEditForm({ ...editForm, type: e.target.value })}
            >
              {['International', 'Workshop', 'Symposium'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Location</label>
          <input
            className={inputCls}
            value={editForm.location}
            onChange={e => setEditForm({ ...editForm, location: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Start Date</label>
            <input
              className={inputCls}
              type="date"
              value={editForm.startDate}
              onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">End Date</label>
            <input
              className={inputCls}
              type="date"
              value={editForm.endDate}
              onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748B] mb-1.5">Website</label>
          <input
            className={inputCls}
            value={editForm.website}
            onChange={e => setEditForm({ ...editForm, website: e.target.value })}
          />
        </div>
      </FormModal>
    </div>
  )
}
