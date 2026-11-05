import { useState } from 'react'
import type { Role } from '../../permissions/config'
import { authApi } from '../../services/auth'
import { useToast } from '../../context/ToastContext'

interface LoginProps {
  onLoginSuccess: (role: Role, user: any) => void
  onGoRegister: () => void
}

export default function Login({ onLoginSuccess, onGoRegister }: LoginProps) {
  const { showToast } = useToast()
  const [email, setEmail] = useState('s.chen@mit.edu')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await authApi.login({ email, password })
      localStorage.setItem('scicollab_token', res.access_token)
      localStorage.setItem('scicollab_user', JSON.stringify(res.user))

      showToast(`Welcome back, ${res.user.name}!`, 'success')
      // Log in with role attached to account in PostgreSQL
      onLoginSuccess(res.user.role as Role, res.user)
    } catch (err: any) {
      // No demo fallback: every session requires a valid backend token.
      const detail = err?.response?.data?.detail
      showToast(typeof detail === 'string' ? detail : 'Unable to sign in. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ── LEFT PANEL ─────────────────────────────────────────── */}
      <div className="auth-panel-left">
        {/* Dot-grid texture */}
        <div className="auth-dot-grid" />

        {/* Decorative shapes — all contained within left panel */}
        {/* Dashed rotating ring */}
        <div className="auth-shape-ring">
          <svg className="auth-ring-svg" viewBox="0 0 240 240" fill="none">
            <circle cx="120" cy="120" r="110" stroke="url(#ringGrad)" strokeWidth="1.5" strokeDasharray="6 10" opacity="0.45" />
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0052FF" />
                <stop offset="1" stopColor="#4D7CFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Filled accent circle */}
        <div className="auth-shape-circle" />

        {/* Rounded rectangle accent block */}
        <div className="auth-shape-rect" />

        {/* Small filled square */}
        <div className="auth-shape-square" />

        {/* Large soft glow blob */}
        <div className="auth-shape-blob" />

        <div className="auth-content">
          <div className="auth-logo">
            <div className="auth-logo-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="6" r="3" fill="white" />
                <circle cx="4.5" cy="17" r="3" fill="white" />
                <circle cx="19.5" cy="17" r="3" fill="white" />
                <line x1="12" y1="9" x2="4.5" y2="14" stroke="white" strokeWidth="1.8" />
                <line x1="12" y1="9" x2="19.5" y2="14" stroke="white" strokeWidth="1.8" />
                <line x1="7.5" y1="17" x2="16.5" y2="17" stroke="white" strokeWidth="1.8" />
              </svg>
            </div>
            <span className="auth-logo-text">
              <span className="auth-logo-dot">·</span> SciCollab
            </span>
          </div>

          <h1 className="auth-heading">
            Welcome<br />
            <span className="auth-heading-word">
              <span className="gradient-text">Back</span>
              <span className="auth-heading-underline" />
            </span>
          </h1>

          <p className="auth-subtitle">
            Sign in to access your registered research network dashboard and publications.
          </p>

          <div className="auth-stats">
            {[
              { val: '24K+', label: 'Publications' },
              { val: '3.8K', label: 'Researchers' },
              { val: '127', label: 'Institutions' },
            ].map(s => (
              <div key={s.label} className="auth-stat">
                <p className="auth-stat-value">{s.val}</p>
                <p className="auth-stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────── */}
      <div className="auth-panel-right">
        <div className="auth-card-wrap">
          <div className="auth-card">
            <div className="auth-badge">
              <span className="auth-badge-dot" />
              <span className="auth-badge-text">Sign In</span>
            </div>

            <h2 className="auth-card-title">Sign In to SciCollab</h2>
            <p className="auth-card-subtitle">Enter your registered email and password</p>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Email */}
              <div>
                <label className="auth-field-label">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="auth-field-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>

              <div className="auth-row">
                <label className="auth-check">
                  <input type="checkbox" defaultChecked className="auth-checkbox" />
                  <span className="auth-check-text">Remember me</span>
                </label>
                <button type="button" className="auth-link">
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? 'Signing In...' : 'Sign In'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 5l4 3-4 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>

            <p className="auth-footer">
              {"Don't have an account? "}
              <button onClick={onGoRegister} className="auth-link auth-link--lg">
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
