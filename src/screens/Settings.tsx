import { useState, useEffect, useCallback } from 'react';
import { Bell, Lock, Globe, Palette, Database, Users, Sun, Moon, Check, Loader2 } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useDark } from '../context/DarkModeContext';
import Modal from '../components/Modal';
import { api } from '../services/api';
import ToastContainer, { type ToastMessage } from '../components/Toast';

const sections = [
  { id: 'profile', label: 'Profile Settings', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'system', label: 'System', icon: Globe },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'data', label: 'Data & Privacy', icon: Database },
];

const accentColors = [
  { name: 'Navy', value: '#16324F', preview: '#16324F' },
  { name: 'Teal', value: '#1F7A6C', preview: '#1F7A6C' },
  { name: 'Gold', value: '#C9A24B', preview: '#C9A24B' },
  { name: 'Indigo', value: '#4F46E5', preview: '#4F46E5' },
  { name: 'Rose', value: '#BE185D', preview: '#BE185D' },
];

function Toggle({ value, onChange, id }: { value: boolean; onChange: (v: boolean) => void; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 99,
        cursor: 'pointer',
        background: value ? '#16324F' : '#D1D5DB',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: value ? 21 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          display: 'block',
        }}
      />
    </button>
  );
}

function SelectField({ id, value, onChange, children, disabled }: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select
        id={id}
        className="field-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{ paddingRight: 32, cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        {children}
      </select>
      <svg
        width="12" height="12" viewBox="0 0 12 12" fill="none"
        style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: '#9CA3AF' }}
      >
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export default function Settings() {
  const { role, hasModule } = useRole();
  const { dark, toggle: toggleDark } = useDark();

  const [active, setActive] = useState('profile');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [saving, setSaving] = useState(false);

  const addToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  // Profile fields
  const [fullName, setFullName] = useState('Dr. Sarah Chen');
  const [email, setEmail] = useState('schen@mit.edu');
  const [title, setTitle] = useState('Associate Professor');
  const [dept, setDept] = useState('Computer Science');
  const [institution, setInstitution] = useState('MIT');
  const [phone, setPhone] = useState('+1 617-253-0001');
  const [bio, setBio] = useState('Specializes in large-scale machine learning systems and natural language processing.');
  const [avatarInitials, setAvatarInitials] = useState('SC');

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [inAppNotifs, setInAppNotifs] = useState(true);
  const [pubAlerts, setPubAlerts] = useState(true);
  const [projAlerts, setProjAlerts] = useState(false);
  const [confReminders, setConfReminders] = useState(true);
  const [citationAlerts, setCitationAlerts] = useState(true);

  // Security
  const [twoFa, setTwoFa] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  // System (admin only)
  const [defaultUserRole, setDefaultUserRole] = useState('Researcher');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [dataRetention, setDataRetention] = useState('365');
  const [featureFlags, setFeatureFlags] = useState([true, false, false]);

  // Appearance
  const [selectedAccent, setSelectedAccent] = useState('#16324F');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Data & Privacy
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportRequested, setExportRequested] = useState(false);
  const [privacyToggles, setPrivacyToggles] = useState([true, true, false]);

  // Load all settings from backend on mount
  useEffect(() => {
    async function loadData() {
      setLoadingInitial(true);
      try {
        const [profData, notifData, secData, appData, privData] = await Promise.all([
          api.getProfile().catch(() => null),
          api.getNotifications().catch(() => null),
          api.getSecurity().catch(() => null),
          api.getAppearance().catch(() => null),
          api.getPrivacy().catch(() => null),
        ]);

        if (profData) {
          setFullName(profData.full_name || '');
          setEmail(profData.email || '');
          setTitle(profData.title || '');
          setDept(profData.department || '');
          setInstitution(profData.institution || '');
          setPhone(profData.phone || '');
          setBio(profData.biography || '');
          setAvatarInitials(profData.avatar_initials || 'SC');
          setTwoFa(Boolean(profData.two_fa_enabled));
        }

        if (notifData) {
          setEmailNotifs(notifData.email_notifs);
          setInAppNotifs(notifData.in_app_notifs);
          setPubAlerts(notifData.pub_alerts);
          setProjAlerts(notifData.proj_alerts);
          setConfReminders(notifData.conf_reminders);
          setCitationAlerts(notifData.citation_alerts);
        }

        if (secData) {
          setTwoFa(secData.two_fa_enabled);
          setSessions(secData.sessions || []);
        }

        if (appData) {
          setSelectedAccent(appData.selected_accent || '#16324F');
          setDensity(appData.density || 'comfortable');
        }

        if (privData) {
          if (Array.isArray(privData.privacy_toggles)) {
            setPrivacyToggles(privData.privacy_toggles);
          }
          setExportRequested(Boolean(privData.export_requested));
        }

        // If admin, load system
        if (hasModule('audit')) {
          const sysData = await api.getSystemSettings().catch(() => null);
          if (sysData) {
            setDefaultUserRole(sysData.default_user_role);
            setSessionTimeout(sysData.session_timeout);
            setDataRetention(sysData.data_retention);
            if (Array.isArray(sysData.feature_flags)) setFeatureFlags(sysData.feature_flags);
          }
        }
      } catch (err: any) {
        addToast('Error loading settings from PostgreSQL: ' + err.message, 'error');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadData();
  }, [hasModule, addToast]);

  // Handlers
  async function handleProfileSave() {
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        email,
        title,
        department: dept,
        institution,
        phone,
        biography: bio,
      });
      setAvatarInitials(updated.avatar_initials || 'SC');
      addToast('Profile changes saved to PostgreSQL!', 'success');
    } catch (err: any) {
      addToast('Failed to save profile: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleNotificationsSave() {
    setSaving(true);
    try {
      await api.updateNotifications({
        email_notifs: emailNotifs,
        in_app_notifs: inAppNotifs,
        pub_alerts: pubAlerts,
        proj_alerts: projAlerts,
        conf_reminders: confReminders,
        citation_alerts: citationAlerts,
      });
      addToast('Notification preferences saved to PostgreSQL!', 'success');
    } catch (err: any) {
      addToast('Failed to save notifications: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleTwoFaToggle(val: boolean) {
    setTwoFa(val);
    try {
      await api.updateTwoFa(val);
      addToast(`Two-Factor Authentication ${val ? 'enabled' : 'disabled'}!`, 'success');
    } catch (err: any) {
      setTwoFa(!val);
      addToast('Failed to update 2FA: ' + err.message, 'error');
    }
  }

  async function handlePasswordUpdate() {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setSaving(true);
    try {
      await api.changePassword(currentPw, newPw);
      setPwSaved(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      addToast('Password updated securely in PostgreSQL!', 'success');
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: any) {
      addToast('Password update failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleRevokeSession(sessionId: number) {
    try {
      await api.revokeSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      addToast('Session revoked successfully.', 'success');
    } catch (err: any) {
      addToast('Failed to revoke session: ' + err.message, 'error');
    }
  }

  async function handleSysSettingsSave() {
    setSaving(true);
    try {
      await api.updateSystemSettings({
        default_user_role: defaultUserRole,
        session_timeout: sessionTimeout,
        data_retention: dataRetention,
        feature_flags: featureFlags,
      });
      addToast('System configuration saved to PostgreSQL database!', 'success');
    } catch (err: any) {
      addToast('System settings save failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleAppearanceSave() {
    setSaving(true);
    try {
      await api.updateAppearance({
        selected_accent: selectedAccent,
        density,
        dark_mode: dark,
      });
      addToast('Appearance preferences saved to database!', 'success');
    } catch (err: any) {
      addToast('Failed to save appearance: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handlePrivacySave() {
    setSaving(true);
    try {
      await api.updatePrivacy({ privacy_toggles: privacyToggles });
      addToast('Privacy preferences updated!', 'success');
    } catch (err: any) {
      addToast('Failed to update privacy: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleExportRequest() {
    setSaving(true);
    try {
      await api.requestDataExport();
      setExportRequested(true);
      addToast('Full data archive requested! An audit record was created.', 'success');
    } catch (err: any) {
      addToast('Export request failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      await api.deleteAccount();
      setDeleteModal(false);
      addToast('Account deleted. Refreshing application...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      addToast('Deletion failed: ' + err.message, 'error');
    }
  }

  const isPasswordValid = Boolean(currentPw && newPw && confirmPw && newPw === confirmPw);
  const passwordMismatch = Boolean(newPw && confirmPw && newPw !== confirmPw);

  const visibleSections = sections.filter(s => {
    if (s.id === 'system') return hasModule('audit');
    return true;
  });

  const NavItem = ({ id, label, icon: Icon }: { id: string; label: string; icon: React.ElementType }) => (
    <button
      id={`settings-nav-${id}`}
      type="button"
      onClick={() => setActive(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 12px',
        borderRadius: 8,
        background: active === id ? '#F0F4FF' : 'transparent',
        color: active === id ? '#16324F' : '#5B6472',
        fontWeight: active === id ? 600 : 500,
        fontSize: 13.5,
        marginBottom: 2,
        transition: 'background 0.15s, color 0.15s',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = '#F5F6F8'; }}
      onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={15} strokeWidth={active === id ? 2.2 : 1.8} />
      {label}
    </button>
  );

  if (loadingInitial) {
    return (
      <div className="card" style={{ padding: 60, textAlign: 'center', color: '#5B6472', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <Loader2 size={22} className="animate-spin" color="#16324F" />
        <span style={{ fontSize: 14, fontWeight: 500 }}>Loading settings from PostgreSQL database...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
      <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Sidebar nav */}
      <nav className="card" style={{ padding: 12, height: 'fit-content' }} aria-label="Settings sections">
        {visibleSections.map(s => (
          <NavItem key={s.id} id={s.id} label={s.label} icon={s.icon} />
        ))}
      </nav>

      {/* Content panels */}
      <div>

        {/* Profile */}
        {active === 'profile' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 24px' }}>Profile Settings</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: '#F5F6F8', borderRadius: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: '#16324F', color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins', flexShrink: 0 }}>
                {avatarInitials}
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15 }}>{fullName}</div>
                <div style={{ fontSize: 13, color: '#5B6472', marginTop: 2 }}>{role} • {institution}</div>
                <div style={{ fontSize: 11.5, color: '#16A34A', marginTop: 4, fontWeight: 500 }}>
                  ● Synced with PostgreSQL database
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label className="field-label" htmlFor="profile-full-name">Full Name</label>
                <input id="profile-full-name" className="field-input" value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="profile-email">Email</label>
                <input id="profile-email" className="field-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="profile-title">Title</label>
                <input id="profile-title" className="field-input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="profile-dept">Department</label>
                <input id="profile-dept" className="field-input" value={dept} onChange={e => setDept(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="profile-institution">Institution</label>
                <input id="profile-institution" className="field-input" value={institution} onChange={e => setInstitution(e.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="profile-phone">Phone</label>
                <input id="profile-phone" className="field-input" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="field-label" htmlFor="profile-bio">Biography</label>
              <textarea
                id="profile-bio"
                className="field-input"
                rows={3}
                value={bio}
                onChange={e => setBio(e.target.value)}
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button id="btn-profile-save" type="button" className="btn-primary" onClick={handleProfileSave} disabled={saving}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {active === 'notifications' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>Notification Preferences</h2>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>Control delivery channels and notification triggers stored in PostgreSQL.</p>

            <div style={{ marginBottom: 20, padding: 16, background: '#F5F6F8', borderRadius: 10, border: '1px solid #E1E4E8' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Delivery Channels</div>
              {[
                { id: 'toggle-email', label: 'Email Notifications', desc: 'Receive updates and alerts via email', value: emailNotifs, onChange: setEmailNotifs },
                { id: 'toggle-inapp', label: 'In-App Notifications', desc: 'Show notification bell alerts in the app', value: inAppNotifs, onChange: setInAppNotifs },
              ].map((n, i) => (
                <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 1 ? '1px solid #E1E4E8' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1B1F27' }}>{n.label}</div>
                    <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <Toggle id={n.id} value={n.value} onChange={n.onChange} />
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Notification Types</div>
            {[
              { id: 'toggle-pub', label: 'Publication Status Changes', desc: 'Notify when a co-authored publication changes status', value: pubAlerts, onChange: setPubAlerts },
              { id: 'toggle-proj', label: 'Project Updates', desc: 'Notify when a project milestone or team change occurs', value: projAlerts, onChange: setProjAlerts },
              { id: 'toggle-conf', label: 'Conference Reminders', desc: 'Send reminders 7 days before submission deadlines', value: confReminders, onChange: setConfReminders },
              { id: 'toggle-cite', label: 'New Citation Alerts', desc: 'Notify when your publications receive new citations', value: citationAlerts, onChange: setCitationAlerts },
            ].map((n, i) => (
              <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1B1F27' }}>{n.label}</div>
                  <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>{n.desc}</div>
                </div>
                <Toggle id={n.id} value={n.value} onChange={n.onChange} />
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button id="btn-save-notifs" type="button" className="btn-primary" onClick={handleNotificationsSave} disabled={saving}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Notification Settings
              </button>
            </div>
          </div>
        )}

        {/* Security */}
        {active === 'security' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 24px' }}>Security & Credentials</h2>

            {/* 2FA */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: '#F5F6F8', borderRadius: 10, border: '1px solid #E1E4E8', marginBottom: 28 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1B1F27' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: 12.5, color: '#5B6472', marginTop: 2 }}>
                  {twoFa ? '2FA is active on your account via PostgreSQL credentials.' : 'Add an extra layer of security to your account with 2FA.'}
                </div>
              </div>
              <Toggle id="toggle-2fa" value={twoFa} onChange={handleTwoFaToggle} />
            </div>

            {/* Change Password */}
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 16px', color: '#1B1F27' }}>Change Password</h3>
            <div style={{ maxWidth: 420, marginBottom: 24 }}>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="input-current-password">Current Password</label>
                <input
                  id="input-current-password"
                  type="password"
                  className="field-input"
                  placeholder="Enter current password (default: password123)"
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="input-new-password">New Password</label>
                <input
                  id="input-new-password"
                  type="password"
                  className="field-input"
                  placeholder="At least 8 characters"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="field-label" htmlFor="input-confirm-password">Confirm New Password</label>
                <input
                  id="input-confirm-password"
                  type="password"
                  className="field-input"
                  placeholder="Repeat new password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                />
                {passwordMismatch && (
                  <div style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>Passwords do not match.</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  id="btn-update-password"
                  type="button"
                  className="btn-primary"
                  disabled={!isPasswordValid || saving}
                  onClick={handlePasswordUpdate}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                  Update Password
                </button>
                {pwSaved && (
                  <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 500 }}>
                    ✓ Password updated in database!
                  </span>
                )}
              </div>
            </div>

            {/* Active Sessions */}
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 12px', color: '#1B1F27' }}>Active Sessions (PostgreSQL)</h3>
            <div style={{ border: '1px solid #E1E4E8', borderRadius: 8, overflow: 'hidden' }}>
              {sessions.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: i < sessions.length - 1 ? '1px solid #E1E4E8' : 'none', background: s.current ? '#F0FDF4' : 'transparent' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{s.device}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.location} • {s.time}</div>
                  </div>
                  {s.current ? (
                    <span style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, background: '#DCFCE7', padding: '3px 8px', borderRadius: 6 }}>Current</span>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={() => handleRevokeSession(s.id)}
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System (Admin) */}
        {active === 'system' && hasModule('audit') && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>System Configuration</h2>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>System Admin parameters applied across the SciCollab platform.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label className="field-label" htmlFor="select-default-role">Default User Role</label>
                <SelectField id="select-default-role" value={defaultUserRole} onChange={setDefaultUserRole}>
                  <option>Researcher</option>
                  <option>Institution Admin</option>
                  <option>Reviewer</option>
                </SelectField>
              </div>

              <div>
                <label className="field-label" htmlFor="select-session-timeout">Session Timeout (minutes)</label>
                <SelectField id="select-session-timeout" value={sessionTimeout} onChange={setSessionTimeout}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="120">2 hours</option>
                  <option value="480">8 hours</option>
                </SelectField>
              </div>

              <div>
                <label className="field-label" htmlFor="select-data-retention">Audit Log Retention Period</label>
                <SelectField id="select-data-retention" value={dataRetention} onChange={setDataRetention}>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year (365 days)</option>
                  <option value="730">2 years</option>
                  <option value="1825">5 years</option>
                </SelectField>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button id="btn-save-system" type="button" className="btn-primary" onClick={handleSysSettingsSave} disabled={saving}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                Save System Settings
              </button>
            </div>
          </div>
        )}

        {/* Appearance */}
        {active === 'appearance' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 24px' }}>Appearance Preferences</h2>

            <div style={{ marginBottom: 28 }}>
              <div className="field-label">Interface Mode</div>
              <div style={{ display: 'flex', gap: 14 }}>
                {[
                  { mode: 'light', label: 'Light', icon: Sun },
                  { mode: 'dark', label: 'Dark', icon: Moon },
                ].map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { if ((mode === 'dark') !== dark) toggleDark(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 24px',
                      borderRadius: 10,
                      border: ((mode === 'dark') === dark) ? '2px solid #16324F' : '1px solid #E1E4E8',
                      background: ((mode === 'dark') === dark) ? '#F0F4FF' : '#fff',
                      cursor: 'pointer',
                      fontWeight: ((mode === 'dark') === dark) ? 600 : 500,
                      fontSize: 14,
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div className="field-label">Accent Color</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {accentColors.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedAccent(c.value)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: c.preview,
                      border: selectedAccent === c.value ? '3px solid #1B1F27' : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                    title={c.name}
                  >
                    {selectedAccent === c.value && <Check size={18} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn-primary" onClick={handleAppearanceSave} disabled={saving}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                Save Appearance
              </button>
            </div>
          </div>
        )}

        {/* Data & Privacy */}
        {active === 'data' && (
          <div className="card" style={{ padding: 28 }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>Data & Privacy</h2>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>Control your data visibility and export archives.</p>

            <div style={{ marginBottom: 24 }}>
              {[
                { label: 'Public Profile Visibility', desc: 'Allow other verified researchers to see your profile' },
                { label: 'Publication Metrics Sharing', desc: 'Display citations count and h-index publicly' },
                { label: 'Activity Tracking in Search Logs', desc: 'Include search queries in anonymous analytics' },
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{p.label}</div>
                    <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>{p.desc}</div>
                  </div>
                  <Toggle
                    value={privacyToggles[i]}
                    onChange={v => {
                      const updated = [...privacyToggles];
                      updated[i] = v;
                      setPrivacyToggles(updated);
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginBottom: 32 }}>
              <button type="button" className="btn-secondary" onClick={handlePrivacySave} disabled={saving}>
                Save Privacy Toggles
              </button>
            </div>

            {/* Export data */}
            <div style={{ padding: 20, background: '#F5F6F8', borderRadius: 10, border: '1px solid #E1E4E8', marginBottom: 28 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Export Your Research Data</div>
              <div style={{ fontSize: 12.5, color: '#5B6472', margin: '4px 0 14px' }}>
                Download a complete archive of your publications, collaborations, and profile logs in JSON and CSV formats.
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleExportRequest}
                disabled={exportRequested || saving}
              >
                {exportRequested ? '✓ Export Requested' : 'Request Data Archive'}
              </button>
            </div>

            {/* Danger zone */}
            <div style={{ padding: 20, border: '1px solid #FCA5A5', background: '#FEF2F2', borderRadius: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#991B1B' }}>Danger Zone</div>
              <div style={{ fontSize: 12.5, color: '#7F1D1D', margin: '4px 0 14px' }}>
                Permanently delete your SciCollab account, profile data, and personal settings from PostgreSQL.
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal(true)}
                style={{
                  background: '#DC2626',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Delete confirmation modal */}
      {deleteModal && (
        <Modal onClose={() => setDeleteModal(false)} title="Confirm Account Deletion">
          <div style={{ padding: '4px 0' }}>
            <p style={{ fontSize: 13.5, color: '#5B6472', lineHeight: 1.6, margin: '0 0 16px' }}>
              This action cannot be undone. Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              type="text"
              className="field-input"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              style={{ marginBottom: 20 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn-secondary" onClick={() => setDeleteModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
                style={{
                  background: deleteConfirmText === 'DELETE' ? '#DC2626' : '#FCA5A5',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
