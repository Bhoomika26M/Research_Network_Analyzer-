import { useState } from 'react'

interface RoleSelectProps {
  onContinue: (role: 'researcher' | 'institution' | 'admin' | 'reviewer') => void
}

const roles = [
  {
    id: 'researcher' as const,
    title: 'Researcher',
    description: 'Access publications, collaborations, and network analytics',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="1.8"/>
        <path d="M4 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'institution' as const,
    title: 'Institution Admin',
    description: 'Manage departments, researchers, and institutional analytics',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="10" width="18" height="11" rx="2" stroke="white" strokeWidth="1.8"/>
        <path d="M12 2L3 10h18L12 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        <rect x="9" y="15" width="6" height="6" rx="1" stroke="white" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'reviewer' as const,
    title: 'Reviewer',
    description: 'Review and evaluate submitted publications',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="14" height="17" rx="2" stroke="white" strokeWidth="1.8"/>
        <path d="M8 8h8M8 12h8M8 16h5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="19" cy="18" r="4" fill="white" fillOpacity="0.9"/>
        <path d="M17.5 18l1 1 2-2" stroke="#0052FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'admin' as const,
    title: 'System Admin',
    description: 'Full system access, user management, and audit controls',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L4 7v5c0 4.5 3.3 8.7 8 10 4.7-1.3 8-5.5 8-10V7L12 3z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function RoleSelect({ onContinue }: RoleSelectProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center relative overflow-hidden">
      <div className="role-select-glow" />
      <div className="role-select-dots" />

      <div className="relative w-full max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <span className="w-1.5 h-1.5 rounded-full gradient-bg"></span>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#0052FF]">Authentication</span>
          </span>
          <h1 className="font-display text-3xl text-[#0F172A] mb-2">Continue as</h1>
          <p className="text-[#64748B]">Select your role to access the appropriate dashboard</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-8">
          {roles.map((role) => {
            const isSelected = selected === role.id
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`relative p-5 rounded-2xl border-2 bg-white text-left transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'shadow-lg' : 'border-[#E2E8F0] hover:border-[#0052FF]/30'
                }`}
                style={isSelected ? { boxShadow: '0 0 0 2px #0052FF, 0 8px 24px rgba(0,82,255,0.12)' } : {}}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-bg flex items-center justify-center shadow-sm">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}

                <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center mb-3 shadow-sm">
                  {role.icon}
                </div>
                <h3 className="font-semibold text-[#0F172A] text-sm mb-1">{role.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{role.description}</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => selected && onContinue(selected as 'researcher' | 'institution' | 'admin' | 'reviewer')}
          disabled={!selected}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            selected
              ? 'gradient-bg text-white shadow-sm hover:shadow-md hover:brightness-110 active:scale-[0.99]'
              : 'bg-[#F1F5F9] text-[#64748B] cursor-not-allowed'
          }`}
        >
          {selected ? `Continue as ${roles.find(r => r.id === selected)?.title}` : 'Continue'}
        </button>
      </div>
    </div>
  )
}
