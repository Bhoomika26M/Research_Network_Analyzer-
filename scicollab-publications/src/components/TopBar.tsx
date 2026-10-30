import { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Check, LogOut, User, Settings, ChevronRight } from 'lucide-react';
import { useRole, type Role } from '../context/RoleContext';
import { useDark } from '../context/DarkModeContext';

const roleConfig: Record<Role, { color: string; bg: string }> = {
  'Researcher':       { color: '#2B6CB0', bg: '#EBF4FF' },
  'Institution Admin':{ color: '#1F7A6C', bg: '#e8f5f3' },
  'System Admin':     { color: '#C0392B', bg: '#fdf0ef' },
  'Reviewer':         { color: '#6B46C1', bg: '#f3eeff' },
};

const roles: Role[] = ['Researcher', 'Institution Admin', 'System Admin', 'Reviewer'];

interface AppNotification {
  id: number;
  title: string;
  msg: string;
  time: string;
  unread: boolean;
}

const initialNotifications: AppNotification[] = [
  { id: 1, title: 'Publication Approved', msg: 'Your paper "Federated Learning with DP..." was approved for publishing.', time: '10m ago', unread: true },
  { id: 2, title: 'New Co-Author Added', msg: 'Prof. James Okafor added you as a co-author on CRISPR study.', time: '1h ago', unread: true },
  { id: 3, title: 'Citation Alert', msg: 'Your publication reached 120+ citations on Nature ML.', time: '2d ago', unread: false },
];

interface TopBarProps {
  activePage: string;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  onSearchChange?: (q: string) => void;
}

export default function TopBar({ activePage, onNavigate, onLogout, onSearchChange }: TopBarProps) {
  const { role, setRole } = useRole();
  const { dark, toggle: toggleDark } = useDark();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSubOpen, setRoleSubOpen] = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>(initialNotifications);
  const [topSearch, setTopSearch] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
        setRoleSubOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasUnread = notifs.some(n => n.unread);

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  }

  function markRead(id: number) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  }

  const rc = roleConfig[role];
  const surface = dark ? '#1c2a3a' : '#fff';
  const border  = dark ? '#2a3a50' : '#E1E4E8';
  const text1   = dark ? '#e8edf2' : '#1B1F27';
  const text2   = dark ? '#8fa3b8' : '#5B6472';
  const text3   = dark ? '#5a7490' : '#9CA3AF';
  const bgHover = dark ? 'rgba(255,255,255,0.06)' : '#F5F6F8';
  const headerBg = dark ? '#162030' : '#fff';
  const headerBorder = dark ? '#2a3a50' : '#E1E4E8';

  const iconBtn = (active?: boolean): React.CSSProperties => ({
    width: 36, height: 36, borderRadius: 8,
    background: active ? (dark ? '#243345' : '#F0F4FF') : (dark ? '#1c2a3a' : '#F5F6F8'),
    border: `1px solid ${active ? (dark ? '#3b7bc8' : '#C7D9FF') : border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', position: 'relative', flexShrink: 0,
    transition: 'background 0.15s, border-color 0.15s',
  });

  const dropdownBase: React.CSSProperties = {
    position: 'absolute', right: 0, top: 44,
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 12,
    boxShadow: dark
      ? '0 12px 40px rgba(0,0,0,0.55)'
      : '0 8px 32px rgba(0,0,0,0.12)',
    zIndex: 200,
    overflow: 'hidden',
  };

  const menuItem = (danger?: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 14px', cursor: 'pointer',
    fontSize: 13.5, fontWeight: 500,
    color: danger ? '#C0392B' : text1,
    transition: 'background 0.1s',
    userSelect: 'none',
  });

  return (
    <header style={{
      height: 64, background: headerBg,
      borderBottom: `1px solid ${headerBorder}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 10,
      position: 'sticky', top: 0, zIndex: 40, flexShrink: 0,
      transition: 'background 0.2s, border-color 0.2s',
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{
          fontFamily: 'Poppins', fontWeight: 600, fontSize: 16,
          color: text1, margin: 0,
          transition: 'color 0.2s',
        }}>
          Publications
        </h1>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', width: 230 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={text3}
          strokeWidth="2" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="field-input"
          placeholder="Search publications..."
          value={topSearch}
          onChange={e => {
            setTopSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          style={{ paddingLeft: 32, fontSize: 13, height: 36, borderRadius: 8 }}
        />
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        style={iconBtn()}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark
          ? <Sun size={16} color="#C9A24B" strokeWidth={2} />
          : <Moon size={16} color="#5B6472" strokeWidth={1.8} />
        }
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative' }} ref={notifRef}>
        <button
          onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); setRoleSubOpen(false); }}
          style={iconBtn(notifOpen)}
        >
          <Bell size={16} color={text2} />
          {hasUnread && (
            <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#C0392B', border: '1.5px solid ' + headerBg }} />
          )}
        </button>

        {notifOpen && (
          <div style={{ ...dropdownBase, width: 320 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: text1 }}>Notifications</span>
              {hasUnread && (
                <button
                  onClick={markAllRead}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#2B6CB0', padding: 0 }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            {notifs.map(n => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  padding: '11px 16px',
                  borderBottom: `1px solid ${dark ? '#1f2e40' : '#F9FAFB'}`,
                  background: n.unread ? (dark ? 'rgba(43,108,176,0.10)' : '#F0F5FF') : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  transition: 'background 0.1s',
                }}
              >
                <div style={{ marginTop: 5, width: 7, height: 7, borderRadius: '50%', background: n.unread ? '#2B6CB0' : 'transparent', flexShrink: 0, border: n.unread ? 'none' : `1.5px solid ${dark ? '#2a3a50' : '#D1D5DB'}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: text1, lineHeight: 1.35, marginBottom: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: text2, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.msg}</div>
                  <div style={{ fontSize: 11, color: text3, marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile dropdown */}
      <div style={{ position: 'relative' }} ref={profileRef}>
        <button
          onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); setRoleSubOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '5px 10px 5px 5px',
            background: profileOpen ? bgHover : 'transparent',
            border: `1.5px solid ${profileOpen ? border : 'transparent'}`,
            borderRadius: 10, cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#16324F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: 'Poppins', flexShrink: 0 }}>
            SC
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: text1, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Dr. Sarah Chen</div>
            <div style={{ fontSize: 11, color: text2, lineHeight: 1.2 }}>{role}</div>
          </div>
        </button>

        {profileOpen && (
          <div style={{ ...dropdownBase, width: 264 }}>
            <div style={{ padding: '14px 16px 12px', borderBottom: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: '#16324F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'Poppins', flexShrink: 0 }}>
                  SC
                </div>
                <div>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13.5, color: text1 }}>Dr. Sarah Chen</div>
                  <div style={{ fontSize: 11.5, color: text2, marginTop: 1 }}>MIT</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, padding: '2px 8px', borderRadius: 99, background: rc.bg, fontSize: 11, fontWeight: 700, color: rc.color }}>
                    {role}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '6px 0' }}>
              <div
                style={menuItem()}
                onClick={() => setProfileOpen(false)}
                onMouseEnter={e => (e.currentTarget.style.background = bgHover)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <User size={15} color={text2} strokeWidth={1.8} />
                <span>View Profile</span>
              </div>

              <div
                style={menuItem()}
                onClick={() => setProfileOpen(false)}
                onMouseEnter={e => (e.currentTarget.style.background = bgHover)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Settings size={15} color={text2} strokeWidth={1.8} />
                <span>Settings</span>
              </div>

              <div>
                <div
                  style={{ ...menuItem(), justifyContent: 'space-between' }}
                  onClick={() => setRoleSubOpen(o => !o)}
                  onMouseEnter={e => (e.currentTarget.style.background = bgHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 15, height: 15, borderRadius: 3, background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: rc.color }} />
                    </div>
                    <span>Switch Role</span>
                  </div>
                  <ChevronRight size={13} color={text3} style={{ transform: roleSubOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                </div>

                {roleSubOpen && (
                  <div style={{ background: dark ? 'rgba(0,0,0,0.15)' : '#FAFBFC', borderTop: `1px solid ${dark ? '#1f2e40' : '#F3F4F6'}`, borderBottom: `1px solid ${dark ? '#1f2e40' : '#F3F4F6'}` }}>
                    {roles.map(r => {
                      const rr = roleConfig[r];
                      const isActive = r === role;
                      return (
                        <div
                          key={r}
                          onClick={() => { setRole(r); setRoleSubOpen(false); setProfileOpen(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 16px 8px 28px', cursor: 'pointer',
                            fontSize: 13, fontWeight: isActive ? 600 : 400,
                            color: isActive ? rr.color : text2,
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = bgHover)}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: rr.color, flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>{r}</span>
                          {isActive && <Check size={13} color={rr.color} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: border, margin: '6px 0' }} />

              <div
                style={menuItem(true)}
                onClick={() => { setProfileOpen(false); onLogout?.(); }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(192,57,43,0.12)' : '#fdf0ef'; }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut size={15} color="#C0392B" strokeWidth={1.8} />
                <span>Log Out</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
