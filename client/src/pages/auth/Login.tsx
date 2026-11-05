import { useEffect, useState } from 'react'
import type { Role } from '../../permissions/config'
import { authApi } from '../../services/auth'
import { useToast } from '../../context/ToastContext'
import { ScientificLogo } from '../../components/ScientificLogo'

interface LoginProps {
  onLoginSuccess: (role: Role, user: any) => void
  onGoRegister: () => void
}

interface RoleCard {
  role: Role
  title: string
  desc: string
  usersCount: string
  iconBg: string
  pillBg: string
  iconSvg: React.ReactNode
  defaultEmail: string
}

const ROLES: RoleCard[] = [
  {
    role: 'researcher',
    title: 'Researcher',
    desc: 'Manage publications & collaborate',
    usersCount: '2,450 users',
    iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600',
    pillBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    defaultEmail: 's.chen@mit.edu',
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    role: 'institution',
    title: 'Institution Admin',
    desc: 'Oversee your institution',
    usersCount: '380 users',
    iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600',
    pillBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    defaultEmail: 'admin@mit.edu',
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth="1.8" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </svg>
    ),
  },
  {
    role: 'reviewer',
    title: 'Reviewer',
    desc: 'Review submitted papers',
    usersCount: '1,120 users',
    iconBg: 'bg-teal-100 dark:bg-teal-950/40 text-teal-600',
    pillBg: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
    defaultEmail: 'j.okafor@cambridge.ac.uk',
    iconSvg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

// System Admin is NOT a public role card.
// The admin form opens only when the URL ends with #admin (e.g. /login#admin).
const ADMIN_ROLE: RoleCard = {
  role: 'admin',
  title: 'System Admin',
  desc: 'Platform administration',
  usersCount: '',
  iconBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600',
  pillBg: '',
  defaultEmail: 'sysadmin@scicollab.io',
  iconSvg: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  ),
}

export default function Login({ onLoginSuccess, onGoRegister }: LoginProps) {
  const { showToast } = useToast()
  const [selectedRole, setSelectedRole] = useState<RoleCard | null>(null)
  const [email, setEmail] = useState('s.chen@mit.edu')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'))

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
  }

  const handleRoleCardClick = (card: RoleCard) => {
    setSelectedRole(card)
    setEmail(card.defaultEmail)
  }

  // Open the admin form directly when the URL has #admin
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setSelectedRole(ADMIN_ROLE)
        setEmail(ADMIN_ROLE.defaultEmail)
        setPassword('')
      }
    }
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const handleBack = () => {
    setSelectedRole(null)
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await authApi.login({ email, password })
      localStorage.setItem('Scientific Network_token', res.access_token)
      localStorage.setItem('Scientific Network_user', JSON.stringify(res.user))
      localStorage.setItem('Scientific Network_login_time', Date.now().toString())

      if (window.location.hash === '#admin') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }

      showToast(`Welcome back, ${res.user.name}!`, 'success')
      onLoginSuccess(res.user.role as Role, res.user)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      showToast(typeof detail === 'string' ? detail : 'Unable to sign in. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left Hero Panel */}
      <div className="hidden lg:flex lg:w-[48%] auth-gradient flex-col justify-between p-12 relative overflow-hidden text-white">
        {/* Subtle geometric circles */}
        <div className="absolute top-[-60px] right-[-60px] w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-[-50px] w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10">
          {/* Logo pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 backdrop-blur-md mb-16">
            <ScientificLogo iconOnly height={22} textColor="#FFFFFF" />
            <span className="font-display font-bold text-base tracking-tight">Scientific</span>
          </div>

          <h1 className="font-display font-bold text-4xl xl:text-5xl leading-tight mb-4 tracking-tight">
            Academic Research
            <br />
            Management Platform
          </h1>

          <p className="text-white/80 text-base max-w-md leading-relaxed mb-10">
            Empowering researchers worldwide to discover, share, and collaborate on groundbreaking science.
          </p>

          <div className="space-y-3.5 text-white/90 font-medium text-sm">
            {[
              'Manage Publications',
              'Track Citations',
              'Collaborate Globally',
              'Analyze Impact',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs">
                  {'›'}
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/15 text-xs text-white/75 flex items-center gap-6">
          <span>50,000+ Researchers</span>
          <span>•</span>
          <span>120+ Countries</span>
          <span>•</span>
          <span>2M+ Publications</span>
        </div>
      </div>

      {/* Right Form / Role Picker Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative">
        {/* Dark mode toggle top right */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={toggleDark}
            className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {darkMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        {/* Content area */}
        <div className="max-w-xl w-full mx-auto my-auto py-8">
          {!selectedRole ? (
            /* Role Selection Grid */
            <div>
              <div className="text-center mb-10">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  Welcome to Scientific
                </h2>
                <p className="text-sm text-muted-foreground mt-2">Select your role to continue</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ROLES.map((card) => (
                  <button
                    key={card.role}
                    type="button"
                    onClick={() => handleRoleCardClick(card)}
                    className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all text-left flex flex-col justify-between h-44 cursor-pointer group"
                  >
                    <div>
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}>
                        {card.iconSvg}
                      </div>
                      <h3 className="font-display font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{card.desc}</p>
                    </div>
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${card.pillBg}`}>
                        {card.usersCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center mt-8">
                <button
                  type="button"
                  onClick={onGoRegister}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Need a new account? <span className="font-bold text-primary">Register here</span>
                </button>
              </div>
            </div>
          ) : (
            /* Selected Role Login Form */
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                {'‹'} Back to role selection
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole.iconBg}`}>
                  {selectedRole.iconSvg}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground leading-tight">
                    Sign in as {selectedRole.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedRole.desc}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Institutional Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : `Enter Workspace`}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Academic Research Collaboration Network • Version 2.0
        </div>
      </div>
    </div>
  )
}
