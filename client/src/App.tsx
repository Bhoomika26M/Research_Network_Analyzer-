import { useEffect, useState } from 'react'
import { authApi } from './services/auth'
import { securityApi } from './services/security'
import { ToastProvider, useToast } from './context/ToastContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { NavigationContext } from './context/NavigationContext'
import { ToastContainer } from './components/Toast'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Shell from './layout/Shell'
import { ScientificLogo } from './components/ScientificLogo'

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
import type { Permission } from './permissions/config'
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
  return typeof value === 'string' && (ROLE_KEYS as string[]).includes(value as Role)
}

function AppInner() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')
  const [role, setRole] = useState<Role | null>(null)
  const [loggedInUser, setLoggedInUser] = useState<SessionUser | null>(null)
  const [activePage, setActivePage] = useState('dashboard')
  const [reviewPubId, setReviewPubId] = useState<number | null>(null)
  const [restoring, setRestoring] = useState(() => !!localStorage.getItem('Scientific Network_token'))

  const { showToast } = useToast()

  const handleLogout = (reason?: string) => {
    localStorage.removeItem('Scientific Network_token')
    localStorage.removeItem('Scientific Network_user')
    localStorage.removeItem('Scientific Network_login_time')
    setRole(null)
    setLoggedInUser(null)
    setAuthScreen('login')
    setActivePage('dashboard')
    if (reason) {
      showToast(reason, 'error')
    }
  }

  // Cross-tab Force Logout & Session Expiration Listeners
  useEffect(() => {
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('Scientific Network_auth') : null

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'Scientific Network_force_logout' && role) {
        handleLogout('Your session was terminated by an administrator.')
      }
    }

    const handleBroadcast = (e: MessageEvent) => {
      if (e.data?.type === 'FORCE_LOGOUT' && role) {
        handleLogout('Your session was terminated by an administrator.')
      }
    }

    const handleSessionExpired = (e: any) => {
      if (role) {
        handleLogout(e.detail || 'Session expired or invalidated. Please log in again.')
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('Scientific Network_session_expired', handleSessionExpired)
    if (channel) {
      channel.addEventListener('message', handleBroadcast)
    }

    const timer = setInterval(() => {
      if (role && role !== 'admin') {
        securityApi
          .getPolicy()
          .then((p) => {
            const loginTimeStr = localStorage.getItem('Scientific Network_login_time')
            const loginTime = Number(loginTimeStr)
            if (p?.forceLogoutAt && loginTimeStr && Number.isFinite(loginTime) && loginTime < p.forceLogoutAt) {
              handleLogout('Your session was invalidated by a security policy update.')
            }
          })
          .catch(() => {})
      }
    }, 4000)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('Scientific Network_session_expired', handleSessionExpired)
      if (channel) {
        channel.close()
      }
      clearInterval(timer)
    }
  }, [role])

  // Hydrate session on initial load
  useEffect(() => {
    const token = localStorage.getItem('Scientific Network_token')
    if (!token) {
      setRestoring(false)
      return
    }

    authApi
      .me()
      .then((me) => {
        if (isRole(me.role)) {
          setRole(me.role)
          setLoggedInUser(me)
          localStorage.setItem('Scientific Network_user', JSON.stringify(me))
        } else {
          handleLogout()
        }
      })
      .catch(() => {
        handleLogout()
      })
      .finally(() => {
        setRestoring(false)
      })
  }, [])

  if (restoring) {
    return <SessionSplash />
  }

  if (!role) {
    if (authScreen === 'register') {
      return (
        <>
          <ToastContainer />
          <Register
            onRegisterSuccess={(newRole, user) => {
              setRole(newRole)
              setLoggedInUser(user)
              setActivePage('dashboard')
            }}
            onGoLogin={() => setAuthScreen('login')}
          />
        </>
      )
    }

    return (
      <>
        <ToastContainer />
        <Login
          onLoginSuccess={(loggedRole, user) => {
            setRole(loggedRole)
            setLoggedInUser(user)
            setActivePage('dashboard')
          }}
          onGoRegister={() => setAuthScreen('register')}
        />
      </>
    )
  }

  const displayName = loggedInUser?.name ?? ''

  // Administrative surfaces are guarded by permission, not just hidden in the nav.
  const pagePermission: Record<string, Permission> = {
    users: 'admin.manageUsers',
    institutions: 'admin.manageInstitutions',
    'role-perms': 'admin.assignRoles',
    audit: 'analytics.viewAuditLogs',
    'system-config': 'system.configuration',
    'security-settings': 'system.securitySettings',
  }

  const renderPage = () => {
    if (activePage === 'dashboard' && role === 'reviewer' && reviewPubId !== null) {
      return <TaskReview pubId={reviewPubId} user={loggedInUser ?? undefined} onBack={() => setReviewPubId(null)} />
    }

    const requiredPermission = pagePermission[activePage]
    if (requiredPermission && !hasPermission(loggedInUser, requiredPermission)) {
      return <AccessDenied permission={requiredPermission} />
    }

    switch (activePage) {
      case 'dashboard':
        if (role === 'researcher') return <ResearcherDashboard user={loggedInUser ?? undefined} />
        if (role === 'institution') return <InstitutionDashboard user={loggedInUser ?? undefined} />
        if (role === 'admin') return <AdminDashboard />
        if (role === 'reviewer') return <ReviewerDashboard onOpenReview={(id) => setReviewPubId(id)} />
        return null

      case 'users':
        return <UserManagement user={loggedInUser ?? undefined} />
      case 'institutions':
        return <InstitutionPanel user={loggedInUser ?? undefined} />
      case 'role-perms':
        return <RolePermissions />
      case 'researchers':
        return <ResearcherManagement user={loggedInUser ?? undefined} />
      case 'publications':
        return <PublicationManagement user={loggedInUser ?? undefined} />
      case 'collaborations':
        return <CollaborationManagement user={loggedInUser ?? undefined} />
      case 'teams':
        return <TeamManagement user={loggedInUser ?? undefined} />
      case 'assignments':
        return <ProjectAssignments user={loggedInUser ?? undefined} />
      case 'conferences':
        return <ConferenceManagement user={loggedInUser ?? undefined} />
      case 'scheduling':
        return <ConferenceScheduling user={loggedInUser ?? undefined} />
      case 'citations':
        return <CitationManagement user={loggedInUser ?? undefined} />
      case 'doi':
        return <DOIManagement user={loggedInUser ?? undefined} />
      case 'linking':
        return <PublicationLinking user={loggedInUser ?? undefined} />
      case 'reports':
        return <ReportsExport />
      case 'audit':
        return <AuditLog user={loggedInUser ?? undefined} />
      case 'system-config':
        return <SystemConfig />
      case 'security-settings':
        return <SecuritySettings />
      case 'profile-me':
        return (
          <MyProfile
            role={role}
            user={loggedInUser ?? undefined}
            onUserUpdated={(updated) => {
              localStorage.setItem('Scientific Network_user', JSON.stringify(updated))
              setLoggedInUser(updated)
            }}
          />
        )
      case 'profile-settings':
        return (
          <AccountSettings
            user={loggedInUser ?? undefined}
            onLogout={handleLogout}
            onUserUpdated={(updated) => {
              localStorage.setItem('Scientific Network_user', JSON.stringify(updated))
              setLoggedInUser(updated)
            }}
          />
        )
      case 'profile-notifications':
        return <Notifications />
      case 'profile-help':
        return <HelpSupport />
      default:
        return <ResearcherDashboard />
    }
  }

  return (
    <NavigationContext.Provider
      value={(page) => {
        setActivePage(page)
        setReviewPubId(null)
      }}
    >
      <ToastContainer />
      <Shell
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page)
          setReviewPubId(null)
        }}
        role={role}
        userName={displayName}
        userEmail={loggedInUser?.email}
        user={loggedInUser ?? undefined}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Shell>
    </NavigationContext.Provider>
  )
}

function AccessDenied({ permission }: { permission: string }) {
  return (
    <div className="p-8 flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4 text-3xl">🔒</div>
      <h2 className="font-display font-bold text-xl text-foreground mb-2">Access Restricted</h2>
      <p className="text-sm text-muted-foreground">
        Your role does not include the <span className="font-mono text-xs">{permission}</span> permission.
      </p>
      <p className="text-xs text-muted-foreground/80 mt-1">Contact your System Administrator for access.</p>
    </div>
  )
}

function SessionSplash() {
  return (
    <div className="session-splash bg-background flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
          <ScientificLogo iconOnly height={28} textColor="#FFFFFF" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-xl text-foreground tracking-tight">Scientific Network</span>
        </div>
        <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
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

