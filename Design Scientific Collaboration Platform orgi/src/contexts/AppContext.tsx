import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  publications as initialPublications, researchers as initialResearchers,
  institutions as initialInstitutions, projects as initialProjects,
  conferences as initialConferences, reviews as initialReviews,
  events as initialEvents, auditLogs as initialAuditLogs,
  departments as initialDepartments, users as initialUsers,
  citations as initialCitations, notifications as initialNotifications,
} from '../data/mockData'
import type {
  Publication, Researcher, Institution, Project, Conference, Review,
  Event, AuditLog, Department, User, Citation, Notification,
} from '../data/mockData'

interface CurrentUser {
  id: string; name: string; email: string; role: string;
  institution: string; initials: string; color: string;
}

interface Toast { message: string; type: 'success' | 'error' | 'warning' | 'info' }

interface AppState {
  user: CurrentUser | null
  darkMode: boolean
  publications: Publication[]
  researchers: Researcher[]
  institutions: Institution[]
  projects: Project[]
  conferences: Conference[]
  reviews: Review[]
  events: Event[]
  auditLogs: AuditLog[]
  departments: Department[]
  users: User[]
  citations: Citation[]
  notifications: Notification[]
  toast: Toast | null
  login: (role: string) => void
  logout: () => void
  toggleDark: () => void
  showToast: (message: string, type?: Toast['type']) => void
  // CRUD for each entity
  addPublication: (p: Omit<Publication, 'id'>) => void
  updatePublication: (id: string, p: Partial<Publication>) => void
  deletePublication: (id: string) => void
  addResearcher: (r: Omit<Researcher, 'id'>) => void
  updateResearcher: (id: string, r: Partial<Researcher>) => void
  deleteResearcher: (id: string) => void
  addInstitution: (i: Omit<Institution, 'id'>) => void
  updateInstitution: (id: string, i: Partial<Institution>) => void
  deleteInstitution: (id: string) => void
  addProject: (p: Omit<Project, 'id'>) => void
  updateProject: (id: string, p: Partial<Project>) => void
  deleteProject: (id: string) => void
  addConference: (c: Omit<Conference, 'id'>) => void
  updateConference: (id: string, c: Partial<Conference>) => void
  deleteConference: (id: string) => void
  updateReview: (id: string, r: Partial<Review>) => void
  updateEvent: (id: string, e: Partial<Event>) => void
  addUser: (u: Omit<User, 'id'>) => void
  updateUser: (id: string, u: Partial<User>) => void
  deleteUser: (id: string) => void
  addDepartment: (d: Omit<Department, 'id'>) => void
  updateDepartment: (id: string, d: Partial<Department>) => void
  deleteDepartment: (id: string) => void
  markNotificationRead: (id: string) => void
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
  const [publications, setPublications] = useState(initialPublications)
  const [researchers, setResearchers] = useState(initialResearchers)
  const [institutions, setInstitutions] = useState(initialInstitutions)
  const [projects, setProjects] = useState(initialProjects)
  const [conferences, setConferences] = useState(initialConferences)
  const [reviews, setReviews] = useState(initialReviews)
  const [events, setEvents] = useState(initialEvents)
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs)
  const [departments, setDepartments] = useState(initialDepartments)
  const [users, setUsers] = useState(initialUsers)
  const [citations, setCitations] = useState(initialCitations)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => {
    try { localStorage.setItem('nexora-dark', String(darkMode)) } catch {}
  }, [darkMode])

  const login = useCallback((role: string) => {
    const roleUsers: Record<string, CurrentUser> = {
      researcher: { id: 'u1', name: 'Dr. Sarah Chen', email: 'sarah.chen@mit.edu', role: 'Researcher', institution: 'MIT', initials: 'SC', color: '#2563EB' },
      'institution admin': { id: 'u2', name: 'Prof. James Wilson', email: 'j.wilson@stanford.edu', role: 'Institution Admin', institution: 'Stanford University', initials: 'JW', color: '#7C3AED' },
      reviewer: { id: 'u3', name: 'Dr. Maria Rodriguez', email: 'm.rodriguez@ethz.ch', role: 'Reviewer', institution: 'ETH Zürich', initials: 'MR', color: '#14B8A6' },
      'system admin': { id: 'u4', name: 'Alex Thompson', email: 'a.thompson@scientific.app', role: 'System Admin', institution: 'Scientific Platform', initials: 'AT', color: '#F59E0B' },
    }
    const normalizedRole = role.toLowerCase()
    setUser(roleUsers[normalizedRole] || roleUsers['researcher'])
  }, [])

  const logout = useCallback(() => setUser(null), [])
  const toggleDark = useCallback(() => setDarkMode(d => !d), [])
  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const genId = () => Math.random().toString(36).slice(2, 10)

  // CRUD helpers
  const addPublication = useCallback((p: Omit<Publication, 'id'>) => setPublications(prev => [...prev, { ...p, id: genId() }]), [])
  const updatePublication = useCallback((id: string, p: Partial<Publication>) => setPublications(prev => prev.map(x => x.id === id ? { ...x, ...p } : x)), [])
  const deletePublication = useCallback((id: string) => setPublications(prev => prev.filter(x => x.id !== id)), [])

  const addResearcher = useCallback((r: Omit<Researcher, 'id'>) => setResearchers(prev => [...prev, { ...r, id: genId() }]), [])
  const updateResearcher = useCallback((id: string, r: Partial<Researcher>) => setResearchers(prev => prev.map(x => x.id === id ? { ...x, ...r } : x)), [])
  const deleteResearcher = useCallback((id: string) => setResearchers(prev => prev.filter(x => x.id !== id)), [])

  const addInstitution = useCallback((i: Omit<Institution, 'id'>) => setInstitutions(prev => [...prev, { ...i, id: genId() }]), [])
  const updateInstitution = useCallback((id: string, i: Partial<Institution>) => setInstitutions(prev => prev.map(x => x.id === id ? { ...x, ...i } : x)), [])
  const deleteInstitution = useCallback((id: string) => setInstitutions(prev => prev.filter(x => x.id !== id)), [])

  const addProject = useCallback((p: Omit<Project, 'id'>) => setProjects(prev => [...prev, { ...p, id: genId() }]), [])
  const updateProject = useCallback((id: string, p: Partial<Project>) => setProjects(prev => prev.map(x => x.id === id ? { ...x, ...p } : x)), [])
  const deleteProject = useCallback((id: string) => setProjects(prev => prev.filter(x => x.id !== id)), [])

  const addConference = useCallback((c: Omit<Conference, 'id'>) => setConferences(prev => [...prev, { ...c, id: genId() }]), [])
  const updateConference = useCallback((id: string, c: Partial<Conference>) => setConferences(prev => prev.map(x => x.id === id ? { ...x, ...c } : x)), [])
  const deleteConference = useCallback((id: string) => setConferences(prev => prev.filter(x => x.id !== id)), [])

  const updateReview = useCallback((id: string, r: Partial<Review>) => setReviews(prev => prev.map(x => x.id === id ? { ...x, ...r } : x)), [])
  const updateEvent = useCallback((id: string, e: Partial<Event>) => setEvents(prev => prev.map(x => x.id === id ? { ...x, ...e } : x)), [])

  const addUser = useCallback((u: Omit<User, 'id'>) => setUsers(prev => [...prev, { ...u, id: genId() }]), [])
  const updateUser = useCallback((id: string, u: Partial<User>) => setUsers(prev => prev.map(x => x.id === id ? { ...x, ...u } : x)), [])
  const deleteUser = useCallback((id: string) => setUsers(prev => prev.filter(x => x.id !== id)), [])

  const addDepartment = useCallback((d: Omit<Department, 'id'>) => setDepartments(prev => [...prev, { ...d, id: genId() }]), [])
  const updateDepartment = useCallback((id: string, d: Partial<Department>) => setDepartments(prev => prev.map(x => x.id === id ? { ...x, ...d } : x)), [])
  const deleteDepartment = useCallback((id: string) => setDepartments(prev => prev.filter(x => x.id !== id)), [])

  const markNotificationRead = useCallback((id: string) => setNotifications(prev => prev.map(x => x.id === id ? { ...x, read: true } : x)), [])

  // Suppress unused state setter warnings for read-only collections
  void setCitations

  return (
    <AppContext.Provider value={{
      user, darkMode, publications, researchers, institutions, projects,
      conferences, reviews, events, auditLogs, departments, users, citations, notifications, toast,
      login, logout, toggleDark, showToast,
      addPublication, updatePublication, deletePublication,
      addResearcher, updateResearcher, deleteResearcher,
      addInstitution, updateInstitution, deleteInstitution,
      addProject, updateProject, deleteProject,
      addConference, updateConference, deleteConference,
      updateReview, updateEvent,
      addUser, updateUser, deleteUser,
      addDepartment, updateDepartment, deleteDepartment,
      markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext
