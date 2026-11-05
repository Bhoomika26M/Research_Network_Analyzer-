import { ROLE_PERMISSIONS, type Permission } from '../../permissions/config'

const permissionRows: { label: string; permission: Permission; category: string }[] = [
  { label: 'Create Publications', permission: 'publications.create', category: 'Publications' },
  { label: 'Approve Publications', permission: 'publications.approve', category: 'Publications' },
  { label: 'Archive Publications', permission: 'publications.archive', category: 'Publications' },
  { label: 'Review Submissions', permission: 'publications.review', category: 'Publications' },
  { label: 'Manage Users', permission: 'admin.manageUsers', category: 'Administration' },
  { label: 'Manage Institutions', permission: 'admin.manageInstitutions', category: 'Administration' },
  { label: 'Assign Roles', permission: 'admin.assignRoles', category: 'Administration' },
  { label: 'Export Reports', permission: 'analytics.exportReports', category: 'Analytics' },
  { label: 'View Audit Logs', permission: 'analytics.viewAuditLogs', category: 'Analytics' },
  { label: 'View All Analytics', permission: 'analytics.viewAll', category: 'Analytics' },
  { label: 'Manage Projects', permission: 'research.manageProjects', category: 'Research' },
  { label: 'Create Collaboration', permission: 'research.createCollaboration', category: 'Research' },
  { label: 'System Configuration', permission: 'system.configuration', category: 'System' },
  { label: 'Security Settings', permission: 'system.securitySettings', category: 'System' },
]

const roles = [
  { id: 'researcher' as const, label: 'Researcher', color: 'text-blue-600 bg-blue-50' },
  { id: 'institution' as const, label: 'Institution Admin', color: 'text-violet-600 bg-violet-50' },
  { id: 'reviewer' as const, label: 'Reviewer', color: 'text-emerald-600 bg-emerald-50' },
  { id: 'admin' as const, label: 'System Admin', color: 'text-amber-600 bg-amber-50' },
]

const categories = ['Publications', 'Administration', 'Analytics', 'Research', 'System']

export default function RolePermissions() {
  return (
    <div className="p-8 max-w-[1200px]">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] mb-3">
          <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">01 — User Mgmt / Role Permissions</span>
        </span>
        <h1 className="font-display text-3xl text-[#0F172A]">Role Permissions</h1>
        <p className="text-[#64748B] mt-1">Access control matrix across all four system roles</p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#E2E8F0]">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            Permission Matrix
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
                <th className="text-left px-6 py-4 w-64">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64748B]">Permission / Action</span>
                </th>
                {roles.map((role) => (
                  <th key={role.id} className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold ${role.color}`}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const catPerms = permissionRows.filter(p => p.category === cat)
                return (
                  <>
                    {/* Category header row */}
                    <tr key={`cat-${cat}`} className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <td colSpan={5} className="px-6 py-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#94A3B8]">{cat}</span>
                      </td>
                    </tr>
                    {catPerms.map((perm, pi) => {
                      const isLast = pi === catPerms.length - 1
                      return (
                        <tr
                          key={perm.permission}
                          className={`${isLast ? 'border-b border-[#E2E8F0]' : 'border-b border-[#F1F5F9]'} hover:bg-[#FAFAFA] transition-colors`}
                        >
                          <td className="px-6 py-3.5">
                            <span className="text-sm text-[#0F172A]">{perm.label}</span>
                          </td>
                          {roles.map((role) => {
                            const has = ROLE_PERMISSIONS[role.id].includes(perm.permission)
                            return (
                              <td key={role.id} className="px-6 py-3.5 text-center">
                                {has ? (
                                  <span className="inline-flex w-7 h-7 rounded-full gradient-bg items-center justify-center mx-auto shadow-sm">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                      <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="inline-flex w-7 h-7 rounded-full bg-[#F1F5F9] items-center justify-center mx-auto">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                      <path d="M2.5 2.5l5 5M7.5 2.5l-5 5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                  </span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] flex items-center gap-6 bg-[#FAFAFA]">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#94A3B8]">Legend</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-5 h-5 rounded-full gradient-bg items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M2 4.5l1.5 1.5 3.5-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-xs text-[#64748B]">Permitted</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex w-5 h-5 rounded-full bg-[#F1F5F9] items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="#CBD5E1" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="text-xs text-[#64748B]">Restricted</span>
          </div>
        </div>
      </div>
    </div>
  )
}
