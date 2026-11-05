import { useState } from 'react'

interface RoleSelectProps {
  onContinue: (role: 'researcher' | 'institution' | 'admin' | 'reviewer') => void
}

const roles = [
  {
    id: 'researcher' as const,
    title: 'Researcher',
    description: 'Explore publications, collaboration graphs, and research network metrics',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'institution' as const,
    title: 'Institution Admin',
    description: 'Manage departmental productivity, faculty accounts, and institutional impact',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2L3 10h18L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <rect x="9" y="15" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'reviewer' as const,
    title: 'Reviewer',
    description: 'Review submissions, grade manuscripts, and inspect preprint findings',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="19" cy="18" r="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M17.5 18l1 1 2-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'admin' as const,
    title: 'System Admin',
    description: 'Enterprise governance, user directories, role permissions, and audit logs',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7v5c0 4.5 3.3 8.7 8 10 4.7-1.3 8-5.5 8-10V7L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function RoleSelect({ onContinue }: RoleSelectProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center relative overflow-hidden p-6">
      <div className="role-select-glow" />
      <div className="role-select-dots" />

      <div className="relative w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold">
              Role-Based Workspace
            </span>
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3 tracking-tight">
            Select Your Workspace
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Choose which perspective you want to operate in for this analytical session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roles.map((role) => {
            const isSelected = selected === role.id
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`relative p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-card border-primary ring-2 ring-primary/30 shadow-lg'
                    : 'bg-card border-border hover:border-primary/40 hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-xs">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  isSelected ? 'bg-primary text-white shadow-xs' : 'bg-secondary text-primary'
                }`}>
                  {role.icon}
                </div>
                <h3 className="font-display font-bold text-foreground text-base mb-1.5">{role.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => selected && onContinue(selected as 'researcher' | 'institution' | 'admin' | 'reviewer')}
          disabled={!selected}
          className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
            selected
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.99]'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
          }`}
        >
          {selected ? `Enter as ${roles.find((r) => r.id === selected)?.title}` : 'Choose a role to continue'}
        </button>
      </div>
    </div>
  )
}

