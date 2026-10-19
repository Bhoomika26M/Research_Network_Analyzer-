import { useState } from 'react'
import { Search, Bell, ChevronDown, X, CheckCircle2, Info, AlertTriangle, Sun, Moon, ShieldCheck } from 'lucide-react'

const notifications = [
  { id: 1, type: 'success', icon: CheckCircle2, color: '#10B981', title: 'Paper accepted', desc: 'Your submission to Nature Reviews was accepted.', time: '2m ago' },
  { id: 2, type: 'info', icon: Info, color: '#2563EB', title: 'New collaborator', desc: 'Prof. Hans Weber wants to collaborate on Quantum ML.', time: '1h ago' },
  { id: 3, type: 'info', icon: Info, color: '#7C3AED', title: 'Conference deadline', desc: 'NeurIPS 2024 abstract deadline in 3 days.', time: '3h ago' },
  { id: 4, type: 'warning', icon: AlertTriangle, color: '#F59E0B', title: 'Citation alert', desc: 'Your paper was cited 12 new times this week.', time: '1d ago' },
]

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your research network' },
  researchers: { title: 'Researchers', subtitle: 'Manage academic profiles and collaborators' },
  roles: { title: 'Roles', subtitle: 'Manage permissions and access levels' },
  publications: { title: 'Publications', subtitle: 'Repository of research papers and articles' },
  collaborations: { title: 'Collaborations', subtitle: 'Network connections and partnerships' },
  institutions: { title: 'Institutions', subtitle: 'University and laboratory management' },
  projects: { title: 'Research Projects', subtitle: 'Active projects and milestones' },
  conferences: { title: 'Conferences', subtitle: 'Events, submissions, and presentations' },
  citations: { title: 'Citations', subtitle: 'Citation metrics and reference management' },
  reports: { title: 'Reports & Analytics', subtitle: 'Insights and exportable data reports' },
  settings: { title: 'Settings', subtitle: 'Account, preferences, and system configuration' },
  admin: { title: 'Admin Panel', subtitle: 'User management and system administration' },
}

interface TopNavProps {
  currentPage: string
  onNavigate: (page: string) => void
  darkMode?: boolean
  onToggleDark?: () => void
}

export default function TopNav({ currentPage, onNavigate, darkMode, onToggleDark }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)

  const page = pageTitles[currentPage] || pageTitles.dashboard

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{page.title}</h1>
        <p className="text-xs text-muted-foreground truncate hidden sm:block">{page.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative">
        {searchOpen ? (
          <div className="flex items-center bg-secondary border border-border rounded-xl px-3 py-2 gap-2 w-64">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Search researchers, papers..."
              className="text-sm bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
            />
            <button onClick={() => { setSearchOpen(false); setSearchValue('') }}>
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:block">Search...</span>
            <kbd className="hidden md:block text-xs bg-card border border-border rounded px-1.5 font-mono text-muted-foreground/70">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Roles button */}
      <button
        onClick={() => onNavigate('roles')}
        className="flex items-center gap-2 bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="hidden md:block">Roles</span>
      </button>

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary transition-colors"
      >
        {darkMode
          ? <Sun className="w-4 h-4 text-amber-400" />
          : <Moon className="w-4 h-4 text-muted-foreground" />
        }
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (!notifOpen) setUnreadCount(0) }}
          className="relative w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-card rounded-2xl border border-border shadow-xl shadow-black/10 dark:shadow-black/30 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <button className="text-xs text-primary font-medium">Mark all read</button>
            </div>
            <div className="divide-y divide-border">
              {notifications.map(n => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/60 cursor-pointer">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: n.color + '15' }}>
                    <n.icon className="w-4 h-4" style={{ color: n.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.desc}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border">
              <button className="text-xs text-primary font-medium w-full text-center">View all notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false) }}
          className="flex items-center gap-2 hover:bg-secondary/60 rounded-xl px-2 py-1.5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            SC
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground/70 hidden sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 w-56 bg-card rounded-2xl border border-border shadow-xl shadow-black/10 dark:shadow-black/30 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Dr. Sarah Chen</p>
              <p className="text-xs text-muted-foreground">sarah.chen@mit.edu</p>
            </div>
            <div className="py-1">
              {[
                { label: 'My Profile', action: () => onNavigate('researchers') },
                { label: 'Settings', action: () => onNavigate('settings') },
                { label: 'Admin Panel', action: () => onNavigate('admin') },
              ].map(item => (
                <button key={item.label} onClick={() => { item.action(); setProfileOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-foreground/80 hover:bg-secondary/60 transition-colors">
                  {item.label}
                </button>
              ))}
            </div>
            <div className="border-t border-border py-1">
              <button onClick={() => onNavigate('landing')} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
