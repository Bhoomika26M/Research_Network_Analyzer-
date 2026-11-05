import { useState } from 'react';
import { Eye, EyeOff, FlaskConical } from 'lucide-react';
import type { Role } from '../context/RoleContext';

interface LoginProps {
  onLogin: (role: Role) => void;
  onRegister: () => void;
}

const roles: { id: Role; label: string; color: string; desc: string }[] = [
  { id: 'Researcher', label: 'Researcher', color: '#2B6CB0', desc: 'Individual researcher access' },
  { id: 'Institution Admin', label: 'Institution Admin', color: '#1F7A6C', desc: 'Manage your institution' },
  { id: 'System Admin', label: 'System Admin', color: '#C0392B', desc: 'Full platform control' },
  { id: 'Reviewer', label: 'Reviewer', color: '#6B46C1', desc: 'Review submissions' },
];

const defaultEmails: Record<Role, string> = {
  'Researcher': 'schen@mit.edu',
  'Institution Admin': 'admin@mit.edu',
  'System Admin': 'sysadmin@scna.edu',
  'Reviewer': 'reviewer@scna.edu',
};

export default function Login({ onLogin, onRegister }: LoginProps) {
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('Researcher');
  const [email, setEmail] = useState(defaultEmails['Researcher']);
  const [password, setPassword] = useState('');

  function selectRole(r: Role) {
    setSelectedRole(r);
    setEmail(defaultEmails[r]);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0D1F33 0%, #16324F 45%, #1a3d60 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background dot pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(201,162,75,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 52, height: 52, borderRadius: 14,
            background: '#C9A24B', marginBottom: 12,
          }}>
            <FlaskConical size={26} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
            SciCollab
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>
            Scientific Collaboration Network Analyzer
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 36, borderRadius: 16 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 20, color: '#1B1F27', margin: '0 0 4px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 13.5, color: '#5B6472', margin: '0 0 22px' }}>
            Sign in to your research account
          </p>

          {/* ── Role selector ── */}
          <div style={{ marginBottom: 22 }}>
            <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>Sign in as</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {roles.map(r => {
                const active = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => selectRole(r.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: `2px solid ${active ? r.color : '#E1E4E8'}`,
                      background: active ? `${r.color}10` : '#FAFBFC',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: r.color,
                        opacity: active ? 1 : 0.4,
                      }} />
                      <span style={{
                        fontSize: 12.5,
                        fontWeight: active ? 700 : 500,
                        color: active ? r.color : '#5B6472',
                        fontFamily: 'Poppins',
                      }}>{r.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', paddingLeft: 15 }}>{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Email address</label>
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@institution.edu"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label className="field-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="field-input"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingRight: 40 }}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 2,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 22 }}>
            <span style={{ fontSize: 13, color: '#16324F', cursor: 'pointer', fontWeight: 500 }}>
              Forgot password?
            </span>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', fontSize: 14 }}
            onClick={() => onLogin(selectedRole)}
          >
            Log In as {selectedRole}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#E1E4E8' }} />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#E1E4E8' }} />
          </div>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#5B6472', margin: 0 }}>
            {"Don't have an account? "}
            <span style={{ color: '#16324F', fontWeight: 600, cursor: 'pointer' }} onClick={onRegister}>
              Register
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
