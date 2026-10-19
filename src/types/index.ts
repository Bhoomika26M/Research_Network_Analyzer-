export type UserRole = 'Researcher' | 'Institution Admin' | 'Reviewer' | 'System Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  avatarUrl?: string;
  initials: string;
  bio?: string;
  department?: string;
}

export interface Researcher {
  id: string;
  name: string;
  title: string; // e.g. "Professor of Computer Science", "Senior Postdoctoral Fellow"
  email: string;
  institutionId: string;
  institutionName: string;
  department: string;
  skills: string[];
  researchInterests: string[];
  affiliations: string[];
  publicationsCount: number;
  citationsCount: number;
  hIndex: number;
  avatarUrl: string;
  bio: string;
  googleScholar?: string;
  orcid?: string;
  joinedYear: number;
  /** Linked user account state (list route enrichment); undefined when no login. */
  isActive?: boolean;
}

export type InstitutionType =
  | 'University'
  | 'Research Institute'
  | 'Government Lab'
  | 'Research Lab'
  | 'Government'
  | 'Publisher';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  type: InstitutionType;
  departments: string[];
  researcherCount: number;
  publicationCount: number;
  activeProjectsCount: number;
  budget: number; // in USD
  logoUrl: string;
  website: string;
  description: string;
  /** Backend `is_active` — false when the institution is deactivated. */
  isActive: boolean;
}

export type PublicationType = 'Journal' | 'Conference' | 'Book' | 'Patent' | 'Technical Report';
export type PublicationStatus = 'Draft' | 'Submitted' | 'Published' | 'Archived';

export interface AuthorRef {
  researcherId: string;
  name: string;
  institutionName: string;
  role: 'Lead Author' | 'Co-Author' | 'Corresponding Author';
}

export interface PublicationHistoryEntry {
  date: string;
  status: PublicationStatus;
  user: string;
  notes: string;
}

export interface Publication {
  id: string;
  title: string;
  abstract: string;
  type: PublicationType;
  status: PublicationStatus;
  authors: AuthorRef[];
  venue: string; // Journal or Conference name
  publicationDate: string;
  year: number;
  doi: string;
  citations: number;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: string;
  keywords: string[];
  history: PublicationHistoryEntry[];
}

export type ProjectStatus = 'Planning' | 'Active' | 'Completed' | 'On Hold';

export interface ProjectTeamMember {
  researcherId: string;
  name: string;
  role: string;
  institutionName: string;
}

export interface Project {
  id: string;
  code: string; // e.g. "PRJ-2024-889"
  title: string;
  description: string;
  leadResearcherId: string;
  leadResearcherName: string;
  institutionId: string;
  institutionName: string;
  status: ProjectStatus;
  budget: number;
  startDate: string;
  endDate: string;
  teamMembers: ProjectTeamMember[];
  tags: string[];
  publicationsLinkedCount: number;
}

export interface ConferenceScheduleSession {
  id: string;
  time: string;
  title: string;
  speaker: string;
  room: string;
  date: string;
}

export interface ConferenceRegistration {
  researcherId: string;
  researcherName: string;
  paperTitle?: string;
  status: 'Registered' | 'Pending' | 'Attended';
}

export interface Conference {
  id: string;
  title: string;
  acronym: string;
  location: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  website: string;
  submissionDeadline: string;
  tracks: string[];
  registeredResearchers: ConferenceRegistration[];
  schedule: ConferenceScheduleSession[];
  acceptedPapersCount: number;
}

export interface Citation {
  id: string;
  publicationId: string;
  publicationTitle: string;
  citingTitle: string;
  citingAuthors: string;
  citingVenue: string;
  citingYear: number;
  doi: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface Review {
  id: string;
  publicationId: string;
  publicationTitle: string;
  reviewerId: string;
  reviewerName: string;
  status: ReviewStatus;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditCategory = 'User Activity' | 'Publication' | 'Project' | 'Security';
export type AuditStatus = 'Success' | 'Warning' | 'Failure';

export interface AuditLog {
  id: string;
  timestamp: string;
  category: AuditCategory;
  user: string;
  role: UserRole;
  action: string;
  ipAddress: string;
  status: AuditStatus;
  details: string;
}

export interface CoAuthorshipNode {
  id: string;
  name: string;
  institution: string;
  department: string;
  publicationsCount: number;
  citationsCount: number;
  hIndex: number;
  avatarUrl: string;
  group: number; // for color coding by institution
}

export interface CoAuthorshipLink {
  source: string;
  target: string;
  weight: number; // number of joint publications
  publications: string[]; // publication titles
}

export interface CollaborationGraphData {
  nodes: CoAuthorshipNode[];
  links: CoAuthorshipLink[];
}

export interface SystemMetrics {
  totalResearchers: number;
  totalInstitutions: number;
  totalPublications: number;
  totalActiveProjects: number;
  totalConferences: number;
  totalCitations: number;
  totalBudget: number;
}
