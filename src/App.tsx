import React, { useEffect, useState } from 'react'
import { AppProvider, useAppContext } from './contexts/AppContext'
import Auth from './pages/Auth'
import ResearcherShell from './shells/ResearcherShell'
import InstitutionAdminShell from './shells/InstitutionAdminShell'
import ReviewerShell from './shells/ReviewerShell'
import SystemAdminShell from './shells/SystemAdminShell'
import NotAuthorizedPage from './pages/Global/NotAuthorizedPage'
import Toast from './components/shared/Toast'

/** URL prefix owned by each role (deep links into a role's area). */
const ROLE_PREFIXES: Record<string, string> = {
  researcher: '/researcher',
  'institution admin': '/institution-admin',
  reviewer: '/reviewer',
  'system admin': '/system-admin',
}

/** Which role a URL belongs to, e.g. `/system-admin/users` -> 'system admin'. */
const roleFromPath = (path: string): string | null => {
  const match = Object.entries(ROLE_PREFIXES).find(
    ([, prefix]) => path === prefix || path.startsWith(`${prefix}/`)
  )
  return match ? match[0] : null
}

/** Pages removed by the trim: a direct URL here must show NotAuthorizedPage. */
const REMOVED_PATHS = [
  '/publications', '/researchers', '/institutions', '/conferences', '/citations',
  '/reports', '/audit-logs', '/notifications', '/search', '/reviews',
]

const AppContent: React.FC = () => {
  const { user, darkMode, logout } = useAppContext()
  // Bumped on browser back/forward so the URL guard is re-evaluated.
  const [, setNavTick] = useState(0)

  useEffect(() => {
    const onPopState = () => setNavTick((tick) => tick + 1)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // A restored session sitting on a sign-in URL (e.g. /admin-login after a
  // refresh) belongs on its dashboard, not on a form it no longer needs.
  useEffect(() => {
    if (!user) return
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    if (['/', '/login', '/register', '/admin-login'].includes(path)) {
      window.history.replaceState(null, '', '/dashboard')
      setNavTick((tick) => tick + 1)
    }
  }, [user])

  const renderShell = () => {
    // Direct URL into a module the trim removed -> dedicated NotAuthorized view
    // (works signed-in and signed-out; there is no route for it anymore).
    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const removed = REMOVED_PATHS.find((p) => path === p || path.startsWith(`${p}/`))
    if (removed) {
      return (
        <NotAuthorizedPage
          role={user?.role ?? 'Visitor'}
          message={`The "${removed.slice(1)}" module is no longer available. Available pages: Dashboard, Collaboration${user ? (user.role === 'System Admin' ? ', Users' : '') : ''}.`}
          action={
            user
              ? {
                  label: 'Back to dashboard',
                  onClick: () => {
                    window.history.replaceState(null, '', '/dashboard')
                    setNavTick((t) => t + 1)
                  },
                }
              : { label: 'Go to sign in', onClick: () => window.location.assign('/') }
          }
        />
      )
    }

    if (!user) return <Auth />

    // Role comes from /auth/me (snake_case in the API, Title Case here).
    const role = user.role.toLowerCase().replace(/_/g, ' ')
    const home = ROLE_PREFIXES[role]

    // Unknown role -> clear "not authorized" page with a way out.
    if (!home) {
      return (
        <NotAuthorizedPage
          role={user.role}
          message={`Your account role "${user.role}" does not match any area of this application.`}
          action={{ label: 'Sign in with another account', onClick: logout }}
        />
      )
    }

    // Wrong-role URL -> "not authorized" instead of another role's pages.
    const urlRole = roleFromPath(window.location.pathname)
    if (urlRole && urlRole !== role) {
      return (
        <NotAuthorizedPage
          role={user.role}
          message={`This address belongs to a different role, but you are signed in as ${user.role}.`}
          action={{
            label: 'Back to dashboard',
            onClick: () => {
              window.history.replaceState(null, '', home)
              setNavTick((tick) => tick + 1)
            },
          }}
        />
      )
    }

    if (role === 'researcher') return <ResearcherShell />
    if (role === 'institution admin') return <InstitutionAdminShell />
    if (role === 'reviewer') return <ReviewerShell />
    if (role === 'system admin') return <SystemAdminShell />
    return <NotAuthorizedPage role={user.role} />
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground">
        {renderShell()}
        <Toast />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
