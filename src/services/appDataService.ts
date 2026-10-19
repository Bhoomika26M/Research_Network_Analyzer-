/**
 * API-backed data layer for the shell pages (the `App.*` view models in
 * `src/types/app.ts`). Pages load lists through `useAsyncData(() =>
 * appDataService.list…())`, so every list comes from the FastAPI backend and
 * every mutation round-trips to the API before the page reloads.
 *
 * The view-model adapters were moved here from AppContext so there is exactly
 * one place that converts the front-end (`types/index`) objects into view
 * models; AppContext re-exports them for its own state.
 */
import { apiClient } from './apiClient';
import { mockDataStore } from './dataStore';
import { authService } from './authService';
import {
  isUuid,
  mapConference,
  mapInstitution,
  mapProject,
  mapPublication,
  mapResearcher,
  researcherCreatePayload,
} from './mappers';
import type {
  AuditLog as FAuditLog,
  Citation as FCitation,
  Conference as FConference,
  Institution as FInstitution,
  Project as FProject,
  Publication as FPublication,
  PublicationStatus,
  Researcher as FResearcher,
  Review as FReview,
} from '../types';
import type * as App from '../types/app';

// ---- front-end type -> view-model adapters (moved from AppContext) --------

const COLORS = ['#2563EB', '#7C3AED', '#14B8A6', '#F59E0B', '#EF4444', '#10B981'];
const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h);
};
const initialsOf = (name: string) =>
  name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

const PUB_TYPE: Record<string, App.Publication['type']> = {
  Journal: 'Journal', Conference: 'Conference', Book: 'Book Chapter',
  Patent: 'Preprint', 'Technical Report': 'Preprint',
};
const PUB_STATUS: Record<string, App.Publication['status']> = {
  Published: 'Published', Submitted: 'Submitted', Draft: 'Draft', Archived: 'Under Review',
};

export const toPublication = (p: FPublication): App.Publication => ({
  id: p.id, title: p.title, authors: p.authors.map((a) => a.name), journal: p.venue,
  year: p.year, status: PUB_STATUS[p.status] ?? 'Draft', citations: p.citations, doi: p.doi,
  abstract: p.abstract, keywords: p.keywords,  type: PUB_TYPE[p.type] ?? 'Journal',
});

const REVIEW_DECISION_LABEL: Record<string, string> = {
  approved: 'Accept',
  changes_requested: 'Revision',
  rejected: 'Reject',
};

export const toReview = (r: FReview): App.Review => ({
  id: r.id,
  paperId: r.publicationId,
  paperTitle: r.publicationTitle,
  reviewer: r.reviewerName || 'You',
  assignedDate: r.createdAt,
  dueDate: r.updatedAt || r.createdAt,
  status: r.status === 'pending' ? 'Pending' : 'Completed',
  priority: 'Medium',
  score: null,
  feedback:
    r.status === 'pending'
      ? null
      : `Recommendation: ${REVIEW_DECISION_LABEL[r.status] ?? r.status}${r.comments ? `\n\n${r.comments}` : ''}`,
  journal: '',
});

export const toResearcher = (r: FResearcher): App.Researcher => ({
  id: r.id, name: r.name, initials: initialsOf(r.name), color: COLORS[hash(r.id) % COLORS.length],
  role: r.title, dept: r.department, institution: r.institutionName, interests: r.researchInterests,
  hIndex: r.hIndex, publications: r.publicationsCount, collaborators: 0, citations: r.citationsCount,
  email: r.email, orcid: r.orcid ?? '',
  status: r.isActive === false ? 'Inactive' : 'Active',
  joinDate: r.joinedYear ? `${r.joinedYear}-01-01` : '',
});

export const toInstitution = (i: FInstitution): App.Institution => ({
  id: i.id, name: i.name, country: i.country,
  type:
    i.type === 'Research Institute' || i.type === 'Research Lab'
      ? 'Research Lab'
      : i.type === 'Government Lab' || i.type === 'Government'
        ? 'Government'
        : 'University',
  researchers: i.researcherCount, projects: i.activeProjectsCount, budget: i.budget,
  status: i.isActive === false ? 'Inactive' : 'Active',
  established: new Date().getFullYear(), website: i.website,
});

const PROJECT_STATUS: Record<string, App.Project['status']> = {
  Active: 'On Track', Planning: 'On Track', Completed: 'Ahead', 'On Hold': 'At Risk',
};
export const toProject = (p: FProject): App.Project => ({
  id: p.id, name: p.title, desc: p.description, lead: p.leadResearcherName,
  institution: p.institutionName, members: p.teamMembers.map((m) => m.name),
  progress: p.status === 'Completed' ? 100 : p.status === 'Planning' ? 10 : 55,
  status: PROJECT_STATUS[p.status] ?? 'On Track', start: p.startDate, end: p.endDate,
  budget: p.budget, milestones: [],
});

/** Derive a conference status from its dates instead of always saying "Upcoming". */
function conferenceStatus(c: FConference): App.Conference['status'] {
  const today = new Date().toISOString().slice(0, 10);
  if (c.endDate && c.endDate < today) return 'Closed';
  if (!c.submissionDeadline) return 'Upcoming';
  return c.submissionDeadline < today ? 'Closed' : 'Open';
}

export const toConference = (c: FConference): App.Conference => ({
  id: c.id, name: c.title, location: c.location, date: c.startDate, deadline: c.submissionDeadline,
  status: conferenceStatus(c), submissions: c.acceptedPapersCount,
  attendees: c.registeredResearchers.length, website: c.website, topics: c.tracks,
});

export const toCitation = (c: FCitation): App.Citation => ({
  id: c.id, paperTitle: c.publicationTitle, citedBy: c.citingTitle, journal: c.citingVenue,
  year: c.citingYear, authors: c.citingAuthors ? c.citingAuthors.split(', ') : [], count: 1,
});

export const toAuditLog = (a: FAuditLog): App.AuditLog => ({
  id: a.id, user: a.user, action: a.action, resource: a.category, timestamp: a.timestamp,
  type: a.status === 'Success' ? 'Info' : 'Warning', ip: a.ipAddress, details: a.details,
});

export const toDepartment = (
  raw: {
    id: string; name: string; institution_id: string;
    head_name?: string | null; budget?: number | string | null;
  },
  instName: string
): App.Department => ({
  id: raw.id, name: raw.name, head: raw.head_name ?? '', institution: instName,
  researchers: 0, projects: 0, budget: Number(raw.budget ?? 0), publications: 0,
});

export const toUser = (raw: {
  id: string; email: string; full_name: string; role: string; is_active: boolean; created_at?: string;
}): App.User => {
  const roles: Record<string, App.User['role']> = {
    researcher: 'Researcher', institution_admin: 'Institution Admin',
    reviewer: 'Reviewer', system_admin: 'System Admin',
  };
  // Roles that self-register inactive are "pending approval" until a system
  // admin activates them; other inactive accounts are deactivated.
  const pending = !raw.is_active && (raw.role === 'institution_admin' || raw.role === 'reviewer');
  return {
    id: raw.id, name: raw.full_name, email: raw.email, role: roles[raw.role] ?? 'Researcher',
    institution: '', status: raw.is_active ? 'Active' : pending ? 'Pending' : 'Inactive',
    lastLogin: '', joinDate: raw.created_at ? raw.created_at.slice(0, 10) : '', permissions: [],
  };
};

// ---- view-model -> API enum maps ------------------------------------------

const APP_PUB_TYPE_TO_API: Record<App.Publication['type'], string> = {
  Journal: 'journal', Conference: 'conference', 'Book Chapter': 'book', Preprint: 'technical_report',
};
const APP_PUB_STATUS_TO_API: Record<App.Publication['status'], PublicationStatus> = {
  Published: 'Published', Submitted: 'Submitted', Draft: 'Draft', 'Under Review': 'Submitted',
};
const APP_PROJECT_STATUS_TO_API: Record<App.Project['status'], string> = {
  'On Track': 'active', Ahead: 'completed', 'At Risk': 'cancelled', Delayed: 'cancelled',
};
const APP_USER_ROLE_TO_API: Record<App.User['role'], string> = {
  Researcher: 'researcher', 'Institution Admin': 'institution_admin',
  Reviewer: 'reviewer', 'System Admin': 'system_admin',
};

const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

/** Resolve an institution name (form value) to its UUID; null when unknown. */
async function resolveInstitutionId(name?: string): Promise<string | null> {
  if (!name) return null;
  if (isUuid(name)) return name;
  const institutions = await mockDataStore.getInstitutions();
  return institutions.find((i) => i.name.toLowerCase() === name.toLowerCase())?.id ?? null;
}

export const appDataService = {
  // ---- Lists (for useAsyncData) -------------------------------------------

  listPublications(): Promise<App.Publication[]> {
    return mockDataStore.getPublications().then((rows) => rows.map(toPublication));
  },

  listResearchers(): Promise<App.Researcher[]> {
    return mockDataStore.getResearchers().then((rows) => rows.map(toResearcher));
  },

  listInstitutions(): Promise<App.Institution[]> {
    return mockDataStore.getInstitutions().then((rows) => rows.map(toInstitution));
  },

  listProjects(): Promise<App.Project[]> {
    return mockDataStore.getProjects().then((rows) => rows.map(toProject));
  },

  listConferences(): Promise<App.Conference[]> {
    return mockDataStore.getConferences().then((rows) => rows.map(toConference));
  },

  listCitations(): Promise<App.Citation[]> {
    return mockDataStore.getCitations().then((rows) => rows.map(toCitation));
  },

  listAuditLogs(): Promise<App.AuditLog[]> {
    return mockDataStore.getAuditLogs().then((rows) => rows.map(toAuditLog));
  },

  async listDepartments(): Promise<App.Department[]> {
    const [departments, institutions] = await Promise.all([
      mockDataStore.getDepartments(),
      mockDataStore.getInstitutions(),
    ]);
    const nameById = new Map(institutions.map((i) => [i.id, i.name]));
    return departments.map((d) => toDepartment(d, nameById.get(d.institution_id) ?? ''));
  },

  async listUsers(): Promise<App.User[]> {
    const { data } = await apiClient.get<{ items: Parameters<typeof toUser>[0][] }>('/users', {
      params: { limit: 100 },
    });
    return data.items.map(toUser);
  },

  /**
   * Peer reviews derived from the API: every publication waiting on review
   * (Submitted / Under Review) becomes an open review assignment. The backend
   * has no separate reviews table, so this is the real review queue.
   */
  async listReviews(): Promise<App.Review[]> {
    const publications = await this.listPublications();
    const priorities: App.Review['priority'][] = ['High', 'Medium', 'Low'];
    return publications
      .filter((p) => p.status === 'Submitted' || p.status === 'Under Review')
      .map((p, index) => ({
        id: `review-${p.id}`,
        paperId: p.id,
        paperTitle: p.title,
        reviewer: 'You',
        assignedDate: plusDays(-index),
        dueDate: plusDays(7 - index),
        status: 'Pending' as const,
        priority: priorities[index % priorities.length],
        score: null,
        feedback: null,
        journal: p.journal,
      }));
  },

  /**
   * Events derived from the API: each conference doubles as an attendable
   * event (the backend has no separate events table).
   */
  async listEvents(): Promise<App.Event[]> {
    const conferences = await this.listConferences();
    return conferences.map((c) => ({
      id: c.id,
      title: c.name,
      type: 'Conference' as const,
      date: c.date,
      location: c.location,
      attendees: c.attendees,
      maxAttendees: Math.max(c.attendees + 50, 100),
      registered: false,
      description: c.topics.length
        ? `Tracks: ${c.topics.join(', ')}`
        : 'Research conference — see the website for the full programme.',
    }));
  },

  // ---- Publications -------------------------------------------------------

  async createPublication(p: Omit<App.Publication, 'id'>): Promise<App.Publication> {
    // Free-text author names are only sent when they match a real researcher
    // profile (the backend keys co-authors by researcher id).
    let coAuthors: { researcher_id: string; author_order: number; is_corresponding: boolean }[] = [];
    if (p.authors.length > 0) {
      try {
        const researchers = await mockDataStore.getResearchers();
        coAuthors = p.authors
          .map((name) =>
            researchers.find((r) => r.name.toLowerCase() === name.toLowerCase())
          )
          .filter((r): r is NonNullable<typeof r> => Boolean(r))
          .map((r, index) => ({
            researcher_id: r.id,
            author_order: index + 1,
            is_corresponding: index === 0,
          }));
      } catch {
        coAuthors = [];
      }
    }
    const { data } = await apiClient.post('/publications', {
      title: p.title,
      type: APP_PUB_TYPE_TO_API[p.type] ?? 'journal',
      year: p.year,
      abstract: p.abstract || null,
      venue: p.journal || null,
      doi: p.doi || null,
      co_authors: coAuthors,
    });
    if (p.status && p.status !== 'Draft') {
      await apiClient.patch(`/publications/${data.id}/status`, {
        status: APP_PUB_STATUS_TO_API[p.status],
      });
    }
    return toPublication(mapPublication(data));
  },

  async updatePublication(id: string, patch: Partial<App.Publication>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.type !== undefined) payload.type = APP_PUB_TYPE_TO_API[patch.type];
    if (patch.year !== undefined) payload.year = patch.year;
    if (patch.abstract !== undefined) payload.abstract = patch.abstract;
    if (patch.journal !== undefined) payload.venue = patch.journal;
    if (patch.doi !== undefined) payload.doi = patch.doi;
    if (Object.keys(payload).length > 0) {
      await apiClient.patch(`/publications/${id}`, payload);
    }
    if (patch.status !== undefined) {
      await apiClient.patch(`/publications/${id}/status`, {
        status: APP_PUB_STATUS_TO_API[patch.status],
      });
    }
  },

  async deletePublication(id: string): Promise<void> {
    await apiClient.delete(`/publications/${id}`);
  },

  // ---- Researchers --------------------------------------------------------

  async createResearcher(r: Omit<App.Researcher, 'id'>): Promise<App.Researcher> {
    // "Invite" semantics: best-effort create the login account first so the
    // profile can be linked to it. Only a system_admin may link profiles, so
    // fall back to an unlinked profile when the link is rejected.
    let userId: string | undefined;
    if (r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
      try {
        const account = await authService.register({
          email: r.email,
          password: 'TempPass123!',
          fullName: r.name,
          role: 'Researcher',
        });
        userId = account.id;
      } catch {
        // Account already exists (or registration is unavailable) — the
        // profile invite still goes ahead.
        userId = undefined;
      }
    }
    const payload = {
      ...researcherCreatePayload({
        name: r.name,
        title: r.role || undefined,
        orcid: r.orcid || undefined,
      }),
      user_id: userId,
    };
    try {
      const { data } = await apiClient.post('/researchers', payload);
      return toResearcher(mapResearcher(data));
    } catch (err) {
      if (!userId) throw err;
      const { data } = await apiClient.post('/researchers', {
        ...payload,
        user_id: undefined,
      });
      return toResearcher(mapResearcher(data));
    }
  },

  async updateResearcher(id: string, patch: Partial<App.Researcher>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.name) {
      const parts = patch.name.trim().split(/\s+/);
      payload.first_name = parts[0] || 'Unknown';
      payload.last_name = parts.slice(1).join(' ') || '.';
    }
    if (patch.role !== undefined) payload.title = patch.role || null;
    if (patch.orcid && /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(patch.orcid)) {
      payload.orcid = patch.orcid;
    }
    if (patch.dept) {
      const departments = await this.listDepartments();
      const department = departments.find(
        (d) => d.name.toLowerCase() === patch.dept!.toLowerCase()
      );
      if (department) payload.department_id = department.id;
    }
    if (Object.keys(payload).length > 0) {
      await apiClient.patch(`/researchers/${id}`, payload);
    }
    // Active/Inactive toggles the linked login account (user activate /
    // deactivate endpoints).
    if (patch.status !== undefined) {
      const { data: profile } = await apiClient.get<{ user_id?: string | null }>(
        `/researchers/${id}`
      );
      if (profile.user_id) {
        if (patch.status === 'Active') {
          await apiClient.post(`/users/${profile.user_id}/activate`);
        } else {
          await apiClient.post(`/users/${profile.user_id}/deactivate`);
        }
      }
    }
    // Research interests live on their own endpoints: sync the diff.
    if (patch.interests !== undefined) {
      const want = patch.interests;
      const { data: profile } = await apiClient.get<{ interests?: string[] }>(
        `/researchers/${id}`
      );
      const current = profile.interests ?? [];
      for (const name of current.filter((value) => !want.includes(value))) {
        await apiClient.delete(`/researchers/${id}/interests/${encodeURIComponent(name)}`);
      }
      for (const name of want.filter((value) => !current.includes(value))) {
        await apiClient.post(`/researchers/${id}/interests`, { name });
      }
    }
  },

  async deleteResearcher(id: string): Promise<void> {
    await apiClient.delete(`/researchers/${id}`);
  },

  // ---- Institutions -------------------------------------------------------

  async createInstitution(i: Omit<App.Institution, 'id'>): Promise<App.Institution> {
    const { data } = await apiClient.post('/institutions', {
      name: i.name,
      country: i.country || null,
      city: null,
      website: i.website || null,
      type: i.type || null,
    });
    return toInstitution(mapInstitution(data));
  },

  async updateInstitution(id: string, patch: Partial<App.Institution>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.country !== undefined) payload.country = patch.country || null;
    if (patch.website !== undefined) payload.website = patch.website || null;
    if (patch.type !== undefined) payload.type = patch.type;
    if (Object.keys(payload).length > 0) {
      await apiClient.patch(`/institutions/${id}`, payload);
    }
    if (patch.status !== undefined) {
      await mockDataStore.updateInstitutionStatus(id, patch.status === 'Active');
    }
  },

  async deleteInstitution(id: string): Promise<void> {
    await apiClient.delete(`/institutions/${id}`);
  },

  // ---- Projects -----------------------------------------------------------

  async createProject(p: Omit<App.Project, 'id'>): Promise<App.Project> {
    const { data } = await apiClient.post('/projects', {
      title: p.name,
      description: p.desc || null,
      budget: p.budget || null,
      start_date: p.start || today(),
      end_date: p.end || null,
      status: APP_PROJECT_STATUS_TO_API[p.status] ?? 'planned',
      institution_id: await resolveInstitutionId(p.institution),
    });
    return toProject(mapProject(data));
  },

  async updateProject(id: string, patch: Partial<App.Project>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.title = patch.name;
    if (patch.desc !== undefined) payload.description = patch.desc || null;
    if (patch.budget !== undefined) payload.budget = patch.budget || null;
    if (patch.start !== undefined) payload.start_date = patch.start || today();
    if (patch.end !== undefined) payload.end_date = patch.end || null;
    if (patch.status !== undefined) {
      payload.status = APP_PROJECT_STATUS_TO_API[patch.status] ?? 'planned';
    }
    if (patch.institution !== undefined) {
      payload.institution_id = await resolveInstitutionId(patch.institution);
    }
    if (Object.keys(payload).length > 0) {
      await apiClient.patch(`/projects/${id}`, payload);
    }
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  // ---- Conferences --------------------------------------------------------

  async createConference(c: Omit<App.Conference, 'id'>): Promise<App.Conference> {
    const { data } = await apiClient.post('/conferences', {
      name: c.name,
      location: c.location || null,
      start_date: c.date || today(),
      end_date: null,
      website: c.website || null,
      submission_deadline: c.deadline || null,
      topics: c.topics.length ? c.topics.join(', ') : null,
    });
    return toConference(mapConference(data));
  },

  async updateConference(id: string, patch: Partial<App.Conference>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.location !== undefined) payload.location = patch.location || null;
    if (patch.date !== undefined) payload.start_date = patch.date || today();
    if (patch.website !== undefined) payload.website = patch.website || null;
    if (patch.deadline !== undefined) payload.submission_deadline = patch.deadline || null;
    if (patch.topics !== undefined) {
      payload.topics = patch.topics.length ? patch.topics.join(', ') : null;
    }
    if (Object.keys(payload).length > 0) {
      await apiClient.patch(`/conferences/${id}`, payload);
    }
  },

  async deleteConference(id: string): Promise<void> {
    await apiClient.delete(`/conferences/${id}`);
  },

  /** Register the signed-in researcher for a conference (server resolves the profile). */
  async registerForConference(conferenceId: string): Promise<void> {
    await mockDataStore.registerForConference(conferenceId, '', '');
  },

  // ---- Departments --------------------------------------------------------

  async createDepartment(d: Omit<App.Department, 'id'>): Promise<App.Department> {
    const institutionId = await resolveInstitutionId(d.institution);
    if (!institutionId) {
      throw new Error('Institution not found — cannot create the department');
    }
    const { data } = await apiClient.post('/departments', {
      institution_id: institutionId,
      name: d.name,
      description: null,
      head_name: d.head || null,
      budget: d.budget || null,
    });
    return toDepartment(data, d.institution);
  },

  async updateDepartment(id: string, patch: Partial<App.Department>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.head !== undefined) payload.head_name = patch.head || null;
    if (patch.budget !== undefined) payload.budget = patch.budget || null;
    if (Object.keys(payload).length > 0) {
      await apiClient.patch(`/departments/${id}`, payload);
    }
  },

  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  },

  // ---- Users --------------------------------------------------------------

  /**
   * Create an account through /auth/register (system_admin token required for
   * non-researcher roles). The generated password is a placeholder — there is
   * no invite flow in the backend yet.
   */
  async createUser(u: Omit<App.User, 'id'>): Promise<App.User> {
    const created = await authService.register({
      email: u.email,
      password: 'TempPass123!',
      fullName: u.name,
      // authService.register maps the UI label ("System Admin") to the API slug.
      role: u.role,
    });
    return {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      institution: '',
      status: 'Active',
      lastLogin: '',
      joinDate: '',
      permissions: [],
    };
  },

  async updateUser(id: string, patch: Partial<App.User>): Promise<void> {
    if (patch.status !== undefined) {
      if (patch.status === 'Active') await apiClient.post(`/users/${id}/activate`);
      else if (patch.status === 'Inactive') await apiClient.post(`/users/${id}/deactivate`);
    }
    if (patch.role !== undefined) {
      await apiClient.patch(`/users/${id}/role`, { role: APP_USER_ROLE_TO_API[patch.role] });
    }
    // Name / email live on the plain PATCH /users/{id} endpoint.
    const profile: Record<string, string> = {};
    if (patch.name !== undefined) profile.full_name = patch.name;
    if (patch.email !== undefined) profile.email = patch.email;
    if (Object.keys(profile).length > 0) {
      await apiClient.patch(`/users/${id}`, profile);
    }
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // ---- Reviews / events ---------------------------------------------------

  /** Advance a derived review: completing it publishes the underlying paper. */
  async updateReview(id: string, patch: Partial<App.Review>): Promise<void> {
    if (!patch.status) return;
    const paperId = id.startsWith('review-') ? id.slice('review-'.length) : id;
    await mockDataStore.updatePublicationStatus(
      paperId,
      APP_PUB_STATUS_TO_API[
        patch.status === 'Completed' ? 'Published' : 'Submitted'
      ]
    );
  },

  /** Register for an event (= its conference). */
  async updateEvent(id: string, patch: Partial<App.Event>): Promise<void> {
    if (patch.registered) await this.registerForConference(id);
  },
};

export default appDataService;
