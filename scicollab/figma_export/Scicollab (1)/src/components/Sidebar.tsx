import {
  LayoutDashboard, Users, BookOpen, Network, CalendarDays,
  Quote, BarChart3, Shield, Settings, LogOut, FlaskConical,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';

const allNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'researchers', label: 'Researchers', icon: Users },
  { id: 'publications', label: 'Publications', icon: BookOpen },
  { id: 'collaborations', label: 'Collaborations', icon: Network },
  { id: 'conferences', label: 'Conferences', icon: CalendarDays },
  { id: 'citations', label: 'Citations', icon: Quote },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'audit', label: 'Audit Logs', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ active, onNavigate, onLogout }: SidebarProps) {
  const { hasModule } = useRole();
  const navItems = allNavItems.filter(item => hasModule(item.id));

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: '#16324F',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: '#C9A24B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FlaskConical size={18} color="#fff" strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>SciCollab</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 500, letterSpacing: '0.03em' }}>Network Analyzer</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 10, overflowY: 'auto' }}>
        <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Main Menu
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className={`sidebar-nav-item${active === id ? ' active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={16} strokeWidth={active === id ? 2.2 : 1.8} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 8px' }}>
        <div className="sidebar-nav-item" onClick={onLogout} style={{ color: 'rgba(255,255,255,0.5)' }}>
          <LogOut size={15} strokeWidth={1.8} />
          <span>Log Out</span>
        </div>
      </div>
    </aside>
  );
}
