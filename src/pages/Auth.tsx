import { useState } from 'react'
import {
  Building2,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ChevronRight,
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'
import { apiAuthErrorMessage } from '../services/apiClient'
import { authService } from '../services/authService'
import type { UserRole } from '../types'

type TabKey = 'login' | 'register' | 'forgot'

/** Roles the public may register — System Admin is never offered. */
const REGISTER_ROLES: UserRole[] = ['Researcher', 'Institution Admin', 'Reviewer']

/** Role cards on the public login page — System Admin never appears here;
 *  system admins sign in through the unlisted /admin-login URL instead. */
const LOGIN_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'Researcher', label: 'Researcher', desc: 'Manage papers, projects & collaborations' },
  { role: 'Institution Admin', label: 'Institution Admin', desc: 'Department analytics & institutional reporting' },
  { role: 'Reviewer', label: 'Reviewer', desc: 'Review assigned manuscripts & give feedback' },
]

const PENDING_MESSAGE = 'Your account is pending approval by a system administrator.'

const features = [
  'Manage Publications',
  'Track Citations',
  'Collaborate Globally',
  'Analyze Impact',
]

export default function Auth() {
  const { login, darkMode, toggleDark } = useAppContext()
  const [tab, setTab] = useState<TabKey>('login')
  const [selectedRole, setSelectedRole] = useState<UserRole>('Researcher')
  // Unlisted URL for system admins: same form, no role choices, nothing links to it.
  const isAdminLogin = window.location.pathname.replace(/\/+$/, '') === '/admin-login'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [registerRole, setRegisterRole] = useState<UserRole>('Researcher')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleTab = (t: TabKey) => {
    setTab(t)
    setError(null)
    setNotice(null)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // /admin-login sends System Admin; the public page sends the picked card
      // (the last with 3 choices, never System Admin). Backend decides.
      await login(isAdminLogin ? 'System Admin' : selectedRole, email, password)
    } catch (err) {
      setError(apiAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      await authService.register({ email, password, fullName: name, role: registerRole })
      if (registerRole === 'Researcher') {
        // Researchers are active immediately — sign them straight in.
        await login('Researcher', email, password)
      } else {
        // Institution admins and reviewers wait for a system administrator.
        setNotice(PENDING_MESSAGE)
        setPassword('')
        setConfirmPassword('')
        setTab('login')
      }
    } catch (err) {
      setError(apiAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault()
    setForgotSent(true)
  }

  const inputClass =
    'w-full py-2.5 bg-card border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors'

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] auth-gradient flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 left-[-40px] w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15">
              <svg viewBox="0 0 34 34" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
                <circle cx="17" cy="17" r="4" fill="white"/>
                <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke="white" strokeWidth="1.5" opacity="0.9"/>
                <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke="white" strokeWidth="1.5" opacity="0.7" transform="rotate(60 17 17)"/>
                <ellipse cx="17" cy="17" rx="16" ry="6" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" transform="rotate(120 17 17)"/>
                <circle cx="33" cy="17" r="2.5" fill="white"/>
                <circle cx="9" cy="28.5" r="2.5" fill="white" opacity="0.6"/>
              </svg>
              <span className="text-white font-bold text-xl tracking-tight">Scientific</span>
            </div>
          </div>

          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Academic Research<br />Management Platform
          </h1>
          <p className="text-white/70 text-lg mb-12">
            Empowering researchers worldwide to discover, share, and collaborate on groundbreaking science.
          </p>

          <ul className="space-y-4">
            {features.map(feat => (
              <li key={feat} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <ChevronRight size={12} className="text-white" />
                </div>
                <span className="text-base">{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <div className="flex gap-6 text-white/70 text-sm">
            <span>50,000+ Researchers</span>
            <span>·</span>
            <span>120+ Countries</span>
            <span>·</span>
            <span>2M+ Publications</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 bg-background flex flex-col min-h-screen">
        <div className="flex justify-end p-4">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Scientific</h2>
              <p className="text-muted-foreground">Sign in to your account or register</p>
            </div>

            <div className="flex border-b border-border mb-6">
              {(['login', 'register', 'forgot'] as TabKey[]).map(t => (
                <button
                  key={t}
                  onClick={() => handleTab(t)}
                  className={`pb-3 px-1 mr-5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'login' ? 'Sign In' : t === 'register' ? 'Register' : 'Forgot Password'}
                </button>
              ))}
            </div>

            {notice && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-4">
                {notice}
              </p>
            )}

            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {!isAdminLogin && (
                  <div>
                    <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                      Select your role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {LOGIN_ROLES.map(r => (
                        <button
                          key={r.role}
                          type="button"
                          onClick={() => setSelectedRole(r.role)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            selectedRole === r.role
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                              : 'border-border bg-background hover:bg-muted/50'
                          }`}
                        >
                          <p className="text-xs font-bold text-foreground">{r.label}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-4`}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-10`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            )}

            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-4`}
                      placeholder="Dr. Jane Smith"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-4`}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Institution</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-4`}
                      placeholder="MIT, Stanford, etc."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select
                    value={registerRole}
                    onChange={e => setRegisterRole(e.target.value as UserRole)}
                    className={`${inputClass} px-3`}
                  >
                    {REGISTER_ROLES.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-10`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className={`${inputClass} pl-9 pr-10`}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>
            )}

            {tab === 'forgot' && (
              <div>
                {forgotSent ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                      <Mail size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Check your inbox</h3>
                    <p className="text-muted-foreground text-sm">
                      A reset link has been sent to <strong>{forgotEmail}</strong>.
                    </p>
                    <button
                      onClick={() => { setForgotSent(false); setForgotEmail('') }}
                      className="mt-4 text-sm text-primary hover:underline"
                    >
                      Try a different email
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <p className="text-muted-foreground text-sm mb-2">
                      Enter your email address and we will send you a link to reset your password.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          required
                          className={`${inputClass} pl-9 pr-4`}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors"
                    >
                      Send Reset Link
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}