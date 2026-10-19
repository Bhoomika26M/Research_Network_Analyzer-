export type Role = 'researcher' | 'institution' | 'admin' | 'reviewer'

export type Permission =
  // Publications
  | 'publications.create'
  | 'publications.approve'
  | 'publications.archive'
  | 'publications.review'
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

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  researcher: [
    'publications.create',
    'analytics.exportReports',
    'research.manageProjects',
    'research.createCollaboration',
  ],
  reviewer: [
    'publications.review',
  ],
  institution: [
    'publications.create',
    'publications.approve',
    'publications.archive',
    'admin.manageUsers',
    'analytics.exportReports',
    'analytics.viewAll',
    'research.manageProjects',
    'research.createCollaboration',
  ],
  admin: [
    'publications.create',
    'publications.approve',
    'publications.archive',
    'publications.review',
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
