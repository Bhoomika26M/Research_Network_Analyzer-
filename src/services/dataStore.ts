/**
 * API-backed replacement for the old in-memory MockDataStore.
 *
 * It keeps the exact same public method surface (and the same read-only
 * ``researchers`` / ``institutions`` / ``publications`` arrays used by the
 * global search), so the existing pages and service modules keep working
 * unchanged — only the implementation moved from mock data to the FastAPI
 * backend.
 */
import { API_BASE_URL, ApiPage, apiClient } from './apiClient';
import type { RawUser } from './authService';
import {
  RawAuditLog,
  RawCitation,
  RawConference,
  RawDepartment,
  RawInstitution,
  RawNetworkGraph,
  RawProject,
  RawPublication,
  RawResearcher,
  RawReview,
  isUuid,
  mapAuditLog,
  mapCitation,
  mapCollaborationGraph,
  mapConference,
  mapInstitution,
  mapProject,
  mapPublication,
  mapResearcher,
  mapReview,
  publicationCreatePayload,
  PUB_STATUS_TO_API,
  researcherCreatePayload,
} from './mappers';
import {
  AuditLog,
  AuthorRef,
  Citation,
  CollaborationGraphData,
  Conference,
  Institution,
  Project,
  Publication,
  PublicationStatus,
  PublicationType,
  Researcher,
  Review,
  ReviewStatus,
} from '../types';

const LIST_LIMIT = 100;

/** "System Admin" / "system-admin" -> "system_admin"; unknown values -> undefined. */
function userRoleSlug(role?: string): string | undefined {
  if (!role) return undefined;
  const slug = role.trim().toLowerCase().replace(/[\s-]+/g, '_');
  return ['researcher', 'institution_admin', 'reviewer', 'system_admin'].includes(slug)
    ? slug
    : undefined;
}

async function fetchAll<T>(path: string, params?: Record<string, unknown>): Promise<T[]> {
  const { data } = await apiClient.get<ApiPage<T>>(path, {
    params: { limit: LIST_LIMIT, ...params },
  });
  return data.items;
}

class ApiDataStore {
  // Read-only caches used by the global search in TopBar.
  researchers: Researcher[] = [];
  institutions: Institution[] = [];
  publications: Publication[] = [];
  projects: Project[] = [];
  conferences: Conference[] = [];
  citations: Citation[] = [];
  auditLogs: AuditLog[] = [];

  /**
   * Warm the search caches (called after a successful login). Best-effort.
   *
   * Only the still-mounted lookup routes are primed: publications belong to a
   * removed module, so calling its endpoint would fail on every login.
   */
  async prime(): Promise<void> {
    await Promise.allSettled([
      this.getResearchers().then((rows) => (this.researchers = rows)),
      this.getInstitutions().then((rows) => (this.institutions = rows)),
    ]);
  }

  // ---- Researchers ---------------------------------------------------------
  async getResearchers(): Promise<Researcher[]> {
    const rows = await fetchAll<RawResearcher>('/researchers');
    this.researchers = rows.map(mapResearcher);
    return this.researchers;
  }

  async getResearcherById(id: string): Promise<Researcher | undefined> {
    const { data } = await apiClient.get<RawResearcher>(`/researchers/${id}`);
    return mapResearcher(data);
  }

  async createResearcher(input: Omit<Researcher, 'id'>): Promise<Researcher> {
    const { data } = await apiClient.post<RawResearcher>('/researchers', {
      ...researcherCreatePayload(input),
      department_id: isUuid(input.institutionId) ? input.institutionId : undefined,
    });
    return mapResearcher(data);
  }

  // ---- Institutions --------------------------------------------------------
  async getInstitutions(): Promise<Institution[]> {
    const rows = await fetchAll<RawInstitution>('/institutions');
    this.institutions = rows.map(mapInstitution);
    return this.institutions;
  }

  async getInstitutionById(id: string): Promise<Institution | undefined> {
    const { data } = await apiClient.get<RawInstitution>(`/institutions/${id}`);
    return mapInstitution(data);
  }

  async createInstitution(input: Omit<Institution, 'id'>): Promise<Institution> {
    const { data } = await apiClient.post<RawInstitution>('/institutions', {
      name: input.name,
      country: input.country || null,
      city: input.city || null,
      website: input.website || null,
      type: input.type || null,
      is_active: input.isActive ?? true,
    });
    return mapInstitution(data);
  }

  async updateInstitution(id: string, updates: Partial<Institution>): Promise<Institution> {
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    const { data } = await apiClient.patch<RawInstitution>(`/institutions/${id}`, payload);
    return mapInstitution(data);
  }

  /** Activate / deactivate an institution (system_admin only). */
  async updateInstitutionStatus(id: string, isActive: boolean): Promise<Institution> {
    const { data } = await apiClient.patch<RawInstitution>(`/institutions/${id}/status`, {
      is_active: isActive,
    });
    return mapInstitution(data);
  }

  // ---- Publications --------------------------------------------------------
  async getPublications(): Promise<Publication[]> {
    const rows = await fetchAll<RawPublication>('/publications');
    this.publications = rows.map(mapPublication);
    return this.publications;
  }

  async getPublicationById(id: string): Promise<Publication | undefined> {
    const { data } = await apiClient.get<RawPublication>(`/publications/${id}`);
    return mapPublication(data);
  }

  async createPublication(
    input: Omit<Publication, 'id' | 'doi' | 'history'> & { doi?: string; file?: File }
  ): Promise<Publication> {
    const { data } = await apiClient.post<RawPublication>(
      '/publications',
      publicationCreatePayload({
        title: input.title,
        abstract: input.abstract,
        type: input.type as PublicationType,
        venue: input.venue,
        year: input.year,
        doi: input.doi,
        authors: input.authors as AuthorRef[],
      })
    );
    if (input.file) {
      await this.uploadPublicationFile(data.id, input.file);
    }
    return mapPublication(data);
  }

  async uploadPublicationFile(id: string, file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await apiClient.post(`/publications/${id}/file`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updatePublicationStatus(
    id: string,
    status: PublicationStatus,
    _user?: string,
    _notes?: string
  ): Promise<Publication> {
    const { data } = await apiClient.patch<RawPublication>(`/publications/${id}/status`, {
      status: PUB_STATUS_TO_API[status],
    });
    return mapPublication(data);
  }

  publicationFileUrl(id: string): string {
    return `${API_BASE_URL}/publications/${id}/file`;
  }

  // ---- Projects ------------------------------------------------------------
  async getProjects(): Promise<Project[]> {
    const rows = await fetchAll<RawProject>('/projects');
    this.projects = rows.map(mapProject);
    return this.projects;
  }

  async createProject(input: Omit<Project, 'id' | 'code'>): Promise<Project> {
    const { data } = await apiClient.post<RawProject>('/projects', {
      title: input.title,
      description: input.description || null,
      budget: input.budget ?? null,
      start_date: input.startDate,
      end_date: input.endDate || null,
      status: input.status === 'Active' ? 'active' : input.status === 'Completed' ? 'completed' : input.status === 'On Hold' ? 'cancelled' : 'planned',
      institution_id: isUuid(input.institutionId) ? input.institutionId : null,
    });
    return mapProject(data);
  }

  // ---- Conferences ---------------------------------------------------------
  async getConferences(): Promise<Conference[]> {
    const rows = await fetchAll<RawConference>('/conferences');
    this.conferences = rows.map(mapConference);
    return this.conferences;
  }

  async registerForConference(
    confId: string,
    researcherId: string,
    _researcherName: string,
    paperTitle?: string
  ): Promise<Conference> {
    const { data } = await apiClient.post<RawConference>(`/conferences/${confId}/register`, {
      researcher_id: isUuid(researcherId) ? researcherId : null,
      presentation_type: paperTitle ? 'oral' : null,
    });
    const mapped = mapConference(data);
    const index = this.conferences.findIndex((c) => c.id === confId);
    if (index >= 0) this.conferences[index] = mapped;
    return mapped;
  }

  // ---- Citations -----------------------------------------------------------
  async getCitations(): Promise<Citation[]> {
    const rows = await fetchAll<RawCitation>('/citations');
    this.citations = rows.map(mapCitation);
    return this.citations;
  }

  // ---- Collaboration graph -------------------------------------------------
  async getCollaborationGraph(params?: {
    institution_id?: string;
    year_from?: number;
    year_to?: number;
  }): Promise<CollaborationGraphData> {
    const { data } = await apiClient.get<RawNetworkGraph>('/collaboration/graph', { params });
    return mapCollaborationGraph(data);
  }

  // ---- Audit logs ----------------------------------------------------------
  async getAuditLogs(): Promise<AuditLog[]> {
    const { data } = await apiClient.get<ApiPage<RawAuditLog>>('/audit-logs', {
      params: { limit: 200 },
    });
    this.auditLogs = data.items.map(mapAuditLog);
    return this.auditLogs;
  }

  // ---- Departments ---------------------------------------------------------
  async getDepartments(): Promise<RawDepartment[]> {
    return fetchAll<RawDepartment>('/departments');
  }

  // ---- Users (system_admin only) -------------------------------------------
  async getUsers(): Promise<RawUser[]> {
    const { data } = await apiClient.get<{ items: RawUser[] }>('/users', {
      params: { limit: LIST_LIMIT },
    });
    return data.items;
  }

  // ---- Mutations (edit / delete used by the live shell pages) ------------

  async updateResearcher(
    id: string,
    payload: {
      first_name?: string;
      last_name?: string;
      title?: string | null;
      bio?: string | null;
      orcid?: string | null;
      department_id?: string | null;
    }
  ): Promise<Researcher> {
    const { data } = await apiClient.patch<RawResearcher>(`/researchers/${id}`, payload);
    return mapResearcher(data);
  }

  async deleteResearcher(id: string): Promise<void> {
    await apiClient.delete(`/researchers/${id}`);
  }

  async updatePublication(
    id: string,
    payload: {
      title?: string;
      type?: string;
      year?: number;
      abstract?: string | null;
      venue?: string | null;
      doi?: string | null;
    }
  ): Promise<Publication> {
    const { data } = await apiClient.patch<RawPublication>(`/publications/${id}`, payload);
    return mapPublication(data);
  }

  async deletePublication(id: string): Promise<void> {
    await apiClient.delete(`/publications/${id}`);
  }

  async updateProject(
    id: string,
    payload: {
      title?: string;
      description?: string | null;
      budget?: number | null;
      start_date?: string;
      end_date?: string | null;
      status?: string;
      institution_id?: string | null;
    }
  ): Promise<Project> {
    const { data } = await apiClient.patch<RawProject>(`/projects/${id}`, payload);
    return mapProject(data);
  }

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  }

  async createConference(input: {
    name: string;
    location?: string | null;
    start_date: string;
    end_date?: string | null;
    website?: string | null;
    submission_deadline?: string | null;
    topics?: string | null;
  }): Promise<Conference> {
    const { data } = await apiClient.post<RawConference>('/conferences', input);
    return mapConference(data);
  }

  async updateConference(
    id: string,
    payload: {
      name?: string;
      location?: string | null;
      start_date?: string;
      end_date?: string | null;
      website?: string | null;
      submission_deadline?: string | null;
      topics?: string | null;
    }
  ): Promise<Conference> {
    const { data } = await apiClient.patch<RawConference>(`/conferences/${id}`, payload);
    return mapConference(data);
  }

  async deleteConference(id: string): Promise<void> {
    await apiClient.delete(`/conferences/${id}`);
  }

  async createDepartment(input: {
    institution_id: string;
    name: string;
    description?: string | null;
    head_name?: string | null;
    budget?: number | null;
  }): Promise<RawDepartment> {
    const { data } = await apiClient.post<RawDepartment>('/departments', input);
    return data;
  }

  async updateDepartment(
    id: string,
    payload: {
      name?: string;
      description?: string | null;
      head_name?: string | null;
      budget?: number | null;
    }
  ): Promise<RawDepartment> {
    const { data } = await apiClient.patch<RawDepartment>(`/departments/${id}`, payload);
    return data;
  }

  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`);
  }

  async deleteInstitution(id: string): Promise<void> {
    await apiClient.delete(`/institutions/${id}`);
  }

  // ---- Users (system_admin only) -------------------------------------------

  /**
   * Creates a login account via /auth/register (system_admin token required for
   * non-researcher roles). The role is always sent as its API slug — a Title
   * Case label such as "System Admin" would be rejected by the backend enum.
   */
  async createUser(input: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }): Promise<RawUser> {
    const { data } = await apiClient.post<RawUser>('/auth/register', {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      full_name: input.full_name,
      ...(userRoleSlug(input.role) ? { role: userRoleSlug(input.role) } : {}),
    });
    return data;
  }

  /**
   * Updates an account: name/email (PATCH /users/{id}) and/or role
   * (PATCH /users/{id}/role). Returns the latest server copy.
   */
  async updateUser(
    id: string,
    payload: { role?: string; full_name?: string; email?: string }
  ): Promise<RawUser> {
    let updated: RawUser | null = null;
    const slug = userRoleSlug(payload.role);
    if (slug) {
      const { data } = await apiClient.patch<RawUser>(`/users/${id}/role`, { role: slug });
      updated = data;
    }
    const profile: Record<string, string> = {};
    if (payload.full_name !== undefined) profile.full_name = payload.full_name;
    if (payload.email !== undefined) profile.email = payload.email.trim().toLowerCase();
    if (Object.keys(profile).length > 0) {
      const { data } = await apiClient.patch<RawUser>(`/users/${id}`, profile);
      updated = data;
    }
    if (updated) return updated;
    const { data } = await apiClient.get<RawUser>(`/users/${id}`);
    return data;
  }

  /** Activate / deactivate a user account (POST /users/{id}/activate|deactivate). */
  async setUserActive(id: string, active: boolean): Promise<RawUser> {
    const { data } = await apiClient.post<RawUser>(`/users/${id}/${active ? 'activate' : 'deactivate'}`);
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  // ---- Reviews -------------------------------------------------------------
  async getReviews(params?: { status?: ReviewStatus; mine?: boolean }): Promise<Review[]> {
    // `mine=true` is accepted for every role; without it the API only allows
    // reviewers and admins to list reviews.
    const rows = await fetchAll<RawReview>('/reviews', params);
    return rows.map(mapReview);
  }

  async assignReviewer(publicationId: string, reviewerId: string): Promise<Review> {
    const { data } = await apiClient.post<RawReview>(
      `/publications/${publicationId}/reviews/assign`,
      { reviewer_id: reviewerId }
    );
    return mapReview(data);
  }

  async updateReview(
    id: string,
    payload: { status: ReviewStatus; comments?: string }
  ): Promise<Review> {
    const { data } = await apiClient.patch<RawReview>(`/reviews/${id}`, payload);
    return mapReview(data);
  }

  // ---- Global search -------------------------------------------------------
  async search(q: string): Promise<{
    publications: Publication[];
    researchers: Researcher[];
    institutions: Institution[];
  }> {
    const { data } = await apiClient.get('/search', { params: { q, limit: 5 } });
    return {
      publications: (data.publications ?? []).map((hit: { id: string }) => ({
        id: hit.id,
      })) as Publication[],
      researchers: (data.researchers ?? []).map((hit: { id: string }) => ({
        id: hit.id,
      })) as Researcher[],
      institutions: (data.institutions ?? []).map((hit: { id: string }) => ({
        id: hit.id,
      })) as Institution[],
    };
  }
}

export const mockDataStore = new ApiDataStore();
