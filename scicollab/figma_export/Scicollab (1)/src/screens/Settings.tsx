import { useState } from 'react';
import { Bell, Lock, Globe, Palette, Database, Users, Sun, Moon, Check, AlertTriangle } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useDark } from '../context/DarkModeContext';
import Modal from '../components/Modal';

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

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 42, height: 24, borderRadius: 99, cursor: 'pointer',
        background: value ? '#16324F' : '#D1D5DB',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3, left: value ? 21 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

export default function Settings() {
  const { role, hasModule } = useRole();
  const { dark, toggle: toggleDark } = useDark();

  const [active, setActive] = useState('profile');

  // Notification toggles
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
  const [sessions, setSessions] = useState([
    { id: 1, device: 'MacBook Pro · Chrome 126', location: 'Cambridge, MA', time: 'Now (current)', current: true },
    { id: 2, device: 'iPhone 15 · Safari', location: 'Cambridge, MA', time: '2 days ago', current: false },
    { id: 3, device: 'Windows PC · Firefox', location: 'Boston, MA', time: '5 days ago', current: false },
  ]);

  // System (admin only)
  const [defaultUserRole, setDefaultUserRole] = useState('Researcher');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [dataRetention, setDataRetention] = useState('365');
  const [sysSettingsSaved, setSysSettingsSaved] = useState(false);

  // Appearance
  const [selectedAccent, setSelectedAccent] = useState('#16324F');
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  // Data & Privacy
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportRequested, setExportRequested] = useState(false);

  function handlePasswordUpdate() {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setPwSaved(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => setPwSaved(false), 2500);
  }

  function handleSysSettingsSave() {
    setSysSettingsSaved(true);
    setTimeout(() => setSysSettingsSaved(false), 2500);
  }

  function handleExportRequest() {
    setExportRequested(true);
  }

  const visibleSections = sections.filter(s => {
    if (s.id === 'system') return hasModule('audit'); // Only System Admin sees System tab
    return true;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
      {/* Sidebar nav */}
      <div className="card" style={{ padding: 12, height: 'fit-content' }}>
        {visibleSections.map(s => (
          <div
            key={s.id}
            onClick={() => setActive(s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
              background: active === s.id ? '#F0F4FF' : 'transparent',
              color: active === s.id ? '#16324F' : '#5B6472',
              fontWeight: active === s.id ? 600 : 500,
              fontSize: 13.5, marginBottom: 2,
              transition: 'background 0.15s',
            }}
          >
            <s.icon size={15} strokeWidth={active === s.id ? 2.2 : 1.8} />
            {s.label}
          </div>
        ))}
      </div>

      {/* Content panels */}
      <div>
        {/* ── Profile ── */}
        {active === 'profile' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 24px' }}>Profile Settings</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: '#F5F6F8', borderRadius: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: '#16324F', color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins' }}>SC</div>
              <div>
                <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15 }}>Dr. Sarah Chen</div>
                <div style={{ fontSize: 13, color: '#5B6472', marginTop: 2 }}>{role} · MIT</div>
                <button className="btn-secondary" style={{ fontSize: 12, padding: '5px 12px', marginTop: 8 }}>Change Avatar</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[['Full Name', 'Dr. Sarah Chen'], ['Email', 'schen@mit.edu'], ['Title', 'Associate Professor'], ['Department', 'Computer Science'], ['Institution', 'MIT'], ['Phone', '+1 617-253-0001']].map(([label, val]) => (
                <div key={label}>
                  <label className="field-label">{label}</label>
                  <input className="field-input" defaultValue={val} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="field-label">Biography</label>
              <textarea className="field-input" rows={3} defaultValue="Specializes in large-scale machine learning systems and natural language processing with a focus on fairness and interpretability." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary">Cancel</button>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {active === 'notifications' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>Notification Preferences</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>Control how and when SciCollab notifies you.</p>

            <div style={{ marginBottom: 20, padding: 16, background: '#F5F6F8', borderRadius: 10, border: '1px solid #E1E4E8' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Delivery Channels</div>
              {[
                { label: 'Email Notifications', desc: 'Receive updates and alerts via email', value: emailNotifs, onChange: setEmailNotifs },
                { label: 'In-App Notifications', desc: 'Show notification bell alerts in the app', value: inAppNotifs, onChange: setInAppNotifs },
              ].map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 1 ? '1px solid #E1E4E8' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#1B1F27' }}>{n.label}</div>
                    <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <Toggle value={n.value} onChange={n.onChange} />
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Notification Types</div>
            {[
              { label: 'Publication Status Changes', desc: 'Notify when a co-authored publication changes status', value: pubAlerts, onChange: setPubAlerts },
              { label: 'Project Updates', desc: 'Notify when a project milestone or team change occurs', value: projAlerts, onChange: setProjAlerts },
              { label: 'Conference Reminders', desc: 'Send reminders 7 days before submission deadlines', value: confReminders, onChange: setConfReminders },
              { label: 'New Citation Alerts', desc: 'Notify when your publications receive new citations', value: citationAlerts, onChange: setCitationAlerts },
            ].map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#1B1F27' }}>{n.label}</div>
                  <div style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 2 }}>{n.desc}</div>
                </div>
                <Toggle value={n.value} onChange={n.onChange} />
              </div>
            ))}
          </div>
        )}

        {/* ── Security ── */}
        {active === 'security' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 24px' }}>Security Settings</h3>

            {/* 2FA */}
            <div style={{ marginBottom: 24, padding: 16, border: '1px solid #E1E4E8', borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: twoFa ? 12 : 0 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1F27' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>Add an extra layer of security to your account</div>
                </div>
                <Toggle value={twoFa} onChange={setTwoFa} />
              </div>
              {twoFa && (
                <div style={{ padding: 12, background: '#e8f5f3', borderRadius: 8, fontSize: 13, color: '#1F7A6C', fontWeight: 500 }}>
                  2FA is enabled. Use your authenticator app to generate codes.
                </div>
              )}
            </div>

            {/* Change password */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 14px' }}>Change Password</h4>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">Current Password</label>
                <input className="field-input" type="password" placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="field-label">New Password</label>
                <input className="field-input" type="password" placeholder="••••••••" value={newPw} onChange={e => setNewPw(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="field-label">Confirm New Password</label>
                <input className="field-input" type="password" placeholder="••••••••" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
                {newPw && confirmPw && newPw !== confirmPw && (
                  <div style={{ fontSize: 12, color: '#C0392B', marginTop: 4 }}>Passwords do not match.</div>
                )}
              </div>
              <button
                className="btn-primary"
                onClick={handlePasswordUpdate}
                disabled={!currentPw || !newPw || newPw !== confirmPw}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                {pwSaved ? <><Check size={14} /> Password Updated!</> : 'Update Password'}
              </button>
            </div>

            {/* Active sessions */}
            <div style={{ paddingTop: 20, borderTop: '1px solid #E1E4E8' }}>
              <h4 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 12px' }}>Active Sessions</h4>
              {sessions.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < sessions.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.device}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{s.location} · {s.time}</div>
                  </div>
                  {s.current
                    ? <span style={{ fontSize: 12, color: '#1F7A6C', fontWeight: 600, background: '#e8f5f3', padding: '3px 8px', borderRadius: 4 }}>Current</span>
                    : <button
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: '4px 10px', color: '#C0392B', borderColor: '#f5c0ba' }}
                        onClick={() => setSessions(prev => prev.filter(x => x.id !== s.id))}
                      >
                        Revoke
                      </button>
                  }
                </div>
              ))}
              {sessions.filter(s => !s.current).length === 0 && (
                <div style={{ fontSize: 13, color: '#9CA3AF', paddingTop: 4 }}>No other active sessions.</div>
              )}
            </div>
          </div>
        )}

        {/* ── System (Admin only) ── */}
        {active === 'system' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>System Configuration</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>Global settings applied across the entire SciCollab platform.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label className="field-label">Default User Role</label>
                <select className="field-input" value={defaultUserRole} onChange={e => setDefaultUserRole(e.target.value)}>
                  <option>Researcher</option>
                  <option>Institution Admin</option>
                  <option>Reviewer</option>
                </select>
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Role assigned to new registrations.</div>
              </div>
              <div>
                <label className="field-label">Session Timeout (minutes)</label>
                <input className="field-input" type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} min={5} max={480} />
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Idle sessions are logged out after this period.</div>
              </div>
              <div>
                <label className="field-label">Data Retention Period (days)</label>
                <input className="field-input" type="number" value={dataRetention} onChange={e => setDataRetention(e.target.value)} min={30} />
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Audit logs and deleted records are purged after this period.</div>
              </div>
              <div>
                <label className="field-label">Max Upload Size (MB)</label>
                <input className="field-input" type="number" defaultValue={50} min={1} max={500} />
                <div style={{ fontSize: 11.5, color: '#9CA3AF', marginTop: 4 }}>Maximum file size for publication uploads.</div>
              </div>
            </div>

            <div style={{ padding: 16, background: '#F5F6F8', borderRadius: 10, border: '1px solid #E1E4E8', marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#5B6472', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>Feature Flags</div>
              {[
                { label: 'DOI Auto-Resolution', desc: 'Automatically resolve DOIs via CrossRef on publication creation' },
                { label: 'Public Researcher Profiles', desc: 'Allow researcher profiles to be publicly accessible without login' },
                { label: 'Citation Import (BibTeX)', desc: 'Enable bulk citation imports via .bib file uploads' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid #E1E4E8' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: '#1B1F27' }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{f.desc}</div>
                  </div>
                  <Toggle value={i === 0} onChange={() => {}} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn-secondary">Discard</button>
              <button className="btn-primary" onClick={handleSysSettingsSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {sysSettingsSaved ? <><Check size={14} /> Saved!</> : 'Save Configuration'}
              </button>
            </div>
          </div>
        )}

        {/* ── Appearance ── */}
        {active === 'appearance' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 24px' }}>Appearance</h3>

            {/* Theme toggle */}
            <div style={{ marginBottom: 28, padding: 20, border: '1px solid #E1E4E8', borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1F27', marginBottom: 4 }}>Color Theme</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Choose between light and dark interface mode.</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'Light', icon: <Sun size={18} color="#C9A24B" />, active: !dark },
                  { label: 'Dark', icon: <Moon size={18} color="#5B6472" />, active: dark },
                ].map(opt => (
                  <div
                    key={opt.label}
                    onClick={opt.active ? undefined : toggleDark}
                    style={{
                      flex: 1, padding: '14px 16px', borderRadius: 10, cursor: opt.active ? 'default' : 'pointer',
                      border: `2px solid ${opt.active ? '#16324F' : '#E1E4E8'}`,
                      background: opt.active ? '#F0F4FF' : '#FAFBFC',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.icon}
                    <span style={{ fontSize: 14, fontWeight: opt.active ? 700 : 500, color: opt.active ? '#16324F' : '#5B6472' }}>{opt.label} Mode</span>
                    {opt.active && <Check size={14} color="#16324F" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Accent color */}
            <div style={{ marginBottom: 28, padding: 20, border: '1px solid #E1E4E8', borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1F27', marginBottom: 4 }}>Accent Color</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Applies to active sidebar item, primary buttons, and focused states.</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {accentColors.map(a => (
                  <div
                    key={a.name}
                    onClick={() => setSelectedAccent(a.value)}
                    style={{ cursor: 'pointer', textAlign: 'center' }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: a.preview,
                      border: selectedAccent === a.value ? '3px solid #1B1F27' : '3px solid transparent',
                      marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.15s',
                    }}>
                      {selectedAccent === a.value && <Check size={16} color="#fff" />}
                    </div>
                    <div style={{ fontSize: 11, color: selectedAccent === a.value ? '#1B1F27' : '#9CA3AF', fontWeight: selectedAccent === a.value ? 600 : 400 }}>{a.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Density */}
            <div style={{ padding: 20, border: '1px solid #E1E4E8', borderRadius: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1F27', marginBottom: 4 }}>Display Density</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Controls padding and spacing in tables and cards.</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['comfortable', 'compact'] as const).map(d => (
                  <div
                    key={d}
                    onClick={() => setDensity(d)}
                    style={{
                      flex: 1, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${density === d ? '#16324F' : '#E1E4E8'}`,
                      background: density === d ? '#F0F4FF' : '#FAFBFC',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: density === d ? 700 : 500, color: density === d ? '#16324F' : '#5B6472', textTransform: 'capitalize' }}>{d}</span>
                    {density === d && <Check size={14} color="#16324F" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Data & Privacy ── */}
        {active === 'data' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>Data & Privacy</h3>
            <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 24px' }}>Manage your personal data and account settings.</p>

            {/* Data export */}
            <div style={{ padding: 20, border: '1px solid #E1E4E8', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1F27', marginBottom: 4 }}>Export My Data</div>
                  <div style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 400, lineHeight: 1.6 }}>
                    Download a copy of all your data on SciCollab — publications, projects, collaborations, and activity history. Processing takes up to 24 hours.
                  </div>
                </div>
                {exportRequested ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#e8f5f3', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1F7A6C', flexShrink: 0 }}>
                    <Check size={14} /> Export Requested
                  </div>
                ) : (
                  <button className="btn-primary" style={{ flexShrink: 0 }} onClick={handleExportRequest}>
                    Request Data Export
                  </button>
                )}
              </div>
              {exportRequested && (
                <div style={{ marginTop: 12, padding: 10, background: '#e8f5f3', borderRadius: 8, fontSize: 12.5, color: '#1F7A6C' }}>
                  Your export is being prepared. You will receive an email with a download link within 24 hours.
                </div>
              )}
            </div>

            {/* Privacy settings */}
            <div style={{ padding: 20, border: '1px solid #E1E4E8', borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1B1F27', marginBottom: 16 }}>Privacy Settings</div>
              {[
                { label: 'Public Profile', desc: 'Allow your researcher profile to be visible to non-logged-in visitors' },
                { label: 'Publication Visibility', desc: 'Show your publications list to other authenticated researchers' },
                { label: 'Activity Tracking', desc: 'Allow SciCollab to track usage for analytics and improvements' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: '#1B1F27' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Toggle value={i < 2} onChange={() => {}} />
                </div>
              ))}
            </div>

            {/* Delete account */}
            <div style={{ padding: 20, border: '1px solid #F5C0BA', borderRadius: 12, background: '#FDF5F4' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <AlertTriangle size={20} color="#C0392B" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#C0392B', marginBottom: 4 }}>Delete Account</div>
                  <div style={{ fontSize: 13, color: '#5B6472', lineHeight: 1.6, marginBottom: 14 }}>
                    Permanently delete your account and all associated data. This action cannot be undone. Your publications and collaborations will remain in the system but will be disassociated from your profile.
                  </div>
                  <button
                    onClick={() => setDeleteModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete account confirmation modal */}
      {deleteModal && (
        <Modal
          title="Delete Account"
          onClose={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
          width={460}
          footer={
            <>
              <button className="btn-secondary" onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}>Cancel</button>
              <button
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px',
                  background: deleteConfirmText === 'DELETE' ? '#C0392B' : '#E1E4E8',
                  color: deleteConfirmText === 'DELETE' ? '#fff' : '#9CA3AF',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed',
                }}
              >
                <AlertTriangle size={14} /> Permanently Delete
              </button>
            </>
          }
        >
          <div style={{ marginBottom: 16, padding: 14, background: '#FDF5F4', border: '1px solid #F5C0BA', borderRadius: 8, fontSize: 13, color: '#C0392B', lineHeight: 1.6 }}>
            <strong>Warning:</strong> This action is permanent and cannot be reversed. All your account settings and associated metadata will be deleted.
          </div>
          <div>
            <label className="field-label">Type <strong>DELETE</strong> to confirm</label>
            <input
              className="field-input"
              placeholder="DELETE"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              style={{ borderColor: deleteConfirmText === 'DELETE' ? '#C0392B' : undefined }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
