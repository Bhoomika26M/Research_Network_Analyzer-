import { useState } from 'react'
import { BookOpen, Building2, Eye, Shield } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'

const ROLE_PERMISSIONS: Record<string, string[]> = {
  Researcher: ['View Publications', 'Edit Own Publications', 'Submit to Conferences', 'View Projects', 'Edit Own Projects', 'View Researchers', 'Submit Reviews', 'View Events', 'Export Data'],
  'Institution Admin': ['View Publications', 'Edit Own Publications', 'Approve Publications', 'Manage Researchers', 'View Projects', 'Manage Projects', 'Manage Departments', 'View Reports', 'Export Data', 'View Audit Logs'],
  Reviewer: ['View Publications', 'Submit Reviews', 'View Review Queue', 'View Assigned Papers', 'View Review History', 'View Deadlines', 'View Feedback', 'Export Data'],
  'System Admin': ['View Publications', 'Edit Publications', 'Approve Publications', 'Delete Publications', 'Manage Users', 'Manage Institutions', 'Manage Roles', 'View All Reports', 'View Audit Logs', 'Manage System Settings', 'Export Data', 'Compliance Management'],
}

const ROLE_META: Record<string, { icon: React.ElementType; color: string; description: string }> = {
  Researcher: { icon: BookOpen, color: '#2563EB', description: 'Academic researchers managing publications and projects' },
  'Institution Admin': { icon: Building2, color: '#7C3AED', description: 'Administrators managing their institution resources' },
  Reviewer: { icon: Eye, color: '#14B8A6', description: 'Peer reviewers evaluating submitted research' },
  'System Admin': { icon: Shield, color: '#F59E0B', description: 'Platform administrators with full system access' },
}

export default function AdminRoles() {
  const { users, showToast } = useAppContext()

  const [permissions, setPermissions] = useState(() => {
    const state: Record<string, Record<string, boolean>> = {}
    Object.keys(ROLE_PERMISSIONS).forEach(role => {
      state[role] = {}
      ROLE_PERMISSIONS[role].forEach(p => { state[role][p] = true })
    })
    return state
  })

  const handleToggle = (role: string, perm: string) => {
    setPermissions(prev => ({ ...prev, [role]: { ...prev[role], [perm]: !prev[role][perm] } }))
  }

  const handleSave = (role: string) => {
    showToast(`Permissions updated for ${role}`, 'success')
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage role permissions for platform users</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.keys(ROLE_PERMISSIONS).map(role => {
          const meta = ROLE_META[role]
          const Icon = meta.icon
          const userCount = users.filter(u => u.role === role).length
          const enabledCount = Object.values(permissions[role]).filter(Boolean).length
          const totalCount = Object.keys(permissions[role]).length

          return (
            <div key={role} className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: meta.color }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{role}</h3>
                    <p className="text-xs text-muted-foreground">{userCount} users · {enabledCount}/{totalCount} permissions</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{meta.description}</p>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {Object.keys(permissions[role]).map(perm => (
                  <label key={perm} className="flex items-center justify-between gap-3 py-1.5 px-2 rounded-lg hover:bg-secondary/50 cursor-pointer group">
                    <span className="text-sm text-foreground">{perm}</span>
                    <button
                      type="button"
                      onClick={() => handleToggle(role, perm)}
                      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${permissions[role][perm] ? 'text-white' : 'bg-border'}`}
                      style={permissions[role][perm] ? { background: meta.color } : {}}
                      aria-label={`Toggle ${perm}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${permissions[role][perm] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </label>
                ))}
              </div>

              <button
                onClick={() => handleSave(role)}
                className="w-full py-2 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: meta.color }}
              >
                Save Permissions
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
