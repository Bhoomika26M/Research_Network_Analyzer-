import { useState } from 'react';
import { RoleContext, makeRoleContextValue, type Role } from './context/RoleContext';
import { DarkModeProvider, useDark } from './context/DarkModeContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Publications from './screens/Publications';

function AppShell() {
  const { dark } = useDark();
  const [activePage, setActivePage] = useState<string>('publications');
  const [role, setRole] = useState<Role>('Researcher');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const roleCtx = makeRoleContextValue(role, (r) => {
    setRole(r);
  });

  function handleNavigate(id: string) {
    // Only Publications is functional; navigating stays on publications safely
    setActivePage('publications');
  }

  const bg = dark ? '#0f1923' : '#F5F6F8';

  return (
    <RoleContext.Provider value={roleCtx}>
      <div style={{ display: 'flex', height: '100vh', background: bg, transition: 'background 0.2s' }}>
        <Sidebar
          active={activePage}
          onNavigate={handleNavigate}
          onLogout={() => {}}
        />
        <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
          <TopBar
            activePage={activePage}
            onNavigate={handleNavigate}
            onLogout={() => {}}
            onSearchChange={setSearchQuery}
          />
          <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: bg, transition: 'background 0.2s' }}>
            <Publications externalSearch={searchQuery} />
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
