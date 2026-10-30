import { useState } from 'react';
import { RoleContext, makeRoleContextValue, type Role } from './context/RoleContext';
import { DarkModeProvider, useDark } from './context/DarkModeContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import Researchers from './screens/Researchers';
import Publications from './screens/Publications';
import Collaborations from './screens/Collaborations';
import Conferences from './screens/Conferences';
import Citations from './screens/Citations';
import Reports from './screens/Reports';
import AuditLogs from './screens/AuditLogs';
import Settings from './screens/Settings';
import Notifications from './screens/Notifications';
import { initialNotifications, type AppNotification } from './types/notifications';

type AuthState = 'login' | 'register' | 'app';
type Page = 'dashboard' | 'researchers' | 'publications' | 'collaborations' | 'conferences' | 'citations' | 'reports' | 'audit' | 'settings' | 'notifications';

function AppShell() {
  const { dark } = useDark();
  const [auth, setAuth] = useState<AuthState>('login');
  const [page, setPage] = useState<Page>('dashboard');
  const [prevPage, setPrevPage] = useState<Page>('dashboard');
  const [role, setRole] = useState<Role>('Researcher');
  const [notifs, setNotifs] = useState<AppNotification[]>(initialNotifications);

  const roleCtx = makeRoleContextValue(role, (r) => {
    setRole(r);
    const allowed = makeRoleContextValue(r, () => {}).hasModule;
    if (!allowed(page)) setPage('dashboard');
  });

  function navigate(id: string) {
    if (id === 'notifications') {
      setPrevPage(page === 'notifications' ? prevPage : page);
    }
    setPage(id as Page);
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  }

  function markRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  }

  const bg = dark ? '#0f1923' : '#F5F6F8';

  const screenMap: Record<Page, React.ReactNode> = {
    dashboard:      <Dashboard />,
    researchers:    <Researchers />,
    publications:   <Publications />,
    collaborations: <Collaborations />,
    conferences:    <Conferences />,
    citations:      <Citations />,
    reports:        <Reports />,
    audit:          <AuditLogs />,
    settings:       <Settings />,
    notifications:  <Notifications notifs={notifs} onMarkAllRead={markAllRead} onMarkRead={markRead} onBack={() => setPage(prevPage)} />,
  };

  if (auth === 'login') {
    return <Login onLogin={(r) => { setRole(r); setPage('dashboard'); setAuth('app'); }} onRegister={() => setAuth('register')} />;
  }
  if (auth === 'register') {
    return <Register onLogin={() => setAuth('app')} />;
  }

  return (
    <RoleContext.Provider value={roleCtx}>
      <div style={{ display: 'flex', height: '100vh', background: bg, transition: 'background 0.2s' }}>
        <Sidebar
          active={page}
          onNavigate={navigate}
          onLogout={() => setAuth('login')}
        />
        <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
          <TopBar
            activePage={page}
            onNavigate={navigate}
            onLogout={() => setAuth('login')}
            notifs={notifs}
            onMarkAllRead={markAllRead}
            onMarkRead={markRead}
          />
          <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: bg, transition: 'background 0.2s' }}>
            {screenMap[page]}
          </main>
        </div>
      </div>
    </RoleContext.Provider>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AppShell />
    </DarkModeProvider>
  );
}
