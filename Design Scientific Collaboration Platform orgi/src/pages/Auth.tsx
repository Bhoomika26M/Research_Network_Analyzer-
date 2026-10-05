import { useState } from 'react'
import {
  BookOpen,
  Building2,
  ShieldCheck,
  Crown,
  Moon,
  Sun,
  ArrowLeft,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ChevronRight,
} from 'lucide-react'
import { useAppContext } from '../contexts/AppContext'

type RoleKey = 'researcher' | 'institution admin' | 'reviewer' | 'system admin'
type TabKey = 'login' | 'register' | 'forgot'

interface RoleConfig {
  key: RoleKey
  label: string
  description: string
  icon: React.ElementType
  color: string
  iconBg: string
  userCount: string
  email: string
}

const roles: RoleConfig[] = [
  {
    key: 'researcher',
    label: 'Researcher',
    description: 'Manage publications & collaborate',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    userCount: '2,450 users',
    email: 'sarah.chen@mit.edu',
  },
  {
    key: 'institution admin',
    label: 'Institution Admin',
    description: 'Oversee your institution',
    icon: Building2,
    color: 'text-purple-700 dark:text-purple-300',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    userCount: '380 users',
    email: 'j.wilson@stanford.edu',
  },
  {
    key: 'reviewer',
    label: 'Reviewer',
    description: 'Review submitted papers',
    icon: ShieldCheck,
    color: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    userCount: '1,120 users',
    email: 'm.rodriguez@ethz.ch',
  },
  {
    key: 'system admin',
    label: 'System Admin',
    description: 'Platform administration',
    icon: Crown,
    color: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    userCount: '12 users',
    email: 'a.thompson@scientific.app',
  },
]

const features = [
  'Manage Publications',
  'Track Citations',
  'Collaborate Globally',
  'Analyze Impact',
]

export default function Auth() {
  const { login, darkMode, toggleDark } = useAppContext()
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null)
  const [tab, setTab] = useState<TabKey>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleSelectRole = (role: RoleConfig) => {
    setSelectedRole(role)
    setEmail(role.email)
    setPassword('')
    setTab('login')
  }

  const handleBack = () => {
    setSelectedRole(null)
    setTab('login')
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    login(selectedRole.key)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return
    login(selectedRole.key)
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
                <circle cx="9" cy="5.5" r="2.5" fill="white" opacity="0.8"/>
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
            {!selectedRole ? (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Scientific</h2>
                  <p className="text-muted-foreground">Select your role to continue</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map(role => {
                    const Icon = role.icon
                    return (
                      <button
                        key={role.key}
                        onClick={() => handleSelectRole(role)}
                        className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200"
                      >
                        <div className={`w-10 h-10 rounded-xl ${role.iconBg} flex items-center justify-center mb-3`}>
                          <Icon size={20} className={role.color} />
                        </div>
                        <p className="font-semibold text-foreground text-sm mb-0.5">{role.label}</p>
                        <p className="text-muted-foreground text-xs mb-2 leading-snug">{role.description}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${role.iconBg} ${role.color}`}>
                          {role.userCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
                >
                  <ArrowLeft size={15} />
                  Back to role selection
                </button>

                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-8 h-8 rounded-lg ${selectedRole.iconBg} flex items-center justify-center`}>
                    <selectedRole.icon size={16} className={selectedRole.color} />
                  </div>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${selectedRole.iconBg} ${selectedRole.color}`}>
                    {selectedRole.label}
                  </span>
                </div>

                <div className="flex border-b border-border mb-6">
                  {(['login', 'register', 'forgot'] as TabKey[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
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

                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
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
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors mt-2"
                    >
                      Sign In as {selectedRole.label}
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
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border rounded-xl">
                        <selectedRole.icon size={16} className={selectedRole.color} />
                        <span className="text-sm text-foreground">{selectedRole.label}</span>
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
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-colors mt-2"
                    >
                      Create Account
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
