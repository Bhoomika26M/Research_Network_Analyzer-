/** Role-protected dashboard endpoints. */
import { apiClient } from './apiClient';
import {
  mapConference,
  mapProject,
  mapPublication,
  PUB_TYPE_FROM_API,
  type RawConference,
  type RawProject,
  type RawPublication,
} from './mappers';
import { toConference, toProject, toPublication } from './appDataService';
import type * as App from '../types/app';

export interface YearCount {
  year: number;
  count: number;
}

export interface TypeCount {
  type: string;
  count: number;
}

/** `journal` / `technical_report` -> `Journal` / `Technical Report`. */
function typeLabel(value: string): string {
  return (
    PUB_TYPE_FROM_API[value] ??
    value
      .split(/[_\s]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

export interface ResearcherDashboard {
  publicationsCount: number;
  projectsCount: number;
  conferencesCount: number;
  collaboratorsCount: number;
  citationsIncoming: number;
  publicationsPerYear: YearCount[];
  publicationsByType: TypeCount[];
  recentPublications: App.Publication[];
  recentProjects: App.Project[];
  upcomingConferences: App.Conference[];
}

export interface InstitutionDashboard {
  institutionId: string | null;
  departmentsCount: number;
  researchersCount: number;
  publicationsCount: number;
  activeProjectsCount: number;
  collaborationsCount: number;
  publicationsPerYear: YearCount[];
  publicationsByType: TypeCount[];
}

export interface AdminDashboard {
  usersCount: number;
  researchersCount: number;
  institutionsCount: number;
  publicationsCount: number;
  activeProjectsCount: number;
  conferencesCount: number;
  citationsCount: number;
  usersByRole: { role: string; count: number }[];
  publicationsPerYear: YearCount[];
  publicationsByType: TypeCount[];
  institutions: { institutionId: string; name: string; researchers: number; publications: number; projects: number }[];
}

export const dashboardService = {
  async researcher(): Promise<ResearcherDashboard> {
    const { data } = await apiClient.get('/dashboard/researcher');
    return {
      publicationsCount: data.publications_count,
      projectsCount: data.projects_count,
      conferencesCount: data.conferences_count,
      collaboratorsCount: data.collaborators_count,
      citationsIncoming: data.citations_incoming,
      publicationsPerYear: data.publications_per_year,
      publicationsByType: (data.publications_by_type ?? []).map((row: TypeCount) => ({
        type: typeLabel(row.type),
        count: row.count,
      })),
      recentPublications: (data.recent_publications ?? []).map((row: RawPublication) =>
        toPublication(mapPublication(row))
      ),
      recentProjects: (data.recent_projects ?? []).map((row: RawProject) =>
        toProject(mapProject(row))
      ),
      upcomingConferences: (data.upcoming_conferences ?? []).map((row: RawConference) =>
        toConference(mapConference(row))
      ),
    };
  },

  async institution(institutionId?: string): Promise<InstitutionDashboard> {
    const { data } = await apiClient.get('/dashboard/institution', {
      params: institutionId ? { institution_id: institutionId } : undefined,
    });
    return {
      institutionId: data.institution_id,
      departmentsCount: data.departments_count,
      researchersCount: data.researchers_count,
      publicationsCount: data.publications_count,
      activeProjectsCount: data.active_projects_count,
      collaborationsCount: data.collaborations_count,
      publicationsPerYear: data.publications_per_year,
      publicationsByType: (data.publications_by_type ?? []).map((row: TypeCount) => ({
        type: typeLabel(row.type),
        count: row.count,
      })),
    };
  },

  async admin(): Promise<AdminDashboard> {
    const { data } = await apiClient.get('/dashboard/admin');
    return {
      usersCount: data.users_count,
      researchersCount: data.researchers_count,
      institutionsCount: data.institutions_count,
      publicationsCount: data.publications_count,
      activeProjectsCount: data.active_projects_count,
      conferencesCount: data.conferences_count,
      citationsCount: data.citations_count,
      usersByRole: data.users_by_role,
      publicationsPerYear: data.publications_per_year,
      publicationsByType: (data.publications_by_type ?? []).map((row: TypeCount) => ({
        type: typeLabel(row.type),
        count: row.count,
      })),
      institutions: (data.institutions ?? []).map((row: Record<string, unknown>) => ({
        institutionId: row.institution_id as string,
        name: row.name as string,
        researchers: row.researchers as number,
        publications: row.publications as number,
        projects: row.projects as number,
      })),
    };
  },
};
