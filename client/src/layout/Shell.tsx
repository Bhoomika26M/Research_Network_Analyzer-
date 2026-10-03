import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react'
import { hasPermission, type Role } from '../permissions/config'
import { useResearchers } from '../services/researchers'
import { usePublications } from '../services/publications'
import { useNotifications } from '../context/NotificationsContext'
import type { SessionUser } from '../types/index'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: GridIcon, parent: null, system: false },
  { id: 'users', label: 'User Management', icon: UsersIcon, parent: null, system: false },
  { id: 'institutions', label: 'Institution Panel', icon: UsersIcon, parent: 'users', system: false },
  { id: 'role-perms', label: 'Role Permissions', icon: ShieldIcon, parent: 'users', system: false },
  { id: 'researchers', label: 'Researchers', icon: PersonIcon, parent: null, system: false },
  { id: 'publications', label: 'Publications', icon: BookIcon, parent: null, system: false },
  { id: 'collaborations', label: 'Collaborations', icon: NetworkIcon, parent: null, system: false },
  { id: 'teams', label: 'Team Management', icon: UsersIcon, parent: 'collaborations', system: false },
  { id: 'assignments', label: 'Project Assignments', icon: GridIcon, parent: 'collaborations', system: false },
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
  const [darkMode, setDarkMode] = useState(false)

  // Global search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Global search sources from the live API (cached by react-query)
  const { data: apiResearchers = [] } = useResearchers()
  const { data: apiPublications = [] } = usePublications()

  const searchResearchers = apiResearchers.filter(r => {
    const q = searchQuery.toLowerCase()
    return q.length > 0 && (
      r.name.toLowerCase().includes(q) ||
      r.institution.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    )
  }).slice(0, 5)

  const searchPubs = apiPublications.filter(p => {
    const q = searchQuery.toLowerCase()
    return q.length > 0 && (
      p.title.toLowerCase().includes(q) ||
      p.authors.some(a => a.toLowerCase().includes(q))
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
  const roleColors: Record<string, string> = {
    researcher: 'bg-blue-50 text-blue-700',
    institution: 'bg-violet-50 text-violet-700',
    admin: 'bg-amber-50 text-amber-700',
    reviewer: 'bg-emerald-50 text-emerald-700',
  }

  const roleLabels: Record<string, string> = {
    researcher: 'Researcher',
    institution: 'Institution Admin',
    admin: 'System Admin',
    reviewer: 'Reviewer',
  }

  // Determine which top-level section is "open" based on activePage
  const activeParent = navItems.find(n => n.id === activePage)?.parent

  const typedRole = role as Role

  const visibleNav = navItems.filter(n => {
    // System nav items only for admin
    if (n.system) return typedRole === 'admin'
    // Permission-based visibility, using the permissions the backend granted
    // the account (falls back to the static role map for offline sessions)
    if (n.id === 'institutions' && !hasPermission(user, 'admin.manageInstitutions')) return false
    if (n.id === 'role-perms' && !hasPermission(user, 'admin.assignRoles')) return false
    if (n.id === 'audit' && !hasPermission(user, 'analytics.viewAuditLogs')) return false
    if (n.id === 'users' && !hasPermission(user, 'admin.manageUsers')) return false
    // Only show sub-items when their parent section is active
    if (n.parent !== null) {
      const parentActive = activePage === n.parent || activeParent === n.parent
      return parentActive
    }
    return true
  })

  return (
    <div className="flex h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#ECFDF5] border-r border-[#ECFDF5] flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#D1FAE5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="4" r="2" fill="white"/>
                <circle cx="3" cy="11" r="2" fill="white"/>
                <circle cx="13" cy="11" r="2" fill="white"/>
                <line x1="8" y1="6" x2="3" y2="9" stroke="white" strokeWidth="1.2"/>
                <line x1="8" y1="6" x2="13" y2="9" stroke="white" strokeWidth="1.2"/>
                <line x1="5" y1="11" x2="11" y2="11" stroke="white" strokeWidth="1.2"/>
              </svg>
            </div>
            <span className="font-display text-[15px] text-[#0F172A] leading-tight">SciCollab<br/><span className="text-[11px] font-sans font-medium text-[#64748B]">Network Analyser</span></span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto px-3">
          <div className="mb-2 px-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full gradient-bg inline-block"></span>
              Navigation
            </span>
          </div>
          {visibleNav.map((item, idx) => {
            const active = activePage === item.id
            const isSub = item.parent !== null
            const Icon = item.icon
            // Show system section divider before first system item
            const prevItem = visibleNav[idx - 1]
            const showSystemDivider = item.system && (!prevItem || !prevItem.system)
            return (
              <div key={item.id}>
                {showSystemDivider && (
                  <div className="mx-3 my-2 border-t border-[#D1FAE5]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#94A3B8] block mt-2 mb-1 px-1">System</span>
                  </div>
                )}
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 relative ${
                    isSub ? 'px-3 py-2 ml-3' : 'px-3 py-2.5'
                  } ${
                    active
                      ? 'text-[#0052FF] bg-white/60'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                  style={!active ? { ['--tw-bg-opacity' as string]: '0' } : {}}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '' }}
                >
                  {active && !isSub && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r gradient-bg"></span>
                  )}
                  {isSub ? (
                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${active ? 'gradient-bg' : 'bg-[#CBD5E1]'}`}></span>
                  ) : (
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      active ? 'gradient-bg' : 'bg-white/50'
                    }`}>
                      <Icon size={14} color={active ? '#FFFFFF' : '#64748B'} />
                    </span>
                  )}
                  <span className={isSub ? 'text-xs' : ''}>{item.label}</span>
                </button>
              </div>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-[#D1FAE5]">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">{userName}</p>
              <p className="text-xs text-[#64748B]">{roleLabels[role]}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowResults(true) }}
                onFocus={() => searchQuery && setShowResults(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search researchers, publications..."
                className="w-full pl-9 pr-4 py-2 bg-[#F1F5F9] border border-transparent rounded-xl text-sm placeholder-[#64748B] focus:outline-none focus:border-[#0052FF] focus:bg-white transition-colors"
              />

              {/* Search results dropdown */}
              {showResults && searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-[#E2E8F0] shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
                  {!hasResults ? (
                    <div className="py-8 text-center text-sm text-[#64748B]">No matches found</div>
                  ) : (
                    <>
                      {searchResearchers.length > 0 && (
                        <div>
                          <div className="px-4 py-2 border-b border-[#F1F5F9]">
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Researchers</span>
                          </div>
                          {searchResearchers.map(r => (
                            <button
                              key={r.id}
                              onClick={() => { onNavigate('researchers'); setShowResults(false); setSearchQuery('') }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F1F5F9] transition-colors text-left"
                            >
                              <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                {r.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#0F172A] truncate">{r.name}</p>
                                <p className="text-xs text-[#64748B]">{r.institution}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchPubs.length > 0 && (
                        <div>
                          <div className="px-4 py-2 border-b border-[#F1F5F9] border-t border-t-[#E2E8F0]">
                            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Publications</span>
                          </div>
                          {searchPubs.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { onNavigate('publications'); setShowResults(false); setSearchQuery('') }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F1F5F9] transition-colors text-left"
                            >
                              <div className="w-7 h-7 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                                <span className="text-[10px]">📄</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-[#0F172A] truncate">{p.title.slice(0, 50)}{p.title.length > 50 ? '…' : ''}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-[#64748B]">{p.year}</span>
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-blue-50 text-blue-700">{p.type}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={() => onNavigate('profile-notifications')} className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors relative">
              <BellIcon size={15} color="#64748B" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full gradient-bg"></span>}
            </button>
            <button
              onClick={toggleDark}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors relative overflow-hidden"
            >
              <span
                className={`theme-icon ${darkMode ? 'theme-icon--off-sun' : 'theme-icon--on'}`}
              >
                {/* Sun icon */}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="2.5" fill="#64748B"/>
                  <path d="M7.5 1v1.5M7.5 12.5V14M14 7.5h-1.5M2.5 7.5H1M12.07 2.93l-1.06 1.06M4 11l-1.07 1.07M12.07 12.07l-1.06-1.06M4 4 2.93 2.93" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </span>
              <span
                className={`theme-icon ${darkMode ? 'theme-icon--on' : 'theme-icon--off-moon'}`}
              >
                {/* Moon icon */}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M12 9.33A6 6 0 0 1 4.67 2a6 6 0 1 0 7.33 7.33z" fill="#64748B"/>
                </svg>
              </span>
            </button>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[role]}`}>
              {roleLabels[role]}
            </span>

            {/* Avatar + dropdown trigger */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center gap-1.5 rounded-xl px-1 py-1 hover:bg-[#F1F5F9] transition-colors"
              >
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`chevron ${dropdownOpen ? 'chevron--open' : ''}`}
                >
                  <path d="M2.5 4.5L6 8l3.5-3.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-[#E2E8F0] z-50 overflow-hidden dropdown-panel"
                >
                  {/* Header */}
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full gradient-bg flex items-center justify-center text-white text-base font-semibold flex-shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{userName}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${roleColors[role]}`}>
                        {roleLabels[role]}
                      </span>
                      <p className="text-xs text-[#64748B] mt-0.5 truncate">
                        {userEmail
                          ? userEmail
                          : role === 'researcher' ? 's.chen@mit.edu'
                            : role === 'institution' ? 'admin@mit.edu'
                              : role === 'reviewer' ? 'j.okafor@cambridge.ac.uk'
                                : 'sysadmin@scicollab.io'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E2E8F0]" />

                  {/* Menu items */}
                  <div className="py-1.5">
                    {[
                      { icon: <PersonMenuIcon />, label: 'My Profile', page: 'profile-me' },
                      { icon: <GearIcon />, label: 'Account Settings', page: 'profile-settings' },
                      { icon: <BellMenuIcon />, label: 'Notifications', page: 'profile-notifications' },
                      { icon: <HelpIcon />, label: 'Help & Support', page: 'profile-help' },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={() => { setDropdownOpen(false); onNavigate(item.page) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-left"
                      >
                        <span className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#E2E8F0]" />

                  {/* Log out */}
                  <div className="py-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); onLogout?.() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors text-left"
                    >
                      <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <LogoutIcon />
                      </span>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

function GridIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={color}/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={color}/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={color}/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={color}/>
    </svg>
  )
}
function UsersIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke={color} strokeWidth="1.4"/>
      <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12" cy="5" r="2" stroke={color} strokeWidth="1.2"/>
      <path d="M15 13c0-2.21-1.34-4-3-4" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function PersonIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke={color} strokeWidth="1.4"/>
      <path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function BookIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 2h7a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke={color} strokeWidth="1.4"/>
      <line x1="5" y1="5.5" x2="10" y2="5.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="8" x2="10" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5" y1="10.5" x2="8" y2="10.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function NetworkIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" fill={color}/>
      <circle cx="2.5" cy="4" r="1.5" fill={color}/>
      <circle cx="13.5" cy="4" r="1.5" fill={color}/>
      <circle cx="2.5" cy="12" r="1.5" fill={color}/>
      <circle cx="13.5" cy="12" r="1.5" fill={color}/>
      <line x1="6" y1="7" x2="4" y2="5" stroke={color} strokeWidth="1.2"/>
      <line x1="10" y1="7" x2="12" y2="5" stroke={color} strokeWidth="1.2"/>
      <line x1="6" y1="9" x2="4" y2="11" stroke={color} strokeWidth="1.2"/>
      <line x1="10" y1="9" x2="12" y2="11" stroke={color} strokeWidth="1.2"/>
    </svg>
  )
}
function CalendarIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke={color} strokeWidth="1.4"/>
      <line x1="2" y1="7" x2="14" y2="7" stroke={color} strokeWidth="1.2"/>
      <line x1="5" y1="1.5" x2="5" y2="4.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="11" y1="1.5" x2="11" y2="4.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function QuoteIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 7h3.5v5.5H3V7zm0 0c0-2.2 1.4-3.5 3.5-3.5M9.5 7H13v5.5H9.5V7zm0 0c0-2.2 1.4-3.5 3.5-3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function ChartIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="9" width="3" height="5" rx="1" fill={color}/>
      <rect x="6.5" y="5" width="3" height="9" rx="1" fill={color}/>
      <rect x="11.5" y="2" width="3" height="12" rx="1" fill={color}/>
    </svg>
  )
}
function ShieldIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2L3 4.5V8c0 3 2.2 5.5 5 6 2.8-.5 5-3 5-6V4.5L8 2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function SearchIcon({ size = 16, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="6.5" cy="6.5" r="4" stroke={color} strokeWidth="1.4"/>
      <line x1="9.5" y1="9.5" x2="14" y2="14" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function BellIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2a4 4 0 0 0-4 4v3l-1 1.5h10L12 9V6a4 4 0 0 0-4-4z" stroke={color} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M6.5 13a1.5 1.5 0 0 0 3 0" stroke={color} strokeWidth="1.3"/>
    </svg>
  )
}

/* ── Dropdown-specific icons ─────────────────────────────── */
function PersonMenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke="#64748B" strokeWidth="1.3"/>
      <path d="M1.5 12.5c0-3.04 2.46-5.5 5.5-5.5s5.5 2.46 5.5 5.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function GearNavIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.4"/>
      <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="#64748B" strokeWidth="1.3"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
function BellMenuIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5a3.5 3.5 0 0 0-3.5 3.5v2.5L2 9h10L10.5 7.5V5A3.5 3.5 0 0 0 7 1.5z" stroke="#64748B" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M5.75 11a1.25 1.25 0 0 0 2.5 0" stroke="#64748B" strokeWidth="1.3"/>
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#64748B" strokeWidth="1.3"/>
      <path d="M5.5 5.5a1.5 1.5 0 0 1 3 .5c0 1-1.5 1.5-1.5 2.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="7" cy="10.5" r="0.6" fill="#64748B"/>
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9 2H11.5A1.5 1.5 0 0 1 13 3.5v7A1.5 1.5 0 0 1 11.5 12H9" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M6 9.5L9 7l-3-2.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9" y1="7" x2="1" y2="7" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}
