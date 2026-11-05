export type Role = 'researcher' | 'institution' | 'admin' | 'reviewer'

export type Permission =
  // Publications
  | 'publications.create'
  | 'publications.edit'
  | 'publications.archive'
  | 'publications.review'
  | 'publications.link'
  // Citations / DOIs
  | 'dois.mint'
  // Conferences / scheduling
  | 'conferences.manage'
  // Administration
  | 'admin.manageUsers'
  | 'admin.manageInstitutions'
  | 'admin.assignRoles'
  // Analytics
  | 'analytics.exportReports'
  | 'analytics.viewAuditLogs'
  | 'analytics.viewAll'
  // Research
  | 'research.manageProjects'
  | 'research.createCollaboration'
  // System
  | 'system.configuration'
  | 'system.securitySettings'

/**
 * Mirror of server/src/core/permissions.py. The backend is the source of
 * truth and re-checks every request; this map only drives what the UI shows.
 * Ownership / institution scope is enforced server-side and is not encoded
 * here.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  researcher: [
    'publications.create',
    'publications.edit',
    'publications.link',
    'dois.mint',
    'conferences.manage',
    'analytics.exportReports',
    'research.manageProjects',
    'research.createCollaboration',
  ],
  reviewer: [
    'publications.review',
  ],
  institution: [
    'publications.create',
    'publications.edit',
    'publications.archive',
    'publications.link',
    'dois.mint',
    'conferences.manage',
    'analytics.exportReports',
    'analytics.viewAll',
    'research.manageProjects',
    'research.createCollaboration',
  ],
  admin: [
    'publications.create',
    'publications.edit',
    'publications.archive',
    'publications.link',
    'publications.review',
    'dois.mint',
    'conferences.manage',
    'admin.manageUsers',
    'admin.manageInstitutions',
    'admin.assignRoles',
    'analytics.exportReports',
    'analytics.viewAuditLogs',
    'analytics.viewAll',
    'research.manageProjects',
    'research.createCollaboration',
    'system.configuration',
    'system.securitySettings',
  ],
}

export const ROLE_KEYS: Role[] = ['researcher', 'institution', 'admin', 'reviewer']

/**
 * Check a permission against the logged-in user using only the permissions
 * the backend returned for the account. Sessions are backend-validated, so
 * there is no static-role fallback.
 */
export function hasPermission(
  user: { role?: string; permissions?: string[] } | null | undefined,
  permission: Permission,
): boolean {
  return user?.permissions?.includes(permission) ?? false
}
