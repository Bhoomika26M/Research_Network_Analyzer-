import { useEffect, useState } from 'react'
import { authApi } from './services/auth'
import { ToastProvider } from './context/ToastContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { NavigationContext } from './context/NavigationContext'
import { ToastContainer } from './components/Toast'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Shell from './layout/Shell'

// Dashboards
import ResearcherDashboard from './pages/dashboard/ResearcherDashboard'
import InstitutionDashboard from './pages/dashboard/InstitutionDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ReviewerDashboard from './pages/dashboard/ReviewerDashboard'

// Reviewer
import TaskReview from './pages/reviewer/TaskReview'

// Modules
import UserManagement from './pages/modules/UserManagement'
import InstitutionPanel from './pages/modules/InstitutionPanel'
import RolePermissions from './pages/modules/RolePermissions'
import ResearcherManagement from './pages/modules/ResearcherManagement'
import PublicationManagement from './pages/modules/PublicationManagement'
import CollaborationManagement from './pages/modules/CollaborationManagement'
import TeamManagement from './pages/modules/TeamManagement'
import ProjectAssignments from './pages/modules/ProjectAssignments'
import ConferenceManagement from './pages/modules/ConferenceManagement'
import ConferenceScheduling from './pages/modules/ConferenceScheduling'
import CitationManagement from './pages/modules/CitationManagement'
import DOIManagement from './pages/modules/DOIManagement'
import PublicationLinking from './pages/modules/PublicationLinking'
import ReportsExport from './pages/modules/ReportsExport'
import AuditLog from './pages/modules/AuditLog'

// Admin pages
import SystemConfig from './pages/admin/SystemConfig'
import SecuritySettings from './pages/admin/SecuritySettings'

import { hasPermission } from './permissions/config'
import type { SessionUser } from './types/index'

// Profile pages
import MyProfile from './pages/profile/MyProfile'
import AccountSettings from './pages/profile/AccountSettings'
import Notifications from './pages/profile/Notifications'
import HelpSupport from './pages/profile/HelpSupport'

export type { Role } from './permissions/config'
import type { Role } from './permissions/config'

type AuthScreen = 'login' | 'register'

const ROLE_KEYS: Role[] = ['researcher', 'institution', 'admin', 'reviewer']

function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLE_KEYS as string[]).includes(value)
}


function AppInner() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')
  const [role, setRole] = useState<Role | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<SessionUser | null>(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [reviewPubId, setReviewPubId] = useState<number | null>(null)
  // True while we validate a stored session against /auth/me on load.
  const [restoring, setRestoring] = useState(() => !!localStorage.getItem('scicollab_token'))

  // ── Session restore ────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('scicollab_token')
    if (!token) {
      // No stored token — show the login screen.
      setRestoring(false)
      return
    }

    let cancelled = false

    // Every session requires a valid backend token: restore only via /auth/me.
    authApi.me()
      .then((user) => {
        if (cancelled) return
        if (!isRole(user.role)) {
          // Backend role not recognized by this app — drop the session.
          localStorage.removeItem('scicollab_token')
          localStorage.removeItem('scicollab_user')
          setRestoring(false)
          return
        }
        localStorage.setItem('scicollab_user', JSON.stringify(user))
        setRole(user.role)
        setLoggedInUser(user)
        setActivePage('dashboard')
        setRestoring(false)
      })
      .catch(() => {
        if (cancelled) return
        // Invalid/expired token or backend unreachable — no offline session.
        localStorage.removeItem('scicollab_token')
        localStorage.removeItem('scicollab_user')
        setRestoring(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // ── Auth screens ───────────────────────────────────────────────
  if (restoring) {
    return <SessionSplash />
  }

  if (!role) {
    if (authScreen === 'login') {
      return (
        <>
          <ToastContainer />
          <Login
            onLoginSuccess={(selectedRole, user) => {
              setRole(selectedRole)
              setLoggedInUser(user)
              setActivePage('dashboard')
            }}
            onGoRegister={() => setAuthScreen('register')}
          />
        </>
      )
    }
    return (
      <>
        <ToastContainer />
        <Register
          onRegisterSuccess={(selectedRole, user) => {
            setRole(selectedRole)
            setLoggedInUser(user)
            setActivePage('dashboard')
          }}
          onGoLogin={() => setAuthScreen('login')}
        />
      </>
    )
  }

  // ── Authenticated app ──────────────────────────────────────────
  const displayName = loggedInUser?.name ?? ''

  const renderPage = () => {
    if (activePage === 'dashboard' && role === 'reviewer' && reviewPubId !== null) {
      return (
        <TaskReview
          pubId={reviewPubId}
          onBack={() => setReviewPubId(null)}
        />
      )
    }

    switch (activePage) {
      case 'dashboard':
        if (role === 'researcher') return <ResearcherDashboard user={loggedInUser ?? undefined} />
        if (role === 'institution') return <InstitutionDashboard user={loggedInUser ?? undefined} />
        if (role === 'admin') return <AdminDashboard />
        if (role === 'reviewer') return (
          <ReviewerDashboard onOpenReview={(id) => setReviewPubId(id)} />
        )
        return null

      case 'users':          return <UserManagement user={loggedInUser ?? undefined} />
      case 'institutions':   return <InstitutionPanel user={loggedInUser ?? undefined} />
      case 'role-perms':     return <RolePermissions />
      case 'researchers':    return <ResearcherManagement user={loggedInUser ?? undefined} />
      case 'publications':   return <PublicationManagement user={loggedInUser ?? undefined} />
      case 'collaborations': return <CollaborationManagement user={loggedInUser ?? undefined} />
      case 'teams':          return <TeamManagement />
      case 'assignments':    return <ProjectAssignments />
      case 'conferences':    return <ConferenceManagement />
      case 'scheduling':     return <ConferenceScheduling />
      case 'citations':      return <CitationManagement />
      case 'doi':            return <DOIManagement />
      case 'linking':        return <PublicationLinking />
      case 'reports':        return <ReportsExport />
      case 'audit':          return <AuditLog user={loggedInUser ?? undefined} />
      case 'system-config':
        return hasPermission(loggedInUser, 'system.configuration') ? <SystemConfig /> : null
      case 'security-settings':
        return hasPermission(loggedInUser, 'system.securitySettings') ? <SecuritySettings /> : null
      case 'profile-me':     return (
        <MyProfile
          role={role}
          user={loggedInUser ?? undefined}
          onUserUpdated={(updated) => {
            localStorage.setItem('scicollab_user', JSON.stringify(updated))
            setLoggedInUser(updated)
          }}
        />
      )
      case 'profile-settings': return <AccountSettings />
      case 'profile-notifications': return <Notifications />
      case 'profile-help':   return <HelpSupport />
      default:               return <ResearcherDashboard />
    }
  }

  return (
    <NavigationContext.Provider value={(page) => { setActivePage(page); setReviewPubId(null) }}>
      <ToastContainer />
      <Shell
        activePage={activePage}
        onNavigate={(page) => { setActivePage(page); setReviewPubId(null) }}
        role={role}
        userName={displayName}
        userEmail={loggedInUser?.email}
        user={loggedInUser ?? undefined}
        onLogout={() => {
          localStorage.removeItem('scicollab_token')
          localStorage.removeItem('scicollab_user')
          setRole(null)
          setLoggedInUser(null)
          setAuthScreen('login')
          setActivePage('dashboard')
        }}
      >
        {renderPage()}
      </Shell>
    </NavigationContext.Provider>
  )
}

function SessionSplash() {
  return (
    <div className="session-splash">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="6" r="3" fill="white"/>
            <circle cx="4.5" cy="17" r="3" fill="white"/>
            <circle cx="19.5" cy="17" r="3" fill="white"/>
            <line x1="12" y1="9" x2="4.5" y2="14" stroke="white" strokeWidth="1.8"/>
            <line x1="12" y1="9" x2="19.5" y2="14" stroke="white" strokeWidth="1.8"/>
            <line x1="7.5" y1="17" x2="16.5" y2="17" stroke="white" strokeWidth="1.8"/>
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-lg text-[#0F172A]">SciCollab</span>
        </div>
        <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] border-t-[#0052FF] animate-spin" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <NotificationsProvider>
        <AppInner />
      </NotificationsProvider>
    </ToastProvider>
  )
}
