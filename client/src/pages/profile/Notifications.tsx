import { useState, type ReactNode } from 'react'
import { useNotifications } from '../../context/NotificationsContext'

type NotifType = 'citation' | 'collaboration' | 'system' | 'review'

const typeConfig: Record<NotifType, { label: string; icon: ReactNode; color: string; bg: string }> = {
  citation: {
    label: 'Citation',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2.5 3h9M2.5 7h9M2.5 11h5" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  collaboration: {
    label: 'Collaboration',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="4.5" cy="4" r="2" stroke="#7C3AED" strokeWidth="1.3"/>
        <circle cx="9.5" cy="4" r="2" stroke="#7C3AED" strokeWidth="1.3"/>
        <path d="M1 11c0-1.93 1.57-3.5 3.5-3.5M13 11c0-1.93-1.57-3.5-3.5-3.5M7 7.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z" stroke="#7C3AED" strokeWidth="1.3"/>
      </svg>
    ),
  },
  system: {
    label: 'System',
    color: 'text-[#64748B]',
    bg: 'bg-[#F1F5F9]',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="#64748B" strokeWidth="1.3"/>
        <path d="M7 4.5v3l2 1" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  review: {
    label: 'Review',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M4 7l2.5 2.5L10 4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="7" cy="7" r="5.5" stroke="#059669" strokeWidth="1.3"/>
      </svg>
    ),
  },
}

type Tab = 'all' | 'unread' | 'citation' | 'collaboration' | 'system'

export default function Notifications() {
  const { notifs, unreadCount, markRead, markAllRead } = useNotifications()
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const filtered = notifs.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.read
    return n.type === activeTab
  })

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
    { id: 'citation', label: 'Citations' },
    { id: 'collaboration', label: 'Collaborations' },
    { id: 'system', label: 'System' },
  ]

  return (
    <div className="p-8 max-w-[720px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Notifications</span>
        </span>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl text-[#0F172A]">Notifications</h1>
            <p className="text-[#64748B] mt-1">Stay up to date with your research activity</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#64748B] hover:border-[#0052FF]/40 hover:text-[#0052FF] transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit mb-5 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-3 text-2xl">🔔</div>
            <p className="text-sm font-medium text-[#64748B]">No notifications here</p>
            <p className="text-xs text-[#94A3B8] mt-1">Check back later for updates</p>
          </div>
        ) : (
          filtered.map(n => {
            const cfg = typeConfig[n.type as NotifType] ?? typeConfig.system
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                  n.read ? 'bg-white border-[#E2E8F0]' : 'bg-blue-50/30 border-blue-100 hover:border-[#0052FF]/20'
                }`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${n.read ? 'text-[#0F172A]' : 'text-[#0052FF]'}`}>{n.title}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-mono text-[10px] text-[#94A3B8] whitespace-nowrap">{n.time}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full gradient-bg flex-shrink-0"></span>}
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{n.body}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
