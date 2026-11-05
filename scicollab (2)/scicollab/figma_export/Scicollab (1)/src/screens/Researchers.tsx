import { useState, useRef } from 'react';
import { Search, Grid, List, Plus, MapPin, Mail, Phone, X, Check } from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { useRole } from '../context/RoleContext';
import { researchers as initialResearchers, institutions as initialInstitutions, publications } from '../data/mock';

type View = 'directory' | 'profile' | 'institutions';
type Researcher = typeof initialResearchers[0];
type Institution = typeof initialInstitutions[0];

// Module-level mutable state so edits persist across re-renders
let _researchers = [...initialResearchers];
let _institutions = [...initialInstitutions];

function useResearchers() {
  const [, tick] = useState(0);
  const rerender = () => tick(t => t + 1);
  return {
    researchers: _researchers,
    addResearcher: (r: Researcher) => { _researchers = [..._researchers, r]; rerender(); },
    updateResearcher: (r: Researcher) => { _researchers = _researchers.map(x => x.id === r.id ? r : x); rerender(); },
  };
}

function useInstitutions() {
  const [, tick] = useState(0);
  const rerender = () => tick(t => t + 1);
  return {
    institutions: _institutions,
    addInstitution: (inst: Institution) => { _institutions = [..._institutions, inst]; rerender(); },
    updateInstitution: (inst: Institution) => { _institutions = _institutions.map(x => x.id === inst.id ? inst : x); rerender(); },
  };
}

// ── Researcher form modal ─────────────────────────────────────────────────────

function ResearcherModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit' | 'view';
  initial?: Researcher;
  onClose: () => void;
  onSave?: (r: Researcher) => void;
}) {
  const blank: Researcher = {
    id: Date.now(),
    name: '', title: '', department: '', institution: '', avatar: '',
    skills: [], interests: [], publications: 0, projects: 0, conferences: 0,
    collaborators: 0, email: '', phone: '', bio: '', hIndex: 0, citations: 0,
  };
  const [form, setForm] = useState<Researcher>(initial ?? blank);
  const [saved, setSaved] = useState(false);
  const readOnly = mode === 'view';

  function set(key: keyof Researcher, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!onSave) return;
    onSave({ ...form, avatar: form.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'XX' });
    setSaved(true);
    setTimeout(onClose, 700);
  }

  const title = mode === 'add' ? 'Add Researcher' : mode === 'edit' ? 'Edit Researcher' : form.name;

  return (
    <Modal
      title={title}
      onClose={onClose}
      width={600}
      footer={!readOnly ? (
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save'}
          </button>
        </>
      ) : (
        <button className="btn-secondary" onClick={onClose}>Close</button>
      )}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { label: 'Full Name', key: 'name' },
          { label: 'Title', key: 'title' },
          { label: 'Department', key: 'department' },
          { label: 'Institution', key: 'institution' },
          { label: 'Email', key: 'email' },
          { label: 'Phone', key: 'phone' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="field-label">{label}</label>
            <input
              className="field-input"
              value={String((form as Record<string, unknown>)[key] ?? '')}
              onChange={e => set(key as keyof Researcher, e.target.value)}
              disabled={readOnly}
              style={{ background: readOnly ? '#F5F6F8' : undefined }}
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <label className="field-label">Biography</label>
        <textarea className="field-input" rows={3} value={form.bio}
          onChange={e => set('bio', e.target.value)}
          disabled={readOnly} style={{ resize: 'vertical', background: readOnly ? '#F5F6F8' : undefined }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 14 }}>
        {[
          { label: 'Publications', key: 'publications' },
          { label: 'h-Index', key: 'hIndex' },
          { label: 'Citations', key: 'citations' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="field-label">{label}</label>
            <input className="field-input" type="number"
              value={Number((form as Record<string, unknown>)[key] ?? 0)}
              onChange={e => set(key as keyof Researcher, Number(e.target.value))}
              disabled={readOnly}
              style={{ background: readOnly ? '#F5F6F8' : undefined }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <label className="field-label">Skills (comma-separated)</label>
        <input className="field-input"
          value={form.skills.join(', ')}
          onChange={e => set('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
      </div>
      <div style={{ marginTop: 14 }}>
        <label className="field-label">Research Interests (comma-separated)</label>
        <input className="field-input"
          value={form.interests.join(', ')}
          onChange={e => set('interests', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
      </div>
    </Modal>
  );
}

// ── Institution form modal ────────────────────────────────────────────────────

function InstitutionModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: 'add' | 'edit' | 'view';
  initial?: Institution;
  onClose: () => void;
  onSave?: (inst: Institution) => void;
}) {
  const blank: Institution = {
    id: Date.now(), name: '', type: 'University', country: '',
    researchers: 0, publications: 0, status: 'Active', established: new Date().getFullYear(),
  };
  const [form, setForm] = useState<Institution>(initial ?? blank);
  const [saved, setSaved] = useState(false);
  const readOnly = mode === 'view';

  function set(key: keyof Institution, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!onSave) return;
    onSave(form);
    setSaved(true);
    setTimeout(onClose, 700);
  }

  return (
    <Modal
      title={mode === 'add' ? 'Add Institution' : mode === 'edit' ? 'Edit Institution' : form.name}
      onClose={onClose}
      width={520}
      footer={!readOnly ? (
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saved ? <><Check size={14} /> Saved!</> : 'Save'}
          </button>
        </>
      ) : <button className="btn-secondary" onClick={onClose}>Close</button>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label className="field-label">Institution Name</label>
          <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Type</label>
          <select className="field-input" value={form.type} onChange={e => set('type', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }}>
            <option>University</option>
            <option>Research Institute</option>
            <option>Funding Body</option>
          </select>
        </div>
        <div>
          <label className="field-label">Country</label>
          <input className="field-input" value={form.country} onChange={e => set('country', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Year Established</label>
          <input className="field-input" type="number" value={form.established} onChange={e => set('established', Number(e.target.value))} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Status</label>
          <select className="field-input" value={form.status} onChange={e => set('status', e.target.value)} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div>
          <label className="field-label">Number of Researchers</label>
          <input className="field-input" type="number" value={form.researchers} onChange={e => set('researchers', Number(e.target.value))} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
        <div>
          <label className="field-label">Number of Publications</label>
          <input className="field-input" type="number" value={form.publications} onChange={e => set('publications', Number(e.target.value))} disabled={readOnly} style={{ background: readOnly ? '#F5F6F8' : undefined }} />
        </div>
      </div>
    </Modal>
  );
}

// ── Researcher card ───────────────────────────────────────────────────────────

function ResearcherCard({ r, onClick }: { r: Researcher; onClick: () => void }) {
  return (
    <div
      className="card"
      style={{ padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.15s', borderRadius: 12 }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(22,50,79,0.10)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)')}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#16324F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: 'Poppins', flexShrink: 0 }}>{r.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1B1F27', fontFamily: 'Poppins', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
          <div style={{ fontSize: 12, color: '#5B6472' }}>{r.title}</div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: '#5B6472', marginBottom: 3 }}>{r.department}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#9CA3AF', marginBottom: 12 }}>
        <MapPin size={11} /> {r.institution}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
        {r.skills.slice(0, 3).map(s => (
          <span key={s} style={{ padding: '3px 8px', background: '#F5F6F8', color: '#5B6472', borderRadius: 6, fontSize: 11, fontWeight: 500, border: '1px solid #E1E4E8' }}>{s}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
        <div style={{ fontSize: 12, color: '#5B6472' }}><span style={{ fontWeight: 700, color: '#1B1F27', fontSize: 14 }}>{r.publications}</span> pubs</div>
        <div style={{ fontSize: 12, color: '#5B6472' }}><span style={{ fontWeight: 700, color: '#1B1F27', fontSize: 14 }}>{r.collaborators}</span> collabs</div>
        <div style={{ fontSize: 12, color: '#5B6472' }}><span style={{ fontWeight: 700, color: '#1B1F27', fontSize: 14 }}>{r.hIndex}</span> h-index</div>
      </div>
    </div>
  );
}

// ── Researcher profile ─────────────────────────────────────────────────────────

function ResearcherProfile({ r, onBack, onEdit }: { r: Researcher; onBack: () => void; onEdit: () => void }) {
  const [tab, setTab] = useState('Overview');
  const tabs = ['Overview', 'Publications', 'Projects', 'Conferences', 'Achievements'];
  const myPubs = publications.filter(p => p.authors.includes(r.id));

  return (
    <div>
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #16324F, #1a3d60)', height: 80 }} />
        <div style={{ padding: '0 28px 22px', marginTop: -28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div style={{ width: 72, height: 72, borderRadius: 14, background: '#C9A24B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{r.avatar}</div>
              <div style={{ paddingBottom: 4 }}>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, margin: '0 0 2px', color: '#1B1F27' }}>{r.name}</h2>
                <div style={{ fontSize: 13.5, color: '#5B6472' }}>{r.title} · {r.department}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: '#9CA3AF', marginTop: 3 }}>
                  <MapPin size={12} /> {r.institution}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
              <button className="btn-secondary" style={{ fontSize: 13 }} onClick={onBack}>← Back</button>
              <button className="btn-primary" style={{ fontSize: 13 }} onClick={onEdit}>Edit Profile</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, borderTop: '1px solid #F3F4F6', paddingTop: 4 }}>
            {tabs.map(t => <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
          </div>
        </div>
      </div>

      {tab === 'Overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div className="card" style={{ padding: 22, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 12px', color: '#1B1F27' }}>Biography</h3>
              <p style={{ fontSize: 13.5, color: '#5B6472', lineHeight: 1.7, margin: '0 0 16px' }}>{r.bio}</p>
              <h4 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, margin: '0 0 8px', color: '#1B1F27' }}>Skills & Expertise</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {r.skills.map(s => <span key={s} style={{ padding: '4px 10px', background: '#EBF4FF', color: '#2B6CB0', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{s}</span>)}
              </div>
              <h4 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, margin: '0 0 8px', color: '#1B1F27' }}>Research Interests</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {r.interests.map(s => <span key={s} style={{ padding: '4px 10px', background: '#e8f5f3', color: '#1F7A6C', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>{s}</span>)}
              </div>
            </div>
          </div>
          <div>
            <div className="card" style={{ padding: 22, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: '0 0 16px', color: '#1B1F27' }}>Contact Information</h3>
              {[
                { icon: Mail, label: 'Email', value: r.email },
                { icon: Phone, label: 'Phone', value: r.phone },
                { icon: MapPin, label: 'Institution', value: r.institution },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#5B6472" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                    <div style={{ fontSize: 13.5, color: '#1B1F27', marginTop: 2 }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Publications' && (
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F3F4F6' }}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, margin: 0 }}>Publications ({myPubs.length})</h3>
          </div>
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Title</th><th>Venue</th><th>Year</th><th>Status</th><th>Citations</th></tr></thead>
            <tbody>
              {myPubs.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500, maxWidth: 320 }}>{p.title}</td>
                  <td style={{ color: '#5B6472' }}>{p.venue}</td>
                  <td>{p.year}</td>
                  <td><Badge status={p.status} size="sm" /></td>
                  <td style={{ fontWeight: 600 }}>{p.citations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(tab === 'Projects' || tab === 'Conferences' || tab === 'Achievements') && (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, color: '#1B1F27' }}>{tab} data available</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Content for this tab is loaded from the server.</div>
        </div>
      )}
    </div>
  );
}

// ── Institutions view ─────────────────────────────────────────────────────────

function InstitutionsView() {
  const { can } = useRole();
  const canWriteInst = can('add', 'institutions');
  const { institutions, addInstitution, updateInstitution } = useInstitutions();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [countryFilter, setCountryFilter] = useState('All Countries');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; inst?: Institution } | null>(null);

  const countries = ['All Countries', ...Array.from(new Set(institutions.map(i => i.country))).sort()];

  const filtered = institutions.filter(i =>
    (typeFilter === 'All Types' || i.type === typeFilter) &&
    (countryFilter === 'All Countries' || i.country === countryFilter) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input className="field-input" placeholder="Search institutions…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
        </div>
        <select
          className="field-input"
          style={{ height: 36, width: 170, fontSize: 13 }}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option>All Types</option>
          <option>University</option>
          <option>Research Institute</option>
          <option>Funding Body</option>
        </select>
        <select
          className="field-input"
          style={{ height: 36, width: 160, fontSize: 13 }}
          value={countryFilter}
          onChange={e => setCountryFilter(e.target.value)}
        >
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>
        {canWriteInst && (
          <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setModal({ mode: 'add' })}>
            <Plus size={14} /> Add Institution
          </button>
        )}
      </div>

      <div className="card">
        <table className="data-table" style={{ width: '100%' }}>
          <thead>
            <tr><th>Institution Name</th><th>Type</th><th>Country</th><th># Researchers</th><th># Publications</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>No institutions match the current filters.</td></tr>
            ) : filtered.map(inst => (
              <tr key={inst.id}>
                <td>
                  <div style={{ fontWeight: 600, color: '#1B1F27' }}>{inst.name}</div>
                  <div style={{ fontSize: 11.5, color: '#9CA3AF' }}>Est. {inst.established}</div>
                </td>
                <td><Badge status={inst.type} size="sm" /></td>
                <td style={{ color: '#5B6472' }}>{inst.country}</td>
                <td style={{ fontWeight: 600 }}>{inst.researchers.toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{inst.publications.toLocaleString()}</td>
                <td><Badge status={inst.status} size="sm" /></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {canWriteInst && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'edit', inst })}>Edit</button>}
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'view', inst })}>View</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <InstitutionModal
          mode={modal.mode}
          initial={modal.inst}
          onClose={() => setModal(null)}
          onSave={inst => {
            if (modal.mode === 'add') addInstitution(inst);
            else updateInstitution(inst);
          }}
        />
      )}
    </div>
  );
}

// ── Main Researchers screen ────────────────────────────────────────────────────

export default function Researchers() {
  const { can } = useRole();
  const canWrite = can('add', 'researchers');
  const { researchers, addResearcher, updateResearcher } = useResearchers();

  const [view, setView] = useState<View>('directory');
  const [gridMode, setGridMode] = useState(true);
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<{ mode: 'add' | 'edit' | 'view'; r?: Researcher } | null>(null);

  const filtered = researchers.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.department.toLowerCase().includes(search.toLowerCase()) ||
    r.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  if (view === 'profile' && selectedResearcher) {
    return (
      <>
        <ResearcherProfile
          r={selectedResearcher}
          onBack={() => setView('directory')}
          onEdit={() => setModal({ mode: 'edit', r: selectedResearcher })}
        />
        {modal && (
          <ResearcherModal
            mode={modal.mode}
            initial={modal.r}
            onClose={() => setModal(null)}
            onSave={r => { updateResearcher(r); setSelectedResearcher(r); }}
          />
        )}
      </>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 2, background: '#F5F6F8', borderRadius: 8, padding: 3, border: '1px solid #E1E4E8' }}>
          {(['directory', 'institutions'] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 6, border: 'none',
              background: view === v ? '#16324F' : 'transparent',
              color: view === v ? '#fff' : '#5B6472',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {v === 'directory' ? 'Researcher Directory' : 'Institutions'}
            </button>
          ))}
        </div>
        {canWrite && view === 'directory' && (
          <button className="btn-primary" onClick={() => setModal({ mode: 'add' })}>
            <Plus size={14} /> Add Researcher
          </button>
        )}
      </div>

      {view === 'directory' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input className="field-input" placeholder="Search by name, skill, department…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32, height: 36, fontSize: 13 }} />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: '#F5F6F8', border: '1px solid #E1E4E8', borderRadius: 8, padding: 3 }}>
              <button onClick={() => setGridMode(true)} style={{ padding: '5px 8px', borderRadius: 5, border: 'none', background: gridMode ? '#16324F' : 'transparent', color: gridMode ? '#fff' : '#9CA3AF', cursor: 'pointer' }}>
                <Grid size={14} />
              </button>
              <button onClick={() => setGridMode(false)} style={{ padding: '5px 8px', borderRadius: 5, border: 'none', background: !gridMode ? '#16324F' : 'transparent', color: !gridMode ? '#fff' : '#9CA3AF', cursor: 'pointer' }}>
                <List size={14} />
              </button>
            </div>
          </div>

          {gridMode ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {filtered.map(r => (
                <ResearcherCard key={r.id} r={r} onClick={() => { setSelectedResearcher(r); setView('profile'); }} />
              ))}
            </div>
          ) : (
            <div className="card">
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr><th>Name</th><th>Department</th><th>Institution</th><th>Skills</th><th>Publications</th><th>h-Index</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedResearcher(r); setView('profile'); }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#16324F', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.name}</div>
                            <div style={{ fontSize: 12, color: '#5B6472' }}>{r.title}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: '#5B6472' }}>{r.department}</td>
                      <td style={{ color: '#5B6472' }}>{r.institution}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {r.skills.slice(0, 2).map(s => <span key={s} style={{ padding: '2px 7px', background: '#F5F6F8', borderRadius: 4, fontSize: 11, color: '#5B6472' }}>{s}</span>)}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.publications}</td>
                      <td style={{ fontWeight: 700, color: '#1F7A6C' }}>{r.hIndex}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'view', r })}>View</button>
                          {canWrite && <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setModal({ mode: 'edit', r })}>Edit</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {view === 'institutions' && <InstitutionsView />}

      {modal && (
        <ResearcherModal
          mode={modal.mode}
          initial={modal.r}
          onClose={() => setModal(null)}
          onSave={r => {
            if (modal.mode === 'add') addResearcher(r);
            else updateResearcher(r);
          }}
        />
      )}
    </div>
  );
}
