import { useState } from 'react';
import { MapPin, Calendar, Users, ExternalLink, Plus, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useRole } from '../context/RoleContext';
import { conferences as initialConferences } from '../data/mock';

type SubView = 'list' | 'detail' | 'scheduling';
type Conference = typeof initialConferences[0];

// ── Module-level state so registrations persist ───────────────────────────────
let _conferences: Conference[] = [...initialConferences];
const _registered = new Set<number>();

// ── Conference form modal ─────────────────────────────────────────────────────

function ConferenceFormModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit';
  initial?: Conference;
  onClose: () => void;
  onSave: (c: Conference) => void;
}) {
  const blank: Conference = {
    id: Date.now(), name: '', dates: '', location: '', organizer: '',
    field: '', participants: 0, status: 'Upcoming', virtual: false, description: '',
  };
  const [form, setForm] = useState<Conference>(initial ?? blank);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Conference>(key: K, val: Conference[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    onSave(form);
    setSaved(true);
    setTimeout(onClose, 700);
  }

  return (
    <Modal
      title={mode === 'add' ? 'Add Conference' : 'Edit Conference'}
      onClose={onClose}
      width={580}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Conference Name</label>
          <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Dates</label>
          <input className="field-input" placeholder="e.g. Jul 18–24, 2025" value={form.dates} onChange={e => set('dates', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Field</label>
          <input className="field-input" value={form.field} onChange={e => set('field', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Location</label>
          <input className="field-input" value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Organizer</label>
          <input className="field-input" value={form.organizer} onChange={e => set('organizer', e.target.value)} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select className="field-input" value={form.status} onChange={e => set('status', e.target.value)}>
            <option>Upcoming</option><option>Past</option>
          </select>
        </div>
        <div>
          <label className="field-label">Expected Participants</label>
          <input className="field-input" type="number" value={form.participants} onChange={e => set('participants', Number(e.target.value))} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
          <input type="checkbox" id="virtual" checked={form.virtual} onChange={e => set('virtual', e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="virtual" className="field-label" style={{ marginBottom: 0, cursor: 'pointer' }}>Virtual Event</label>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Description</label>
          <textarea className="field-input" rows={3} value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Conference card ───────────────────────────────────────────────────────────

function ConferenceCard({
  c, isReviewer, isRegistered, onRegister, onClick,
}: {
  c: Conference;
  isReviewer: boolean;
  isRegistered: boolean;
  onRegister: () => void;
  onClick: () => void;
}) {
  return (
    <div
      className="card"
      style={{ padding: 20, cursor: 'pointer', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(22,50,79,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: c.status === 'Upcoming' ? '#EBF4FF' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Calendar size={20} color={c.status === 'Upcoming' ? '#2B6CB0' : '#9CA3AF'} />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isRegistered && <span style={{ fontSize: 11, fontWeight: 700, color: '#1F7A6C', background: '#e8f5f3', padding: '2px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}><Check size={10} /> Registered</span>}
          <Badge status={c.status} size="sm" />
        </div>
      </div>
      <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: '#1B1F27', margin: '0 0 8px', lineHeight: 1.4 }}>{c.name}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#5B6472', marginBottom: 5 }}>
        <Calendar size={12} /> {c.dates}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#5B6472', marginBottom: 5 }}>
        <MapPin size={12} />
        {c.virtual
          ? <span style={{ padding: '1px 6px', background: '#e8f5f3', color: '#1F7A6C', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Virtual</span>
          : c.location}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#9CA3AF', marginBottom: 16 }}>
        <Users size={12} /> {c.participants.toLocaleString()} participants
      </div>
      <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
        {c.status === 'Upcoming' && !isReviewer && (
          isRegistered ? (
            <button
              disabled
              style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', background: '#e8f5f3', color: '#1F7A6C', border: '1px solid #b2ddd7', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'not-allowed' }}
            >
              <Check size={13} /> Registered
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ flex: 1, justifyContent: 'center', fontSize: 12.5, padding: '7px 12px' }}
              onClick={e => { e.stopPropagation(); onRegister(); }}
            >
              Register
            </button>
          )
        )}
        <button
          className="btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: 12.5, padding: '7px 12px' }}
          onClick={e => { e.stopPropagation(); onClick(); }}
        >
          Details
        </button>
      </div>
    </div>
  );
}

// ── Conference detail ─────────────────────────────────────────────────────────

function ConferenceDetail({
  c, isRegistered, isReviewer, onRegister, onBack,
}: {
  c: Conference;
  isRegistered: boolean;
  isReviewer: boolean;
  onRegister: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState('Overview');

  const presentations = [
    { title: 'Federated Learning with Differential Privacy', presenter: 'Dr. Sarah Chen', session: 'Session A1', time: '09:00–09:30' },
    { title: 'Quantum Error Correction in Practice', presenter: 'Dr. Elena Vasquez', session: 'Session B2', time: '11:00–11:30' },
    { title: 'Climate Adaptation via High-Res Models', presenter: 'Dr. Marcus Webb', session: 'Session C1', time: '14:00–14:30' },
    { title: 'CRISPR Delivery in T-Cell Therapies', presenter: 'Prof. James Okafor', session: 'Session D3', time: '15:30–16:00' },
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #16324F, #1F7A6C)', padding: '28px 28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{c.field}</div>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: '#fff', margin: '0 0 10px', maxWidth: 600 }}>{c.name}</h2>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ icon: Calendar, text: c.dates }, { icon: MapPin, text: c.virtual ? 'Virtual Event' : c.location }, { icon: Users, text: `${c.participants.toLocaleString()} participants` }].map(({ icon: Icon, text }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                    <Icon size={14} /> {text}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button className="btn-secondary" onClick={onBack} style={{ fontSize: 13 }}>← Back</button>
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#C9A24B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <ExternalLink size={13} /> Website
              </button>
              {c.status === 'Upcoming' && !isReviewer && (
                isRegistered ? (
                  <button disabled style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: '#e8f5f3', color: '#1F7A6C', border: '1px solid #b2ddd7', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'not-allowed' }}>
                    <Check size={13} /> Registered
                  </button>
                ) : (
                  <button className="btn-primary" style={{ fontSize: 13 }} onClick={onRegister}>Register</button>
                )
              )}
            </div>
          </div>
        </div>
        <div style={{ padding: '0 28px', display: 'flex', gap: 4, borderTop: '1px solid #E1E4E8' }}>
          {['Overview', 'Presentations', 'Participants', 'Schedule'].map(t => (
            <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'Overview' && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: '0 0 12px' }}>About</h3>
          <p style={{ fontSize: 14, color: '#5B6472', lineHeight: 1.7, margin: 0 }}>{c.description} Organized by {c.organizer}.</p>
        </div>
      )}

      {tab === 'Presentations' && (
        <div className="card">
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Title</th><th>Presenter</th><th>Session</th><th>Time Slot</th></tr></thead>
            <tbody>
              {presentations.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{p.title}</td>
                  <td style={{ color: '#5B6472' }}>{p.presenter}</td>
                  <td><span style={{ padding: '3px 8px', background: '#EBF4FF', color: '#2B6CB0', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{p.session}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === 'Participants' || tab === 'Schedule') && (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15 }}>{tab}</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Loaded from conference API.</div>
        </div>
      )}
    </div>
  );
}

// ── Scheduling / calendar ─────────────────────────────────────────────────────

interface ScheduledEvent { name: string; date: string; conf: string; }

function Scheduling() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formConf, setFormConf] = useState('');
  const [customEvents, setCustomEvents] = useState<ScheduledEvent[]>([]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calEvents = [
    { day: 8, name: 'APS March Meeting', color: '#1F7A6C' },
    { day: 14, name: 'ICML Workshop', color: '#16324F' },
    { day: 20, name: 'NeurIPS Deadline', color: '#2B6CB0' },
    { day: 25, name: 'SfN Abstract Due', color: '#C9822E' },
  ];

  function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formDate) return;
    setCustomEvents(prev => [{ name: formName.trim(), date: formDate, conf: formConf.trim() || 'Custom Event' }, ...prev]);
    setFormName('');
    setFormDate('');
    setFormConf('');
    setShowForm(false);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #E1E4E8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={14} color="#5B6472" />
            </button>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, margin: 0 }}>March 2025</h3>
            <button style={{ width: 30, height: 30, borderRadius: 6, border: '1px solid #E1E4E8', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={14} color="#5B6472" />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#F5F6F8', borderRadius: 8, padding: 3 }}>
            {(['week', 'month'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: viewMode === m ? '#16324F' : 'transparent', color: viewMode === m ? '#fff' : '#5B6472', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>{m}</button>
            ))}
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
            {days.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9CA3AF', padding: '4px 0', textTransform: 'uppercase' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 5;
              const ev = calEvents.find(e => e.day === day);
              return (
                <div key={i} style={{ minHeight: 70, padding: 6, borderRadius: 6, background: day >= 1 && day <= 31 ? '#fff' : '#FAFBFC', border: '1px solid #F3F4F6', cursor: day >= 1 && day <= 31 ? 'pointer' : 'default' }}>
                  {day >= 1 && day <= 31 && (
                    <>
                      <div style={{ fontSize: 12, fontWeight: day === 17 ? 700 : 400, color: day === 17 ? '#16324F' : '#5B6472', marginBottom: 4 }}>{day}</div>
                      {ev && <div style={{ padding: '2px 5px', background: ev.color, color: '#fff', borderRadius: 4, fontSize: 10, fontWeight: 600, lineHeight: 1.3 }}>{ev.name}</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Upcoming Events</h3>
          <button className="btn-primary" style={{ fontSize: 12, padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }} onClick={() => setShowForm(v => !v)}>
            <Plus size={12} /> Add
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddEvent} style={{ padding: '14px 18px', borderBottom: '1px solid #F3F4F6', background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="field-input"
              placeholder="Event name *"
              value={formName}
              onChange={e => setFormName(e.target.value)}
              style={{ fontSize: 13, height: 34 }}
              required
            />
            <input
              className="field-input"
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              style={{ fontSize: 13, height: 34 }}
              required
            />
            <select
              className="field-input"
              value={formConf}
              onChange={e => setFormConf(e.target.value)}
              style={{ fontSize: 13, height: 34 }}
            >
              <option value="">— Select conference (optional) —</option>
              {_conferences.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn-primary" style={{ fontSize: 12.5, flex: 1 }}>Add Event</button>
              <button type="button" className="btn-secondary" style={{ fontSize: 12.5 }} onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ padding: '8px 0' }}>
          {customEvents.map((ev, i) => (
            <div key={`custom-${i}`} style={{ padding: '12px 18px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#2B6CB0', marginTop: 7, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', lineHeight: 1.4 }}>{ev.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{ev.date}{ev.conf ? ` · ${ev.conf}` : ''}</div>
              </div>
            </div>
          ))}
          {_conferences.filter(c => c.status === 'Upcoming').map((c, i) => (
            <div key={i} style={{ padding: '12px 18px', borderBottom: '1px solid #F9FAFB', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C9A24B', marginTop: 7, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1B1F27', lineHeight: 1.4 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{c.dates}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function Conferences() {
  const { role, can } = useRole();
  const isReviewer = role === 'Reviewer';
  const canWrite = can('add', 'conferences');

  const [, tick] = useState(0);
  const [registered, setRegistered] = useState<Set<number>>(new Set(_registered));
  const [sub, setSub] = useState<SubView>('list');
  const [selectedConf, setSelectedConf] = useState<Conference | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addModal, setAddModal] = useState(false);

  function handleRegister(id: number) {
    _registered.add(id);
    setRegistered(new Set(_registered));
  }

  const filtered = _conferences.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'All' || c.status === statusFilter)
  );

  if (sub === 'detail' && selectedConf) {
    return (
      <ConferenceDetail
        c={selectedConf}
        isRegistered={registered.has(selectedConf.id)}
        isReviewer={isReviewer}
        onRegister={() => handleRegister(selectedConf.id)}
        onBack={() => { setSelectedConf(null); setSub('list'); }}
      />
    );
  }

  const subViews = isReviewer
    ? [{ id: 'list', label: 'Conference List' }]
    : [{ id: 'list', label: 'Conference List' }, { id: 'scheduling', label: 'Event Scheduling' }];

  return (
    <div>
      {!isReviewer && (
        <div style={{ display: 'flex', gap: 2, background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8', marginBottom: 20, width: 'fit-content' }}>
          {subViews.map(v => (
            <button key={v.id} onClick={() => setSub(v.id as SubView)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: sub === v.id ? '#16324F' : 'transparent',
              color: sub === v.id ? '#fff' : '#5B6472',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>{v.label}</button>
          ))}
        </div>
      )}

      {sub === 'list' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <input className="field-input" placeholder="Search conferences…" value={search} onChange={e => setSearch(e.target.value)} style={{ height: 36, fontSize: 13 }} />
            </div>
            {['All', 'Upcoming', 'Past'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{
                padding: '6px 14px', borderRadius: 20, border: '1px solid',
                borderColor: statusFilter === f ? '#16324F' : '#E1E4E8',
                background: statusFilter === f ? '#16324F' : '#fff',
                color: statusFilter === f ? '#fff' : '#5B6472',
                fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              }}>{f}</button>
            ))}
            {canWrite && (
              <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setAddModal(true)}>
                <Plus size={14} /> Add Conference
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map(c => (
              <ConferenceCard
                key={c.id}
                c={c}
                isReviewer={isReviewer}
                isRegistered={registered.has(c.id)}
                onRegister={() => handleRegister(c.id)}
                onClick={() => { setSelectedConf(c); setSub('detail'); }}
              />
            ))}
          </div>
        </>
      )}

      {sub === 'scheduling' && !isReviewer && <Scheduling />}

      {addModal && (
        <ConferenceFormModal
          mode="add"
          onClose={() => setAddModal(false)}
          onSave={c => {
            _conferences = [..._conferences, c];
            tick(t => t + 1);
            setAddModal(false);
          }}
        />
      )}
    </div>
  );
}
