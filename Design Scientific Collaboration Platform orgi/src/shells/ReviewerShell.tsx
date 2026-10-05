import React, { useState, useRef, useEffect, Suspense } from 'react'
import {
  LayoutDashboard, FileText, ListTodo, History, Clock, MessageSquare, BarChart3,
  ChevronLeft, ChevronRight, Search, Moon, Sun, Bell, LogOut, User, ChevronDown,
  CheckCheck, Info, AlertTriangle, CheckCircle, XCircle,
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import { ScientificLogoPill } from '../components/shared/ScientificLogo'

const DashboardPage = React.lazy(() => import('../pages/reviewer/Dashboard'))
const AssignedPapersPage = React.lazy(() => import('../pages/reviewer/AssignedPapers'))
const ReviewQueuePage = React.lazy(() => import('../pages/reviewer/ReviewQueue'))
const ReviewHistoryPage = React.lazy(() => import('../pages/reviewer/ReviewHistory'))
const DeadlinesPage = React.lazy(() => import('../pages/reviewer/Deadlines'))
const FeedbackPage = React.lazy(() => import('../pages/reviewer/Feedback'))
const ReportsPage = React.lazy(() => import('../pages/reviewer/Reports'))

type PageKey =
  | 'dashboard' | 'assigned-papers' | 'review-queue'
  | 'review-history' | 'deadlines' | 'feedback' | 'reports'

const NAV_ITEMS: { icon: React.ElementType; label: string; page: PageKey }[] = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: FileText, label: 'Assigned Papers', page: 'assigned-papers' },
  { icon: ListTodo, label: 'Review Queue', page: 'review-queue' },
  { icon: History, label: 'Review History', page: 'review-history' },
  { icon: Clock, label: 'Deadlines', page: 'deadlines' },
  { icon: MessageSquare, label: 'Feedback', page: 'feedback' },
  { icon: BarChart3, label: 'Reports', page: 'reports' },
]

const PAGE_META: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Your review activity at a glance' },
  'assigned-papers': { title: 'Assigned Papers', subtitle: 'Papers assigned to you for review' },
  'review-queue': { title: 'Review Queue', subtitle: 'Papers pending your review' },
  'review-history': { title: 'Review History', subtitle: 'Previously completed reviews' },
  deadlines: { title: 'Deadlines', subtitle: 'Upcoming review deadlines' },
  feedback: { title: 'Feedback', subtitle: 'Author feedback and responses' },
  reports: { title: 'Reports', subtitle: 'Review metrics and performance reports' },
}

const ROLE_COLOR = '#14B8A6'

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'success': return <CheckCircle size={14} className="text-green-500" />
    case 'error': return <XCircle size={14} className="text-red-500" />
    case 'warning': return <AlertTriangle size={14} className="text-yellow-500" />
    default: return <Info size={14} className="text-blue-500" />
  }
}

export default function ReviewerShell() {
  const { user, darkMode, toggleDark, logout, notifications, markNotificationRead } = useAppContext()
  const [activePage, setActivePage] = useState<PageKey>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length
  const recentNotifs = notifications.slice(0, 5)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function markAllRead() {
    notifications.forEach((n) => { if (!n.read) markNotificationRead(n.id) })
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard': return <DashboardPage onNavigate={setActivePage} />
      case 'assigned-papers': return <AssignedPapersPage />
      case 'review-queue': return <ReviewQueuePage />
      case 'review-history': return <ReviewHistoryPage />
      case 'deadlines': return <DeadlinesPage />
      case 'feedback': return <FeedbackPage />
      case 'reports': return <ReportsPage />
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
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 w-44"
                style={{ '--tw-ring-color': ROLE_COLOR } as React.CSSProperties}
              />
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              title="Toggle dark mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full text-white text-[10px] font-bold"
                    style={{ minWidth: 16, height: 16, background: ROLE_COLOR }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {recentNotifs.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
                    ) : (
                      recentNotifs.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition-colors flex gap-3 ${n.read ? 'opacity-60' : ''}`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                          </div>
                          {!n.read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5" style={{ background: ROLE_COLOR }} />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
                    onClick={() => { setUserMenuOpen(false) }}
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
