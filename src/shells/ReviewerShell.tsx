import React, { useState, useRef, useEffect, Suspense } from 'react'
import {
  LayoutDashboard, Users,
  ChevronLeft, ChevronRight, Moon, Sun, LogOut, User, ChevronDown,
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import { ScientificLogoPill } from '../components/shared/ScientificLogo'
import { PAGE_PATH, pageFromPath } from '../services/navigation'

const DashboardPage = React.lazy(() => import('../pages/reviewer/Dashboard'))
const CollaborationPage = React.lazy(() => import('../pages/Collaboration/CollaborationPage'))
const ProfilePage = React.lazy(() => import('../pages/researcher/Profile'))

type PageKey = 'dashboard' | 'collaboration' | 'profile'

const NAV_ITEMS: { icon: React.ElementType; label: string; page: PageKey }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: Users, label: 'Collaboration', page: 'collaboration' },
]

const PAGE_META: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your activity at a glance' },
  collaboration: { title: 'Collaboration', subtitle: 'Network graph and projects' },
  profile: { title: 'User Profile', subtitle: 'Manage personal profile and details' },
}

const ROLE_COLOR = '#14B8A6'

export default function ReviewerShell() {
  const { user, darkMode, toggleDark, logout } = useAppContext()
  const [activePage, setActivePageState] = useState<PageKey>(() => {
    const fromPath = pageFromPath('dashboard')
    return (PAGE_META as Record<string, unknown>)[fromPath] ? (fromPath as PageKey) : 'dashboard'
  })
  // Keep the URL in step with the shell (deep links + /dashboard landing) and
  // ignore keys the trim removed, so a dead link can never blank the page.
  const setActivePage = (page: PageKey) => {
    if (!PAGE_META[page]) return
    window.history.replaceState(null, '', PAGE_PATH[page])
    setActivePageState(page)
  }
  const [collabTab, setCollabTab] = useState<'coauthors' | 'projects' | 'mine' | 'institutions' | 'find'>('coauthors')
  const [collapsed, setCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  /** Dashboard shortcuts open the matching Collaboration tab. */
  function navigate(page: string) {
    if (page === 'find' || page === 'collaborations') {
      setCollabTab('find')
      setActivePage('collaboration')
      return
    }
    if (page === 'projects' || page === 'my-projects') {
      setCollabTab('mine')
      setActivePage('collaboration')
      return
    }
    setActivePage(page as PageKey)
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={navigate} />
      case 'collaboration':
        return <CollaborationPage tab={collabTab} onTabChange={(next) => setCollabTab(next)} />
      case 'profile': return <ProfilePage />
    }
  }



  const meta = PAGE_META[activePage]

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 bg-card border-r border-border transition-all duration-300"
        style={{ width: collapsed ? 64 : 220 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-border" style={{ minHeight: 64 }}>
          <ScientificLogoPill collapsed={collapsed} />
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-3 py-2 border-b border-border">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ background: ROLE_COLOR }}
            >
              Reviewer
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map(({ icon: Icon, label, page }) => {
            const active = activePage === page
            return (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className="flex items-center gap-3 w-full px-3 py-2 my-0.5 rounded-lg mx-2 transition-colors text-sm font-medium"
                style={{
                  width: collapsed ? 40 : 'calc(100% - 16px)',
                  backgroundColor: active ? `${ROLE_COLOR}20` : 'transparent',
                  color: active ? ROLE_COLOR : undefined,
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-border px-3 py-3 flex items-center gap-2">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full text-white text-xs font-bold"
            style={{ width: 32, height: 32, background: ROLE_COLOR }}
          >
            {user?.initials ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center justify-center py-2 border-t border-border hover:bg-muted transition-colors text-muted-foreground"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-6 border-b border-border bg-card" style={{ minHeight: 64 }}>
          <div>
            <h1 className="font-bold text-base leading-tight">{meta.title}</h1>
            <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors"
              >
                <div
                  className="flex items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ width: 30, height: 30, background: ROLE_COLOR }}
                >
                  {user?.initials ?? 'U'}
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => { setActivePage('profile'); setUserMenuOpen(false) }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <User size={14} />
                    Profile
                  </button>
                  <div className="border-t border-border" />
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-muted transition-colors"
                  >
                    <LogOut size={14} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>}>
            {renderPage()}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
