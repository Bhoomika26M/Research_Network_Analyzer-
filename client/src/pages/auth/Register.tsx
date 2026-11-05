import { useState, useEffect } from 'react'
import type { Role } from '../../permissions/config'
import { authApi } from '../../services/auth'
import { securityApi, PasswordPolicy } from '../../services/security'
import { useToast } from '../../context/ToastContext'
import { ScientificLogo } from '../../components/ScientificLogo'

interface RegisterProps {
  onRegisterSuccess: (role: Role, user: any) => void
  onGoLogin: () => void
}

interface RoleOption {
  id: Role
  label: string
  desc: string
  iconBg: string
  iconSvg: React.ReactNode
}

const ROLES: RoleOption[] = [
  {
    id: 'researcher',
    label: 'Researcher',
    desc: 'Manage publications & collaborate',
    iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    id: 'institution',
    label: 'Institution Admin',
    desc: 'Oversee your institution',
    iconBg: 'bg-purple-100 dark:bg-purple-950/40 text-purple-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
      </svg>
    ),
  },
  {
    id: 'reviewer',
    label: 'Reviewer',
    desc: 'Review submitted papers',
    iconBg: 'bg-teal-100 dark:bg-teal-950/40 text-teal-600',
    iconSvg: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
]

const defaultPolicy: PasswordPolicy = {
  minPasswordLen: 8,
  requireSpecialChar: true,
  requireUppercase: true,
}

export default function Register({ onRegisterSuccess, onGoLogin }: RegisterProps) {
  const { showToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role>('researcher')
  const [loading, setLoading] = useState(false)
  const [policy, setPolicy] = useState<PasswordPolicy>(() => {
    try {
      const saved = localStorage.getItem('Scientific Network_security_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          minPasswordLen: Number(parsed.minPasswordLen) || 8,
          requireSpecialChar: Boolean(parsed.requireSpecialChar),
          requireUppercase: Boolean(parsed.requireUppercase),
        }
      }
    } catch {
      // fallback to defaults
    }
    return defaultPolicy
  })

  useEffect(() => {
    securityApi
      .getPolicy()
      .then((p) => {
        if (p) setPolicy(p)
      })
      .catch(() => {})
  }, [])

  const hasMinLen = password.length >= policy.minPasswordLen
  const hasUpper = !policy.requireUppercase || /[A-Z]/.test(password)
  const hasSpecial = !policy.requireSpecialChar || /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)
  const isPasswordValid = hasMinLen && hasUpper && hasSpecial

  const selectedLabel = ROLES.find((r) => r.id === selectedRole)?.label ?? 'Researcher'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isPasswordValid) {
      if (!hasMinLen) {
        showToast(`Password must be at least ${policy.minPasswordLen} characters long`, 'error')
        return
      }
      if (!hasUpper) {
        showToast('Password must contain at least one uppercase letter (A-Z)', 'error')
        return
      }
      if (!hasSpecial) {
        showToast('Password must contain at least one special character (!@#$...)', 'error')
        return
      }
    }

    setLoading(true)

    try {
      const res = await authApi.register({
        name,
        email,
        password,
        role: selectedRole,
      })
      localStorage.setItem('Scientific Network_token', res.access_token)
      localStorage.setItem('Scientific Network_user', JSON.stringify(res.user))
      localStorage.setItem('Scientific Network_login_time', Date.now().toString())

      showToast(`Account created as ${selectedLabel}!`, 'success')
      onRegisterSuccess(selectedRole, res.user)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      showToast(typeof detail === 'string' ? detail : 'Unable to create account. Please check your inputs.', 'error')
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
            Join the Global
            <br />
            Research Community
          </h1>

          <p className="text-white/80 text-base max-w-md leading-relaxed mb-10">
            Create your account to start tracking citations, analyzing co-authorship graphs, and
            collaborating across top institutions.
          </p>

          <div className="space-y-3.5 text-white/90 font-medium text-sm">
            {['Manage Publications', 'Track Citations', 'Collaborate Globally', 'Analyze Impact'].map((f) => (
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

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 relative">
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            New Registration
          </span>
        </div>

        <div className="max-w-xl w-full mx-auto my-auto py-8">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <h2 className="font-display font-bold text-2xl text-foreground tracking-tight">Create Account</h2>
            <p className="text-sm text-muted-foreground mt-1.5 mb-6">
              Select your role and enter your institutional details
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">Select Workspace Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROLES.map((r) => {
                    const active = selectedRole === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRole(r.id)}
                        aria-pressed={active}
                        className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                          active
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                            : 'border-border bg-card hover:border-primary/40 hover:shadow-md'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                              <path
                                d="M2 6.2l2.6 2.6L10 3.4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${r.iconBg}`}>
                          {r.iconSvg}
                        </div>
                        <p
                          className={`font-display font-bold text-xs leading-tight transition-colors ${
                            active ? 'text-primary' : 'text-foreground group-hover:text-primary'
                          }`}
                        >
                          {r.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{r.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Dr. Sarah Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Institutional Email</label>
                <input
                  type="email"
                  placeholder="s.chen@mit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />

                {/* Live policy checklist */}
                <div className="mt-2.5 p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Security Requirements:
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        hasMinLen ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {hasMinLen ? '✓' : '•'}
                    </span>
                    <span
                      className={
                        hasMinLen ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                      }
                    >
                      At least {policy.minPasswordLen} characters
                    </span>
                  </div>
                  {policy.requireUppercase && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          hasUpper ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {hasUpper ? '✓' : '•'}
                      </span>
                      <span
                        className={
                          hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                        }
                      >
                        At least one uppercase letter (A-Z)
                      </span>
                    </div>
                  )}
                  {policy.requireSpecialChar && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          hasSpecial ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {hasSpecial ? '✓' : '•'}
                      </span>
                      <span
                        className={
                          hasSpecial ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
                        }
                      >
                        At least one special symbol (!@#$...)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (password.length > 0 && !isPasswordValid)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-semibold rounded-xl text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {loading ? 'Registering...' : `Register as ${selectedLabel}`}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 5l4 3-4 3"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Already registered?{' '}
              <button
                type="button"
                onClick={onGoLogin}
                className="font-bold text-primary hover:underline transition-colors"
              >
                Sign in to your account
              </button>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Academic Research Collaboration Network • Version 2.0
        </div>
      </div>
    </div>
  )
}
