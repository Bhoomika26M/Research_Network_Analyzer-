import { BookOpenCheck, UserCog, ShieldCheck, Crown, Users, ArrowRight, Lock, Globe, FileText, Activity } from 'lucide-react'

interface RolesProps {
  onSelectRole: (roleId: string) => void
}

const roles = [
  {
    id: 'researcher',
    name: 'Researcher',
    description: 'Core academic user with access to publications, citations, collaborations, and personal research data.',
    icon: BookOpenCheck,
    color: '#2563EB',
    gradient: 'from-blue-500 to-blue-700',
    users: 1284,
    accessLevel: 'Standard',
    perms: ['View & submit publications', 'Manage personal profile', 'Send collaboration requests', 'Access citation analytics'],
    highlights: [
      { icon: FileText, label: '187 publications' },
      { icon: Users, label: '34 co-authors' },
      { icon: Activity, label: 'h-index: 42' },
    ],
  },
  {
    id: 'institution-admin',
    name: 'Institution Admin',
    description: 'Manages researchers and resources within a specific institution or university department.',
    icon: UserCog,
    color: '#7C3AED',
    gradient: 'from-violet-500 to-purple-700',
    users: 218,
    accessLevel: 'Elevated',
    perms: ['Everything in Researcher', 'Manage institution members', 'View institution analytics', 'Control department budget'],
    highlights: [
      { icon: Users, label: '342 researchers' },
      { icon: FileText, label: '28 active projects' },
      { icon: Globe, label: '6 departments' },
    ],
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Peer reviewer with read-only access to assigned manuscripts and structured review submission.',
    icon: ShieldCheck,
    color: '#14B8A6',
    gradient: 'from-teal-400 to-teal-600',
    users: 473,
    accessLevel: 'Limited',
    perms: ['View assigned manuscripts', 'Submit structured reviews', 'Manage personal profile', 'Communicate with editors'],
    highlights: [
      { icon: FileText, label: '8 pending reviews' },
      { icon: Activity, label: '34 completed' },
      { icon: Users, label: 'Avg rating 4.7' },
    ],
  },
  {
    id: 'system-admin',
    name: 'System Admin',
    description: 'Full platform access including user management, audit logs, security controls, and global configuration.',
    icon: Crown,
    color: '#F59E0B',
    gradient: 'from-amber-400 to-orange-500',
    users: 12,
    accessLevel: 'Full Access',
    perms: ['All platform permissions', 'User & role management', 'System configuration', 'Security & audit logs'],
    highlights: [
      { icon: Users, label: '1,987 total users' },
      { icon: Lock, label: '99.9% uptime' },
      { icon: Activity, label: '14 pending approvals' },
    ],
  },
]

const accessColors: Record<string, { pill: string; dot: string }> = {
  Limited:      { pill: 'bg-secondary text-secondary-foreground', dot: '#94A3B8' },
  Standard:     { pill: 'bg-blue-500/10 text-blue-600 dark:text-blue-300', dot: '#2563EB' },
  Elevated:     { pill: 'bg-violet-500/10 text-violet-600 dark:text-violet-300', dot: '#7C3AED' },
  'Full Access':{ pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-300', dot: '#F59E0B' },
}

export default function Roles({ onSelectRole }: RolesProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground">Choose a Role</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Select a role to open its dedicated dashboard with tailored tools, metrics, and workflows.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {roles.map(role => {
            const ac = accessColors[role.accessLevel]
            return (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="group text-left bg-card border border-border rounded-2xl overflow-hidden hover:border-transparent transition-all duration-200 card-hover"
                style={{ '--hover-shadow': `0 12px 40px ${role.color}20` } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 40px ${role.color}22`, e.currentTarget.style.borderColor = `${role.color}40`)}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '', e.currentTarget.style.borderColor = '')}
              >
                {/* Colored top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${role.gradient}`} />

                <div className="p-5">
                  {/* Icon + name row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0`}
                        style={{ boxShadow: `0 6px 20px ${role.color}35` }}
                      >
                        <role.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">{role.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />{role.users.toLocaleString()} users
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ac.pill}`}>
                            {role.accessLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0"
                      style={{ backgroundColor: `${role.color}15`, color: role.color }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{role.description}</p>

                  {/* Highlight stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {role.highlights.map((h, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl bg-secondary/60 text-center">
                        <h.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground leading-tight">{h.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Permissions preview */}
                  <div className="space-y-1.5">
                    {role.perms.map((p, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${role.color}18` }}>
                          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" style={{ color: role.color }}>
                            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-xs text-foreground/75">{p}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div
                    className="mt-5 w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-colors"
                    style={{ backgroundColor: `${role.color}12`, color: role.color }}
                  >
                    Open {role.name} Dashboard
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
