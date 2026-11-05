import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react'
import { hasPermission, type Role } from '../permissions/config'
import { useResearchers } from '../services/researchers'
import { usePublications } from '../services/publications'
import { useNotifications } from '../context/NotificationsContext'
import type { SessionUser } from '../types/index'
import { ScientificLogoPill } from '../components/ScientificLogo'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: GridIcon, parent: null, system: false },
  { id: 'users', label: 'User Management', icon: UsersIcon, parent: null, system: false },
  { id: 'institutions', label: 'Institution Panel', icon: BuildingIcon, parent: 'users', system: false },
  { id: 'role-perms', label: 'Role Permissions', icon: ShieldIcon, parent: 'users', system: false },
  { id: 'researchers', label: 'Researchers', icon: PersonIcon, parent: null, system: false },
  { id: 'publications', label: 'Publications', icon: BookIcon, parent: null, system: false },
  { id: 'collaborations', label: 'Collaborations', icon: NetworkIcon, parent: null, system: false },
  { id: 'teams', label: 'Team Management', icon: UsersIcon, parent: 'collaborations', system: false },
  { id: 'assignments', label: 'Project Assignments', icon: FolderIcon, parent: 'collaborations', system: false },
  { id: 'conferences', label: 'Conferences', icon: CalendarIcon, parent: null, system: false },
  { id: 'scheduling', label: 'Scheduling', icon: CalendarIcon, parent: 'conferences', system: false },
  { id: 'citations', label: 'Citations', icon: QuoteIcon, parent: null, system: false },
  { id: 'doi', label: 'DOI Management', icon: BookIcon, parent: 'citations', system: false },
  { id: 'linking', label: 'Publication Linking', icon: NetworkIcon, parent: 'citations', system: false },
  { id: 'reports', label: 'Reports & Export', icon: ChartIcon, parent: null, system: false },
  { id: 'audit', label: 'Audit Log', icon: ShieldIcon, parent: null, system: false },
  { id: 'system-config', label: 'System Config', icon: GearNavIcon, parent: null, system: true },
  { id: 'security-settings', label: 'Security Settings', icon: ShieldIcon, parent: null, system: true },
]

interface ShellProps {
  children: ReactNode
  activePage: string
  onNavigate: (page: string) => void
  role: string
  userName: string
  userEmail?: string
  user?: SessionUser
  onLogout?: () => void
}

export default function Shell({ children, activePage, onNavigate, role, userName, userEmail, user, onLogout }: ShellProps) {
  const { unreadCount } = useNotifications()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'))
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Global search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Global search sources
  const { data: apiResearchers = [] } = useResearchers()
  const { data: apiPublications = [] } = usePublications()

  const searchResearchers = apiResearchers.filter((r) => {
    const q = searchQuery.toLowerCase()
    return (
      q.length > 0 &&
      (r.name.toLowerCase().includes(q) ||
        r.institution.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q))
    )
  }).slice(0, 5)

  const searchPubs = apiPublications.filter((p) => {
    const q = searchQuery.toLowerCase()
    return (
      q.length > 0 &&
      (p.title.toLowerCase().includes(q) || p.authors.some((a) => a.toLowerCase().includes(q)))
    )
  }).slice(0, 5)

  const hasResults = searchResearchers.length > 0 || searchPubs.length > 0

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('')
      setShowResults(false)
    }
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  // Pill badge background & text based on role matching screenshots
  const roleBadgeConfig: Record<string, { bg: string; text: string; label: string; avatarColor: string }> = {
    researcher: {
      bg: 'bg-blue-600',
      text: 'text-white',
      label: 'Researcher',
      avatarColor: 'bg-blue-600',
    },
    institution: {
      bg: 'bg-purple-600',
      text: 'text-white',
      label: 'Institution Admin',
      avatarColor: 'bg-purple-600',
    },
    reviewer: {
      bg: 'bg-teal-500',
      text: 'text-white',
      label: 'Reviewer',
      avatarColor: 'bg-teal-500',
    },
    admin: {
      bg: 'bg-amber-600',
      text: 'text-white',
      label: 'System Admin',
      avatarColor: 'bg-amber-600',
    },
  }

  const currentBadge = roleBadgeConfig[role] || {
    bg: 'bg-primary',
    text: 'text-white',
    label: role,
    avatarColor: 'bg-primary',
  }

  const activeParent = navItems.find((n) => n.id === activePage)?.parent
  const typedRole = role as Role

  const visibleNav = navItems.filter((n) => {
    if (n.system) return typedRole === 'admin'
    if (n.id === 'institutions' && !hasPermission(user, 'admin.manageInstitutions')) return false
    if (n.id === 'role-perms' && !hasPermission(user, 'admin.assignRoles')) return false
    if (n.id === 'audit' && !hasPermission(user, 'analytics.viewAuditLogs')) return false
    if (n.id === 'users' && !hasPermission(user, 'admin.manageUsers')) return false
    if (n.parent !== null) {
      return activePage === n.parent || activeParent === n.parent
    }
    return true
  })

  // User initials
  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SC'

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar matching Screenshots 2, 3, 4 */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 ${
          mobileMenuOpen ? 'translate-x-0 w-56' : '-translate-x-full md:translate-x-0'
        } ${sidebarCollapsed ? 'md:w-16' : 'md:w-56'}`}
      >
        {/* Brand Header with Scientific pill */}
        <div className="h-16 flex items-center px-3 border-b border-border flex-shrink-0">
          <ScientificLogoPill collapsed={sidebarCollapsed} />
        </div>

        {/* Role Pill Badge */}
        {!sidebarCollapsed && (
          <div className="px-3.5 py-2.5">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-xs ${currentBadge.bg} ${currentBadge.text}`}
            >
              {currentBadge.label}
            </span>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 py-1 overflow-y-auto px-2 space-y-0.5">
          {visibleNav.map((item) => {
            const active = activePage === item.id
            const isSub = item.parent !== null
            const Icon = item.icon

            // Highlight color based on active state: light lavender / cyan tint
            const activeBg =
              role === 'reviewer'
                ? 'bg-teal-50 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300 font-bold'
                : role === 'institution'
                ? 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 font-bold'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 font-bold'

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  setMobileMenuOpen(false)
                }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 rounded-xl text-xs transition-all ${
                  isSub ? 'px-3 py-2 ml-2' : 'px-3 py-2.5'
                } ${
                  active
                    ? `${activeBg} shadow-2xs`
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium'
                }`}
              >
                {isSub ? (
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      active ? 'bg-current' : 'bg-muted-foreground/40'
                    }`}
                  />
                ) : (
                  <Icon size={16} color="currentColor" />
                )}
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3 border-t border-border flex items-center justify-between">
          <div
            onClick={() => onNavigate('profile-me')}
            className={`flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer p-1 rounded-xl hover:bg-muted transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${currentBadge.avatarColor}`}
            >
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-foreground truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentBadge.label}</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1 text-muted-foreground hover:text-foreground transition-colors ml-1"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              className={`transform transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            >
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar matching Screenshots */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 sm:px-6 justify-between flex-shrink-0 z-30">
          {/* Left: Page Title & Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-tight capitalize">
                {activePage.replace('-', ' ')}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {activePage === 'dashboard'
                  ? 'Your overview and activity at a glance'
                  : `Manage institutional ${activePage.replace('-', ' ')} records`}
              </p>
            </div>
          </div>

          {/* Right: Search + Dark Toggle + Notifications + User Avatar */}
          <div className="flex items-center gap-3">
            {/* Search Pill */}
            <div className="relative w-44 sm:w-64" ref={searchRef}>
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => searchQuery && setShowResults(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />

              {/* Search dropdown results */}
              {showResults && searchQuery.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                  {!hasResults ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">No matches found</div>
                  ) : (
                    <>
                      {searchResearchers.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            onNavigate('researchers')
                            setShowResults(false)
                            setSearchQuery('')
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted transition-colors text-left border-b border-border/50 last:border-0"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold">
                            {r.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{r.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{r.institution}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dark Mode Icon */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Notification Bell with Badge count */}
            <button
              onClick={() => onNavigate('profile-notifications')}
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <BellIcon size={16} />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 0 ? unreadCount : 6}
              </span>
            </button>

            {/* Profile Avatar Button */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer ${currentBadge.avatarColor}`}
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{userEmail || 'researcher@mit.edu'}</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('profile-me')
                      setDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('profile-settings')
                      setDropdownOpen(false)
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    Account Settings
                  </button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false)
                        onLogout?.()
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">{children}</main>
      </div>
    </div>
  )
}

function GridIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}
function UsersIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function BuildingIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}
function PersonIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function BookIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}
function FolderIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function NetworkIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}
function CalendarIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
function QuoteIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
    </svg>
  )
}
function ChartIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function ShieldIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}
function SearchIcon({ size = 16, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function BellIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function GearNavIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
