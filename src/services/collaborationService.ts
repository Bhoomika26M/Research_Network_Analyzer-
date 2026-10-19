/**
 * Collaboration module API layer (the only one the trimmed app keeps besides
 * auth / users / dashboards).
 *
 * Everything here talks to mounted routes:
 *   /researchers, /institutions, /departments  (read-only lookups)
 *   /projects, /projects/mine, /projects/{id}/members
 *   /institutional-collaborations
 *   /collaboration/{me,co-authors,network}
 */
import { apiClient, ApiPage } from './apiClient';

export interface ResearcherOption {
  id: string;
  name: string;
  title: string;
  email: string;
  institution: string;
  department: string;
  publications: number;
}

export interface ProjectMember {
  researcherId: string;
  fullName: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface ProjectItem {
  id: string;
  code: string;
  title: string;
  description: string;
  fundingAgency: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  institutionId: string;
  institutionName: string;
  members: ProjectMember[];
}

export interface InstitutionOption {
  id: string;
  name: string;
}

export interface InstitutionalCollaborationItem {
  id: string;
  institutionAId: string;
  institutionBId: string;
  institutionAName: string;
  institutionBName: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface CoAuthorItem {
  researcherId: string;
  fullName: string;
  sharedPublications: number;
}

export interface NetworkNode {
  id: string;
  name: string;
  institution: string;
  publicationCount: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  publications: string[];
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export interface MyProfile {
  researcherId: string | null;
  fullName: string | null;
}

export interface ProjectInput {
  title: string;
  description?: string;
  fundingAgency?: string;
  budget?: number;
  startDate: string;
  endDate?: string;
  status: string;
  institutionId?: string | null;
}

export interface InstitutionalCollaborationInput {
  institutionAId: string;
  institutionBId: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface RawResearcher {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string | null;
  title?: string | null;
  email?: string | null;
  institution_name?: string | null;
  department_name?: string | null;
  publications_count?: number;
}

interface RawProjectMember {
  researcher_id: string;
  full_name?: string | null;
  role?: string | null;
  start_date?: string;
  end_date?: string | null;
}

interface RawProject {
  id: string;
  title: string;
  description?: string | null;
  funding_agency?: string | null;
  budget?: number | string | null;
  start_date: string;
  end_date?: string | null;
  status: string;
  institution_id?: string | null;
  institution?: { name?: string | null } | null;
  members?: RawProjectMember[];
  code?: string | null;
}

interface RawInstitution {
  id: string;
  name: string;
}

interface RawInstitutionalCollaboration {
  id: string;
  institution_a_id: string;
  institution_b_id: string;
  type: string;
  status: string;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  institution_a?: RawInstitution | null;
  institution_b?: RawInstitution | null;
}

interface RawCoAuthor {
  researcher_id: string;
  full_name: string;
  shared_publications: number;
}

interface RawNetworkNode {
  id: string;
  name: string;
  institution?: string | null;
  publication_count: number;
}

interface RawNetworkEdge {
  source: string;
  target: string;
  weight: number;
  publications?: string[];
}

interface RawNetworkGraph {
  nodes: RawNetworkNode[];
  edges?: RawNetworkEdge[];
  links?: RawNetworkEdge[];
}

const LIST_LIMIT = 100;

function mapResearcher(raw: RawResearcher): ResearcherOption {
  return {
    id: raw.id,
    name: raw.full_name ?? `${raw.first_name} ${raw.last_name}`.trim(),
    title: raw.title ?? '',
    email: raw.email ?? '',
    institution: raw.institution_name ?? '',
    department: raw.department_name ?? '',
    publications: raw.publications_count ?? 0,
  };
}

function mapProject(raw: RawProject): ProjectItem {
  return {
    id: raw.id,
    code: raw.code ?? `PRJ-${raw.id.slice(0, 8).toUpperCase()}`,
    title: raw.title,
    description: raw.description ?? '',
    fundingAgency: raw.funding_agency ?? '',
    budget: Number(raw.budget ?? 0),
    startDate: raw.start_date ?? '',
    endDate: raw.end_date ?? '',
    status: raw.status,
    institutionId: raw.institution_id ?? '',
    institutionName: raw.institution?.name ?? '',
    members: (raw.members ?? []).map((m) => ({
      researcherId: m.researcher_id,
      fullName: m.full_name ?? '',
      role: m.role ?? 'Researcher',
      startDate: m.start_date ?? '',
      endDate: m.end_date ?? '',
    })),
  };
}

function mapCollaboration(raw: RawInstitutionalCollaboration): InstitutionalCollaborationItem {
  return {
    id: raw.id,
    institutionAId: raw.institution_a_id,
    institutionBId: raw.institution_b_id,
    institutionAName: raw.institution_a?.name ?? 'Institution',
    institutionBName: raw.institution_b?.name ?? 'Institution',
    type: raw.type,
    status: raw.status,
    startDate: raw.start_date,
    endDate: raw.end_date ?? '',
    description: raw.description ?? '',
  };
}

const today = () => new Date().toISOString().slice(0, 10);

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  planned: 'Planning',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'On Hold',
};

export const PROJECT_STATUS_VALUES = ['planned', 'active', 'completed', 'cancelled'];

export const COLLAB_TYPES = [
  'joint_research',
  'student_exchange',
  'shared_facilities',
  'funding_consortium',
  'publication_partnership',
];

export const COLLAB_STATUSES = ['active', 'pending', 'completed', 'suspended'];

export const collaborationService = {
  // ---- Lookups -----------------------------------------------------------
  async listResearchers(q?: string): Promise<ResearcherOption[]> {
    const { data } = await apiClient.get<ApiPage<RawResearcher>>('/researchers', {
      params: { limit: LIST_LIMIT, ...(q ? { q } : {}) },
    });
    return data.items.map(mapResearcher);
  },

  async listInstitutions(): Promise<InstitutionOption[]> {
    const { data } = await apiClient.get<ApiPage<RawInstitution>>('/institutions', {
      params: { limit: LIST_LIMIT },
    });
    return data.items.map((row) => ({ id: row.id, name: row.name }));
  },

  async myProfile(): Promise<MyProfile> {
    const { data } = await apiClient.get<{
      researcher_id: string | null;
      full_name: string | null;
    }>('/collaboration/me');
    return { researcherId: data.researcher_id, fullName: data.full_name };
  },

  // ---- Co-authors + network ---------------------------------------------
  async coAuthors(researcherId: string): Promise<CoAuthorItem[]> {
    const { data } = await apiClient.get<RawCoAuthor[]>(
      `/collaboration/co-authors/${researcherId}`
    );
    return data.map((row) => ({
      researcherId: row.researcher_id,
      fullName: row.full_name,
      sharedPublications: row.shared_publications,
    }));
  },

  async network(): Promise<NetworkGraph> {
    const { data } = await apiClient.get<RawNetworkGraph>('/collaboration/network');
    const edges = data.links ?? data.edges ?? [];
    return {
      nodes: data.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        institution: node.institution ?? '',
        publicationCount: node.publication_count,
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
        publications: edge.publications ?? [],
      })),
    };
  },

  // ---- Projects ----------------------------------------------------------
  async listProjects(q?: string): Promise<ProjectItem[]> {
    const { data } = await apiClient.get<ApiPage<RawProject>>('/projects', {
      params: { limit: LIST_LIMIT, ...(q ? { q } : {}) },
    });
    return data.items.map(mapProject);
  },

  async listMyProjects(): Promise<ProjectItem[]> {
    const { data } = await apiClient.get<ApiPage<RawProject>>('/projects/mine', {
      params: { limit: LIST_LIMIT },
    });
    return data.items.map(mapProject);
  },

  async createProject(input: ProjectInput): Promise<ProjectItem> {
    const { data } = await apiClient.post<RawProject>('/projects', {
      title: input.title,
      description: input.description || null,
      funding_agency: input.fundingAgency || null,
      budget: input.budget ?? null,
      start_date: input.startDate || today(),
      end_date: input.endDate || null,
      status: input.status,
      institution_id: input.institutionId || null,
    });
    return mapProject(data);
  },

  async updateProject(id: string, input: Partial<ProjectInput>): Promise<ProjectItem> {
    const payload: Record<string, unknown> = {};
    if (input.title !== undefined) payload.title = input.title;
    if (input.description !== undefined) payload.description = input.description || null;
    if (input.fundingAgency !== undefined) payload.funding_agency = input.fundingAgency || null;
    if (input.budget !== undefined) payload.budget = input.budget ?? null;
    if (input.startDate !== undefined) payload.start_date = input.startDate || today();
    if (input.endDate !== undefined) payload.end_date = input.endDate || null;
    if (input.status !== undefined) payload.status = input.status;
    if (input.institutionId !== undefined) payload.institution_id = input.institutionId || null;
    const { data } = await apiClient.patch<RawProject>(`/projects/${id}`, payload);
    return mapProject(data);
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  // ---- Team management / project assignments ----------------------------
  async addMember(
    projectId: string,
    input: { researcherId: string; role: string; startDate: string; endDate?: string }
  ): Promise<ProjectItem> {
    const { data } = await apiClient.post<RawProject>(`/projects/${projectId}/members`, {
      researcher_id: input.researcherId,
      role: input.role || null,
      start_date: input.startDate || today(),
      end_date: input.endDate || null,
    });
    return mapProject(data);
  },

  async removeMember(projectId: string, researcherId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/members/${researcherId}`);
  },

  // ---- Institutional collaborations -------------------------------------
  async listInstitutionalCollaborations(): Promise<InstitutionalCollaborationItem[]> {
    const { data } = await apiClient.get<ApiPage<RawInstitutionalCollaboration>>(
      '/institutional-collaborations',
      { params: { limit: LIST_LIMIT } }
    );
    return data.items.map(mapCollaboration);
  },

  async createInstitutionalCollaboration(
    input: InstitutionalCollaborationInput
  ): Promise<InstitutionalCollaborationItem> {
    const { data } = await apiClient.post<RawInstitutionalCollaboration>(
      '/institutional-collaborations',
      {
        institution_a_id: input.institutionAId,
        institution_b_id: input.institutionBId,
        type: input.type,
        status: input.status,
        start_date: input.startDate || today(),
        end_date: input.endDate || null,
        description: input.description || null,
      }
    );
    return mapCollaboration(data);
  },

  async updateInstitutionalCollaboration(
    id: string,
    input: Partial<InstitutionalCollaborationInput>
  ): Promise<InstitutionalCollaborationItem> {
    const payload: Record<string, unknown> = {};
    if (input.type !== undefined) payload.type = input.type;
    if (input.status !== undefined) payload.status = input.status;
    if (input.startDate !== undefined) payload.start_date = input.startDate || today();
    if (input.endDate !== undefined) payload.end_date = input.endDate || null;
    if (input.description !== undefined) payload.description = input.description || null;
    const { data } = await apiClient.patch<RawInstitutionalCollaboration>(
      `/institutional-collaborations/${id}`,
      payload
    );
    return mapCollaboration(data);
  },

  async deleteInstitutionalCollaboration(id: string): Promise<void> {
    await apiClient.delete(`/institutional-collaborations/${id}`);
  },
};

export default collaborationService;
