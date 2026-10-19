import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type * as App from '../types/app'
import { apiClient, TOKEN_KEY } from '../services/apiClient'
import { mockDataStore } from '../services/dataStore'
import { authService } from '../services/authService'
import type {
  User as AuthUser,
  UserRole,
  Researcher as ApiResearcher,
  Institution as ApiInstitution,
  Project as ApiProject,
} from '../types'
import {
  toDepartment,
  toInstitution,
  toProject,
  toResearcher,
  toUser,
} from '../services/appDataService'
import { useNotificationStore } from '../store/notificationStore'

interface CurrentUser {
  id: string; name: string; email: string; role: string;
  institution: string; initials: string; color: string;
}

interface Toast { message: string; type: 'success' | 'error' | 'warning' | 'info' }

/** Backend review outcomes a reviewer decision can map to. */
type ReviewDecision = 'approved' | 'rejected' | 'changes_requested'

interface AppState {
  user: CurrentUser | null
  darkMode: boolean
  loading: boolean
  error: string | null
  publications: App.Publication[]
  researchers: App.Researcher[]
  institutions: App.Institution[]
  projects: App.Project[]
  conferences: App.Conference[]
  reviews: App.Review[]
  events: App.Event[]
  auditLogs: App.AuditLog[]
  departments: App.Department[]
  users: App.User[]
  citations: App.Citation[]
  notifications: App.Notification[]
  toast: Toast | null
  login: (role: string, email: string, password: string) => Promise<void>
  logout: () => void
  toggleDark: () => void
  showToast: (message: string, type?: Toast['type']) => void
  reload: () => void
  addPublication: (p: Omit<App.Publication, 'id'>) => void
  updatePublication: (id: string, p: Partial<App.Publication>) => void
  deletePublication: (id: string) => void
  addResearcher: (r: Omit<App.Researcher, 'id'>) => void
  updateResearcher: (id: string, r: Partial<App.Researcher>) => void
  deleteResearcher: (id: string) => void
  addInstitution: (i: Omit<App.Institution, 'id'>) => void
  updateInstitution: (id: string, i: Partial<App.Institution>) => void
  deleteInstitution: (id: string) => void
  addProject: (p: Omit<App.Project, 'id'>) => void
  updateProject: (id: string, p: Partial<App.Project>) => void
  deleteProject: (id: string) => void
  addConference: (c: Omit<App.Conference, 'id'>) => void
  updateConference: (id: string, c: Partial<App.Conference>) => void
  deleteConference: (id: string) => void
  updateReview: (id: string, r: Partial<App.Review> & { decision?: ReviewDecision }) => Promise<void>
  assignReviewer: (publicationId: string, reviewerId: string) => Promise<void>
  updateEvent: (id: string, e: Partial<App.Event>) => void
  addUser: (u: Omit<App.User, 'id'>) => void
  updateUser: (id: string, u: Partial<App.User>) => void
  deleteUser: (id: string) => void
  addDepartment: (d: Omit<App.Department, 'id'>) => void
  updateDepartment: (id: string, d: Partial<App.Department>) => void
  deleteDepartment: (id: string) => void
  markNotificationRead: (id: string) => void
}

// The view-model adapters (toPublication, toResearcher, …) live in
// services/appDataService so pages and the context share one mapping layer.

/** Avatar/colour defaults per role (the API returns the real name and id). */
const ROLE_PROFILES: Record<string, CurrentUser> = {
  researcher: { id: 'u1', name: 'Dr. Sarah Chen', email: 'sarah.chen@mit.edu', role: 'Researcher', institution: 'MIT', initials: 'SC', color: '#2563EB' },
  'institution admin': { id: 'u2', name: 'Prof. James Wilson', email: 'j.wilson@stanford.edu', role: 'Institution Admin', institution: 'Stanford University', initials: 'JW', color: '#7C3AED' },
  reviewer: { id: 'u3', name: 'Dr. Maria Rodriguez', email: 'm.rodriguez@ethz.ch', role: 'Reviewer', institution: 'ETH Zürich', initials: 'MR', color: '#14B8A6' },
  'system admin': { id: 'u4', name: 'Alex Thompson', email: 'a.thompson@scientific.app', role: 'System Admin', institution: 'Scientific Platform', initials: 'AT', color: '#F59E0B' },
}

/** Combine the signed-in API user with its per-role presentation defaults. */
function currentUserFrom(me: AuthUser): CurrentUser {
  const base = ROLE_PROFILES[me.role.toLowerCase()] ?? ROLE_PROFILES.researcher
  return { ...base, id: me.id, name: me.name, email: me.email, role: me.role, initials: me.initials }
}

const AppContext = createContext<AppState | null>(null)

export const useAppContext = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('nexora-dark') === 'true' } catch { return false }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publications, setPublications] = useState<App.Publication[]>([])
  const [researchers, setResearchers] = useState<App.Researcher[]>([])
  const [institutions, setInstitutions] = useState<App.Institution[]>([])
  const [projects, setProjects] = useState<App.Project[]>([])
  const [conferences, setConferences] = useState<App.Conference[]>([])
  const [reviews] = useState<App.Review[]>([])
  const [events] = useState<App.Event[]>([])
  const [auditLogs, setAuditLogs] = useState<App.AuditLog[]>([])
  const [departments, setDepartments] = useState<App.Department[]>([])
  const [users, setUsers] = useState<App.User[]>([])
  const [citations] = useState<App.Citation[]>([])
  const [serverNotifications, setServerNotifications] = useState<App.Notification[]>([])
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    try { localStorage.setItem('nexora-dark', String(darkMode)) } catch {}
  }, [darkMode])

  // Restore a persisted JWT session on load so a refresh keeps you signed in.
  useEffect(() => {
    let cancelled = false
    const restore = async () => {
      let token: string | null = null
      try { token = localStorage.getItem(TOKEN_KEY) } catch { token = null }
      if (!token) return
      try {
        const me = await authService.me()
        if (cancelled) return
        setUser(currentUserFrom(me))
        void mockDataStore.prime()
      } catch {
        // Expired/invalid token — the 401 interceptor already cleared it.
      }
    }
    void restore()
    return () => { cancelled = true }
  }, [])

  /**
   * Load the collections the trimmed app still supports. Each request is
   * isolated (no shared `Promise.all`), so one unavailable endpoint can no
   * longer blank every page with "not found / retry".
   */
  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    type RawDepartment = {
      id: string; name: string; institution_id: string;
      head_name?: string | null; budget?: number | string | null;
    }

    const settle = <T,>(loader: () => Promise<T>, fallback: T): Promise<T> =>
      loader().catch(() => fallback)

    const [res, insts, projs, rawDepartments] = await Promise.all([
      settle(() => mockDataStore.getResearchers(), [] as ApiResearcher[]),
      settle(() => mockDataStore.getInstitutions(), [] as ApiInstitution[]),
      settle(() => mockDataStore.getProjects(), [] as ApiProject[]),
      settle(async () => {
        const response = await apiClient.get<{ items: RawDepartment[] }>('/departments', {
          params: { limit: 100 },
        })
        return response.data.items
      }, [] as RawDepartment[]),
    ])

    const nameById = new Map(insts.map((i) => [i.id, i.name]))
    setResearchers(res.map(toResearcher))
    setInstitutions(insts.map(toInstitution))
    setProjects(projs.map(toProject))
    setDepartments(rawDepartments.map((d) => toDepartment(d, nameById.get(d.institution_id) ?? '')))
    setLoading(false)
  }, [])

  /** Admin-only collections: requesting these as any other role is a 403. */
  const loadAdminOnly = useCallback(async () => {
    let rawUsers: Parameters<typeof toUser>[0][] = []
    try {
      const res = await apiClient.get<{ items: Parameters<typeof toUser>[0][] }>('/users', {
        params: { limit: 100 },
      })
      rawUsers = res.data.items
    } catch {
      rawUsers = []
    }
    setUsers(rawUsers.map(toUser))
  }, [])

  // Only signed-in users hold a token, so the collections load after login (and
  // after a session restore) — the public sign-in pages make no API calls and
  // therefore log no 401s.
  useEffect(() => {
    if (!user) {
      setResearchers([])
      setInstitutions([])
      setProjects([])
      setDepartments([])
      setLoading(false)
      return
    }
    void loadAll()
  }, [user, loadAll])

  useEffect(() => {
    if (user?.role === 'System Admin') {
      void loadAdminOnly()
    } else {
      setAuditLogs([])
      setUsers([])
    }
  }, [user?.role, loadAdminOnly])

  const reloadAll = useCallback(() => {
    void loadAll()
    if (user?.role === 'System Admin') void loadAdminOnly()
  }, [loadAll, loadAdminOnly, user?.role])

  // Mirror the notification store into the view-model shape.
  const notificationsFromStore = useNotificationStore((s) => s.notifications)
  useEffect(() => {
    setServerNotifications(
      notificationsFromStore.map((n) => ({
        id: n.id, title: n.title, message: n.message, type: n.type, time: n.timestamp, read: n.read,
      }))
    )
  }, [notificationsFromStore])

  // Backend-only validation: credentials and the selected role are checked by
  // /auth/login, and the role from /auth/me decides which shell to render.
  // There is no demo/role-switcher fallback anymore.
  const login = useCallback(async (role: string, email: string, password: string) => {
    const me = await authService.login(email, password, (role || undefined) as UserRole | undefined)
    // Every role lands on /dashboard first; the shell then routes by this role.
    window.history.replaceState(null, '', '/dashboard')
    setUser(currentUserFrom(me))
    void mockDataStore.prime()
    // loadAll runs from the effect above once `user` is set.
  }, [])

  const logout = useCallback(() => {
    // Drop the persisted JWT too, otherwise a refresh restores the session.
    authService.logout()
    window.history.replaceState(null, '', '/')
    useNotificationStore.setState({ notifications: [], unreadCount: 0 })
    setUser(null)
    setAuditLogs([])
    setUsers([])
    setResearchers([])
    setInstitutions([])
    setProjects([])
    setDepartments([])
  }, [])
  const toggleDark = useCallback(() => setDarkMode((d) => !d), [])
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const genId = () => Math.random().toString(36).slice(2, 10)

  const addPublication = useCallback((p: Omit<App.Publication, 'id'>) => setPublications((prev) => [...prev, { ...p, id: genId() }]), [])
  const updatePublication = useCallback((id: string, p: Partial<App.Publication>) => setPublications((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))), [])
  const deletePublication = useCallback((id: string) => setPublications((prev) => prev.filter((x) => x.id !== id)), [])

  const addResearcher = useCallback((r: Omit<App.Researcher, 'id'>) => setResearchers((prev) => [...prev, { ...r, id: genId() }]), [])
  const updateResearcher = useCallback((id: string, r: Partial<App.Researcher>) => setResearchers((prev) => prev.map((x) => (x.id === id ? { ...x, ...r } : x))), [])
  const deleteResearcher = useCallback((id: string) => setResearchers((prev) => prev.filter((x) => x.id !== id)), [])

  const addInstitution = useCallback((i: Omit<App.Institution, 'id'>) => setInstitutions((prev) => [...prev, { ...i, id: genId() }]), [])
  const updateInstitution = useCallback((id: string, i: Partial<App.Institution>) => setInstitutions((prev) => prev.map((x) => (x.id === id ? { ...x, ...i } : x))), [])
  const deleteInstitution = useCallback((id: string) => setInstitutions((prev) => prev.filter((x) => x.id !== id)), [])

  const addProject = useCallback((p: Omit<App.Project, 'id'>) => setProjects((prev) => [...prev, { ...p, id: genId() }]), [])
  const updateProject = useCallback((id: string, p: Partial<App.Project>) => setProjects((prev) => prev.map((x) => (x.id === id ? { ...x, ...p } : x))), [])
  const deleteProject = useCallback((id: string) => setProjects((prev) => prev.filter((x) => x.id !== id)), [])

  const addConference = useCallback((c: Omit<App.Conference, 'id'>) => setConferences((prev) => [...prev, { ...c, id: genId() }]), [])
  const updateConference = useCallback((id: string, c: Partial<App.Conference>) => setConferences((prev) => prev.map((x) => (x.id === id ? { ...x, ...c } : x))), [])
  const deleteConference = useCallback((id: string) => setConferences((prev) => prev.filter((x) => x.id !== id)), [])

  const updateReview = useCallback(
    async (id: string, patch: Partial<App.Review> & { decision?: ReviewDecision }) => {
      if (!patch.decision) return
      await mockDataStore.updateReview(id, {
        status: patch.decision,
        comments: patch.feedback ?? undefined,
      })
      await loadAll()
    },
    [loadAll]
  )
  const assignReviewer = useCallback(
    async (publicationId: string, reviewerId: string) => {
      await mockDataStore.assignReviewer(publicationId, reviewerId)
      await loadAll()
    },
    [loadAll]
  )
  const updateEvent = useCallback((_id: string, _e: Partial<App.Event>) => {}, [])

  const addUser = useCallback((u: Omit<App.User, 'id'>) => setUsers((prev) => [...prev, { ...u, id: genId() }]), [])
  const updateUser = useCallback((id: string, u: Partial<App.User>) => setUsers((prev) => prev.map((x) => (x.id === id ? { ...x, ...u } : x))), [])
  const deleteUser = useCallback((id: string) => setUsers((prev) => prev.filter((x) => x.id !== id)), [])

  const addDepartment = useCallback((d: Omit<App.Department, 'id'>) => setDepartments((prev) => [...prev, { ...d, id: genId() }]), [])
  const updateDepartment = useCallback((id: string, d: Partial<App.Department>) => setDepartments((prev) => prev.map((x) => (x.id === id ? { ...x, ...d } : x))), [])
  const deleteDepartment = useCallback((id: string) => setDepartments((prev) => prev.filter((x) => x.id !== id)), [])

  const markNotificationRead = useCallback((id: string) => {
    setServerNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)))
    useNotificationStore.getState().markAsRead(id)
  }, [])

  return (
    <AppContext.Provider value={{
      user, darkMode, loading, error, publications, researchers, institutions, projects,
      conferences, reviews, events, auditLogs, departments, users, citations, notifications: serverNotifications, toast,
      login, logout, toggleDark, showToast, reload: reloadAll,
      addPublication, updatePublication, deletePublication,
      addResearcher, updateResearcher, deleteResearcher,
      addInstitution, updateInstitution, deleteInstitution,
      addProject, updateProject, deleteProject,
      addConference, updateConference, deleteConference,
      updateReview, assignReviewer, updateEvent,
      addUser, updateUser, deleteUser,
      addDepartment, updateDepartment, deleteDepartment,
      markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext
