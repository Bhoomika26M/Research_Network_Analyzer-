export interface Researcher {
  id: number
  name: string
  initials: string
  email: string
  institution: string
  department: string
  role: string
  bio: string
  skills: string[]
  interests: string[]
  publications: number[]
  h_index: number
  citations_total: number
}

export interface Publication {
  id: number
  title: string
  authors: string[]
  abstract: string
  journal: string
  year: number
  type: 'Journal' | 'Conference' | 'Book' | 'Patent' | 'Report'
  status: 'Published' | 'Under Review' | 'Rejected' | 'Draft'
  doi: string | null
  citations: number
  pages?: string
  volume?: string
  issue?: string
}

export interface Project {
  id: number
  title: string
  description: string
  status: 'Active' | 'Completed' | 'Paused'
  pi: string
  members: number[]
  startDate: string
  endDate?: string
  tags: string[]
}

export interface Conference {
  id: number
  name: string
  shortName: string
  location: string
  startDate: string
  endDate: string
  type: 'International' | 'Workshop' | 'Symposium'
  website: string
  presentations: number[]
}

export interface Citation {
  id: number
  sourcePubId: number
  targetPubId: number
  year: number
  context: string
}

export interface AuditLog {
  id: number
  actor: string
  action: string
  target: string
  timestamp: string
  ip: string
  category: 'Auth' | 'Data' | 'Admin' | 'Export'
}

/** The logged-in user as held by the session (all fields optional so the
 *  offline demo fallback user, which only carries name/email/role, works). */
export interface SessionUser {
  id?: number
  name?: string
  initials?: string
  email?: string
  role?: string
  institution?: string
  department?: string
  bio?: string
  skills?: string[]
  interests?: string[]
  h_index?: number
  citations_total?: number
  /** Permissions granted to the account's role, as returned by the backend. */
  permissions?: string[]
}
