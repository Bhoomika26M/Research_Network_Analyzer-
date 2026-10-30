import { useState } from 'react';
import { Eye, EyeOff, FlaskConical, ChevronDown } from 'lucide-react';

interface RegisterProps {
  onLogin: () => void;
}

export default function Register({ onLogin }: RegisterProps) {
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #0D1F33 0%, #16324F 45%, #1a3d60 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(201,162,75,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 12, background: '#C9A24B', marginBottom: 10,
          }}>
            <FlaskConical size={22} color="#fff" />
          </div>
          <div style={{ color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: 18 }}>SciCollab</div>
        </div>

        <div className="card" style={{ padding: 36, borderRadius: 16 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 20, color: '#1B1F27', margin: '0 0 4px' }}>
            Create your account
          </h2>
          <p style={{ fontSize: 13.5, color: '#5B6472', margin: '0 0 24px' }}>
            Join the research collaboration network
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="field-label">Full Name</label>
              <input className="field-input" type="text" placeholder="Dr. Jane Smith" />
            </div>
            <div>
              <label className="field-label">Email</label>
              <input className="field-input" type="email" placeholder="you@university.edu" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="field-input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Create a password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="field-label">Confirm Password</label>
              <input className="field-input" type="password" placeholder="Repeat password" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="field-label">Role</label>
              <div style={{ position: 'relative' }}>
                <select className="field-input" style={{ appearance: 'none', paddingRight: 32 }}>
                  <option>Researcher</option>
                  <option>Institution Admin</option>
                  <option>Reviewer</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              </div>
            </div>
            <div>
              <label className="field-label">Institution</label>
              <input className="field-input" type="text" placeholder="Search institution…" />
            </div>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 2, accentColor: '#16324F', width: 15, height: 15 }}
              />
              <span style={{ fontSize: 13, color: '#5B6472', lineHeight: 1.5 }}>
                I agree to the{' '}
                <span style={{ color: '#16324F', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span>
                {' '}and{' '}
                <span style={{ color: '#16324F', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>
              </span>
            </label>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px 18px', fontSize: 14, opacity: agreed ? 1 : 0.6 }}
            onClick={agreed ? onLogin : undefined}
          >
            Create Account
          </button>

          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#5B6472', margin: '16px 0 0' }}>
            Already have an account?{' '}
            <span style={{ color: '#16324F', fontWeight: 600, cursor: 'pointer' }} onClick={onLogin}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
