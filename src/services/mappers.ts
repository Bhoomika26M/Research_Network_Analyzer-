/**
 * ONE place where backend (snake_case, lowercase enums) payloads are mapped to
 * the front-end (camelCase, Title-Case) types. Components never map directly.
 */
import {
  AuditCategory,
  AuditLog,
  AuthorRef,
  Citation,
  CoAuthorshipLink,
  CoAuthorshipNode,
  CollaborationGraphData,
  Conference,
  Institution,
  InstitutionType,
  Project,
  ProjectStatus,
  Publication,
  PublicationStatus,
  PublicationType,
  Researcher,
  Review,
  ReviewStatus,
} from '../types';

const AVATAR = (seed: string) => `https://i.pravatar.cc/150?u=${encodeURIComponent(seed)}`;

const titleCase = (value: string) =>
  value
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

// ---- Enum maps (API value <-> front-end label) -----------------------------

export const PUB_TYPE_FROM_API: Record<string, PublicationType> = {
  journal: 'Journal',
  conference: 'Conference',
  book: 'Book',
  patent: 'Patent',
  technical_report: 'Technical Report',
};

export const PUB_TYPE_TO_API: Record<PublicationType, string> = {
  Journal: 'journal',
  Conference: 'conference',
  Book: 'book',
  Patent: 'patent',
  'Technical Report': 'technical_report',
};

export const PUB_STATUS_FROM_API: Record<string, PublicationStatus> = {
  draft: 'Draft',
  submitted: 'Submitted',
  published: 'Published',
  archived: 'Archived',
};

export const PUB_STATUS_TO_API: Record<PublicationStatus, string> = {
  Draft: 'draft',
  Submitted: 'submitted',
  Published: 'published',
  Archived: 'archived',
};

export const PROJECT_STATUS_FROM_API: Record<string, ProjectStatus> = {
  planned: 'Planning',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'On Hold',
};

export const PROJECT_STATUS_TO_API: Record<ProjectStatus, string> = {
  Planning: 'planned',
  Active: 'active',
  Completed: 'completed',
  'On Hold': 'cancelled',
};

export const AUDIT_CATEGORY_FROM_API: Record<string, AuditCategory> = {
  user_activity: 'User Activity',
  publication_history: 'Publication',
  project_log: 'Project',
  security: 'Security',
};

// ---- Raw backend shapes ----------------------------------------------------

export interface RawInstitution {
  id: string;
  name: string;
  country?: string | null;
  city?: string | null;
  website?: string | null;
  type?: string | null;
  is_active?: boolean | null;
  created_at?: string;
  short_name?: string | null;
  departments?: string[];
  researchers_count?: number;
  publications_count?: number;
  active_projects_count?: number;
}

export interface RawDepartment {
  id: string;
  institution_id: string;
  name: string;
  description?: string | null;
  head_name?: string | null;
  budget?: number | string | null;
}

export interface RawResearcher {
  id: string;
  user_id?: string | null;
  department_id?: string | null;
  first_name: string;
  last_name: string;
  full_name?: string;
  title?: string | null;
  bio?: string | null;
  orcid?: string | null;
  created_at?: string;
  department?: RawDepartment | null;
  skills?: string[];
  interests?: string[];
  affiliations?: { institution_id: string; institution?: RawInstitution | null }[];
  publications?: { id: string }[];
  email?: string | null;
  is_active?: boolean | null;
  institution_id?: string | null;
  institution_name?: string | null;
  department_name?: string | null;
  publications_count?: number;
  citations_count?: number;
}

export interface RawCoAuthor {
  researcher_id: string;
  author_order: number;
  is_corresponding: boolean;
  full_name: string;
  institution_name?: string | null;
}

export interface RawPublication {
  id: string;
  title: string;
  abstract?: string | null;
  type: string;
  status: string;
  year: number;
  venue?: string | null;
  doi?: string | null;
  has_file?: boolean;
  created_at?: string;
  co_authors?: RawCoAuthor[];
  citations_count?: number;
  keywords?: string[];
}

export interface RawProjectMember {
  researcher_id: string;
  full_name?: string;
  role?: string | null;
  start_date?: string;
  end_date?: string | null;
}

export interface RawProject {
  id: string;
  title: string;
  description?: string | null;
  funding_agency?: string | null;
  budget?: number | string | null;
  start_date: string;
  end_date?: string | null;
  status: string;
  institution_id?: string | null;
  institution?: RawInstitution | null;
  members?: RawProjectMember[];
  code?: string | null;
  lead_researcher_name?: string | null;
  member_count?: number;
}

export interface RawRegistration {
  researcher_id: string;
  full_name?: string;
  publication_id?: string | null;
  publication_title?: string | null;
  presentation_type?: string | null;
  registration_status?: string | null;
}

export interface RawConference {
  id: string;
  name: string;
  location?: string | null;
  start_date: string;
  end_date?: string | null;
  website?: string | null;
  submission_deadline?: string | null;
  topics?: string | null;
  registrations?: RawRegistration[];
  acronym?: string | null;
  registration_count?: number;
}

export interface RawCitation {
  citing_publication_id: string;
  cited_publication_id: string;
  citing_title: string;
  cited_title: string;
  created_at?: string;
  citing_venue?: string | null;
  citing_year?: number | null;
  citing_doi?: string | null;
  citing_authors?: string | null;
}

export interface RawReview {
  id: string;
  publication_id: string;
  publication_title?: string | null;
  reviewer_id: string;
  reviewer_name?: string | null;
  status: string;
  comments?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RawAuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  category: string;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  timestamp: string;
  user_name?: string | null;
  user_role?: string | null;
}

export interface RawNetworkNode {
  id: string;
  name: string;
  institution?: string | null;
  publication_count: number;
}

export interface RawNetworkEdge {
  source: string;
  target: string;
  weight: number;
  publications?: string[];
}

export interface RawNetworkGraph {
  nodes: RawNetworkNode[];
  edges?: RawNetworkEdge[];
  links?: RawNetworkEdge[];
}

// ---- Mappers ---------------------------------------------------------------

const INSTITUTION_TYPE_FROM_API: Record<string, InstitutionType> = {
  university: 'University',
  'research institute': 'Research Institute',
  'research lab': 'Research Lab',
  government: 'Government',
  'government lab': 'Government Lab',
  publisher: 'Publisher',
};

export function mapInstitution(raw: RawInstitution): Institution {
  return {
    id: raw.id,
    name: raw.name,
    shortName:
      raw.short_name ??
      (raw.name.length > 24 ? raw.name.split(/\s+/).map((w) => w[0]).join('') : raw.name),
    country: raw.country ?? '',
    city: raw.city ?? '',
    type: INSTITUTION_TYPE_FROM_API[(raw.type ?? '').toLowerCase()] ?? 'University',
    departments: raw.departments ?? [],
    researcherCount: raw.researchers_count ?? 0,
    publicationCount: raw.publications_count ?? 0,
    activeProjectsCount: raw.active_projects_count ?? 0,
    budget: 0,
    logoUrl: '',
    website: raw.website ?? '',
    description: '',
    isActive: raw.is_active ?? true,
  };
}

export function mapResearcher(raw: RawResearcher): Researcher {
  const affiliations = (raw.affiliations ?? [])
    .map((a) => a.institution?.name)
    .filter((name): name is string => Boolean(name));
  const department = raw.department_name ?? raw.department?.name ?? '';
  return {
    id: raw.id,
    name: raw.full_name ?? `${raw.first_name} ${raw.last_name}`.trim(),
    title: raw.title ?? '',
    email: raw.email ?? '',
    institutionId:
      raw.institution_id ?? raw.department?.institution_id ?? raw.department_id ?? '',
    institutionName: raw.institution_name ?? affiliations[0] ?? '',
    department,
    skills: raw.skills ?? [],
    researchInterests: raw.interests ?? [],
    affiliations,
    publicationsCount: raw.publications_count ?? raw.publications?.length ?? 0,
    citationsCount: raw.citations_count ?? 0,
    hIndex: 0,
    avatarUrl: AVATAR(raw.id),
    bio: raw.bio ?? '',
    googleScholar: undefined,
    orcid: raw.orcid ?? undefined,
    joinedYear: raw.created_at ? new Date(raw.created_at).getFullYear() : new Date().getFullYear(),
    isActive: raw.is_active ?? undefined,
  };
}

function mapAuthor(coAuthor: RawCoAuthor): AuthorRef {
  const role: AuthorRef['role'] = coAuthor.is_corresponding
    ? 'Corresponding Author'
    : coAuthor.author_order === 1
      ? 'Lead Author'
      : 'Co-Author';
  return {
    researcherId: coAuthor.researcher_id,
    name: coAuthor.full_name,
    institutionName: coAuthor.institution_name ?? '',
    role,
  };
}

export function mapPublication(raw: RawPublication): Publication {
  const year = raw.year;
  return {
    id: raw.id,
    title: raw.title,
    abstract: raw.abstract ?? '',
    type: PUB_TYPE_FROM_API[raw.type] ?? (titleCase(raw.type) as PublicationType),
    status: PUB_STATUS_FROM_API[raw.status] ?? (titleCase(raw.status) as PublicationStatus),
    authors: (raw.co_authors ?? []).map(mapAuthor),
    venue: raw.venue ?? '',
    publicationDate: raw.created_at ? raw.created_at.slice(0, 10) : `${year}-01-01`,
    year,
    doi: raw.doi ?? '',
    citations: raw.citations_count ?? 0,
    downloadUrl: undefined,
    fileName: undefined,
    fileSize: undefined,
    keywords: raw.keywords ?? [],
    history: [],
  };
}

export function mapProject(raw: RawProject): Project {
  const members = raw.members ?? [];
  return {
    id: raw.id,
    code: raw.code ?? `PRJ-${raw.id.slice(0, 8).toUpperCase()}`,
    title: raw.title,
    description: raw.description ?? '',
    leadResearcherId: members[0]?.researcher_id ?? '',
    leadResearcherName: raw.lead_researcher_name ?? members[0]?.full_name ?? '',
    institutionId: raw.institution_id ?? '',
    institutionName: raw.institution?.name ?? '',
    status: PROJECT_STATUS_FROM_API[raw.status] ?? (titleCase(raw.status) as ProjectStatus),
    budget: Number(raw.budget ?? 0),
    startDate: raw.start_date ?? '',
    endDate: raw.end_date ?? '',
    teamMembers: members.map((m) => ({
      researcherId: m.researcher_id,
      name: m.full_name ?? '',
      role: m.role ?? 'Researcher',
      institutionName: '',
    })),
    tags: raw.funding_agency ? [raw.funding_agency] : [],
    publicationsLinkedCount: 0,
  };
}

const REG_STATUS: Record<string, 'Registered' | 'Pending' | 'Attended'> = {
  registered: 'Registered',
  pending: 'Pending',
  attended: 'Attended',
};

export function mapConference(raw: RawConference): Conference {
  return {
    id: raw.id,
    title: raw.name,
    acronym:
      raw.acronym ??
      raw.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 6).toUpperCase(),
    location: raw.location ?? '',
    city: raw.location ?? '',
    country: '',
    startDate: raw.start_date ?? '',
    endDate: raw.end_date ?? '',
    website: raw.website ?? '',
    submissionDeadline: raw.submission_deadline ?? '',
    tracks: raw.topics
      ? raw.topics.split(',').map((topic) => topic.trim()).filter(Boolean)
      : [],
    registeredResearchers: (raw.registrations ?? []).map((r) => ({
      researcherId: r.researcher_id,
      researcherName: r.full_name ?? '',
      paperTitle: r.publication_title ?? undefined,
      status: REG_STATUS[r.registration_status ?? 'registered'] ?? 'Registered',
    })),
    schedule: [],
    acceptedPapersCount: 0,
  };
}

export function mapCitation(raw: RawCitation): Citation {
  return {
    id: `${raw.citing_publication_id}-${raw.cited_publication_id}`,
    publicationId: raw.cited_publication_id,
    publicationTitle: raw.cited_title,
    citingTitle: raw.citing_title,
    citingAuthors: raw.citing_authors ?? '',
    citingVenue: raw.citing_venue ?? '',
    citingYear:
      raw.citing_year ??
      (raw.created_at ? new Date(raw.created_at).getFullYear() : new Date().getFullYear()),
    doi: raw.citing_doi ?? '',
  };
}

const ROLE_FROM_API: Record<string, AuditLog['role']> = {
  researcher: 'Researcher',
  institution_admin: 'Institution Admin',
  reviewer: 'Reviewer',
  system_admin: 'System Admin',
};

/** Front-end role label -> backend UserRole value (used by user management). */
export const USER_ROLE_TO_API: Record<string, string> = {
  Researcher: 'researcher',
  'Institution Admin': 'institution_admin',
  Reviewer: 'reviewer',
  'System Admin': 'system_admin',
};

const REVIEW_STATUS_FROM_API: Record<string, ReviewStatus> = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  changes_requested: 'changes_requested',
};

export function mapReview(raw: RawReview): Review {
  return {
    id: raw.id,
    publicationId: raw.publication_id,
    publicationTitle: raw.publication_title ?? '',
    reviewerId: raw.reviewer_id,
    reviewerName: raw.reviewer_name ?? '',
    status: REVIEW_STATUS_FROM_API[raw.status] ?? 'pending',
    comments: raw.comments ?? '',
    createdAt: raw.created_at ?? '',
    updatedAt: raw.updated_at ?? '',
  };
}

export function mapAuditLog(raw: RawAuditLog): AuditLog {
  return {
    id: raw.id,
    timestamp: (raw.timestamp ?? '').replace('T', ' ').slice(0, 19),
    category: AUDIT_CATEGORY_FROM_API[raw.category] ?? 'User Activity',
    user: raw.user_name ?? raw.user_id ?? 'system',
    role: ROLE_FROM_API[raw.user_role ?? ''] ?? 'Researcher',
    action: raw.action,
    ipAddress: raw.ip_address ?? '',
    status: 'Success',
    details: raw.details ? JSON.stringify(raw.details) : '',
  };
}

export function mapCollaborationGraph(raw: RawNetworkGraph): CollaborationGraphData {
  const edges = raw.links ?? raw.edges ?? [];
  const groups = new Map<string, number>();
  const nodes: CoAuthorshipNode[] = raw.nodes.map((node) => {
    const group = groups.get(node.institution ?? 'unknown') ?? groups.size;
    groups.set(node.institution ?? 'unknown', group);
    return {
      id: node.id,
      name: node.name,
      institution: node.institution ?? '',
      department: '',
      publicationsCount: node.publication_count,
      citationsCount: 0,
      hIndex: 0,
      avatarUrl: AVATAR(node.id),
      group,
    };
  });
  const links: CoAuthorshipLink[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    weight: edge.weight,
    publications: edge.publications ?? [],
  }));
  return { nodes, links };
}

// ---- Request payload builders (front-end -> API) ---------------------------

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function publicationCreatePayload(input: {
  title: string;
  abstract?: string;
  type: PublicationType;
  venue?: string;
  year: number;
  doi?: string;
  authors?: AuthorRef[];
}) {
  return {
    title: input.title,
    type: PUB_TYPE_TO_API[input.type],
    year: input.year,
    abstract: input.abstract || null,
    venue: input.venue || null,
    doi: input.doi || null,
    // Only real UUID author ids can be sent; the demo fixtures use "res-1" style ids.
    co_authors: (input.authors ?? [])
      .filter((author) => isUuid(author.researcherId))
      .map((author, index) => ({
        researcher_id: author.researcherId,
        author_order: index + 1,
        is_corresponding: author.role === 'Corresponding Author',
      })),
  };
}

export function researcherCreatePayload(input: {
  name: string;
  title?: string;
  bio?: string;
  orcid?: string;
}) {
  const [first_name, ...rest] = input.name.trim().split(/\s+/);
  return {
    first_name: first_name || 'Unknown',
    last_name: rest.join(' ') || '.',
    title: input.title || null,
    bio: input.bio || null,
    orcid: input.orcid && /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(input.orcid) ? input.orcid : null,
  };
}

export { isUuid };
