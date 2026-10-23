import { useState, useEffect } from 'react';
import { Shield, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { RoleContext, makeRoleContextValue, type Role } from './context/RoleContext';
import { DarkModeProvider, useDark } from './context/DarkModeContext';
import AuditLogs from './screens/AuditLogs';
import Settings from './screens/Settings';
import { api } from './services/api';

type Page = 'audit' | 'settings';

function AppContent() {
  const [page, setPage] = useState<Page>('audit');
  const [role, setRoleState] = useState<Role>('System Admin');
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const { dark, toggle: toggleDark } = useDark();

  useEffect(() => {
    // Check backend health & auto-authenticate
    api.checkHealth().then(online => {
      setBackendOnline(online);
      if (online) {
        api.login().catch(() => {});
      }
    });

    const interval = setInterval(() => {
      api.checkHealth().then(setBackendOnline);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    api.switchRole(newRole).catch(() => {});
  };

  const roleCtx = makeRoleContextValue(role, setRole);

  const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType }[] = [
    { id: 'audit', label: 'Audit Logs', icon: Shield },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <RoleContext.Provider value={roleCtx}>
      <div style={{ minHeight: '100vh', background: dark ? '#0f1923' : '#F5F6F8', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <header style={{
          background: '#16324F',
          padding: '0 28px',
          height: 58,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          gap: 16,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'rgba(201,162,75,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Shield size={18} color="#C9A24B" />
            </div>
            <div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>
                Audit & Settings
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                SciCollab Admin Portal
              </div>
            </div>
          </div>

          {/* Nav buttons */}
          <nav style={{ display: 'flex', gap: 4 }} aria-label="Main navigation">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`nav-${id}`}
                type="button"
                onClick={() => setPage(id)}
                aria-current={page === id ? 'page' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '7px 16px',
                  borderRadius: 7,
                  background: page === id ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: page === id ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: 13.5,
                  fontWeight: page === id ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                  transition: 'background 0.15s, color 0.15s',
                  cursor: 'pointer',
                  border: page === id ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </nav>

          {/* Right controls: Backend Status, Role Switcher, Dark mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Backend status indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 11.5,
                color: '#fff',
              }}
              title="PostgreSQL & FastAPI Backend connection"
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: backendOnline === true ? '#22C55E' : backendOnline === false ? '#EF4444' : '#F59E0B',
                  display: 'inline-block',
                }}
              />
              <span style={{ opacity: 0.9 }}>
                {backendOnline === true ? 'API Connected' : backendOnline === false ? 'Offline' : 'Connecting...'}
              </span>
            </div>

            {/* Role switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter, sans-serif' }}>Role:</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  id="role-switcher"
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  aria-label="Active user role"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 7,
                    color: '#fff',
                    padding: '5px 28px 5px 10px',
                    fontSize: 12.5,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                  }}
                >
                  <option value="Researcher" style={{ background: '#16324F', color: '#fff' }}>Researcher</option>
                  <option value="Institution Admin" style={{ background: '#16324F', color: '#fff' }}>Institution Admin</option>
                  <option value="System Admin" style={{ background: '#16324F', color: '#fff' }}>System Admin</option>
                  <option value="Reviewer" style={{ background: '#16324F', color: '#fff' }}>Reviewer</option>
                </select>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  style={{ position: 'absolute', right: 8, pointerEvents: 'none', color: 'rgba(255,255,255,0.6)' }}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Dark mode button */}
            <button
              id="btn-toggle-dark"
              type="button"
              onClick={toggleDark}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: '#fff',
                transition: 'background 0.15s',
              }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: 1280, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {page === 'audit' ? <AuditLogs /> : <Settings />}
        </main>
      </div>
    </RoleContext.Provider>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}
